"use strict";(self.webpackChunkthelia=self.webpackChunkthelia||[]).push([[8850],{3905:(t,e,r)=>{r.d(e,{Zo:()=>u,kt:()=>m});var n=r(7294);function a(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function i(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function o(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?i(Object(r),!0).forEach((function(e){a(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function l(t,e){if(null==t)return{};var r,n,a=function(t,e){if(null==t)return{};var r,n,a={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(a[r]=t[r]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(a[r]=t[r])}return a}var c=n.createContext({}),s=function(t){var e=n.useContext(c),r=e;return t&&(r="function"==typeof t?t(e):o(o({},e),t)),r},u=function(t){var e=s(t.components);return n.createElement(c.Provider,{value:e},t.children)},p={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},d=n.forwardRef((function(t,e){var r=t.components,a=t.mdxType,i=t.originalType,c=t.parentName,u=l(t,["components","mdxType","originalType","parentName"]),d=s(r),m=a,f=d["".concat(c,".").concat(m)]||d[m]||p[m]||i;return r?n.createElement(f,o(o({ref:e},u),{},{components:r})):n.createElement(f,o({ref:e},u))}));function m(t,e){var r=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=r.length,o=new Array(i);o[0]=d;var l={};for(var c in e)hasOwnProperty.call(e,c)&&(l[c]=e[c]);l.originalType=t,l.mdxType="string"==typeof t?t:a,o[1]=l;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},6537:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>c,contentTitle:()=>o,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var n=r(7462),a=(r(7294),r(3905));const i={},o=void 0,l={unversionedId:"smarty_plugins/substitutions/{cart}",id:"smarty_plugins/substitutions/{cart}",title:"{cart}",description:"Cart Substitution provides data for the current cart in session.",source:"@site/docs/smarty_plugins/substitutions/{cart}.md",sourceDirName:"smarty_plugins/substitutions",slug:"/smarty_plugins/substitutions/{cart}",permalink:"/docs/docs/smarty_plugins/substitutions/{cart}",draft:!1,editUrl:"https://github.com/thelia/docs/edit/main/docs/smarty_plugins/substitutions/{cart}.md",tags:[],version:"current",frontMatter:{},sidebar:"myAutogeneratedSidebar",previous:{title:"{admin}",permalink:"/docs/docs/smarty_plugins/substitutions/{admin}"},next:{title:"{category}",permalink:"/docs/docs/smarty_plugins/substitutions/{category}"}},c={},s=[{value:"Attributes",id:"attributes",level:2}],u={toc:s};function p(t){let{components:e,...r}=t;return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Cart Substitution provides data for the current cart in session.",(0,a.kt)("br",{parentName:"p"}),"\n",(0,a.kt)("inlineCode",{parentName:"p"},'{cart attr="one_of_the_following"}')),(0,a.kt)("h2",{id:"attributes"},"Attributes"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Attribute name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Data returned"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"contains_virtual_product")," OR ",(0,a.kt)("inlineCode",{parentName:"td"},"is_virtual")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"true")," if the cart contains at least one virtual product, ",(0,a.kt)("inlineCode",{parentName:"td"},"false")," otherwise")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"item_count")," OR ",(0,a.kt)("inlineCode",{parentName:"td"},"count_item")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The number of items in the cart. A cart with 2 x product X and 3 x product Y have 5 items")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"total_price_with_discount")," OR ",(0,a.kt)("inlineCode",{parentName:"td"},"total_price")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Total cart amount in the current currency, without taxes, including discount")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"total_price_without_discount")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Total cart amount in the current currency, without taxes, excluding discount")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"total_taxed_price_with_discount")," OR ",(0,a.kt)("inlineCode",{parentName:"td"},"total_taxed_price")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Total cart amount in the current currency with taxes, and including the discount")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"total_taxed_price_without_discount")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Total price with discount without taxes")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"weight")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The cart total weight, in kg")))))}p.isMDXComponent=!0}}]);