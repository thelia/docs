The cache block uses the `thelia.cache` service.    

You can add this block on static parts (menu, footer, …) of your site to improve the generation time of your web pages

:::info

In dev mode, the cache is disabled.
:::

## Parameters

| Parameter name | Description                                                     |
|:---------------|:----------------------------------------------------------------|
| `key`          | (mandatory) a unique key to identify the cache                  |
| `ttl`          | (mandatory) a time to live in seconds	 	 	 	                    |
| `lang`         | Specific cache by lang, (default: current lang id) 	 	 	        |
| `currency`     | Specific cache by currency, (default: current currency id)	 	 	 |

You can also add as many arguments as you need. These arguments will be used to generate a unique key.


## Examples

### Simple
```
{cache key="my-cache" ttl=600}
    ... HTML or Smarty code ...
{/cache}
```

### By customer
```
{cache key="my-cache" ttl=600 customer_id=$CUSTOMER_ID}
    ... HTML or Smarty code specific by customer ...
{/cache}
```

### By admin
```
{cache key="my-cache" ttl=600 admin_id_=$ADMIN_ID}
    ... HTML or Smarty code specific by admin ...
{/cache}
```

### Disable currency specific cache
```
{cache key="my-cache" ttl=600 currency"no"}
    ... HTML or Smarty code same for every currency ...
{/cache}
```

### Conditional cache
You can disable the caching of a block without delete it. For this, you must specify a ttl to 0.
```
{$ttl = 600}
{if $myCondition}
    {$ttl = 0}
{/if}

{cache key="my-cache" ttl=$ttl}
    ... HTML or Smarty code ...
{/cache}

```