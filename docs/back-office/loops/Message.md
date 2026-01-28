---
title: Message
---

Message loop lists all defined messages.
`{loop type="message" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument | Description                              | Default | Example                     |
|----------|:-----------------------------------------|:-------:|:----------------------------|
| exclude  | A list of message IDs to exclude         |         | exclude="1,2,3"             |
| hidden   | A boolean to show or hide hidden message |         | hidden="1"                  |
| id       | The message ID                           |         | id="2"                      |
| secured  | Boolean to show or hide secured messages |         | secured="1"                 |
| variable | variable                                 |         | variable="rewriting_enable" |

Plus the [global arguments](./global_arguments)

## Outputs {#area-outputs}

| Variable        | Value                              |
|:----------------|:-----------------------------------|
| $ID             | The message ID                     |
| $NAME           | The message name                   |
| $IS_TRANSLATED  | Check if the message is translated |
| $LOCALE         | The locale used for this research  |
| $TITLE          | The message title                  |
| $SUBJECT        | The message subject                |
| $TEXT_MESSAGE   | The text message                   |
| $HTML_MESSAGE   | The html message                   |
| $SECURED        | Check if the message is secured    |

Plus the [global outputs](./global_outputs)
