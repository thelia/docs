This Smarty function builds an absolute URL from a route path.


## path
The value of the path parameter is the route path you want to get as an URL.

For example, to get the URL of the /account/password route :    
`{url path="/account/password"}` => `http://www.yourshop.com/account/password`

### Dynamic parameters
In some cases you need to inject dynamic parameter in your path. The parameter uses the same behaviour as the `{intl}` function. Every `%varname` found in the string will be replaced by the value of the `varname` parameter.    
`{url path="/product/%id" id=$product_id}` => `http://www.yourshop.com/product/3`

### Additional parameters to the generated URL
You may add as many parameters as you want to the generated URL    
`{url path="/contact" myvar="1" myothervar="2"}` => `http://www.yourshop.com/contact?myvar=1&myothervar=2`

### noamp
Setting noamp=1 will escape all & as &amp; that may be present in the generated URL.


## file
The value of the file parameter is the absolute path (from `/public`) of a real file, that will be served by your web server, and not processed by Thelia.

For example, if you put a guide.pdf file in the `/public` directory, the URL of this file is :
`{url file="/guide.pdf"}` => `http://www.yourshop.com/guide.pdf`