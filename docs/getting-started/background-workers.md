---
title: Running the workers
sidebar_position: 4.6
---

# Running the workers

A shop that names a queue in `MESSENGER_TRANSPORT_DSN` needs at least one worker: a long
`messenger:consume` process that handles the queued jobs. Without a queue, nothing waits for
a worker and this page only matters for the recurring tasks. The model is explained in
[Background jobs](../architecture/background-jobs.md), the settings in the
[background jobs reference](../reference/background-jobs.md).

## The workers to run

```bash
php Thelia messenger:consume async --time-limit=3600 --memory-limit=256M
php Thelia messenger:consume async_heavy --time-limit=3600 --memory-limit=256M
php Thelia messenger:consume scheduler_thelia --time-limit=3600 --memory-limit=256M
```

Mails and the messages of modules go to `async`, back-office exports and imports to
`async_heavy`, so a large import does not hold up the mails. One worker per transport keeps
them fully apart: a mail never waits behind an import, and the scheduled tasks never wait
behind either. A smaller setup can run a single worker on
`messenger:consume async async_heavy`, which takes the mails first, then the heavy jobs, plus
the scheduler worker.

A Redis or AMQP queue needs its Messenger bridge, which the core does not ship:
`composer require symfony/redis-messenger` (with the `redis` PHP extension) or
`composer require symfony/amqp-messenger` (with the `amqp` extension). The queue in the shop
database (`doctrine://default`) needs nothing more. On AMQP, also set
`MESSENGER_HEAVY_TRANSPORT_DSN` to a queue of its own: otherwise `async_heavy` shares the queue
of `async`, its exports and imports are read by the `async` worker and tried again three times
like the mails.

A worker on `async` or `async_heavy` is only useful once `MESSENGER_TRANSPORT_DSN` names a queue. Started on a
shop without a queue, it sits idle and does nothing, because every job already ran in the
request that dispatched it: harmless, but useless. `php Thelia messenger:stats` and the
Background jobs screen of the back office ("Queue: None") tell whether a queue is configured.
The scheduler worker is useful either way, if the shop runs its recurring tasks from the
schedule rather than from a crontab.

`--time-limit` and `--memory-limit` make the worker exit cleanly after an hour or once it uses
256 MB, and the process manager starts a fresh one. A PHP process that runs for days grows in
memory, and recycling the worker keeps it in check. A connection that MySQL closed after its
`wait_timeout` is reopened before the next message. The connection of the queue in the shop
database is closed after each message, before the worker acknowledges it, so a long export or
import never leaves the acknowledgement on a connection MySQL has dropped.

On `SIGTERM` or `SIGINT`, a worker finishes the message in hand, then stops. A worker killed
hard (`SIGKILL`, out of memory) leaves its Doctrine message marked as delivered; the transport
hands it to another worker after `redeliver_timeout`, 3600 seconds by default. That is one
reason handlers must be [idempotent](../reference/background-jobs.md#idempotence-and-replay).

## Supervisor

```ini
; /etc/supervisor/conf.d/thelia-worker.conf
[program:thelia-async]
command=php /var/www/shop/Thelia messenger:consume async --time-limit=3600 --memory-limit=256M
directory=/var/www/shop
user=www-data
numprocs=1
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
startsecs=0
stopsignal=TERM
stopwaitsecs=300
redirect_stderr=true
stdout_logfile=/var/www/shop/var/log/worker-async.log

[program:thelia-async-heavy]
command=php /var/www/shop/Thelia messenger:consume async_heavy --time-limit=3600 --memory-limit=256M
directory=/var/www/shop
user=www-data
numprocs=1
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
startsecs=0
stopsignal=TERM
stopwaitsecs=300
redirect_stderr=true
stdout_logfile=/var/www/shop/var/log/worker-async-heavy.log

[program:thelia-scheduler]
command=php /var/www/shop/Thelia messenger:consume scheduler_thelia --time-limit=3600 --memory-limit=256M
directory=/var/www/shop
user=www-data
numprocs=1
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
startsecs=0
stopsignal=TERM
stopwaitsecs=300
redirect_stderr=true
stdout_logfile=/var/www/shop/var/log/worker-scheduler.log
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl status
```

`stopwaitsecs` is how long supervisor waits for the current message before killing the
process. Set it above the duration of your longest job: on `async_heavy`, a large export or
import.

## systemd

```ini
# /etc/systemd/system/thelia-worker@.service
[Unit]
Description=Thelia worker (%i)
After=network.target mariadb.service

[Service]
User=www-data
WorkingDirectory=/var/www/shop
ExecStart=/usr/bin/php /var/www/shop/Thelia messenger:consume %i --time-limit=3600 --memory-limit=256M
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now thelia-worker@async thelia-worker@async_heavy thelia-worker@scheduler_thelia
```

`Restart=always` starts a new worker each time one exits on its time or memory limit.

## Shared hosting: the crontab fallback

A hosting that does not allow long processes can still consume the queue from cron:

```bash
* * * * * cd /var/www/shop && php Thelia messenger:consume async async_heavy scheduler_thelia --time-limit=55
```

Each run consumes for 55 seconds, then exits before the next one starts. Jobs wait up to a
minute before they run. Two runs that overlap are safe: each message is handed to one worker
only.

## DDEV

In development, the synchronous default is usually all you need: mails reach Mailpit during
the request, exports are served and imports run at once. To try the queue, set
`MESSENGER_TRANSPORT_DSN=doctrine://default` in `.env.local` and let DDEV run the worker:

```yaml
# .ddev/config.yaml
web_extra_daemons:
  - name: "messenger"
    command: "php Thelia messenger:consume async async_heavy --time-limit=3600 --memory-limit=256M"
    directory: /var/www/html
```

Run `ddev restart` to start it. Set `MESSENGER_TRANSPORT_DSN` in `.env.local`, not under
`web_environment` in `.ddev/config.yaml`: a value set there wins over the `.env` files, for
every command run in the container. The worker runs the code it loaded at start: after changing a
handler, run `ddev exec php Thelia messenger:stop-workers` so it restarts on the new code.

## Monitoring

`messenger:stats` prints the number of messages waiting in each transport:

```bash
php Thelia messenger:stats
php Thelia messenger:stats async async_heavy failed
```

Wire it into the monitoring of the hosting and alert on two signals:

- `async` above a threshold for several minutes in a row (for instance more than 100 messages
  for 10 minutes): the workers are stopped or cannot keep up. `async_heavy` holds few, long
  jobs; alert when a job waits there longer than your longest export or import should take,
- `failed` above zero: a job failed every attempt and needs someone to read its reason
  (`php Thelia messenger:failed:show`) and replay or remove it.

The back office shows the same counts under Configuration > System > Background jobs, where
the waiting count adds both queues, or counts them once when `async` and `async_heavy` share the
same DSN. The same screen lists the recurring tasks whose last run failed: a failed task of
`scheduler_thelia` never reaches `failed`, so `messenger:stats` does not count it.

## Deploying

A worker runs the code it loaded when it started. Left running through a deployment, it
consumes the messages of the new version with the old code. Stop the workers before touching
the cache, and start them once the new release is ready:

1. Stop the workers through the process manager, which sends `SIGTERM` and waits for the
   current message: `supervisorctl stop thelia-async:* thelia-async-heavy:* thelia-scheduler:*`, or
   `systemctl stop thelia-worker@async thelia-worker@async_heavy thelia-worker@scheduler_thelia`.
2. Deploy the code and run the update script (see [Updating](../upgrading/update.md)).
3. Rebuild the cache: remove `var/cache/prod` and `var/propel/prod`, then run
   `php Thelia cache:warmup --env=prod`. Never run `cache:clear` while a worker runs.
4. Start the workers: `supervisorctl start thelia-async:* thelia-async-heavy:* thelia-scheduler:*`, or
   `systemctl start thelia-worker@async thelia-worker@async_heavy thelia-worker@scheduler_thelia`.

When the release is switched atomically (a symlink pointing to the new release directory),
the workers can instead be restarted after the switch with
`php Thelia messenger:stop-workers`: each worker stops after its current message, and the
process manager starts new ones on the new release. The command leaves its signal in the
application cache, and a worker only sees it in the cache it reads: when each release has its
own `var/` directory, run the command from the release the workers were started from.

Messages queued during the deployment wait in the queue and are handled once the workers are
back. The file of a queued import is kept in `var/data-transfer/import/`, outside the cache,
so rebuilding the cache does not lose it.

The web servers and the workers must share two directories: `var/data-transfer/import/`, where
an uploaded import waits for its worker, and `var/cache/export/`, where a worker writes the
export file the back office serves. When each release has its own `var/` directory, or the
workers run on another machine, point both at the same storage, and never empty them in a
deployment while jobs wait.

## Personal data in the queue

Queued mails carry the recipient address and the content of the order, and a failed job keeps
everything it was dispatched with.

- Failed jobs are deleted by `thelia:messenger:purge-failed` after 30 days, every day at 04:00
  when the schedule runs. Keep the same task in the crontab of a shop that does not consume
  the schedule. Record this retention in the GDPR register; see
  [Personal data](../security/personal-data.md).
- A failed job keeps everything it was dispatched with, but its reason is cleaned before it is
  shown or logged: the log of the workers names the exception of a failed job by its class,
  code and place (`Thelia\Messenger\Log\FailedJobLogProcessor`), and the credentials of a
  mail server are hidden in the reasons the back office shows.
- A Redis or AMQP broker must not be reachable from the internet. Bind it to the private
  network of the hosting and protect it with a password.
- Put the DSN and its credentials in `.env.local` or in the secrets of the hosting, never in
  a committed file.
- Do not share one Redis between environments unless each one has its own stream: a staging
  worker would otherwise send the mails of production. Give each environment its own stream
  name in the DSN (`redis://host:6379/messages_staging`, whose heavy jobs then go to the stream
  `messages_staging_heavy`) or its own Redis database.

## Sizing

- One worker per transport is enough for most shops. Add `async` or `async_heavy` workers
  (`numprocs` in supervisor) when `messenger:stats` shows that queue growing.
- Every worker is a PHP process. Count them against the PHP processes the server can run and
  the connections MySQL accepts: workers that take every slot leave the web requests waiting.
- Keep `--memory-limit` below the `memory_limit` of PHP CLI, so the worker exits on its own
  limit rather than being killed in the middle of a message.
