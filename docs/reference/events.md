---
title: Events
sidebar_position: 9
---

Thelia dispatch a lot of events during various workflows : account creation, order process, ...    
You can listen any of this event to add or replace logic. Or add your own events that can be listened by other modules.    
More info for Event dispatcher component can be found on [Symfony documentation](https://symfony.com/doc/current/components/event_dispatcher.html)

To do this you have to create an event subscriber, it's just a simple class that implement the `EventSubscriberInterface` with a `getSubscribedEvents` function to choose what event to listen :
```php
<?php

namespace MyModule\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Thelia\Core\Event\TheliaEvents;

class LogoutListener implements EventSubscriberInterface
{
    protected $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }


    public static function getSubscribedEvents($event)
    {
        // return the subscribed events, their methods and priorities
        return [
            TheliaEvents::CUSTOMER_LOGOUT => ['onCustomerLogout', 30]
        ];
    }

    public function onCustomerLogout()
    {
       // Do what you want at customer logout
    }
}
```

### Native events
Thelia native events are all listed in `TheliaEvents` class


### Propel events
Propel dispatch several events during model lifecycle :

| Constant name | Description                            |
|:--------------|:---------------------------------------|
| PRE_SAVE      | Before persisting the object           |
| POST_SAVE     | After persisting the object            |
| PRE_INSERT    | Before inserting to database           |
| POST_INSERT   | After inserting to database            |
| PRE_UPDATE    | Before updating the object in database |
| POST_UPDATE   | After updating the object in database  |
| PRE_DELETE    | Before deleting the object in database |
| POST_DELETE   | After deleting the object in database  |

Those constants are accessible to the class of model name suffixed by Event.    
For example to listen product update use this event `ProductEvent::POST_UPDATE`

```php
<?php

namespace MyModule\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Thelia\Model\Event\ProductEvent;

class ProductListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents($event)
    {
        // return the subscribed events, their methods and priorities
        return [
            ProductEvent::POST_UPDATE => ['postProductUpdate', 30]
        ];
    }

    public function postProductUpdate(ProductEvent $event)
    {
        $productModel = $event->getModel();
       // Do what you want with the product
    }
}
```

## Every event list

### Address

<details>
  <summary>Detail</summary>

sent for address creation.  
**ADDRESS_CREATE** = 'action.createAddress'

**ADDRESS_UPDATE** = 'action.updateAddress'

**ADDRESS_DELETE** = 'action.deleteAddress'

sent when an address is tag as default.  
**ADDRESS_DEFAULT** = 'action.defaultAddress'

__________________

-  AddressCreateOrUpdateEvent -> $address1 $address2 $address3 $cellphone $city $company $country $firstname $isDefault $label $lastname $phone $state $title $zipcode

</details>

### Admin

<details>
<summary>Detail</summary>

Sent before the logout of the administrator.  
**ADMIN_LOGOUT** = 'action.admin_logout'  

Sent once the administrator is successfully logged in.  
**ADMIN_LOGIN** = 'action.admin_login'  

__________________

</details>

### Administrator 

<details>
<summary>Detail</summary>

**ADMINISTRATOR_CREATE** = 'action.createAdministrator'  

**ADMINISTRATOR_UPDATE** = 'action.updateAdministrator'  

**ADMINISTRATOR_DELETE** = 'action.deleteAdministrator'  

**ADMINISTRATOR_UPDATEPASSWORD** = 'action.generatePassword'  

**ADMINISTRATOR_CREATEPASSWORD** = 'action.createPassword'  

__________________

-  AdministratorEvent -> $administrator   
-  AdministratorUpdatePasswordEvent -> $admin   


</details>

### Area 

<details>
<summary>Detail</summary>

**AREA_CREATE** = 'action.createArea'  

**AREA_UPDATE** = 'action.updateArea'  

**AREA_DELETE** = 'action.deleteArea'  

**AREA_REMOVE_COUNTRY** = 'action.area.removeCountry'  

**AREA_POSTAGE_UPDATE** = 'action.area.postageUpdate'  

**AREA_ADD_COUNTRY** = 'action.area.addCountry'  

__________________

-  AreaAddCountryEvent -> $area $countryIds   
-  AreaRemoveCountryEvent -> $area $countryIds $countryIds; $stateId   


</details>

### Attributes 

<details>
<summary>Detail</summary>

**ATTRIBUTE_CREATE** = 'action.createAttribute'  

**ATTRIBUTE_UPDATE** = 'action.updateAttribute'  

**ATTRIBUTE_DELETE** = 'action.deleteAttribute'  

**ATTRIBUTE_UPDATE_POSITION** = 'action.updateAttributePosition'  

**ATTRIBUTE_REMOVE_FROM_ALL_TEMPLATES** = 'action.addAttributeToAllTemplate'  

**ATTRIBUTE_ADD_TO_ALL_TEMPLATES** = 'action.removeAttributeFromAllTemplate'  

__________________

-  AttributeAvCreateEvent -> no constructor found in this file  
-  AttributeAvDeleteEvent -> $attributeAv_id   
- **⚠️ Warning**
 >  AttributeAvEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Attribute/AttributeAvEvent.php
-  AttributeAvUpdateEvent -> $attributeAv_id   
-  AttributeCreateEvent -> no constructor found in this file  
-  AttributeDeleteEvent -> $attribute_id   
- **⚠️ Warning**
 >  AttributeEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Attribute/AttributeEvent.php
-  AttributeUpdateEvent -> $attribute_id   


</details>

### Attributes values 

<details>
<summary>Detail</summary>

**ATTRIBUTE_AV_CREATE** = 'action.createAttributeAv'  

**ATTRIBUTE_AV_UPDATE** = 'action.updateAttributeAv'  

**ATTRIBUTE_AV_DELETE** = 'action.deleteAttributeAv'  

**ATTRIBUTE_AV_UPDATE_POSITION** = 'action.updateAttributeAvPosition'  

__________________

-  AttributeAvCreateEvent -> no constructor found in this file  
-  AttributeAvDeleteEvent -> $attributeAv_id   
- **⚠️ Warning**
 >  AttributeAvEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Attribute/AttributeAvEvent.php
-  AttributeAvUpdateEvent -> $attributeAv_id   
-  AttributeCreateEvent -> no constructor found in this file  
-  AttributeDeleteEvent -> $attribute_id   
- **⚠️ Warning**
 >  AttributeEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Attribute/AttributeEvent.php
-  AttributeUpdateEvent -> $attribute_id   


</details>

### Brands 

<details>
<summary>Detail</summary>

**BRAND_CREATE** = 'action.createBrand'  

**BRAND_UPDATE** = 'action.updateBrand'  

**BRAND_DELETE** = 'action.deleteBrand'  

**BRAND_UPDATE_POSITION** = 'action.updateBrandPosition'  

**BRAND_TOGGLE_VISIBILITY** = 'action.toggleBrandVisibility'  

**BRAND_UPDATE_SEO** = 'action.updateBrandSeo'  

**VIEW_BRAND_ID_NOT_VISIBLE** = 'action.viewBrandIdNotVisible'  

__________________

-  BrandCreateEvent -> no constructor found in this file  
-  BrandDeleteEvent -> $brand_id   
- **⚠️ Warning**
 >  BrandEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Brand/BrandEvent.php
-  BrandToggleVisibilityEvent -> no constructor found in this file  
-  BrandUpdateEvent -> $brandId   


</details>

### Cache 

<details>
<summary>Detail</summary>

sent for clearing cache.  
**CACHE_CLEAR** = 'thelia.cache.clear'  

__________________

-  CacheEvent -> $dir $onKernelTerminate   


</details>

### Cart 

<details>
<summary>Detail</summary>

**CART_PERSIST** = 'cart.persist'  

**CART_RESTORE_CURRENT** = 'cart.restore.current'  

**CART_CREATE_NEW** = 'cart.create.new'  

sent when a new existing cat id duplicated. This append when current customer is different from current cart  
The old cart is already deleted from the database when this event is dispatched.  
**CART_DUPLICATE** = 'cart.duplicate'  

Sent when the cart is duplicated, but not yet deleted from the database.  
**CART_DUPLICATED** = 'cart.duplicated'  

Sent when a cart item is duplicated.  
**CART_ITEM_DUPLICATE** = 'cart.item.duplicate'  

sent when a new item is added to current cart.  
**AFTER_CARTADDITEM** = 'cart.after.addItem'  

sent for searching an item in the cart.  
**CART_FINDITEM** = 'cart.findItem'  

sent when a cart item is modify.  
**AFTER_CARTUPDATEITEM** = 'cart.updateItem'  

sent for addArticle action.  
**CART_ADDITEM** = 'action.addArticle'  

sent on modify article action.  
**CART_UPDATEITEM** = 'action.updateArticle'  

**CART_DELETEITEM** = 'action.deleteArticle'  

**CART_CLEAR** = 'action.clear'  

**CART_ITEM_CREATE_BEFORE** = 'action.cart.item.create.before'  

**CART_ITEM_UPDATE_BEFORE** = 'action.cart.item.update.before'  

__________________

-  CartCreateEvent -> no constructor found in this file  
-  CartDuplicationEvent -> $duplicatedCart $originalCart   
-  CartEvent -> $cart   
-  CartItemDuplicationItem -> $newItem $oldItem   
-  CartItemEvent -> $cartItem   
-  CartPersistEvent -> $cart   
-  CartRestoreEvent -> no constructor found in this file  


</details>

### Categories 

<details>
<summary>Detail</summary>

**CATEGORY_CREATE** = 'action.createCategory'  

**CATEGORY_UPDATE** = 'action.updateCategory'  

**CATEGORY_DELETE** = 'action.deleteCategory'  

**CATEGORY_TOGGLE_VISIBILITY** = 'action.toggleCategoryVisibility'  

**CATEGORY_UPDATE_POSITION** = 'action.updateCategoryPosition'  

**CATEGORY_ADD_CONTENT** = 'action.categoryAddContent'  

**CATEGORY_REMOVE_CONTENT** = 'action.categoryRemoveContent'  

**CATEGORY_UPDATE_SEO** = 'action.updateCategorySeo'  

**VIEW_CATEGORY_ID_NOT_VISIBLE** = 'action.viewCategoryIdNotVisible'  

__________________

-  CategoryAddContentEvent -> $category $content_id   
- **⚠️ Warning**
 >  CategoryAssociatedContentEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Category/CategoryAssociatedContentEvent.php
-  CategoryCreateEvent -> no constructor found in this file  
-  CategoryDeleteContentEvent -> $category $content_id   
-  CategoryDeleteEvent -> $categoryId   
- **⚠️ Warning**
 >  CategoryEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Category/CategoryEvent.php
-  CategoryToggleVisibilityEvent -> no constructor found in this file  
-  CategoryUpdateEvent -> $category_id   


</details>

### Clone 

<details>
<summary>Detail</summary>

**PRODUCT_CLONE** = 'action.cloneProduct'  

**FILE_CLONE** = 'action.cloneFile'  

**PSE_CLONE** = 'action.clonePSE'  

__________________

</details>

### Configuration 

<details>
<summary>Detail</summary>

**CONFIG_CREATE** = 'action.createConfig'  

**CONFIG_SETVALUE** = 'action.setConfigValue'  

**CONFIG_UPDATE** = 'action.updateConfig'  

**CONFIG_DELETE** = 'action.deleteConfig'  

__________________

-  ConfigCreateEvent -> no constructor found in this file  
-  ConfigDeleteEvent -> $config_id   
- **⚠️ Warning**
 >  ConfigEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Config/ConfigEvent.php
-  ConfigUpdateEvent -> $config_id   


</details>

### Contact 

<details>
<summary>Detail</summary>

sent for submit contact form.  
since 2.4  
**CONTACT_SUBMIT** = 'thelia.contact.submit'  

__________________

-  ContactEvent -> $form   


</details>

### Content 

<details>
<summary>Detail</summary>

**CONTENT_CREATE** = 'action.createContent'  

**CONTENT_UPDATE** = 'action.updateContent'  

**CONTENT_DELETE** = 'action.deleteContent'  

**CONTENT_TOGGLE_VISIBILITY** = 'action.toggleContentVisibility'  

**CONTENT_UPDATE_POSITION** = 'action.updateContentPosition'  

**CONTENT_UPDATE_SEO** = 'action.updateContentSeo'  

**CONTENT_ADD_FOLDER** = 'action.contentAddFolder'  

**CONTENT_REMOVE_FOLDER** = 'action.contentRemoveFolder'  

**VIEW_CONTENT_ID_NOT_VISIBLE** = 'action.viewContentIdNotVisible'  

__________________

-  ContentAddFolderEvent -> $content $folderId   
-  ContentCreateEvent -> no constructor found in this file  
-  ContentDeleteEvent -> $content_id   
- **⚠️ Warning**
 >  ContentEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Content/ContentEvent.php
-  ContentRemoveFolderEvent -> no constructor found in this file  
-  ContentToggleVisibilityEvent -> no constructor found in this file  
-  ContentUpdateEvent -> $content_id   


</details>

### Core 

<details>
<summary>Detail</summary>

sent at the beginning.  
**BOOT** = 'thelia.boot'  

Kernel View Check Handle.  
**VIEW_CHECK** = 'thelia.view_check'  

__________________

</details>

### Country 

<details>
<summary>Detail</summary>

**COUNTRY_CREATE** = 'action.state.create'  

**COUNTRY_UPDATE** = 'action.state.update'  

**COUNTRY_DELETE** = 'action.state.delete'  

**COUNTRY_TOGGLE_DEFAULT** = 'action.toggleCountryDefault'  

**COUNTRY_TOGGLE_VISIBILITY** = 'action.state.toggleVisibility'  

__________________

-  CountryCreateEvent -> no constructor found in this file  
-  CountryDeleteEvent -> $country_id   
- **⚠️ Warning**
 >  CountryEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Country/CountryEvent.php
-  CountryToggleDefaultEvent -> $country_id   
-  CountryToggleVisibilityEvent -> no constructor found in this file  
-  CountryUpdateEvent -> $country_id   


</details>

### Coupon 

<details>
<summary>Detail</summary>

Sent when creating a Coupon.  
**COUPON_CREATE** = 'action.create_coupon'  

Sent when editing a Coupon.  
**COUPON_UPDATE** = 'action.update_coupon'  

Sent when deleting a Coupon.  
**COUPON_DELETE** = 'action.delete_coupon'  

Sent when attempting to use a Coupon.  
**COUPON_CONSUME** = 'action.consume_coupon'  

Sent when all coupons in the current session should be cleared.  
**COUPON_CLEAR_ALL** = 'action.clear_all_coupon'  

Sent when attempting to update Coupon Condition.  
**COUPON_CONDITION_UPDATE** = 'action.update_coupon_condition'  

__________________

-  CouponConsumeEvent -> $code $discount $freeShipping $isValid   
-  CouponCreateOrUpdateEvent -> $code $description $effects $expirationDate $freeShippingForCountries $freeShippingForMethods $isAvailableOnSpecialOffers $isCumulative $isEnabled $isRemovingPostage $locale $maxUsage $perCustomerUsageCount $serviceId $shortDescription $startDate $title   
-  CouponDeleteEvent -> $coupon   


</details>

### Currencies 

<details>
<summary>Detail</summary>

**CURRENCY_CREATE** = 'action.createCurrency'  

**CURRENCY_UPDATE** = 'action.updateCurrency'  

**CURRENCY_DELETE** = 'action.deleteCurrency'  

**CURRENCY_SET_DEFAULT** = 'action.setDefaultCurrency'  

**CURRENCY_SET_VISIBLE** = 'action.setVisibleCurrency'  

**CURRENCY_UPDATE_RATES** = 'action.updateCurrencyRates'  

**CURRENCY_UPDATE_POSITION** = 'action.updateCurrencyPosition'  

**CHANGE_DEFAULT_CURRENCY** = 'action.changeDefaultCurrency'  

__________________

-  CurrencyChangeEvent -> $currency $request   
-  CurrencyCreateEvent -> no constructor found in this file  
-  CurrencyDeleteEvent -> $currencyId   
- **⚠️ Warning**
 >  CurrencyEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Currency/CurrencyEvent.php
-  CurrencyUpdateEvent -> $currencyId   
-  CurrencyUpdateRateEvent -> no constructor found in this file  


</details>

### Customer 

<details>
<summary>Detail</summary>

Sent before the logout of the customer.  
**CUSTOMER_LOGOUT** = 'action.customer_logout'  

Sent once the customer is successfully logged in.  
**CUSTOMER_LOGIN** = 'action.customer_login'  

sent on customer account creation.  
**CUSTOMER_CREATEACCOUNT** = 'action.createCustomer'  

sent on customer account update.  
**CUSTOMER_UPDATEACCOUNT** = 'action.updateCustomer'  

sent on customer account update profile.  
**CUSTOMER_UPDATEPROFILE** = 'action.updateProfileCustomer'  

sent on customer removal.  
**CUSTOMER_DELETEACCOUNT** = 'action.deleteCustomer'  

sent when a customer need a new password.  
**LOST_PASSWORD** = 'action.lostPassword'  

Send the account ccreation confirmation email.  
**SEND_ACCOUNT_CONFIRMATION_EMAIL** = 'action.customer.sendAccountConfirmationEmail'  

__________________

-  CustomerCreateOrUpdateEvent -> $address1 $address2 $address3 $cellphone $city $company $country $discount $email $firstname $langId $lastname $password $phone $ref $reseller $sponsor $state $title $zipcode   
- **⚠️ Warning**
 >  CustomerEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Customer/CustomerEvent.php
-  CustomerLoginEvent -> no constructor found in this file  


</details>

### Customer title 

<details>
<summary>Detail</summary>

**CUSTOMER_TITLE_CREATE** = 'action.title.create'  

**CUSTOMER_TITLE_UPDATE** = 'action.title.update'  

**CUSTOMER_TITLE_DELETE** = 'action.title.delete'  

__________________

-  CustomerCreateOrUpdateEvent -> $address1 $address2 $address3 $cellphone $city $company $country $discount $email $firstname $langId $lastname $password $phone $ref $reseller $sponsor $state $title $zipcode   
- **⚠️ Warning**
 >  CustomerEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Customer/CustomerEvent.php
-  CustomerLoginEvent -> no constructor found in this file  


-  CustomerTitleEvent -> no constructor found in this file  


</details>

### Delivery 

<details>
<summary>Detail</summary>

**MODULE_DELIVERY_GET_POSTAGE** = 'thelia.module.delivery.postage'  

**MODULE_DELIVERY_GET_PICKUP_LOCATIONS** = 'thelia.module.delivery.pickupLocations'  

__________________

-  DeliveryPostageEvent -> $address $cart $country $module $state   
-  PickupLocationEvent -> $address $addressModel $city $country $maxRelays $moduleIds $orderWeight $radius $state $zipCode   


</details>

### Document 

<details>
<summary>Detail</summary>

Sent on document processing.  
**DOCUMENT_PROCESS** = 'action.processDocument'  

Sent on image cache clear request.  
**DOCUMENT_CLEAR_CACHE** = 'action.clearDocumentCache'  

Save given documents.  
**DOCUMENT_SAVE** = 'action.saveDocument'  

Save given documents.  
**DOCUMENT_UPDATE** = 'action.updateDocument'  

**DOCUMENT_UPDATE_POSITION** = 'action.updateDocumentPosition'  

**DOCUMENT_TOGGLE_VISIBILITY** = 'action.toggleDocumentVisibility'  

Delete given document.  
**DOCUMENT_DELETE** = 'action.deleteDocument'  

__________________

-  DocumentEvent -> no constructor found in this file  


</details>

### Export 

<details>
<summary>Detail</summary>

**EXPORT_CHANGE_POSITION** = 'export.change.position'  

**EXPORT_CATEGORY_CHANGE_POSITION** = 'export.category.change.position'  

**EXPORT_BEGIN** = 'export.begin'  

**EXPORT_FINISHED** = 'export.finished'  

**EXPORT_SUCCESS** = 'export.success'  

__________________

</details>

### Features 

<details>
<summary>Detail</summary>

**FEATURE_CREATE** = 'action.createFeature'  

**FEATURE_UPDATE** = 'action.updateFeature'  

**FEATURE_DELETE** = 'action.deleteFeature'  

**FEATURE_UPDATE_POSITION** = 'action.updateFeaturePosition'  

**FEATURE_REMOVE_FROM_ALL_TEMPLATES** = 'action.addFeatureToAllTemplate'  

**FEATURE_ADD_TO_ALL_TEMPLATES** = 'action.removeFeatureFromAllTemplate'  

__________________

-  FeatureAvCreateEvent -> no constructor found in this file  
-  FeatureAvDeleteEvent -> $featureAv_id   
- **⚠️ Warning**
 >  FeatureAvEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Feature/FeatureAvEvent.php
-  FeatureAvUpdateEvent -> $featureAv_id   
-  FeatureCreateEvent -> no constructor found in this file  
-  FeatureDeleteEvent -> $feature_id   
- **⚠️ Warning**
 >  FeatureEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Feature/FeatureEvent.php
-  FeatureUpdateEvent -> $feature_id   


</details>

### Features values 

<details>
<summary>Detail</summary>

**FEATURE_AV_CREATE** = 'action.createFeatureAv'  

**FEATURE_AV_UPDATE** = 'action.updateFeatureAv'  

**FEATURE_AV_DELETE** = 'action.deleteFeatureAv'  

**FEATURE_AV_UPDATE_POSITION** = 'action.updateFeatureAvPosition'  

sent when Thelia try to generate a rewritten url.  
**GENERATE_REWRITTENURL** = 'action.generate_rewritenurl'  

**GENERATE_PDF** = 'thelia.generatePdf'  

__________________

-  FeatureAvCreateEvent -> no constructor found in this file  
-  FeatureAvDeleteEvent -> $featureAv_id   
- **⚠️ Warning**
 >  FeatureAvEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Feature/FeatureAvEvent.php
-  FeatureAvUpdateEvent -> $featureAv_id   
-  FeatureCreateEvent -> no constructor found in this file  
-  FeatureDeleteEvent -> $feature_id   
- **⚠️ Warning**
 >  FeatureEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Feature/FeatureEvent.php
-  FeatureUpdateEvent -> $feature_id   


</details>

### Folder 

<details>
<summary>Detail</summary>

**FOLDER_CREATE** = 'action.createFolder'  

**FOLDER_UPDATE** = 'action.updateFolder'  

**FOLDER_DELETE** = 'action.deleteFolder'  

**FOLDER_TOGGLE_VISIBILITY** = 'action.toggleFolderVisibility'  

**FOLDER_UPDATE_POSITION** = 'action.updateFolderPosition'  

**FOLDER_UPDATE_SEO** = 'action.updateFolderSeo'  

**VIEW_FOLDER_ID_NOT_VISIBLE** = 'action.viewFolderIdNotVisible'  

__________________

-  FolderCreateEvent -> no constructor found in this file  
-  FolderDeleteEvent -> $folder_id   
- **⚠️ Warning**
 >  FolderEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Folder/FolderEvent.php
-  FolderToggleVisibilityEvent -> no constructor found in this file  
-  FolderUpdateEvent -> $folder_id   


</details>

### Form 

<details>
<summary>Detail</summary>

**FORM_BEFORE_BUILD** = 'thelia.form.before_build'  

**FORM_AFTER_BUILD** = 'thelia.form.after_build'  

__________________

</details>

### Hook 

<details>
<summary>Detail</summary>

Hook.  
**HOOK_CREATE** = 'thelia.hook.action.create'  

**HOOK_UPDATE** = 'thelia.hook.action.update'  

**HOOK_DELETE** = 'thelia.hook.action.delete'  

**HOOK_TOGGLE_NATIVE** = 'thelia.hook.action.toggleNative'  

**HOOK_TOGGLE_ACTIVATION** = 'thelia.hook.action.toggleActivation'  

**HOOK_CREATE_ALL** = 'thelia.hook.action.createAll'  

**HOOK_DEACTIVATION** = 'thelia.hook.action.deactivation'  

**MODULE_HOOK_CREATE** = 'thelia.moduleHook.action.create'  

**MODULE_HOOK_UPDATE** = 'thelia.moduleHook.action.update'  

**MODULE_HOOK_DELETE** = 'thelia.moduleHook.action.delete'  

**MODULE_HOOK_UPDATE_POSITION** = 'thelia.moduleHook.action.updatePosition'  

**MODULE_HOOK_TOGGLE_ACTIVATION** = 'thelia.moduleHook.action.toggleActivation'  

__________________

-  BaseHookRenderEvent -> $arguments $code $templateVars   
-  HookCreateAllEvent -> no constructor found in this file  
-  HookCreateEvent -> no constructor found in this file  
-  HookDeactivationEvent -> $hook_id   
-  HookDeleteEvent -> $hook_id   
-  HookEvent -> $hook   
-  HookRenderBlockEvent -> $arguments $code $fields $templateVariables $templateVariables;   
-  HookRenderEvent -> $arguments $code $templateVariables $templateVariables;   
-  HookToggleActivationEvent -> $hook_id   
-  HookToggleNativeEvent -> $hook_id   
-  HookUpdateEvent -> $hook_id   
-  ModuleHookCreateEvent -> no constructor found in this file  
-  ModuleHookDeleteEvent -> $module_hook_id   
-  ModuleHookEvent -> $moduleModuleHook   
-  ModuleHookToggleActivationEvent -> no constructor found in this file  
-  ModuleHookUpdateEvent -> no constructor found in this file  


</details>

### Image 

<details>
<summary>Detail</summary>

Sent on image processing.  
**IMAGE_PROCESS** = 'action.processImage'  

Sent just after creating the image object from the image file.  
**IMAGE_PREPROCESSING** = 'action.preProcessImage'  

Sent just before saving the processed image object on disk.  
**IMAGE_POSTPROCESSING** = 'action.postProcessImage'  

Sent on image cache clear request.  
**IMAGE_CLEAR_CACHE** = 'action.clearImageCache'  

Save given images.  
**IMAGE_SAVE** = 'action.saveImages'  

Save given images.  
**IMAGE_UPDATE** = 'action.updateImages'  

**IMAGE_UPDATE_POSITION** = 'action.updateImagePosition'  

**IMAGE_TOGGLE_VISIBILITY** = 'action.toggleImageVisibility'  

Delete given image.  
**IMAGE_DELETE** = 'action.deleteImage'  

__________________

-  ImageEvent -> no constructor found in this file  


</details>

### Import 

<details>
<summary>Detail</summary>

**IMPORT_CHANGE_POSITION** = 'import.change.position'  

**IMPORT_CATEGORY_CHANGE_POSITION** = 'import.category.change.position'  

**IMPORT_BEGIN** = 'import.begin'  

**IMPORT_FINISHED** = 'import.finished'  

**IMPORT_SUCCESS** = 'import.success'  

__________________

</details>

### Lang 

<details>
<summary>Detail</summary>

**LANG_UPDATE** = 'action.lang.update'  

**LANG_CREATE** = 'action.lang.create'  

**LANG_DELETE** = 'action.lang.delete'  

**LANG_DEFAULTBEHAVIOR** = 'action.lang.defaultBehavior'  

**LANG_URL** = 'action.lang.url'  

**LANG_TOGGLEDEFAULT** = 'action.lang.toggleDefault'  

**LANG_TOGGLEACTIVE** = 'action.lang.toggleActive'  

**LANG_TOGGLEVISIBLE** = 'action.lang.toggleVisible'  

__________________

-  LangCreateEvent -> no constructor found in this file  
-  LangDefaultBehaviorEvent -> $defaultBehavior   
-  LangDeleteEvent -> $lang_id   
- **⚠️ Warning**
 >  LangEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Lang/LangEvent.php
-  LangToggleActiveEvent -> no constructor found in this file  
-  LangToggleDefaultEvent -> $lang_id   
-  LangToggleVisibleEvent -> no constructor found in this file  
-  LangUpdateEvent -> $id   


</details>

### Loop 

<details>
<summary>Detail</summary>

**LOOP_EXTENDS_ARG_DEFINITIONS** = 'loop.extends.arg_definitions'  

**LOOP_EXTENDS_INITIALIZE_ARGS** = 'loop.extends.initialize_args'  

**LOOP_EXTENDS_BUILD_MODEL_CRITERIA** = 'loop.extends.build_model_criteria'  

**LOOP_EXTENDS_BUILD_ARRAY** = 'loop.extends.build_array'  

**LOOP_EXTENDS_PARSE_RESULTS** = 'loop.extends.parse_results'  

__________________

-  LoopExtendsArgDefinitionsEvent -> no constructor found in this file  
-  LoopExtendsBuildArrayEvent -> $array $loop   
-  LoopExtendsBuildModelCriteriaEvent -> $loop $modelCriteria   
-  LoopExtendsEvent -> $loop   
-  LoopExtendsInitializeArgsEvent -> $loop $loopParameters   
-  LoopExtendsParseResultsEvent -> $loop $loopResult   


</details>

### Mailing system 

<details>
<summary>Detail</summary>

**MAILING_SYSTEM_UPDATE** = 'action.updateMailingSystem'  

__________________

-  MailingSystemEvent -> no constructor found in this file  


</details>

### Messages 

<details>
<summary>Detail</summary>

**MESSAGE_CREATE** = 'action.createMessage'  

**MESSAGE_UPDATE** = 'action.updateMessage'  

**MESSAGE_DELETE** = 'action.deleteMessage'  

__________________

-  MessageCreateEvent -> no constructor found in this file  
-  MessageDeleteEvent -> $message_id   
- **⚠️ Warning**
 >  MessageEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Message/MessageEvent.php
-  MessageUpdateEvent -> $message_id   


</details>

### Meta data 

<details>
<summary>Detail</summary>

**META_DATA_CREATE** = 'thelia.metadata.create'  

**META_DATA_UPDATE** = 'thelia.metadata.update'  

**META_DATA_DELETE** = 'thelia.metadata.delete'  

__________________

-  MetaDataCreateOrUpdateEvent -> $elementId $elementId; $elementKey $metaKey $value   
-  MetaDataDeleteEvent -> $elementId $elementKey $metaKey   
-  MetaDataEvent -> $metaData   


</details>

### Module 

<details>
<summary>Detail</summary>

sent when a module is activated or deactivated.  
**MODULE_TOGGLE_ACTIVATION** = 'thelia.module.toggleActivation'  

sent when module position is changed.  
**MODULE_UPDATE_POSITION** = 'thelia.module.action.updatePosition'  

module.  
**MODULE_CREATE** = 'thelia.module.create'  

**MODULE_UPDATE** = 'thelia.module.update'  

**MODULE_DELETE** = 'thelia.module.delete'  

**MODULE_INSTALL** = 'thelia.module.install'  

__________________

-  ModuleDeleteEvent -> $assume_delete $module_id   
-  ModuleEvent -> $module   
-  ModuleInstallEvent -> $module   
-  ModuleToggleActivationEvent -> $assume_deactivate $module_id   


</details>

### Newsletter 

<details>
<summary>Detail</summary>

sent for subscribing to the newsletter.  
**NEWSLETTER_SUBSCRIBE** = 'thelia.newsletter.subscribe'  

**NEWSLETTER_UPDATE** = 'thelia.newsletter.update'  

**NEWSLETTER_UNSUBSCRIBE** = 'thelia.newsletter.unsubscribe'  

**NEWSLETTER_CONFIRM_SUBSCRIPTION** = 'thelia.newsletter.confirmSubscription'  

__________________

-  NewsletterEvent -> $email $locale   


</details>

### Order 

<details>
<summary>Detail</summary>

Order linked event.  
**ORDER_SET_DELIVERY_ADDRESS** = 'action.order.setDeliveryAddress'  

**ORDER_SET_DELIVERY_MODULE** = 'action.order.setDeliveryModule'  

**ORDER_SET_POSTAGE** = 'action.order.setPostage'  

**ORDER_SET_INVOICE_ADDRESS** = 'action.order.setInvoiceAddress'  

**ORDER_SET_PAYMENT_MODULE** = 'action.order.setPaymentModule'  

**ORDER_PAY** = 'action.order.pay'  

**ORDER_PAY_GET_TOTAL** = 'action.order.pay.getTotal'  

**ORDER_BEFORE_PAYMENT** = 'action.order.beforePayment'  

**ORDER_CART_CLEAR** = 'action.order.cartClear'  

**ORDER_CREATE_MANUAL** = 'action.order.createManual'  

**ORDER_UPDATE_STATUS** = 'action.order.updateStatus'  

**ORDER_GET_STOCK_UPDATE_OPERATION_ON_ORDER_STATUS_CHANGE** = 'action.order.getStockUpdateOperationOnOrderStatusChange'  

**ORDER_SEND_CONFIRMATION_EMAIL** = 'action.order.sendOrderConfirmationEmail'  

**ORDER_SEND_NOTIFICATION_EMAIL** = 'action.order.sendOrderNotificationEmail'  

**ORDER_UPDATE_DELIVERY_REF** = 'action.order.updateDeliveryRef'  

**ORDER_UPDATE_TRANSACTION_REF** = 'action.order.updateTransactionRef'  

**ORDER_UPDATE_ADDRESS** = 'action.order.updateAddress'  

**ORDER_PRODUCT_BEFORE_CREATE** = 'action.orderProduct.beforeCreate'  

**ORDER_PRODUCT_AFTER_CREATE** = 'action.orderProduct.afterCreate'  

__________________

-  GetStockUpdateOperationOnOrderStatusChangeEvent -> $newOrderStatus $order   
-  OrderAddressEvent -> $address1 $address2 $address3 $cellphone $city $company $country $firstname $lastname $phone $state $title $zipcode   
-  OrderEvent -> $order   
-  OrderManualEvent -> $cart $currency $customer $lang $order   
-  OrderPayTotalEvent -> no constructor found in this file  
-  OrderPaymentEvent -> $order   
-  OrderProductEvent -> $id $order   


</details>

### Order status 

<details>
<summary>Detail</summary>

**ORDER_STATUS_CREATE** = 'action.createOrderStatus'  

**ORDER_STATUS_UPDATE** = 'action.updateOrderStatus'  

**ORDER_STATUS_DELETE** = 'action.deleteOrderStatus'  

**ORDER_STATUS_UPDATE_POSITION** = 'action.updateOrderStatusPosition'  

__________________

-  GetStockUpdateOperationOnOrderStatusChangeEvent -> $newOrderStatus $order   
-  OrderAddressEvent -> $address1 $address2 $address3 $cellphone $city $company $country $firstname $lastname $phone $state $title $zipcode   
-  OrderEvent -> $order   
-  OrderManualEvent -> $cart $currency $customer $lang $order   
-  OrderPayTotalEvent -> no constructor found in this file  
-  OrderPaymentEvent -> $order   
-  OrderProductEvent -> $id $order   


-  OrderStatusCreateEvent -> no constructor found in this file  
-  OrderStatusDeleteEvent -> no constructor found in this file  
-  OrderStatusEvent -> no constructor found in this file  
-  OrderStatusUpdateEvent -> $id   


</details>

### Payment 

<details>
<summary>Detail</summary>

**MODULE_PAY** = 'thelia.module.pay'  

**MODULE_PAYMENT_IS_VALID** = 'thelia.module.payment.is_valid'  

**MODULE_PAYMENT_MANAGE_STOCK** = 'thelia.module.payment.manage_stock'  

__________________

-  BasePaymentEvent -> $module   
-  IsValidPaymentEvent -> $cart $module   
-  ManageStockOnCreationEvent -> $module   


</details>

### Product 

<details>
<summary>Detail</summary>

**PRODUCT_CREATE** = 'action.createProduct'  

**PRODUCT_UPDATE** = 'action.updateProduct'  

**PRODUCT_DELETE** = 'action.deleteProduct'  

**PRODUCT_TOGGLE_VISIBILITY** = 'action.toggleProductVisibility'  

**PRODUCT_UPDATE_POSITION** = 'action.updateProductPosition'  

**PRODUCT_UPDATE_SEO** = 'action.updateProductSeo'  

**PRODUCT_ADD_CONTENT** = 'action.productAddContent'  

**PRODUCT_REMOVE_CONTENT** = 'action.productRemoveContent'  

**PRODUCT_UPDATE_CONTENT_POSITION** = 'action.updateProductContentPosition'  

**PRODUCT_ADD_PRODUCT_SALE_ELEMENT** = 'action.addProductSaleElement'  

**PRODUCT_DELETE_PRODUCT_SALE_ELEMENT** = 'action.deleteProductSaleElement'  

**PRODUCT_UPDATE_PRODUCT_SALE_ELEMENT** = 'action.updateProductSaleElement'  

**PRODUCT_COMBINATION_GENERATION** = 'action.productCombinationGeneration'  

**PRODUCT_SET_TEMPLATE** = 'action.productSetTemplate'  

**PRODUCT_ADD_ACCESSORY** = 'action.productAddProductAccessory'  

**PRODUCT_REMOVE_ACCESSORY** = 'action.productRemoveProductAccessory'  

**PRODUCT_UPDATE_ACCESSORY_POSITION** = 'action.updateProductAccessoryPosition'  

**PRODUCT_FEATURE_UPDATE_VALUE** = 'action.updateProductFeatureValue'  

**PRODUCT_FEATURE_DELETE_VALUE** = 'action.deleteProductFeatureValue'  

**PRODUCT_ADD_CATEGORY** = 'action.addProductCategory'  

**PRODUCT_REMOVE_CATEGORY** = 'action.deleteProductCategory'  

**VIRTUAL_PRODUCT_ORDER_HANDLE** = 'action.virtualProduct.handleOrder'  

**VIRTUAL_PRODUCT_ORDER_DOWNLOAD_RESPONSE** = 'action.virtualProduct.downloadResponse'  

**VIEW_PRODUCT_ID_NOT_VISIBLE** = 'action.viewProductIdNotVisible'  

__________________

-  ProductAddAccessoryEvent -> $accessory_id $product   
-  ProductAddCategoryEvent -> $category_id $product   
-  ProductAddContentEvent -> $content_id $product   
- **⚠️ Warning**
 >  ProductAssociatedContentEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Product/ProductAssociatedContentEvent.php
-  ProductCloneEvent -> $lang $originalProduct $ref   
-  ProductCombinationGenerationEvent -> $combinations $currency_id $product   
-  ProductCreateEvent -> no constructor found in this file  
-  ProductDeleteAccessoryEvent -> $accessory_id $product   
-  ProductDeleteCategoryEvent -> $category_id $product   
-  ProductDeleteContentEvent -> $content_id $product   
-  ProductDeleteEvent -> $product_id   
- **⚠️ Warning**
 >  ProductEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Product/ProductEvent.php
-  ProductSetTemplateEvent -> $currency_id $product $template_id   
-  ProductToggleVisibilityEvent -> no constructor found in this file  
-  ProductUpdateEvent -> $product_id   
-  VirtualProductOrderDownloadResponseEvent -> $orderProduct   
-  VirtualProductOrderHandleEvent -> $order $pseId   


-  ProductSaleElementCreateEvent -> $attribute_av_list $currency_id $product   
-  ProductSaleElementDeleteEvent -> $currency_id $product_sale_element_id   
-  ProductSaleElementEvent -> $product_sale_element   
-  ProductSaleElementUpdateEvent -> $product $product_sale_element_id   


</details>

### Product templates 

<details>
<summary>Detail</summary>

**TEMPLATE_CREATE** = 'action.createTemplate'  

**TEMPLATE_UPDATE** = 'action.updateTemplate'  

**TEMPLATE_DELETE** = 'action.deleteTemplate'  

**TEMPLATE_DUPLICATE** = 'action.duplicateTemplate'  

**TEMPLATE_ADD_ATTRIBUTE** = 'action.templateAddAttribute'  

**TEMPLATE_DELETE_ATTRIBUTE** = 'action.templateDeleteAttribute'  

**TEMPLATE_ADD_FEATURE** = 'action.templateAddFeature'  

**TEMPLATE_DELETE_FEATURE** = 'action.templateDeleteFeature'  

**TEMPLATE_CHANGE_FEATURE_POSITION** = 'action.templateChangeAttributePosition'  

**TEMPLATE_CHANGE_ATTRIBUTE_POSITION** = 'action.templateChangeFeaturePosition'  

__________________

-  ProductAddAccessoryEvent -> $accessory_id $product   
-  ProductAddCategoryEvent -> $category_id $product   
-  ProductAddContentEvent -> $content_id $product   
- **⚠️ Warning**
 >  ProductAssociatedContentEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Product/ProductAssociatedContentEvent.php
-  ProductCloneEvent -> $lang $originalProduct $ref   
-  ProductCombinationGenerationEvent -> $combinations $currency_id $product   
-  ProductCreateEvent -> no constructor found in this file  
-  ProductDeleteAccessoryEvent -> $accessory_id $product   
-  ProductDeleteCategoryEvent -> $category_id $product   
-  ProductDeleteContentEvent -> $content_id $product   
-  ProductDeleteEvent -> $product_id   
- **⚠️ Warning**
 >  ProductEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Product/ProductEvent.php
-  ProductSetTemplateEvent -> $currency_id $product $template_id   
-  ProductToggleVisibilityEvent -> no constructor found in this file  
-  ProductUpdateEvent -> $product_id   
-  VirtualProductOrderDownloadResponseEvent -> $orderProduct   
-  VirtualProductOrderHandleEvent -> $order $pseId   


-  ProductSaleElementCreateEvent -> $attribute_av_list $currency_id $product   
-  ProductSaleElementDeleteEvent -> $currency_id $product_sale_element_id   
-  ProductSaleElementEvent -> $product_sale_element   
-  ProductSaleElementUpdateEvent -> $product $product_sale_element_id   


-  TemplateAddAttributeEvent -> $attribute_id $template   
-  TemplateAddFeatureEvent -> $feature_id $template   
-  TemplateCreateEvent -> no constructor found in this file  
-  TemplateDeleteAttributeEvent -> $attribute_id $template   
-  TemplateDeleteEvent -> $template_id   
-  TemplateDeleteFeatureEvent -> $feature_id $template   
-  TemplateDuplicateEvent -> $locale $sourceTemplateId   
- **⚠️ Warning**
 >  TemplateEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Template/TemplateEvent.php
-  TemplateUpdateEvent -> $template_id   


</details>

### Profile 

<details>
<summary>Detail</summary>

**PROFILE_CREATE** = 'action.createProfile'  

**PROFILE_UPDATE** = 'action.updateProfile'  

**PROFILE_DELETE** = 'action.deleteProfile'  

**PROFILE_RESOURCE_ACCESS_UPDATE** = 'action.updateProfileResourceAccess'  

**PROFILE_MODULE_ACCESS_UPDATE** = 'action.updateProfileModuleAccess'  

__________________

-  FileCreateOrUpdateEvent -> $parentId   
-  FileDeleteEvent -> $fileToDelete   
-  FileToggleVisibilityEvent -> $object_id $query   


-  ProfileEvent -> $profile   


</details>

### Sales 

<details>
<summary>Detail</summary>

**SALE_CREATE** = 'action.createSale'  

**SALE_UPDATE** = 'action.updateSale'  

**SALE_DELETE** = 'action.deleteSale'  

**SALE_TOGGLE_ACTIVITY** = 'action.toggleSaleActivity'  

**SALE_CLEAR_SALE_STATUS** = 'action.clearSaleStatus'  

**UPDATE_PRODUCT_SALE_STATUS** = 'action.updateProductSaleStatus'  

**CHECK_SALE_ACTIVATION_EVENT** = 'action.checkSaleActivationEvent'  

__________________

-  ProductSaleStatusUpdateEvent -> no constructor found in this file  
-  SaleActiveStatusCheckEvent -> no constructor found in this file  
-  SaleClearStatusEvent -> no constructor found in this file  
-  SaleCreateEvent -> no constructor found in this file  
-  SaleDeleteEvent -> $saleId   
- **⚠️ Warning**
 >  SaleEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/Sale/SaleEvent.php
-  SaleToggleActivityEvent -> no constructor found in this file  
-  SaleUpdateEvent -> $saleId   


</details>

### Shipping zone 

<details>
<summary>Detail</summary>

**SHIPPING_ZONE_ADD_AREA** = 'action.shippingZone.addArea'  

**SHIPPING_ZONE_REMOVE_AREA** = 'action.shippingZone.removeArea'  

__________________

-  ShippingZoneAddAreaEvent -> $area_id $shipping_zone_id   
-  ShippingZoneRemoveAreaEvent -> no constructor found in this file  


</details>

### State 

<details>
<summary>Detail</summary>

**STATE_CREATE** = 'action.createState'  

**STATE_UPDATE** = 'action.updateState'  

**STATE_DELETE** = 'action.deleteState'  

**STATE_TOGGLE_VISIBILITY** = 'action.toggleCountryVisibility'  

__________________

-  StateCreateEvent -> no constructor found in this file  
-  StateDeleteEvent -> $state_id   
- **⚠️ Warning**
 >  StateEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/State/StateEvent.php
-  StateToggleVisibilityEvent -> no constructor found in this file  
-  StateUpdateEvent -> $state_id   


</details>

### Tax 

<details>
<summary>Detail</summary>

**TAX_CREATE** = 'action.createTax'  

**TAX_UPDATE** = 'action.updateTax'  

**TAX_DELETE** = 'action.deleteTax'  

**TAX_GET_TYPE_SERVICE** = 'action.getTaxService'  

__________________

-  TaxEvent -> $tax   
-  TaxRuleEvent -> $taxRule   


</details>

### Tax rules 

<details>
<summary>Detail</summary>

**TAX_RULE_CREATE** = 'action.createTaxRule'  

**TAX_RULE_UPDATE** = 'action.updateTaxRule'  

**TAX_RULE_DELETE** = 'action.deleteTaxRule'  

**TAX_RULE_SET_DEFAULT** = 'action.setDefaultTaxRule'  

**TAX_RULE_TAXES_UPDATE** = 'action.updateTaxesTaxRule'  

__________________

-  TaxEvent -> $tax   
-  TaxRuleEvent -> $taxRule   


</details>

### Translation 

<details>
<summary>Detail</summary>

**TRANSLATION_GET_STRINGS** = 'action.translation.get_strings'  

**TRANSLATION_WRITE_FILE** = 'action.translation.write_file'  

__________________

-  TranslationEvent -> no constructor found in this file  


</details>

### No classified

<details>
<summary>Detail</summary>

**noCategory** : 
- **⚠️ Warning**
 >  AccessoryEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/AccessoryEvent.php
-  ActionEvent -> no constructor found in this file  
-  CachedFileEvent -> no constructor found in this file  
-  DefaultActionEvent -> no constructor found in this file  
-  ExportEvent -> $archiver $export $serializer   
-  GenerateRewrittenUrlEvent -> $locale $object   
-  ImportEvent -> $import $serializer   
-  IsAdminEnvEvent -> $request   
-  LostPasswordEvent -> $email   
-  PdfEvent -> $content $encoding $fontName $format $lang $marges $orientation $unicode   
-  SessionEvent -> $cacheDir $debug $env   
-  contains -> no constructor found in this file  
-  TheliaFormEvent -> $form   
-  ToggleVisibilityEvent -> $object_id   
-  UpdateFilePositionEvent -> $mode $object_id $position $position; $query   
- **⚠️ Warning**
 >  UpdatePositionEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/UpdatePositionEvent.php
-  UpdateSeoEvent -> $locale $meta_description $meta_keywords $meta_title $object_id $url   
-  ViewCheckEvent -> $view $view_id   


**FeatureProduct** : 
-  FeatureProductDeleteEvent -> $feature_id $product_id   
- **⚠️ Warning**
 >  FeatureProductEvent is **deprecated**, please use thelia/core/lib/Thelia/Core/Event/FeatureProduct/FeatureProductEvent.php
-  FeatureProductUpdateEvent -> $feature_id $feature_value $is_text_value $product_id   


</details>

