---
title: Admin
---

Admin loop displays admins information.  
`{loop type="admin" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument | Description                        | Default | Example                      |
| -------- |:---------------------------------- | :-----: | :--------------------------- |
| id       | A single or a list of admin ids.   |         | id="2", id="1,4,7"           |
| profile  | A single or a list of profile ids. |         | profile="2", profile="1,4,7" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable        | Value                 |
| :-------------  | :-------------------- |
| $EMAIL          | the admin email       |
| $FIRSTNAME      | the admin firstname   |
| $ID             | the admin id          |
| $LASTNAME       | the admin lastname    |
| $LOCALE         | the admin locale      |
| $LOGIN          | the admin login       |
| $PROFILE        | the admin profile id  |

Plus the [global outputs](./global_outputs)
