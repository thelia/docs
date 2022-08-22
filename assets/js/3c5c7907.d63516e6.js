"use strict";(self.webpackChunkthelia=self.webpackChunkthelia||[]).push([[1077],{3905:(t,e,r)=>{r.d(e,{Zo:()=>d,kt:()=>c});var n=r(7294);function a(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function l(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function o(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?l(Object(r),!0).forEach((function(e){a(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function i(t,e){if(null==t)return{};var r,n,a=function(t,e){if(null==t)return{};var r,n,a={},l=Object.keys(t);for(n=0;n<l.length;n++)r=l[n],e.indexOf(r)>=0||(a[r]=t[r]);return a}(t,e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(t);for(n=0;n<l.length;n++)r=l[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(a[r]=t[r])}return a}var p=n.createContext({}),m=function(t){var e=n.useContext(p),r=e;return t&&(r="function"==typeof t?t(e):o(o({},e),t)),r},d=function(t){var e=m(t.components);return n.createElement(p.Provider,{value:e},t.children)},s={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},u=n.forwardRef((function(t,e){var r=t.components,a=t.mdxType,l=t.originalType,p=t.parentName,d=i(t,["components","mdxType","originalType","parentName"]),u=m(r),c=a,f=u["".concat(p,".").concat(c)]||u[c]||s[c]||l;return r?n.createElement(f,o(o({ref:e},d),{},{components:r})):n.createElement(f,o({ref:e},d))}));function c(t,e){var r=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var l=r.length,o=new Array(l);o[0]=u;var i={};for(var p in e)hasOwnProperty.call(e,p)&&(i[p]=e[p]);i.originalType=t,i.mdxType="string"==typeof t?t:a,o[1]=i;for(var m=2;m<l;m++)o[m]=r[m];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},3517:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>p,contentTitle:()=>o,default:()=>s,frontMatter:()=>l,metadata:()=>i,toc:()=>m});var n=r(7462),a=(r(7294),r(3905));const l={title:"Admin"},o=void 0,i={unversionedId:"loops/Admin",id:"loops/Admin",title:"Admin",description:"Admin loop displays admins information.",source:"@site/docs/loops/Admin.md",sourceDirName:"loops",slug:"/loops/Admin",permalink:"/docs/docs/loops/Admin",draft:!1,editUrl:"https://github.com/thelia/docs/edit/main/docs/loops/Admin.md",tags:[],version:"current",frontMatter:{title:"Admin"},sidebar:"myAutogeneratedSidebar",previous:{title:"Address",permalink:"/docs/docs/loops/Address"},next:{title:"Area",permalink:"/docs/docs/loops/Area"}},p={},m=[{value:"Arguments",id:"pse-arguments",level:2},{value:"Outputs",id:"outputs",level:2}],d={toc:m};function s(t){let{components:e,...r}=t;return(0,a.kt)("wrapper",(0,n.Z)({},d,r,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Admin loop displays admins information.",(0,a.kt)("br",{parentName:"p"}),"\n",(0,a.kt)("inlineCode",{parentName:"p"},'{loop type="admin" name="the-loop-name" [argument="value"], [...]}')),(0,a.kt)("h2",{id:"pse-arguments"},"Arguments"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Argument"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"),(0,a.kt)("th",{parentName:"tr",align:"center"},"Default"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Example"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"id"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A single or a list of admin ids."),(0,a.kt)("td",{parentName:"tr",align:"center"}),(0,a.kt)("td",{parentName:"tr",align:"left"},'id="2", id="1,4,7"')),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"profile"),(0,a.kt)("td",{parentName:"tr",align:"left"},"A single or a list of profile ids."),(0,a.kt)("td",{parentName:"tr",align:"center"}),(0,a.kt)("td",{parentName:"tr",align:"left"},'profile="2", profile="1,4,7"')))),(0,a.kt)("p",null,"Plus the ",(0,a.kt)("a",{parentName:"p",href:"./global_arguments"},"global arguments")),(0,a.kt)("h2",{id:"outputs"},"Outputs"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Variable"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Value"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$FIRSTNAME"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin firstname")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$ID"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin id")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$LASTNAME"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin lastname")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$LOCALE"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin locale")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$LOGIN"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin login")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"$PROFILE"),(0,a.kt)("td",{parentName:"tr",align:"left"},"the admin profile id")))),(0,a.kt)("p",null,"Plus the ",(0,a.kt)("a",{parentName:"p",href:"./global_arguments"},"global outputs")))}s.isMDXComponent=!0}}]);