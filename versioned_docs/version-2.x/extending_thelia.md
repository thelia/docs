---
title: Extending Thelia
sidebar_position: 3
toc_max_heading_level: 6
---

# Create a module

:::caution

We advise to create only one module for all your own logic, don't create one module by feature or something else.    
The only reason to create a separate module is if you want to share it with the community 😉

:::

To extend Thelia you need to create a module. Usually, for the main module, we call it with the same name as the project.

## Structure

A command can help you to create the base files :

```bash
php Thelia module:generate MyProject
```

This will generate this structure in the directory `local\modules`
```
\MyProject
  MyProject.php <- mandatory
  composer.json
  \Config
    config.xml   <- mandatory
    module.xml   <- mandatory
    routing.xml
    schema.xml
  ...
```

- `MyProject.php` is the base file of your module it will help you to set up some behaviour  
- `module.xml` contains information about module like version of the module, compatibility and dependencies with other modules, author, ...    
- `config.xml` to declare your services, event listener, loops, forms, commands or hooks. But thanks to autowiring most of the time you won't need to do this.
- `routing.xml` to list your application's routes, like config.xml this file is not very useful anymore because we can declare the routes directly in the controllers.
- `schema.xml` to describe the database table related to your module.
- `composer.json` help you to share your module with the community

Once the module is created you can go to the module list in your back-office and activate it.

## Base file (MyProject.php)

This file must extend the `Thelia\Module\BaseModule` class (except for [deliveries](#delivery-modules) and [payments](#payment-modules) modules)
During the lifecycle of a module these function are called and allows you to apply your own logic by overwriting them :
- `install(ConnectionInterface $con = null);` This method is called when the plugin is installed for the first time.
- `preActivation(ConnectionInterface $con = null);` This method is called before the module activation, and may cancel the activation by returning false.
- `postActivation(ConnectionInterface $con = null);` This method is called after was successfully activated.
- `preDeactivation(ConnectionInterface $con = null);` This method is called before the module deactivation, and may cancel the deactivation it by returning false.
- `postDeactivation(ConnectionInterface $con = null);` This method is called after was successfully deactivated.
- `update($currentVersion, $newVersion, ConnectionInterface $con = null);` This method is called on a module refresh if the previous version in module.xml is different than the current version

## Controllers
Controllers work the same as Symfony's controllers except that in Thelia there is 2 types of Controllers :
- Front controllers which extends `BaseFrontController` when you call a render in it, Thelia will search template in frontOffice directory
- Admin controllers which extend `BaseAdminController`  when you call a render in it, Thelia will search template in backOffice directory and all routes in these controllers are automatically secured so that only logged admins can access them.

## Delivery modules

### Implementing a delivery module

For a delivery module the main class should extends the ```Thelia\Module\AbstractDeliveryModule``` interface and implement the ```getPostage``` and ```isValidDelivery``` methods.

#### `isValidDelivery()`

This method should return a `boolean`.    
If `true`, the delivery module is displayed on the front office by the delivery loop. If `false`, the module is not displayed.

This is useful if the delivery solution have some limitations and can't be used. For example, Colissimo can't be used if the total weight of the customer cart is greater than 30 Kg.

You may also use this method to restrict access to your module to some IP addresses the during test phase.

```php
/**
 * This method is called by the Delivery loop, to check if the current module has to be displayed to the customer.
 * Override it to implements your delivery rules/
 *
 * If you return true, the delivery method will de displayed to the customer
 * If you return false, the delivery method will not be displayed
 *
 * @param Country $country the country to deliver to.
 *
 * @return boolean
 */
public abstract function isValidDelivery(Country $country)
{
    // Retrieve the cart weight
    $cartWeight = $this->getRequest()->getSession()->getCart()->getWeight();

    return $cartWeight <= 30;
}
```

#### `getPostage()`

This method have an argument : the country for which the delivery price should be calculated.

If the module can't calculate the price for some reasons, it should throw a `DeliveryException`, with an internationalized message which describes the problem.

```php
/**
 * Calculate and return delivery price in the shop's default currency
 *
 * @param Country $country the country to deliver to.
 *
 * @return float the delivery price
 * @throws DeliveryException if the postage price cannot be calculated.
 */
public function getPostage(Country $country)
{
    if (! $this->isValidDelivery($country)) {
        throw new DeliveryException(
            Translator::getInstance()->trans("This module cannot be used on the current cart.")
        );
    }

    $postage = $this->giveMeThePriceOfTheDeliveryInThisCountry($country);

    return $postage;
}
```

## Payment modules

### Payment process

The payment is available once a customer is logged, has products in his cart and has selected a delivery method. 
Here is a typical payment process :

1. The customer selects the payment module
2. The customer triggers the payment (by clicking "Pay" button on the front office)
3. The pay() method of the selected payment module is called by Thelia
4. The pay() method manages the payment process, which could consists (depending on the module) in :
    - Invoking a web service or a platform specific API.
    - Submitting a form that contains payment parameters to a payment gateway.
    - Nothing (like in Cheque or Bank Transfer).
    - Other specific logic.
5. If the payment is successful, the customer is redirected to a "Thank you" page.
6. If the payment fails, the customer is redirected to a "Oops, sorry" page.

### Standard templates

In the standard front-office template, three template files provides a common and standard way to interact with the customer :

- `order-placed.html`, to tell the customer his payment is successful.
- `order-failed.html`, to tell the customer his payment failed, and offer a way to try again.
- `order-payment-gateway.html`, to provide a standard template to submit data to the payment gateway. This template file is not used by modules that do not send form-data to payment gateway.

These templates allow an immediate module integration in a shop template, but it's always possible for a module to provide its own templates.

### Implementing a payment module

For a payment module the main class should extend the `Thelia\Module\AbstractPaymentModule` interface and implement the  ```isValidPayment``` and ```pay``` methods.

#### `isValidPayment()`

This method should return a `boolean`. If `true`, the payment module is displayed on the front office by the payment loop. If `false`, the module is not displayed.

This is useful if the payment solution have some limitations and can't be used. For example, PayPal can't be used if there are more than 10 products in customer's cart and/or if total order amount is greater than 8000 €.

You may also use this method to restrict access to your module to some IP addresses the during test phase.

```php
/**
*
* This method is called by the Payment loop.
*
* If you return true, the payment method will be displayed
* If you return false, the payment method will not be displayed
*
* @return boolean
*/
public function isValidPayment()
{
    // At this point, the order does not exist yet in the database. We have to get
    // item count from the customer cart.

    /** @var Session $session */
    $session = $this->getRequest()->getSession();

    /** @var Cart $cart */
    $cart = $session->getCart();

    $cartContentCount = $cart->countCartItems();

    // BaseModule::getCurrentOrderTotalAmount() is a convenient methods 
    // to get order total from the current customer cart.

    $orderTotal = $this->getCurrentOrderTotalAmount();

    return $cartContentCount <= 10 && $orderTotal < 8000;
}
```

#### `pay()`

The `pay()` method is the most useful method of a payment module: it performs the payment of the current order, accordingly to the payment system requirements:

- submit a form that redirects the customer to the payment gateway,
- invoke a web service, a specific API, etc. to perform the payment from inside the method, and redirects the user to the result (success / failure) at the end of the process
- start a specific process, managed by a module controller
- whatever your requirements are 

The current order is passed as a parameter to the `pay()` method.

The method should return a ```Thelia\Core\HttpFoundation\Response``` object. Alternatively, depending on your specific needs, you can redirect the customer to another URL.

To use the standard `order-payment-gateway.html` template, just generate an array of (name, value) couples with the data required by the bank gateway. Then, send it to the template along with the payment gateway URL using the `generateGatewayFormResponse($order, $gatewayUrl, $formData)` method.
The form will be automatically submitted, and the customer will be redirected to the payment gateway.

Example for the Payzen payment module :

```php
/**
 * Payment gateway invocation
 *
 * @param  Order $order processed order
 * @return Response the payment form
 */
protected function pay(Order $order)
{
    $payzen_params = $this->getPayzenParameters($order, 'SINGLE');

    // Convert files into standard var => value array
    $html_params = array();

    /** @var PayzenField $field */
    foreach($payzen_params as $name => $field) {
        $html_params[$name] = $field->getValue();
    }

    // Be sure to have a valid platform URL, otherwise give up
    if (false === $platformUrl = PayzenConfigQuery::read('platform_url', false)) {
        throw new \InvalidArgumentException(Translator::getInstance()->trans("The platform URL is not defined, please check Payzen module configuration."));
    }

    // Generate the form
    return $this->generateGatewayFormResponse($order, $platformUrl, $html_params);
}
```

If you have a specific API, call it with the required parameters, and depending on the result, redirect to the success or failure page.

```php
/**
 * Payment gateway invocation
 *
 * @param  Order $order processed order
 * @return Response the payment form
 */
protected function pay(Order $order)
{
    $api = new SamplePaymentApi();

    // Invoke API
    $result = $api->performPayment($with_some_parameters);

    $returnUrl = $result === API::SUCCESS ? $this->getPaymentSuccessPageUrl(): $this->getPaymentFailurePageUrl();

    Redirect::exec($returnUrl);
 }
```

#### `manageStockOnCreation()`

You can decide with this function if your payment module decrease stock when the order is created or when the order status change to "paid".

Return `true` for decrementing stock on order creation. This is the default return value.
Return `false` for decrementing stock when order status change to "paid".

```php
/**
* Decrement stock on order creation
**/
public function manageStockOnCreation()
{
    return true;
}
```

```php
/**
* Decrement stock when status change to paid
**/
public function manageStockOnCreation()
{
    return false;
}
```

### Processing of payment system callback

Most payment platforms offers a callback system, to notify your module of the payment result. The callback often consists in calling an URL on your server, the Return URL.

#### Create a payment callback route

The callback URL will invoke a method in your payment controller. This controller may extend the abstract `Thelia\Modules\BasePaymentModuleController` class, which provides useful methods for payment confirmation:

- `getLog()` : returns a `Tlog` instance to a module specific log file. The file name is *module_code*.log, and is located in the log directory. For example, the Payzen module log file is `payzen.log`.

- `confirmPayment($orderId)` : call this method to confirm the payment of the order with ID `$orderId`. The method updates the order status to PAID, and dispatch the required events.

- `cancelPayment($orderId)` : Some payment systems may notify a cancellation of an already paid order through the return URL. Call this method in this case, to cancel the payment of an already paid order with ID `$orderId`. The order status will be set to `NOT_PAID`, and the required events will be dispatched.

- `getOrder($orderId)` : returns the Order object for order ID `$orderId`, or log an error the order can't be found.

- `redirectToSuccessPage($orderId)` : redirects the customer to the standard successful payment page. Use it only if your controller is invoked in the customer request scope.

- `redirectToFailurePage($orderId)` :  redirects the customer to the standard failed payment page. Use it only if your controller is invoked in the customer request scope.

Your controller should implement the `getModuleCode()` method, which returns your module code, that is the name of the module main class. For example "Payzen" for the Payzen module.

Your controller should perform all required check before calling `confirmPayment()`, to be sure that the customer payment is valid.
