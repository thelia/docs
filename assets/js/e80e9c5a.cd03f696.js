"use strict";(self.webpackChunkthelia=self.webpackChunkthelia||[]).push([[4731],{3905:(t,e,r)=>{r.d(e,{Zo:()=>u,kt:()=>b});var a=r(7294);function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,a)}return r}function l(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?o(Object(r),!0).forEach((function(e){n(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function i(t,e){if(null==t)return{};var r,a,n=function(t,e){if(null==t)return{};var r,a,n={},o=Object.keys(t);for(a=0;a<o.length;a++)r=o[a],e.indexOf(r)>=0||(n[r]=t[r]);return n}(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(a=0;a<o.length;a++)r=o[a],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(n[r]=t[r])}return n}var p=a.createContext({}),d=function(t){var e=a.useContext(p),r=e;return t&&(r="function"==typeof t?t(e):l(l({},e),t)),r},u=function(t){var e=d(t.components);return a.createElement(p.Provider,{value:e},t.children)},c={inlineCode:"code",wrapper:function(t){var e=t.children;return a.createElement(a.Fragment,{},e)}},m=a.forwardRef((function(t,e){var r=t.components,n=t.mdxType,o=t.originalType,p=t.parentName,u=i(t,["components","mdxType","originalType","parentName"]),m=d(r),b=n,s=m["".concat(p,".").concat(b)]||m[b]||c[b]||o;return r?a.createElement(s,l(l({ref:e},u),{},{components:r})):a.createElement(s,l({ref:e},u))}));function b(t,e){var r=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var o=r.length,l=new Array(o);l[0]=m;var i={};for(var p in e)hasOwnProperty.call(e,p)&&(i[p]=e[p]);i.originalType=t,i.mdxType="string"==typeof t?t:n,l[1]=i;for(var d=2;d<o;d++)l[d]=r[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}m.displayName="MDXCreateElement"},6804:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>p,contentTitle:()=>l,default:()=>c,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var a=r(7462),n=(r(7294),r(3905));const o={title:"Order product attribute combination"},l=void 0,i={unversionedId:"loops/OrderProductAttributeCombination",id:"loops/OrderProductAttributeCombination",title:"Order product attribute combination",description:"Order product attribute combination loop lists order product attribute combinations.",source:"@site/docs/loops/OrderProductAttributeCombination.md",sourceDirName:"loops",slug:"/loops/OrderProductAttributeCombination",permalink:"/docs/docs/loops/OrderProductAttributeCombination",draft:!1,editUrl:"https://github.com/thelia/docs/edit/main/docs/loops/OrderProductAttributeCombination.md",tags:[],version:"current",frontMatter:{title:"Order product attribute combination"},sidebar:"myAutogeneratedSidebar",previous:{title:"Order product",permalink:"/docs/docs/loops/OrderProduct"},next:{title:"Order product tax",permalink:"/docs/docs/loops/OrderProductTax"}},p={},d=[{value:"Arguments",id:"order-arguments",level:2},{value:"Outputs",id:"outputs",level:2}],u={toc:d};function c(t){let{components:e,...r}=t;return(0,n.kt)("wrapper",(0,a.Z)({},u,r,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Order product attribute combination loop lists order product attribute combinations.",(0,n.kt)("br",{parentName:"p"}),"\n",(0,n.kt)("inlineCode",{parentName:"p"},'{loop type="order_product_attribute_combination" name="the-loop-name" [argument="value"], [...]}')),(0,n.kt)("h2",{id:"order-arguments"},"Arguments"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:null},"Argument"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"),(0,n.kt)("th",{parentName:"tr",align:"center"},"Default"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Example"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"order"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A list of values ",(0,n.kt)("br",null)," Expected values : ",(0,n.kt)("br",null)," - alpha : alphabetical order on order product attribute title ",(0,n.kt)("br",null)," - alpha_reverse : reverse alphabetical order on order product attribute title"),(0,n.kt)("td",{parentName:"tr",align:"center"},"alpha"),(0,n.kt)("td",{parentName:"tr",align:"left"},'order="alpha_reverse"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"order_product *"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A single order product id."),(0,n.kt)("td",{parentName:"tr",align:"center"}),(0,n.kt)("td",{parentName:"tr",align:"left"},'order_product="2"')))),(0,n.kt)("p",null,"Plus the ",(0,n.kt)("a",{parentName:"p",href:"./global_arguments"},"global arguments")," "),(0,n.kt)("h2",{id:"outputs"},"Outputs"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Variable"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Value"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_AVAILABILITY_CHAPO"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute availability chapo")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_AVAILABILITY_DESCRIPTION"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute availability description")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_AVAILABILITY_POSTSCRIPTUM"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute availability postscriptum")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_AVAILABILITY_TITLE"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute availability title")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_CHAPO"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute chapo")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_DESCRIPTION"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute description")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_POSTSCRIPTUM"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute postscriptum")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ATTRIBUTE_TITLE"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute title")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ID"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order product attribute combination ID")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ORDER_PRODUCT_ID"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the related order product ID")))),(0,n.kt)("p",null,"Plus the ",(0,n.kt)("a",{parentName:"p",href:"./global_arguments"},"global outputs")))}c.isMDXComponent=!0}}]);