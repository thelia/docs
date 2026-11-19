---
title: Orders
sidebar_position: 7
---

# Orders

Three modules help process orders: an administrator can place an order on behalf of a customer, a
customer can order the same products again, and a customer can collect the order in a store. All
three are active on a fresh install.

| Module | What it does | Default state |
| --- | --- | --- |
| AdminOrderCreation | Create an order from the back office | Active |
| DuplicateOrder | Reorder from the customer account | Active |
| LocalPickup | Store pickup as a delivery method | Active |

## Create an order in the back office (AdminOrderCreation)

### What it does

The order list of the back office has a **Create an order** button. It opens a form to place an
order for an existing customer, for instance an order taken by phone.

### Access

The button and the form are available to administrators whose profile can create orders (the
create permission on orders). There is nothing else to configure.

Module: [thelia-modules/AdminOrderCreation](https://github.com/thelia-modules/AdminOrderCreation)

## Reorder (DuplicateOrder)

### What it does

On an order page of the customer account, a **Renew my order** button fills the cart with the
products of that order. The customer then goes through the checkout as usual.

### Settings

None.

Module: [thelia-modules/DuplicateOrder](https://github.com/thelia-modules/DuplicateOrder)

## Store pickup (LocalPickup)

### What it does

At checkout, the customer can choose **store pickup** as delivery method. The delivery address of
the order becomes the store address. When you mark the order as sent in the back office, the
customer receives an e-mail.

When the module is activated, it is attached to the shipping zones that contain the country of the
shop. To offer pickup to customers of other countries, add the module to their zones.

### Set it up

On `/admin/module/LocalPickup`, enter the store address and the pickup instructions. The
instructions are shown to the customer at the delivery step of the checkout.

Module: [thelia-modules/LocalPickup](https://github.com/thelia-modules/LocalPickup)
