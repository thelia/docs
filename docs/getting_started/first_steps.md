---
title: First Steps
sidebar_position: 5
---

# First Steps

After installing Thelia 3, this guide will help you create your first content and understand the basic workflows.

## Access the Back-Office

Navigate to your admin panel:

- **URL**: `https://your-site.ddev.site/admin` (DDEV) or `http://localhost:8000/admin`
- **Login**: Use the credentials created during installation

## Create Your First Category

Categories organize your products. Let's create one:

1. Go to **Catalog > Categories**
2. Click **Add a category**
3. Fill in:
   - **Title**: "Electronics"
   - **Description**: Add a description
   - **Visible**: Check to make it visible
4. Click **Save**

### Via API

```http
POST /api/admin/categories
Content-Type: application/json
Authorization: Bearer {token}

{
    "visible": true,
    "position": 1,
    "i18ns": {
        "en_US": {
            "title": "Electronics",
            "description": "Electronic devices and accessories"
        }
    }
}
```

### In Twig (Front-Office)

```twig
{% set categories = resources('/api/front/categories', {
    'visible': true,
    'order[position]': 'asc'
}) %}

<nav>
    {% for category in categories %}
        <a href="{{ path('category', {id: category.id}) }}">
            {{ category.i18ns.title }}
        </a>
    {% endfor %}
</nav>
```

## Create Your First Product

1. Go to **Catalog > Products**
2. Click **Add a product**
3. Fill in the required fields:
   - **Reference**: "PHONE-001"
   - **Title**: "Smartphone XYZ"
   - **Default category**: Select "Electronics"
   - **Tax rule**: Select appropriate tax rule
4. Add **Sale Elements** (variations):
   - Price
   - Stock quantity
   - Weight
5. Add **Images**
6. Click **Save**

### Via API

```http
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer {token}

{
    "ref": "PHONE-001",
    "visible": true,
    "taxRule": "/api/admin/tax_rules/1",
    "productCategories": [
        {
            "category": "/api/admin/categories/1",
            "defaultCategory": true
        }
    ],
    "productSaleElements": [
        {
            "ref": "PHONE-001-DEFAULT",
            "isDefault": true,
            "quantity": 100,
            "productPrices": [
                {
                    "currency": "/api/admin/currencies/1",
                    "price": 599.99
                }
            ]
        }
    ],
    "i18ns": {
        "en_US": {
            "title": "Smartphone XYZ",
            "description": "The latest smartphone with amazing features",
            "chapo": "Next generation smartphone"
        }
    }
}
```

### Display in Twig

```twig
{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

<article class="product">
    <h1>{{ product.i18ns.title }}</h1>
    <p class="chapo">{{ product.i18ns.chapo }}</p>

    <div class="price">
        {% set pse = product.productSaleElements|first %}
        {% set price = pse.productPrices|first %}
        {{ price.price|number_format(2) }} EUR
    </div>

    <div class="description">
        {{ product.i18ns.description|raw }}
    </div>
</article>
```

## Customize the Theme

### Understanding Flexy

The default theme **Flexy** uses:
- **Twig** templates
- **LiveComponents** for reactivity
- **Stimulus** for JavaScript
- **Turbo** for navigation

### Override a Template

To customize without modifying the original:

1. Create your theme directory:
   ```bash
   mkdir -p templates/frontOffice/myTheme
   ```

2. Copy the base layout:
   ```bash
   cp templates/frontOffice/flexy/base.html.twig templates/frontOffice/myTheme/
   ```

3. Modify your copy

4. Activate your theme:
   ```bash
   php Thelia template:set frontOffice myTheme
   ```

### Modify Styles

For Flexy theme customization:

```bash
cd templates/frontOffice/flexy
npm install
npm run dev  # Watch mode for development
```

Edit files in `assets/` directory.

## Add a Simple Page

### Create Content

1. Go to **Content > Folders**
2. Create a folder "Information"
3. Go to **Content > Contents**
4. Create content "About Us" in the "Information" folder
5. Add your content and save

### Display Content

```twig
{% set content = resources('/api/front/contents/1') %}

<article>
    <h1>{{ content.i18ns.title }}</h1>
    {{ content.i18ns.description|raw }}
</article>
```

## Configure Shipping

1. Go to **Configuration > Shipping zones**
2. Create zones (e.g., "Domestic", "Europe", "International")
3. Go to **Modules**
4. Activate a shipping module (e.g., "Flat Rate")
5. Configure the module with prices per zone

## Configure Payment

1. Go to **Modules**
2. Activate a payment module (e.g., "PayPal", "Stripe")
3. Configure the module with your credentials

## Test the Checkout

1. Visit your front-office
2. Add a product to cart
3. Proceed to checkout
4. Complete the order flow

## Common Tasks

### Clear Cache

```bash
# DDEV
ddev exec php Thelia cache:clear

# Standard
php Thelia cache:clear
```

### View Logs

```bash
# DDEV
ddev logs

# Standard
tail -f var/log/dev.log
```

### Create Admin User

```bash
php Thelia admin:create
```

### Import Demo Data

```bash
php Thelia thelia:install-demo
```

## Understanding the Front-Office Flow

```
1. User visits /category/1
       │
       ▼
2. Symfony routes to CategoryController
       │
       ▼
3. Controller renders category.html.twig
       │
       ▼
4. Template calls resources('/api/front/categories/1')
       │
       ▼
5. DataAccessService fetches from API
       │
       ▼
6. LiveComponents render product grid
       │
       ▼
7. User interacts (filters, adds to cart)
       │
       ▼
8. LiveComponents update via AJAX
```

## Next Steps

- [Architecture](/docs/architecture) - Understand the full system
- [Front-Office Development](/docs/front-office) - Build custom UIs
- [API Documentation](/docs/api) - Master the API
- [Module Development](/docs/modules) - Extend functionality
