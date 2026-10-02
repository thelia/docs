In most cases, Thelia automatically sets the previous URLs, so that `{navigate to='previous'}` will generate the URL to the previous page visited by your customer.
But in some cases, you may want to define yourself the URL of the previous page, so that your customers will go back to this specific page instead of the page they have visited before.

The `{set_previous_url}` function allows setting the URLs of the page thant will become the previous page :
`{set_previous_url path='path/to/some/page'}`    
To get possible `{set_previous_url}` parameters, please see the [`{url}`](./%7Burl%7D) function.

You may also want to prevent a page to become the “previous page”. To do so, use the `ignore_current` parameter, and put this call somewhere in the page :
`{set_previous_url ignore_current=1}`

A typical example is the `login` and/or `register` page, where the user should go back where it was before entering its credentials (cart or order page), and not te register/login page itself.