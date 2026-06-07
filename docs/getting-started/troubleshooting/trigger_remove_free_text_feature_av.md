---
title: Trigger Creation Fails
sidebar_position: 1
---

When installing Thelia on a shared hosting environment, the creation of the trigger `remove_free_text_feature_av` can fail.

### Error Details

The following error message may appear:

```sql
Error: #1142 - The 'TRIGGER' command is denied to user 'sun_temp_1'@'od-8308ad.infomaniak.ch' on table 'feature_product'
```
### Cause

The database user does not have enough permissions. Shared hosting environments often restrict advanced features such as triggers, and the same limitation can occur with other hosting providers.

### Workaround

If trigger creation is not allowed:

1. Contact your hosting provider to verify if trigger permissions can be granted for your database user.
2. Alternatively, consider switching to a VPS or dedicated server where you have full control over database permissions
3. A workaround is to manually run the following SQL query periodically (e.g., via a cron job) to clean up the `feature_av` table:

```sql
DELETE FROM `feature_av`
WHERE `id` IN (
    SELECT `feature_av_id`
    FROM `feature_product`
    WHERE `is_free_text` = 1
      AND `feature_av_id` NOT IN (
          SELECT `feature_av_id`
          FROM `feature_product`
      )
);
```

### Impact

This trigger cleans up the associated `feature_av` entries when a `feature_product` is deleted. If it cannot be created, Thelia still works normally.


