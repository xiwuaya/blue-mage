var Ne=Object.defineProperty;var Oe=(e,t,n)=>t in e?Ne(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var Be=(e,t,n)=>(Oe(e,typeof t!="symbol"?t+"":t,n),n);const p$1=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}};p$1();function makeMap(e,t){const n=Object.create(null),o=e.split(",");for(let r=0;r<o.length;r++)n[o[r]]=!0;return t?r=>!!n[r.toLowerCase()]:r=>!!n[r]}function normalizeStyle(e){if(isArray(e)){const t={};for(let n=0;n<e.length;n++){const o=e[n],r=isString(o)?parseStringStyle(o):normalizeStyle(o);if(r)for(const i in r)t[i]=r[i]}return t}else{if(isString(e))return e;if(isObject(e))return e}}const listDelimiterRE=/;(?![^(]*\))/g,propertyDelimiterRE=/:([^]+)/,styleCommentRE=/\/\*.*?\*\//gs;function parseStringStyle(e){const t={};return e.replace(styleCommentRE,"").split(listDelimiterRE).forEach(n=>{if(n){const o=n.split(propertyDelimiterRE);o.length>1&&(t[o[0].trim()]=o[1].trim())}}),t}function normalizeClass(e){let t="";if(isString(e))t=e;else if(isArray(e))for(let n=0;n<e.length;n++){const o=normalizeClass(e[n]);o&&(t+=o+" ")}else if(isObject(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const specialBooleanAttrs="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",isSpecialBooleanAttr=makeMap(specialBooleanAttrs);function includeBooleanAttr(e){return!!e||e===""}const toDisplayString=e=>isString(e)?e:e==null?"":isArray(e)||isObject(e)&&(e.toString===objectToString||!isFunction(e.toString))?JSON.stringify(e,replacer,2):String(e),replacer=(e,t)=>t&&t.__v_isRef?replacer(e,t.value):isMap(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((n,[o,r])=>(n[`${o} =>`]=r,n),{})}:isSet(t)?{[`Set(${t.size})`]:[...t.values()]}:isObject(t)&&!isArray(t)&&!isPlainObject(t)?String(t):t,EMPTY_OBJ={},EMPTY_ARR=[],NOOP=()=>{},NO=()=>!1,onRE=/^on[^a-z]/,isOn=e=>onRE.test(e),isModelListener=e=>e.startsWith("onUpdate:"),extend=Object.assign,remove=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},hasOwnProperty$1=Object.prototype.hasOwnProperty,hasOwn=(e,t)=>hasOwnProperty$1.call(e,t),isArray=Array.isArray,isMap=e=>toTypeString(e)==="[object Map]",isSet=e=>toTypeString(e)==="[object Set]",isFunction=e=>typeof e=="function",isString=e=>typeof e=="string",isSymbol=e=>typeof e=="symbol",isObject=e=>e!==null&&typeof e=="object",isPromise=e=>isObject(e)&&isFunction(e.then)&&isFunction(e.catch),objectToString=Object.prototype.toString,toTypeString=e=>objectToString.call(e),toRawType=e=>toTypeString(e).slice(8,-1),isPlainObject=e=>toTypeString(e)==="[object Object]",isIntegerKey=e=>isString(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,isReservedProp=makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),cacheStringFunction=e=>{const t=Object.create(null);return n=>t[n]||(t[n]=e(n))},camelizeRE=/-(\w)/g,camelize=cacheStringFunction(e=>e.replace(camelizeRE,(t,n)=>n?n.toUpperCase():"")),hyphenateRE=/\B([A-Z])/g,hyphenate=cacheStringFunction(e=>e.replace(hyphenateRE,"-$1").toLowerCase()),capitalize=cacheStringFunction(e=>e.charAt(0).toUpperCase()+e.slice(1)),toHandlerKey=cacheStringFunction(e=>e?`on${capitalize(e)}`:""),hasChanged=(e,t)=>!Object.is(e,t),invokeArrayFns=(e,t)=>{for(let n=0;n<e.length;n++)e[n](t)},def=(e,t,n)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,value:n})},looseToNumber=e=>{const t=parseFloat(e);return isNaN(t)?e:t},toNumber=e=>{const t=isString(e)?Number(e):NaN;return isNaN(t)?e:t};let _globalThis;const getGlobalThis=()=>_globalThis||(_globalThis=typeof globalThis!="undefined"?globalThis:typeof self!="undefined"?self:typeof window!="undefined"?window:typeof global!="undefined"?global:{});let activeEffectScope;class EffectScope{constructor(t=!1){this.detached=t,this._active=!0,this.effects=[],this.cleanups=[],this.parent=activeEffectScope,!t&&activeEffectScope&&(this.index=(activeEffectScope.scopes||(activeEffectScope.scopes=[])).push(this)-1)}get active(){return this._active}run(t){if(this._active){const n=activeEffectScope;try{return activeEffectScope=this,t()}finally{activeEffectScope=n}}}on(){activeEffectScope=this}off(){activeEffectScope=this.parent}stop(t){if(this._active){let n,o;for(n=0,o=this.effects.length;n<o;n++)this.effects[n].stop();for(n=0,o=this.cleanups.length;n<o;n++)this.cleanups[n]();if(this.scopes)for(n=0,o=this.scopes.length;n<o;n++)this.scopes[n].stop(!0);if(!this.detached&&this.parent&&!t){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0,this._active=!1}}}function recordEffectScope(e,t=activeEffectScope){t&&t.active&&t.effects.push(e)}function getCurrentScope(){return activeEffectScope}const createDep=e=>{const t=new Set(e);return t.w=0,t.n=0,t},wasTracked=e=>(e.w&trackOpBit)>0,newTracked=e=>(e.n&trackOpBit)>0,initDepMarkers=({deps:e})=>{if(e.length)for(let t=0;t<e.length;t++)e[t].w|=trackOpBit},finalizeDepMarkers=e=>{const{deps:t}=e;if(t.length){let n=0;for(let o=0;o<t.length;o++){const r=t[o];wasTracked(r)&&!newTracked(r)?r.delete(e):t[n++]=r,r.w&=~trackOpBit,r.n&=~trackOpBit}t.length=n}},targetMap=new WeakMap;let effectTrackDepth=0,trackOpBit=1;const maxMarkerBits=30;let activeEffect;const ITERATE_KEY=Symbol(""),MAP_KEY_ITERATE_KEY=Symbol("");class ReactiveEffect{constructor(t,n=null,o){this.fn=t,this.scheduler=n,this.active=!0,this.deps=[],this.parent=void 0,recordEffectScope(this,o)}run(){if(!this.active)return this.fn();let t=activeEffect,n=shouldTrack;for(;t;){if(t===this)return;t=t.parent}try{return this.parent=activeEffect,activeEffect=this,shouldTrack=!0,trackOpBit=1<<++effectTrackDepth,effectTrackDepth<=maxMarkerBits?initDepMarkers(this):cleanupEffect(this),this.fn()}finally{effectTrackDepth<=maxMarkerBits&&finalizeDepMarkers(this),trackOpBit=1<<--effectTrackDepth,activeEffect=this.parent,shouldTrack=n,this.parent=void 0,this.deferStop&&this.stop()}}stop(){activeEffect===this?this.deferStop=!0:this.active&&(cleanupEffect(this),this.onStop&&this.onStop(),this.active=!1)}}function cleanupEffect(e){const{deps:t}=e;if(t.length){for(let n=0;n<t.length;n++)t[n].delete(e);t.length=0}}let shouldTrack=!0;const trackStack=[];function pauseTracking(){trackStack.push(shouldTrack),shouldTrack=!1}function resetTracking(){const e=trackStack.pop();shouldTrack=e===void 0?!0:e}function track(e,t,n){if(shouldTrack&&activeEffect){let o=targetMap.get(e);o||targetMap.set(e,o=new Map);let r=o.get(n);r||o.set(n,r=createDep()),trackEffects(r)}}function trackEffects(e,t){let n=!1;effectTrackDepth<=maxMarkerBits?newTracked(e)||(e.n|=trackOpBit,n=!wasTracked(e)):n=!e.has(activeEffect),n&&(e.add(activeEffect),activeEffect.deps.push(e))}function trigger(e,t,n,o,r,i){const l=targetMap.get(e);if(!l)return;let a=[];if(t==="clear")a=[...l.values()];else if(n==="length"&&isArray(e)){const s=Number(o);l.forEach((u,_)=>{(_==="length"||_>=s)&&a.push(u)})}else switch(n!==void 0&&a.push(l.get(n)),t){case"add":isArray(e)?isIntegerKey(n)&&a.push(l.get("length")):(a.push(l.get(ITERATE_KEY)),isMap(e)&&a.push(l.get(MAP_KEY_ITERATE_KEY)));break;case"delete":isArray(e)||(a.push(l.get(ITERATE_KEY)),isMap(e)&&a.push(l.get(MAP_KEY_ITERATE_KEY)));break;case"set":isMap(e)&&a.push(l.get(ITERATE_KEY));break}if(a.length===1)a[0]&&triggerEffects(a[0]);else{const s=[];for(const u of a)u&&s.push(...u);triggerEffects(createDep(s))}}function triggerEffects(e,t){const n=isArray(e)?e:[...e];for(const o of n)o.computed&&triggerEffect(o);for(const o of n)o.computed||triggerEffect(o)}function triggerEffect(e,t){(e!==activeEffect||e.allowRecurse)&&(e.scheduler?e.scheduler():e.run())}const isNonTrackableKeys=makeMap("__proto__,__v_isRef,__isVue"),builtInSymbols=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(isSymbol)),get$1=createGetter(),shallowGet=createGetter(!1,!0),readonlyGet=createGetter(!0),arrayInstrumentations=createArrayInstrumentations();function createArrayInstrumentations(){const e={};return["includes","indexOf","lastIndexOf"].forEach(t=>{e[t]=function(...n){const o=toRaw(this);for(let i=0,l=this.length;i<l;i++)track(o,"get",i+"");const r=o[t](...n);return r===-1||r===!1?o[t](...n.map(toRaw)):r}}),["push","pop","shift","unshift","splice"].forEach(t=>{e[t]=function(...n){pauseTracking();const o=toRaw(this)[t].apply(this,n);return resetTracking(),o}}),e}function hasOwnProperty(e){const t=toRaw(this);return track(t,"has",e),t.hasOwnProperty(e)}function createGetter(e=!1,t=!1){return function(o,r,i){if(r==="__v_isReactive")return!e;if(r==="__v_isReadonly")return e;if(r==="__v_isShallow")return t;if(r==="__v_raw"&&i===(e?t?shallowReadonlyMap:readonlyMap:t?shallowReactiveMap:reactiveMap).get(o))return o;const l=isArray(o);if(!e){if(l&&hasOwn(arrayInstrumentations,r))return Reflect.get(arrayInstrumentations,r,i);if(r==="hasOwnProperty")return hasOwnProperty}const a=Reflect.get(o,r,i);return(isSymbol(r)?builtInSymbols.has(r):isNonTrackableKeys(r))||(e||track(o,"get",r),t)?a:isRef(a)?l&&isIntegerKey(r)?a:a.value:isObject(a)?e?readonly(a):reactive(a):a}}const set$1=createSetter(),shallowSet=createSetter(!0);function createSetter(e=!1){return function(n,o,r,i){let l=n[o];if(isReadonly(l)&&isRef(l)&&!isRef(r))return!1;if(!e&&(!isShallow(r)&&!isReadonly(r)&&(l=toRaw(l),r=toRaw(r)),!isArray(n)&&isRef(l)&&!isRef(r)))return l.value=r,!0;const a=isArray(n)&&isIntegerKey(o)?Number(o)<n.length:hasOwn(n,o),s=Reflect.set(n,o,r,i);return n===toRaw(i)&&(a?hasChanged(r,l)&&trigger(n,"set",o,r):trigger(n,"add",o,r)),s}}function deleteProperty(e,t){const n=hasOwn(e,t);e[t];const o=Reflect.deleteProperty(e,t);return o&&n&&trigger(e,"delete",t,void 0),o}function has$1(e,t){const n=Reflect.has(e,t);return(!isSymbol(t)||!builtInSymbols.has(t))&&track(e,"has",t),n}function ownKeys(e){return track(e,"iterate",isArray(e)?"length":ITERATE_KEY),Reflect.ownKeys(e)}const mutableHandlers={get:get$1,set:set$1,deleteProperty,has:has$1,ownKeys},readonlyHandlers={get:readonlyGet,set(e,t){return!0},deleteProperty(e,t){return!0}},shallowReactiveHandlers=extend({},mutableHandlers,{get:shallowGet,set:shallowSet}),toShallow=e=>e,getProto=e=>Reflect.getPrototypeOf(e);function get(e,t,n=!1,o=!1){e=e.__v_raw;const r=toRaw(e),i=toRaw(t);n||(t!==i&&track(r,"get",t),track(r,"get",i));const{has:l}=getProto(r),a=o?toShallow:n?toReadonly:toReactive;if(l.call(r,t))return a(e.get(t));if(l.call(r,i))return a(e.get(i));e!==r&&e.get(t)}function has(e,t=!1){const n=this.__v_raw,o=toRaw(n),r=toRaw(e);return t||(e!==r&&track(o,"has",e),track(o,"has",r)),e===r?n.has(e):n.has(e)||n.has(r)}function size(e,t=!1){return e=e.__v_raw,!t&&track(toRaw(e),"iterate",ITERATE_KEY),Reflect.get(e,"size",e)}function add(e){e=toRaw(e);const t=toRaw(this);return getProto(t).has.call(t,e)||(t.add(e),trigger(t,"add",e,e)),this}function set(e,t){t=toRaw(t);const n=toRaw(this),{has:o,get:r}=getProto(n);let i=o.call(n,e);i||(e=toRaw(e),i=o.call(n,e));const l=r.call(n,e);return n.set(e,t),i?hasChanged(t,l)&&trigger(n,"set",e,t):trigger(n,"add",e,t),this}function deleteEntry(e){const t=toRaw(this),{has:n,get:o}=getProto(t);let r=n.call(t,e);r||(e=toRaw(e),r=n.call(t,e)),o&&o.call(t,e);const i=t.delete(e);return r&&trigger(t,"delete",e,void 0),i}function clear(){const e=toRaw(this),t=e.size!==0,n=e.clear();return t&&trigger(e,"clear",void 0,void 0),n}function createForEach(e,t){return function(o,r){const i=this,l=i.__v_raw,a=toRaw(l),s=t?toShallow:e?toReadonly:toReactive;return!e&&track(a,"iterate",ITERATE_KEY),l.forEach((u,_)=>o.call(r,s(u),s(_),i))}}function createIterableMethod(e,t,n){return function(...o){const r=this.__v_raw,i=toRaw(r),l=isMap(i),a=e==="entries"||e===Symbol.iterator&&l,s=e==="keys"&&l,u=r[e](...o),_=n?toShallow:t?toReadonly:toReactive;return!t&&track(i,"iterate",s?MAP_KEY_ITERATE_KEY:ITERATE_KEY),{next(){const{value:v,done:y}=u.next();return y?{value:v,done:y}:{value:a?[_(v[0]),_(v[1])]:_(v),done:y}},[Symbol.iterator](){return this}}}}function createReadonlyMethod(e){return function(...t){return e==="delete"?!1:this}}function createInstrumentations(){const e={get(i){return get(this,i)},get size(){return size(this)},has,add,set,delete:deleteEntry,clear,forEach:createForEach(!1,!1)},t={get(i){return get(this,i,!1,!0)},get size(){return size(this)},has,add,set,delete:deleteEntry,clear,forEach:createForEach(!1,!0)},n={get(i){return get(this,i,!0)},get size(){return size(this,!0)},has(i){return has.call(this,i,!0)},add:createReadonlyMethod("add"),set:createReadonlyMethod("set"),delete:createReadonlyMethod("delete"),clear:createReadonlyMethod("clear"),forEach:createForEach(!0,!1)},o={get(i){return get(this,i,!0,!0)},get size(){return size(this,!0)},has(i){return has.call(this,i,!0)},add:createReadonlyMethod("add"),set:createReadonlyMethod("set"),delete:createReadonlyMethod("delete"),clear:createReadonlyMethod("clear"),forEach:createForEach(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(i=>{e[i]=createIterableMethod(i,!1,!1),n[i]=createIterableMethod(i,!0,!1),t[i]=createIterableMethod(i,!1,!0),o[i]=createIterableMethod(i,!0,!0)}),[e,n,t,o]}const[mutableInstrumentations,readonlyInstrumentations,shallowInstrumentations,shallowReadonlyInstrumentations]=createInstrumentations();function createInstrumentationGetter(e,t){const n=t?e?shallowReadonlyInstrumentations:shallowInstrumentations:e?readonlyInstrumentations:mutableInstrumentations;return(o,r,i)=>r==="__v_isReactive"?!e:r==="__v_isReadonly"?e:r==="__v_raw"?o:Reflect.get(hasOwn(n,r)&&r in o?n:o,r,i)}const mutableCollectionHandlers={get:createInstrumentationGetter(!1,!1)},shallowCollectionHandlers={get:createInstrumentationGetter(!1,!0)},readonlyCollectionHandlers={get:createInstrumentationGetter(!0,!1)},reactiveMap=new WeakMap,shallowReactiveMap=new WeakMap,readonlyMap=new WeakMap,shallowReadonlyMap=new WeakMap;function targetTypeMap(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function getTargetType(e){return e.__v_skip||!Object.isExtensible(e)?0:targetTypeMap(toRawType(e))}function reactive(e){return isReadonly(e)?e:createReactiveObject(e,!1,mutableHandlers,mutableCollectionHandlers,reactiveMap)}function shallowReactive(e){return createReactiveObject(e,!1,shallowReactiveHandlers,shallowCollectionHandlers,shallowReactiveMap)}function readonly(e){return createReactiveObject(e,!0,readonlyHandlers,readonlyCollectionHandlers,readonlyMap)}function createReactiveObject(e,t,n,o,r){if(!isObject(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const i=r.get(e);if(i)return i;const l=getTargetType(e);if(l===0)return e;const a=new Proxy(e,l===2?o:n);return r.set(e,a),a}function isReactive(e){return isReadonly(e)?isReactive(e.__v_raw):!!(e&&e.__v_isReactive)}function isReadonly(e){return!!(e&&e.__v_isReadonly)}function isShallow(e){return!!(e&&e.__v_isShallow)}function isProxy(e){return isReactive(e)||isReadonly(e)}function toRaw(e){const t=e&&e.__v_raw;return t?toRaw(t):e}function markRaw(e){return def(e,"__v_skip",!0),e}const toReactive=e=>isObject(e)?reactive(e):e,toReadonly=e=>isObject(e)?readonly(e):e;function trackRefValue(e){shouldTrack&&activeEffect&&(e=toRaw(e),trackEffects(e.dep||(e.dep=createDep())))}function triggerRefValue(e,t){e=toRaw(e);const n=e.dep;n&&triggerEffects(n)}function isRef(e){return!!(e&&e.__v_isRef===!0)}function ref(e){return createRef(e,!1)}function createRef(e,t){return isRef(e)?e:new RefImpl(e,t)}class RefImpl{constructor(t,n){this.__v_isShallow=n,this.dep=void 0,this.__v_isRef=!0,this._rawValue=n?t:toRaw(t),this._value=n?t:toReactive(t)}get value(){return trackRefValue(this),this._value}set value(t){const n=this.__v_isShallow||isShallow(t)||isReadonly(t);t=n?t:toRaw(t),hasChanged(t,this._rawValue)&&(this._rawValue=t,this._value=n?t:toReactive(t),triggerRefValue(this))}}function unref(e){return isRef(e)?e.value:e}const shallowUnwrapHandlers={get:(e,t,n)=>unref(Reflect.get(e,t,n)),set:(e,t,n,o)=>{const r=e[t];return isRef(r)&&!isRef(n)?(r.value=n,!0):Reflect.set(e,t,n,o)}};function proxyRefs(e){return isReactive(e)?e:new Proxy(e,shallowUnwrapHandlers)}var _a$1;class ComputedRefImpl{constructor(t,n,o,r){this._setter=n,this.dep=void 0,this.__v_isRef=!0,this[_a$1]=!1,this._dirty=!0,this.effect=new ReactiveEffect(t,()=>{this._dirty||(this._dirty=!0,triggerRefValue(this))}),this.effect.computed=this,this.effect.active=this._cacheable=!r,this.__v_isReadonly=o}get value(){const t=toRaw(this);return trackRefValue(t),(t._dirty||!t._cacheable)&&(t._dirty=!1,t._value=t.effect.run()),t._value}set value(t){this._setter(t)}}_a$1="__v_isReadonly";function computed$1(e,t,n=!1){let o,r;const i=isFunction(e);return i?(o=e,r=NOOP):(o=e.get,r=e.set),new ComputedRefImpl(o,r,i||!r,n)}function warn(e,...t){}function callWithErrorHandling(e,t,n,o){let r;try{r=o?e(...o):e()}catch(i){handleError(i,t,n)}return r}function callWithAsyncErrorHandling(e,t,n,o){if(isFunction(e)){const i=callWithErrorHandling(e,t,n,o);return i&&isPromise(i)&&i.catch(l=>{handleError(l,t,n)}),i}const r=[];for(let i=0;i<e.length;i++)r.push(callWithAsyncErrorHandling(e[i],t,n,o));return r}function handleError(e,t,n,o=!0){const r=t?t.vnode:null;if(t){let i=t.parent;const l=t.proxy,a=n;for(;i;){const u=i.ec;if(u){for(let _=0;_<u.length;_++)if(u[_](e,l,a)===!1)return}i=i.parent}const s=t.appContext.config.errorHandler;if(s){callWithErrorHandling(s,null,10,[e,l,a]);return}}logError(e,n,r,o)}function logError(e,t,n,o=!0){console.error(e)}let isFlushing=!1,isFlushPending=!1;const queue=[];let flushIndex=0;const pendingPostFlushCbs=[];let activePostFlushCbs=null,postFlushIndex=0;const resolvedPromise=Promise.resolve();let currentFlushPromise=null;function nextTick(e){const t=currentFlushPromise||resolvedPromise;return e?t.then(this?e.bind(this):e):t}function findInsertionIndex(e){let t=flushIndex+1,n=queue.length;for(;t<n;){const o=t+n>>>1;getId(queue[o])<e?t=o+1:n=o}return t}function queueJob(e){(!queue.length||!queue.includes(e,isFlushing&&e.allowRecurse?flushIndex+1:flushIndex))&&(e.id==null?queue.push(e):queue.splice(findInsertionIndex(e.id),0,e),queueFlush())}function queueFlush(){!isFlushing&&!isFlushPending&&(isFlushPending=!0,currentFlushPromise=resolvedPromise.then(flushJobs))}function invalidateJob(e){const t=queue.indexOf(e);t>flushIndex&&queue.splice(t,1)}function queuePostFlushCb(e){isArray(e)?pendingPostFlushCbs.push(...e):(!activePostFlushCbs||!activePostFlushCbs.includes(e,e.allowRecurse?postFlushIndex+1:postFlushIndex))&&pendingPostFlushCbs.push(e),queueFlush()}function flushPreFlushCbs(e,t=isFlushing?flushIndex+1:0){for(;t<queue.length;t++){const n=queue[t];n&&n.pre&&(queue.splice(t,1),t--,n())}}function flushPostFlushCbs(e){if(pendingPostFlushCbs.length){const t=[...new Set(pendingPostFlushCbs)];if(pendingPostFlushCbs.length=0,activePostFlushCbs){activePostFlushCbs.push(...t);return}for(activePostFlushCbs=t,activePostFlushCbs.sort((n,o)=>getId(n)-getId(o)),postFlushIndex=0;postFlushIndex<activePostFlushCbs.length;postFlushIndex++)activePostFlushCbs[postFlushIndex]();activePostFlushCbs=null,postFlushIndex=0}}const getId=e=>e.id==null?1/0:e.id,comparator=(e,t)=>{const n=getId(e)-getId(t);if(n===0){if(e.pre&&!t.pre)return-1;if(t.pre&&!e.pre)return 1}return n};function flushJobs(e){isFlushPending=!1,isFlushing=!0,queue.sort(comparator);const t=NOOP;try{for(flushIndex=0;flushIndex<queue.length;flushIndex++){const n=queue[flushIndex];n&&n.active!==!1&&callWithErrorHandling(n,null,14)}}finally{flushIndex=0,queue.length=0,flushPostFlushCbs(),isFlushing=!1,currentFlushPromise=null,(queue.length||pendingPostFlushCbs.length)&&flushJobs()}}function emit(e,t,...n){if(e.isUnmounted)return;const o=e.vnode.props||EMPTY_OBJ;let r=n;const i=t.startsWith("update:"),l=i&&t.slice(7);if(l&&l in o){const _=`${l==="modelValue"?"model":l}Modifiers`,{number:v,trim:y}=o[_]||EMPTY_OBJ;y&&(r=n.map(S=>isString(S)?S.trim():S)),v&&(r=n.map(looseToNumber))}let a,s=o[a=toHandlerKey(t)]||o[a=toHandlerKey(camelize(t))];!s&&i&&(s=o[a=toHandlerKey(hyphenate(t))]),s&&callWithAsyncErrorHandling(s,e,6,r);const u=o[a+"Once"];if(u){if(!e.emitted)e.emitted={};else if(e.emitted[a])return;e.emitted[a]=!0,callWithAsyncErrorHandling(u,e,6,r)}}function normalizeEmitsOptions(e,t,n=!1){const o=t.emitsCache,r=o.get(e);if(r!==void 0)return r;const i=e.emits;let l={},a=!1;if(!isFunction(e)){const s=u=>{const _=normalizeEmitsOptions(u,t,!0);_&&(a=!0,extend(l,_))};!n&&t.mixins.length&&t.mixins.forEach(s),e.extends&&s(e.extends),e.mixins&&e.mixins.forEach(s)}return!i&&!a?(isObject(e)&&o.set(e,null),null):(isArray(i)?i.forEach(s=>l[s]=null):extend(l,i),isObject(e)&&o.set(e,l),l)}function isEmitListener(e,t){return!e||!isOn(t)?!1:(t=t.slice(2).replace(/Once$/,""),hasOwn(e,t[0].toLowerCase()+t.slice(1))||hasOwn(e,hyphenate(t))||hasOwn(e,t))}let currentRenderingInstance=null,currentScopeId=null;function setCurrentRenderingInstance(e){const t=currentRenderingInstance;return currentRenderingInstance=e,currentScopeId=e&&e.type.__scopeId||null,t}function pushScopeId(e){currentScopeId=e}function popScopeId(){currentScopeId=null}function withCtx(e,t=currentRenderingInstance,n){if(!t||e._n)return e;const o=(...r)=>{o._d&&setBlockTracking(-1);const i=setCurrentRenderingInstance(t);let l;try{l=e(...r)}finally{setCurrentRenderingInstance(i),o._d&&setBlockTracking(1)}return l};return o._n=!0,o._c=!0,o._d=!0,o}function markAttrsAccessed(){}function renderComponentRoot(e){const{type:t,vnode:n,proxy:o,withProxy:r,props:i,propsOptions:[l],slots:a,attrs:s,emit:u,render:_,renderCache:v,data:y,setupState:S,ctx:b,inheritAttrs:g}=e;let d,C;const x=setCurrentRenderingInstance(e);try{if(n.shapeFlag&4){const M=r||o;d=normalizeVNode(_.call(M,M,v,i,S,y,b)),C=s}else{const M=t;d=normalizeVNode(M.length>1?M(i,{attrs:s,slots:a,emit:u}):M(i,null)),C=t.props?s:getFunctionalFallthrough(s)}}catch(M){blockStack.length=0,handleError(M,e,1),d=createVNode(Comment)}let O=d;if(C&&g!==!1){const M=Object.keys(C),{shapeFlag:U}=O;M.length&&U&7&&(l&&M.some(isModelListener)&&(C=filterModelListeners(C,l)),O=cloneVNode(O,C))}return n.dirs&&(O=cloneVNode(O),O.dirs=O.dirs?O.dirs.concat(n.dirs):n.dirs),n.transition&&(O.transition=n.transition),d=O,setCurrentRenderingInstance(x),d}const getFunctionalFallthrough=e=>{let t;for(const n in e)(n==="class"||n==="style"||isOn(n))&&((t||(t={}))[n]=e[n]);return t},filterModelListeners=(e,t)=>{const n={};for(const o in e)(!isModelListener(o)||!(o.slice(9)in t))&&(n[o]=e[o]);return n};function shouldUpdateComponent(e,t,n){const{props:o,children:r,component:i}=e,{props:l,children:a,patchFlag:s}=t,u=i.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&s>=0){if(s&1024)return!0;if(s&16)return o?hasPropsChanged(o,l,u):!!l;if(s&8){const _=t.dynamicProps;for(let v=0;v<_.length;v++){const y=_[v];if(l[y]!==o[y]&&!isEmitListener(u,y))return!0}}}else return(r||a)&&(!a||!a.$stable)?!0:o===l?!1:o?l?hasPropsChanged(o,l,u):!0:!!l;return!1}function hasPropsChanged(e,t,n){const o=Object.keys(t);if(o.length!==Object.keys(e).length)return!0;for(let r=0;r<o.length;r++){const i=o[r];if(t[i]!==e[i]&&!isEmitListener(n,i))return!0}return!1}function updateHOCHostEl({vnode:e,parent:t},n){for(;t&&t.subTree===e;)(e=t.vnode).el=n,t=t.parent}const isSuspense=e=>e.__isSuspense;function queueEffectWithSuspense(e,t){t&&t.pendingBranch?isArray(e)?t.effects.push(...e):t.effects.push(e):queuePostFlushCb(e)}function provide(e,t){if(currentInstance){let n=currentInstance.provides;const o=currentInstance.parent&&currentInstance.parent.provides;o===n&&(n=currentInstance.provides=Object.create(o)),n[e]=t}}function inject(e,t,n=!1){const o=currentInstance||currentRenderingInstance;if(o){const r=o.parent==null?o.vnode.appContext&&o.vnode.appContext.provides:o.parent.provides;if(r&&e in r)return r[e];if(arguments.length>1)return n&&isFunction(t)?t.call(o.proxy):t}}const INITIAL_WATCHER_VALUE={};function watch(e,t,n){return doWatch(e,t,n)}function doWatch(e,t,{immediate:n,deep:o,flush:r,onTrack:i,onTrigger:l}=EMPTY_OBJ){const a=getCurrentScope()===(currentInstance==null?void 0:currentInstance.scope)?currentInstance:null;let s,u=!1,_=!1;if(isRef(e)?(s=()=>e.value,u=isShallow(e)):isReactive(e)?(s=()=>e,o=!0):isArray(e)?(_=!0,u=e.some(O=>isReactive(O)||isShallow(O)),s=()=>e.map(O=>{if(isRef(O))return O.value;if(isReactive(O))return traverse(O);if(isFunction(O))return callWithErrorHandling(O,a,2)})):isFunction(e)?t?s=()=>callWithErrorHandling(e,a,2):s=()=>{if(!(a&&a.isUnmounted))return v&&v(),callWithAsyncErrorHandling(e,a,3,[y])}:s=NOOP,t&&o){const O=s;s=()=>traverse(O())}let v,y=O=>{v=C.onStop=()=>{callWithErrorHandling(O,a,4)}},S;if(isInSSRComponentSetup)if(y=NOOP,t?n&&callWithAsyncErrorHandling(t,a,3,[s(),_?[]:void 0,y]):s(),r==="sync"){const O=useSSRContext();S=O.__watcherHandles||(O.__watcherHandles=[])}else return NOOP;let b=_?new Array(e.length).fill(INITIAL_WATCHER_VALUE):INITIAL_WATCHER_VALUE;const g=()=>{if(!!C.active)if(t){const O=C.run();(o||u||(_?O.some((M,U)=>hasChanged(M,b[U])):hasChanged(O,b)))&&(v&&v(),callWithAsyncErrorHandling(t,a,3,[O,b===INITIAL_WATCHER_VALUE?void 0:_&&b[0]===INITIAL_WATCHER_VALUE?[]:b,y]),b=O)}else C.run()};g.allowRecurse=!!t;let d;r==="sync"?d=g:r==="post"?d=()=>queuePostRenderEffect(g,a&&a.suspense):(g.pre=!0,a&&(g.id=a.uid),d=()=>queueJob(g));const C=new ReactiveEffect(s,d);t?n?g():b=C.run():r==="post"?queuePostRenderEffect(C.run.bind(C),a&&a.suspense):C.run();const x=()=>{C.stop(),a&&a.scope&&remove(a.scope.effects,C)};return S&&S.push(x),x}function instanceWatch(e,t,n){const o=this.proxy,r=isString(e)?e.includes(".")?createPathGetter(o,e):()=>o[e]:e.bind(o,o);let i;isFunction(t)?i=t:(i=t.handler,n=t);const l=currentInstance;setCurrentInstance(this);const a=doWatch(r,i.bind(o),n);return l?setCurrentInstance(l):unsetCurrentInstance(),a}function createPathGetter(e,t){const n=t.split(".");return()=>{let o=e;for(let r=0;r<n.length&&o;r++)o=o[n[r]];return o}}function traverse(e,t){if(!isObject(e)||e.__v_skip||(t=t||new Set,t.has(e)))return e;if(t.add(e),isRef(e))traverse(e.value,t);else if(isArray(e))for(let n=0;n<e.length;n++)traverse(e[n],t);else if(isSet(e)||isMap(e))e.forEach(n=>{traverse(n,t)});else if(isPlainObject(e))for(const n in e)traverse(e[n],t);return e}function useTransitionState(){const e={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return onMounted(()=>{e.isMounted=!0}),onBeforeUnmount(()=>{e.isUnmounting=!0}),e}const TransitionHookValidator=[Function,Array],BaseTransitionImpl={name:"BaseTransition",props:{mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:TransitionHookValidator,onEnter:TransitionHookValidator,onAfterEnter:TransitionHookValidator,onEnterCancelled:TransitionHookValidator,onBeforeLeave:TransitionHookValidator,onLeave:TransitionHookValidator,onAfterLeave:TransitionHookValidator,onLeaveCancelled:TransitionHookValidator,onBeforeAppear:TransitionHookValidator,onAppear:TransitionHookValidator,onAfterAppear:TransitionHookValidator,onAppearCancelled:TransitionHookValidator},setup(e,{slots:t}){const n=getCurrentInstance(),o=useTransitionState();let r;return()=>{const i=t.default&&getTransitionRawChildren(t.default(),!0);if(!i||!i.length)return;let l=i[0];if(i.length>1){for(const g of i)if(g.type!==Comment){l=g;break}}const a=toRaw(e),{mode:s}=a;if(o.isLeaving)return emptyPlaceholder(l);const u=getKeepAliveChild(l);if(!u)return emptyPlaceholder(l);const _=resolveTransitionHooks(u,a,o,n);setTransitionHooks(u,_);const v=n.subTree,y=v&&getKeepAliveChild(v);let S=!1;const{getTransitionKey:b}=u.type;if(b){const g=b();r===void 0?r=g:g!==r&&(r=g,S=!0)}if(y&&y.type!==Comment&&(!isSameVNodeType(u,y)||S)){const g=resolveTransitionHooks(y,a,o,n);if(setTransitionHooks(y,g),s==="out-in")return o.isLeaving=!0,g.afterLeave=()=>{o.isLeaving=!1,n.update.active!==!1&&n.update()},emptyPlaceholder(l);s==="in-out"&&u.type!==Comment&&(g.delayLeave=(d,C,x)=>{const O=getLeavingNodesForType(o,y);O[String(y.key)]=y,d._leaveCb=()=>{C(),d._leaveCb=void 0,delete _.delayedLeave},_.delayedLeave=x})}return l}}},BaseTransition=BaseTransitionImpl;function getLeavingNodesForType(e,t){const{leavingVNodes:n}=e;let o=n.get(t.type);return o||(o=Object.create(null),n.set(t.type,o)),o}function resolveTransitionHooks(e,t,n,o){const{appear:r,mode:i,persisted:l=!1,onBeforeEnter:a,onEnter:s,onAfterEnter:u,onEnterCancelled:_,onBeforeLeave:v,onLeave:y,onAfterLeave:S,onLeaveCancelled:b,onBeforeAppear:g,onAppear:d,onAfterAppear:C,onAppearCancelled:x}=t,O=String(e.key),M=getLeavingNodesForType(n,e),U=(F,Q)=>{F&&callWithAsyncErrorHandling(F,o,9,Q)},D=(F,Q)=>{const X=Q[1];U(F,Q),isArray(F)?F.every(re=>re.length<=1)&&X():F.length<=1&&X()},W={mode:i,persisted:l,beforeEnter(F){let Q=a;if(!n.isMounted)if(r)Q=g||a;else return;F._leaveCb&&F._leaveCb(!0);const X=M[O];X&&isSameVNodeType(e,X)&&X.el._leaveCb&&X.el._leaveCb(),U(Q,[F])},enter(F){let Q=s,X=u,re=_;if(!n.isMounted)if(r)Q=d||s,X=C||u,re=x||_;else return;let $=!1;const ee=F._enterCb=le=>{$||($=!0,le?U(re,[F]):U(X,[F]),W.delayedLeave&&W.delayedLeave(),F._enterCb=void 0)};Q?D(Q,[F,ee]):ee()},leave(F,Q){const X=String(e.key);if(F._enterCb&&F._enterCb(!0),n.isUnmounting)return Q();U(v,[F]);let re=!1;const $=F._leaveCb=ee=>{re||(re=!0,Q(),ee?U(b,[F]):U(S,[F]),F._leaveCb=void 0,M[X]===e&&delete M[X])};M[X]=e,y?D(y,[F,$]):$()},clone(F){return resolveTransitionHooks(F,t,n,o)}};return W}function emptyPlaceholder(e){if(isKeepAlive(e))return e=cloneVNode(e),e.children=null,e}function getKeepAliveChild(e){return isKeepAlive(e)?e.children?e.children[0]:void 0:e}function setTransitionHooks(e,t){e.shapeFlag&6&&e.component?setTransitionHooks(e.component.subTree,t):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function getTransitionRawChildren(e,t=!1,n){let o=[],r=0;for(let i=0;i<e.length;i++){let l=e[i];const a=n==null?l.key:String(n)+String(l.key!=null?l.key:i);l.type===Fragment?(l.patchFlag&128&&r++,o=o.concat(getTransitionRawChildren(l.children,t,a))):(t||l.type!==Comment)&&o.push(a!=null?cloneVNode(l,{key:a}):l)}if(r>1)for(let i=0;i<o.length;i++)o[i].patchFlag=-2;return o}function defineComponent(e){return isFunction(e)?{setup:e,name:e.name}:e}const isAsyncWrapper=e=>!!e.type.__asyncLoader,isKeepAlive=e=>e.type.__isKeepAlive;function onActivated(e,t){registerKeepAliveHook(e,"a",t)}function onDeactivated(e,t){registerKeepAliveHook(e,"da",t)}function registerKeepAliveHook(e,t,n=currentInstance){const o=e.__wdc||(e.__wdc=()=>{let r=n;for(;r;){if(r.isDeactivated)return;r=r.parent}return e()});if(injectHook(t,o,n),n){let r=n.parent;for(;r&&r.parent;)isKeepAlive(r.parent.vnode)&&injectToKeepAliveRoot(o,t,n,r),r=r.parent}}function injectToKeepAliveRoot(e,t,n,o){const r=injectHook(t,e,o,!0);onUnmounted(()=>{remove(o[t],r)},n)}function injectHook(e,t,n=currentInstance,o=!1){if(n){const r=n[e]||(n[e]=[]),i=t.__weh||(t.__weh=(...l)=>{if(n.isUnmounted)return;pauseTracking(),setCurrentInstance(n);const a=callWithAsyncErrorHandling(t,n,e,l);return unsetCurrentInstance(),resetTracking(),a});return o?r.unshift(i):r.push(i),i}}const createHook=e=>(t,n=currentInstance)=>(!isInSSRComponentSetup||e==="sp")&&injectHook(e,(...o)=>t(...o),n),onBeforeMount=createHook("bm"),onMounted=createHook("m"),onBeforeUpdate=createHook("bu"),onUpdated=createHook("u"),onBeforeUnmount=createHook("bum"),onUnmounted=createHook("um"),onServerPrefetch=createHook("sp"),onRenderTriggered=createHook("rtg"),onRenderTracked=createHook("rtc");function onErrorCaptured(e,t=currentInstance){injectHook("ec",e,t)}function withDirectives(e,t){const n=currentRenderingInstance;if(n===null)return e;const o=getExposeProxy(n)||n.proxy,r=e.dirs||(e.dirs=[]);for(let i=0;i<t.length;i++){let[l,a,s,u=EMPTY_OBJ]=t[i];l&&(isFunction(l)&&(l={mounted:l,updated:l}),l.deep&&traverse(a),r.push({dir:l,instance:o,value:a,oldValue:void 0,arg:s,modifiers:u}))}return e}function invokeDirectiveHook(e,t,n,o){const r=e.dirs,i=t&&t.dirs;for(let l=0;l<r.length;l++){const a=r[l];i&&(a.oldValue=i[l].value);let s=a.dir[o];s&&(pauseTracking(),callWithAsyncErrorHandling(s,n,8,[e.el,a,e,t]),resetTracking())}}const NULL_DYNAMIC_COMPONENT=Symbol();function renderList(e,t,n,o){let r;const i=n&&n[o];if(isArray(e)||isString(e)){r=new Array(e.length);for(let l=0,a=e.length;l<a;l++)r[l]=t(e[l],l,void 0,i&&i[l])}else if(typeof e=="number"){r=new Array(e);for(let l=0;l<e;l++)r[l]=t(l+1,l,void 0,i&&i[l])}else if(isObject(e))if(e[Symbol.iterator])r=Array.from(e,(l,a)=>t(l,a,void 0,i&&i[a]));else{const l=Object.keys(e);r=new Array(l.length);for(let a=0,s=l.length;a<s;a++){const u=l[a];r[a]=t(e[u],u,a,i&&i[a])}}else r=[];return n&&(n[o]=r),r}function renderSlot(e,t,n={},o,r){if(currentRenderingInstance.isCE||currentRenderingInstance.parent&&isAsyncWrapper(currentRenderingInstance.parent)&&currentRenderingInstance.parent.isCE)return t!=="default"&&(n.name=t),createVNode("slot",n,o&&o());let i=e[t];i&&i._c&&(i._d=!1),openBlock();const l=i&&ensureValidVNode(i(n)),a=createBlock(Fragment,{key:n.key||l&&l.key||`_${t}`},l||(o?o():[]),l&&e._===1?64:-2);return!r&&a.scopeId&&(a.slotScopeIds=[a.scopeId+"-s"]),i&&i._c&&(i._d=!0),a}function ensureValidVNode(e){return e.some(t=>isVNode(t)?!(t.type===Comment||t.type===Fragment&&!ensureValidVNode(t.children)):!0)?e:null}const getPublicInstance=e=>e?isStatefulComponent(e)?getExposeProxy(e)||e.proxy:getPublicInstance(e.parent):null,publicPropertiesMap=extend(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>getPublicInstance(e.parent),$root:e=>getPublicInstance(e.root),$emit:e=>e.emit,$options:e=>resolveMergedOptions(e),$forceUpdate:e=>e.f||(e.f=()=>queueJob(e.update)),$nextTick:e=>e.n||(e.n=nextTick.bind(e.proxy)),$watch:e=>instanceWatch.bind(e)}),hasSetupBinding=(e,t)=>e!==EMPTY_OBJ&&!e.__isScriptSetup&&hasOwn(e,t),PublicInstanceProxyHandlers={get({_:e},t){const{ctx:n,setupState:o,data:r,props:i,accessCache:l,type:a,appContext:s}=e;let u;if(t[0]!=="$"){const S=l[t];if(S!==void 0)switch(S){case 1:return o[t];case 2:return r[t];case 4:return n[t];case 3:return i[t]}else{if(hasSetupBinding(o,t))return l[t]=1,o[t];if(r!==EMPTY_OBJ&&hasOwn(r,t))return l[t]=2,r[t];if((u=e.propsOptions[0])&&hasOwn(u,t))return l[t]=3,i[t];if(n!==EMPTY_OBJ&&hasOwn(n,t))return l[t]=4,n[t];shouldCacheAccess&&(l[t]=0)}}const _=publicPropertiesMap[t];let v,y;if(_)return t==="$attrs"&&track(e,"get",t),_(e);if((v=a.__cssModules)&&(v=v[t]))return v;if(n!==EMPTY_OBJ&&hasOwn(n,t))return l[t]=4,n[t];if(y=s.config.globalProperties,hasOwn(y,t))return y[t]},set({_:e},t,n){const{data:o,setupState:r,ctx:i}=e;return hasSetupBinding(r,t)?(r[t]=n,!0):o!==EMPTY_OBJ&&hasOwn(o,t)?(o[t]=n,!0):hasOwn(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(i[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:o,appContext:r,propsOptions:i}},l){let a;return!!n[l]||e!==EMPTY_OBJ&&hasOwn(e,l)||hasSetupBinding(t,l)||(a=i[0])&&hasOwn(a,l)||hasOwn(o,l)||hasOwn(publicPropertiesMap,l)||hasOwn(r.config.globalProperties,l)},defineProperty(e,t,n){return n.get!=null?e._.accessCache[t]=0:hasOwn(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}};let shouldCacheAccess=!0;function applyOptions(e){const t=resolveMergedOptions(e),n=e.proxy,o=e.ctx;shouldCacheAccess=!1,t.beforeCreate&&callHook$1(t.beforeCreate,e,"bc");const{data:r,computed:i,methods:l,watch:a,provide:s,inject:u,created:_,beforeMount:v,mounted:y,beforeUpdate:S,updated:b,activated:g,deactivated:d,beforeDestroy:C,beforeUnmount:x,destroyed:O,unmounted:M,render:U,renderTracked:D,renderTriggered:W,errorCaptured:F,serverPrefetch:Q,expose:X,inheritAttrs:re,components:$,directives:ee,filters:le}=t;if(u&&resolveInjections(u,o,null,e.appContext.config.unwrapInjectedRef),l)for(const oe in l){const te=l[oe];isFunction(te)&&(o[oe]=te.bind(n))}if(r){const oe=r.call(n,n);isObject(oe)&&(e.data=reactive(oe))}if(shouldCacheAccess=!0,i)for(const oe in i){const te=i[oe],fe=isFunction(te)?te.bind(n,n):isFunction(te.get)?te.get.bind(n,n):NOOP,ge=!isFunction(te)&&isFunction(te.set)?te.set.bind(n):NOOP,ue=computed({get:fe,set:ge});Object.defineProperty(o,oe,{enumerable:!0,configurable:!0,get:()=>ue.value,set:pe=>ue.value=pe})}if(a)for(const oe in a)createWatcher(a[oe],o,n,oe);if(s){const oe=isFunction(s)?s.call(n):s;Reflect.ownKeys(oe).forEach(te=>{provide(te,oe[te])})}_&&callHook$1(_,e,"c");function se(oe,te){isArray(te)?te.forEach(fe=>oe(fe.bind(n))):te&&oe(te.bind(n))}if(se(onBeforeMount,v),se(onMounted,y),se(onBeforeUpdate,S),se(onUpdated,b),se(onActivated,g),se(onDeactivated,d),se(onErrorCaptured,F),se(onRenderTracked,D),se(onRenderTriggered,W),se(onBeforeUnmount,x),se(onUnmounted,M),se(onServerPrefetch,Q),isArray(X))if(X.length){const oe=e.exposed||(e.exposed={});X.forEach(te=>{Object.defineProperty(oe,te,{get:()=>n[te],set:fe=>n[te]=fe})})}else e.exposed||(e.exposed={});U&&e.render===NOOP&&(e.render=U),re!=null&&(e.inheritAttrs=re),$&&(e.components=$),ee&&(e.directives=ee)}function resolveInjections(e,t,n=NOOP,o=!1){isArray(e)&&(e=normalizeInject(e));for(const r in e){const i=e[r];let l;isObject(i)?"default"in i?l=inject(i.from||r,i.default,!0):l=inject(i.from||r):l=inject(i),isRef(l)&&o?Object.defineProperty(t,r,{enumerable:!0,configurable:!0,get:()=>l.value,set:a=>l.value=a}):t[r]=l}}function callHook$1(e,t,n){callWithAsyncErrorHandling(isArray(e)?e.map(o=>o.bind(t.proxy)):e.bind(t.proxy),t,n)}function createWatcher(e,t,n,o){const r=o.includes(".")?createPathGetter(n,o):()=>n[o];if(isString(e)){const i=t[e];isFunction(i)&&watch(r,i)}else if(isFunction(e))watch(r,e.bind(n));else if(isObject(e))if(isArray(e))e.forEach(i=>createWatcher(i,t,n,o));else{const i=isFunction(e.handler)?e.handler.bind(n):t[e.handler];isFunction(i)&&watch(r,i,e)}}function resolveMergedOptions(e){const t=e.type,{mixins:n,extends:o}=t,{mixins:r,optionsCache:i,config:{optionMergeStrategies:l}}=e.appContext,a=i.get(t);let s;return a?s=a:!r.length&&!n&&!o?s=t:(s={},r.length&&r.forEach(u=>mergeOptions(s,u,l,!0)),mergeOptions(s,t,l)),isObject(t)&&i.set(t,s),s}function mergeOptions(e,t,n,o=!1){const{mixins:r,extends:i}=t;i&&mergeOptions(e,i,n,!0),r&&r.forEach(l=>mergeOptions(e,l,n,!0));for(const l in t)if(!(o&&l==="expose")){const a=internalOptionMergeStrats[l]||n&&n[l];e[l]=a?a(e[l],t[l]):t[l]}return e}const internalOptionMergeStrats={data:mergeDataFn,props:mergeObjectOptions,emits:mergeObjectOptions,methods:mergeObjectOptions,computed:mergeObjectOptions,beforeCreate:mergeAsArray,created:mergeAsArray,beforeMount:mergeAsArray,mounted:mergeAsArray,beforeUpdate:mergeAsArray,updated:mergeAsArray,beforeDestroy:mergeAsArray,beforeUnmount:mergeAsArray,destroyed:mergeAsArray,unmounted:mergeAsArray,activated:mergeAsArray,deactivated:mergeAsArray,errorCaptured:mergeAsArray,serverPrefetch:mergeAsArray,components:mergeObjectOptions,directives:mergeObjectOptions,watch:mergeWatchOptions,provide:mergeDataFn,inject:mergeInject};function mergeDataFn(e,t){return t?e?function(){return extend(isFunction(e)?e.call(this,this):e,isFunction(t)?t.call(this,this):t)}:t:e}function mergeInject(e,t){return mergeObjectOptions(normalizeInject(e),normalizeInject(t))}function normalizeInject(e){if(isArray(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function mergeAsArray(e,t){return e?[...new Set([].concat(e,t))]:t}function mergeObjectOptions(e,t){return e?extend(extend(Object.create(null),e),t):t}function mergeWatchOptions(e,t){if(!e)return t;if(!t)return e;const n=extend(Object.create(null),e);for(const o in t)n[o]=mergeAsArray(e[o],t[o]);return n}function initProps(e,t,n,o=!1){const r={},i={};def(i,InternalObjectKey,1),e.propsDefaults=Object.create(null),setFullProps(e,t,r,i);for(const l in e.propsOptions[0])l in r||(r[l]=void 0);n?e.props=o?r:shallowReactive(r):e.type.props?e.props=r:e.props=i,e.attrs=i}function updateProps(e,t,n,o){const{props:r,attrs:i,vnode:{patchFlag:l}}=e,a=toRaw(r),[s]=e.propsOptions;let u=!1;if((o||l>0)&&!(l&16)){if(l&8){const _=e.vnode.dynamicProps;for(let v=0;v<_.length;v++){let y=_[v];if(isEmitListener(e.emitsOptions,y))continue;const S=t[y];if(s)if(hasOwn(i,y))S!==i[y]&&(i[y]=S,u=!0);else{const b=camelize(y);r[b]=resolvePropValue(s,a,b,S,e,!1)}else S!==i[y]&&(i[y]=S,u=!0)}}}else{setFullProps(e,t,r,i)&&(u=!0);let _;for(const v in a)(!t||!hasOwn(t,v)&&((_=hyphenate(v))===v||!hasOwn(t,_)))&&(s?n&&(n[v]!==void 0||n[_]!==void 0)&&(r[v]=resolvePropValue(s,a,v,void 0,e,!0)):delete r[v]);if(i!==a)for(const v in i)(!t||!hasOwn(t,v)&&!0)&&(delete i[v],u=!0)}u&&trigger(e,"set","$attrs")}function setFullProps(e,t,n,o){const[r,i]=e.propsOptions;let l=!1,a;if(t)for(let s in t){if(isReservedProp(s))continue;const u=t[s];let _;r&&hasOwn(r,_=camelize(s))?!i||!i.includes(_)?n[_]=u:(a||(a={}))[_]=u:isEmitListener(e.emitsOptions,s)||(!(s in o)||u!==o[s])&&(o[s]=u,l=!0)}if(i){const s=toRaw(n),u=a||EMPTY_OBJ;for(let _=0;_<i.length;_++){const v=i[_];n[v]=resolvePropValue(r,s,v,u[v],e,!hasOwn(u,v))}}return l}function resolvePropValue(e,t,n,o,r,i){const l=e[n];if(l!=null){const a=hasOwn(l,"default");if(a&&o===void 0){const s=l.default;if(l.type!==Function&&isFunction(s)){const{propsDefaults:u}=r;n in u?o=u[n]:(setCurrentInstance(r),o=u[n]=s.call(null,t),unsetCurrentInstance())}else o=s}l[0]&&(i&&!a?o=!1:l[1]&&(o===""||o===hyphenate(n))&&(o=!0))}return o}function normalizePropsOptions(e,t,n=!1){const o=t.propsCache,r=o.get(e);if(r)return r;const i=e.props,l={},a=[];let s=!1;if(!isFunction(e)){const _=v=>{s=!0;const[y,S]=normalizePropsOptions(v,t,!0);extend(l,y),S&&a.push(...S)};!n&&t.mixins.length&&t.mixins.forEach(_),e.extends&&_(e.extends),e.mixins&&e.mixins.forEach(_)}if(!i&&!s)return isObject(e)&&o.set(e,EMPTY_ARR),EMPTY_ARR;if(isArray(i))for(let _=0;_<i.length;_++){const v=camelize(i[_]);validatePropName(v)&&(l[v]=EMPTY_OBJ)}else if(i)for(const _ in i){const v=camelize(_);if(validatePropName(v)){const y=i[_],S=l[v]=isArray(y)||isFunction(y)?{type:y}:Object.assign({},y);if(S){const b=getTypeIndex(Boolean,S.type),g=getTypeIndex(String,S.type);S[0]=b>-1,S[1]=g<0||b<g,(b>-1||hasOwn(S,"default"))&&a.push(v)}}}const u=[l,a];return isObject(e)&&o.set(e,u),u}function validatePropName(e){return e[0]!=="$"}function getType(e){const t=e&&e.toString().match(/^\s*(function|class) (\w+)/);return t?t[2]:e===null?"null":""}function isSameType(e,t){return getType(e)===getType(t)}function getTypeIndex(e,t){return isArray(t)?t.findIndex(n=>isSameType(n,e)):isFunction(t)&&isSameType(t,e)?0:-1}const isInternalKey=e=>e[0]==="_"||e==="$stable",normalizeSlotValue=e=>isArray(e)?e.map(normalizeVNode):[normalizeVNode(e)],normalizeSlot=(e,t,n)=>{if(t._n)return t;const o=withCtx((...r)=>normalizeSlotValue(t(...r)),n);return o._c=!1,o},normalizeObjectSlots=(e,t,n)=>{const o=e._ctx;for(const r in e){if(isInternalKey(r))continue;const i=e[r];if(isFunction(i))t[r]=normalizeSlot(r,i,o);else if(i!=null){const l=normalizeSlotValue(i);t[r]=()=>l}}},normalizeVNodeSlots=(e,t)=>{const n=normalizeSlotValue(t);e.slots.default=()=>n},initSlots=(e,t)=>{if(e.vnode.shapeFlag&32){const n=t._;n?(e.slots=toRaw(t),def(t,"_",n)):normalizeObjectSlots(t,e.slots={})}else e.slots={},t&&normalizeVNodeSlots(e,t);def(e.slots,InternalObjectKey,1)},updateSlots=(e,t,n)=>{const{vnode:o,slots:r}=e;let i=!0,l=EMPTY_OBJ;if(o.shapeFlag&32){const a=t._;a?n&&a===1?i=!1:(extend(r,t),!n&&a===1&&delete r._):(i=!t.$stable,normalizeObjectSlots(t,r)),l=t}else t&&(normalizeVNodeSlots(e,t),l={default:1});if(i)for(const a in r)!isInternalKey(a)&&!(a in l)&&delete r[a]};function createAppContext(){return{app:null,config:{isNativeTag:NO,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let uid$1=0;function createAppAPI(e,t){return function(o,r=null){isFunction(o)||(o=Object.assign({},o)),r!=null&&!isObject(r)&&(r=null);const i=createAppContext(),l=new Set;let a=!1;const s=i.app={_uid:uid$1++,_component:o,_props:r,_container:null,_context:i,_instance:null,version,get config(){return i.config},set config(u){},use(u,..._){return l.has(u)||(u&&isFunction(u.install)?(l.add(u),u.install(s,..._)):isFunction(u)&&(l.add(u),u(s,..._))),s},mixin(u){return i.mixins.includes(u)||i.mixins.push(u),s},component(u,_){return _?(i.components[u]=_,s):i.components[u]},directive(u,_){return _?(i.directives[u]=_,s):i.directives[u]},mount(u,_,v){if(!a){const y=createVNode(o,r);return y.appContext=i,_&&t?t(y,u):e(y,u,v),a=!0,s._container=u,u.__vue_app__=s,getExposeProxy(y.component)||y.component.proxy}},unmount(){a&&(e(null,s._container),delete s._container.__vue_app__)},provide(u,_){return i.provides[u]=_,s}};return s}}function setRef(e,t,n,o,r=!1){if(isArray(e)){e.forEach((y,S)=>setRef(y,t&&(isArray(t)?t[S]:t),n,o,r));return}if(isAsyncWrapper(o)&&!r)return;const i=o.shapeFlag&4?getExposeProxy(o.component)||o.component.proxy:o.el,l=r?null:i,{i:a,r:s}=e,u=t&&t.r,_=a.refs===EMPTY_OBJ?a.refs={}:a.refs,v=a.setupState;if(u!=null&&u!==s&&(isString(u)?(_[u]=null,hasOwn(v,u)&&(v[u]=null)):isRef(u)&&(u.value=null)),isFunction(s))callWithErrorHandling(s,a,12,[l,_]);else{const y=isString(s),S=isRef(s);if(y||S){const b=()=>{if(e.f){const g=y?hasOwn(v,s)?v[s]:_[s]:s.value;r?isArray(g)&&remove(g,i):isArray(g)?g.includes(i)||g.push(i):y?(_[s]=[i],hasOwn(v,s)&&(v[s]=_[s])):(s.value=[i],e.k&&(_[e.k]=s.value))}else y?(_[s]=l,hasOwn(v,s)&&(v[s]=l)):S&&(s.value=l,e.k&&(_[e.k]=l))};l?(b.id=-1,queuePostRenderEffect(b,n)):b()}}}const queuePostRenderEffect=queueEffectWithSuspense;function createRenderer(e){return baseCreateRenderer(e)}function baseCreateRenderer(e,t){const n=getGlobalThis();n.__VUE__=!0;const{insert:o,remove:r,patchProp:i,createElement:l,createText:a,createComment:s,setText:u,setElementText:_,parentNode:v,nextSibling:y,setScopeId:S=NOOP,insertStaticContent:b}=e,g=(c,m,k,A=null,T=null,I=null,R=!1,N=null,E=!!m.dynamicChildren)=>{if(c===m)return;c&&!isSameVNodeType(c,m)&&(A=z(c),pe(c,T,I,!0),c=null),m.patchFlag===-2&&(E=!1,m.dynamicChildren=null);const{type:B,ref:K,shapeFlag:P}=m;switch(B){case Text:d(c,m,k,A);break;case Comment:C(c,m,k,A);break;case Static:c==null&&x(m,k,A,R);break;case Fragment:$(c,m,k,A,T,I,R,N,E);break;default:P&1?U(c,m,k,A,T,I,R,N,E):P&6?ee(c,m,k,A,T,I,R,N,E):(P&64||P&128)&&B.process(c,m,k,A,T,I,R,N,E,Z)}K!=null&&T&&setRef(K,c&&c.ref,I,m||c,!m)},d=(c,m,k,A)=>{if(c==null)o(m.el=a(m.children),k,A);else{const T=m.el=c.el;m.children!==c.children&&u(T,m.children)}},C=(c,m,k,A)=>{c==null?o(m.el=s(m.children||""),k,A):m.el=c.el},x=(c,m,k,A)=>{[c.el,c.anchor]=b(c.children,m,k,A,c.el,c.anchor)},O=({el:c,anchor:m},k,A)=>{let T;for(;c&&c!==m;)T=y(c),o(c,k,A),c=T;o(m,k,A)},M=({el:c,anchor:m})=>{let k;for(;c&&c!==m;)k=y(c),r(c),c=k;r(m)},U=(c,m,k,A,T,I,R,N,E)=>{R=R||m.type==="svg",c==null?D(m,k,A,T,I,R,N,E):Q(c,m,T,I,R,N,E)},D=(c,m,k,A,T,I,R,N)=>{let E,B;const{type:K,props:P,shapeFlag:j,transition:L,dirs:q}=c;if(E=c.el=l(c.type,I,P&&P.is,P),j&8?_(E,c.children):j&16&&F(c.children,E,null,A,T,I&&K!=="foreignObject",R,N),q&&invokeDirectiveHook(c,null,A,"created"),W(E,c,c.scopeId,R,A),P){for(const G in P)G!=="value"&&!isReservedProp(G)&&i(E,G,null,P[G],I,c.children,A,T,w);"value"in P&&i(E,"value",null,P.value),(B=P.onVnodeBeforeMount)&&invokeVNodeHook(B,A,c)}q&&invokeDirectiveHook(c,null,A,"beforeMount");const Y=(!T||T&&!T.pendingBranch)&&L&&!L.persisted;Y&&L.beforeEnter(E),o(E,m,k),((B=P&&P.onVnodeMounted)||Y||q)&&queuePostRenderEffect(()=>{B&&invokeVNodeHook(B,A,c),Y&&L.enter(E),q&&invokeDirectiveHook(c,null,A,"mounted")},T)},W=(c,m,k,A,T)=>{if(k&&S(c,k),A)for(let I=0;I<A.length;I++)S(c,A[I]);if(T){let I=T.subTree;if(m===I){const R=T.vnode;W(c,R,R.scopeId,R.slotScopeIds,T.parent)}}},F=(c,m,k,A,T,I,R,N,E=0)=>{for(let B=E;B<c.length;B++){const K=c[B]=N?cloneIfMounted(c[B]):normalizeVNode(c[B]);g(null,K,m,k,A,T,I,R,N)}},Q=(c,m,k,A,T,I,R)=>{const N=m.el=c.el;let{patchFlag:E,dynamicChildren:B,dirs:K}=m;E|=c.patchFlag&16;const P=c.props||EMPTY_OBJ,j=m.props||EMPTY_OBJ;let L;k&&toggleRecurse(k,!1),(L=j.onVnodeBeforeUpdate)&&invokeVNodeHook(L,k,m,c),K&&invokeDirectiveHook(m,c,k,"beforeUpdate"),k&&toggleRecurse(k,!0);const q=T&&m.type!=="foreignObject";if(B?X(c.dynamicChildren,B,N,k,A,q,I):R||te(c,m,N,null,k,A,q,I,!1),E>0){if(E&16)re(N,m,P,j,k,A,T);else if(E&2&&P.class!==j.class&&i(N,"class",null,j.class,T),E&4&&i(N,"style",P.style,j.style,T),E&8){const Y=m.dynamicProps;for(let G=0;G<Y.length;G++){const J=Y[G],ne=P[J],me=j[J];(me!==ne||J==="value")&&i(N,J,ne,me,T,c.children,k,A,w)}}E&1&&c.children!==m.children&&_(N,m.children)}else!R&&B==null&&re(N,m,P,j,k,A,T);((L=j.onVnodeUpdated)||K)&&queuePostRenderEffect(()=>{L&&invokeVNodeHook(L,k,m,c),K&&invokeDirectiveHook(m,c,k,"updated")},A)},X=(c,m,k,A,T,I,R)=>{for(let N=0;N<m.length;N++){const E=c[N],B=m[N],K=E.el&&(E.type===Fragment||!isSameVNodeType(E,B)||E.shapeFlag&70)?v(E.el):k;g(E,B,K,null,A,T,I,R,!0)}},re=(c,m,k,A,T,I,R)=>{if(k!==A){if(k!==EMPTY_OBJ)for(const N in k)!isReservedProp(N)&&!(N in A)&&i(c,N,k[N],null,R,m.children,T,I,w);for(const N in A){if(isReservedProp(N))continue;const E=A[N],B=k[N];E!==B&&N!=="value"&&i(c,N,B,E,R,m.children,T,I,w)}"value"in A&&i(c,"value",k.value,A.value)}},$=(c,m,k,A,T,I,R,N,E)=>{const B=m.el=c?c.el:a(""),K=m.anchor=c?c.anchor:a("");let{patchFlag:P,dynamicChildren:j,slotScopeIds:L}=m;L&&(N=N?N.concat(L):L),c==null?(o(B,k,A),o(K,k,A),F(m.children,k,K,T,I,R,N,E)):P>0&&P&64&&j&&c.dynamicChildren?(X(c.dynamicChildren,j,k,T,I,R,N),(m.key!=null||T&&m===T.subTree)&&traverseStaticChildren(c,m,!0)):te(c,m,k,K,T,I,R,N,E)},ee=(c,m,k,A,T,I,R,N,E)=>{m.slotScopeIds=N,c==null?m.shapeFlag&512?T.ctx.activate(m,k,A,R,E):le(m,k,A,T,I,R,E):de(c,m,E)},le=(c,m,k,A,T,I,R)=>{const N=c.component=createComponentInstance(c,A,T);if(isKeepAlive(c)&&(N.ctx.renderer=Z),setupComponent(N),N.asyncDep){if(T&&T.registerDep(N,se),!c.el){const E=N.subTree=createVNode(Comment);C(null,E,m,k)}return}se(N,c,m,k,T,I,R)},de=(c,m,k)=>{const A=m.component=c.component;if(shouldUpdateComponent(c,m,k))if(A.asyncDep&&!A.asyncResolved){oe(A,m,k);return}else A.next=m,invalidateJob(A.update),A.update();else m.el=c.el,A.vnode=m},se=(c,m,k,A,T,I,R)=>{const N=()=>{if(c.isMounted){let{next:K,bu:P,u:j,parent:L,vnode:q}=c,Y=K,G;toggleRecurse(c,!1),K?(K.el=q.el,oe(c,K,R)):K=q,P&&invokeArrayFns(P),(G=K.props&&K.props.onVnodeBeforeUpdate)&&invokeVNodeHook(G,L,K,q),toggleRecurse(c,!0);const J=renderComponentRoot(c),ne=c.subTree;c.subTree=J,g(ne,J,v(ne.el),z(ne),c,T,I),K.el=J.el,Y===null&&updateHOCHostEl(c,J.el),j&&queuePostRenderEffect(j,T),(G=K.props&&K.props.onVnodeUpdated)&&queuePostRenderEffect(()=>invokeVNodeHook(G,L,K,q),T)}else{let K;const{el:P,props:j}=m,{bm:L,m:q,parent:Y}=c,G=isAsyncWrapper(m);if(toggleRecurse(c,!1),L&&invokeArrayFns(L),!G&&(K=j&&j.onVnodeBeforeMount)&&invokeVNodeHook(K,Y,m),toggleRecurse(c,!0),P&&ie){const J=()=>{c.subTree=renderComponentRoot(c),ie(P,c.subTree,c,T,null)};G?m.type.__asyncLoader().then(()=>!c.isUnmounted&&J()):J()}else{const J=c.subTree=renderComponentRoot(c);g(null,J,k,A,c,T,I),m.el=J.el}if(q&&queuePostRenderEffect(q,T),!G&&(K=j&&j.onVnodeMounted)){const J=m;queuePostRenderEffect(()=>invokeVNodeHook(K,Y,J),T)}(m.shapeFlag&256||Y&&isAsyncWrapper(Y.vnode)&&Y.vnode.shapeFlag&256)&&c.a&&queuePostRenderEffect(c.a,T),c.isMounted=!0,m=k=A=null}},E=c.effect=new ReactiveEffect(N,()=>queueJob(B),c.scope),B=c.update=()=>E.run();B.id=c.uid,toggleRecurse(c,!0),B()},oe=(c,m,k)=>{m.component=c;const A=c.vnode.props;c.vnode=m,c.next=null,updateProps(c,m.props,A,k),updateSlots(c,m.children,k),pauseTracking(),flushPreFlushCbs(),resetTracking()},te=(c,m,k,A,T,I,R,N,E=!1)=>{const B=c&&c.children,K=c?c.shapeFlag:0,P=m.children,{patchFlag:j,shapeFlag:L}=m;if(j>0){if(j&128){ge(B,P,k,A,T,I,R,N,E);return}else if(j&256){fe(B,P,k,A,T,I,R,N,E);return}}L&8?(K&16&&w(B,T,I),P!==B&&_(k,P)):K&16?L&16?ge(B,P,k,A,T,I,R,N,E):w(B,T,I,!0):(K&8&&_(k,""),L&16&&F(P,k,A,T,I,R,N,E))},fe=(c,m,k,A,T,I,R,N,E)=>{c=c||EMPTY_ARR,m=m||EMPTY_ARR;const B=c.length,K=m.length,P=Math.min(B,K);let j;for(j=0;j<P;j++){const L=m[j]=E?cloneIfMounted(m[j]):normalizeVNode(m[j]);g(c[j],L,k,null,T,I,R,N,E)}B>K?w(c,T,I,!0,!1,P):F(m,k,A,T,I,R,N,E,P)},ge=(c,m,k,A,T,I,R,N,E)=>{let B=0;const K=m.length;let P=c.length-1,j=K-1;for(;B<=P&&B<=j;){const L=c[B],q=m[B]=E?cloneIfMounted(m[B]):normalizeVNode(m[B]);if(isSameVNodeType(L,q))g(L,q,k,null,T,I,R,N,E);else break;B++}for(;B<=P&&B<=j;){const L=c[P],q=m[j]=E?cloneIfMounted(m[j]):normalizeVNode(m[j]);if(isSameVNodeType(L,q))g(L,q,k,null,T,I,R,N,E);else break;P--,j--}if(B>P){if(B<=j){const L=j+1,q=L<K?m[L].el:A;for(;B<=j;)g(null,m[B]=E?cloneIfMounted(m[B]):normalizeVNode(m[B]),k,q,T,I,R,N,E),B++}}else if(B>j)for(;B<=P;)pe(c[B],T,I,!0),B++;else{const L=B,q=B,Y=new Map;for(B=q;B<=j;B++){const ae=m[B]=E?cloneIfMounted(m[B]):normalizeVNode(m[B]);ae.key!=null&&Y.set(ae.key,B)}let G,J=0;const ne=j-q+1;let me=!1,be=0;const he=new Array(ne);for(B=0;B<ne;B++)he[B]=0;for(B=L;B<=P;B++){const ae=c[B];if(J>=ne){pe(ae,T,I,!0);continue}let ce;if(ae.key!=null)ce=Y.get(ae.key);else for(G=q;G<=j;G++)if(he[G-q]===0&&isSameVNodeType(ae,m[G])){ce=G;break}ce===void 0?pe(ae,T,I,!0):(he[ce-q]=B+1,ce>=be?be=ce:me=!0,g(ae,m[ce],k,null,T,I,R,N,E),J++)}const ve=me?getSequence(he):EMPTY_ARR;for(G=ve.length-1,B=ne-1;B>=0;B--){const ae=q+B,ce=m[ae],xe=ae+1<K?m[ae+1].el:A;he[B]===0?g(null,ce,k,xe,T,I,R,N,E):me&&(G<0||B!==ve[G]?ue(ce,k,xe,2):G--)}}},ue=(c,m,k,A,T=null)=>{const{el:I,type:R,transition:N,children:E,shapeFlag:B}=c;if(B&6){ue(c.component.subTree,m,k,A);return}if(B&128){c.suspense.move(m,k,A);return}if(B&64){R.move(c,m,k,Z);return}if(R===Fragment){o(I,m,k);for(let P=0;P<E.length;P++)ue(E[P],m,k,A);o(c.anchor,m,k);return}if(R===Static){O(c,m,k);return}if(A!==2&&B&1&&N)if(A===0)N.beforeEnter(I),o(I,m,k),queuePostRenderEffect(()=>N.enter(I),T);else{const{leave:P,delayLeave:j,afterLeave:L}=N,q=()=>o(I,m,k),Y=()=>{P(I,()=>{q(),L&&L()})};j?j(I,q,Y):Y()}else o(I,m,k)},pe=(c,m,k,A=!1,T=!1)=>{const{type:I,props:R,ref:N,children:E,dynamicChildren:B,shapeFlag:K,patchFlag:P,dirs:j}=c;if(N!=null&&setRef(N,null,k,c,!0),K&256){m.ctx.deactivate(c);return}const L=K&1&&j,q=!isAsyncWrapper(c);let Y;if(q&&(Y=R&&R.onVnodeBeforeUnmount)&&invokeVNodeHook(Y,m,c),K&6)f(c.component,k,A);else{if(K&128){c.suspense.unmount(k,A);return}L&&invokeDirectiveHook(c,null,m,"beforeUnmount"),K&64?c.type.remove(c,m,k,T,Z,A):B&&(I!==Fragment||P>0&&P&64)?w(B,m,k,!1,!0):(I===Fragment&&P&384||!T&&K&16)&&w(E,m,k),A&&Ce(c)}(q&&(Y=R&&R.onVnodeUnmounted)||L)&&queuePostRenderEffect(()=>{Y&&invokeVNodeHook(Y,m,c),L&&invokeDirectiveHook(c,null,m,"unmounted")},k)},Ce=c=>{const{type:m,el:k,anchor:A,transition:T}=c;if(m===Fragment){we(k,A);return}if(m===Static){M(c);return}const I=()=>{r(k),T&&!T.persisted&&T.afterLeave&&T.afterLeave()};if(c.shapeFlag&1&&T&&!T.persisted){const{leave:R,delayLeave:N}=T,E=()=>R(k,I);N?N(c.el,I,E):E()}else I()},we=(c,m)=>{let k;for(;c!==m;)k=y(c),r(c),c=k;r(m)},f=(c,m,k)=>{const{bum:A,scope:T,update:I,subTree:R,um:N}=c;A&&invokeArrayFns(A),T.stop(),I&&(I.active=!1,pe(R,c,m,k)),N&&queuePostRenderEffect(N,m),queuePostRenderEffect(()=>{c.isUnmounted=!0},m),m&&m.pendingBranch&&!m.isUnmounted&&c.asyncDep&&!c.asyncResolved&&c.suspenseId===m.pendingId&&(m.deps--,m.deps===0&&m.resolve())},w=(c,m,k,A=!1,T=!1,I=0)=>{for(let R=I;R<c.length;R++)pe(c[R],m,k,A,T)},z=c=>c.shapeFlag&6?z(c.component.subTree):c.shapeFlag&128?c.suspense.next():y(c.anchor||c.el),V=(c,m,k)=>{c==null?m._vnode&&pe(m._vnode,null,null,!0):g(m._vnode||null,c,m,null,null,null,k),flushPreFlushCbs(),flushPostFlushCbs(),m._vnode=c},Z={p:g,um:pe,m:ue,r:Ce,mt:le,mc:F,pc:te,pbc:X,n:z,o:e};let H,ie;return t&&([H,ie]=t(Z)),{render:V,hydrate:H,createApp:createAppAPI(V,H)}}function toggleRecurse({effect:e,update:t},n){e.allowRecurse=t.allowRecurse=n}function traverseStaticChildren(e,t,n=!1){const o=e.children,r=t.children;if(isArray(o)&&isArray(r))for(let i=0;i<o.length;i++){const l=o[i];let a=r[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=r[i]=cloneIfMounted(r[i]),a.el=l.el),n||traverseStaticChildren(l,a)),a.type===Text&&(a.el=l.el)}}function getSequence(e){const t=e.slice(),n=[0];let o,r,i,l,a;const s=e.length;for(o=0;o<s;o++){const u=e[o];if(u!==0){if(r=n[n.length-1],e[r]<u){t[o]=r,n.push(o);continue}for(i=0,l=n.length-1;i<l;)a=i+l>>1,e[n[a]]<u?i=a+1:l=a;u<e[n[i]]&&(i>0&&(t[o]=n[i-1]),n[i]=o)}}for(i=n.length,l=n[i-1];i-- >0;)n[i]=l,l=t[l];return n}const isTeleport=e=>e.__isTeleport,isTeleportDisabled=e=>e&&(e.disabled||e.disabled===""),isTargetSVG=e=>typeof SVGElement!="undefined"&&e instanceof SVGElement,resolveTarget=(e,t)=>{const n=e&&e.to;return isString(n)?t?t(n):null:n},TeleportImpl={__isTeleport:!0,process(e,t,n,o,r,i,l,a,s,u){const{mc:_,pc:v,pbc:y,o:{insert:S,querySelector:b,createText:g,createComment:d}}=u,C=isTeleportDisabled(t.props);let{shapeFlag:x,children:O,dynamicChildren:M}=t;if(e==null){const U=t.el=g(""),D=t.anchor=g("");S(U,n,o),S(D,n,o);const W=t.target=resolveTarget(t.props,b),F=t.targetAnchor=g("");W&&(S(F,W),l=l||isTargetSVG(W));const Q=(X,re)=>{x&16&&_(O,X,re,r,i,l,a,s)};C?Q(n,D):W&&Q(W,F)}else{t.el=e.el;const U=t.anchor=e.anchor,D=t.target=e.target,W=t.targetAnchor=e.targetAnchor,F=isTeleportDisabled(e.props),Q=F?n:D,X=F?U:W;if(l=l||isTargetSVG(D),M?(y(e.dynamicChildren,M,Q,r,i,l,a),traverseStaticChildren(e,t,!0)):s||v(e,t,Q,X,r,i,l,a,!1),C)F||moveTeleport(t,n,U,u,1);else if((t.props&&t.props.to)!==(e.props&&e.props.to)){const re=t.target=resolveTarget(t.props,b);re&&moveTeleport(t,re,null,u,0)}else F&&moveTeleport(t,D,W,u,1)}updateCssVars(t)},remove(e,t,n,o,{um:r,o:{remove:i}},l){const{shapeFlag:a,children:s,anchor:u,targetAnchor:_,target:v,props:y}=e;if(v&&i(_),(l||!isTeleportDisabled(y))&&(i(u),a&16))for(let S=0;S<s.length;S++){const b=s[S];r(b,t,n,!0,!!b.dynamicChildren)}},move:moveTeleport,hydrate:hydrateTeleport};function moveTeleport(e,t,n,{o:{insert:o},m:r},i=2){i===0&&o(e.targetAnchor,t,n);const{el:l,anchor:a,shapeFlag:s,children:u,props:_}=e,v=i===2;if(v&&o(l,t,n),(!v||isTeleportDisabled(_))&&s&16)for(let y=0;y<u.length;y++)r(u[y],t,n,2);v&&o(a,t,n)}function hydrateTeleport(e,t,n,o,r,i,{o:{nextSibling:l,parentNode:a,querySelector:s}},u){const _=t.target=resolveTarget(t.props,s);if(_){const v=_._lpa||_.firstChild;if(t.shapeFlag&16)if(isTeleportDisabled(t.props))t.anchor=u(l(e),t,a(e),n,o,r,i),t.targetAnchor=v;else{t.anchor=l(e);let y=v;for(;y;)if(y=l(y),y&&y.nodeType===8&&y.data==="teleport anchor"){t.targetAnchor=y,_._lpa=t.targetAnchor&&l(t.targetAnchor);break}u(v,t,_,n,o,r,i)}updateCssVars(t)}return t.anchor&&l(t.anchor)}const Teleport=TeleportImpl;function updateCssVars(e){const t=e.ctx;if(t&&t.ut){let n=e.children[0].el;for(;n!==e.targetAnchor;)n.nodeType===1&&n.setAttribute("data-v-owner",t.uid),n=n.nextSibling;t.ut()}}const Fragment=Symbol(void 0),Text=Symbol(void 0),Comment=Symbol(void 0),Static=Symbol(void 0),blockStack=[];let currentBlock=null;function openBlock(e=!1){blockStack.push(currentBlock=e?null:[])}function closeBlock(){blockStack.pop(),currentBlock=blockStack[blockStack.length-1]||null}let isBlockTreeEnabled=1;function setBlockTracking(e){isBlockTreeEnabled+=e}function setupBlock(e){return e.dynamicChildren=isBlockTreeEnabled>0?currentBlock||EMPTY_ARR:null,closeBlock(),isBlockTreeEnabled>0&&currentBlock&&currentBlock.push(e),e}function createElementBlock(e,t,n,o,r,i){return setupBlock(createBaseVNode(e,t,n,o,r,i,!0))}function createBlock(e,t,n,o,r){return setupBlock(createVNode(e,t,n,o,r,!0))}function isVNode(e){return e?e.__v_isVNode===!0:!1}function isSameVNodeType(e,t){return e.type===t.type&&e.key===t.key}const InternalObjectKey="__vInternal",normalizeKey=({key:e})=>e!=null?e:null,normalizeRef=({ref:e,ref_key:t,ref_for:n})=>e!=null?isString(e)||isRef(e)||isFunction(e)?{i:currentRenderingInstance,r:e,k:t,f:!!n}:e:null;function createBaseVNode(e,t=null,n=null,o=0,r=null,i=e===Fragment?0:1,l=!1,a=!1){const s={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&normalizeKey(t),ref:t&&normalizeRef(t),scopeId:currentScopeId,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:o,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:currentRenderingInstance};return a?(normalizeChildren(s,n),i&128&&e.normalize(s)):n&&(s.shapeFlag|=isString(n)?8:16),isBlockTreeEnabled>0&&!l&&currentBlock&&(s.patchFlag>0||i&6)&&s.patchFlag!==32&&currentBlock.push(s),s}const createVNode=_createVNode;function _createVNode(e,t=null,n=null,o=0,r=null,i=!1){if((!e||e===NULL_DYNAMIC_COMPONENT)&&(e=Comment),isVNode(e)){const a=cloneVNode(e,t,!0);return n&&normalizeChildren(a,n),isBlockTreeEnabled>0&&!i&&currentBlock&&(a.shapeFlag&6?currentBlock[currentBlock.indexOf(e)]=a:currentBlock.push(a)),a.patchFlag|=-2,a}if(isClassComponent(e)&&(e=e.__vccOpts),t){t=guardReactiveProps(t);let{class:a,style:s}=t;a&&!isString(a)&&(t.class=normalizeClass(a)),isObject(s)&&(isProxy(s)&&!isArray(s)&&(s=extend({},s)),t.style=normalizeStyle(s))}const l=isString(e)?1:isSuspense(e)?128:isTeleport(e)?64:isObject(e)?4:isFunction(e)?2:0;return createBaseVNode(e,t,n,o,r,l,i,!0)}function guardReactiveProps(e){return e?isProxy(e)||InternalObjectKey in e?extend({},e):e:null}function cloneVNode(e,t,n=!1){const{props:o,ref:r,patchFlag:i,children:l}=e,a=t?mergeProps(o||{},t):o;return{__v_isVNode:!0,__v_skip:!0,type:e.type,props:a,key:a&&normalizeKey(a),ref:t&&t.ref?n&&r?isArray(r)?r.concat(normalizeRef(t)):[r,normalizeRef(t)]:normalizeRef(t):r,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:l,target:e.target,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==Fragment?i===-1?16:i|16:i,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:e.transition,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&cloneVNode(e.ssContent),ssFallback:e.ssFallback&&cloneVNode(e.ssFallback),el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce}}function createTextVNode(e=" ",t=0){return createVNode(Text,null,e,t)}function createCommentVNode(e="",t=!1){return t?(openBlock(),createBlock(Comment,null,e)):createVNode(Comment,null,e)}function normalizeVNode(e){return e==null||typeof e=="boolean"?createVNode(Comment):isArray(e)?createVNode(Fragment,null,e.slice()):typeof e=="object"?cloneIfMounted(e):createVNode(Text,null,String(e))}function cloneIfMounted(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:cloneVNode(e)}function normalizeChildren(e,t){let n=0;const{shapeFlag:o}=e;if(t==null)t=null;else if(isArray(t))n=16;else if(typeof t=="object")if(o&65){const r=t.default;r&&(r._c&&(r._d=!1),normalizeChildren(e,r()),r._c&&(r._d=!0));return}else{n=32;const r=t._;!r&&!(InternalObjectKey in t)?t._ctx=currentRenderingInstance:r===3&&currentRenderingInstance&&(currentRenderingInstance.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else isFunction(t)?(t={default:t,_ctx:currentRenderingInstance},n=32):(t=String(t),o&64?(n=16,t=[createTextVNode(t)]):n=8);e.children=t,e.shapeFlag|=n}function mergeProps(...e){const t={};for(let n=0;n<e.length;n++){const o=e[n];for(const r in o)if(r==="class")t.class!==o.class&&(t.class=normalizeClass([t.class,o.class]));else if(r==="style")t.style=normalizeStyle([t.style,o.style]);else if(isOn(r)){const i=t[r],l=o[r];l&&i!==l&&!(isArray(i)&&i.includes(l))&&(t[r]=i?[].concat(i,l):l)}else r!==""&&(t[r]=o[r])}return t}function invokeVNodeHook(e,t,n,o=null){callWithAsyncErrorHandling(e,t,7,[n,o])}const emptyAppContext=createAppContext();let uid=0;function createComponentInstance(e,t,n){const o=e.type,r=(t?t.appContext:e.appContext)||emptyAppContext,i={uid:uid++,vnode:e,type:o,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,scope:new EffectScope(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:normalizePropsOptions(o,r),emitsOptions:normalizeEmitsOptions(o,r),emit:null,emitted:null,propsDefaults:EMPTY_OBJ,inheritAttrs:o.inheritAttrs,ctx:EMPTY_OBJ,data:EMPTY_OBJ,props:EMPTY_OBJ,attrs:EMPTY_OBJ,slots:EMPTY_OBJ,refs:EMPTY_OBJ,setupState:EMPTY_OBJ,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=t?t.root:i,i.emit=emit.bind(null,i),e.ce&&e.ce(i),i}let currentInstance=null;const getCurrentInstance=()=>currentInstance||currentRenderingInstance,setCurrentInstance=e=>{currentInstance=e,e.scope.on()},unsetCurrentInstance=()=>{currentInstance&&currentInstance.scope.off(),currentInstance=null};function isStatefulComponent(e){return e.vnode.shapeFlag&4}let isInSSRComponentSetup=!1;function setupComponent(e,t=!1){isInSSRComponentSetup=t;const{props:n,children:o}=e.vnode,r=isStatefulComponent(e);initProps(e,n,r,t),initSlots(e,o);const i=r?setupStatefulComponent(e,t):void 0;return isInSSRComponentSetup=!1,i}function setupStatefulComponent(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=markRaw(new Proxy(e.ctx,PublicInstanceProxyHandlers));const{setup:o}=n;if(o){const r=e.setupContext=o.length>1?createSetupContext(e):null;setCurrentInstance(e),pauseTracking();const i=callWithErrorHandling(o,e,0,[e.props,r]);if(resetTracking(),unsetCurrentInstance(),isPromise(i)){if(i.then(unsetCurrentInstance,unsetCurrentInstance),t)return i.then(l=>{handleSetupResult(e,l,t)}).catch(l=>{handleError(l,e,0)});e.asyncDep=i}else handleSetupResult(e,i,t)}else finishComponentSetup(e,t)}function handleSetupResult(e,t,n){isFunction(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:isObject(t)&&(e.setupState=proxyRefs(t)),finishComponentSetup(e,n)}let compile;function finishComponentSetup(e,t,n){const o=e.type;if(!e.render){if(!t&&compile&&!o.render){const r=o.template||resolveMergedOptions(e).template;if(r){const{isCustomElement:i,compilerOptions:l}=e.appContext.config,{delimiters:a,compilerOptions:s}=o,u=extend(extend({isCustomElement:i,delimiters:a},l),s);o.render=compile(r,u)}}e.render=o.render||NOOP}setCurrentInstance(e),pauseTracking(),applyOptions(e),resetTracking(),unsetCurrentInstance()}function createAttrsProxy(e){return new Proxy(e.attrs,{get(t,n){return track(e,"get","$attrs"),t[n]}})}function createSetupContext(e){const t=o=>{e.exposed=o||{}};let n;return{get attrs(){return n||(n=createAttrsProxy(e))},slots:e.slots,emit:e.emit,expose:t}}function getExposeProxy(e){if(e.exposed)return e.exposeProxy||(e.exposeProxy=new Proxy(proxyRefs(markRaw(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in publicPropertiesMap)return publicPropertiesMap[n](e)},has(t,n){return n in t||n in publicPropertiesMap}}))}function isClassComponent(e){return isFunction(e)&&"__vccOpts"in e}const computed=(e,t)=>computed$1(e,t,isInSSRComponentSetup);function h(e,t,n){const o=arguments.length;return o===2?isObject(t)&&!isArray(t)?isVNode(t)?createVNode(e,null,[t]):createVNode(e,t):createVNode(e,null,t):(o>3?n=Array.prototype.slice.call(arguments,2):o===3&&isVNode(n)&&(n=[n]),createVNode(e,t,n))}const ssrContextKey=Symbol(""),useSSRContext=()=>inject(ssrContextKey),version="3.2.47",svgNS="http://www.w3.org/2000/svg",doc=typeof document!="undefined"?document:null,templateContainer=doc&&doc.createElement("template"),nodeOps={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,o)=>{const r=t?doc.createElementNS(svgNS,e):doc.createElement(e,n?{is:n}:void 0);return e==="select"&&o&&o.multiple!=null&&r.setAttribute("multiple",o.multiple),r},createText:e=>doc.createTextNode(e),createComment:e=>doc.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>doc.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,o,r,i){const l=n?n.previousSibling:t.lastChild;if(r&&(r===i||r.nextSibling))for(;t.insertBefore(r.cloneNode(!0),n),!(r===i||!(r=r.nextSibling)););else{templateContainer.innerHTML=o?`<svg>${e}</svg>`:e;const a=templateContainer.content;if(o){const s=a.firstChild;for(;s.firstChild;)a.appendChild(s.firstChild);a.removeChild(s)}t.insertBefore(a,n)}return[l?l.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}};function patchClass(e,t,n){const o=e._vtc;o&&(t=(t?[t,...o]:[...o]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}function patchStyle(e,t,n){const o=e.style,r=isString(n);if(n&&!r){if(t&&!isString(t))for(const i in t)n[i]==null&&setStyle(o,i,"");for(const i in n)setStyle(o,i,n[i])}else{const i=o.display;r?t!==n&&(o.cssText=n):t&&e.removeAttribute("style"),"_vod"in e&&(o.display=i)}}const importantRE=/\s*!important$/;function setStyle(e,t,n){if(isArray(n))n.forEach(o=>setStyle(e,t,o));else if(n==null&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{const o=autoPrefix(e,t);importantRE.test(n)?e.setProperty(hyphenate(o),n.replace(importantRE,""),"important"):e[o]=n}}const prefixes=["Webkit","Moz","ms"],prefixCache={};function autoPrefix(e,t){const n=prefixCache[t];if(n)return n;let o=camelize(t);if(o!=="filter"&&o in e)return prefixCache[t]=o;o=capitalize(o);for(let r=0;r<prefixes.length;r++){const i=prefixes[r]+o;if(i in e)return prefixCache[t]=i}return t}const xlinkNS="http://www.w3.org/1999/xlink";function patchAttr(e,t,n,o,r){if(o&&t.startsWith("xlink:"))n==null?e.removeAttributeNS(xlinkNS,t.slice(6,t.length)):e.setAttributeNS(xlinkNS,t,n);else{const i=isSpecialBooleanAttr(t);n==null||i&&!includeBooleanAttr(n)?e.removeAttribute(t):e.setAttribute(t,i?"":n)}}function patchDOMProp(e,t,n,o,r,i,l){if(t==="innerHTML"||t==="textContent"){o&&l(o,r,i),e[t]=n==null?"":n;return}if(t==="value"&&e.tagName!=="PROGRESS"&&!e.tagName.includes("-")){e._value=n;const s=n==null?"":n;(e.value!==s||e.tagName==="OPTION")&&(e.value=s),n==null&&e.removeAttribute(t);return}let a=!1;if(n===""||n==null){const s=typeof e[t];s==="boolean"?n=includeBooleanAttr(n):n==null&&s==="string"?(n="",a=!0):s==="number"&&(n=0,a=!0)}try{e[t]=n}catch{}a&&e.removeAttribute(t)}function addEventListener(e,t,n,o){e.addEventListener(t,n,o)}function removeEventListener(e,t,n,o){e.removeEventListener(t,n,o)}function patchEvent(e,t,n,o,r=null){const i=e._vei||(e._vei={}),l=i[t];if(o&&l)l.value=o;else{const[a,s]=parseName(t);if(o){const u=i[t]=createInvoker(o,r);addEventListener(e,a,u,s)}else l&&(removeEventListener(e,a,l,s),i[t]=void 0)}}const optionsModifierRE=/(?:Once|Passive|Capture)$/;function parseName(e){let t;if(optionsModifierRE.test(e)){t={};let o;for(;o=e.match(optionsModifierRE);)e=e.slice(0,e.length-o[0].length),t[o[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):hyphenate(e.slice(2)),t]}let cachedNow=0;const p=Promise.resolve(),getNow=()=>cachedNow||(p.then(()=>cachedNow=0),cachedNow=Date.now());function createInvoker(e,t){const n=o=>{if(!o._vts)o._vts=Date.now();else if(o._vts<=n.attached)return;callWithAsyncErrorHandling(patchStopImmediatePropagation(o,n.value),t,5,[o])};return n.value=e,n.attached=getNow(),n}function patchStopImmediatePropagation(e,t){if(isArray(t)){const n=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0},t.map(o=>r=>!r._stopped&&o&&o(r))}else return t}const nativeOnRE=/^on[a-z]/,patchProp=(e,t,n,o,r=!1,i,l,a,s)=>{t==="class"?patchClass(e,o,r):t==="style"?patchStyle(e,n,o):isOn(t)?isModelListener(t)||patchEvent(e,t,n,o,l):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):shouldSetAsProp(e,t,o,r))?patchDOMProp(e,t,o,i,l,a,s):(t==="true-value"?e._trueValue=o:t==="false-value"&&(e._falseValue=o),patchAttr(e,t,o,r))};function shouldSetAsProp(e,t,n,o){return o?!!(t==="innerHTML"||t==="textContent"||t in e&&nativeOnRE.test(t)&&isFunction(n)):t==="spellcheck"||t==="draggable"||t==="translate"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA"||nativeOnRE.test(t)&&isString(n)?!1:t in e}const TRANSITION="transition",ANIMATION="animation",Transition=(e,{slots:t})=>h(BaseTransition,resolveTransitionProps(e),t);Transition.displayName="Transition";const DOMTransitionPropsValidators={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String};Transition.props=extend({},BaseTransition.props,DOMTransitionPropsValidators);const callHook=(e,t=[])=>{isArray(e)?e.forEach(n=>n(...t)):e&&e(...t)},hasExplicitCallback=e=>e?isArray(e)?e.some(t=>t.length>1):e.length>1:!1;function resolveTransitionProps(e){const t={};for(const $ in e)$ in DOMTransitionPropsValidators||(t[$]=e[$]);if(e.css===!1)return t;const{name:n="v",type:o,duration:r,enterFromClass:i=`${n}-enter-from`,enterActiveClass:l=`${n}-enter-active`,enterToClass:a=`${n}-enter-to`,appearFromClass:s=i,appearActiveClass:u=l,appearToClass:_=a,leaveFromClass:v=`${n}-leave-from`,leaveActiveClass:y=`${n}-leave-active`,leaveToClass:S=`${n}-leave-to`}=e,b=normalizeDuration(r),g=b&&b[0],d=b&&b[1],{onBeforeEnter:C,onEnter:x,onEnterCancelled:O,onLeave:M,onLeaveCancelled:U,onBeforeAppear:D=C,onAppear:W=x,onAppearCancelled:F=O}=t,Q=($,ee,le)=>{removeTransitionClass($,ee?_:a),removeTransitionClass($,ee?u:l),le&&le()},X=($,ee)=>{$._isLeaving=!1,removeTransitionClass($,v),removeTransitionClass($,S),removeTransitionClass($,y),ee&&ee()},re=$=>(ee,le)=>{const de=$?W:x,se=()=>Q(ee,$,le);callHook(de,[ee,se]),nextFrame(()=>{removeTransitionClass(ee,$?s:i),addTransitionClass(ee,$?_:a),hasExplicitCallback(de)||whenTransitionEnds(ee,o,g,se)})};return extend(t,{onBeforeEnter($){callHook(C,[$]),addTransitionClass($,i),addTransitionClass($,l)},onBeforeAppear($){callHook(D,[$]),addTransitionClass($,s),addTransitionClass($,u)},onEnter:re(!1),onAppear:re(!0),onLeave($,ee){$._isLeaving=!0;const le=()=>X($,ee);addTransitionClass($,v),forceReflow(),addTransitionClass($,y),nextFrame(()=>{!$._isLeaving||(removeTransitionClass($,v),addTransitionClass($,S),hasExplicitCallback(M)||whenTransitionEnds($,o,d,le))}),callHook(M,[$,le])},onEnterCancelled($){Q($,!1),callHook(O,[$])},onAppearCancelled($){Q($,!0),callHook(F,[$])},onLeaveCancelled($){X($),callHook(U,[$])}})}function normalizeDuration(e){if(e==null)return null;if(isObject(e))return[NumberOf(e.enter),NumberOf(e.leave)];{const t=NumberOf(e);return[t,t]}}function NumberOf(e){return toNumber(e)}function addTransitionClass(e,t){t.split(/\s+/).forEach(n=>n&&e.classList.add(n)),(e._vtc||(e._vtc=new Set)).add(t)}function removeTransitionClass(e,t){t.split(/\s+/).forEach(o=>o&&e.classList.remove(o));const{_vtc:n}=e;n&&(n.delete(t),n.size||(e._vtc=void 0))}function nextFrame(e){requestAnimationFrame(()=>{requestAnimationFrame(e)})}let endId=0;function whenTransitionEnds(e,t,n,o){const r=e._endId=++endId,i=()=>{r===e._endId&&o()};if(n)return setTimeout(i,n);const{type:l,timeout:a,propCount:s}=getTransitionInfo(e,t);if(!l)return o();const u=l+"end";let _=0;const v=()=>{e.removeEventListener(u,y),i()},y=S=>{S.target===e&&++_>=s&&v()};setTimeout(()=>{_<s&&v()},a+1),e.addEventListener(u,y)}function getTransitionInfo(e,t){const n=window.getComputedStyle(e),o=b=>(n[b]||"").split(", "),r=o(`${TRANSITION}Delay`),i=o(`${TRANSITION}Duration`),l=getTimeout(r,i),a=o(`${ANIMATION}Delay`),s=o(`${ANIMATION}Duration`),u=getTimeout(a,s);let _=null,v=0,y=0;t===TRANSITION?l>0&&(_=TRANSITION,v=l,y=i.length):t===ANIMATION?u>0&&(_=ANIMATION,v=u,y=s.length):(v=Math.max(l,u),_=v>0?l>u?TRANSITION:ANIMATION:null,y=_?_===TRANSITION?i.length:s.length:0);const S=_===TRANSITION&&/\b(transform|all)(,|$)/.test(o(`${TRANSITION}Property`).toString());return{type:_,timeout:v,propCount:y,hasTransform:S}}function getTimeout(e,t){for(;e.length<t.length;)e=e.concat(e);return Math.max(...t.map((n,o)=>toMs(n)+toMs(e[o])))}function toMs(e){return Number(e.slice(0,-1).replace(",","."))*1e3}function forceReflow(){return document.body.offsetHeight}const getModelAssigner=e=>{const t=e.props["onUpdate:modelValue"]||!1;return isArray(t)?n=>invokeArrayFns(t,n):t};function onCompositionStart(e){e.target.composing=!0}function onCompositionEnd(e){const t=e.target;t.composing&&(t.composing=!1,t.dispatchEvent(new Event("input")))}const vModelText={created(e,{modifiers:{lazy:t,trim:n,number:o}},r){e._assign=getModelAssigner(r);const i=o||r.props&&r.props.type==="number";addEventListener(e,t?"change":"input",l=>{if(l.target.composing)return;let a=e.value;n&&(a=a.trim()),i&&(a=looseToNumber(a)),e._assign(a)}),n&&addEventListener(e,"change",()=>{e.value=e.value.trim()}),t||(addEventListener(e,"compositionstart",onCompositionStart),addEventListener(e,"compositionend",onCompositionEnd),addEventListener(e,"change",onCompositionEnd))},mounted(e,{value:t}){e.value=t==null?"":t},beforeUpdate(e,{value:t,modifiers:{lazy:n,trim:o,number:r}},i){if(e._assign=getModelAssigner(i),e.composing||document.activeElement===e&&e.type!=="range"&&(n||o&&e.value.trim()===t||(r||e.type==="number")&&looseToNumber(e.value)===t))return;const l=t==null?"":t;e.value!==l&&(e.value=l)}},systemModifiers=["ctrl","shift","alt","meta"],modifierGuards={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>"button"in e&&e.button!==0,middle:e=>"button"in e&&e.button!==1,right:e=>"button"in e&&e.button!==2,exact:(e,t)=>systemModifiers.some(n=>e[`${n}Key`]&&!t.includes(n))},withModifiers=(e,t)=>(n,...o)=>{for(let r=0;r<t.length;r++){const i=modifierGuards[t[r]];if(i&&i(n,t))return}return e(n,...o)},rendererOptions=extend({patchProp},nodeOps);let renderer;function ensureRenderer(){return renderer||(renderer=createRenderer(rendererOptions))}const createApp=(...e)=>{const t=ensureRenderer().createApp(...e),{mount:n}=t;return t.mount=o=>{const r=normalizeContainer(o);if(!r)return;const i=t._component;!isFunction(i)&&!i.render&&!i.template&&(i.template=r.innerHTML),r.innerHTML="";const l=n(r,!1,r instanceof SVGElement);return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),l},t};function normalizeContainer(e){return isString(e)?document.querySelector(e):e}var spells$1=[{no:"1",action:11385,patch:"4.5",spell:"\u6C34\u70AE",level:1,icon:"003253.png",icon_hr1:"003253_hr1.png",icon_book:"072203.png",icon_book_hr1:"072203_hr1.png",method:[{type:"special",text:"\u81EA\u52A8\u4E60\u5F97",level:1,color:"yellow"}]},{no:"2",action:11402,patch:"4.5",spell:"\u706B\u708E\u653E\u5C04",level:50,icon:"003270.png",icon_hr1:"003270_hr1.png",icon_book:"072220.png",icon_book_hr1:"072220_hr1.png",method:[{type:"dungeon",name:"\u7EB7\u4E89\u8981\u5730\u5E03\u96F7\u798F\u6D1B\u514B\u65AF\u91CE\u8425\u5730",mob:"6\u53F7\u54E5\u5E03\u6797\u5766\u514B",note:"BOSS #3",level:50},{type:"dungeon",name:"\u5E7B\u9F99\u6B8B\u9AB8\u5BC6\u7EA6\u4E4B\u5854",mob:"\u72EC\u722A\u5996\u79BD",level:50,note:"BOSS #1 \u526F\u672C\u5DF2\u4FEE\u6539",color:"grey"},{type:"dungeon",name:"\u5E7B\u9F99\u6B8B\u9AB8\u5BC6\u7EA6\u4E4B\u5854",mob:"\u9B54\u5BFC\u70AE\u8247",level:50,note:"BOSS #2"},{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u963F\u5C14\u6CD5\u5E7B\u58833",mob:"\u6B27\u7C73\u8304",level:70,color:"yellow",note:"\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 94\u82A5\u672B\u7206\u5F39 101\u751F\u6210\u5916\u8BBE"}]},{no:"3",action:11390,patch:"4.5",spell:"\u6C34\u6D41\u5410\u606F",level:50,icon:"003258.png",icon_hr1:"003258_hr1.png",icon_book:"072208.png",icon_book_hr1:"072208_hr1.png",method:[{type:"trail",name:"\u827E\u739B\u5409\u5A1C\u676F\u6597\u6280\u5927\u4F1A\u51B3\u8D5B",mob:"\u5965\u5C14\u7279\u7F57\u65AF",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2220",mob:"\u5965\u5C14\u7279\u7F57\u65AF",level:50},{type:"trail",name:"\u5229\u7EF4\u4E9A\u6851\u6B7C\u706D\u6218",mob:"\u5229\u7EF4\u4E9A\u6851",level:50},{type:"trail",name:"\u5229\u7EF4\u4E9A\u6851\u6B7C\u6B9B\u6218",mob:"\u5229\u7EF4\u4E9A\u6851",level:50}]},{no:"4",action:11389,patch:"4.5",spell:"\u72C2\u4E71",level:50,icon:"003257.png",icon_hr1:"003257_hr1.png",icon_book:"072207.png",icon_book_hr1:"072207_hr1.png",method:[{type:"dungeon",name:"\u9886\u822A\u660E\u706F\u5929\u72FC\u661F\u706F\u5854",mob:"\u7956",note:"BOSS #2\uFF0C\u6253\u7834\u4E24\u4E2A\u86CB\u540E\u4F7F\u7528\uFF0C\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\u3002\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 9\u82E6\u95F7\u4E4B\u6B4C\u3002",level:50,color:"yellow"},{type:"hunt",map:"\u62C9\u8BFA\u897F\u4E9A\u5916\u5730",rank:"A",position:[],mob:"\u89D2\u7956",level:50}]},{no:"5",action:11398,patch:"4.5",spell:"\u94BB\u5934\u70AE",level:46,icon:"003266.png",icon_hr1:"003266_hr1.png",icon_book:"072216.png",icon_book_hr1:"072216_hr1.png",method:[{type:"map",map:"\u5317\u8428\u7EB3\u5170",rank:null,position:[16,15,0],mob:"\u9B54\u5BFC\u5148\u950B\u5F3A\u5316\u578B",level:50,note:"\u8840\u91CF\u4F4E\u4E8E 60% \u540E\u4F7F\u7528",color:"yellow"},{type:"dungeon",name:"\u7EB7\u4E89\u8981\u5730\u5E03\u96F7\u798F\u6D1B\u514B\u65AF\u91CE\u8425\u5730",mob:"3\u53F7\u54E5\u5E03\u6797\u88C5\u7532",note:"BOSS #2",level:50},{type:"dungeon",name:"\u5E7B\u9F99\u6B8B\u9AB8\u5BC6\u7EA6\u4E4B\u5854",mob:"\u7B2C\u516D\u5927\u961F\u9B54\u5BFC\u5148\u950B",level:50,note:"BOSS#2\u53EC\u5524\u7684\u5C0F\u602A"},{type:"fate",map:"\u5317\u8428\u7EB3\u5170",name:"\u9006\u5411\u5DE5\u7A0B",mob:"\u5E9F\u5F03\u7684\u9B54\u5BFC\u5148\u950B",level:46,color:"red"},{type:"dungeon",name:"\u5E1D\u56FD\u5357\u65B9\u5821\u5916\u56F4\u6FC0\u6218",mob:"\u9B54\u5BFC\u5148\u950B\u3001\u9B54\u5BFC\u5148\u950B\u5F3A\u88AD\u578B",level:50,note:"\u526F\u672C\u5DF2\u5220\u9664",color:"grey"},{type:"dungeon",name:"\u5929\u5E55\u9B54\u5BFC\u57CE\u6700\u7EC8\u51B3\u6218",mob:"\u9B54\u5BFC\u5148\u950B\u91CD\u88C5\u578B",level:50,note:"\u526F\u672C\u5DF2\u5220\u9664",color:"grey"}]},{no:"6",action:11387,patch:"4.5",spell:"\u9AD8\u538B\u7535\u6D41",level:50,icon:"003255.png",icon_hr1:"003255_hr1.png",icon_book:"072205.png",icon_book_hr1:"072205_hr1.png",method:[{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u9082\u9005\u4E4B\u7AE01",mob:"\u81EA\u536B\u7CFB\u7EDF",level:50},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u9082\u9005\u4E4B\u7AE02",mob:"\u76D1\u89C6/\u51C0\u5316/\u9632\u536B/\u711A\u70E7/\u8FCE\u51FB/\u9632\u75AB/\u81EA\u536B\u7CFB\u7EDF",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2215",mob:"\u6597\u517D\u7CFB\u7EDF",level:50}]},{no:"7",action:11401,patch:"4.5",spell:"\u82E5\u9690\u82E5\u73B0",level:50,icon:"003269.png",icon_hr1:"003269_hr1.png",icon_book:"072219.png",icon_book_hr1:"072219_hr1.png",method:[{type:"hunt",map:"\u5317\u8428\u7EB3\u5170",rank:"B",position:[],mob:"\u6C38\u6052\u4E0D\u706D\u7684\u83F2\u5170\u5FB7\u526F\u8000\u58EB",note:"\u8FDC\u79BB\u76EE\u6807\u65F6\u77AC\u53D1\u4F7F\u7528",level:50,color:"yellow"},{type:"dungeon",name:"\u8150\u574F\u9057\u8FF9\u65E0\u9650\u57CE\u5E02\u8857\u53E4\u8FF9",mob:"\u5DF4\u5C14\u6CFD\u82AC",level:50,note:"BOSS #3\u524D\u5C0F\u602A"},{type:"dungeon",name:"\u60E8\u5267\u7075\u6BBF\u5854\u59C6\xB7\u5854\u62C9\u5893\u56ED",mob:"\u4F46\u4ED6\u6797\u3001\u5E7B\u5F71\u9A91\u58EB",level:50,note:"BOSS #2\u524D\u5C0F\u602A"}]},{no:"8",action:11407,patch:"4.5",spell:"\u7EC8\u6781\u9488",level:13,icon:"003275.png",icon_hr1:"003275_hr1.png",icon_book:"072225.png",icon_book_hr1:"072225_hr1.png",method:[{type:"map",map:"\u4E2D\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[15,15,0],mob:"\u6740\u624B\u80E1\u8702",level:13,color:"yellow"},{type:"dungeon",name:"\u53E4\u4EE3\u9057\u8FF9\u5580\u6069\u57CB\u6CA1\u5723\u5802",mob:"\u5723\u5802\u8702\u3001\u7CAA\u4FBF\u80E1\u8702",level:35,note:"BOSS #1\u524D\u5C0F\u602A"},{type:"dungeon",name:"\u8D22\u5B9D\u4F20\u8BF4\u7834\u8230\u5C9B",mob:"\u8C22\u5C14\u8FBE\u83B1\u9EC4\u8702",level:50,note:"\u4E00\u5B9A\u751F\u547D\u503C\u4EE5\u4E0B",color:"red"},{type:"dungeon",name:"\u7A7A\u4E2D\u795E\u57DF\u4E0D\u83B7\u5C9B",mob:"\u795E\u57DF\u80E1\u8702",level:60,note:"BOSS#1\u540E\u591A\u53EA",color:"red"}]},{no:"9",action:11386,patch:"4.5",spell:"\u82E6\u95F7\u4E4B\u6B4C",level:50,icon:"003254.png",icon_hr1:"003254_hr1.png",icon_book:"072204.png",icon_book_hr1:"072204_hr1.png",method:[{type:"dungeon",name:"\u9886\u822A\u660E\u706F\u5929\u72FC\u661F\u706F\u5854",mob:"\u585E\u58EC",level:50,color:"yellow",note:"BOSS #4\uFF0C\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 4\u72C2\u4E71"},{type:"hunt",map:"\u4F0A\u5C14\u7F8E\u683C",rank:"S",position:[],mob:"\u963F\u683C\u62C9\u4FC4\u73C0",level:80,note:"\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"}]},{no:"10",action:11404,patch:"4.5",spell:"\u6012\u89C6",level:47,icon:"003272.png",icon_hr1:"003272_hr1.png",icon_book:"072222.png",icon_book_hr1:"072222_hr1.png",method:[{type:"dungeon",name:"\u6BD2\u96FE\u6D1E\u7A9F\u9EC4\u91D1\u8C37",mob:"\u6570\u5E01\u5DE8\u4EBA",level:47,color:"yellow",note:"BOSS #2\uFF0C\u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A"},{type:"hunt",map:"\u4E2D\u8428\u7EB3\u5170",rank:"S",position:[],mob:"\u5E03\u9686\u7279\u65AF",level:50,color:"red"},{type:"map",map:"\u9057\u4EA7\u4E4B\u5730",rank:null,position:[25,33,0],mob:"\u5B64\u773C\u5DE8\u4EBA",level:98},{type:"fate",map:"\u9057\u4EA7\u4E4B\u5730",position:[24,34.5,0],name:"\u6028\u603C\u7684\u72EC\u773C\u2014\u2014\u590D\u4EC7\u8005",mob:"\u590D\u4EC7\u8005",level:98,color:"red"}]},{no:"11",action:11391,patch:"4.5",spell:"\u5E73\u539F\u9707\u88C2",level:28,icon:"003259.png",icon_hr1:"003259_hr1.png",icon_book:"072209.png",icon_book_hr1:"072209_hr1.png",method:[{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5317\u90E8\u6797\u533A",rank:null,position:[19,28,0],mob:"\u6CE5\u571F\u5DE8\u50CF",level:28},{type:"map",map:"\u5357\u8428\u7EB3\u5170",rank:null,position:[24,13,0],mob:"\u7802\u77F3\u5DE8\u50CF",level:29},{type:"map",map:"\u62C9\u8BFA\u897F\u4E9A\u5916\u5730",rank:null,position:[16,16,0],mob:"\u7384\u5CA9\u5DE8\u50CF",level:34},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",rank:null,position:[11,16,0],mob:"\u9668\u5751\u5DE8\u50CF",level:34},{type:"dungeon",name:"\u9A9A\u4E71\u5751\u9053\u94DC\u94C3\u94DC\u5C71",mob:"\u54E5\u9769\u5DE8\u50CF",level:50,note:"BOSS #2"},{type:"dungeon",name:"\u82CF\u9192\u9057\u8FF9\u5580\u6069\u57CB\u6CA1\u5723\u5802",mob:"\u5580\u6069\u5B88\u62A4\u8005",level:50,note:"BOSS #2\u540E\u9762"},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2225",mob:"\u542F\u793A\u8005",level:50},{type:"treasure",name:"\u60CA\u5947\u767E\u5B9D\u57CE",mob:"\u4E03\u5F69\u5DE8\u50CF",level:90,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u91D1\u6BD7\u7F57\u9CC4\u9769\u5730\u56FE\uFF08G14\uFF09",color:"red"}]},{no:"12",action:11393,patch:"4.5",spell:"\u6012\u53D1\u51B2\u51A0",level:20,icon:"003261.png",icon_hr1:"003261_hr1.png",icon_book:"072211.png",icon_book_hr1:"072211_hr1.png",method:[{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[18,24,0],mob:"\u72C2\u91CE\u75A3\u732A",level:20,color:"yellow"}]},{no:"13",action:11406,patch:"4.5",spell:"\u767D\u98CE",level:1,icon:"003274.png",icon_hr1:"003274_hr1.png",icon_book:"072224.png",icon_book_hr1:"072224_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 10 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"},{type:"trail",name:"\u65E0\u9650\u57CE\u7684\u6B7B\u6597",mob:"\u6069\u5947\u90FD",level:50},{type:"raid",name:"\u6B27\u7C73\u8304\u96F6\u5F0F\u65F6\u7A7A\u72ED\u7F1D \u5FB7\u5C14\u5854\u5E7B\u58833",mob:"\u767D\u7130",level:"70",color:"red"}]},{no:"14",action:11414,patch:"4.5",spell:"5\u7EA7\u77F3\u5316",level:28,icon:"003282.png",icon_hr1:"003282_hr1.png",icon_book:"072232.png",icon_book_hr1:"072232_hr1.png",method:[{type:"dungeon",name:"\u540D\u95E8\u5E9C\u90B8\u9759\u8BED\u5E84\u56ED",mob:"\u5E84\u56ED\u7684\u5B88\u536B",level:28,note:"BOSS #1\u95E8\u524D\u5C0F\u602A",color:"yellow"},{type:"raid",name:"\u6C34\u6676\u5854 \u53E4\u4EE3\u4EBA\u8FF7\u5BAB",mob:"\u8BC5\u5492\u4E4B\u773C\u3001\u8150\u673D\u4E4B\u773C",level:50}]},{no:"15",action:11400,patch:"4.5",spell:"\u950B\u5229\u83DC\u5200",level:50,icon:"003268.png",icon_hr1:"003268_hr1.png",icon_book:"072218.png",icon_book_hr1:"072218_hr1.png",method:[{type:"dungeon",name:"\u795E\u7075\u5723\u57DF\u653E\u6D6A\u795E\u53E4\u795E\u6BBF",mob:"\u51AC\u8D1D\u5229\u738B",note:"BOSS #3",level:50},{type:"hunt",map:"\u62C9\u8BFA\u897F\u4E9A\u9AD8\u5730",rank:"A",position:[],mob:"\u739B\u8D1D\u5229",level:50}]},{no:"16",action:11418,patch:"4.5",spell:"\u51B0\u68D8\u5C4F\u969C",level:9,icon:"003286.png",icon_hr1:"003286_hr1.png",icon_book:"072236.png",icon_book_hr1:"072236_hr1.png",method:[{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",rank:null,position:[27,24,0],mob:"\u6363\u86CB\u5C0F\u9B3C",level:9},{type:"map",map:"\u4E1C\u8428\u7EB3\u5170",rank:null,position:[14,19,0],mob:"\u7834\u574F\u5C0F\u9B54\u7CBE",level:19},{type:"dungeon",name:"\u540D\u95E8\u5E9C\u90B8\u9759\u8BED\u5E84\u56ED",mob:"\u5E84\u56ED\u5C0F\u4E11",note:"BOSS #2",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2225",mob:"\u542F\u793A\u8005",level:50},{type:"fate",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",name:"\u661F\u6B4C\u5F02\u95FB\uFF1A\u4F1F\u5927\u6B66\u58EB\u7684\u8BC1\u660E",mob:"\u5B88\u5E8F\u5C0F\u9B54\u7CBE",level:28,note:"\u6D3B\u52A8\u5DF2\u7ED3\u675F",color:"grey"}]},{no:"17",action:11395,patch:"4.5",spell:"\u5438\u8840",level:7,icon:"003263.png",icon_hr1:"003263_hr1.png",icon_book:"072213.png",icon_book_hr1:"072213_hr1.png",method:[{type:"map",map:"\u62C9\u8BFA\u897F\u4E9A\u4F4E\u5730",rank:null,position:[27,16,0],mob:"\u6D1E\u7A74\u8759\u8760",level:7},{type:"map",map:"\u4E2D\u8428\u7EB3\u5170",rank:null,position:[26,18,0],mob:"\u70C8\u9633\u8759\u8760",level:14},{type:"map",map:"\u897F\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[28,24,0],mob:"\u9EC4\u660F\u8759\u8760",level:15},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[17,23,0],mob:"\u6F06\u9ED1\u8759\u8760\u3001\u8840\u86A4",level:21},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5357\u90E8\u6797\u533A",rank:null,position:[24,23,0],mob:"\u5C0F\u72D0\u8760",level:37},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5317\u90E8\u6797\u533A",rank:null,position:[23,25,0],mob:"\u5C0F\u72D0\u8760",level:37},{type:"dungeon",name:"\u540D\u95E8\u5E9C\u90B8\u9759\u8BED\u5E84\u56ED",mob:"\u9601\u697C\u8759\u8760",level:28,note:"BOSS #1\u524D\u5C0F\u602A"},{type:"dungeon",name:"\u53E4\u4EE3\u9057\u8FF9\u5580\u6069\u57CB\u6CA1\u5723\u5802",mob:"\u5723\u5802\u8759\u8760",level:35,note:"BOSS #1\u524D\u5C0F\u602A",color:"red"},{type:"dungeon",name:"\u6D41\u6C99\u8FF7\u5BAB\u6A35\u9E23\u6D1E",mob:"\u6C99\u6F20\u8759\u8760",level:38,note:"\u5F00\u573A\u5C0F\u602A"},{type:"dungeon",name:"\u6BD2\u96FE\u6D1E\u7A9F\u9EC4\u91D1\u8C37",mob:"\u91D1\u8C37\u8759\u8760",level:47,note:"BOSS #2\u524D\u5C0F\u602A"},{type:"dungeon",name:"\u5251\u6597\u9886\u57DF\u65E5\u5F71\u5730\u4FEE\u70BC\u6240",mob:"\u65E5\u5F71\u5730\u8759\u8760",level:50,color:"red"},{type:"dungeon",name:"\u82CF\u9192\u9057\u8FF9\u5580\u6069\u57CB\u6CA1\u5723\u5802",mob:"\u5723\u5802\u8759\u8760",level:50,note:"BOSS #1\u524D\u5C0F\u602A"}]},{no:"18",action:11392,patch:"4.5",spell:"\u6A61\u679C\u70B8\u5F39",level:12,icon:"003260.png",icon_hr1:"003260_hr1.png",icon_book:"072210.png",icon_book_hr1:"072210_hr1.png",method:[{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5317\u90E8\u6797\u533A",rank:null,position:[27,28,0],mob:"\u5E7C\u4F53\u6811\u7CBE",level:12},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",rank:null,position:[27,15,0],mob:"\u5E7C\u4F53\u6811\u7CBE",level:12},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[13,25,0],mob:"\u5E7C\u4F53\u6811\u7CBE",level:12},{type:"hunt",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:"S",mob:"\u4E4C\u5C14\u4F3D\u9C81",level:50,color:"red"},{type:"dungeon",name:"\u90AA\u5FF5\u5996\u5730\u65E0\u9650\u57CE\u53E4\u5821",mob:"\u591A\u8282\u6811\u7CBE",level:50,color:"red"}]},{no:"19",action:11396,patch:"4.5",spell:"\u6295\u5F39",level:5,icon:"003264.png",icon_hr1:"003264_hr1.png",icon_book:"072214.png",icon_book_hr1:"072214_hr1.png",method:[{type:"map",map:"\u4E2D\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[23,21,0],mob:"\u54E5\u5E03\u6797\u9C7C\u5E08\u3001\u54E5\u5E03\u6797\u8D4C\u5F92",level:5},{type:"map",map:"\u897F\u8428\u7EB3\u5170",rank:null,position:[19,26,0],mob:"\u54E5\u5E03\u6797\u52AB\u532A",level:8},{type:"map",map:"\u897F\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[27,23,0],mob:"\u54E5\u5E03\u6797\u730E\u624B",level:18},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[11,28,0],mob:"\u54E5\u5E03\u6797\u730E\u624B",level:11},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5357\u90E8\u6797\u533A",rank:null,position:[28,21,0],mob:"\u54E5\u5E03\u6797\u66B4\u5F92",level:28},{type:"map",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:null,position:[32.8,23.3,0],mob:"\u54E5\u5E03\u6797\u6ED1\u7FD4\u5175",level:58},{type:"dungeon",name:"\u7EB7\u4E89\u8981\u5730\u5E03\u96F7\u798F\u6D1B\u514B\u65AF\u91CE\u8425\u5730",mob:"\u9752\u84DD\u4E4B\u624B\u6ED1\u7FD4\u5175",level:50,note:"2\u53F7boss\u65E0\u9650\u5237\uFF0Cboss\u4E4B\u524D\u540C\u540D\u602A\u4E0D\u4F1A\u4F7F\u7528\u8BE5\u6280\u80FD"},{type:"hunt",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:"A",position:[9.5,22,0],mob:"\u673A\u5DE5\u5175 \u65AF\u5229\u666E\u91D1\u514B\u65AF",level:60,color:"red"},{type:"guildhests",name:"\u884C\u4F1A\u4EE4\uFF1A\u51FB\u6E83\u54E5\u5E03\u6797\u70B8\u5F39\u519B\u56E2\uFF01",mob:" \u6CD5\u5916\u54E5\u5E03\u6797",level:25,color:"red"}]},{no:"20",action:11411,patch:"4.5",spell:"\u7834\u9632",level:1,icon:"003279.png",icon_hr1:"003279_hr1.png",icon_book:"072229.png",icon_book_hr1:"072229_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 5 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"21",action:11408,patch:"4.5",spell:"\u81EA\u7206",level:12,icon:"003276.png",icon_hr1:"003276_hr1.png",icon_book:"072226.png",icon_book_hr1:"072226_hr1.png",method:[{type:"map",map:"\u897F\u8428\u7EB3\u5170",rank:null,position:[27,16,0],mob:"\u6ED1\u884C\u7206\u5F39\u602A",level:12,color:"yellow"},{type:"dungeon",name:"\u5C01\u9501\u5751\u9053\u94DC\u94C3\u94DC\u5C71",mob:"\u7206\u7834\u7206\u5F39\u602A\u3001\u70C8\u706B\u5F39\u602A",level:17,color:"red"},{type:"dungeon",name:"\u9B54\u517D\u9886\u57DF\u65E5\u5F71\u5730\u4FEE\u70BC\u6240",mob:"\u74E6\u65AF\u5F39\u602A",level:20,color:"red"},{type:"dungeon",name:"\u540D\u95E8\u5E9C\u90B8\u9759\u8BED\u5E84\u56ED",mob:"\u592B\u4EBA\u624B\u63D0\u706F",level:28,note:"BOSS #3\u53EC\u5524\u7684\u5C0F\u602A"},{type:"dungeon",name:"\u6D41\u6C99\u8FF7\u5BAB\u6A35\u9E23\u6D1E",mob:"\u69B4\u9730\u5F39\u602A",level:38,note:"BOSS #1\u524D\u5C0F\u602A"},{type:"dungeon",name:"\u9A9A\u4E71\u5751\u9053\u94DC\u94C3\u94DC\u5C71",mob:"\u70C8\u706B\u5F39\u602A\u3001\u96F7\u6C5E\u5F39\u602A",level:50,note:"\u70C8\u706B\u5F39\u602A\u4E3A1\u53F7boss\u540E3\u4F53\uFF0C\u96F7\u6C5E\u5F39\u602A\u4E3A1\u53F7boSS\u540E1\u4F53\uFF0CHP\u4E00\u5B9A\u91CF\u4EE5\u4E0B",color:"red"},{type:"dungeon",name:"\u5730\u8109\u7075\u706F\u5929\u72FC\u661F\u706F\u5854",mob:"\u5B9A\u65F6\u7206\u5F39\u602A",level:60,note:"BOSS#2\u524D\u540E\u5C0F\u602A"},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u771F\u6E90\u4E4B\u7AE02",mob:"\u62A4\u536B\u7CFB\u7EDF",level:50,color:"red"},{type:"dungeon",name:"\u6587\u660E\u53E4\u8FF9\u5947\u5766\u90A3\u795E\u5F71\u6D1E",mob:"\u5947\u5766\u90A3\u56DE\u58F0",note:"BOSS#2\u540E\u5C0F\u602A2\u53EA",level:75,color:"red"},{type:"dungeon",name:"\u907F\u6691\u79BB\u5BAB\u9A6C\u5229\u5361\u5927\u4E95",mob:"\u5927\u4E95\u7206\u5CA9\u602A",note:"BOSS#1\u540E\u5C0F\u602A4\u53EA\uFF0C\u4F53\u529B\u4F4E\u4E8E30%\u540E\u4F7F\u7528",level:77}]},{no:"22",action:11409,patch:"4.5",spell:"\u878D\u5408",level:1,icon:"003277.png",icon_hr1:"003277_hr1.png",icon_book:"072227.png",icon_book_hr1:"072227_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 20 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"23",action:11403,patch:"4.5",spell:"\u62CD\u638C",level:6,icon:"003271.png",icon_hr1:"003271_hr1.png",icon_book:"072221.png",icon_book_hr1:"072221_hr1.png",method:[{type:"map",map:"\u4E2D\u8428\u7EB3\u5170",rank:null,position:[16,19,0],mob:"\u5362\u6069\u4EBA\u62A4\u7532\u624B",level:6},{type:"map",map:"\u4E1C\u8428\u7EB3\u5170",rank:null,position:[24,23,0],mob:"\u5362\u6069\u4EBA\u8DD1\u7350\u624B",level:26},{type:"map",map:"\u4E1C\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[26,32,0],mob:"\u5362\u6069\u4EBA\u70D8\u9E25\u624B",level:32},{type:"map",map:"\u62C9\u8BFA\u897F\u4E9A\u4F4E\u5730",rank:null,position:[19,35,0],mob:"\u5362\u6069\u4EBA\u62CD\u5CB8\u624B",level:32},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",rank:null,position:[17,20,0],mob:"\u5362\u6069\u4EBA\u6363\u4E71\u8005",level:10},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5317\u90E8\u6797\u533A",rank:null,position:[22,30,0],mob:"\u5362\u6069\u4EBA\u52A9\u730E\u8005",level:29}]},{no:"24",action:11423,patch:"4.5",spell:"\u6295\u63B7\u6C99\u4E01\u9C7C",level:30,icon:"003291.png",icon_hr1:"003291_hr1.png",icon_book:"072241.png",icon_book_hr1:"072241_hr1.png",method:[{type:"map",map:"\u4E1C\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[27,35,0],mob:"\u78A7\u4F01\u9E45",level:30,color:"yellow"},{type:"hunt",map:"\u4E1C\u62C9\u8BFA\u897F\u4E9A",rank:"B",position:[],mob:"\u8840\u8165\u739B\u4E3D",level:50,color:"red"}]},{no:"25",action:11383,patch:"4.5",spell:"\u9F3B\u606F",level:50,icon:"003251.png",icon_hr1:"003251_hr1.png",icon_book:"072201.png",icon_book_hr1:"072201_hr1.png",method:[{type:"trail",name:"\u827E\u739B\u5409\u5A1C\u676F\u6597\u6280\u5927\u4F1A\u51B3\u8D5B",mob:"\u63D0\u4E30",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2220",mob:"\u63D0\u4E30",level:50}]},{no:"26",action:11384,patch:"4.5",spell:"4\u661F\u5428",level:50,icon:"003252.png",icon_hr1:"003252_hr1.png",icon_book:"072202.png",icon_book_hr1:"072202_hr1.png",method:[{type:"trail",name:"\u827E\u739B\u5409\u5A1C\u676F\u6597\u6280\u5927\u4F1A\u51B3\u8D5B",mob:"\u5965\u5C14\u7279\u7F57\u65AF",level:50,color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u897F\u683C\u739B\u5E7B\u58833",mob:"\u5965\u5C14\u7279\u7F57\u65AF",level:"70",note:"\u786E\u5B9A\u4E0D\u4F1A\u4F7F\u7528",color:"grey"}]},{no:"27",action:11399,patch:"4.5",spell:"\u8BE1\u5F02\u89C6\u7EBF",level:50,icon:"003267.png",icon_hr1:"003267_hr1.png",icon_book:"072217.png",icon_book_hr1:"072217_hr1.png",method:[{type:"dungeon",name:"\u79D8\u672C\u5B9D\u5E93\u8FE6\u5DF4\u52D2\u5E7B\u60F3\u56FE\u4E66\u9986",mob:"\u62DC\u4E66\u9B54",level:60,note:"BOSS #1\u524D\u5C0F\u602A\uFF0C\u65E0\u8BFB\u6761\u987A\u5288\uFF0C\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 60\u9B54\u6CD5\u9524 76\u5C0F\u4FA6\u6D4B\u3002\u6070\u597D\u662F\u7B2C\u4E00\u6CE2\u602A\u4E2D\u552F\u4E00\u6709\u50AC\u7720\u6297\u6027\u7684\uFF0C\u540C\u6B65\u65F6\u63A8\u8350\u4F7F\u7528\u804C\u80FD\u6280\u80FD\u5148\u5C06\u7B2C\u4E00\u6CE2\u5168\u90E8\u50AC\u7720\uFF0C\u7B49\u5B83\u653E\u6280\u80FD\u540E\u5BD2\u51B0\u5486\u54EE+\u8D85\u632F\u52A8",color:"yellow"},{type:"levequests",map:"\u6469\u675C\u7EB3",rank:null,position:null,mob:"\u711A\u4E66\u4EFB\u52A1\uFF1A\u56DE\u6536\u7981\u4E66\u300A\u5C16\u7259\u5229\u9F7F\u7684\u602A\u7269\u300B \u6697\u9ED1\u624E\u54C8\u514B",level:50,color:"red"},{type:"dungeon",name:"\u90AA\u6559\u9A7B\u5730\u65E0\u9650\u57CE\u53E4\u5821",mob:"\u963F\u96BE\u5854\u6CE2\u5609",level:50,color:"red"},{type:"raid",name:"\u6C34\u6676\u5854 \u53E4\u4EE3\u4EBA\u8FF7\u5BAB",mob:"\u74E6\u529B\u5F17",level:50,color:"red"},{type:"fate",map:"\u62C9\u8BFA\u897F\u4E9A\u9AD8\u5730",name:"\u661F\u6B4C\u5F02\u95FB\uFF1A\u955C\u91CC\u8574\u5965",mob:"\u6050\u614C\u5DE8\u9F99",level:33,note:"\u6D3B\u52A8\u5DF2\u7ED3\u675F",color:"grey"}]},{no:"28",action:11388,patch:"4.5",spell:"\u81ED\u6C14",level:31,icon:"003256.png",icon_hr1:"003256_hr1.png",icon_book:"072206.png",icon_book_hr1:"072206_hr1.png",method:[{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E2D\u592E\u6797\u533A",rank:null,position:[18,21,0],mob:"\u5957\u7D22\u82B1\u3001\u81ED\u5957\u7D22\u82B1",level:31},{type:"map",map:"\u6469\u675C\u7EB3",rank:null,position:[14,14,0],mob:"\u9B54\u754C\u82B1",level:44},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u5357\u90E8\u6797\u533A",rank:null,position:[21,28,0],mob:"\u5957\u7D22\u82B1",level:31},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[23,21,0],mob:"\u9B54\u754C\u82B1",level:44},{type:"map",map:"\u592A\u9633\u795E\u8349\u539F",rank:null,position:[34.4,20.5,0],mob:"\u7D2B\u9B54\u82B1",level:65},{type:"fate",map:"\u592A\u9633\u795E\u8349\u539F",position:[30.2,15.8,0],name:"\u81ED\u5F97\u5192\u6CE1",mob:"\u7D2B\u9B54\u82B1",level:62,color:"red"},{type:"fate",map:"\u592A\u9633\u795E\u8349\u539F",position:[33,24.6,0],name:"\u91CD\u9022\u7684\u963B\u6320\u8005\u2014\u2014\u592A\u9633\u9B54\u82B1\u7EB3\u5170\u5207\u5207\u683C",mob:"\u592A\u9633\u9B54\u82B1\u7EB3\u5170\u5207\u5207\u683C",level:62,color:"red"},{type:"dungeon",name:"\u6BD2\u96FE\u6D1E\u7A9F\u9EC4\u91D1\u8C37",mob:"\u9B54\u754C\u82B1\u3001\u5B88\u8D22\u592B\u4EBA",note:"BOSS #2\u524D\u4E00\u53EA, BOSS #3\u524D\u4E24\u53EA\uFF0CBOSS #3",level:47},{type:"dungeon",name:"\u90AA\u5FF5\u5996\u5730\u65E0\u9650\u57CE\u53E4\u5821",mob:"\u9B54\u754C\u8537\u8587",level:50,note:"1\u53F7boss\u540E2\u4F53",color:"red"},{type:"dungeon",name:"\u98CE\u6C34\u7075\u5E99\u5CA9\u71D5\u5E99",mob:"\u4EBA\u9762\u6811",level:70,note:"BOSS #2\u524D\u5C0F\u602A"}]},{no:"29",action:11424,patch:"4.5",spell:"\u8D85\u786C\u5316",level:50,icon:"003292.png",icon_hr1:"003292_hr1.png",icon_book:"072242.png",icon_book_hr1:"072242_hr1.png",method:[{type:"dungeon",name:"\u6FC0\u6218\u57CE\u585E\u77F3\u536B\u5854",mob:"\u5E93\u5361\u9F99\u9F9F",level:50,note:"BOSS #2\uFF0C\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",color:"yellow"},{type:"fate",map:"\u9F99\u5821\u53C2\u5929\u9AD8\u5730",name:"\u575A\u7532\u94C1\u9F99\u2014\u2014\u5854\u62C9\u65AF\u514B",mob:"\u5854\u62C9\u65AF\u514B",level:53,note:"\u6210\u5C31\u5371\u547D",color:"red"},{type:"dungeon",name:"\u7687\u90FD\u4F0A\u4FEE\u52A0\u5FB7\u4FDD\u536B\u6218",mob:"\u90E8\u843D\u9F99\u9F9F",level:50,note:"\u526F\u672C\u5DF2\u5220\u9664",color:"grey"}]},{no:"30",action:11417,patch:"4.5",spell:"\u5F3A\u529B\u5B88\u62A4",level:1,icon:"003285.png",icon_hr1:"003285_hr1.png",icon_book:"072235.png",icon_book_hr1:"072235_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 10 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"31",action:11412,patch:"4.5",spell:"\u6ED1\u820C",level:2,icon:"003280.png",icon_hr1:"003280_hr1.png",icon_book:"072230.png",icon_book_hr1:"072230_hr1.png",method:[{type:"fate",map:"\u62C9\u8BFA\u897F\u4E9A\u4F4E\u5730",name:"\u86D9\u86D9\u5B50",position:[24,22,0],mob:"\u6756\u87FE\u870D",level:2},{type:"hunt",map:"\u62C9\u8BFA\u897F\u4E9A\u4F4E\u5730",rank:"S",position:[],mob:"\u5495\u5C14\u5471\u6D1B\u65AF",level:50,color:"red"},{type:"map",map:"\u897F\u8428\u7EB3\u5170",rank:null,position:[23,23,0],mob:"\u6C99\u87FE\u870D",level:14},{type:"map",map:"\u4E2D\u8428\u7EB3\u5170",rank:null,position:[27,19,0],mob:"\u6BD2\u87FE\u870D",level:14},{type:"map",map:"\u897F\u8428\u7EB3\u5170",rank:null,position:[15,7,0],mob:"\u75F4\u7B11\u5DE8\u87FE\u870D",level:24,color:"yellow"},{type:"map",map:"\u4E1C\u62C9\u8BFA\u897F\u4E9A",rank:null,position:[17,27,0],mob:"\u5DE8\u87FE\u870D",level:33},{type:"map",map:"\u9ED1\u8863\u68EE\u6797\u4E1C\u90E8\u6797\u533A",rank:null,position:[26,18,0],mob:"\u68A6\u87FE\u870D",level:46},{type:"dungeon",name:"\u9A9A\u4E71\u5751\u9053\u94DC\u94C3\u94DC\u5C71",mob:"\u94DC\u94C3\u591C\u87FE\u870D",level:50,note:"2\u53F7boss\u540E2\u4F53"},{type:"dungeon",name:"\u5E7B\u9F99\u6B8B\u9AB8\u5BC6\u7EA6\u4E4B\u5854",mob:"\u6218\u8230\u591C\u87FE\u870D",level:50,note:"\u5F00\u573A1\u4F53"},{type:"dungeon",name:"\u5C71\u4E2D\u6218\u7EBF\u6CFD\u6885\u5C14\u8981\u585E",mob:"\u97E7\u9AA8\u591C\u87FE",level:44,note:"1\u53F7boss\u540E3\u4F53"},{type:"dungeon",name:"\u6BD2\u96FE\u6D1E\u9EC4\u91D1\u8C37",mob:"\u5730\u5E95\u591C\u87FE\u870D",level:47,note:"BOSS #1\u524D\u4E24\u53EA"},{type:"dungeon",name:"\u6B66\u88C5\u5723\u57DF\u653E\u6D6A\u795E\u53E4\u795E\u6BBF",mob:"\u7280\u8734\u9972\u6599",level:50,note:"2\u53F7boss\u540E\u6253\u5B8C\u7C98\u6DB2\u602A1\u4F53"},{type:"guildhests",name:"\u884C\u4F1A\u4EE4\uFF1A\u7A81\u7834\u6240\u6709\u5173\u95E8\uFF0C\u8BA8\u4F10\u6700\u6DF1\u5904\u7684\u654C\u4EBA\uFF01",mob:"\u8D8A\u58C1\u87FE\u870D",level:15,color:"red"}]},{no:"32",action:11410,patch:"4.5",spell:"\u6CB9\u6027\u5206\u6CCC\u7269",level:24,icon:"003278.png",icon_hr1:"003278_hr1.png",icon_book:"072228.png",icon_book_hr1:"072228_hr1.png",method:[{type:"map",map:"\u897F\u8428\u7EB3\u5170",rank:null,position:[15,7,0],mob:"\u75F4\u7B11\u5DE8\u87FE\u870D",level:24,note:"\u65E0\u8BFB\u6761\u77AC\u53D1\u4F7F\u7528\uFF0C\u8D4B\u4E88\u81EA\u8EAB\u56DE\u907F\u7387\u63D0\u9AD8\u7684buff",color:"yellow"},{type:"dungeon",name:"\u9A9A\u4E71\u5751\u9053\u94DC\u94C3\u94DC\u5C71",mob:"\u94DC\u94C3\u591C\u87FE",level:50,note:"2\u53F7boss\u540E2\u4F53"}]},{no:"33",action:11419,patch:"4.5",spell:"\u5BD2\u51B0\u5486\u54EE",level:38,icon:"003287.png",icon_hr1:"003287_hr1.png",icon_book:"072237.png",icon_book_hr1:"072237_hr1.png",method:[{type:"trail",name:"\u6B7B\u5316\u5947\u7F8E\u62C9\u8BA8\u4F10\u6218",mob:"\u6B7B\u5316\u5947\u7F8E\u62C9",level:50},{type:"dungeon",name:"\u6D41\u6C99\u8FF7\u5BAB\u6A35\u9E23\u6D1E",mob:"\u5947\u7F8E\u62C9",level:38,note:"BOSS #3"},{type:"raid",name:"\u6C34\u6676\u5854 \u6697\u4E4B\u4E16\u754C",mob:"\u52A0\u59C6",level:50,note:"\u751F\u547D\u503C\u4F4E\u4E8E50%\u65F6\u548F\u5531\uFF0C\u8FDB\u672C\u89C1\u5230\u7684\u524D\u4E09\u53EA\u602A\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\u3002\u6CE8\u610F\u53EA\u6709\u5F00\u602A\u7684\u5C0F\u961F\u53EF\u4EE5\u5B66\u5230"},{type:"dungeon",name:"\u535A\u7269\u6218\u8230\u65E0\u9650\u56DE\u5ECA",mob:"\u5B8C\u7F8E\u5947\u7F8E\u62C9",level:60,note:"BOSS #2\u524D\u7CBE\u82F1\u602A1\u53EA\uFF0C\u540C\u6B65\u65F6\u53EF\u4EE5\u8003\u8651\u50AC\u7720\u6574\u6CE2\u602A\u540E\u5355\u72EC\u6253\u9192"},{type:"dungeon",name:"\u8840\u6218\u82CD\u7A79\u9B54\u79D1\u5B66\u7814\u7A76\u6240",mob:"\u4EBA\u5DE5\u57F9\u517B\u5947\u7F8E\u62C9",level:60,note:"BOSS #2\u524D\u7CBE\u82F1\u602A1\u53EA\uFF0C\u540C\u6B65\u65F6\u53EF\u4EE5\u8003\u8651\u50AC\u7720\u6574\u6CE2\u602A\u540E\u5355\u72EC\u6253\u9192"},{type:"fate",map:"\u5317\u8428\u7EB3\u5170",name:"\u72C2\u66B4\u5DE8\u517D\u2014\u2014\u5F3A\u5316\u5947\u7F8E\u62C9",mob:"\u5F3A\u5316\u5947\u7F8E\u62C9",level:49,note:"\u6210\u5C31\u5371\u547D\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\u3002\u4F3C\u4E4E\u5728\u4F4E\u4F53\u529B\u65F6\u66F4\u5BB9\u6613\u548F\u5531"},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2221",mob:"\u963F\u76AE\u72C4\u9A6C",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2225",mob:"\u963F\u6CE2\u5361\u91CC\u666E\u65AF",level:50},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u5165\u4FB5\u4E4B\u7AE02",mob:"\u539F\u578B\u5947\u7F8E\u62C9",note:"\u7B2C\u4E09\u6CE2\u5C0F\u602A\u4E4B\u4E00\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\uFF0C\u4F46\u51BB\u7ED3\u3001\u77F3\u5316\u3001\u7729\u6655\u3001\u7761\u7720\u3001\u9EBB\u75F9\u7B49\u6548\u679C\u65E0\u6548",level:50},{type:"raid",name:"\u5931\u843D\u4E4B\u90FD\u62C9\u5DF4\u7EB3\u65AF\u5854",mob:"\u53E4\u5947\u7F8E\u62C9",level:70,note:"BOSS #2\u540E\u7CBE\u82F1\u602A2\u53EA",color:"red"},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93\u795E\u6BBF",mob:"\u795E\u6BBF\u5947\u7F8E\u62C9",note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red",level:70}]},{no:"34",action:11420,patch:"4.5",spell:"\u96F7\u7535\u5486\u54EE",level:38,icon:"003288.png",icon_hr1:"003288_hr1.png",icon_book:"072238.png",icon_book_hr1:"072238_hr1.png",method:[{type:"trail",name:"\u6B7B\u5316\u5947\u7F8E\u62C9\u8BA8\u4F10\u6218",mob:"\u5947\u7F8E\u62C9",level:50},{type:"dungeon",name:"\u6D41\u6C99\u8FF7\u5BAB\u6A35\u9E23\u6D1E",mob:"\u5947\u7F8E\u62C9",level:38,note:"BOSS #3"},{type:"raid",name:"\u6C34\u6676\u5854 \u6697\u4E4B\u4E16\u754C",mob:"\u52A0\u59C6",level:50,note:"\u751F\u547D\u503C\u4F4E\u4E8E50%\u65F6\u548F\u5531\uFF0C\u8FDB\u672C\u89C1\u5230\u7684\u524D\u4E09\u53EA\u602A\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\u3002\u6CE8\u610F\u53EA\u6709\u5F00\u602A\u7684\u5C0F\u961F\u53EF\u4EE5\u5B66\u5230"},{type:"dungeon",name:"\u535A\u7269\u6218\u8230\u65E0\u9650\u56DE\u5ECA",mob:"\u5B8C\u7F8E\u5947\u7F8E\u62C9",level:60,note:"BOSS #2\u524D\u7CBE\u82F1\u602A1\u53EA\uFF0C\u540C\u6B65\u65F6\u53EF\u4EE5\u8003\u8651\u50AC\u7720\u6574\u6CE2\u602A\u540E\u5355\u72EC\u6253\u9192"},{type:"dungeon",name:"\u8840\u6218\u82CD\u7A79\u9B54\u79D1\u5B66\u7814\u7A76\u6240",mob:"\u4EBA\u5DE5\u57F9\u517B\u5947\u7F8E\u62C9",level:60,note:"BOSS #2\u524D\u7CBE\u82F1\u602A1\u53EA\uFF0C\u540C\u6B65\u65F6\u53EF\u4EE5\u8003\u8651\u50AC\u7720\u6574\u6CE2\u602A\u540E\u5355\u72EC\u6253\u9192"},{type:"fate",map:"\u5317\u8428\u7EB3\u5170",name:"\u72C2\u66B4\u5DE8\u517D\u2014\u2014\u5F3A\u5316\u5947\u7F8E\u62C9",mob:"\u5F3A\u5316\u5947\u7F8E\u62C9",level:49,note:"\u6210\u5C31\u5371\u547D\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\u3002\u4F3C\u4E4E\u5728\u4F4E\u4F53\u529B\u65F6\u66F4\u5BB9\u6613\u548F\u5531"},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2221",mob:"\u963F\u76AE\u72C4\u9A6C",level:50},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2225",mob:"\u963F\u6CE2\u5361\u91CC\u666E\u65AF",level:50},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u5165\u4FB5\u4E4B\u7AE02",mob:"\u539F\u578B\u5947\u7F8E\u62C9",note:"\u7B2C\u4E09\u6CE2\u5C0F\u602A\u4E4B\u4E00\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548\uFF0C\u4F46\u51BB\u7ED3\u3001\u77F3\u5316\u3001\u7729\u6655\u3001\u7761\u7720\u3001\u9EBB\u75F9\u7B49\u6548\u679C\u65E0\u6548",level:50},{type:"raid",name:"\u5931\u843D\u4E4B\u90FD\u62C9\u5DF4\u7EB3\u65AF\u5854",mob:"\u53E4\u5947\u7F8E\u62C9",level:70,note:"BOSS #2\u540E\u7CBE\u82F1\u602A2\u53EA",color:"red"},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93\u795E\u6BBF",mob:"\u795E\u6BBF\u5947\u7F8E\u62C9",note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red",level:70}]},{no:"35",action:11405,patch:"4.5",spell:"\u5BFC\u5F39",level:50,icon:"003273.png",icon_hr1:"003273_hr1.png",icon_book:"072223.png",icon_book_hr1:"072223_hr1.png",method:[{type:"trail",name:"\u65E0\u9650\u57CE\u7684\u6B7B\u6597",mob:"\u6069\u5947\u90FD",level:50,note:"\u53EA\u5BF9\u53D8\u9E21\u89D2\u8272\u4F7F\u7528"},{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u897F\u683C\u739B\u5E7B\u58833",mob:"\u5B88\u62A4\u8005",level:70,color:"yellow",note:"\u4E0D\u9700\u8981\u63A8\u8C03\u67E5\u5458\uFF0C\u66F4\u5BB9\u6613\u62DB\u52DF\u5230\u4EBA\u3002\u65E0\u8BFB\u6761\u70B9\u540D\uFF0C\u9644\u5E26\u706B\u5C5E\u6027\u70E7\u4F24\uFF0C\u957F\u5F97\u548C\u767D\u5149\u4E4B\u97AD\u5DEE\u4E0D\u591A\uFF0C\u4E00\u822C\u538B\u4E0D\u6389"}]},{no:"36",action:11397,patch:"4.5",spell:"\u5343\u9488\u523A",level:24,icon:"003265.png",icon_hr1:"003265_hr1.png",icon_book:"072215.png",icon_book_hr1:"072215_hr1.png",method:[{type:"map",map:"\u5357\u8428\u7EB3\u5170",rank:null,position:[16,15,0],mob:"\u4ED9\u4EBA\u523A\u821E\u8E48\u5BB6",level:24,color:"yellow"},{type:"dungeon",name:"\u6D41\u6C99\u8FF7\u5BAB\u6A35\u9E23\u6D1E",mob:"\u4ED9\u4EBA\u523A\u9003\u5175",level:38,note:"BOSS #1\u540E\u5C0F\u602A"}]},{no:"37",action:11422,patch:"4.5",spell:"\u55B7\u58A8",level:50,icon:"003290.png",icon_hr1:"003290_hr1.png",icon_book:"072240.png",icon_book_hr1:"072240_hr1.png",method:[{type:"dungeon",name:"\u9006\u8F6C\u8981\u5BB3\u6C99\u65AF\u5854\u590F\u6EB6\u6D1E",mob:"\u514B\u62C9\u80AF",level:50,note:"BOSS #3",color:"yellow"}]},{no:"38",action:11425,patch:"4.5",spell:"\u706B\u6295\u67AA",level:50,icon:"003293.png",icon_hr1:"003293_hr1.png",icon_book:"072243.png",icon_book_hr1:"072243_hr1.png",method:[{type:"dungeon",name:"\u6B66\u88C5\u5723\u57DF\u653E\u6D6A\u795E\u53E4\u795E\u6BBF",mob:"\u6298\u89D2\u9A91\u58EB \u5BC7\u9ED1\u52A0",level:50,note:"BOSS #1\uFF0C\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",color:"yellow"},{type:"fate",map:"\u4E9A\u514B\u7279\u5C14\u6811\u6D77",name:"\u6012\u706B\u653B\u5FC3\u2014\u2014\u4E0E\u706B\u5171\u821E\u9A6C\u739B\u52A0",mob:"\u4E0E\u706B\u5171\u821E \u9A6C\u739B\u52A0",level:94,note:"\u786E\u5B9A\u65E0\u6CD5\u4E60\u5F97",color:"grey"}]},{no:"39",action:11415,patch:"4.5",spell:"\u6708\u4E4B\u7B1B",level:1,icon:"003283.png",icon_hr1:"003283_hr1.png",icon_book:"072233.png",icon_book_hr1:"072233_hr1.png",method:[{type:"special",text:"\u5B8C\u6210 10 \u79CD\u5047\u9762\u72C2\u6B22\u5173\u5361\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"40",action:11413,patch:"4.5",spell:"\u87BA\u65CB\u5C3E",level:50,icon:"003281.png",icon_hr1:"003281_hr1.png",icon_book:"072231.png",icon_book_hr1:"072231_hr1.png",method:[{type:"dungeon",name:"\u9006\u8F6C\u8981\u5BB3\u6C99\u65AF\u5854\u590F\u6EB6\u6D1E",mob:"\u771F\u7EA2\u9F99\u867E",note:"BOSS #1\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",level:50},{type:"map",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[26,8,0],mob:"\u5CED\u58C1\u5DE8\u94B3\u867E",note:"\u7591\u4F3C\u9AD8\u8840\u91CF\u66F4\u5BB9\u6613\u65BD\u653E",level:61,color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE03",mob:"\u5DE8\u94B3\u867E",level:60},{type:"dungeon",name:"\u6F02\u6D41\u6D77\u57DF\u5996\u6B4C\u6D77",mob:"\u5012\u5F71\u9F99\u867E",level:61,note:"BOSS#1\u524D\u7CBE\u82F1\u602A1\u53EA\uFF0C\u540C\u6B65\u65F6\u53EF\u4EE5\u8003\u8651\u50AC\u7720\u6574\u6CE2\u602A\u540E\u5355\u72EC\u6253\u9192",color:"red"},{type:"map",map:"\u590F\u52B3\u5C3C\u8352\u91CE",rank:null,position:[23.82,17.65,0],level:96,mob:"\u7802\u783E\u5DE8\u94B3\u867E",color:"red"}]},{no:"41",action:11394,patch:"4.5",spell:"\u7CBE\u795E\u51B2\u51FB",level:16,icon:"003262.png",icon_hr1:"003262_hr1.png",icon_book:"072212.png",icon_book_hr1:"072212_hr1.png",method:[{type:"dungeon",name:"\u5730\u4E0B\u7075\u6BBF\u5854\u59C6\xB7\u5854\u62C9\u5893\u56ED",mob:"\u4E3B\u5BB0\u8005 \u52A0\u5C14\u68B5\u65AF",level:16,note:"BOSS#3\u3002\u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A\u3002\u4F4E\u4E8E\u4E00\u5B9A\u751F\u547D\u503C\u540E\u548F\u5531\uFF0C\u522B\u79D2\u4E86\u3002"},{type:"hunt",map:"\u9ED1\u8863\u68EE\u6797\u5357\u90E8\u6797\u533A",rank:"S",position:[],mob:"\u593A\u5FC3\u9B54",level:50,color:"red"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE02",mob:"\u7206\u7834\u8005",level:60,note:"BOSS#1\u3002\u65E0\u8BFB\u6761\u5168\u5C4FAOE\uFF0C\u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A\u3002",color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE04",mob:"\u7206\u7834\u8005",level:60,note:"\u51FB\u8D25\u7684\u7B2C\u4E09\u6CE2\u654C\u4EBA\u4E4B\u4E00\u3002\u65E0\u8BFB\u6761\u5168\u5C4FAOE\uFF0C\u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A\u3002\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 80\u6B63\u4E49\u98DE\u8E22",color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE02",mob:"\u7206\u7834\u8005\u3001\u7206\u7834\u8005\u5E7B\u8C61",level:60,note:"\u4F4E\u4E8E\u4E00\u5B9A\u751F\u547D\u503C\u540E\u53EC\u5524\u7206\u7834\u8005\u5E7B\u8C61\uFF0CBOSS#1 \u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A\u3002",color:"red"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE04",mob:"\u7206\u7834\u8005",level:60,note:"\u51FB\u8D25\u7684\u7B2C\u4E09\u6CE2\u654C\u4EBA\u4E4B\u4E00\u3002\u89E3\u9664\u9650\u5236\u65F6\u4E5F\u5FC5\u5B9A\u5B66\u4F1A\u3002\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 80\u6B63\u4E49\u98DE\u8E22"}]},{no:"42",action:11416,patch:"4.5",spell:"\u6B7B\u4EA1\u5BA3\u544A",level:1,icon:"003284.png",icon_hr1:"003284_hr1.png",icon_book:"072234.png",icon_book_hr1:"072234_hr1.png",method:[{type:"special",text:"\u5B8C\u6210 20 \u79CD\u5047\u9762\u72C2\u6B22\u5173\u5361\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u5FB7\u5C14\u5854\u5E7B\u58834",mob:"\u827E\u514B\u65AF\u8FEA\u53F8",level:70,note:"\u786E\u5B9A\u65E0\u6CD5\u5B66\u4F1A",color:"grey"}]},{no:"43",action:11421,patch:"4.5",spell:"\u60CA\u5947\u5149",level:45,icon:"003289.png",icon_hr1:"003289_hr1.png",icon_book:"072239.png",icon_book_hr1:"072239_hr1.png",method:[{type:"map",map:"\u6469\u675C\u7EB3",rank:null,position:[13,10,0],mob:"\u9759\u6C34\u6CE5\u6CBC\u877E\u8788",level:45,color:"yellow"},{type:"dungeon",name:"\u4F11\u517B\u80DC\u5730\u5E03\u96F7\u798F\u6D1B\u514B\u65AF\u91CE\u8425\u5730",mob:"\u51B2\u6D6A\u6C34\u8725\u3001\u6C34\u6816\u877E\u8788",level:32,note:"\u51B2\u6D6A\u6C34\u8725\u751F\u547D\u503C\u4F4E\u4E8E50%\u540E\u548F\u5531",color:"red"}]},{no:"44",action:11426,patch:"4.5",spell:"\u98DE\u7FCE\u96E8",level:50,icon:"003294.png",icon_hr1:"003294_hr1.png",icon_book:"072244.png",icon_book_hr1:"072244_hr1.png",method:[{type:"trail",name:"\u8FE6\u697C\u7F57\u6B7C\u6B9B\u6218",mob:"\u8FE6\u697C\u7F57\u3001\u7F8E\u7FFC\u3001\u5999\u7FC5",level:50,color:"yellow"}]},{no:"45",action:11427,patch:"4.5",spell:"\u5730\u706B\u55B7\u53D1",level:50,icon:"003295.png",icon_hr1:"003295_hr1.png",icon_book:"072245.png",icon_book_hr1:"072245_hr1.png",method:[{type:"trail",name:"\u4F0A\u5F17\u5229\u7279\u8BA8\u4F10\u6218",mob:"\u4F0A\u5F17\u5229\u7279",level:20,color:"yellow"},{type:"trail",name:"\u4F0A\u5F17\u5229\u7279\u6B7C\u706D\u6218",mob:"\u4F0A\u5F17\u5229\u7279",level:50},{type:"trail",name:"\u4F0A\u5F17\u5229\u7279\u6B7C\u6B9B\u6218",mob:"\u4F0A\u5F17\u5229\u7279",level:50},{type:"raid",name:"\u4F0A\u7538\u5E0C\u671B\u4E50\u56ED \u5171\u9E23\u4E4B\u7AE02",mob:"\u8D64\u7FFC\u7F57\u7FAF\u5768\u535A\u53C9",level:80,note:"\u786E\u5B9A\u65E0\u6CD5\u4E60\u5F97\uFF0C\u539F\u56E0\u672A\u77E5",color:"grey"},{type:"raid",name:"\u4F0A\u7538\u96F6\u5F0F\u5E0C\u671B\u4E50\u56ED \u5171\u9E23\u4E4B\u7AE02",mob:"\u8D64\u7FFC\u7F57\u7FAF\u5768\u535A\u53C9",level:80,note:"\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"grey"},{type:"dungeon",name:"\u5384\u5C14\u5E87\u65AF\u80B2\u4F53\u5B9D\u6BBF",mob:"\u6CD5\u5384\u540C",level:90,note:"\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"}]},{no:"46",action:11428,patch:"4.5",spell:"\u5C71\u5D29",level:50,icon:"003296.png",icon_hr1:"003296_hr1.png",icon_book:"072246.png",icon_book_hr1:"072246_hr1.png",method:[{type:"trail",name:"\u6CF0\u5766\u6B7C\u706D\u6218",mob:"\u6CF0\u5766",level:50,color:"yellow"},{type:"trail",name:"\u6CF0\u5766\u6B7C\u6B9B\u6218",mob:"\u6CF0\u5766",level:50}]},{no:"47",action:11429,patch:"4.5",spell:"\u8F70\u96F7",level:50,icon:"003297.png",icon_hr1:"003297_hr1.png",icon_book:"072247.png",icon_book_hr1:"072247_hr1.png",method:[{type:"trail",name:"\u62C9\u59C6\u6B7C\u706D\u6218",mob:"\u62C9\u59C6",level:50,color:"yellow"},{type:"trail",name:"\u62C9\u59C6\u6B7C\u6B9B\u6218",mob:"\u62C9\u59C6",level:50},{type:"raid",name:"\u4F0A\u7538\u5E0C\u671B\u4E50\u56ED \u5171\u9E23\u4E4B\u7AE01",mob:"\u62C9\u59C6",level:80,note:"\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"}]},{no:"48",action:11430,patch:"4.5",spell:"\u51B0\u96EA\u4E71\u821E",level:50,icon:"003298.png",icon_hr1:"003298_hr1.png",icon_book:"072248.png",icon_book_hr1:"072248_hr1.png",method:[{type:"trail",name:"\u5E0C\u74E6\u6B7C\u6B9B\u6218",mob:"\u5E0C\u74E6",level:50,note:"\u5728PART.2\u6B66\u5668\u5207\u6362\u4E3A\u5F13\u540E\uFF0C\u77AC\u53D1\u4F7F\u7528",color:"yellow"}]},{no:"49",action:11431,patch:"4.5",spell:"\u6C34\u795E\u7684\u9762\u7EB1",level:50,icon:"003299.png",icon_hr1:"003299_hr1.png",icon_book:"072249.png",icon_book_hr1:"072249_hr1.png",method:[{type:"trail",name:"\u5229\u7EF4\u4E9A\u6851\u6B7C\u706D\u6218",mob:"\u5229\u7EF4\u4E9A\u6851",level:50,color:"yellow"},{type:"trail",name:"\u5229\u7EF4\u4E9A\u6851\u6B7C\u6B9B\u6218",mob:"\u5229\u7EF4\u4E9A\u6851",level:50}]},{no:"50",action:18295,patch:"5.15",spell:"\u9AD8\u5C71\u6C14\u6D41",level:59,icon:"003300.png",icon_hr1:"003300_hr1.png",icon_book:"072251.png",icon_book_hr1:"072251_hr1.png",method:[{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[35,10,0],mob:"\u72EE\u9E6B",level:59},{type:"dungeon",name:"\u51B0\u96EA\u5E9F\u5821\u66AE\u536B\u5854",mob:"\u72EE\u8EAB\u5DE8\u9E70",level:51,color:"red"},{type:"fate",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[26.7,25.5,0],name:"\u884C\u5211\u4EBA\u7684\u5BB6\u4EBA\u2014\u2014\u65AD\u9888\u9E70",mob:"\u65AD\u9888\u9E70",level:68,color:"red"},{type:"fate",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[26,29,0],name:"\u72EE\u9E6B\u7269\u8BED",mob:"\u771F\u72EE\u9E6B",level:65,color:"red"},{type:"fate",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[15,25,0],name:"\u81EA\u8840\u800C\u751F",mob:"\u771F\u72EE\u9E6B",level:65,color:"red"},{type:"map",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[26.1,25.2,0],mob:"\u771F\u72EE\u9E6B",level:68},{type:"hunt",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:"A",position:[11,8.5,0],mob:"\u5F17\u514B\u65BD\u6CF0\u56E0",level:70,note:"\u65E0\u8BFB\u6761\uFF0C\u672A\u6D4B\u8BD5\u662F\u5426\u53EF\u5B66\u4F1A",color:"red"}]},{no:"51",action:18296,patch:"5.15",spell:"\u4E07\u53D8\u6C34\u6CE2",level:60,icon:"003301.png",icon_hr1:"003301_hr1.png",icon_book:"072252.png",icon_book_hr1:"072252_hr1.png",method:[{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE03",mob:"\u6709\u751F\u547D\u6D3B\u6C34",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE03",mob:"\u6709\u751F\u547D\u6D3B\u6C34",level:60},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2229",mob:"\u6C34\u4E4B\u5F0F\u795E\u3001\u6C34\u9F99\u5377",level:60,note:"\u5929\u9752\u6597\u573A\u4E2D\u6700\u96BE\u7684\u4E00\u5173\uFF0C\u8BF7\u614E\u91CD\u8003\u8651"},{type:"treasure",name:"\u5DE1\u68A6\u91D1\u5E93",mob:"\u91D1\u5E93\u6DB2\u6001\u7075\u9B42",level:100,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u5361\u5188\u56FE\u4E9A\u9769\u5730\u56FE\uFF08G18\uFF09\uFF0C\u9700\u8981\u6D4B\u8BD5",color:"red"},{type:"dungeon",name:"\u7EA2\u7389\u706B\u5C71\u72F1\u4E4B\u76D6",mob:"\u6CC9\u4E4B\u5F0F\u795E",level:70,note:"\u786E\u5B9A\u4E0D\u4F1A\u4F7F\u7528\uFF0CBOSS#2\u540E\u7CBE\u82F1\u602A1\u53EA",color:"grey"}]},{no:"52",action:18297,patch:"5.15",spell:"\u72C2\u98CE\u66B4\u96EA",level:56,icon:"003302.png",icon_hr1:"003302_hr1.png",icon_book:"072253.png",icon_book_hr1:"072253_hr1.png",method:[{type:"map",map:"\u5E93\u5C14\u624E\u65AF\u897F\u90E8\u9AD8\u5730",rank:null,position:[25,32,0],mob:"\u5927\u811A\u677F\u5CA9\u96EA\u4EBA",level:56,color:"yellow"},{type:"fate",map:"\u5E93\u5C14\u672D\u65AF\u897F\u90E8\u9AD8\u5730",position:[20.4,33.4,0],name:"\u541E\u566C\u7266\u725B\u7684\u5DE8\u4EBA\u2014\u2014\u5DE8\u811A\u96EA\u4EBA",mob:"\u5DE8\u811A\u96EA\u4EBA",level:51,note:"\u6210\u5C31\u5371\u547D",color:"red"},{type:"dungeon",name:"\u51DB\u51BD\u6D1E\u5929\u62AB\u96EA\u5927\u51B0\u58C1",mob:"\u5927\u811A\u96EA\u4EBA",note:"BOSS#2",level:50,color:"red"}]},{no:"53",action:18298,patch:"5.15",spell:"\u751F\u7269\u7535",level:50,icon:"003303.png",icon_hr1:"003303_hr1.png",icon_book:"072254.png",icon_book_hr1:"072254_hr1.png",method:[{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[26,33,0],mob:"\u96F7\u7259",level:50,color:"yellow"},{type:"dungeon",name:"\u7EA2\u7389\u706B\u5C71\u72F1\u4E4B\u76D6",mob:"\u706B\u86C7\u3001\u72F1\u708E\u706B\u86C7",level:70,note:"BOSS #2\u524D\u5C0F\u602A"}]},{no:"54",action:18299,patch:"5.15",spell:"\u5BD2\u5149",level:60,icon:"003304.png",icon_hr1:"003304_hr1.png",icon_book:"072255.png",icon_book_hr1:"072255_hr1.png",method:[{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE01",mob:"\u98CE\u66B4\u4EBA\u5076\u3001\u6D6E\u58EB\u5FB7",level:60,note:"BOSS #1\u53CA\u5176\u53EC\u5524\u7684\u5C0F\u602A",color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE02",mob:"\u6D6E\u58EB\u5FB7",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE04",mob:"\u60E9\u7F5A\u4EBA\u5076",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE01",mob:"\u6D6E\u58EB\u5FB7\u3001\u65B0\u578B\u6D6E\u58EB\u5FB7",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5929\u52A8\u4E4B\u7AE01",mob:"\u7EC8\u6781\u6D6E\u58EB\u5FB7",note:"BOSS #1",level:60}]},{no:"55",action:18300,patch:"5.15",spell:"\u6DF1\u6E0A\u8D2F\u7A7F",level:50,icon:"003305.png",icon_hr1:"003305_hr1.png",icon_book:"072256.png",icon_book_hr1:"072256_hr1.png",method:[{type:"dungeon",name:"\u6076\u7075\u5E9C\u90B8\u9759\u8BED\u5E84\u56ED",mob:"\u963F\u4FEE",note:"BOSS #2",level:50},{type:"levequests",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:null,position:null,mob:"\u711A\u4E66\u4EFB\u52A1\uFF1A\u56DE\u6536\u7981\u4E66\u300A\u9752\u773C\u602A\u7269\u300B \u4E0A\u7EA7\u6076\u9B54",level:58,note:"\u7591\u4F3C\u5728\u9AD8\u751F\u547D\u503C\u66F4\u5BB9\u6613\u548F\u5531\uFF0C\u540C\u4E00\u7406\u7B26\u8FD8\u6709 62\u86D9\u817F\u3002\u4ECE\u4F0A\u4FEE\u52A0\u5FB7\u57FA\u7840\u5C42\u63A5\u53D6\u7406\u7B26\uFF0C\u5927\u89C4\u6A21\u7684\u4E5F\u53EF\u4EE5"},{type:"dungeon",name:"\u5B66\u8BC6\u5B9D\u5E93\u8FE6\u5DF4\u52D2\u5E7B\u60F3\u56FE\u4E66\u9986",mob:"\u5077\u4E66\u8005",note:"\u6700\u7EC8 BOSS \u7B2C\u4E09\u6B21\u8E29\u5854\uFF08\u865A\u65E0\u53EC\u5524\uFF09\u5931\u8D25\u540E\u51FA\u73B0\u7684\u5C0F\u602A",level:59,color:"red"},{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u897F\u683C\u739B\u5E7B\u58833",mob:"\u76EE\u5F55\u4E13\u5BB6",level:70,note:"\u786E\u5B9A\u4E0D\u4F1A\u4F7F\u7528",color:"grey"}]},{no:"56",action:18301,patch:"5.15",spell:"\u5527\u5527\u548B\u548B",level:50,icon:"003306.png",icon_hr1:"003306_hr1.png",icon_book:"072257.png",icon_book_hr1:"072257_hr1.png",method:[{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[21,32,0],mob:"\u7334\u9762\u96C0",level:50,color:"yellow"},{type:"hunt",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:"A",position:[24,23,0],mob:"\u65AF\u7279\u62C9\u65AF",level:60,color:"red"},{type:"map",map:"\u6D3B\u7740\u7684\u8BB0\u5FC6",rank:null,position:[37,26,0],mob:"\u68D5\u4ED9",level:90,color:"red"},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93\u795E\u6BBF",mob:"\u795E\u6BBF\u65AF\u5361\u5C3C\u7279",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red"},{type:"treasure",name:"\u9648\u65E7\u7684\u5361\u5188\u56FE\u4E9A\u9769\u5730\u56FE",mob:"\u62A4\u9886\u68D5\u4ED9",level:100,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u5361\u5188\u56FE\u4E9A\u9769\u5730\u56FE\uFF08G18\uFF09\uFF0C\u5730\u8868\u5C0F\u602A",color:"red"}]},{no:"57",action:18302,patch:"5.15",spell:"\u602A\u97F3\u6CE2",level:59,icon:"003307.png",icon_hr1:"003307_hr1.png",icon_book:"072258.png",icon_book_hr1:"072258_hr1.png",method:[{type:"map",map:"\u9B54\u5927\u9646\u963F\u6D4E\u5179\u62C9",rank:null,position:[30,12,0],mob:"\u75AB\u866B",level:59,color:"yellow"},{type:"dungeon",name:"\u8150\u574F\u9057\u8FF9\u65E0\u9650\u57CE\u5E02\u8857\u53E4\u8FF9",mob:"\u963F\u91CC\u5965\u514B",level:50,note:"BOSS #2"},{type:"dungeon",name:"\u65E0\u9650\u57CE\u7684\u6B7B\u6597",mob:"\u6069\u5947\u90FD",level:50,note:"\u4F1A\u4F7F\u7528\u4F46\u662F\u4E2A\u6247\u5F62AOE"},{type:"dungeon",name:"\u8840\u6218\u82CD\u7A79\u9B54\u79D1\u5B66\u7814\u7A76\u6240",mob:"\u4EBA\u5DE5\u57F9\u517B\u75AB\u866B",level:60,note:"BOSS#1\u540E\u5C0F\u602A"}]},{no:"58",action:18303,patch:"5.15",spell:"\u7ED2\u7ED2\u6CBB\u7597",level:50,icon:"003308.png",icon_hr1:"003308_hr1.png",icon_book:"072259.png",icon_book_hr1:"072259_hr1.png",method:[{type:"trail",name:"\u83AB\u53E4\u529B\u8D24\u738B\u6B7C\u706D\u6218",mob:"\u8338\u8338\u4E4B\u6108 \u5E93\u666E\u6D1B\xB7\u5947\u666E",level:50,note:"\u82E5\u548F\u5531\u8FC7\u7A0B\u4E2D\u6CBB\u7597\u76EE\u6807\u88AB\u51FB\u6740\uFF0C\u548F\u5531\u4F1A\u88AB\u6253\u65AD",color:"yellow"},{type:"trail",name:"\u83AB\u53E4\u529B\u8D24\u738B\u6B7C\u6B9B\u6218",mob:"\u8338\u8338\u4E4B\u6108 \u5E93\u666E\u6D1B\xB7\u5947\u666E",level:50,note:"\u82E5\u548F\u5531\u8FC7\u7A0B\u4E2D\u6CBB\u7597\u76EE\u6807\u88AB\u51FB\u6740\uFF0C\u548F\u5531\u4F1A\u88AB\u6253\u65AD"}]},{no:"59",action:18304,patch:"5.15",spell:"\u54E5\u5E03\u9632\u5FA1",level:60,icon:"003309.png",icon_hr1:"003309_hr1.png",icon_book:"072260.png",icon_book_hr1:"072260_hr1.png",method:[{type:"hunt",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:"A",position:null,mob:"\u673A\u5DE5\u5175 \u65AF\u5229\u666E\u91D1\u514B\u65AF",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5929\u52A8\u4E4B\u7AE02",mob:"\u4E9A\u5386\u5C71\u5927\u4F0F\u5175\u3001\u4E9A\u5386\u5C71\u5927\u6325\u5200\u5175",level:60}]},{no:"60",action:18305,patch:"5.15",spell:"\u9B54\u6CD5\u9524",level:60,icon:"003310.png",icon_hr1:"003310_hr1.png",icon_book:"072261.png",icon_book_hr1:"072261_hr1.png",method:[{type:"dungeon",name:"\u79D8\u672C\u5B9D\u5E93\u8FE6\u5DF4\u52D2\u5E7B\u60F3\u56FE\u4E66\u9986",mob:"\u963F\u73ED\u8FBE",note:"BOSS#3\u524D\u7CBE\u82F1\u602A\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",level:60},{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2224",mob:"\u827E\u5339\u7F57\u57FA",level:50},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93\u795E\u6BBF",mob:"\u795E\u6BBF\u963F\u73ED\u8FBE",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red"}]},{no:"61",action:18306,patch:"5.15",spell:"\u9632\u5FA1\u6307\u793A",level:60,icon:"003311.png",icon_hr1:"003311_hr1.png",icon_book:"072262.png",icon_book_hr1:"072262_hr1.png",method:[{type:"dungeon",name:"\u8349\u6728\u5EAD\u56ED\u5723\u8309\u590F\u5A1C\u690D\u7269\u56ED",mob:"\u9E70\u950B\u5973\u738B",level:60,note:"BOSS #2",color:"yellow"}]},{no:"62",action:18307,patch:"5.15",spell:"\u86D9\u817F",level:59,icon:"003312.png",icon_hr1:"003312_hr1.png",icon_book:"072263.png",icon_book_hr1:"072263_hr1.png",method:[{type:"levequests",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:null,position:null,mob:"\u711A\u4E66\u4EFB\u52A1\uFF1A\u56DE\u6536\u7981\u4E66\u300A\u9752\u773C\u602A\u7269\u300B- \u79BB\u6C34\u667A\u86D9",level:58,note:"\u9700\u8981\u9760\u8FD1\u624D\u4F1A\u4F7F\u7528\uFF0C\u540C\u4E00\u7406\u7B26\u8FD8\u6709 55\u6DF1\u6E0A\u8D2F\u7A7F\u3002\u4ECE\u4F0A\u4FEE\u52A0\u5FB7\u57FA\u7840\u5C42\u63A5\u53D6\u7406\u7B26\uFF0C\u5927\u89C4\u6A21\u7684\u4E5F\u53EF\u4EE5\u3002"},{type:"map",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",rank:null,position:[12,35,0],mob:"\u667A\u86D9",level:59,note:"\u9700\u8981\u9760\u8FD1\u624D\u4F1A\u4F7F\u7528"},{type:"fate",map:"\u9F99\u5821\u5185\u9646\u4F4E\u5730",position:[11.6,34.4,0],name:"\u7B49\u5F85\u8005\u2014\u2014\u5B64\u72EC\u7684\u8D1D\u6D1B\xB7\u7F57\u683C",mob:"\u5B64\u72EC\u7684\u8D1D\u6D1B\xB7\u7F57\u683C",level:59,color:"red"}]},{no:"63",action:18308,patch:"5.15",spell:"\u97F3\u7206",level:47,icon:"003313.png",icon_hr1:"003313_hr1.png",icon_book:"072264.png",icon_book_hr1:"072264_hr1.png",method:[{type:"fate",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",name:"\u9ED1\u8272\u602A\u9E1F",mob:"\u5B89\u7956\u4E3B\u6BCD",level:47,color:"red"},{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[37,36,0],mob:"\u5B89\u7956",level:59,color:"yellow"},{type:"dungeon",name:"\u9886\u822A\u660E\u706F\u5929\u72FC\u661F\u706F\u5854",mob:"\u7956",note:"BOSS #2",level:50},{type:"fate",map:"\u5965\u9614\u5E15\u6070\u5C71",name:"\u56FE\u62C9\u5C14\u5019\u9E1F",mob:"\u5F98\u5F8A\u7956",level:88,color:"red"}]},{no:"64",action:18309,patch:"5.15",spell:"\u53E3\u7B1B",level:56,icon:"003314.png",icon_hr1:"003314_hr1.png",icon_book:"072265.png",icon_book_hr1:"072265_hr1.png",method:[{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[19,30,0],mob:"\u957F\u9888\u9A7C",level:56},{type:"map",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[26.9,29.7,0],mob:"\u957F\u9888\u9A86",level:68},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93",mob:"\u8FD0\u6CB3\u957F\u9888\u9A7C",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red"},{type:"fate",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",name:"\u590D\u4EC7\u9CCF\u592B\u2014\u2014\u6D85\u90A3\u4E4C\u5C3C\u5C14",mob:"\u6D85\u90A3\u4E4C\u5C3C\u5C14",level:68,color:"red"},{type:"dungeon",name:"\u7A7A\u4E2D\u795E\u57DF\u4E0D\u83B7\u5C9B",mob:"\u795E\u57DF\u957F\u9888\u9A7C",level:60,note:"\u65E0\u8BFB\u6761\uFF0CBOSS#2\u540E\u591A\u53EA",color:"red"}]},{no:"65",action:18310,patch:"5.15",spell:"\u767D\u9A91\u58EB\u4E4B\u65C5",level:57,icon:"003315.png",icon_hr1:"003315_hr1.png",icon_book:"072266.png",icon_book_hr1:"072266_hr1.png",method:[{type:"dungeon",name:"\u5723\u6559\u4E2D\u67A2\u4F0A\u4FEE\u52A0\u5FB7\u6559\u7687\u5385",mob:"\u767D\u9A91\u58EB",level:57,note:"BOSS #2\u524D\u540E\u5404\u6709\u4E24\u53EA",color:"yellow"}]},{no:"66",action:18311,patch:"5.15",spell:"\u9ED1\u9A91\u58EB\u4E4B\u65C5",level:57,icon:"003316.png",icon_hr1:"003316_hr1.png",icon_book:"072267.png",icon_book_hr1:"072267_hr1.png",method:[{type:"dungeon",name:"\u5723\u6559\u4E2D\u67A2\u4F0A\u4FEE\u52A0\u5FB7\u6559\u7687\u5385",mob:"\u9ED1\u9A91\u58EB",level:57,note:"BOSS #2\u524D\u540E\u5404\u6709\u4E24\u53EA",color:"yellow"}]},{no:"67",action:18312,patch:"5.15",spell:"5\u7EA7\u5373\u6B7B",level:59,icon:"003317.png",icon_hr1:"003317_hr1.png",icon_book:"072268.png",icon_book_hr1:"072268_hr1.png",method:[{type:"dungeon",name:"\u5B66\u8BC6\u5B9D\u5E93\u8FE6\u5DF4\u52D2\u5E7B\u60F3\u56FE\u4E66\u9986",mob:"64\u9875",level:59,note:"BOSS #1\u540E\u5C0F\u602A\uFF0C\u5728\u6240\u6709\u4EBA\u8FDC\u79BB\u62C9\u65AD\u7EBF\u540E\u66F4\u5BB9\u6613\u548F\u5531",color:"yellow"}]},{no:"68",action:18313,patch:"5.15",spell:"\u706B\u7BAD\u70AE",level:60,icon:"003318.png",icon_hr1:"003318_hr1.png",icon_book:"072269.png",icon_book_hr1:"072269_hr1.png",method:[{type:"dungeon",name:"\u76D1\u7262\u94C1\u81C2\u5DF4\u57C3\u8428\u957F\u57CE",mob:"\u6B66\u88C5\u91CD\u7532",note:"BOSS #2",level:60},{type:"dungeon",name:"\u89E3\u653E\u51B3\u6218\u591A\u739B\u738B\u57CE",mob:"\u591A\u739B\u6B66\u88C5\u91CD\u7532",note:"\u8001\u4E09\u524D\u7684\u7CBE\u82F1\u602A",level:67},{type:"fate",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",name:"\u5931\u63A7\u7684\u6700\u7EC8\u5175\u5668\u2014\u2014\u81F4\u547D\u6B66\u5668",mob:"\u81F4\u547D\u6B66\u5668",note:"\u540C\u6B65\u6478\u4E00\u4E0B\u4EC7\u6068\u540E\u89E3\u9664\u540C\u6B65\u7B49\u5371\u547D\u5931\u8D25\u4E5F\u6709\u76F8\u540C\u6982\u7387\u5B66\u4F1A",level:68}]},{no:"69",action:18314,patch:"5.15",spell:"\u6C38\u6052\u5C04\u7EBF",level:60,icon:"003319.png",icon_hr1:"003319_hr1.png",icon_book:"072270.png",icon_book_hr1:"072270_hr1.png",method:[{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE04",mob:"\u64CD\u7EB5\u8005",level:60,color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u542F\u52A8\u4E4B\u7AE04",mob:"\u64CD\u7EB5\u8005",level:60},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE04",mob:"\u7A81\u51FB\u8005",level:60,note:"\u786E\u5B9A\u65E0\u6CD5\u5B66\u4F1A",color:"grey"}]},{no:"70",action:18315,patch:"5.15",spell:"\u4ED9\u4EBA\u76FE",level:50,icon:"003320.png",icon_hr1:"003320_hr1.png",icon_book:"072271.png",icon_book_hr1:"072271_hr1.png",method:[{type:"dungeon",name:"\u82CF\u9192\u9057\u8FF9\u5580\u6069\u57CB\u6CA1\u5723\u5802",mob:"\u4ED9\u4EBA\u523A\u5B88\u536B",level:50,note:"BOSS#2 \u53EC\u5524\u7684\u5C0F\u602A",color:"yellow"}]},{no:"71",action:18316,patch:"5.15",spell:"\u590D\u4EC7\u51B2\u51FB",level:60,icon:"003321.png",icon_hr1:"003321_hr1.png",icon_book:"072272.png",icon_book_hr1:"072272_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 50 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"72",action:18317,patch:"5.15",spell:"\u5929\u4F7F\u4F4E\u8BED",level:60,icon:"003322.png",icon_hr1:"003322_hr1.png",icon_book:"072273.png",icon_book_hr1:"072273_hr1.png",method:[{type:"special",text:"\u5B8C\u6210 30 \u4E2A\u5047\u9762\u72C2\u6B22\u5173\u5361\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:1,color:"yellow"}]},{no:"73",action:18318,patch:"5.15",spell:"\u8715\u76AE",level:50,icon:"003323.png",icon_hr1:"003323_hr1.png",icon_book:"072274.png",icon_book_hr1:"072274_hr1.png",method:[{type:"dungeon",name:"\u8150\u574F\u9057\u8FF9\u65E0\u9650\u57CE\u5E02\u8857\u53E4\u8FF9",mob:"\u74E6\u9B54\u86FE",level:50,note:"1\u53F7boss\u524D3\u4F53\uFF0C\u7B2C3\u4F53\u8F83\u8FDC\uFF0C\u540C\u65F6\u62C9\u5230\u7684\u5176\u4ED6\u654C\u4EBAHP50%\u4EE5\u4E0B\u65F6\u4F7F\u7528"},{type:"map",map:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u4E91\u6D77",rank:null,position:[10,17,0],mob:"\u963F\u5DF4\u62C9\u63D0\u4E9A\u74E6\u9B54\u86FE",level:57,note:"\u540C\u65F6\u62C9\u4F4F\u53E6\u4E00\u53EA\u602A\u5E76\u5C06\u53E6\u4E00\u53EA\u602A\u8840\u91CF\u524A\u523055%\u4EE5\u4E0B\uFF0C\u6CE8\u610F\u4E0D\u8981\u548C\u9644\u8FD1\u540C\u6A21\u5C0F\u4E00\u4E9B\u7684\u5929\u7A97\u74E6\u9B54\u86FE\u641E\u6DF7",color:"yellow"}]},{no:"74",action:18319,patch:"5.15",spell:"\u9006\u6D41",level:56,icon:"003324.png",icon_hr1:"003324_hr1.png",icon_book:"072275.png",icon_book_hr1:"072275_hr1.png",method:[{type:"map",map:"\u7FFB\u4E91\u96FE\u6D77",rank:null,position:[25,28,0],mob:"\u4E91\u4E0A\u53CC\u8DB3\u98DE\u9F99",level:56,color:"yellow"},{type:"dungeon",name:"\u90AA\u9F99\u738B\u5EA7\u9F99\u5DE2\u795E\u6BBF",mob:"\u96F7\u96C5\u514B\u9B54\u9F99",level:55,color:"red"}]},{no:"75",action:18320,patch:"5.15",spell:"\u6355\u98DF",level:50,icon:"003325.png",icon_hr1:"003325_hr1.png",icon_book:"072276.png",icon_book_hr1:"072276_hr1.png",method:[{type:"dungeon",name:"\u8150\u574F\u9057\u8FF9\u65E0\u9650\u57CE\u5E02\u8857\u53E4\u8FF9",mob:"\u8150\u574F\u8D2A\u5403\u9B3C",level:50,note:"BOSS #1"},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u9082\u9005\u4E4B\u7AE01",mob:"\u795E\u6756\u5DE8\u86C7",note:"\u6700\u7EC8BOSS",level:50},{type:"raid",name:"\u5DF4\u54C8\u59C6\u7279\u5927\u8FF7\u5BAB \u5165\u4FB5\u4E4B\u7AE01",mob:"\u5927\u738B\u82B1",note:"\u6700\u7EC8BOSS",level:50},{type:"dungeon",name:"\u6C61\u67D3\u5EAD\u56ED\u5723\u8309\u590F\u5A1C\u690D\u7269\u56ED",mob:"\u6CE5\u53E3\u82B1",level:70,color:"yellow",note:"BOSS#1 \u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 87\u6C61\u6CE5\u6CFC\u6D12"},{type:"hunt",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u6E56\u533A",rank:"A",position:[],mob:"\u9A6C\u5E0C\u6C99",level:70,note:"\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"},{type:"hunt",map:"\u8428\u7EF4\u5948\u5C9B",rank:"A",position:[],mob:"\u5C24\u5170",level:90,note:"\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"},{type:"fate",map:"\u590F\u52B3\u5C3C\u8352\u91CE",name:"\u86C7\u738B\u5F97\u9177\u70ED\u6D85\uFF1A\u8352\u91CE\u7684\u6B7B\u6597",mob:"\u5F97\u9177\u70ED\u6D85",level:100,note:"\u6210\u5C31fate\uFF0C\u672A\u786E\u5B9A\u53EF\u4E60\u5F97",color:"red"}]},{no:"76",action:18321,patch:"5.15",spell:"\u5C0F\u4FA6\u6D4B",level:60,icon:"003326.png",icon_hr1:"003326_hr1.png",icon_book:"072277.png",icon_book_hr1:"072277_hr1.png",method:[{type:"carnivale",name:"\u5047\u9762\u72C2\u6B2224",mob:"\u6597\u573A\u6284\u5199\u5458",level:50},{type:"dungeon",name:"\u79D8\u672C\u5B9D\u5E93\u8FE6\u5DF4\u52D2\u5E7B\u60F3\u56FE\u4E66\u9986",mob:"\u81EA\u8D70\u4EBA\u5076\u6284\u5199\u5458",note:"BOSS#2\u540E\u5C0F\u602A",level:60}]},{no:"77",action:18322,patch:"5.15",spell:"\u4EE5\u592A\u590D\u5236",level:60,icon:"003327.png",icon_hr1:"003327_hr1.png",icon_book:"072278.png",icon_book_hr1:"072278_hr1.png",method:[{type:"dungeon",name:"\u5730\u8109\u7075\u706F\u5929\u72FC\u661F\u706F\u5854",mob:"\u8150\u5316\u7269",level:60,note:"BOSS#1\u53EC\u5524\u7684\u5C0F\u602A\uFF0C\u65E0\u6CD5\u4ECE\u6B64\u524D\u540C\u540D\u5C0F\u602A\u5904\u4E60\u5F97",color:"yellow"}]},{no:"78",action:18323,patch:"5.15",spell:"\u7A7F\u7532\u6563\u5F39",level:53,icon:"003328.png",icon_hr1:"003328_hr1.png",icon_book:"072279.png",icon_book_hr1:"072279_hr1.png",method:[{type:"trail",name:"\u7F57\u6CE2\u90A3\u6B7C\u706D\u6218",mob:"\u7F57\u6CE2\u90A3",level:53,color:"yellow"},{type:"trail",name:"\u7F57\u6CE2\u90A3\u6B7C\u6B9B\u6218",mob:"\u7F57\u6CE2\u90A3",level:60}]},{no:"79",action:18324,patch:"5.15",spell:"\u7C7B\u661F\u4F53",level:60,icon:"003329.png",icon_hr1:"003329_hr1.png",icon_book:"072280.png",icon_book_hr1:"072280_hr1.png",method:[{type:"trail",name:"\u7D22\u83F2\u5A05\u6B7C\u706D\u6218",mob:"\u7D22\u83F2\u5A05",level:60,color:"yellow"},{type:"trail",name:"\u7D22\u83F2\u5A05\u6B7C\u6B9B\u6218",mob:"\u7D22\u83F2\u5A05",level:60}]},{no:"80",action:18325,patch:"5.15",spell:"\u6B63\u4E49\u98DE\u8E22",level:60,icon:"003330.png",icon_hr1:"003330_hr1.png",icon_book:"072281.png",icon_book_hr1:"072281_hr1.png",method:[{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE04",mob:"\u6B8B\u66B4\u6B63\u4E49\u53F7",level:60,note:"\u6700\u7EC8\u9636\u6BB5\u4E0A\u5929\u8FD0\u52A8\u4F1A\u65F6\u77AC\u53D1\u4F7F\u7528\u3002\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 41\u7CBE\u795E\u51B2\u51FB",color:"yellow"},{type:"raid",name:"\u4E9A\u5386\u5C71\u5927\u96F6\u5F0F\u673A\u795E\u57CE \u5F8B\u52A8\u4E4B\u7AE04",mob:"\u6B8B\u66B4\u6B63\u4E49\u53F7",note:"\u6700\u7EC8\u9636\u6BB5\u4E0A\u5929\u8FD0\u52A8\u4F1A\u65F6\u77AC\u53D1\u4F7F\u7528\u3002\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 41\u7CBE\u795E\u51B2\u51FB",level:60}]},{no:"81",action:23264,patch:"5.45",spell_en:"Triple Trident",spell:"\u6E14\u53C9\u4E09\u6BB5",level:67,icon:"003331.png",icon_hr1:"003331_hr1.png",icon_book:"072282.png",icon_book_hr1:"072282_hr1.png",method:[{type:"map",map:"\u5EF6\u590F",rank:null,position:[28,8,0],mob:"\u60E0\u6BD4\u5BFF\u9CB6\u9C7C\u7CBE",level:67,color:"yellow"},{type:"hunt",map:"\u5EF6\u590F",rank:"B",position:[],mob:"\u95EA\u96F7\u51FB \u9C7C\u96F7",level:70,color:"red"}]},{no:"82",action:23265,patch:"5.45",spell_en:"Tingle",spell:"\u54D4\u54E9\u54D4\u54E9",level:67,icon:"003332.png",icon_hr1:"003332_hr1.png",icon_book:"072283.png",icon_book_hr1:"072283_hr1.png",method:[{type:"map",map:"\u5EF6\u590F",rank:null,position:[28,8,0],mob:"\u60E0\u6BD4\u5BFF\u9CB6\u9C7C\u7CBE",level:67,color:"yellow"},{type:"hunt",map:"\u5EF6\u590F",rank:"B",position:[],mob:"\u95EA\u96F7\u51FB \u9C7C\u96F7",level:70,color:"red"}]},{no:"83",action:23266,patch:"5.45",spell_en:"Tatami-gaeshi",spell:"\u6380\u5730\u677F\u4E4B\u672F",level:70,icon:"003333.png",icon_hr1:"003333_hr1.png",icon_book:"072284.png",icon_book_hr1:"072284_hr1.png",method:[{type:"dungeon",name:"\u6076\u515A\u5B64\u57CE\u9EC4\u91D1\u9601",mob:"\u9053\u987A\u4E38",level:70,note:"BOSS #2",color:"yellow"}]},{no:"84",action:23267,patch:"5.45",spell_en:"Cold Fog",spell:"\u5F7B\u9AA8\u96FE\u5BD2",level:70,icon:"003334.png",icon_hr1:"003334_hr1.png",icon_book:"072285.png",icon_book_hr1:"072285_hr1.png",method:[{type:"dungeon",name:"\u6B7B\u4EA1\u5927\u5730\u7EC8\u672B\u7126\u571F",mob:"\u96FE\u9F99",level:70,note:"BOSS #3\uFF0C\u9700\u6545\u610F\u7559\u4E0B\u4E09\u9F99\u5934\u4E4B\u4E00\u6216\u66F4\u591A\uFF0C\u5426\u5219\u548F\u5531\u4F1A\u88AB\u6253\u65AD\uFF0C\u63A8\u8350\u643A\u5E2673\u8715\u76AE\u6765\u9A71\u6563\u51BB\u4F24\uFF0C\u964D\u4F4E\u7FFB\u8F66\u7387",color:"yellow"}]},{no:"85",action:23269,patch:"5.45",spell_en:"Stotram",spell:"\u8D5E\u6B4C",level:67,icon:"003336.png",icon_hr1:"003336_hr1.png",icon_book:"072286.png",icon_book_hr1:"072286_hr1.png",method:[{type:"trail",name:"\u5409\u7965\u5929\u5973\u6B7C\u706D\u6218",mob:"\u5409\u7965\u5929\u5973",level:67,color:"yellow"},{type:"trail",name:"\u5409\u7965\u5929\u5973\u6B7C\u6B9B\u6218",mob:"\u5409\u7965\u5929\u5973",level:70}]},{no:"86",action:23270,patch:"5.45",spell_en:"Saintly Beam",spell:"\u5723\u5149\u5C04\u7EBF",level:70,icon:"003337.png",icon_hr1:"003337_hr1.png",icon_book:"072287.png",icon_book_hr1:"072287_hr1.png",method:[{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u897F\u683C\u739B\u5E7B\u58831",mob:"\u9B54\u5217\u8F66",level:70,color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u96F6\u5F0F\u65F6\u7A7A\u72ED\u7F1D \u897F\u683C\u739B\u5E7B\u58831",mob:"\u9B54\u5217\u8F66",level:70}]},{no:"87",action:23271,patch:"5.45",spell_en:"Feculent Flood",spell:"\u6C61\u6CE5\u6CFC\u6D12",level:70,icon:"003338.png",icon_hr1:"003338_hr1.png",icon_book:"072288.png",icon_book_hr1:"072288_hr1.png",method:[{type:"dungeon",name:"\u6C61\u67D3\u5EAD\u56ED\u5723\u8309\u590F\u5A1C\u690D\u7269\u56ED",mob:"\u67AF\u8150\u6CE5\u5996",level:70,note:"BOSS #3\uFF0C\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 75\u6355\u98DF",color:"yellow"},{type:"hunt",map:"\u4F0A\u5C14\u7F8E\u683C",rank:"A",position:[],mob:"\u6CE5\u4EBA",level:80}]},{no:"88",action:23272,patch:"5.45",spell_en:"Angel's Snack",spell_ja:"\u5929\u4F7F\u306E\u304A\u3084\u3064",spell:"\u5929\u4F7F\u7684\u70B9\u5FC3",level:70,icon:"003339.png",icon_hr1:"003339_hr1.png",icon_book:"072289.png",icon_book_hr1:"072289_hr1.png",method:[{type:"special",text:"\u8FBE\u5230 70 \u7EA7\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:70,color:"yellow"}]},{no:"89",action:23273,patch:"5.45",spell_en:"Chelonian Gate",spell:"\u7384\u7ED3\u754C",level:70,icon:"003340.png",icon_hr1:"003340_hr1.png",icon_book:"072290.png",icon_book_hr1:"072290_hr1.png",method:[{type:"dungeon",name:"\u7EA2\u7389\u706B\u5C71\u72F1\u4E4B\u76D6",mob:"\u7384\u6B66",level:70,note:"BOSS #3",color:"yellow"}]},{no:"90",action:23275,patch:"5.45",spell_en:"The Rose of Destruction",spell:"\u6597\u7075\u5F39",level:70,icon:"003342.png",icon_hr1:"003342_hr1.png",icon_book:"072291.png",icon_book_hr1:"072291_hr1.png",method:[{type:"dungeon",name:"\u4FEE\u884C\u53E4\u5239\u661F\u5BFC\u5BFA",mob:"\u53CC\u8C79\u4F0A\u6C83\u6069",note:"BOSS #3",level:70,color:"yellow"}]},{no:"91",action:23276,patch:"5.45",spell_en:"Basic Instinct",spell:"\u6597\u4E89\u672C\u80FD",level:24,icon:"003343.png",icon_hr1:"003343_hr1.png",icon_book:"072292.png",icon_book_hr1:"072292_hr1.png",method:[{type:"dungeon",name:"\u4FEE\u884C\u53E4\u5239\u661F\u5BFC\u5BFA",mob:"\u51F6\u8C79\u6240\u95FB\uFF0C\u51F6\u8C79\u6240\u5FC6",note:"BOSS #1\uFF0C\u5728\u53E6\u4E00\u65B9\u88AB\u51FB\u6740\u540E\u4F7F\u7528",level:70},{type:"map",map:"\u62C9\u8BFA\u897F\u4E9A\u9AD8\u5730",rank:null,position:[9,21.5,0],mob:"\u9AD8\u9636\u957F\u987B\u8C79",level:24,color:"yellow"}]},{no:"92",action:23277,patch:"5.45",spell_en:"Ultravibration",spell:"\u8D85\u632F\u52A8",level:68,icon:"003344.png",icon_hr1:"003344_hr1.png",icon_book:"072293.png",icon_book_hr1:"072293_hr1.png",method:[{type:"map",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:null,position:[11,26,0],mob:"\u6050\u7532\u8682\u8713",level:68,note:"\u7591\u4F3C\u9AD8\u8840\u91CF\u66F4\u5BB9\u6613\u65BD\u653E",color:"yellow"},{type:"hunt",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u5C71\u533A",rank:"B",position:[],mob:"\u86C7\u4EC6\u8682\u8713",level:70,color:"red"},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93",mob:"\u8FD0\u6CB3\u6050\u7532\u8682\u8713",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red"}]},{no:"93",action:23278,patch:"5.45",spell_en:"Blaze",spell:"\u51B0\u7130",level:70,icon:"003345.png",icon_hr1:"003345_hr1.png",icon_book:"072294.png",icon_book_hr1:"072294_hr1.png",method:[{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u5FB7\u5C14\u5854\u5E7B\u58831",mob:"\u8001\u8005",level:70,color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u96F6\u5F0F\u65F6\u7A7A\u72ED\u7F1D \u5FB7\u5C14\u5854\u5E7B\u58831",mob:"\u8001\u8005",level:70}]},{no:"94",action:23279,patch:"5.45",spell_en:"Mustard Bomb",spell:"\u82A5\u672B\u7206\u5F39",level:70,icon:"003346.png",icon_hr1:"003346_hr1.png",icon_book:"072295.png",icon_book_hr1:"072295_hr1.png",method:[{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u963F\u5C14\u6CD5\u5E7B\u58833",mob:"\u6B27\u7C73\u8304",level:70,color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u96F6\u5F0F\u65F6\u7A7A\u72ED\u7F1D \u963F\u5C14\u6CD5\u5E7B\u58833",mob:"\u6B27\u7C73\u8304",level:70}]},{no:"95",action:23280,patch:"5.45",spell_en:"Dragon Force",spell_ja:"\u30C9\u30E9\u30B4\u30F3\u30D5\u30A9\u30FC\u30B9",spell:"\u9F99\u4E4B\u529B",level:70,icon:"003347.png",icon_hr1:"003347_hr1.png",icon_book:"072296.png",icon_book_hr1:"072296_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 100 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:70,color:"yellow"}]},{no:"96",action:23281,patch:"5.45",spell_en:"Aetherial Spark",spell:"\u4EE5\u592A\u706B\u82B1",level:69,icon:"003348.png",icon_hr1:"003348_hr1.png",icon_book:"072297.png",icon_book_hr1:"072297_hr1.png",method:[{type:"map",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u6E56\u533A",rank:null,position:[22,22,0],mob:"\u9640\u9C81\u5A46",level:69,color:"yellow"},{type:"hunt",map:"\u57FA\u62C9\u5DF4\u5C3C\u4E9A\u6E56\u533A",rank:"A",position:[],mob:"\u6CDB\u5149\u6676\u4F53",level:70},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93",mob:"\u8FD0\u6CB3\u9640\u9C81\u5A46",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09",color:"red"}]},{no:"97",action:23282,patch:"5.45",spell_en:"Hydro Pull",spell:"\u6C34\u529B\u5438\u5F15",level:70,icon:"003349.png",icon_hr1:"003349_hr1.png",icon_book:"072298.png",icon_book_hr1:"072298_hr1.png",method:[{type:"dungeon",name:"\u6C89\u6CA1\u795E\u6BBF\u65AF\u5361\u62C9\u9057\u8FF9",mob:"\u51EF\u5C14\u6D3E",level:70,note:"BOSS #1",color:"yellow"},{type:"treasure",name:"\u8FD0\u6CB3\u5B9D\u7269\u5E93\u795E\u6BBF",mob:"\u795E\u6BBF\u51EF\u5C14\u6D3E",level:70,note:"\u5BFB\u5B9D\uFF1A\u9648\u65E7\u7684\u77AA\u7F9A\u9769\u5730\u56FE\uFF08G10\uFF09 \u4F3C\u4E4E\u53EA\u4F1A\u201C\u6C34\u529B\u63A8\u884C\u201D",color:"grey"}]},{no:"98",action:23283,patch:"5.45",spell_en:"Malediction of Water",spell:"\u6C34\u8109\u8BC5\u5492",level:70,icon:"003350.png",icon_hr1:"003350_hr1.png",icon_book:"072299.png",icon_book_hr1:"072299_hr1.png",method:[{type:"dungeon",name:"\u98CE\u6C34\u7075\u5E99\u5CA9\u71D5\u5E99",mob:"\u8D5B\u592A\u5C81",level:70,note:"1\u53F7boss\u524D\u30013\u53F7boss\u524D\u5C0F\u602A\u4E0D\u4F1A\u4F7F\u7528\uFF0C\u4EC52\u53F7boss\u524D\u8FC7\u9053\u76841\u4F53\u4F1A\u4F7F\u7528",color:"yellow"}]},{no:"99",action:23284,patch:"5.45",spell_en:"Choco Meteor",spell:"\u9646\u884C\u9E1F\u9668\u77F3",level:53,icon:"003351.png",icon_hr1:"003351_hr1.png",icon_book:"072300.png",icon_book_hr1:"072300_hr1.png",method:[{type:"raid",name:"\u5931\u843D\u4E4B\u90FD\u62C9\u5DF4\u7EB3\u65AF\u5854",mob:"?",level:70,color:"red"},{type:"map",map:"\u9F99\u5821\u53C2\u5929\u9AD8\u5730",rank:null,position:[34.7,28.8,0],mob:"\u8FFD\u730E\u79CD\u9646\u884C\u9E1F",level:53,color:"yellow"}]},{no:"100",action:23285,patch:"5.45",spell_en:"Matra Magic",spell_ja:"\u30DE\u30C8\u30E9\u30DE\u30B8\u30C3\u30AF",spell:"\u9A6C\u7279\u62C9\u9B54\u672F",level:70,icon:"003352.png",icon_hr1:"003352_hr1.png",icon_book:"072301.png",icon_book_hr1:"072301_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 100 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:70,color:"yellow"}]},{no:"101",action:23286,patch:"5.45",spell_en:"Peripheral Synthesis",spell:"\u751F\u6210\u5916\u8BBE",level:70,icon:"003353.png",icon_hr1:"003353_hr1.png",icon_book:"072302.png",icon_book_hr1:"072302_hr1.png",method:[{type:"raid",name:"\u6B27\u7C73\u8304\u65F6\u7A7A\u72ED\u7F1D \u963F\u5C14\u6CD5\u5E7B\u58833",mob:"\u6B27\u7C73\u8304",level:70,note:"\u540C\u4E00\u526F\u672C\u8FD8\u6709\u4E13\u5C5E\u6280\u80FD 2\u706B\u708E\u653E\u5C04 101\u751F\u6210\u5916\u8BBE",color:"yellow"},{type:"raid",name:"\u6B27\u7C73\u8304\u96F6\u5F0F\u65F6\u7A7A\u72ED\u7F1D \u963F\u5C14\u6CD5\u5E7B\u58833",mob:"\u6B27\u7C73\u8304",level:70}]},{no:"102",action:23287,patch:"5.45",spell_en:"Both Ends",spell:"\u5982\u610F\u5927\u65CB\u98CE",level:70,icon:"003354.png",icon_hr1:"003354_hr1.png",icon_book:"072303.png",icon_book_hr1:"072303_hr1.png",method:[{type:"dungeon",name:"\u98CE\u6C34\u7075\u5E99\u5CA9\u71D5\u5E99",mob:"\u9F50\u5929\u5927\u5723",level:70,note:"BOSS #3",color:"yellow"}]},{no:"103",action:23288,patch:"5.45",spell_en:"Phantom Flurry",spell:"\u9B3C\u5BBF\u811A",level:70,icon:"003355.png",icon_hr1:"003355_hr1.png",icon_book:"072304.png",icon_book_hr1:"072304_hr1.png",method:[{type:"trail",name:"\u6731\u96C0\u9547\u9B42\u6218",mob:"\u6731\u96C0",level:70,color:"yellow"},{type:"trail",name:"\u6731\u96C0\u8BD7\u9B42\u6218",mob:"\u6731\u96C0",level:70}]},{no:"104",action:23290,patch:"5.45",spell_en:"Nightbloom",spell:"\u6708\u4E0B\u5F7C\u5CB8\u82B1",level:70,icon:"003357.png",icon_hr1:"003357_hr1.png",icon_book:"072305.png",icon_book_hr1:"072305_hr1.png",method:[{type:"trail",name:"\u6708\u8BFB\u6B7C\u706D\u6218",mob:"\u6708\u8BFB",level:70,color:"yellow"},{type:"trail",name:"\u6708\u8BFB\u5E7D\u591C\u6B7C\u706D\u6218",mob:"\u6708\u8BFB",level:70}]},{no:105,action:34563,patch:"6.45",spell_ja:"\u30B4\u30D6\u30EA\u30F3\u30D1\u30F3\u30C1",spell_en:"Goblin Punch",spell:"\u54E5\u5E03\u6797\u4E71\u62F3",level:70,icon:"003358.png",icon_hr1:"003358_hr1.png",icon_book:"072306.png",icon_book_hr1:"072306_hr1.png",method:[{type:"map",map:"\u73C2\u9732\u897F\u4E9A\u5C9B",rank:null,position:[33,33,0],mob:"\u5927\u54E5\u5E03\u6797",level:70},{type:"map",map:"\u73C2\u9732\u897F\u4E9A\u5C9B",rank:null,position:[37,28,0],mob:"\u5927\u54E5\u5E03\u6797",level:70},{type:"map",map:"\u73C2\u9732\u897F\u4E9A\u5C9B",rank:null,position:[26,10,0],mob:"\u5927\u54E5\u5E03\u6797\u5B88\u536B",level:70},{type:"hunt",map:"\u73C2\u9732\u897F\u4E9A\u5C9B",rank:"A",position:[],mob:"\u5C0F\u5C0F\u6740\u624B",level:80,color:"red"}]},{no:106,action:34564,patch:"6.45",spell_ja:"\u5927\u56DE\u8EE2",spell_en:"Right Round",spell:"\u5927\u56DE\u65CB",level:77,icon:"003359.png",icon_hr1:"003359_hr1.png",icon_book:"072307.png",icon_book_hr1:"072307_hr1.png",method:[{type:"dungeon",name:"\u907F\u6691\u79BB\u5BAB\u9A6C\u5229\u5361\u5927\u4E95",mob:"\u5927\u72B0\u72F3",note:"BOSS#1\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",level:77,color:"yellow"}]},{no:107,action:34565,patch:"6.45",spell_ja:"\u30B9\u30AD\u30EB\u30C8\u30ED\u30F3",spell_en:"Schiltron",spell:"\u523A\u9635",level:77,icon:"003360.png",icon_hr1:"003360_hr1.png",icon_book:"072308.png",icon_book_hr1:"072308_hr1.png",method:[{type:"map",map:"\u5B89\u7A46\xB7\u827E\u5170",rank:null,position:[17,30,0],mob:"\u786C\u9CDE\u72B0\u72F3",level:77,note:"\u7591\u4F3C\u751F\u547D\u503C\u8FBE\u523050%\u65F6\u4F7F\u7528",color:"yellow"},{type:"map",map:"\u5B89\u7A46\xB7\u827E\u5170",rank:null,position:[17,30,0],mob:"\u957F\u5C3E\u72B0\u72F3",level:77,color:"yellow"},{type:"hunt",map:"\u8428\u7EF4\u5948\u5C9B",rank:"B",position:[],mob:"\u91D1\u521A\u9E20\u6469\u7F57",level:90,color:"red"}]},{no:108,action:34566,patch:"6.45",spell_ja:"\u88DC\u6C34",spell_en:"Rehydration",spell:"\u8865\u6C34",level:70,icon:"003361.png",icon_hr1:"003361_hr1.png",icon_book:"072309.png",icon_book_hr1:"072309_hr1.png",method:[{type:"map",map:"\u5B89\u7A46\xB7\u827E\u5170",rank:null,position:[32,9,0],mob:"\u6ED1\u6E9C\u72B0\u72F3",level:70,color:"yellow"},{type:"dungeon",name:"\u907F\u6691\u79BB\u5BAB\u9A6C\u5229\u5361\u5927\u4E95",mob:"\u7FA4\u843D\u72B0\u72F3",note:"BOSS#1\u53EC\u5524\u7684\u5C0F\u602A\u3002\u5373\u6B7B\u6548\u679C\u4E0E\u6BD4\u4F8B\u4F24\u5BB3\u6709\u6548",level:77}]},{no:109,action:34567,patch:"6.45",spell_ja:"\u30DE\u30B8\u30AB\u30EB\u30D6\u30EC\u30B9",spell_en:"Breath Of Magic",spell:"\u9B54\u529B\u5410\u606F",level:80,icon:"003362.png",icon_hr1:"003362_hr1.png",icon_book:"072310.png",icon_book_hr1:"072310_hr1.png",method:[{type:"special",text:"\u8FBE\u5230 80 \u7EA7\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:80,color:"yellow"}]},{no:110,action:34568,patch:"6.45",spell_ja:"\u7363\u9B42\u306E\u6012\u308A",spell_en:"Wild Rage",spell:"\u517D\u9B42\u7684\u6124\u6012",level:80,icon:"003363.png",icon_hr1:"003363_hr1.png",icon_book:"072311.png",icon_book_hr1:"072311_hr1.png",method:[{type:"dungeon",name:"\u6697\u5F71\u51B3\u6218\u8BFA\u5F17\u5170\u7279",mob:"\u5E7B\u5149\u72C2\u6218\u58EB",note:"BOSS #3",level:80,color:"yellow"}]},{no:111,action:34569,patch:"6.45",spell_ja:"\u6CE5\u56E3\u5B50\u904A\u3073",spell_en:"Peat Pelt",spell:"\u73A9\u6CE5\u7403",level:80,icon:"003364.png",icon_hr1:"003364_hr1.png",icon_book:"072312.png",icon_book_hr1:"072312_hr1.png",method:[{type:"dungeon",name:"\u9B54\u672F\u5DE5\u623F\u739B\u6258\u96C5\u5DE5\u4F5C\u5BA4",mob:"\u571F\u6CE5\u4EBA",note:"BOSS #1",level:80,color:"yellow"}]},{no:112,action:34570,patch:"6.45",spell_ja:"\u5927\u6383\u9664",spell_en:"Deep Clean",spell:"\u5927\u626B\u9664",level:80,icon:"003365.png",icon_hr1:"003365_hr1.png",icon_book:"072313.png",icon_book_hr1:"072313_hr1.png",method:[{type:"dungeon",name:"\u9B54\u6CD5\u5BAB\u6BBF\u5B87\u5B99\u5BAB",mob:"\u5BAB\u6BBF\u7684\u9690\u8005",note:"BOSS #1",level:80,color:"yellow"}]},{no:113,action:34571,patch:"6.45",spell_ja:"\u30EB\u30D3\u30FC\u30C0\u30A4\u30CA\u30E2",spell_en:"Ruby Dynamics",spell:"\u7EA2\u5B9D\u77F3\u7535\u5708",level:80,icon:"003366.png",icon_hr1:"003366_hr1.png",icon_book:"072314.png",icon_book_hr1:"072314_hr1.png",method:[{type:"trail",name:"\u7EA2\u5B9D\u77F3\u795E\u5175\u7834\u574F\u4F5C\u6218",mob:"\u7EA2\u5B9D\u77F3\u795E\u5175",level:80,note:"PART.1",color:"yellow"},{type:"trail",name:"\u7EA2\u5B9D\u77F3\u795E\u5175\u72C2\u60F3\u4F5C\u6218",mob:"\u7EA2\u5B9D\u77F3\u795E\u5175",level:80,note:"PART.1"}]},{no:114,action:34572,patch:"6.45",spell_ja:"\u9B54\u306E\u30EB\u30FC\u30F3",spell_en:"Divination Rune",spell:"\u9B54\u4E4B\u7B26\u6587",level:73,icon:"003367.png",icon_hr1:"003367_hr1.png",icon_book:"072315.png",icon_book_hr1:"072315_hr1.png",method:[{type:"trail",name:"\u7F07\u5766\u59AE\u96C5\u6B7C\u706D\u6218",mob:"\u7F07\u5766\u59AE\u96C5",level:73,color:"yellow"},{type:"trail",name:"\u7F07\u5766\u59AE\u96C5\u6B7C\u6B9B\u6218",mob:"\u7F07\u5766\u59AE\u96C5",level:80}]},{no:115,action:34573,patch:"6.45",spell_ja:"\u30C7\u30A3\u30E1\u30F3\u30B7\u30E7\u30F3\u30B7\u30D5\u30C8",spell_en:"Dimensional Shift",spell:"\u7A7A\u95F4\u8F6C\u6362",level:80,icon:"003368.png",icon_hr1:"003368_hr1.png",icon_book:"072316.png",icon_book_hr1:"072316_hr1.png",method:[{type:"raid",name:"\u4F0A\u7538\u5E0C\u671B\u4E50\u56ED \u89C9\u9192\u4E4B\u7AE01",mob:"\u81F3\u5C0A\u4F0A\u7538",level:80,color:"yellow"},{type:"raid",name:"\u4F0A\u7538\u96F6\u5F0F\u5E0C\u671B\u4E50\u56ED \u89C9\u9192\u4E4B\u7AE01",mob:"\u81F3\u5C0A\u4F0A\u7538",level:80}]},{no:116,action:34574,patch:"6.45",spell_ja:"\u30B3\u30F3\u30F4\u30A3\u30AF\u30B7\u30E7\u30F3\u30FB\u30DE\u30EB\u30AB\u30FC\u30C8",spell_en:"Conviction Marcato",spell:"\u52A0\u5F3A\u4FE1\u97F3",level:79,icon:"003369.png",icon_hr1:"003369_hr1.png",icon_book:"072317.png",icon_book_hr1:"072317_hr1.png",method:[{type:"dungeon",name:"\u4F2A\u9020\u5929\u754C\u683C\u9C81\u683C\u706B\u5C71",mob:"\u5F97\u5230\u5BBD\u6055\u7684\u7325\u4EB5",note:"BOSS #3",level:79,color:"yellow"}]},{no:117,action:34575,patch:"6.45",spell_ja:"\u30D5\u30A9\u30FC\u30B9\u30D5\u30A3\u30FC\u30EB\u30C9",spell_en:"Force Field",spell:"\u529B\u573A",level:60,icon:"003370.png",icon_hr1:"003370_hr1.png",icon_book:"072318.png",icon_book_hr1:"072318_hr1.png",method:[{type:"special",text:"\u5B66\u4E60 120 \u4E2A\u6280\u80FD\u540E\u53EF\u4ECE[\u4E4C\u5C14\u8FBE\u54C8\u6765\u751F\u56DE\u5ECA]\u7684[\u5F02\u7537\u5B50\u560E\u5E0C\u8FE6]\u5904\u83B7\u5F97[\u5929\u9752\u56FE\u817E]",level:80,color:"yellow"},{type:"trail",name:"\u8428\u83F2\u6D1B\u7279\u6B7C\u6B9B\u6218",mob:"\u8428\u83F2\u6D1B\u7279",level:60}]},{no:118,action:34576,patch:"6.45",spell_ja:"\u65AD\u7F6A\u306E\u98DB\u7FD4",spell_en:"Winged Reprobation",spell:"\u65AD\u7F6A\u98DE\u7FD4",level:79,icon:"003371.png",icon_hr1:"003371_hr1.png",icon_book:"072319.png",icon_book_hr1:"072319_hr1.png",method:[{type:"trail",name:"\u65E0\u7455\u7075\u541B\u6B7C\u706D\u6218",mob:"\u65E0\u7455\u7075\u541B",level:79,color:"yellow"},{type:"trail",name:"\u65E0\u7455\u7075\u541B\u6B7C\u6B9B\u6218",mob:"\u65E0\u7455\u7075\u541B",level:80}]},{no:119,action:34577,patch:"6.45",spell_ja:"\u30E1\u30FC\u30B6\u30FC\u30A2\u30A4",spell_en:"Laser Eye",spell:"\u6FC0\u5C04\u773C",level:80,icon:"003372.png",icon_hr1:"003372_hr1.png",icon_book:"072320.png",icon_book_hr1:"072320_hr1.png",method:[{type:"raid",name:"\u4F0A\u7538\u5E0C\u671B\u4E50\u56ED \u518D\u751F\u4E4B\u7AE04",mob:"\u4F0A\u7538\u4E4B\u7EA6",level:80,color:"yellow"},{type:"raid",name:"\u4F0A\u7538\u96F6\u5F0F\u5E0C\u671B\u4E50\u56ED \u518D\u751F\u4E4B\u7AE04",mob:"\u4F0A\u7538\u4E4B\u7EA6",level:80,color:"red"}]},{no:120,action:34578,patch:"6.45",spell_ja:"\u30AD\u30E3\u30F3\u30C7\u30A3\u30B1\u30FC\u30F3",spell_en:"Candy Cane",spell:"\u7CD6\u679C\u624B\u6756",level:73,icon:"003373.png",icon_hr1:"003373_hr1.png",icon_book:"072321.png",icon_book_hr1:"072321_hr1.png",method:[{type:"dungeon",name:"\u6C34\u5996\u5E7B\u56ED\u591A\u6069\u7F8E\u683C\u7981\u56ED",mob:"\u7F8E\u773C \u56E0\u514B\xB7\u4F50\u6069",note:"BOSS #1",level:73,color:"yellow"}]},{no:121,action:34579,patch:"6.45",spell_ja:"\u5FC5\u6EC5\u306E\u708E",spell_en:"Mortal Flame",spell:"\u5FC5\u706D\u4E4B\u708E",level:80,icon:"003374.png",icon_hr1:"003374_hr1.png",icon_book:"072322.png",icon_book_hr1:"072322_hr1.png",method:[{type:"dungeon",name:"\u9B54\u6CD5\u5BAB\u6BBF\u5B87\u5B99\u5BAB",mob:"\u5362\u683C\u65AF",note:"BOSS #3",level:80,color:"yellow"}]},{no:122,action:34580,patch:"6.45",spell_ja:"\u30B0\u30EB\u30B0\u30EB\u30B6\u30D1\u30FC\u30F3",spell_en:"Sea Shanty",spell:"\u5495\u565C\u5495\u565C",level:80,icon:"003375.png",icon_hr1:"003375_hr1.png",icon_book:"072323.png",icon_book_hr1:"072323_hr1.png",method:[{type:"dungeon",name:"\u9B54\u672F\u5DE5\u623F\u739B\u6258\u96C5\u5DE5\u4F5C\u5BA4",mob:"\u6C34\u6EF4\u7CBE",note:"BOSS #2",level:80,color:"yellow"}]},{no:123,action:34581,patch:"6.45",spell_ja:"\u30A2\u30DD\u30AB\u30EA\u30E5\u30D7\u30B7\u30B9",spell_en:"Apokalypsis",spell:"\u542F\u793A\u5F55",level:80,icon:"003376.png",icon_hr1:"003376_hr1.png",icon_book:"072324.png",icon_book_hr1:"072324_hr1.png",method:[{type:"dungeon",name:"\u672B\u65E5\u6697\u5F71\u4E9A\u9A6C\u4E4C\u7F57\u63D0",mob:"\u81F3\u5927\u707E\u517D",note:"BOSS #3",level:80,color:"yellow"}]},{no:124,action:34582,patch:"6.45",spell_ja:"\u6B7B\u3059\u3079\u304D\u5B9A\u3081",spell_en:"Being Mortal",spell:"\u7EC8\u6709\u4E00\u6B7B",level:73,icon:"003377.png",icon_hr1:"003377_hr1.png",icon_book:"072325.png",icon_book_hr1:"072325_hr1.png",method:[{type:"trail",name:"\u7F07\u5766\u59AE\u96C5\u6B7C\u706D\u6218",mob:"\u7F07\u5766\u59AE\u96C5",level:73,color:"yellow"},{type:"trail",name:"\u7F07\u5766\u59AE\u96C5\u6B7C\u6B9B\u6218",mob:"\u7F07\u5766\u59AE\u96C5",level:80}]}];const spells=spells$1;function renderSpellMethod(e){switch(e.type){case"map":case"hunt":case"levequests":{const t=e.position;return`${e.map} ${e.rank?`[${e.rank}]`:""}${t&&t.length?typeof t=="string"?`(${t})`:`(x:${t[0]}, y:${t[1]}${t[2]?`, z:${t[2]}`:""})`:""} - ${e.mob}`}case"raid":case"dungeon":case"trail":case"treasure":case"guildhests":case"carnivale":return`${e.name} - ${e.mob}`;case"fate":return`${e.map} - ${e.name} - ${e.mob}`;case"special":return`${e.text}`}}const learnedByNo=(e,t)=>e[indexByNo(t)]===1,indexByNo=e=>+e-1;function spellIcon(e,t){return`icons/spells/${t?e.icon_book:e.icon}`}function spellIconSrcset(e,t){return[`icons/spells/${t?e.icon_book:e.icon} 1x`,`icons/spells/${t?e.icon_book_hr1:e.icon_hr1} 2x`].join(", ")}var Title_vue_vue_type_style_index_0_scoped_true_lang="",_export_sfc=(e,t)=>{const n=e.__vccOpts||e;for(const[o,r]of t)n[o]=r;return n};const _sfc_main$a={},_hoisted_1$7={class:"title"};function _sfc_render(e,t){return openBlock(),createElementBlock("h3",_hoisted_1$7,[renderSlot(e.$slots,"default",{},void 0,!0)])}var Title=_export_sfc(_sfc_main$a,[["render",_sfc_render],["__scopeId","data-v-5d92bb26"]]),Book_vue_vue_type_style_index_0_scoped_true_lang="";const _hoisted_1$6={class:"wrap"},_hoisted_2$6={class:"pager"},_hoisted_3$5=["onClick"],_hoisted_4$5=["onClick","title","data-ck-action-id"],_hoisted_5$4=["src","srcset"],_sfc_main$9=defineComponent({__name:"Book",props:{spellStatus:null},emits:["change"],setup(e,{emit:t}){const n=e,o=16,r=Math.ceil(spells.length/o),i=ref(1),l=computed(()=>spells.slice((i.value-1)*o,i.value*o)),a=s=>{t("change",s,!n.spellStatus[s])};return(s,u)=>(openBlock(),createElementBlock("div",_hoisted_1$6,[createVNode(Title,{style:{"margin-bottom":"10px"}},{default:withCtx(()=>[createTextVNode("\u9752\u9B54\u6CD5\u4E66")]),_:1}),createBaseVNode("div",_hoisted_2$6,[(openBlock(!0),createElementBlock(Fragment,null,renderList(unref(r),_=>(openBlock(),createElementBlock("span",{key:_,onClick:v=>i.value=_,class:normalizeClass({active:i.value===_})},toDisplayString(_),11,_hoisted_3$5))),128))]),(openBlock(!0),createElementBlock(Fragment,null,renderList(unref(l),(_,v)=>(openBlock(),createElementBlock("div",{key:_.no,class:normalizeClass(["spell",{lighter:v%2===Math.floor(v/4)%2,learned:unref(learnedByNo)(n.spellStatus,_.no)}]),onClick:y=>a(unref(indexByNo)(_.no)),title:_.spell,"data-ck-action-id":_.action},[createBaseVNode("img",{src:unref(spellIcon)(_),srcset:unref(spellIconSrcset)(_)},null,8,_hoisted_5$4),createBaseVNode("span",null,toDisplayString(_.no),1)],10,_hoisted_4$5))),128))]))}});var Book=_export_sfc(_sfc_main$9,[["__scopeId","data-v-55403f86"]]),Method_vue_vue_type_style_index_0_scoped_true_lang="";const _hoisted_1$5={class:"wrap"},_hoisted_2$5=["src"],_hoisted_3$4=["title"],_hoisted_4$4={key:0,class:"note"},_sfc_main$8=defineComponent({__name:"Method",props:{method:null},emits:["search"],setup(e,{emit:t}){const n=e,o=computed(()=>renderSpellMethod(n.method)),r={red:"#ca3a3a",blue:"#0000ff",green:"#00ff00",yellow:"#ffff00",grey:"#666"},i=computed(()=>{const s=n.method.color;return s?r[s.toLowerCase()]||s:"#ffffff"}),l=computed(()=>n.method.type==="fate"&&"map"in n.method&&n.method.map?n.method.map:"name"in n.method&&n.method.name?n.method.name:"map"in n.method&&n.method.map?n.method.map:""),a=()=>{l.value&&t("search",l.value)};return(s,u)=>(openBlock(),createElementBlock("div",_hoisted_1$5,[createBaseVNode("img",{class:"type",src:`icons/type_${n.method.type}.png`},null,8,_hoisted_2$5),createBaseVNode("span",{style:normalizeStyle({color:unref(i)}),class:normalizeClass({clickable:!!unref(l)}),onClick:a,title:unref(l)?`\u70B9\u51FB\u641C\u7D22\u76F8\u540C\u9014\u5F84\uFF1A${unref(l)}`:""},[createTextVNode(toDisplayString(unref(o))+" ",1),createBaseVNode("sup",null,"Lv."+toDisplayString(n.method.level),1)],14,_hoisted_3$4),n.method.note?(openBlock(),createElementBlock("p",_hoisted_4$4,toDisplayString(n.method.note),1)):createCommentVNode("",!0)]))}});var SpellMethod=_export_sfc(_sfc_main$8,[["__scopeId","data-v-3d58a898"]]),Tag_vue_vue_type_style_index_0_scoped_true_lang="";const _sfc_main$7=defineComponent({__name:"Tag",props:{color:null},setup(e){const t=e;return(n,o)=>(openBlock(),createElementBlock("span",{class:"tag",style:normalizeStyle({backgroundColor:t.color})},[renderSlot(n.$slots,"default",{},void 0,!0)],4))}});var Tag=_export_sfc(_sfc_main$7,[["__scopeId","data-v-3b6c723e"]]);const _sfc_main$6=defineComponent({__name:"PatchVersion",props:{version:null},setup(e){const t=e,n={"4.5":"rgb(228, 101, 124)","5.15":"rgb(127, 15, 170)","5.45":"rgb(144, 103, 173)","6.45":"rgb(191, 120, 19)"};return(o,r)=>(openBlock(),createBlock(Tag,{color:n[t.version]},{default:withCtx(()=>[createTextVNode(toDisplayString(t.version),1)]),_:1},8,["color"]))}});var Indicator_vue_vue_type_style_index_0_scoped_true_lang="";const _sfc_main$5=defineComponent({__name:"Indicator",props:{checked:{type:Boolean},bordered:{type:Boolean}},emits:["change"],setup(e,{emit:t}){const n=e;return(o,r)=>(openBlock(),createElementBlock("div",{class:normalizeClass(["indicator",{checked:n.checked,bordered:n.bordered}]),onClick:r[0]||(r[0]=i=>t("change",!n.checked))},null,2))}});var Indicator=_export_sfc(_sfc_main$5,[["__scopeId","data-v-5963fd22"]]),SpellItem_vue_vue_type_style_index_0_scoped_true_lang="";const _hoisted_1$4={class:"spell"},_hoisted_2$4=["src","srcset","data-ck-action-id"],_hoisted_3$3={class:"content"},_hoisted_4$3={key:0,class:"unlearned-count text-gold"},_hoisted_5$3={class:"methods"},_sfc_main$4=defineComponent({__name:"SpellItem",props:{spell:null,learned:{type:Boolean},unlearnedCount:null,showUnlearnedCount:{type:Boolean}},emits:["change","search"],setup(e,{emit:t}){const n=e;return(o,r)=>(openBlock(),createElementBlock("div",_hoisted_1$4,[createBaseVNode("img",{class:"icon",src:unref(spellIcon)(n.spell,!0),srcset:unref(spellIconSrcset)(n.spell,!0),"data-ck-action-id":n.spell.action},null,8,_hoisted_2$4),createBaseVNode("div",_hoisted_3$3,[createBaseVNode("h4",null,[createVNode(_sfc_main$6,{version:n.spell.patch},null,8,["version"]),createVNode(Tag,{color:"#eee1c5",title:"\u70B9\u51FB\u5207\u6362\u5B66\u4E60\u72B6\u6001",style:{cursor:"pointer"},onClick:r[0]||(r[0]=i=>t("change",!e.learned))},{default:withCtx(()=>[createVNode(Indicator,{checked:n.learned},null,8,["checked"]),createTextVNode(" No."+toDisplayString(n.spell.no),1)]),_:1}),createTextVNode(" "+toDisplayString(n.spell.spell)+" ",1),createBaseVNode("small",null,"(Lv."+toDisplayString(n.spell.level)+")",1),n.showUnlearnedCount?(openBlock(),createElementBlock("small",_hoisted_4$3," (\u672A\u638C\u63E1\u4EBA\u6570: "+toDisplayString(n.unlearnedCount)+") ",1)):createCommentVNode("",!0)]),createBaseVNode("ul",_hoisted_5$3,[(openBlock(!0),createElementBlock(Fragment,null,renderList(n.spell.method,(i,l)=>(openBlock(),createElementBlock("li",{key:l},[createVNode(SpellMethod,{method:i,onSearch:r[1]||(r[1]=a=>t("search",a))},null,8,["method"])]))),128))])])]))}});var SpellItem=_export_sfc(_sfc_main$4,[["__scopeId","data-v-9bd1eac2"]]);const loadSetting=e=>{let t;if(localStorage)t=localStorage.getItem(e);else{const n=document.cookie;let o=n.indexOf(e+"=");if(o>=0){o+=e.length+1;const r=n.indexOf(";",o);t=n.substr(o,r===-1?void 0:r-o)}}if(!!t)try{return JSON.parse(t)}catch{return}},saveSetting=(e,t)=>{const n=JSON.stringify(t);if(localStorage)localStorage.setItem(e,n);else{const o=new Date;o.setFullYear(o.getFullYear()+10),document.cookie=`${e}=${n};expires=${o.toUTCString()};path=/`}};var SpellList_vue_vue_type_style_index_0_scoped_true_lang="";const _hoisted_1$3={class:"relative"},_hoisted_2$3={class:"notice"},_sfc_main$3=defineComponent({__name:"SpellList",props:{filterTypes:null,minUnlearned:null,filter:null,orderByUnlearned:{type:Boolean},spellStatus:null,unlearnedCountMap:null,isPartyModeActive:{type:Boolean}},emits:["change","clearFilter","search"],setup(e,{emit:t}){var v,y;const n=e,o=ref((v=loadSetting("notLearnedOnly"))!=null?v:!0),r=ref((y=loadSetting("hide-special-color"))!=null?y:!0);watch(o,S=>{saveSetting("notLearnedOnly",S)}),watch(r,S=>{saveSetting("hide-special-color",S)});const i=computed(()=>n.filter?"search":o.value?"notLearned":"all"),l=["red","#ff0000","grey","#666"],a=S=>S==="fate"||S==="hunt"||S==="treasure"||S==="guildhests"?"other":S==="special"?"carnivale":S,s={search:S=>{const b=n.filter;return String(S.no).includes(b)||S.spell.includes(b)?!0:S.method.some(g=>{const d=g,C=(d.color||"").toLowerCase();return["grey","#666"].includes(C)?!1:[d.map,d.name,d.mob,d.rank].filter(Boolean).some(O=>String(O).includes(b))})},notLearned:(S,b)=>{const g=n.unlearnedCountMap.get(Number(S.no))||0;return(n.isPartyModeActive?g>0:!n.spellStatus[b])&&g>=n.minUnlearned&&S.method.some(C=>{if(!n.filterTypes[a(C.type)])return!1;if(r.value){const x=(C.color||"").toLowerCase();if(l.includes(x))return!1}return!0})},all:S=>S.method.some(b=>{if(!n.filterTypes[a(b.type)])return!1;if(r.value){const g=(b.color||"").toLowerCase();if(l.includes(g))return!1}return!0})},u=computed(()=>{let S=spells.filter(s[i.value]);return r.value&&(S=S.map(b=>({...b,method:b.method.filter(g=>{const d=(g.color||"").toLowerCase();return!l.includes(d)})})).filter(b=>b.method.length>0)),n.orderByUnlearned&&S.sort((b,g)=>{const d=(n.unlearnedCountMap.get(Number(g.no))||0)-(n.unlearnedCountMap.get(Number(b.no))||0);return d!==0?d:Number(b.no)-Number(g.no)}),S}),_=computed(()=>spells.every((S,b)=>!!n.spellStatus[b]));return(S,b)=>(openBlock(),createElementBlock("main",_hoisted_1$3,[createBaseVNode("div",_hoisted_2$3,[unref(i)==="notLearned"?(openBlock(),createElementBlock(Fragment,{key:0},[createTextVNode(toDisplayString(unref(u).length?"\u5F53\u524D\u72B6\u6001":unref(_)&&!n.isPartyModeActive?"\u606D\u559C\uFF0C\u60A8\u5DF2\u7ECF\u638C\u4F1A\u4E86\u5F53\u524D\u7248\u672C\u7684\u6240\u6709\u6280\u80FD":"\u5F53\u524D\u6761\u4EF6\u4E0B\u6682\u65E0\u53EF\u5B66\u4E60\u7684\u6280\u80FD")+"\uFF1A ",1),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[0]||(b[0]=g=>o.value=!1)}," \u25CB\u9690\u85CF\u4E86\u5DF2\u638C\u63E1\u6280\u80FD "),createTextVNode("\uFF1B "),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[1]||(b[1]=g=>r.value=!r.value)},toDisplayString(r.value?"\u25CB\u9690\u85CF\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84":"\u25CF\u663E\u793A\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84"),1)],64)):unref(i)==="all"?(openBlock(),createElementBlock(Fragment,{key:1},[createTextVNode(" \u5F53\u524D\u72B6\u6001\uFF1A "),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[2]||(b[2]=g=>o.value=!0)}," \u25CF\u663E\u793A\u4E86\u5DF2\u638C\u63E1\u6280\u80FD "),createTextVNode("\uFF1B "),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[3]||(b[3]=g=>r.value=!r.value)},toDisplayString(r.value?"\u25CB\u9690\u85CF\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84":"\u25CF\u663E\u793A\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84"),1)],64)):(openBlock(),createElementBlock(Fragment,{key:2},[createTextVNode(" \u5C55\u793A\u5305\u542B\u201C"+toDisplayString(n.filter)+"\u201D\u7684\u6280\u80FD\uFF08"+toDisplayString(unref(u).length)+" \u4E2A\uFF09\uFF0C ",1),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[4]||(b[4]=g=>t("clearFilter"))}," \u6E05\u7A7A\u641C\u7D22\u6761\u4EF6 "),createTextVNode("\uFF0C "),createBaseVNode("a",{href:"javascript:void(0)",onClick:b[5]||(b[5]=g=>r.value=!r.value)},toDisplayString(r.value?"\u25CB\u9690\u85CF\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84":"\u25CF\u663E\u793A\u4E86\u7CDF\u7CD5\u7684\u5B66\u4E60\u9014\u5F84"),1)],64))]),(openBlock(!0),createElementBlock(Fragment,null,renderList(unref(u),g=>(openBlock(),createBlock(SpellItem,{key:g.no,spell:g,learned:n.isPartyModeActive?(n.unlearnedCountMap.get(Number(g.no))||0)===0:unref(learnedByNo)(n.spellStatus,g.no),unlearnedCount:n.unlearnedCountMap.get(Number(g.no)),showUnlearnedCount:n.isPartyModeActive,onChange:d=>t("change",unref(indexByNo)(g.no),d),onSearch:b[6]||(b[6]=d=>t("search",d))},null,8,["spell","learned","unlearnedCount","showUnlearnedCount","onChange"]))),128))]))}});var SpellList=_export_sfc(_sfc_main$3,[["__scopeId","data-v-7fd6aa81"]]),Filter_vue_vue_type_style_index_0_scoped_true_lang="";const _withScopeId$1=e=>(pushScopeId("data-v-721ebf9d"),e=e(),popScopeId(),e),_hoisted_1$2={class:"wrap"},_hoisted_2$2={class:"level"},_hoisted_3$2=_withScopeId$1(()=>createBaseVNode("span",{class:"label"},"\u81F3\u5C11\u6709",-1)),_hoisted_4$2=["value"],_hoisted_5$2=_withScopeId$1(()=>createBaseVNode("span",{class:"label"},"\u4EBA\u672A\u638C\u63E1",-1)),_hoisted_6$1=["onClick"],_hoisted_7$1=["src"],_sfc_main$2=defineComponent({__name:"Filter",props:{filterTypes:null,minUnlearned:null,orderByUnlearned:{type:Boolean}},emits:["unlearnedChange","typeChange","orderChange","openConfig"],setup(e,{emit:t}){const n=e,o=l=>{let a=+(l==null?void 0:l.target).value;isNaN(a)&&(a=1),t("unlearnedChange",a)},r=(l,a)=>{t("typeChange",l,!a)},i=l=>{t("orderChange",!l)};return(l,a)=>(openBlock(),createElementBlock("div",_hoisted_1$2,[createVNode(Title,null,{default:withCtx(()=>[createTextVNode(" \u5F00\u8F66\u6A21\u5F0F "),createBaseVNode("button",{class:"config-btn",onClick:a[0]||(a[0]=s=>t("openConfig")),title:"\u914D\u7F6E\u7EC4\u961F\u6210\u5458"},"\u914D\u7F6E")]),_:1}),createBaseVNode("div",_hoisted_2$2,[_hoisted_3$2,createBaseVNode("input",{type:"number",max:"8",min:"0",class:"num-input",value:n.minUnlearned,onInput:o},null,40,_hoisted_4$2),_hoisted_5$2,createBaseVNode("div",{class:normalizeClass(["order",{checked:n.orderByUnlearned}]),onClick:a[1]||(a[1]=s=>i(n.orderByUnlearned))},[createVNode(Indicator,{checked:n.orderByUnlearned,bordered:""},null,8,["checked"]),createTextVNode(" \u6309\u672A\u638C\u63E1\u4EBA\u6570\u6392\u5E8F ")],2)]),createVNode(Title,null,{default:withCtx(()=>[createTextVNode("\u5B66\u4E60\u9014\u5F84\u8FC7\u6EE4")]),_:1}),createBaseVNode("ul",null,[(openBlock(!0),createElementBlock(Fragment,null,renderList(e.filterTypes,(s,u,_)=>(openBlock(),createElementBlock("li",{key:u,class:normalizeClass(["type",{lighter:_%2===0}]),onClick:v=>r(u,s)},[createBaseVNode("img",{src:`icons/type_${u}.png`},null,8,_hoisted_7$1),createVNode(Indicator,{checked:s},null,8,["checked"])],10,_hoisted_6$1))),128))])]))}});var Filter=_export_sfc(_sfc_main$2,[["__scopeId","data-v-721ebf9d"]]),Progress_vue_vue_type_style_index_0_scoped_true_lang="";const _hoisted_1$1={class:"wrap"},_hoisted_2$1={class:"detail"},_hoisted_3$1=["onClick"],_hoisted_4$1=["title"],_hoisted_5$1=["onClick"],_sfc_main$1=defineComponent({__name:"Progress",props:{spellStatus:null},emits:["change"],setup(e,{emit:t}){const n=e;class o{constructor(){Be(this,"total",0);Be(this,"learned",0)}get progress(){return this.total?0:this.learned/this.total}increase(u){this.total++,u&&this.learned++}}const r=computed(()=>spells.reduce((s,u,_)=>{u.patch in s||(s[u.patch]=new o);const v=n.spellStatus[_]===1;return s.all.increase(v),s[u.patch].increase(v),s},{all:new o})),i=(s,u)=>{!!n.spellStatus[s]!==u&&t("change",s,u)},l=(s,u)=>{for(let _=0;_<spells.length;_++)u!=="all"&&spells[_].patch!==u||i(_,s)},a=(s,u)=>`${u?s/u*100:0}%`;return(s,u)=>(openBlock(),createElementBlock("div",_hoisted_1$1,[createVNode(Title,null,{default:withCtx(()=>[createTextVNode("\u8FDB\u5EA6")]),_:1}),(openBlock(!0),createElementBlock(Fragment,null,renderList(unref(r),(_,v)=>(openBlock(),createElementBlock("div",{key:v,class:"item"},[createBaseVNode("span",null,[v!=="all"?(openBlock(),createBlock(_sfc_main$6,{key:0,version:v},null,8,["version"])):(openBlock(),createElementBlock(Fragment,{key:1},[createTextVNode("\u603B\u4F53")],64))]),createBaseVNode("div",_hoisted_2$1,[createBaseVNode("button",{class:"button",onClick:y=>l(!1,v)}," \u6E05\u7A7A ",8,_hoisted_3$1),createBaseVNode("div",{class:"progress",title:`${_.learned}/${_.total}`},[createBaseVNode("div",{style:normalizeStyle({width:a(_.learned,_.total)})},null,4)],8,_hoisted_4$1),createBaseVNode("button",{class:"button",onClick:y=>l(!0,v)},"\u5168\u9009",8,_hoisted_5$1)])]))),128))]))}});var Progress=_export_sfc(_sfc_main$1,[["__scopeId","data-v-74630ac7"]]),App_vue_vue_type_style_index_0_lang="",App_vue_vue_type_style_index_1_scoped_true_lang="";const _withScopeId=e=>(pushScopeId("data-v-df5863f6"),e=e(),popScopeId(),e),_hoisted_1=_withScopeId(()=>createBaseVNode("span",null,"\u9996\u6B21\u4F7F\u7528\u8BF7\u70B9\u6B64\u67E5\u770B\u5E2E\u52A9",-1)),_hoisted_2=_withScopeId(()=>createBaseVNode("div",{class:"help-icon",title:"\u67E5\u770B\u7F51\u9875\u4F7F\u7528\u5E2E\u52A9"}," ? ",-1)),_hoisted_3=[_hoisted_1,_hoisted_2],_hoisted_4={class:"modal-content"},_hoisted_5=_withScopeId(()=>createBaseVNode("h3",null,"\u5E2E\u52A9\u6307\u5357",-1)),_hoisted_6=_withScopeId(()=>createBaseVNode("div",{class:"help-text"},[createBaseVNode("p",null,[createTextVNode(" \u8FDB\u672C\u524D\u5EFA\u8BAE\u5728\u672C\u7F51\u9875"),createBaseVNode("strong",null,"\u5355\u51FB\u526F\u672C\u540D"),createTextVNode("\uFF08\u5C06\u81EA\u52A8\u586B\u5165\u641C\u7D22\u6846\uFF09\uFF0C\u4EE5\u68C0\u67E5\u526F\u672C\u4E2D\u662F\u5426\u6709\u5176\u4ED6\u4E13\u5C5E\u6280\u80FD\u53EF\u4EE5\u5B66\u3002\u53E6\u5916\uFF0C\u636E\u79F0\u82E5\u89E3\u9650\u6253\u672C\u65F6\uFF0C\u9AD8\u96BE\u672C\u7684\u4E60\u5F97\u6982\u7387\u5927\u4E8E\u666E\u901A\u7248\u672C\u3002 ")]),createBaseVNode("p",null,[createBaseVNode("strong",null,"\u83B7\u53D6\u9014\u5F84\u989C\u8272\u6807\u8BC6\uFF1A")]),createBaseVNode("ul",null,[createBaseVNode("li",null,[createBaseVNode("span",{class:"color-def text-gold"},"\u91D1\u8272\u4EE3\u8868\u6700\u63A8\u8350\u7684\u5B66\u4E60\u9014\u5F84")]),createBaseVNode("li",null,[createBaseVNode("span",{class:"color-def text-white"},"\u767D\u8272\u4EE3\u8868\u5176\u4ED6\u53EF\u9009\u9014\u5F84")]),createBaseVNode("li",null,[createBaseVNode("span",{class:"color-def text-red"},"\u7EA2\u8272\u4EE3\u8868\u4E0D\u5EFA\u8BAE\u8003\u8651\u7684\u9014\u5F84")]),createBaseVNode("li",null,[createBaseVNode("span",{class:"color-def text-grey"},"\u7070\u8272\u4EE3\u8868\u786E\u5B9A\u65E0\u6CD5\u5B66\u4F1A\u7684\u9014\u5F84\uFF0C\u4EE5\u514D\u540E\u4EBA\u91CD\u590D\u5B9E\u9A8C")])]),createBaseVNode("p",null,[createTextVNode(" \u672C\u7F51\u9875\u5185\u5BB9\u6700\u8FD1\u4E00\u6B21\u66F4\u65B0\u4E8E"),createBaseVNode("strong",null,"2026\u5E745\u670827\u65E5"),createTextVNode("\uFF087.50\u7248\u672C\uFF09\u3002\u6709\u5BF9\u7F51\u9875\u7684\u5EFA\u8BAE\u53CD\u9988\u3001\u6216\u5E2E\u5FD9\u63D0\u4F9B\u65B0\u7684\u5B66\u4E60\u9014\u5F84\u6837\u672C\uFF0C\u53EF\u4EE5"),createBaseVNode("a",{href:"https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk",target:"_blank",rel:"noopener noreferrer"},"\u70B9\u6B64\u63D0\u51FA")]),createBaseVNode("p",null,[createTextVNode(" \u6570\u636E\u6765\u6E90\u4E8E"),createBaseVNode("a",{href:"https://thewakingsands.github.io/blue-mage/",target:"_blank",rel:"noopener noreferrer"},"\u9752\u9B54\u6CD5\u5E08\u6280\u80FD\u5B66\u4E60\u6307\u5357"),createTextVNode("\u548C"),createBaseVNode("a",{href:"https://ff14.huijiwiki.com/",target:"_blank",rel:"noopener noreferrer"},"\u6700\u7EC8\u5E7B\u60F3XIV\u4E2D\u6587\u7EF4\u57FA"),createTextVNode("\uFF0C\u540C\u65F6\u53C2\u8003\u4E86"),createBaseVNode("a",{href:"http://www.timelysnow.com.cn/bluemagicebook/",target:"_blank",rel:"noopener noreferrer"},"\u9752\u9B54\u6CD5\u7535\u5B50\u4E66")])],-1)),_hoisted_7={class:"modal-content party-modal"},_hoisted_8=_withScopeId(()=>createBaseVNode("h3",null,"\u5F00\u8F66\u6A21\u5F0F\u914D\u7F6E",-1)),_hoisted_9={class:"help-text"},_hoisted_10=_withScopeId(()=>createBaseVNode("p",{style:{"margin-bottom":"20px"}},[createTextVNode(" \u5728\u6B64\u914D\u7F6E\u961F\u4F0D\u6210\u5458\u5DF2\u638C\u63E1\u7684\u6280\u80FD\u7F16\u53F7\u4EE5\u5F00\u542F\u5171\u540C\u5B66\u4E60\u3002"),createBaseVNode("strong",null,"\u7528\u6237 1"),createTextVNode(" \u9ED8\u8BA4\u4E3A\u5F53\u524D\u4F7F\u7528\u8005\uFF0C\u8BF7\u76F4\u63A5\u590D\u5236\u6846\u5185\u6570\u636E\u5206\u4EAB\u7ED9\u5176\u4ED6\u961F\u5458\u3002"),createBaseVNode("br"),createTextVNode(" \u5728\u5176\u4ED6\u7528\u6237\u7684\u6846\u4E2D\u7C98\u8D34\u4ED6\u4EBA\u5206\u4EAB\u7684\u7F16\u53F7\u6570\u636E\uFF08\u6309\u9017\u53F7\u6216\u7A7A\u683C\u5206\u9694\u5747\u53EF\uFF09\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u8BA1\u7B97\u5404\u4E2A\u6280\u80FD\u7684\u672A\u638C\u63E1\u4EBA\u6570\uFF0C\u5E76\u5141\u8BB8\u4F9D\u636E\u672A\u638C\u63E1\u4EBA\u6570\u5728\u5217\u8868\u4E2D\u8FC7\u6EE4\u4E0E\u6392\u5E8F\u3002"),createBaseVNode("br"),createTextVNode("\uFF08\u6CE8\uFF1A\u6B64\u529F\u80FD\u5C1A\u5728\u6D4B\u8BD5\u9636\u6BB5\uFF0C\u5982\u679C\u9047\u5230\u95EE\u9898\u53EF\u524D\u5F80\u5E2E\u52A9\u4E2D\u7684\u6587\u6863\u53CD\u9988\uFF09 ")],-1)),_hoisted_11={class:"party-grid"},_hoisted_12={class:"party-user"},_hoisted_13=_withScopeId(()=>createBaseVNode("label",null,"\u7528\u6237 1 (\u6211)",-1)),_hoisted_14=["value"],_hoisted_15=["onUpdate:modelValue"],_sfc_main=defineComponent({__name:"App",setup(e){const t=ref(""),n=ref([]),o=ref({carnivale:!0,map:!0,dungeon:!0,trail:!0,raid:!0,other:!0}),r=ref(1),i=ref(!1),l=ref(!1),a=ref(Array(7).fill("")),s=ref(!1),u=computed(()=>spells$1.filter((g,d)=>n.value[d]===1).map(g=>Number(g.no)).sort((g,d)=>g-d).join(", ")),_=computed(()=>{const g=[],d=new Set(spells$1.filter((C,x)=>n.value[x]===1).map(C=>Number(C.no)));g.push(d);for(let C=0;C<7;C++){const x=a.value[C]||"";if(x.trim()){const O=x.split(/[,，\s]+/).map(Number).filter(M=>!isNaN(M));g.push(new Set(O))}}return g}),v=computed(()=>{const g=new Map;return spells$1.forEach(d=>{let C=0;_.value.forEach(x=>{x.has(Number(d.no))||C++}),g.set(Number(d.no),C)}),g}),y=computed(()=>_.value.length>1);watch(r,g=>saveSetting("min-unlearned",g)),watch(i,g=>saveSetting("order-by-unlearned",g)),watch(a,g=>saveSetting("party-data",g),{deep:!0}),onBeforeMount(()=>{var x,O;loadSetting("has-seen-help")||(l.value=!0,saveSetting("has-seen-help",!0));let d=loadSetting("spell-status")||[];Array.isArray(d)||(d=[]),n.value=d,o.value={...o.value,...loadSetting("filter-types")||{}},delete o.value.special,delete o.value.fate,delete o.value.treasure,delete o.value.guildhests,r.value=(x=loadSetting("min-unlearned"))!=null?x:1,i.value=(O=loadSetting("order-by-unlearned"))!=null?O:!1;const C=loadSetting("party-data");Array.isArray(C)&&C.length===7&&(a.value=C)});const S=(g,d)=>{const C=spells$1.map((x,O)=>(O===g?d:n.value[O])?1:0);if(saveSetting("spell-status",C),n.value=C,y.value){const x=Number(spells$1[g].no),O=[...a.value];for(let M=0;M<7;M++){const U=O[M]||"";if(U.trim()){const D=U.split(/[,，\s]+/).map(Number).filter(F=>!isNaN(F)),W=new Set(D);d?W.add(x):W.delete(x),O[M]=Array.from(W).sort((F,Q)=>F-Q).join(", ")}}a.value=O}},b=(g,d)=>{o.value[g]=d,saveSetting("filter-types",o.value)};return(g,d)=>(openBlock(),createElementBlock(Fragment,null,[createBaseVNode("section",null,[createBaseVNode("aside",null,[createBaseVNode("div",{class:"sponsor-banner",onClick:d[0]||(d[0]=C=>l.value=!0)},_hoisted_3),withDirectives(createBaseVNode("input",{class:"search","onUpdate:modelValue":d[1]||(d[1]=C=>t.value=C),placeholder:"\u641C\u7D22\u6280\u80FD\u7F16\u53F7\u3001\u540D\u79F0\u6216\u83B7\u53D6\u65B9\u5F0F"},null,512),[[vModelText,t.value]]),createVNode(Filter,{filterTypes:o.value,minUnlearned:r.value,orderByUnlearned:i.value,onTypeChange:b,onUnlearnedChange:d[2]||(d[2]=C=>r.value=C),onOrderChange:d[3]||(d[3]=C=>i.value=C),onOpenConfig:d[4]||(d[4]=C=>s.value=!0)},null,8,["filterTypes","minUnlearned","orderByUnlearned"]),createVNode(Book,{spellStatus:n.value,onChange:S},null,8,["spellStatus"]),createVNode(Progress,{spellStatus:n.value,onChange:S},null,8,["spellStatus"])]),createVNode(SpellList,{filter:t.value,filterTypes:o.value,minUnlearned:r.value,spellStatus:n.value,orderByUnlearned:i.value,unlearnedCountMap:unref(v),isPartyModeActive:unref(y),onChange:S,onClearFilter:d[5]||(d[5]=C=>t.value=""),onSearch:d[6]||(d[6]=C=>t.value=C)},null,8,["filter","filterTypes","minUnlearned","spellStatus","orderByUnlearned","unlearnedCountMap","isPartyModeActive"])]),(openBlock(),createBlock(Teleport,{to:"body"},[createVNode(Transition,{name:"fade"},{default:withCtx(()=>[l.value?(openBlock(),createElementBlock("div",{key:0,class:"modal-backdrop",onClick:d[8]||(d[8]=withModifiers(C=>l.value=!1,["self"]))},[createBaseVNode("div",_hoisted_4,[createBaseVNode("button",{class:"close-btn",onClick:d[7]||(d[7]=C=>l.value=!1)},"\xD7"),_hoisted_5,_hoisted_6])])):createCommentVNode("",!0)]),_:1})])),(openBlock(),createBlock(Teleport,{to:"body"},[createVNode(Transition,{name:"fade"},{default:withCtx(()=>[s.value?(openBlock(),createElementBlock("div",{key:0,class:"modal-backdrop",onClick:d[10]||(d[10]=withModifiers(C=>s.value=!1,["self"]))},[createBaseVNode("div",_hoisted_7,[createBaseVNode("button",{class:"close-btn",onClick:d[9]||(d[9]=C=>s.value=!1)},"\xD7"),_hoisted_8,createBaseVNode("div",_hoisted_9,[_hoisted_10,createBaseVNode("div",_hoisted_11,[createBaseVNode("div",_hoisted_12,[_hoisted_13,createBaseVNode("textarea",{value:unref(u),readonly:"",title:"\u5728\u6B64\u590D\u5236\u4F60\u5DF2\u638C\u63E1\u7684\u6280\u80FD\u6570\u636E\u5206\u4EAB\u7ED9\u4ED6\u4EBA"},null,8,_hoisted_14)]),(openBlock(),createElementBlock(Fragment,null,renderList(7,C=>createBaseVNode("div",{class:"party-user",key:C},[createBaseVNode("label",null,"\u7528\u6237 "+toDisplayString(C+1),1),withDirectives(createBaseVNode("textarea",{"onUpdate:modelValue":x=>a.value[C-1]=x,placeholder:"\u8BF7\u7C98\u8D34\u5176\u4ED6\u7528\u6237\u5206\u4EAB\u7684\u5DF2\u638C\u63E1\u6280\u80FD\u7F16\u53F7..."},null,8,_hoisted_15),[[vModelText,a.value[C-1]]])])),64))])])])])):createCommentVNode("",!0)]),_:1})]))],64))}});var App=_export_sfc(_sfc_main,[["__scopeId","data-v-df5863f6"]]),bundle={exports:{}};(function(module,exports){(function(e,t){module.exports=t()})(window,function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(o,r,i){n.o(o,r)||Object.defineProperty(o,r,{enumerable:!0,get:i})},n.r=function(o){typeof Symbol!="undefined"&&Symbol.toStringTag&&Object.defineProperty(o,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(o,"__esModule",{value:!0})},n.t=function(o,r){if(1&r&&(o=n(o)),8&r||4&r&&typeof o=="object"&&o&&o.__esModule)return o;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:o}),2&r&&typeof o!="string")for(var l in o)n.d(i,l,function(a){return o[a]}.bind(null,l));return i},n.n=function(o){var r=o&&o.__esModule?function(){return o.default}:function(){return o};return n.d(r,"a",r),r},n.o=function(o,r){return Object.prototype.hasOwnProperty.call(o,r)},n.p="",n(n.s=5)}([function(e,t,n){n.r(t),n.d(t,"h",function(){return a}),n.d(t,"createElement",function(){return a}),n.d(t,"cloneElement",function(){return v}),n.d(t,"createRef",function(){return Ce}),n.d(t,"Component",function(){return ue}),n.d(t,"render",function(){return pe}),n.d(t,"rerender",function(){return g}),n.d(t,"options",function(){return r});var o=function(){},r={},i=[],l=[];function a(f,w){var z,V,Z,H,ie=l;for(H=arguments.length;H-- >2;)i.push(arguments[H]);for(w&&w.children!=null&&(i.length||i.push(w.children),delete w.children);i.length;)if((V=i.pop())&&V.pop!==void 0)for(H=V.length;H--;)i.push(V[H]);else typeof V=="boolean"&&(V=null),(Z=typeof f!="function")&&(V==null?V="":typeof V=="number"?V=String(V):typeof V!="string"&&(Z=!1)),Z&&z?ie[ie.length-1]+=V:ie===l?ie=[V]:ie.push(V),z=Z;var c=new o;return c.nodeName=f,c.children=ie,c.attributes=w==null?void 0:w,c.key=w==null?void 0:w.key,r.vnode!==void 0&&r.vnode(c),c}function s(f,w){for(var z in w)f[z]=w[z];return f}function u(f,w){f!=null&&(typeof f=="function"?f(w):f.current=w)}var _=typeof Promise=="function"?Promise.resolve().then.bind(Promise.resolve()):setTimeout;function v(f,w){return a(f.nodeName,s(s({},f.attributes),w),arguments.length>2?[].slice.call(arguments,2):f.children)}var y=/acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i,S=[];function b(f){!f._dirty&&(f._dirty=!0)&&S.push(f)==1&&(r.debounceRendering||_)(g)}function g(){for(var f;f=S.pop();)f._dirty&&fe(f)}function d(f,w,z){return typeof w=="string"||typeof w=="number"?f.splitText!==void 0:typeof w.nodeName=="string"?!f._componentConstructor&&C(f,w.nodeName):z||f._componentConstructor===w.nodeName}function C(f,w){return f.normalizedNodeName===w||f.nodeName.toLowerCase()===w.toLowerCase()}function x(f){var w=s({},f.attributes);w.children=f.children;var z=f.nodeName.defaultProps;if(z!==void 0)for(var V in z)w[V]===void 0&&(w[V]=z[V]);return w}function O(f){var w=f.parentNode;w&&w.removeChild(f)}function M(f,w,z,V,Z){if(w==="className"&&(w="class"),w!=="key")if(w==="ref")u(z,null),u(V,f);else if(w!=="class"||Z)if(w==="style"){if(V&&typeof V!="string"&&typeof z!="string"||(f.style.cssText=V||""),V&&typeof V=="object"){if(typeof z!="string")for(var H in z)H in V||(f.style[H]="");for(var H in V)f.style[H]=typeof V[H]=="number"&&y.test(H)===!1?V[H]+"px":V[H]}}else if(w==="dangerouslySetInnerHTML")V&&(f.innerHTML=V.__html||"");else if(w[0]=="o"&&w[1]=="n"){var ie=w!==(w=w.replace(/Capture$/,""));w=w.toLowerCase().substring(2),V?z||f.addEventListener(w,U,ie):f.removeEventListener(w,U,ie),(f._listeners||(f._listeners={}))[w]=V}else if(w!=="list"&&w!=="type"&&!Z&&w in f){try{f[w]=V==null?"":V}catch{}V!=null&&V!==!1||w=="spellcheck"||f.removeAttribute(w)}else{var c=Z&&w!==(w=w.replace(/^xlink:?/,""));V==null||V===!1?c?f.removeAttributeNS("http://www.w3.org/1999/xlink",w.toLowerCase()):f.removeAttribute(w):typeof V!="function"&&(c?f.setAttributeNS("http://www.w3.org/1999/xlink",w.toLowerCase(),V):f.setAttribute(w,V))}else f.className=V||""}function U(f){return this._listeners[f.type](r.event&&r.event(f)||f)}var D=[],W=0,F=!1,Q=!1;function X(){for(var f;f=D.shift();)r.afterMount&&r.afterMount(f),f.componentDidMount&&f.componentDidMount()}function re(f,w,z,V,Z,H){W++||(F=Z!=null&&Z.ownerSVGElement!==void 0,Q=f!=null&&!("__preactattr_"in f));var ie=$(f,w,z,V,H);return Z&&ie.parentNode!==Z&&Z.appendChild(ie),--W||(Q=!1,H||X()),ie}function $(f,w,z,V,Z){var H=f,ie=F;if(w!=null&&typeof w!="boolean"||(w=""),typeof w=="string"||typeof w=="number")return f&&f.splitText!==void 0&&f.parentNode&&(!f._component||Z)?f.nodeValue!=w&&(f.nodeValue=w):(H=document.createTextNode(w),f&&(f.parentNode&&f.parentNode.replaceChild(H,f),ee(f,!0))),H.__preactattr_=!0,H;var c,m,k=w.nodeName;if(typeof k=="function")return function(E,B,K,P){for(var j=E&&E._component,L=j,q=E,Y=j&&E._componentConstructor===B.nodeName,G=Y,J=x(B);j&&!G&&(j=j._parentComponent);)G=j.constructor===B.nodeName;return j&&G&&(!P||j._component)?(te(j,J,3,K,P),E=j.base):(L&&!Y&&(ge(L),E=q=null),j=se(B.nodeName,J,K),E&&!j.nextBase&&(j.nextBase=E,q=null),te(j,J,1,K,P),E=j.base,q&&E!==q&&(q._component=null,ee(q,!1))),E}(f,w,z,V);if(F=k==="svg"||k!=="foreignObject"&&F,k=String(k),(!f||!C(f,k))&&(c=k,(m=F?document.createElementNS("http://www.w3.org/2000/svg",c):document.createElement(c)).normalizedNodeName=c,H=m,f)){for(;f.firstChild;)H.appendChild(f.firstChild);f.parentNode&&f.parentNode.replaceChild(H,f),ee(f,!0)}var A=H.firstChild,T=H.__preactattr_,I=w.children;if(T==null){T=H.__preactattr_={};for(var R=H.attributes,N=R.length;N--;)T[R[N].name]=R[N].value}return!Q&&I&&I.length===1&&typeof I[0]=="string"&&A!=null&&A.splitText!==void 0&&A.nextSibling==null?A.nodeValue!=I[0]&&(A.nodeValue=I[0]):(I&&I.length||A!=null)&&function(E,B,K,P,j){var L,q,Y,G,J,ne=E.childNodes,me=[],be={},he=0,ve=0,ae=ne.length,ce=0,xe=B?B.length:0;if(ae!==0)for(var _e=0;_e<ae;_e++){var ye=ne[_e],Ee=ye.__preactattr_,ke=xe&&Ee?ye._component?ye._component.__key:Ee.key:null;ke!=null?(he++,be[ke]=ye):(Ee||(ye.splitText!==void 0?!j||ye.nodeValue.trim():j))&&(me[ce++]=ye)}if(xe!==0)for(var _e=0;_e<xe;_e++){G=B[_e],J=null;var ke=G.key;if(ke!=null)he&&be[ke]!==void 0&&(J=be[ke],be[ke]=void 0,he--);else if(ve<ce){for(L=ve;L<ce;L++)if(me[L]!==void 0&&d(q=me[L],G,j)){J=q,me[L]=void 0,L===ce-1&&ce--,L===ve&&ve++;break}}J=$(J,G,K,P),Y=ne[_e],J&&J!==E&&J!==Y&&(Y==null?E.appendChild(J):J===Y.nextSibling?O(Y):E.insertBefore(J,Y))}if(he)for(var _e in be)be[_e]!==void 0&&ee(be[_e],!1);for(;ve<=ce;)(J=me[ce--])!==void 0&&ee(J,!1)}(H,I,z,V,Q||T.dangerouslySetInnerHTML!=null),function(E,B,K){var P;for(P in K)B&&B[P]!=null||K[P]==null||M(E,P,K[P],K[P]=void 0,F);for(P in B)P==="children"||P==="innerHTML"||P in K&&B[P]===(P==="value"||P==="checked"?E[P]:K[P])||M(E,P,K[P],K[P]=B[P],F)}(H,w.attributes,T),F=ie,H}function ee(f,w){var z=f._component;z?ge(z):(f.__preactattr_!=null&&u(f.__preactattr_.ref,null),w!==!1&&f.__preactattr_!=null||O(f),le(f))}function le(f){for(f=f.lastChild;f;){var w=f.previousSibling;ee(f,!0),f=w}}var de=[];function se(f,w,z){var V,Z=de.length;for(f.prototype&&f.prototype.render?(V=new f(w,z),ue.call(V,w,z)):((V=new ue(w,z)).constructor=f,V.render=oe);Z--;)if(de[Z].constructor===f)return V.nextBase=de[Z].nextBase,de.splice(Z,1),V;return V}function oe(f,w,z){return this.constructor(f,z)}function te(f,w,z,V,Z){f._disable||(f._disable=!0,f.__ref=w.ref,f.__key=w.key,delete w.ref,delete w.key,f.constructor.getDerivedStateFromProps===void 0&&(!f.base||Z?f.componentWillMount&&f.componentWillMount():f.componentWillReceiveProps&&f.componentWillReceiveProps(w,V)),V&&V!==f.context&&(f.prevContext||(f.prevContext=f.context),f.context=V),f.prevProps||(f.prevProps=f.props),f.props=w,f._disable=!1,z!==0&&(z!==1&&r.syncComponentUpdates===!1&&f.base?b(f):fe(f,1,Z)),u(f.__ref,f))}function fe(f,w,z,V){if(!f._disable){var Z,H,ie,c=f.props,m=f.state,k=f.context,A=f.prevProps||c,T=f.prevState||m,I=f.prevContext||k,R=f.base,N=f.nextBase,E=R||N,B=f._component,K=!1,P=I;if(f.constructor.getDerivedStateFromProps&&(m=s(s({},m),f.constructor.getDerivedStateFromProps(c,m)),f.state=m),R&&(f.props=A,f.state=T,f.context=I,w!==2&&f.shouldComponentUpdate&&f.shouldComponentUpdate(c,m,k)===!1?K=!0:f.componentWillUpdate&&f.componentWillUpdate(c,m,k),f.props=c,f.state=m,f.context=k),f.prevProps=f.prevState=f.prevContext=f.nextBase=null,f._dirty=!1,!K){Z=f.render(c,m,k),f.getChildContext&&(k=s(s({},k),f.getChildContext())),R&&f.getSnapshotBeforeUpdate&&(P=f.getSnapshotBeforeUpdate(A,T));var j,L,q=Z&&Z.nodeName;if(typeof q=="function"){var Y=x(Z);(H=B)&&H.constructor===q&&Y.key==H.__key?te(H,Y,1,k,!1):(j=H,f._component=H=se(q,Y,k),H.nextBase=H.nextBase||N,H._parentComponent=f,te(H,Y,0,k,!1),fe(H,1,z,!0)),L=H.base}else ie=E,(j=B)&&(ie=f._component=null),(E||w===1)&&(ie&&(ie._component=null),L=re(ie,Z,k,z||!R,E&&E.parentNode,!0));if(E&&L!==E&&H!==B){var G=E.parentNode;G&&L!==G&&(G.replaceChild(L,E),j||(E._component=null,ee(E,!1)))}if(j&&ge(j),f.base=L,L&&!V){for(var J=f,ne=f;ne=ne._parentComponent;)(J=ne).base=L;L._component=J,L._componentConstructor=J.constructor}}for(!R||z?D.push(f):K||(f.componentDidUpdate&&f.componentDidUpdate(A,T,P),r.afterUpdate&&r.afterUpdate(f));f._renderCallbacks.length;)f._renderCallbacks.pop().call(f);W||V||X()}}function ge(f){r.beforeUnmount&&r.beforeUnmount(f);var w=f.base;f._disable=!0,f.componentWillUnmount&&f.componentWillUnmount(),f.base=null;var z=f._component;z?ge(z):w&&(w.__preactattr_!=null&&u(w.__preactattr_.ref,null),f.nextBase=w,O(w),de.push(f),le(w)),u(f.__ref,null)}function ue(f,w){this._dirty=!0,this.context=w,this.props=f,this.state=this.state||{},this._renderCallbacks=[]}function pe(f,w,z){return re(z,f,{},!1,w,!1)}function Ce(){return{}}s(ue.prototype,{setState:function(f,w){this.prevState||(this.prevState=this.state),this.state=s(s({},this.state),typeof f=="function"?f(this.state,this.props):f),w&&this._renderCallbacks.push(w),b(this)},forceUpdate:function(f){f&&this._renderCallbacks.push(f),fe(this,2)},render:function(){}});var we={h:a,createElement:a,cloneElement:v,createRef:Ce,Component:ue,render:pe,rerender:g,options:r};t.default=we},function(e,t,n){var o,r=this&&this.__extends||(o=function(b,g){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(d,C){d.__proto__=C}||function(d,C){for(var x in C)C.hasOwnProperty(x)&&(d[x]=C[x])})(b,g)},function(b,g){function d(){this.constructor=b}o(b,g),b.prototype=g===null?Object.create(g):(d.prototype=g.prototype,new d)}),i=this&&this.__assign||function(){return(i=Object.assign||function(b){for(var g,d=1,C=arguments.length;d<C;d++)for(var x in g=arguments[d])Object.prototype.hasOwnProperty.call(g,x)&&(b[x]=g[x]);return b}).apply(this,arguments)},l=this&&this.__awaiter||function(b,g,d,C){return new(d||(d=Promise))(function(x,O){function M(W){try{D(C.next(W))}catch(F){O(F)}}function U(W){try{D(C.throw(W))}catch(F){O(F)}}function D(W){W.done?x(W.value):new d(function(F){F(W.value)}).then(M,U)}D((C=C.apply(b,g||[])).next())})},a=this&&this.__generator||function(b,g){var d,C,x,O,M={label:0,sent:function(){if(1&x[0])throw x[1];return x[1]},trys:[],ops:[]};return O={next:U(0),throw:U(1),return:U(2)},typeof Symbol=="function"&&(O[Symbol.iterator]=function(){return this}),O;function U(D){return function(W){return function(F){if(d)throw new TypeError("Generator is already executing.");for(;M;)try{if(d=1,C&&(x=2&F[0]?C.return:F[0]?C.throw||((x=C.return)&&x.call(C),0):C.next)&&!(x=x.call(C,F[1])).done)return x;switch(C=0,x&&(F=[2&F[0],x.value]),F[0]){case 0:case 1:x=F;break;case 4:return M.label++,{value:F[1],done:!1};case 5:M.label++,C=F[1],F=[0];continue;case 7:F=M.ops.pop(),M.trys.pop();continue;default:if(!(x=(x=M.trys).length>0&&x[x.length-1])&&(F[0]===6||F[0]===2)){M=0;continue}if(F[0]===3&&(!x||F[1]>x[0]&&F[1]<x[3])){M.label=F[1];break}if(F[0]===6&&M.label<x[1]){M.label=x[1],x=F;break}if(x&&M.label<x[2]){M.label=x[2],M.ops.push(F);break}x[2]&&M.ops.pop(),M.trys.pop();continue}F=g.call(b,M)}catch(Q){F=[6,Q],C=0}finally{d=x=0}if(5&F[0])throw F[1];return{value:F[0]?F[1]:void 0,done:!0}}([D,W])}}};Object.defineProperty(t,"__esModule",{value:!0});var s=n(0),u=n(2),_=n(6),v=n(7),y=function(b){function g(){var d=b!==null&&b.apply(this,arguments)||this;return d.handleDetails=function(){window.open("https://ff14.huijiwiki.com/wiki/"+encodeURIComponent("\u7269\u54C1")+":"+encodeURIComponent(d.state.item.Name),"_blank","noopener")},d.handleCopy=function(){_.copyText(d.state.item.Name),d.setState({copyMessage:"\u5DF2\u590D\u5236"}),setTimeout(function(){d.setState({copyMessage:null})},1200)},d.handleHqChange=function(C){d.setState({hq:C})},d}return r(g,b),g.prototype.componentDidMount=function(){return l(this,void 0,void 0,function(){return a(this,function(d){switch(d.label){case 0:return[4,this.getItemData()];case 1:return d.sent(),[2]}})})},g.prototype.componentDidUpdate=function(d){return l(this,void 0,void 0,function(){var C;return a(this,function(x){switch(x.label){case 0:if(this.props.onUpdate&&this.props.onUpdate(),d.id===this.props.id&&d.name===this.props.name)return[3,4];this.setState({item:null,error:null}),x.label=1;case 1:return x.trys.push([1,3,,4]),[4,this.getItemData()];case 2:return x.sent(),[3,4];case 3:return C=x.sent(),this.setState({error:C}),console.error(C),[3,4];case 4:return[2]}})})},g.prototype.getItemData=function(){return l(this,void 0,void 0,function(){var d,C;return a(this,function(x){switch(x.label){case 0:return[4,this.getItemId()];case 1:return(d=x.sent())?[4,fetch(this.context.apiBaseUrl+"/Item/"+d)]:[2];case 2:return[4,x.sent().json()];case 3:return C=x.sent(),this.setState({item:C}),[2]}})})},g.prototype.getItemId=function(){return l(this,void 0,void 0,function(){var d,C;return a(this,function(x){switch(x.label){case 0:return this.props.id&&(d=parseInt(""+this.props.id),!isNaN(d))?[2,d]:this.props.name?[4,fetch(this.context.apiBaseUrl+"/search?indexes=Item&limit=1&string="+encodeURIComponent(this.props.name))]:(this.setState({error:"\u6CA1\u6709\u6307\u5B9A\u7269\u54C1\u540D\u5B57\u6216 ID\u3002"}),[2,null]);case 1:return[4,x.sent().json()];case 2:return(C=x.sent()).Results[0]?[2,C.Results[0].ID]:(this.setState({error:"\u6CA1\u6709\u627E\u5230\u7269\u54C1\u201C"+this.props.name+"\u201D\u3002"}),[2,null])}})})},g.prototype.render=function(){if(this.state.error)return s.h(u.CKBox,null,s.h(u.CKContainer,null,this.state.error));if(!this.state.item)return s.h(u.CKBox,null,s.h(u.CKContainer,null,"Loading..."));var d=this.state.item,C=d.Name,x=d.Icon,O=d.ItemUICategory,M=O.Name,U=O.ID,D=d.EquipSlotCategory,W=d.DamageMag,F=d.DamagePhys,Q=d.DefenseMag,X=d.DefensePhys,re=d.BlockRate,$=d.Block,ee=d.DelayMs,le=d.Bonuses,de=d.BaseParam0,se=d.ClassJobCategory,oe=d.LevelEquip,te=d.LevelItem,fe=d.Description,ge=d.ClassJobRepair,ue=d.ItemRepair,pe=d.IsUnique,Ce=d.IsUntradable,we=d.CanBeHq,f=d.PriceLow,w=d.Rarity,z=d.MateriaSlotCount,V=d.IsAdvancedMeldingPermitted,Z=this.props.hq!=null?this.props.hq:this.context.defaultHq;this.state.hq!=null&&(Z=this.state.hq);var H=Z&&we,ie=[],c={attrs:[]},m=""+this.context.iconBaseUrl+x.replace(/^\/i/,""),k=m.replace(/(\d+\.png)/,"hq/$1"),A=s.h("span",null,C,s.h(v.HqButton,{hq:H,onHqChange:this.handleHqChange})),T=s.h(u.CKItemName,{name:we?A:C,rarity:w,type:M,size:"medium",iconSrc:H?k:m});if(D){c.attrs.push({name:"\u54C1\u7EA7",value:te,style:"full"}),c.attrs.push({name:"",style:"header"});var I=[],R={12:{name:"\u7269\u7406\u57FA\u672C\u6027\u80FD",id:12,value:F},13:{name:"\u9B54\u6CD5\u57FA\u672C\u6027\u80FD",id:13,value:W},14:{name:"\u653B\u51FB\u95F4\u9694",id:14,value:ee/1e3},17:{name:"\u683C\u6321\u53D1\u52A8\u529B",id:17,value:re},18:{name:"\u683C\u6321\u6027\u80FD",id:18,value:$},21:{name:"\u7269\u7406\u9632\u5FA1\u529B",id:21,value:X},24:{name:"\u9B54\u6CD5\u9632\u5FA1\u529B",id:24,value:Q},99999:{name:"\u7269\u7406\u81EA\u52A8\u653B\u51FB",id:99999,value:function(Se){return parseFloat(((Se[12].value||0)/3*Se[14].value).toFixed(2))}}},N=[];if(D.MainHand?([6,7,8,9,10,89,97,98].indexOf(U)>=0?N.push(13):N.push(12),N.push(99999),N.push(14)):D.OffHand?U===11&&(N.push(17),N.push(18)):(N.push(21),N.push(24)),H)for(var E=0;E<=5;E++){var B="BaseParamSpecial"+E+"TargetID",K="BaseParamValueSpecial"+E;if(this.state.item[B]){var P=this.state.item[B],j=this.state.item[K];R[P]&&(R[P].value+=j)}}for(var L=0,q=N;L<q.length;L++){var Y=R[be=q[L]],G=typeof Y.value=="function"?Y.value(R):Y.value;I.push({name:Y.name,value:G})}I.length&&ie.push(s.h("div",{style:{paddingTop:6}},s.h(u.CKStatGroup,null,I.map(function(Se){return s.h(u.CKStat,i({},Se))})))),c.attrs.push({name:se.Name,style:"full",titleClass:"ck-success"}),c.attrs.push({name:oe+"\u7EA7\u4EE5\u4E0A",style:"full",titleClass:"ck-success"})}if(fe&&c.attrs.push({name:fe.replace(/\n+/g,`
`),style:"full",titleClass:""}),de){c.attrs.push({name:"\u7279\u6B8A",style:"header"});var J=[];for(E=0;E<=5;E++){var ne="BaseParam"+E,me="BaseParamValue"+E;if(this.state.item[ne]&&this.state.item[me]){var be=this.state.item[ne].ID,he=this.state.item[me];if(H)for(var ve=0;ve<=5;ve++)B="BaseParamSpecial"+ve+"TargetID",K="BaseParamValueSpecial"+ve,this.state.item[B]&&(P=this.state.item[B],j=this.state.item[K],P===this.state.item[ne].ID&&(he+=j));J.push({name:this.state.item[ne].Name,value:"+"+he,style:"half",id:be})}}J.sort(function(Se,Te){return Se.id-Te.id}).forEach(function(Se){return c.attrs.push(Se)})}if(le)if(c.attrs.push({name:"\u7279\u6B8A",style:"header"}),H)for(var ne in le){var ae=le[ne];c.attrs.push({name:ne,value:"+"+ae.ValueHQ+"%\uFF08\u4E0A\u9650 "+ae.MaxHQ+"\uFF09",style:"half-full"})}else for(var ne in le)ae=le[ne],c.attrs.push({name:ne,value:"+"+ae.Value+"%\uFF08\u4E0A\u9650 "+ae.Max+"\uFF09",style:"half-full"});if(z&&(c.attrs.push({name:"\u9B54\u6676\u77F3\u5DE5\u827A",style:"header"}),c.attrs.push({name:"\u5B89\u5168\u5B54\u6570",value:z,style:"half"}),c.attrs.push({name:"\u7981\u65AD\u9576\u5D4C",value:S(V),style:"half"})),ge&&ue){c.attrs.push({name:"\u5236\u4F5C&\u4FEE\u7406",style:"header"});var ce=oe,xe=Math.max(oe-10,1);c.attrs.push({name:"\u4FEE\u7406\u7B49\u7EA7",value:ge.Name+" "+xe+"\u7EA7\u4EE5\u4E0A",style:"full"}),c.attrs.push({name:"\u4FEE\u7406\u6750\u6599",value:ue.Name,style:"full"}),z&&c.attrs.push({name:"\u9576\u5D4C\u9B54\u6676\u77F3\u7B49\u7EA7",value:ge.Name+" "+ce+"\u7EA7\u4EE5\u4E0A",style:"full"})}if(D){c.attrs.push({name:"",style:"header"});for(var _e=0,ye=[["IsDyeable","\u67D3\u8272"],["IsCrestWorthy","\u90E8\u961F\u5FBD\u8BB0"],["Salvage","\u5206\u89E3"],["Materialize","\u9B54\u6676\u77F3\u5316"]];_e<ye.length;_e++){var Ee=ye[_e],ke=(ne=Ee[0],Ee[1]);he=this.state.item[ne],c.attrs.push({name:ke,value:S(he),style:"half"})}}(f<=0||Ce||pe)&&(c.attrs.push({name:"",style:"header"}),f<=0&&c.attrs.push({name:"\u4E0D\u53EF\u51FA\u552E",style:"half",titleClass:"ck-warning"}),Ce&&c.attrs.push({name:"\u4E0D\u53EF\u5728\u5E02\u573A\u51FA\u552E",style:"half",titleClass:"ck-warning"}),pe&&c.attrs.push({name:"\u53EA\u80FD\u6301\u6709\u4E00\u4E2A",style:"half",titleClass:"ck-warning"})),ie.push(s.h(u.CKContainer,null,s.h(u.CKAttributes,i({},c))));var Ae=new Date().getFullYear();return s.h(u.CKBox,null,s.h("div",{style:{width:320,padding:8}},s.h(u.CKContainer,{style:{paddingBottom:0}},T),ie,s.h(u.CKContainer,{style:{display:"flex"}},s.h("button",{onClick:this.handleCopy,style:{flex:1},disabled:!!this.state.copyMessage},this.state.copyMessage||"\u590D\u5236\u9053\u5177\u540D"),s.h("span",{style:{width:8}}),s.h("button",{onClick:this.handleDetails,style:{flex:1}},"\u67E5\u770B\u8BE6\u60C5")),s.h(u.CKComment,null,s.h("p",{style:{fontSize:"9px",textAlign:"right",opacity:.6,userSelect:"none"}},this.context.hideSeCopyright?null:"\xA9 "+Ae+" SQUARE ENIX CO., LTD. ","Powered by"," ",s.h("a",{href:"https://ffcafe.org/?utm_source=ckitem",target:"_blank",rel:"noopener noreferrer"},"FFCafe")))))},g}(s.Component);function S(b){return b?"\u2713":"\xD7"}t.CKItem=y},function(module,exports,__webpack_require__){var factory;factory=function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(o,r,i){n.o(o,r)||Object.defineProperty(o,r,{enumerable:!0,get:i})},n.r=function(o){typeof Symbol!="undefined"&&Symbol.toStringTag&&Object.defineProperty(o,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(o,"__esModule",{value:!0})},n.t=function(o,r){if(1&r&&(o=n(o)),8&r||4&r&&typeof o=="object"&&o&&o.__esModule)return o;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:o}),2&r&&typeof o!="string")for(var l in o)n.d(i,l,function(a){return o[a]}.bind(null,l));return i},n.n=function(o){var r=o&&o.__esModule?function(){return o.default}:function(){return o};return n.d(r,"a",r),r},n.o=function(o,r){return Object.prototype.hasOwnProperty.call(o,r)},n.p="",n(n.s="./lib/main.ts")}({"../../node_modules/css-loader/dist/cjs.js!../../node_modules/stylus-loader/index.js!./lib/styles/main.styl":function(module,exports,__webpack_require__){eval(`exports = module.exports = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "../../node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, ".cafekit {\\n  line-height: 1.4;\\n  font-size: 16px;\\n}\\n.cafekit * {\\n  box-sizing: border-box;\\n}\\n.cafekit div,\\n.cafekit section,\\n.cafekit img {\\n  vertical-align: middle;\\n}\\n.cafekit p,\\n.cafekit h1,\\n.cafekit h2,\\n.cafekit h3,\\n.cafekit h4,\\n.cafekit h5,\\n.cafekit h6 {\\n  padding: 0;\\n  margin: 0;\\n}\\n.cafekit .ck-hl {\\n  color: #bbac94;\\n}\\n.cafekit .ck-success {\\n  color: #91e39b;\\n}\\n.cafekit .ck-warning {\\n  color: #d98298;\\n}\\n.cafekit .ck-container {\\n  padding: 6px;\\n}\\n.cafekit .ck-rarity-1 {\\n  color: #f3f3f3;\\n}\\n.cafekit .ck-rarity-2 {\\n  color: #c0ffc0;\\n}\\n.cafekit .ck-rarity-3 {\\n  color: #5990ff;\\n}\\n.cafekit .ck-rarity-4 {\\n  color: #b38cff;\\n}\\n.cafekit .ck-rarity-7 {\\n  color: #d789b6;\\n}\\n.cafekit .ck-box {\\n  background: linear-gradient(to bottom, #666 0%, #333 4%);\\n  display: inline-block;\\n  border: solid 2px #bbac94;\\n  box-shadow: rgba(0,0,0,0.2) 0px 1px 8px;\\n  border-radius: 5px;\\n  color: #dedede;\\n  position: relative;\\n}\\n.cafekit .ck-box .ck-box-bottom-wrapper {\\n  position: absolute;\\n  left: 0;\\n  bottom: -0.7em;\\n  width: 100%;\\n  font-size: 0.8em;\\n  text-align: center;\\n}\\n.cafekit .ck-box .ck-box-bottom {\\n  display: inline-block;\\n  background: rgba(0,0,0,0.7);\\n  box-shadow: 0px 0px 4px 0px #000;\\n  user-select: none;\\n  padding: 0 8px;\\n  border-radius: 6px;\\n}\\n.cafekit .ck-box a {\\n  color: #7fd4ff;\\n  text-decoration: none;\\n}\\n.cafekit .ck-box a:hover {\\n  background-color: rgba(127,212,255,0.5);\\n}\\n.cafekit .ck-box a:active {\\n  background-color: rgba(127,212,255,0.3);\\n}\\n.cafekit .ck-box button {\\n  min-width: 100px;\\n  line-height: 1.6;\\n  font-size: 0.9em;\\n  border: solid 1px transparent;\\n  border-radius: 100px;\\n  user-select: none;\\n  color: #dedede;\\n  background: linear-gradient(to bottom, #5f5f5f, #3b3d3c);\\n  box-shadow: 0px 0px 2px #000;\\n  padding: 0;\\n  cursor: pointer;\\n}\\n.cafekit .ck-box button:focus {\\n  outline: none;\\n}\\n.cafekit .ck-box button:hover {\\n  border: solid 1px #bbac94;\\n}\\n.cafekit .ck-box button:active {\\n  background: linear-gradient(to top, #5f5f5f, #3b3d3c);\\n}\\n.cafekit .ck-box button:disabled {\\n  outline: none;\\n  border: solid 1px transparent;\\n}\\n.cafekit .ck-stat-group {\\n  display: flex;\\n  padding: 6px 2px;\\n}\\n.cafekit .ck-stat {\\n  display: inline-block;\\n  flex: 1;\\n  position: relative;\\n  text-align: right;\\n  margin: 0 4px;\\n}\\n.cafekit .ck-stat .ck-stat-border {\\n  width: 100%;\\n  height: 6px;\\n  bottom: 0.2em;\\n  position: absolute;\\n  background: #616161;\\n}\\n.cafekit .ck-stat .ck-stat-name {\\n  color: #bbac94;\\n  font-size: 0.8em;\\n}\\n.cafekit .ck-stat .ck-stat-value {\\n  position: relative;\\n  font-size: 1.5em;\\n}\\n.cafekit .ck-attrs {\\n  display: flex;\\n  flex-wrap: wrap;\\n  white-space: pre-wrap;\\n  padding: 0 6px;\\n}\\n.cafekit .ck-attrs .ck-attrs-half {\\n  width: 50%;\\n}\\n.cafekit .ck-attrs .ck-attrs-half-full {\\n  width: 100%;\\n}\\n.cafekit .ck-attrs .ck-attrs-half .ck-attrs-name,\\n.cafekit .ck-attrs .ck-attrs-half-full .ck-attrs-name,\\n.cafekit .ck-attrs .ck-attrs-half .ck-attrs-value,\\n.cafekit .ck-attrs .ck-attrs-half-full .ck-attrs-value {\\n  display: inline;\\n}\\n.cafekit .ck-attrs .ck-attrs-half .ck-attrs-value,\\n.cafekit .ck-attrs .ck-attrs-half-full .ck-attrs-value {\\n  margin-left: 8px;\\n}\\n.cafekit .ck-attrs .ck-attrs-full {\\n  width: 100%;\\n  display: flex;\\n}\\n.cafekit .ck-attrs .ck-attrs-full .ck-attrs-name,\\n.cafekit .ck-attrs .ck-attrs-full .ck-attrs-value {\\n  width: 50%;\\n  flex: 1;\\n}\\n.cafekit .ck-attrs .ck-attrs-header {\\n  width: 100%;\\n  height: 1.4em;\\n  margin: 6px 0;\\n  border-bottom: 1px solid #616161;\\n  margin-left: -6px;\\n}\\n.cafekit .ck-attrs .ck-attrs-header.ck-attrs-empty {\\n  height: 0;\\n}\\n.cafekit .ck-attrs .ck-attrs-header .ck-attrs-name {\\n  color: #adadad;\\n}\\n.cafekit .ck-action {\\n  position: relative;\\n  border-radius: 15%;\\n  display: inline-block;\\n  overflow: hidden;\\n}\\n.cafekit .ck-action img {\\n  width: 100%;\\n  height: 100%;\\n  user-select: none;\\n}\\n.cafekit .ck-action-cover {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  border-radius: 15%;\\n  pointer-events: none;\\n  background: radial-gradient(circle at 50% -460%, rgba(255,255,255,0.6) 80%, rgba(255,255,255,0) 85%);\\n  box-shadow: inset 0px 2px 2px 1px rgba(255,255,255,0.3), inset 0px -1px 2px 1px rgba(255,255,255,0.1);\\n}\\n.cafekit .ck-item-name {\\n  display: inline-flex;\\n  flex-direction: row;\\n  align-items: center;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-big {\\n  height: 64px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-big .ck-action {\\n  height: 64px;\\n  width: 64px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-big .ck-item-name-name {\\n  font-size: 1.3em;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-big .ck-item-name-meta {\\n  padding-bottom: 0.3em;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-medium {\\n  height: 40px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-medium .ck-action {\\n  height: 40px;\\n  width: 40px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-medium .ck-item-name-name {\\n  font-size: 1.1em;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-medium .ck-item-name-type {\\n  font-size: 0.8em;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-medium .ck-item-name-meta {\\n  padding-bottom: 0.2em;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-small {\\n  height: 26px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-small .ck-action {\\n  height: 24px;\\n  width: 24px;\\n}\\n.cafekit .ck-item-name.ck-item-name-size-small .ck-item-name-type {\\n  display: none;\\n}\\n.cafekit .ck-item-name .ck-item-name-icon {\\n  margin-right: 6px;\\n}\\n.cafekit .ck-comment {\\n  font-size: 0.8em;\\n  color: #949494;\\n}\\n.cafekit .ck-comment * {\\n  vertical-align: baseline;\\n}\\n.cafekit .ck-comment a {\\n  color: #c7c7c7;\\n}\\n.cafekit .ck-comment a:hover {\\n  color: #fafafa;\\n  background: #616161;\\n}\\n", ""]);


//# sourceURL=webpack://CafeKitCommon/./lib/styles/main.styl?/home/coder/Work/Projects/wakingsands/cafekit/node_modules/css-loader/dist/cjs.js!/home/coder/Work/Projects/wakingsands/cafekit/node_modules/stylus-loader`)},"../../node_modules/css-loader/dist/runtime/api.js":function(module,exports,__webpack_require__){eval(`

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\\n');
  }

  return [content].join('\\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

//# sourceURL=webpack://CafeKitCommon//home/coder/Work/Projects/wakingsands/cafekit/node_modules/css-loader/dist/runtime/api.js?`)},"../../node_modules/preact/dist/preact.mjs":function(__webpack_module__,__webpack_exports__,__webpack_require__){eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneElement", function() { return cloneElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createRef", function() { return createRef; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return Component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rerender", function() { return rerender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "options", function() { return options; });
var VNode = function VNode() {};

var options = {};

var stack = [];

var EMPTY_CHILDREN = [];

function h(nodeName, attributes) {
	var children = EMPTY_CHILDREN,
	    lastSimple,
	    child,
	    simple,
	    i;
	for (i = arguments.length; i-- > 2;) {
		stack.push(arguments[i]);
	}
	if (attributes && attributes.children != null) {
		if (!stack.length) stack.push(attributes.children);
		delete attributes.children;
	}
	while (stack.length) {
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length; i--;) {
				stack.push(child[i]);
			}
		} else {
			if (typeof child === 'boolean') child = null;

			if (simple = typeof nodeName !== 'function') {
				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
			}

			if (simple && lastSimple) {
				children[children.length - 1] += child;
			} else if (children === EMPTY_CHILDREN) {
				children = [child];
			} else {
				children.push(child);
			}

			lastSimple = simple;
		}
	}

	var p = new VNode();
	p.nodeName = nodeName;
	p.children = children;
	p.attributes = attributes == null ? undefined : attributes;
	p.key = attributes == null ? undefined : attributes.key;

	if (options.vnode !== undefined) options.vnode(p);

	return p;
}

function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

function applyRef(ref, value) {
  if (ref != null) {
    if (typeof ref == 'function') ref(value);else ref.current = value;
  }
}

var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

function cloneElement(vnode, props) {
  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

var items = [];

function enqueueRender(component) {
	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
		(options.debounceRendering || defer)(rerender);
	}
}

function rerender() {
	var p;
	while (p = items.pop()) {
		if (p._dirty) renderComponent(p);
	}
}

function isSameNodeType(node, vnode, hydrating) {
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		return node.splitText !== undefined;
	}
	if (typeof vnode.nodeName === 'string') {
		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	}
	return hydrating || node._componentConstructor === vnode.nodeName;
}

function isNamedNode(node, nodeName) {
	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

function getNodeProps(vnode) {
	var props = extend({}, vnode.attributes);
	props.children = vnode.children;

	var defaultProps = vnode.nodeName.defaultProps;
	if (defaultProps !== undefined) {
		for (var i in defaultProps) {
			if (props[i] === undefined) {
				props[i] = defaultProps[i];
			}
		}
	}

	return props;
}

function createNode(nodeName, isSvg) {
	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	node.normalizedNodeName = nodeName;
	return node;
}

function removeNode(node) {
	var parentNode = node.parentNode;
	if (parentNode) parentNode.removeChild(node);
}

function setAccessor(node, name, old, value, isSvg) {
	if (name === 'className') name = 'class';

	if (name === 'key') {} else if (name === 'ref') {
		applyRef(old, null);
		applyRef(value, node);
	} else if (name === 'class' && !isSvg) {
		node.className = value || '';
	} else if (name === 'style') {
		if (!value || typeof value === 'string' || typeof old === 'string') {
			node.style.cssText = value || '';
		}
		if (value && typeof value === 'object') {
			if (typeof old !== 'string') {
				for (var i in old) {
					if (!(i in value)) node.style[i] = '';
				}
			}
			for (var i in value) {
				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
			}
		}
	} else if (name === 'dangerouslySetInnerHTML') {
		if (value) node.innerHTML = value.__html || '';
	} else if (name[0] == 'o' && name[1] == 'n') {
		var useCapture = name !== (name = name.replace(/Capture$/, ''));
		name = name.toLowerCase().substring(2);
		if (value) {
			if (!old) node.addEventListener(name, eventProxy, useCapture);
		} else {
			node.removeEventListener(name, eventProxy, useCapture);
		}
		(node._listeners || (node._listeners = {}))[name] = value;
	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
		try {
			node[name] = value == null ? '' : value;
		} catch (e) {}
		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	} else {
		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

		if (value == null || value === false) {
			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
		} else if (typeof value !== 'function') {
			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
		}
	}
}

function eventProxy(e) {
	return this._listeners[e.type](options.event && options.event(e) || e);
}

var mounts = [];

var diffLevel = 0;

var isSvgMode = false;

var hydrating = false;

function flushMounts() {
	var c;
	while (c = mounts.shift()) {
		if (options.afterMount) options.afterMount(c);
		if (c.componentDidMount) c.componentDidMount();
	}
}

function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	if (!diffLevel++) {
		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

		hydrating = dom != null && !('__preactattr_' in dom);
	}

	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	if (! --diffLevel) {
		hydrating = false;

		if (!componentRoot) flushMounts();
	}

	return ret;
}

function idiff(dom, vnode, context, mountAll, componentRoot) {
	var out = dom,
	    prevSvgMode = isSvgMode;

	if (vnode == null || typeof vnode === 'boolean') vnode = '';

	if (typeof vnode === 'string' || typeof vnode === 'number') {
		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
			if (dom.nodeValue != vnode) {
				dom.nodeValue = vnode;
			}
		} else {
			out = document.createTextNode(vnode);
			if (dom) {
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
				recollectNodeTree(dom, true);
			}
		}

		out['__preactattr_'] = true;

		return out;
	}

	var vnodeName = vnode.nodeName;
	if (typeof vnodeName === 'function') {
		return buildComponentFromVNode(dom, vnode, context, mountAll);
	}

	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

	vnodeName = String(vnodeName);
	if (!dom || !isNamedNode(dom, vnodeName)) {
		out = createNode(vnodeName, isSvgMode);

		if (dom) {
			while (dom.firstChild) {
				out.appendChild(dom.firstChild);
			}
			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

			recollectNodeTree(dom, true);
		}
	}

	var fc = out.firstChild,
	    props = out['__preactattr_'],
	    vchildren = vnode.children;

	if (props == null) {
		props = out['__preactattr_'] = {};
		for (var a = out.attributes, i = a.length; i--;) {
			props[a[i].name] = a[i].value;
		}
	}

	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
		if (fc.nodeValue != vchildren[0]) {
			fc.nodeValue = vchildren[0];
		}
	} else if (vchildren && vchildren.length || fc != null) {
			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
		}

	diffAttributes(out, vnode.attributes, props);

	isSvgMode = prevSvgMode;

	return out;
}

function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	var originalChildren = dom.childNodes,
	    children = [],
	    keyed = {},
	    keyedLen = 0,
	    min = 0,
	    len = originalChildren.length,
	    childrenLen = 0,
	    vlen = vchildren ? vchildren.length : 0,
	    j,
	    c,
	    f,
	    vchild,
	    child;

	if (len !== 0) {
		for (var i = 0; i < len; i++) {
			var _child = originalChildren[i],
			    props = _child['__preactattr_'],
			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
			if (key != null) {
				keyedLen++;
				keyed[key] = _child;
			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
				children[childrenLen++] = _child;
			}
		}
	}

	if (vlen !== 0) {
		for (var i = 0; i < vlen; i++) {
			vchild = vchildren[i];
			child = null;

			var key = vchild.key;
			if (key != null) {
				if (keyedLen && keyed[key] !== undefined) {
					child = keyed[key];
					keyed[key] = undefined;
					keyedLen--;
				}
			} else if (min < childrenLen) {
					for (j = min; j < childrenLen; j++) {
						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
							child = c;
							children[j] = undefined;
							if (j === childrenLen - 1) childrenLen--;
							if (j === min) min++;
							break;
						}
					}
				}

			child = idiff(child, vchild, context, mountAll);

			f = originalChildren[i];
			if (child && child !== dom && child !== f) {
				if (f == null) {
					dom.appendChild(child);
				} else if (child === f.nextSibling) {
					removeNode(f);
				} else {
					dom.insertBefore(child, f);
				}
			}
		}
	}

	if (keyedLen) {
		for (var i in keyed) {
			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
		}
	}

	while (min <= childrenLen) {
		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	}
}

function recollectNodeTree(node, unmountOnly) {
	var component = node._component;
	if (component) {
		unmountComponent(component);
	} else {
		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

		if (unmountOnly === false || node['__preactattr_'] == null) {
			removeNode(node);
		}

		removeChildren(node);
	}
}

function removeChildren(node) {
	node = node.lastChild;
	while (node) {
		var next = node.previousSibling;
		recollectNodeTree(node, true);
		node = next;
	}
}

function diffAttributes(dom, attrs, old) {
	var name;

	for (name in old) {
		if (!(attrs && attrs[name] != null) && old[name] != null) {
			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
		}
	}

	for (name in attrs) {
		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
		}
	}
}

var recyclerComponents = [];

function createComponent(Ctor, props, context) {
	var inst,
	    i = recyclerComponents.length;

	if (Ctor.prototype && Ctor.prototype.render) {
		inst = new Ctor(props, context);
		Component.call(inst, props, context);
	} else {
		inst = new Component(props, context);
		inst.constructor = Ctor;
		inst.render = doRender;
	}

	while (i--) {
		if (recyclerComponents[i].constructor === Ctor) {
			inst.nextBase = recyclerComponents[i].nextBase;
			recyclerComponents.splice(i, 1);
			return inst;
		}
	}

	return inst;
}

function doRender(props, state, context) {
	return this.constructor(props, context);
}

function setComponentProps(component, props, renderMode, context, mountAll) {
	if (component._disable) return;
	component._disable = true;

	component.__ref = props.ref;
	component.__key = props.key;
	delete props.ref;
	delete props.key;

	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
		if (!component.base || mountAll) {
			if (component.componentWillMount) component.componentWillMount();
		} else if (component.componentWillReceiveProps) {
			component.componentWillReceiveProps(props, context);
		}
	}

	if (context && context !== component.context) {
		if (!component.prevContext) component.prevContext = component.context;
		component.context = context;
	}

	if (!component.prevProps) component.prevProps = component.props;
	component.props = props;

	component._disable = false;

	if (renderMode !== 0) {
		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
			renderComponent(component, 1, mountAll);
		} else {
			enqueueRender(component);
		}
	}

	applyRef(component.__ref, component);
}

function renderComponent(component, renderMode, mountAll, isChild) {
	if (component._disable) return;

	var props = component.props,
	    state = component.state,
	    context = component.context,
	    previousProps = component.prevProps || props,
	    previousState = component.prevState || state,
	    previousContext = component.prevContext || context,
	    isUpdate = component.base,
	    nextBase = component.nextBase,
	    initialBase = isUpdate || nextBase,
	    initialChildComponent = component._component,
	    skip = false,
	    snapshot = previousContext,
	    rendered,
	    inst,
	    cbase;

	if (component.constructor.getDerivedStateFromProps) {
		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
		component.state = state;
	}

	if (isUpdate) {
		component.props = previousProps;
		component.state = previousState;
		component.context = previousContext;
		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
			skip = true;
		} else if (component.componentWillUpdate) {
			component.componentWillUpdate(props, state, context);
		}
		component.props = props;
		component.state = state;
		component.context = context;
	}

	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	component._dirty = false;

	if (!skip) {
		rendered = component.render(props, state, context);

		if (component.getChildContext) {
			context = extend(extend({}, context), component.getChildContext());
		}

		if (isUpdate && component.getSnapshotBeforeUpdate) {
			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
		}

		var childComponent = rendered && rendered.nodeName,
		    toUnmount,
		    base;

		if (typeof childComponent === 'function') {

			var childProps = getNodeProps(rendered);
			inst = initialChildComponent;

			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
				setComponentProps(inst, childProps, 1, context, false);
			} else {
				toUnmount = inst;

				component._component = inst = createComponent(childComponent, childProps, context);
				inst.nextBase = inst.nextBase || nextBase;
				inst._parentComponent = component;
				setComponentProps(inst, childProps, 0, context, false);
				renderComponent(inst, 1, mountAll, true);
			}

			base = inst.base;
		} else {
			cbase = initialBase;

			toUnmount = initialChildComponent;
			if (toUnmount) {
				cbase = component._component = null;
			}

			if (initialBase || renderMode === 1) {
				if (cbase) cbase._component = null;
				base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
			}
		}

		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
			var baseParent = initialBase.parentNode;
			if (baseParent && base !== baseParent) {
				baseParent.replaceChild(base, initialBase);

				if (!toUnmount) {
					initialBase._component = null;
					recollectNodeTree(initialBase, false);
				}
			}
		}

		if (toUnmount) {
			unmountComponent(toUnmount);
		}

		component.base = base;
		if (base && !isChild) {
			var componentRef = component,
			    t = component;
			while (t = t._parentComponent) {
				(componentRef = t).base = base;
			}
			base._component = componentRef;
			base._componentConstructor = componentRef.constructor;
		}
	}

	if (!isUpdate || mountAll) {
		mounts.push(component);
	} else if (!skip) {

		if (component.componentDidUpdate) {
			component.componentDidUpdate(previousProps, previousState, snapshot);
		}
		if (options.afterUpdate) options.afterUpdate(component);
	}

	while (component._renderCallbacks.length) {
		component._renderCallbacks.pop().call(component);
	}if (!diffLevel && !isChild) flushMounts();
}

function buildComponentFromVNode(dom, vnode, context, mountAll) {
	var c = dom && dom._component,
	    originalComponent = c,
	    oldDom = dom,
	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	    isOwner = isDirectOwner,
	    props = getNodeProps(vnode);
	while (c && !isOwner && (c = c._parentComponent)) {
		isOwner = c.constructor === vnode.nodeName;
	}

	if (c && isOwner && (!mountAll || c._component)) {
		setComponentProps(c, props, 3, context, mountAll);
		dom = c.base;
	} else {
		if (originalComponent && !isDirectOwner) {
			unmountComponent(originalComponent);
			dom = oldDom = null;
		}

		c = createComponent(vnode.nodeName, props, context);
		if (dom && !c.nextBase) {
			c.nextBase = dom;

			oldDom = null;
		}
		setComponentProps(c, props, 1, context, mountAll);
		dom = c.base;

		if (oldDom && dom !== oldDom) {
			oldDom._component = null;
			recollectNodeTree(oldDom, false);
		}
	}

	return dom;
}

function unmountComponent(component) {
	if (options.beforeUnmount) options.beforeUnmount(component);

	var base = component.base;

	component._disable = true;

	if (component.componentWillUnmount) component.componentWillUnmount();

	component.base = null;

	var inner = component._component;
	if (inner) {
		unmountComponent(inner);
	} else if (base) {
		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

		component.nextBase = base;

		removeNode(base);
		recyclerComponents.push(component);

		removeChildren(base);
	}

	applyRef(component.__ref, null);
}

function Component(props, context) {
	this._dirty = true;

	this.context = context;

	this.props = props;

	this.state = this.state || {};

	this._renderCallbacks = [];
}

extend(Component.prototype, {
	setState: function setState(state, callback) {
		if (!this.prevState) this.prevState = this.state;
		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	},
	forceUpdate: function forceUpdate(callback) {
		if (callback) this._renderCallbacks.push(callback);
		renderComponent(this, 2);
	},
	render: function render() {}
});

function render(vnode, parent, merge) {
  return diff(merge, vnode, {}, false, parent, false);
}

function createRef() {
	return {};
}

var preact = {
	h: h,
	createElement: h,
	cloneElement: cloneElement,
	createRef: createRef,
	Component: Component,
	render: render,
	rerender: rerender,
	options: options
};

/* harmony default export */ __webpack_exports__["default"] = (preact);

//# sourceMappingURL=preact.mjs.map


//# sourceURL=webpack://CafeKitCommon//home/coder/Work/Projects/wakingsands/cafekit/node_modules/preact/dist/preact.mjs?`)},"../../node_modules/style-loader/lib/addStyles.js":function(module,exports,__webpack_require__){eval(`/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "../../node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\\n\\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\\n Must be 'top', 'bottom', or Object.\\n (https://github.com/webpack-contrib/style-loader#insertat)\\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


//# sourceURL=webpack://CafeKitCommon//home/coder/Work/Projects/wakingsands/cafekit/node_modules/style-loader/lib/addStyles.js?`)},"../../node_modules/style-loader/lib/urls.js":function(module,exports){eval(`
/**
 * When source maps are enabled, \`style-loader\` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at \`test/fixUrls.js\` and can be run via the \`npm test\` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\\/[^\\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\\s*\\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \\(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \\(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \\)  = Match a end parentheses
	             )  = End Group
              *\\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \\)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\\s*\\(((?:[^)(]|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\\/\\/|https:\\/\\/|file:\\/\\/\\/|\\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\\.\\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


//# sourceURL=webpack://CafeKitCommon//home/coder/Work/Projects/wakingsands/cafekit/node_modules/style-loader/lib/urls.js?`)},"./lib/CKAction.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKAction = /** @class */ (function (_super) {
    __extends(CKAction, _super);
    function CKAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKAction.prototype.render = function () {
        return (preact_1.h("div", { class: "ck-action " + (this.props.className || ''), style: this.props.style },
            preact_1.h("div", { class: "ck-action-cover" }),
            this.props.children));
    };
    return CKAction;
}(preact_1.Component));
exports.CKAction = CKAction;


//# sourceURL=webpack://CafeKitCommon/./lib/CKAction.tsx?`)},"./lib/CKActionIcon.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKAction_1 = __webpack_require__(/*! ./CKAction */ "./lib/CKAction.tsx");
var CKActionIcon = /** @class */ (function (_super) {
    __extends(CKActionIcon, _super);
    function CKActionIcon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKActionIcon.prototype.render = function () {
        return (preact_1.h(CKAction_1.CKAction, { style: { width: this.props.size, height: this.props.size } },
            preact_1.h("img", { src: this.props.src })));
    };
    return CKActionIcon;
}(preact_1.Component));
exports.CKActionIcon = CKActionIcon;


//# sourceURL=webpack://CafeKitCommon/./lib/CKActionIcon.tsx?`)},"./lib/CKAttributes.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKAttributes = /** @class */ (function (_super) {
    __extends(CKAttributes, _super);
    function CKAttributes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKAttributes.prototype.render = function () {
        return (preact_1.h("div", { class: "ck-attrs" }, this.props.attrs.map(function (attr) { return (preact_1.h("div", { class: "ck-attrs-" + attr.style + " " + (attr.name ? '' : 'ck-attrs-empty') },
            preact_1.h("div", { class: ['ck-attrs-name', attr.titleClass == null ? 'ck-hl' : attr.titleClass].join(' ') }, attr.name),
            attr.value ? preact_1.h("div", { class: "ck-attrs-value" }, attr.value) : null)); })));
    };
    return CKAttributes;
}(preact_1.Component));
exports.CKAttributes = CKAttributes;


//# sourceURL=webpack://CafeKitCommon/./lib/CKAttributes.tsx?`)},"./lib/CKBox.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKBox = /** @class */ (function (_super) {
    __extends(CKBox, _super);
    function CKBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKBox.prototype.render = function () {
        return preact_1.h("div", { class: "ck-box" }, this.props.children);
    };
    return CKBox;
}(preact_1.Component));
exports.CKBox = CKBox;


//# sourceURL=webpack://CafeKitCommon/./lib/CKBox.tsx?`)},"./lib/CKBoxBottom.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKBoxBottom = /** @class */ (function (_super) {
    __extends(CKBoxBottom, _super);
    function CKBoxBottom() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKBoxBottom.prototype.render = function () {
        return (preact_1.h("div", { class: "ck-box-bottom-wrapper" },
            preact_1.h("div", { class: "ck-box-bottom" }, this.props.children)));
    };
    return CKBoxBottom;
}(preact_1.Component));
exports.CKBoxBottom = CKBoxBottom;


//# sourceURL=webpack://CafeKitCommon/./lib/CKBoxBottom.tsx?`)},"./lib/CKComment.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKComment = /** @class */ (function (_super) {
    __extends(CKComment, _super);
    function CKComment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKComment.prototype.render = function () {
        return preact_1.h("div", { class: "ck-comment" }, this.props.children);
    };
    return CKComment;
}(preact_1.Component));
exports.CKComment = CKComment;


//# sourceURL=webpack://CafeKitCommon/./lib/CKComment.tsx?`)},"./lib/CKContainer.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKContainer = /** @class */ (function (_super) {
    __extends(CKContainer, _super);
    function CKContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKContainer.prototype.render = function () {
        return (preact_1.h("div", { class: "ck-container " + (this.props.className || ''), style: this.props.style }, this.props.children));
    };
    return CKContainer;
}(preact_1.Component));
exports.CKContainer = CKContainer;


//# sourceURL=webpack://CafeKitCommon/./lib/CKContainer.tsx?`)},"./lib/CKItemName.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKActionIcon_1 = __webpack_require__(/*! ./CKActionIcon */ "./lib/CKActionIcon.tsx");
var CKItemName = /** @class */ (function (_super) {
    __extends(CKItemName, _super);
    function CKItemName() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKItemName.prototype.render = function () {
        return (preact_1.h("div", { class: 'ck-item-name ck-item-name-size-' + this.props.size, style: this.props.style },
            this.props.iconSrc ? (preact_1.h("div", { className: "ck-item-name-icon" },
                preact_1.h(CKActionIcon_1.CKActionIcon, { src: this.props.iconSrc, size: "" }))) : null,
            preact_1.h("div", { className: "ck-item-name-meta" },
                preact_1.h("div", { class: 'ck-item-name-name ck-rarity-' + this.props.rarity }, this.props.name),
                this.props.type ? preact_1.h("div", { class: "ck-item-name-type" }, this.props.type) : null)));
    };
    return CKItemName;
}(preact_1.Component));
exports.CKItemName = CKItemName;


//# sourceURL=webpack://CafeKitCommon/./lib/CKItemName.tsx?`)},"./lib/CKStat.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKStat = /** @class */ (function (_super) {
    __extends(CKStat, _super);
    function CKStat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKStat.prototype.render = function () {
        return (preact_1.h("div", { class: "ck-stat", style: this.props.style },
            preact_1.h("div", { class: "ck-stat-name" }, this.props.name),
            preact_1.h("div", { class: "ck-stat-border" }),
            preact_1.h("div", { class: "ck-stat-value" }, this.props.value)));
    };
    return CKStat;
}(preact_1.Component));
exports.CKStat = CKStat;


//# sourceURL=webpack://CafeKitCommon/./lib/CKStat.tsx?`)},"./lib/CKStatGroup.tsx":function(module,exports,__webpack_require__){eval(`
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
var CKStatGroup = /** @class */ (function (_super) {
    __extends(CKStatGroup, _super);
    function CKStatGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CKStatGroup.prototype.render = function () {
        return preact_1.h("div", { class: "ck-stat-group" }, this.props.children);
    };
    return CKStatGroup;
}(preact_1.Component));
exports.CKStatGroup = CKStatGroup;


//# sourceURL=webpack://CafeKitCommon/./lib/CKStatGroup.tsx?`)},"./lib/main.ts":function(module,exports,__webpack_require__){eval(`
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-var-requires
__webpack_require__(/*! ./styles/main.styl */ "./lib/styles/main.styl"); // use require here to avoid types being created
var CKBox_1 = __webpack_require__(/*! ./CKBox */ "./lib/CKBox.tsx");
exports.CKBox = CKBox_1.CKBox;
var CKBoxBottom_1 = __webpack_require__(/*! ./CKBoxBottom */ "./lib/CKBoxBottom.tsx");
exports.CKBoxBottom = CKBoxBottom_1.CKBoxBottom;
var CKComment_1 = __webpack_require__(/*! ./CKComment */ "./lib/CKComment.tsx");
exports.CKComment = CKComment_1.CKComment;
var CKContainer_1 = __webpack_require__(/*! ./CKContainer */ "./lib/CKContainer.tsx");
exports.CKContainer = CKContainer_1.CKContainer;
var CKStat_1 = __webpack_require__(/*! ./CKStat */ "./lib/CKStat.tsx");
exports.CKStat = CKStat_1.CKStat;
var CKStatGroup_1 = __webpack_require__(/*! ./CKStatGroup */ "./lib/CKStatGroup.tsx");
exports.CKStatGroup = CKStatGroup_1.CKStatGroup;
var CKAction_1 = __webpack_require__(/*! ./CKAction */ "./lib/CKAction.tsx");
exports.CKAction = CKAction_1.CKAction;
var CKActionIcon_1 = __webpack_require__(/*! ./CKActionIcon */ "./lib/CKActionIcon.tsx");
exports.CKActionIcon = CKActionIcon_1.CKActionIcon;
var CKAttributes_1 = __webpack_require__(/*! ./CKAttributes */ "./lib/CKAttributes.tsx");
exports.CKAttributes = CKAttributes_1.CKAttributes;
var CKItemName_1 = __webpack_require__(/*! ./CKItemName */ "./lib/CKItemName.tsx");
exports.CKItemName = CKItemName_1.CKItemName;
var preact_1 = __webpack_require__(/*! preact */ "../../node_modules/preact/dist/preact.mjs");
exports.render = preact_1.render;
exports.h = preact_1.h;


//# sourceURL=webpack://CafeKitCommon/./lib/main.ts?`)},"./lib/styles/main.styl":function(module,exports,__webpack_require__){eval(`
var content = __webpack_require__(/*! !../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/stylus-loader!./main.styl */ "../../node_modules/css-loader/dist/cjs.js!../../node_modules/stylus-loader/index.js!./lib/styles/main.styl");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../../node_modules/style-loader/lib/addStyles.js */ "../../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

//# sourceURL=webpack://CafeKitCommon/./lib/styles/main.styl?`)}})},module.exports=factory()},function(e,t,n){var o,r=this&&this.__extends||(o=function(y,S){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,g){b.__proto__=g}||function(b,g){for(var d in g)g.hasOwnProperty(d)&&(b[d]=g[d])})(y,S)},function(y,S){function b(){this.constructor=y}o(y,S),y.prototype=S===null?Object.create(S):(b.prototype=S.prototype,new b)}),i=this&&this.__assign||function(){return(i=Object.assign||function(y){for(var S,b=1,g=arguments.length;b<g;b++)for(var d in S=arguments[b])Object.prototype.hasOwnProperty.call(S,d)&&(y[d]=S[d]);return y}).apply(this,arguments)},l=this&&this.__awaiter||function(y,S,b,g){return new(b||(b=Promise))(function(d,C){function x(U){try{M(g.next(U))}catch(D){C(D)}}function O(U){try{M(g.throw(U))}catch(D){C(D)}}function M(U){U.done?d(U.value):new b(function(D){D(U.value)}).then(x,O)}M((g=g.apply(y,S||[])).next())})},a=this&&this.__generator||function(y,S){var b,g,d,C,x={label:0,sent:function(){if(1&d[0])throw d[1];return d[1]},trys:[],ops:[]};return C={next:O(0),throw:O(1),return:O(2)},typeof Symbol=="function"&&(C[Symbol.iterator]=function(){return this}),C;function O(M){return function(U){return function(D){if(b)throw new TypeError("Generator is already executing.");for(;x;)try{if(b=1,g&&(d=2&D[0]?g.return:D[0]?g.throw||((d=g.return)&&d.call(g),0):g.next)&&!(d=d.call(g,D[1])).done)return d;switch(g=0,d&&(D=[2&D[0],d.value]),D[0]){case 0:case 1:d=D;break;case 4:return x.label++,{value:D[1],done:!1};case 5:x.label++,g=D[1],D=[0];continue;case 7:D=x.ops.pop(),x.trys.pop();continue;default:if(!(d=(d=x.trys).length>0&&d[d.length-1])&&(D[0]===6||D[0]===2)){x=0;continue}if(D[0]===3&&(!d||D[1]>d[0]&&D[1]<d[3])){x.label=D[1];break}if(D[0]===6&&x.label<d[1]){x.label=d[1],d=D;break}if(d&&x.label<d[2]){x.label=d[2],x.ops.push(D);break}d[2]&&x.ops.pop(),x.trys.pop();continue}D=S.call(y,x)}catch(W){D=[6,W],g=0}finally{b=d=0}if(5&D[0])throw D[1];return{value:D[0]?D[1]:void 0,done:!0}}([M,U])}}};Object.defineProperty(t,"__esModule",{value:!0});var s=n(0),u=n(2),_=function(y){function S(){return y!==null&&y.apply(this,arguments)||this}return r(S,y),S.prototype.componentDidMount=function(){return l(this,void 0,void 0,function(){return a(this,function(b){switch(b.label){case 0:return[4,this.getData()];case 1:return b.sent(),[2]}})})},S.prototype.componentDidUpdate=function(b){return l(this,void 0,void 0,function(){var g;return a(this,function(d){switch(d.label){case 0:if(this.props.onUpdate&&this.props.onUpdate(),b.id===this.props.id&&b.name===this.props.name&&b.jobId===this.props.jobId)return[3,4];this.setState({data:null,error:null}),d.label=1;case 1:return d.trys.push([1,3,,4]),[4,this.getData()];case 2:return d.sent(),[3,4];case 3:return g=d.sent(),this.setState({error:g}),console.error(g),[3,4];case 4:return[2]}})})},S.prototype.getData=function(){return l(this,void 0,void 0,function(){var b,g;return a(this,function(d){switch(d.label){case 0:return[4,this.getId()];case 1:return(b=d.sent())?[4,fetch(this.context.apiBaseUrl+"/Action/"+b+"?columns=Icon,Name,Description,ActionCategory.Name,ClassJob.Name,MaxCharges,Range,Cast100ms,Recast100ms,ClassJobLevel,EffectRange,ClassJobCategory.Name")]:[2];case 2:return[4,d.sent().json()];case 3:return g=d.sent(),this.setState({data:g}),[2]}})})},S.prototype.getId=function(){return l(this,void 0,void 0,function(){var b,g,d;return a(this,function(C){switch(C.label){case 0:return this.props.id&&(b=parseInt(""+this.props.id),!isNaN(b))?[2,b]:this.props.name?(g=this.context.apiBaseUrl+"/search?indexes=Action&limit=1&string="+encodeURIComponent(this.props.name)+"&filters=ClassJobLevel>0,IsPvP="+(this.props.pvp?"1":"0"),this.props.jobId&&(g=g+",ClassJobTargetID="+this.props.jobId),[4,fetch(g)]):(this.setState({error:"\u6CA1\u6709\u6307\u5B9A\u6280\u80FD\u540D\u5B57\u6216 ID\u3002"}),[2,null]);case 1:return[4,C.sent().json()];case 2:return(d=C.sent()).Results[0]?[2,d.Results[0].ID]:(this.setState({error:"\u6CA1\u6709\u627E\u5230\u6280\u80FD\u201C"+this.props.name+"\u201D\u3002"}),[2,null])}})})},S.prototype.render=function(){if(this.state.error)return s.h(u.CKBox,null,s.h(u.CKContainer,null,this.state.error));if(!this.state.data)return s.h(u.CKBox,null,s.h(u.CKContainer,null,"Loading..."));var b=this.state.data,g=b.Icon,d=b.Name,C=b.Description,x=b.ActionCategory.Name,O=b.ClassJob.Name,M=b.ClassJobCategory.Name,U=b.MaxCharges,D=b.Range,W=b.Cast100ms,F=b.Recast100ms,Q=b.ClassJobLevel,X=b.EffectRange,re=O||M,$=["\u821E\u8005","\u541F\u6E38\u8BD7\u4EBA","\u5F13\u7BAD\u624B","\u673A\u5DE5\u58EB"].indexOf(re)>-1?25:3,ee=D<0?$:D,le={attrs:[]};le.attrs.push({name:"\u8303\u56F4",value:X+"m",style:"half"}),le.attrs.push({name:"\u8DDD\u79BB",value:ee+"m",style:"half"}),le.attrs.push({name:"\u4E60\u5F97\u7B49\u7EA7",value:re+" "+Q+"\u7EA7",style:"half-full"}),U&&le.attrs.push({name:"\u5145\u80FD\u5C42\u6570",value:U,style:"half-full"});var de=""+this.context.iconBaseUrl+g.replace(/^\/i/,""),se=s.h("div",{dangerouslySetInnerHTML:{__html:C.replace(/\n/g,"<br/>")}}),oe=new Date().getFullYear();return s.h(u.CKBox,null,s.h("div",{style:{width:320,padding:8}},s.h(u.CKContainer,{style:{paddingBottom:0}},s.h(u.CKItemName,{name:d,rarity:0,type:x,size:"medium",iconSrc:de})),s.h("div",{style:{paddingTop:6}},s.h(u.CKStatGroup,null,s.h(u.CKStat,{name:"\u548F\u5531\u65F6\u95F4",value:v(W)}),s.h(u.CKStat,{name:"\u590D\u5531\u65F6\u95F4",value:v(F)}))),s.h(u.CKContainer,null,se),s.h(u.CKContainer,null,s.h(u.CKAttributes,i({},le))),s.h(u.CKComment,null,s.h("p",{style:{fontSize:"9px",textAlign:"right",opacity:.6,userSelect:"none"}},this.context.hideSeCopyright?null:"\xA9 "+oe+" SQUARE ENIX CO., LTD. ","Powered by"," ",s.h("a",{href:"https://ffcafe.org/?utm_source=ckitem",target:"_blank",rel:"noopener noreferrer"},"FFCafe")))))},S}(s.Component);function v(y){return y===0?"\u5373\u65F6":y/10+"\u79D2"}t.CKAction=_},function(e,t,n){var o,r=this&&this.__extends||(o=function(a,s){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(u,_){u.__proto__=_}||function(u,_){for(var v in _)_.hasOwnProperty(v)&&(u[v]=_[v])})(a,s)},function(a,s){function u(){this.constructor=a}o(a,s),a.prototype=s===null?Object.create(s):(u.prototype=s.prototype,new u)});Object.defineProperty(t,"__esModule",{value:!0});var i=n(0),l=function(a){function s(){return a!==null&&a.apply(this,arguments)||this}return r(s,a),s.prototype.getChildContext=function(){return this.props},s.prototype.render=function(){return i.h("div",null,this.props.children)},s}(i.Component);t.CKContextProvider=l},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0});var o=n(1);t.CKItem=o.CKItem;var r=n(3);t.CKAction=r.CKAction;var i=n(4);t.CKContextProvider=i.CKContextProvider;var l=n(9);t.initTooltip=l.initTooltip;var a=n(0);t.render=a.render,t.h=a.h},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.copyText=function(o){var r=document.createElement("textarea");r.value=o,r.style.width="0",r.style.height="0",r.style.opacity="0",r.style.position="absolute",document.body.appendChild(r),r.select(),document.execCommand("copy")||prompt("\u8BF7\u624B\u52A8\u590D\u5236\u4EE5\u4E0B\u5185\u5BB9",o),document.body.removeChild(r)}},function(e,t,n){var o,r=this&&this.__extends||(o=function(s,u){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(_,v){_.__proto__=v}||function(_,v){for(var y in v)v.hasOwnProperty(y)&&(_[y]=v[y])})(s,u)},function(s,u){function _(){this.constructor=s}o(s,u),s.prototype=u===null?Object.create(u):(_.prototype=u.prototype,new _)});Object.defineProperty(t,"__esModule",{value:!0});var i=n(0),l=n(8),a=function(s){function u(){var _=s!==null&&s.apply(this,arguments)||this;return _.handleHqClick=function(){_.props.onHqChange(!_.props.hq)},_.preventSelectText=function(v){v.preventDefault(),v.stopPropagation()},_}return r(u,s),u.prototype.render=function(){var _={cursor:"pointer",userSelect:"none"};return this.props.hq||(_.opacity=.2),i.h("span",{style:_,onClick:this.handleHqClick,onMouseDown:this.preventSelectText}," ",l.hqSvg)},u}(i.Component);t.HqButton=a},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0});var o=n(0);t.hqSvg=o.h("svg",{width:"12",height:"12",viewBox:"0 0 64 67",fill:"none",xmlns:"http://www.w3.org/2000/svg"},o.h("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M41.1148 9.7149C50.538 9.7149 58.8813 14.3384 64 21.4405C59.3004 8.91467 47.2153 0 33.048 0C14.7961 0 0 14.7961 0 33.048C0 51.2999 14.7961 66.0959 33.048 66.0959C34.469 66.0959 35.8691 66.0062 37.2428 65.8322C33.4767 65.3149 29.9478 64.0537 26.8091 62.2016C25.2784 60.1233 24.3739 57.5554 24.3739 54.7763C24.3739 47.854 29.9856 42.2424 36.9079 42.2424C43.4076 42.2424 48.7518 47.1898 49.3801 53.5242C50.0936 51.5602 50.4827 49.4405 50.4827 47.23C50.4827 37.0501 42.2303 28.7977 32.0504 28.7977C22.6912 28.7977 14.9612 35.7732 13.7757 44.8089C13.2197 42.5998 12.9243 40.2871 12.9243 37.9054C12.9243 22.3362 25.5456 9.7149 41.1148 9.7149Z",fill:"white"}))},function(e,t,n){var o=this&&this.__assign||function(){return(o=Object.assign||function(u){for(var _,v=1,y=arguments.length;v<y;v++)for(var S in _=arguments[v])Object.prototype.hasOwnProperty.call(_,S)&&(u[S]=_[S]);return u}).apply(this,arguments)};Object.defineProperty(t,"__esModule",{value:!0});var r=n(10),i=n(11),l=n(12),a={context:{apiBaseUrl:"https://cafemaker.wakingsands.com",iconBaseUrl:"https://cafemaker.wakingsands.com/i",defaultHq:!0,hideSeCopyright:!1},links:{detectWikiLinks:!0,itemNameAttribute:"data-ck-item-name",itemIdAttribute:"data-ck-item-id",actionNameAttribute:"data-ck-action-name",actionIdAttribute:"data-ck-action-id",rootContainer:document.body}},s=!!r.isSupportPassive()&&{passive:!0};t.initTooltip=function(u){u===void 0&&(u={});var _={context:o({},a.context,u.context||{}),links:o({},a.links,u.links||{})},v=function(y){return function(S){var b,g="item";if((y.links.itemIdAttribute||y.links.itemNameAttribute)&&(b=b||function(x,O){var M=i.closest(x,"["+O.links.itemNameAttribute+"]"),U=i.closest(x,"["+O.links.itemIdAttribute+"]");if(U)return{props:{id:U.getAttribute(O.links.itemIdAttribute)},element:U};if(M){var D=M.getAttribute(O.links.itemNameAttribute)||M.innerText.trim();return{props:{name:D},element:M}}return null}(S.target,y)),y.links.detectWikiLinks&&(b=b||function(x){var O=i.closest(x,"a");if(!O||O.host!=="ff14.huijiwiki.com")return null;var M=O.pathname.match(/^\/wiki\/(.*)$/);if(!M)return null;var U=decodeURIComponent(M[1]).split(":"),D=U[0],W=U[1];return D!=="\u7269\u54C1"&&D.toLowerCase()!=="item"?null:{props:{name:W},element:O}}(S.target)),y.links.actionIdAttribute||y.links.actionNameAttribute){var d=function(x,O){var M=i.closest(x,"["+O.links.actionNameAttribute+"]"),U=i.closest(x,"["+O.links.actionIdAttribute+"]");if(U)return{props:{id:U.getAttribute(O.links.actionIdAttribute)},element:U};if(M){var D=M.getAttribute("data-ck-action-job-id")||null,W=M.getAttribute(O.links.actionNameAttribute)||M.innerText.trim();return{props:{name:W,jobId:D},element:M}}return null}(S.target,y);d&&(g="action",b=d)}if(b&&(g==="item"?l.popupItem(y.context,b.props,b.element):l.popupAction(y.context,b.props,b.element),b.element.__ckflag_leave!==!0)){var C=function(){l.hidePopup(),b.element.removeEventListener("mouseleave",C),delete b.element.__ckflag_leave};b.element.addEventListener("mouseleave",C,s),function(x,O){x["__ckflag_"+O]=!0}(b.element,"leave")}}}(_);_.links.rootContainer.addEventListener("mouseover",v,s)}},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0});var o=null;t.isSupportPassive=function(){if(o!==null)return o;if(typeof window!="undefined"&&typeof window.addEventListener=="function"){var r=!1,i=Object.defineProperty({},"passive",{get:function(){r=!0}}),l=function(){};return window.addEventListener("testPassiveEventSupport",l,i),window.removeEventListener("testPassiveEventSupport",l,i),o=r,r}}},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.closest=function(o,r){if(typeof r=="string")try{document.createElement("div").querySelector(r)}catch{return null}var i=o;do{if(r instanceof HTMLElement){if(i===r)return i}else if(i.matches(r))return i;i=i.parentElement}while(i);return null}},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0});var o,r,i=n(0),l=n(1),a=n(3),s=n(4),u=document.createElement("div");u.style.position="fixed",u.style.display="none",u.className="cafekit ck-popup";var _=function(){setTimeout(y,100)};function v(){clearTimeout(o),o=setTimeout(function(){return u.style.display="none"},300)}function y(){var b=r.getBoundingClientRect(),g=window.innerWidth,d=window.innerHeight,C=u.getBoundingClientRect(),x={left:b.right+15,top:b.bottom+10,bottom:void 0},O=C.width,M=C.height;for(var U in x.left+O>g&&(x.left=Math.max(0,g-O)),x.top+M>d&&(x.top=void 0,x.bottom=10),x)u.style[U]=x[U]==null?"":x[U]+"px"}function S(b){r=b;var g=u;y(),g.style.display="block",g.parentElement||document.body.appendChild(g)}t.popupItem=function(b,g,d){clearTimeout(o),g.onUpdate=_,i.render(i.h(s.CKContextProvider,b,[i.h(l.CKItem,g)]),u,u.children&&u.children[0]),S(d)},t.popupAction=function(b,g,d){clearTimeout(o),g.onUpdate=_,i.render(i.h(s.CKContextProvider,b,[i.h(a.CKAction,g)]),u,u.children&&u.children[0]),S(d)},t.hidePopup=v,u.addEventListener("mouseenter",function(){return clearTimeout(o)}),u.addEventListener("mouseleave",function(){return v()})}])})})(bundle);createApp(App).mount("#app");bundle.exports.initTooltip();
