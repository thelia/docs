"use strict";(self.webpackChunkthelia=self.webpackChunkthelia||[]).push([[852],{3905:(t,e,a)=>{a.d(e,{Zo:()=>m,kt:()=>s});var r=a(7294);function n(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function l(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,r)}return a}function o(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?l(Object(a),!0).forEach((function(e){n(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function p(t,e){if(null==t)return{};var a,r,n=function(t,e){if(null==t)return{};var a,r,n={},l=Object.keys(t);for(r=0;r<l.length;r++)a=l[r],e.indexOf(a)>=0||(n[a]=t[a]);return n}(t,e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(t);for(r=0;r<l.length;r++)a=l[r],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}var i=r.createContext({}),d=function(t){var e=r.useContext(i),a=e;return t&&(a="function"==typeof t?t(e):o(o({},e),t)),a},m=function(t){var e=d(t.components);return r.createElement(i.Provider,{value:e},t.children)},g={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},u=r.forwardRef((function(t,e){var a=t.components,n=t.mdxType,l=t.originalType,i=t.parentName,m=p(t,["components","mdxType","originalType","parentName"]),u=d(a),s=n,f=u["".concat(i,".").concat(s)]||u[s]||g[s]||l;return a?r.createElement(f,o(o({ref:e},m),{},{components:a})):r.createElement(f,o({ref:e},m))}));function s(t,e){var a=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var l=a.length,o=new Array(l);o[0]=u;var p={};for(var i in e)hasOwnProperty.call(e,i)&&(p[i]=e[i]);p.originalType=t,p.mdxType="string"==typeof t?t:n,o[1]=p;for(var d=2;d<l;d++)o[d]=a[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},4843:(t,e,a)=>{a.r(e),a.d(e,{assets:()=>i,contentTitle:()=>o,default:()=>g,frontMatter:()=>l,metadata:()=>p,toc:()=>d});var r=a(7462),n=(a(7294),a(3905));const l={title:"Lang"},o=void 0,p={unversionedId:"loops/Lang",id:"loops/Lang",title:"Lang",description:"Lang loop.",source:"@site/docs/loops/Lang.md",sourceDirName:"loops",slug:"/loops/Lang",permalink:"/docs/docs/loops/Lang",draft:!1,editUrl:"https://github.com/thelia/docs/edit/main/docs/loops/Lang.md",tags:[],version:"current",frontMatter:{title:"Lang"},sidebar:"myAutogeneratedSidebar",previous:{title:"Import Category",permalink:"/docs/docs/loops/ImportCategory"},next:{title:"Module",permalink:"/docs/docs/loops/Module"}},i={},d=[{value:"Arguments",id:"lang-arguments",level:2},{value:"Outputs",id:"outputs",level:2},{value:"Order possible values",id:"lang-order-possible-values",level:2}],m={toc:d};function g(t){let{components:e,...a}=t;return(0,n.kt)("wrapper",(0,r.Z)({},m,a,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Lang loop.",(0,n.kt)("br",{parentName:"p"}),"\n",(0,n.kt)("inlineCode",{parentName:"p"},'{loop type="lang" name="the-loop-name" [argument="value"], [...]}')),(0,n.kt)("h2",{id:"lang-arguments"},"Arguments"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:null},"Argument"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"),(0,n.kt)("th",{parentName:"tr",align:"center"},"Default"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Example"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"code"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A single or list of lang code."),(0,n.kt)("td",{parentName:"tr",align:"center"}),(0,n.kt)("td",{parentName:"tr",align:"left"},'code="fr", code="fr,en"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"default_only"),(0,n.kt)("td",{parentName:"tr",align:"left"},"returns only the default language"),(0,n.kt)("td",{parentName:"tr",align:"center"},"false"),(0,n.kt)("td",{parentName:"tr",align:"left"},'default_only="true"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"exclude"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A single or list of lang ids."),(0,n.kt)("td",{parentName:"tr",align:"center"}),(0,n.kt)("td",{parentName:"tr",align:"left"},'exclude="2", exclude="1,3"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"exclude_default"),(0,n.kt)("td",{parentName:"tr",align:"left"},"exclude the default language from results"),(0,n.kt)("td",{parentName:"tr",align:"center"},"false"),(0,n.kt)("td",{parentName:"tr",align:"left"},'exclude_default="true"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"id"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A single or list of lang ids."),(0,n.kt)("td",{parentName:"tr",align:"center"}),(0,n.kt)("td",{parentName:"tr",align:"left"},'id="2"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"locale"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A single or list of lang locale."),(0,n.kt)("td",{parentName:"tr",align:"center"}),(0,n.kt)("td",{parentName:"tr",align:"left"},'code="fr_FR", code="fr_FR,fr_CA"')),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"order"),(0,n.kt)("td",{parentName:"tr",align:"left"},"A list of values see ",(0,n.kt)("a",{parentName:"td",href:"#lang-order-possible-values"},"sorting possible values")),(0,n.kt)("td",{parentName:"tr",align:"center"},"position"),(0,n.kt)("td",{parentName:"tr",align:"left"},'order="alpha_reverse"')))),(0,n.kt)("p",null,"Plus the ",(0,n.kt)("a",{parentName:"p",href:"./global_arguments"},"global arguments")),(0,n.kt)("h2",{id:"outputs"},"Outputs"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Variable"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Value"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$CODE"),(0,n.kt)("td",{parentName:"tr",align:"left"},"lang code, example : fr")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$DATE_FORMAT"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the lang date format")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$DECIMAL_COUNT"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the number of digits after the decimal separator")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$DECIMAL_SEPARATOR"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the lang decimal separator, such as , or .")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$ID"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the order id")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$IS_DEFAULT"),(0,n.kt)("td",{parentName:"tr",align:"left"},"check if the current result is the default one")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$LOCALE"),(0,n.kt)("td",{parentName:"tr",align:"left"},"lang locale, example : fr_FR")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$POSITION"),(0,n.kt)("td",{parentName:"tr",align:"left"},"lang position")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$THOUSANDS_SEPARATOR"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the lang thousangs separator")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$TIME_FORMAT"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the lang time format")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$TITLE"),(0,n.kt)("td",{parentName:"tr",align:"left"},"lang title")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"$URL"),(0,n.kt)("td",{parentName:"tr",align:"left"},"the lang URL, only if a specific URL is defined for each lang")))),(0,n.kt)("p",null,"Plus the ",(0,n.kt)("a",{parentName:"p",href:"./global_arguments"},"global outputs")),(0,n.kt)("h2",{id:"lang-order-possible-values"},"Order possible values"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"#lang-arguments"},"Arguments")),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:null},"Ascending value"),(0,n.kt)("th",{parentName:"tr",align:null},"Descending value"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Sorted fields"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"alpha"),(0,n.kt)("td",{parentName:"tr",align:null},"alpha_reverse"),(0,n.kt)("td",{parentName:"tr",align:"left"},"title")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"id"),(0,n.kt)("td",{parentName:"tr",align:null},"id_reverse"),(0,n.kt)("td",{parentName:"tr",align:"left"},"Id")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:null},"position"),(0,n.kt)("td",{parentName:"tr",align:null},"position_reverse"),(0,n.kt)("td",{parentName:"tr",align:"left"},"position")))))}g.isMDXComponent=!0}}]);