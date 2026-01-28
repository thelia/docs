---
title: Loops
sidebar_position: 1
---

# Loops

:::info Thelia 3 - Back-Office Only
In **Thelia 3**, Loops are used exclusively in the **back-office** (Smarty templates). For the **front-office**, use the [DataAccessService](/docs/front-office/data-access) to fetch data via API calls in Twig templates.
:::

Loops are Smarty plugins that query the database and iterate over results. They provide a convenient way to fetch and display data in Smarty templates.

### Classic loop

Here is a piece of html code which intends to list 4 random products from your shop.

```html
<div>
    <div class="product-block">
        PRODUCT 0 (ref : 0535233)<br />
        The ideal product to have fun.<br />
        <strong>Afford it for 70 €</strong>
    </div>
    <div class="product-block">
        PRODUCT 1 (ref : 1245152)<br />
        A very beautiful product to make you happy.<br />
        <strong>Afford it for only 10 € (instead of 100) !</strong>
    </div>
    <div class="product-block">
        PRODUCT 2 (ref : 9437252)<br />
        A perfect product to procrastinate.<br />
        <strong>Afford it for 20 €</strong>
    </div>
    <div class="product-block">
        PRODUCT 4 (ref : 3566236)<br />
        The product which will change your life.<br />
        <strong>Afford it for only 1 000 € (instead of 1 000 000) !</strong>
    </div>
</div>
```
  
How to make this piece of code dynamic ? Gathering the products you set up in your Thelia back-office ?

Just use a Thelia product loop :

```smarty
<div>
    {loop type="product" name="my_product_loop" limit="4" order="random"}
        <div class="product-block">
            {$TITLE} (ref : {$REF})<br />
            {$DESCRIPTION}<br />
            <strong>
                {if $IS_PROMO == 1}
                    Afford it for only {$PROMO_PRICE} € (instead of {$PRICE}) !
                {else}
                    Afford it for {$PRICE} €
                {/if}
            </strong>
        </div>
    {/loop}
</div>
```
  
And what if you want only the products you tagged as new ? And which are from category 3 and 5 ? And whose price is at least 100 € ?

No problem ! Here you are :

```smarty
<div>
    {loop type="product" name="my_product_loop" limit="4" order="random" new="true" category="3,5" min_price="100"}
        <div class="product-block">
            [...]
        </div>
    {/loop}
</div>
```

You can of course use a loop into another loop and pass a loop output to another loop parameter

```smarty
<div>
    {loop type="category" name="my_category_loop"}
        <h2>{$TITLE}</h2>
        {loop type="product" name="my_product_loop" category="{$ID}"}
            <div class="product-block">
                [...]
            </div>
        {/loop}
    {/loop}
</div>
```

Thelia  provides a lot of loop types. You can see all the loops and their parameters / outputs in the <strong>Loops</strong> sidebar menu.

### Conditional loop

Conditional loops are used to define a different behaviour depending on whether a classic loop displays something or not.

A conditional loop is therefore linked to a classic loop using the ```rel``` attribute which must match a classic loop ```name``` attribute.

For example, you want to display all the associated content of a product in an unorder list (ul). If the product has no associated contents you won't display empty ```<ul></ul>```. And you want a message to inform there is no available content. You can use a conditional loop to do this.

```smarty
{ifloop rel="my_associated_content_loop"}
    Associated contents for this product :
    <ul>
        {loop type="associated_content" name="my_associated_content_loop" product="12"}
            <li>
                <a href="{$URL}">{$TITLE}</a>
            </li>
        {/loop}
    </ul>
{/ifloop}
{elseloop rel="my_associated_content_loop"}
    No associated content for this product
{/elseloop}
```

&nbsp;

### Page loop

Page loops can be use on any classic loop which has ```page``` parameter. Page loops list all the pages the classic loop needs to display all it's returns.

A page loop is therefore linked to a classic loop using the ```rel``` attribute which must match a classic loop ```name``` attribute.

By default, 10 pages are displayed. You can change this value using ```limit``` parameter.

List of output parameters :

<div class="table-responsive">
    <table class="table table-striped table-bordered">
        <thead>
        <tr>
            <th>Variable</th>
            <th>Description</th>
        </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    $PAGE
                </td>
                <td>
                    Current page number. This value is equal to the ```page``` loop parameter.
                </td>
            </tr>
            <tr>
                <td>
                    $END
                </td>
                <td>
                    The last displayed page number
                </td>
            </tr>
            <tr>
                <td>
                    $CURRENT
                </td>
                <td>
                    on each loop, this value is incremented. So it's started with the $PAGE value and end with the $END value
                </td>
            </tr>
            <tr>
                <td>
                    $LAST
                </td>
                <td>
                    Max page number. If a loop generates 761 pages, the value of $LAST is 761
                </td>
            </tr>
            <tr>
                <td>
                    $PREV
                </td>
                <td>
                    previous page number. This value is always $PAGE-1 if $PAGE is greater than 1. The value is 1 therefore
                </td>
            </tr>
            <tr>
                <td>
                    $NEXT
                </td>
                <td>
                    next page number. This value is always $PAGE+1 if $PAGE is less than $LAST. The value is $LAST therefore
                </td>
            </tr>
        </tbody>
    </table>
</div>

```smarty
<div class="text-center">
    <ul class="pagination pagination-centered">
    {pageloop rel="customer_list" limit="20"}
        {if $PAGE == $CURRENT && $PAGE > 2}
            <li><a href="{url path="/admin/customers" page=$PREV}">&lsaquo;</a></li>
        {/if}

        {if $PAGE != $CURRENT}
            <li><a href="{url path="/admin/customers" page="{$PAGE}"}">{$PAGE}</a></li>

        {else}
            <li class="active"><a href="#">{$PAGE}</a></li>
        {/if}

        {if $PAGE == $END && $PAGE < $LAST}
            <li><a href="{url path="/admin/customers" page=$NEXT}">&rsaquo;</a></li>
        {/if}
    {/pageloop}
    </ul>
</div>
```

## Implement your loops

Your loop can be anywhere (Thanks to namespace) in your module, but it's better to create a Loop directory and put all your loops in this directory.

The only thing to do is create a new class that to extend the `Thelia\Core\Template\Element\BaseLoop` class and implement one of these interfaces :  

- `Thelia\Core\Template\Element\ArraySearchLoopInterface` for an [Array loop](#array-loop)  
- `Thelia\Core\Template\Element\PropelSearchLoopInterface` for a [Propel loop](#propel-loop).  

NB : Instead of `BaseLoop` you can also extend `BaseI18nLoop`. This will provide tools to manage i18n in your loop.

The type of your loop will be the class name in snake_case for example the `type` of `MyLoop.php` will be `my_loop`  
So to call it in template `{loop type="my_loop" name="a_loop_name"}{/loop}`

## Array loop

If data in your loop doesn't come directly from a model, use an array loop.  
3 functions must be implemented :

- `getArgDefinitions` to describe what [arguments](#argument-types) are available for your loop
- `buildArray` who gather the data for the defined parameters
- `parseResults` to assign data to smarty variables for each loop iteration

```php
 <?php
 namespace MyModule\Loop;

 use Thelia\Core\Template\Element\BaseLoop;
 use Thelia\Core\Template\Element\LoopResult;
 use Thelia\Core\Template\Element\LoopResultRow;
 use Thelia\Core\Template\Element\ArraySearchLoopInterface;
 use Thelia\Core\Template\Loop\Argument\ArgumentCollection;
 use Thelia\Core\Template\Loop\Argument\Argument;

 class MyLoop extends BaseLoop implements ArraySearchLoopInterface {

    public $countable = true;
    public $timestampable = false;
    public $versionable = false;

     public function getArgDefinitions()
     {
         // Always return an ArgumentCollection
         return new ArgumentCollection(
             Argument::createIntListTypeArgument('start', 0),
             Argument::createIntListTypeArgument('stop', null, true)
         );
     }

     public function buildArray()
     {
         $items = [];

         // These magics methods will get the loop arguments "start" and "stop"
         $start = $this->getStart();
         $stop = $this->getStop();

         // Get the data from where you want
         for ( $i = $start; $i <= $stop; $i++) {
            $items[] = [
                'number' => $i,
                'numberNext' => $i + 1
            ];
         }

         return $items;
     }

     public function parseResults(LoopResult $loopResult)
     {
         // "getResultDataCollection" return an iterator that contain the items given by "buildArray"
         foreach ($loopResult->getResultDataCollection() as $item) {
             // Create a new result
             $loopResultRow = new LoopResultRow();

             // Assign variable that will be accessible in smarty by $CURRENT_NUMBER for example
             $loopResultRow->set("CURRENT_NUMBER", $item['number']);
             $loopResultRow->set("NEXT_NUMBER", $item['numberNext']);

             // Add the result to loop result list
             $loopResult->addRow($loopResultRow);
         }

         return $loopResult;
     }
 }
```

## Propel loop

If data in your loop comes directly from a model, use a Propel loop.  
3 functions must be implemented :

- `getArgDefinitions` to describe what [arguments](#argument-types) are available for your loop
- `buildModelCriteria` who build a Propel query to execute
- `parseResults` to assign data to smarty variables for each loop iteration

```php
<?php
namespace Thelia\Core\Template\Loop;

use Propel\Runtime\ActiveQuery\Criteria;
use Thelia\Core\Template\Element\BaseLoop;
use Thelia\Core\Template\Element\LoopResult;
use Thelia\Core\Template\Element\LoopResultRow;
use Thelia\Core\Template\Element\PropelSearchLoopInterface;
use Thelia\Core\Template\Loop\Argument\Argument;
use Thelia\Core\Template\Loop\Argument\ArgumentCollection;
use Thelia\Model\Admin as AdminModel;
use Thelia\Model\AdminQuery;

class Admin extends BaseLoop implements PropelSearchLoopInterface
{
    protected function getArgDefinitions()
    {
         // Always return an ArgumentCollection
        return new ArgumentCollection(
            Argument::createIntListTypeArgument('id'),
            Argument::createIntListTypeArgument('profile')
        );
    }

    public function buildModelCriteria()
    {
        $search = AdminQuery::create();

         // This magic method will get the loop argument "id"
        $id = $this->getId();
        if (null !== $id) {
            $search->filterById($id, Criteria::IN);
        }

        $profile = $this->getProfile();
        if (null !== $profile) {
            $search->filterByProfileId($profile, Criteria::IN);
        }

        $search->orderByFirstname(Criteria::ASC);

        // Don't execute the query, only return it
        return $search;
    }

    public function parseResults(LoopResult $loopResult)
    {
        /** @var AdminModel $admin */
        foreach ($loopResult->getResultDataCollection() as $admin) {
             // Create a new result
            $loopResultRow = new LoopResultRow($admin);
            
             // Assign variable that will be accessible in smarty by $PROFILE for example
            $loopResultRow->set('ID', $admin->getId())
                ->set('PROFILE', $admin->getProfileId())
                ->set('FIRSTNAME', $admin->getFirstname())
                ->set('LASTNAME', $admin->getLastname())
                ->set('LOGIN', $admin->getLogin())
                ->set('LOCALE', $admin->getLocale())
                ->set('EMAIL', $admin->getEmail())
            ;
            $this->addOutputFields($loopResultRow, $admin);

             // Add the result to loop result list
            $loopResult->addRow($loopResultRow);
        }

        return $loopResult;
    }
}
```

## Argument types

In `Argument` class you have multiple static function that will help you to specify which argument is expected

| function                               | argument accepted                                    |
|:---------------------------------------|:-----------------------------------------------------|
| createAnyTypeArgument()              | Anything                                             |
| createIntTypeArgument()              | Only an integer                                      |
| createFloatTypeArgument()            | Only a float                                         |
| createBooleanTypeArgument()          | Only a boolean                                       |
| createBooleanOrBothTypeArgument()    | A boolean or "*" for both                            |
| createIntListTypeArgument()          | A list of integers separated by a comma              |
| createAnyListTypeArgument()          | A list of anythings separated by a comma             |
| createAlphaNumStringTypeArgument()   | An alpha numeric string                              |
| createAlphaNumStringListTypeArgument() | A list of alpha numeric strings separated by a comma |

## Options

Baseloop class declares 3 public properties you might overload in your new loop.

```php
public $countable = true;
public $timestampable = false;
```

With these properties set to true, the loop will automatically render - or not - the following outputs :

```php
if($countable === true)
```

- `LOOP_COUNT` The current iteration number (start from 1)
- `LOOP_TOTAL` Total of elements in current loop

```php
if($timestampable === true) //available if your table is timestampable
```

- `CREATE_DATE`  Date of creation
- `UPDATE_DATE`  Date of last update
