"use strict";(self.webpackChunkthelia=self.webpackChunkthelia||[]).push([[9259],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>p});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),m=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=m(e.components);return r.createElement(d.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=m(n),p=a,c=u["".concat(d,".").concat(p)]||u[p]||f[p]||o;return n?r.createElement(c,i(i({ref:t},s),{},{components:n})):r.createElement(c,i({ref:t},s))}));function p(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=u;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var m=2;m<o;m++)i[m]=n[m];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},7697:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>i,default:()=>f,frontMatter:()=>o,metadata:()=>l,toc:()=>m});var r=n(7462),a=(n(7294),n(3905));const o={title:"Forms",sidebar_position:10},i=void 0,l={unversionedId:"forms",id:"forms",title:"Forms",description:"Form definitions",source:"@site/docs/forms.md",sourceDirName:".",slug:"/forms",permalink:"/docs/docs/forms",draft:!1,editUrl:"https://github.com/thelia/docs/edit/main/docs/forms.md",tags:[],version:"current",sidebarPosition:10,frontMatter:{title:"Forms",sidebar_position:10},sidebar:"myAutogeneratedSidebar",previous:{title:"Events",permalink:"/docs/docs/events"},next:{title:"Commands",permalink:"/docs/docs/commands/"}},d={},m=[{value:"Form definitions",id:"form-definitions",level:2},{value:"Usage in templates",id:"usage-in-templates",level:2},{value:"Call your form",id:"call-your-form",level:3},{value:"Display it",id:"display-it",level:3},{value:"Displaying a form field",id:"displaying-a-form-field",level:3},{value:"Custom form field",id:"custom-form-field",level:4},{value:"Auto form field",id:"auto-form-field",level:4},{value:"Display errors",id:"display-errors",level:3},{value:"Hidden fields",id:"hidden-fields",level:3},{value:"Usage in controllers",id:"usage-in-controllers",level:2}],s={toc:m};function f(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"form-definitions"},"Form definitions"),(0,a.kt)("p",null,"To create a new form create a new class that extend ",(0,a.kt)("inlineCode",{parentName:"p"},"BaseForm")," then implement the method ",(0,a.kt)("inlineCode",{parentName:"p"},"buildForm")," to describe your form."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-php"},"<?php\nnamespace Thelia\\Form;\n\nuse Symfony\\Component\\Form\\Extension\\Core\\Type\\IntegerType;\nuse Symfony\\Component\\Validator\\Constraints;\nuse Symfony\\Component\\Validator\\Context\\ExecutionContextInterface;\nuse Thelia\\Core\\Translation\\Translator;\nuse Thelia\\Model\\AddressQuery;\nuse Thelia\\Model\\ModuleQuery;\nuse Thelia\\Module\\BaseModule;\n\nclass OrderDeliveryForm extends BaseForm\n{\n    protected function buildForm(): void\n    {\n        $this->formBuilder\n            ->add('delivery-address', IntegerType::class, [\n                'required' => true,\n                'constraints' => [\n                    new Constraints\\NotBlank(),\n                    new Constraints\\Callback(\n                        [$this, 'verifyDeliveryAddress']\n                    ),\n                ],\n            ])\n            ->add('delivery-module', IntegerType::class, [\n                'required' => true,\n                'constraints' => [\n                    new Constraints\\NotBlank(),\n                    new Constraints\\Callback(\n                        [$this, 'verifyDeliveryModule']\n                    ),\n                ],\n            ]);\n    }\n\n    public function verifyDeliveryAddress($value, ExecutionContextInterface $context): void\n    {\n        $address = AddressQuery::create()\n            ->findPk($value);\n\n        if (null === $address) {\n            $context->addViolation(Translator::getInstance()->trans('Address ID not found'));\n        }\n    }\n\n    public function verifyDeliveryModule($value, ExecutionContextInterface $context): void\n    {\n        $module = ModuleQuery::create()\n            ->filterActivatedByTypeAndId(BaseModule::DELIVERY_MODULE_TYPE, $value)\n            ->findOne();\n\n        if (null === $module) {\n            $context->addViolation(Translator::getInstance()->trans('Delivery module ID not found'));\n        } elseif (!$module->isDeliveryModule()) {\n            $context->addViolation(\n                sprintf(Translator::getInstance()->trans(\"delivery module %s is not a Thelia\\Module\\DeliveryModuleInterface\"), $module->getCode())\n            );\n        }\n    }\n}\n")),(0,a.kt)("p",null,"For more information about field types you can refer to ",(0,a.kt)("a",{parentName:"p",href:"https://symfony.com/doc/current/reference/forms/types.html"},"Symfony form type documentation")),(0,a.kt)("h2",{id:"usage-in-templates"},"Usage in templates"),(0,a.kt)("p",null,"To display the form in your template you will need the form name, it is the full namespace and the class of your form in snake_case.\nFor example the form name for ",(0,a.kt)("inlineCode",{parentName:"p"},"YourModule\\Form\\SomethingForm.php")," will be ",(0,a.kt)("inlineCode",{parentName:"p"},"your_module_form_something_form"),"\nIt can be modified with the static function ",(0,a.kt)("inlineCode",{parentName:"p"},"getName")," but we do not advise to do that,\nbecause it's more simple to guess a form name by reading is namespace than going in to the class and looking the method.\nIt also guarantees a unique name for your form."),(0,a.kt)("h3",{id:"call-your-form"},"Call your form"),(0,a.kt)("p",null,"First of all you have to call the form you need by using the form block :"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'    {form name="thelia_form_order_delivery_form"}\n        ...\n    {/form}\n')),(0,a.kt)("p",null,"The form reference is now available in the ",(0,a.kt)("inlineCode",{parentName:"p"},"$form")," variable."),(0,a.kt)("h3",{id:"display-it"},"Display it"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'    {form name="thelia_form_order_delivery_form"}\n        <form method="post" action="{url path=\'your/target\'}" {form_enctype form=$form}>\n        ...\n        </form>\n    {/form}\n')),(0,a.kt)("h3",{id:"displaying-a-form-field"},"Displaying a form field"),(0,a.kt)("h4",{id:"custom-form-field"},"Custom form field"),(0,a.kt)("p",null,"For displaying a field, you have to use the ",(0,a.kt)("inlineCode",{parentName:"p"},"{form_field}")," block, and put the name of the field you want to display in the \u201cfield\u201d parameter :"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'{form name="thelia_form_order_delivery_form"}\n    <form method="post" action="{url path=\'your/target\'}" {form_enctype form=$form} >\n        {form_hidden_fields form=$form}\n\n        {form_field form=$form field="firstname"}\n           <label>{intl l="{$label}"}</label>\n           <input type="text" name="{$name}" value="{$value}" {$attr} />\n        {/form_field}\n\n        {form_field form=$form field="delivery_options"}\n            <select name="{$name}">\n                {foreach $choices as $choice}\n                    <option value="{$choice->value}">{$choice->label}</option> \n                {/foreach}\n            </select>\n        {/form_field}\n    </form>\n{/form}\n')),(0,a.kt)("p",null,"Values available in the ",(0,a.kt)("inlineCode",{parentName:"p"},"{form_field}")," block :"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$name")," : field\u2019s name used in the name part of your input"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$value")," : default value to display"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$data")," : the form definition data attribute"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$type")," : the field type, as defined in the form definition (choice, radio, number, text, textarea, etc.)"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$checked")," : the checked status (true / false) of a radio or checkbox field"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$multiple")," : true if a select field may have multiple selected values"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$disabled")," : true if the field is disabled, false otherwise"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$read_only")," : true if the fiedl is read only, false otherwise"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$max_length")," : the maximum length of the field"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$required")," : true if the field is required, false otherwise"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$label")," : label for this field, can be used in label html tag for example"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$attr")," : all the attributes defined in your form class, can be any HTML attributes, such as an id, or any other attribute such as HTML5 form validation for example"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$attr_list")," : the \u2018attr\u2019 array of form definition"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$options")," : all the options available for this field. This variable is a PHP array."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$error")," : true if validation error has been detected on the field"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$message")," : the error message, defined if $error is true, empty otherwise."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"$choices")," : an array of available choices. $choices is available only if your field has defined choices.")),(0,a.kt)("h4",{id:"auto-form-field"},"Auto form field"),(0,a.kt)("p",null,"To speed up writing form in templates Thelia provide a Smarty plugin ",(0,a.kt)("inlineCode",{parentName:"p"},"render_form_field")," which automatically generates the field HTML code, and all the related code, such as formatting and error reporting."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'{form name="thelia_form_order_delivery_form"}\n    <form method="post" action="{url path=\'your/target\'}" {form_enctype form=$form} >\n        {form_hidden_fields form=$form}\n\n        {render_form_field form=$form field="firstname"}\n        {render_form_field form=$form field="delivery_options"}\n    </form>\n{/form}\n')),(0,a.kt)("h3",{id:"display-errors"},"Display errors"),(0,a.kt)("p",null,"If your form contains some errors, it automatically displays the value already sent by the user and then can display a message for each fields containing errors. The ",(0,a.kt)("inlineCode",{parentName:"p"},"{form_field_error}")," is used, and it works like the ",(0,a.kt)("inlineCode",{parentName:"p"},"{form_field}")," block. You can call it outside the ",(0,a.kt)("inlineCode",{parentName:"p"},"{form_field}")," block :"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'{form name="thelia_form_order_delivery_form"}\n    <form method="post" action="{url path=\'your/target\'}" {form_enctype form=$form} >\n        {form_hidden_fields form=$form}\n\n        {form_field form=$form field="firstname"}\n            {form_error form=$form.firstname}\n                {$message}\n            {/form_error}\n\n            <label>{intl l="{$label}"}</label>\n           <input type="text" name="{$name}" value="{$value}" {$attr} />\n        {/form_field}\n    </form>\n{/form}\n')),(0,a.kt)("h3",{id:"hidden-fields"},"Hidden fields"),(0,a.kt)("p",null,"Thelia uses hidden fields internally. In order to display these fields (and all the hidden fields defined in your form), use the ",(0,a.kt)("inlineCode",{parentName:"p"},"form_hidden_fields")," plugin.",(0,a.kt)("br",{parentName:"p"}),"\n","Don\u2019t forget this, as it contains the CRSF validation data :"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-smarty"},'{form name="thelia_form_order_delivery_form"}\n    <form method="post" action="{url path=\'your/target\'}" {form_enctype form=$form} >\n         {form_hidden_fields form=$form}\n            ...\n    </form>\n{/form}\n')),(0,a.kt)("h2",{id:"usage-in-controllers"},"Usage in controllers"),(0,a.kt)("p",null,"Form are useful to validate data submitted by users. This is done by two functions in controllers :"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"createForm")," that create a form object"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"validateForm")," that validate form data")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-php"},"<?php\n\nnamespace Front\\Controller;\n\nclass OrderController extends BaseFrontController\n{\n    public function submitRoute()\n    {\n        $form = $this->createForm(OrderDeliveryForm::getName);\n        \n       try {\n            $data = $this->validateForm($form)->getData();\n\n            // Do what you want with submitted data\n\n        } catch (\\Exception $e) {\n           // Do something when the form is not valid\n        }\n    }\n}\n")))}f.isMDXComponent=!0}}]);