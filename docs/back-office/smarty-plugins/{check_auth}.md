The function `check_auth` can be used to know if the user is granted to view something.

```
{check_auth role="CUSTOMER" login_tpl="login"}

{check_auth resource="admin.address" access="VIEW" login_tpl="login"}
``` 


## role
A user can only have one of these two roles:
 - ADMIN : an administrator of the site
 - CUSTOMER : a registed and logged in customer

## login_tpl
This argument is the name of the view name (the login page is “login”). If the user is not granted and this argument is defined, it redirects to this view.

## resource
The resource argument may be useful in the back office. Available resources:
- admin.address
- admin.configuration.administrator
- admin.configuration.advanced
- admin.configuration.area
- admin.configuration.attribute
- admin.category
- admin.configuration
- admin.content
- admin.configuration.country
- admin.coupon
- admin.configuration.currency
- admin.customer
- admin.configuration.feature
- admin.folder
- admin.home
- admin.configuration.language
- admin.configuration.mailing-system
- admin.configuration.message
- admin.module
- admin.order
- admin.product
- admin.configuration.profile
- admin.configuration.shipping-zone
- admin.configuration.tax
- admin.configuration.template
- admin.configuration.system-logs
- admin.configuration.admin-logs
- admin.configuration.store
- admin.configuration.translations
- admin.configuration.update
- admin.export
- admin.export.customer.newsletter
- admin.tools

## module
Name of the module which the user must have access to. Example:
```
    {check_auth role="ADMIN" module="Carousel" access="UPDATE" login_tpl="login"}
```

## access

There is 4 types of access to a resource:

- CREATE : create a new entry 
- VIEW : view the resource 
- UPDATE : update the resource 
- DELETE : delete the resource

Those accesses can be configured from the back office, tab “Configuration”, on “Administration Profile”.
