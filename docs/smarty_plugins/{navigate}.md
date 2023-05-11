The `{navigate}` function is a convenient way to generate URLs pointing to common locations.     
This function has only one parameter `to` which may take one of the following values:

| Name         | Description                                                                                                                                   |
|:-------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| current      | The absolute URL of the current page                                                                                                          |
| previous     | The absolute URL of the previous page                                                                                                         |
| index        | The absolute URL of the shop home page                                                                                                        |
| catalog_last | The absolute URL of the last viewed catalog page, product or category. The index page URL is returned if no catalog page has been viewed yet. |

Example:
- return to the shop home page : `<a href="{navigate to='index'}">{intl l="Back to home"}</a>`
- go back to the previous page : `<a href="{navigate to='previous'}">{intl l="Back to home"}</a>`
- reload the current page : `<a href="{navigate to='current'}">{intl l="Reload !"}</a>`


You can’t add custom parameters to the URL generated by {navigate}. To do so, use it along with the [{url}](./{url}) function :    
`{url path={navigate to="current"} limit="4"}`    
This way the limit=4 parameter is added to the URL : `http://www.myshop.com/current-page-url.html?limit=4`