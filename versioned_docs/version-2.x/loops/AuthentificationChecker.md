---
title: Authentification checker
---

The Auth loop perform authorisation checks against the current user. This loop returns nothing if the authorization fails, or the loop contents if it succeeds.  
You may check in the front office if an administrator is logged in, and perform specific functions in your front-office template (such as direct editing, for example).  
`{loop type="auth" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#auth-arguments}

| Argument      | Description                                                                                                                                                        | Default         | Example                                |
| ------------- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------| :-------------: | :--------------------------------------|
| access        | A comma separated list of access, . If empty or missing, the authorization is checked against the roles only <br/> [Expected values](#auth-access-possible-values) |                 |                                        |
| module        | A comma separated list of modules                                                                                                                                  |                 |                                        |
| resource      | A comma separated list of resources                                                                                                                                |                 |                                        |
| role *        | A comma separated list of user roles                                                                                                                               |                 | role="ADMIN" or can be role="CUSTOMER" |

Plus the [global arguments](./global_arguments)

## Examples

I want to check if current administrator is allowed tu use the back-office search function.

```smarty
{loop type="auth" name="can_create" role="ADMIN" resource="admin.administrator" access="CREATE"}
    <a title="{intl l='Create a new administrator'}" href="#administrator_create_dialog" data-toggle="modal">
        <span class="glyphicon glyphicon-plus"></span>
    </a>
{/loop}
```

The role is ADMIN, which mean that the current user should have the "ADMIN" role. The permission is "admin.administrator", which is the identifier of the administrator permission. According to the access attribute, the current user should have the CREATE permission.
I want to check if the customer is logged in, or not.

```smarty
{loop type="auth" name="customer_info_block" role="CUSTOMER"}
    <p>Your are logged in. <a href="{viewurl view='index' action='logoutCustomer'}">Logout</a></p>
{/loop}

{elseloop rel="customer_info_block"}
    You are not logged in. <a href="{viewurl view='login'}">Login now</a> or <a href="{viewurl view='create_account'}">create your account</a>
{/elseloop}
```

## Access possible values {#auth-access-possible-values}

[Arguments](#auth-arguments)

| value  |
|--------|
| CREATE |
| DELETE |
| UPDATE |
| VIEW   |
