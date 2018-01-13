var GluonJS=function(e){"use strict";function t(e,t,s,n){const i=o?e:e.join("{{--uniqueness-workaround--}}");let r=s.get(i);return void 0===r&&(r=new p(e,n),s.set(i,r)),new l(r,t)}function s(e,t,s=N){let n=t.__templateInstance;if(void 0!==n&&n.template===e.template&&n._partCallback===s)return void n.update(e.values);n=new g(e.template,s),t.__templateInstance=n;const i=n._clone();n.update(e.values),w(t,t.firstChild),t.appendChild(i)}function n(e){const t=e.lastIndexOf(">");return e.indexOf("<",t+1)>-1?e.length:t}function i(e,t){s(e,t,b)}const o=(e=>e()===e())(()=>e=>e``),r=new Map;class l{constructor(e,t){this.template=e,this.values=t}}const a=`{{lit-${String(Math.random()).slice(2)}}}`,h=`\x3c!--${a}--\x3e`,c=new RegExp(`${a}|${h}`),u=/[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;class d{constructor(e,t,s,n,i){this.type=e,this.index=t,this.name=s,this.rawName=n,this.strings=i}}class p{constructor(e,t=!1){this.parts=[];const s=this.element=document.createElement("template");s.innerHTML=this._getHtml(e,t);const n=s.content;if(t){const e=n.firstChild;n.removeChild(e),y(n,e.firstChild)}const i=document.createTreeWalker(n,133,null,!1);let o=-1,r=0;const l=[];let h,p;for(;i.nextNode();){o++,h=p;const t=p=i.currentNode;if(1===t.nodeType){if(!t.hasAttributes())continue;const s=t.attributes;let n=0;for(let e=0;e<s.length;e++)s[e].value.indexOf(a)>=0&&n++;for(;n-- >0;){const n=e[r],i=u.exec(n)[1],l=s.getNamedItem(i),a=l.value.split(c);this.parts.push(new d("attribute",o,l.name,i,a)),t.removeAttribute(l.name),r+=a.length-1}}else if(3===t.nodeType){const e=t.nodeValue;if(e.indexOf(a)<0)continue;const s=t.parentNode,n=e.split(c),i=n.length-1;r+=i,t.textContent=n[i];for(let e=0;e<i;e++)s.insertBefore(document.createTextNode(n[e]),t),this.parts.push(new d("node",o++))}else if(8===t.nodeType&&t.nodeValue===a){const e=t.parentNode,s=t.previousSibling;null===s||s!==h||s.nodeType!==Node.TEXT_NODE?e.insertBefore(document.createTextNode(""),t):o--,this.parts.push(new d("node",o++)),l.push(t),null===t.nextSibling?e.insertBefore(document.createTextNode(""),t):o--,p=h,r++}}for(const e of l)e.parentNode.removeChild(e)}_getHtml(e,t){const s=e.length-1;let i="",o=!0;for(let t=0;t<s;t++){const s=e[t];i+=s;const r=n(s);i+=(o=r>-1?r<s.length:o)?h:a}return i+=e[s],t?`<svg>${i}</svg>`:i}}const m=(e,t)=>f(t)?(t=t(e),_):null===t?void 0:t,f=e=>"function"==typeof e&&!0===e.__litDirective,_={};class x{constructor(e,t,s,n){this.instance=e,this.element=t,this.name=s,this.strings=n,this.size=n.length-1}_interpolate(e,t){const s=this.strings,n=s.length-1;let i="";for(let o=0;o<n;o++){i+=s[o];const n=m(this,e[t+o]);if(n&&n!==_&&(Array.isArray(n)||"string"!=typeof n&&n[Symbol.iterator]))for(const e of n)i+=e;else i+=n}return i+s[n]}setValue(e,t){const s=this._interpolate(e,t);this.element.setAttribute(this.name,s)}}class v{constructor(e,t,s){this.instance=e,this.startNode=t,this.endNode=s,this._previousValue=void 0}setValue(e){if((e=m(this,e))!==_)if(null===e||"object"!=typeof e&&"function"!=typeof e){if(e===this._previousValue)return;this._setText(e)}else e instanceof l?this._setTemplateResult(e):Array.isArray(e)||e[Symbol.iterator]?this._setIterable(e):e instanceof Node?this._setNode(e):void 0!==e.then?this._setPromise(e):this._setText(e)}_insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}_setNode(e){this._previousValue!==e&&(this.clear(),this._insert(e),this._previousValue=e)}_setText(e){const t=this.startNode.nextSibling;e=void 0===e?"":e,t===this.endNode.previousSibling&&t.nodeType===Node.TEXT_NODE?t.textContent=e:this._setNode(document.createTextNode(e)),this._previousValue=e}_setTemplateResult(e){let t;this._previousValue&&this._previousValue.template===e.template?t=this._previousValue:(t=new g(e.template,this.instance._partCallback),this._setNode(t._clone()),this._previousValue=t),t.update(e.values)}_setIterable(e){Array.isArray(this._previousValue)||(this.clear(),this._previousValue=[]);const t=this._previousValue;let s=0;for(const n of e){let e=t[s];if(void 0===e){let n=this.startNode;s>0&&(n=t[s-1].endNode=document.createTextNode(""),this._insert(n)),e=new v(this.instance,n,this.endNode),t.push(e)}e.setValue(n),s++}if(0===s)this.clear(),this._previousValue=void 0;else if(s<t.length){const e=t[s-1];t.length=s,this.clear(e.endNode.previousSibling),e.endNode=this.endNode}}_setPromise(e){this._previousValue=e,e.then(t=>{this._previousValue===e&&this.setValue(t)})}clear(e=this.startNode){w(this.startNode.parentNode,e.nextSibling,this.endNode)}}const N=(e,t,s)=>{if("attribute"===t.type)return new x(e,s,t.name,t.strings);if("node"===t.type)return new v(e,s,s.nextSibling);throw new Error(`Unknown part type ${t.type}`)};class g{constructor(e,t=N){this._parts=[],this.template=e,this._partCallback=t}update(e){let t=0;for(const s of this._parts)void 0===s.size?(s.setValue(e[t]),t++):(s.setValue(e,t),t+=s.size)}_clone(){const e=document.importNode(this.template.element.content,!0),t=this.template.parts;if(t.length>0){const s=document.createTreeWalker(e,133,null,!1);let n=-1;for(let e=0;e<t.length;e++){const i=t[e];for(;n<i.index;)n++,s.nextNode();this._parts.push(this._partCallback(this,i,s.currentNode))}}return e}}const y=(e,t,s=null,n=null)=>{let i=t;for(;i!==s;){const t=i.nextSibling;e.insertBefore(i,n),i=t}},w=(e,t,s=null)=>{let n=t;for(;n!==s;){const t=n.nextSibling;e.removeChild(n),n=t}},b=(e,t,s)=>{if("attribute"===t.type){if(t.rawName.startsWith("on-")){const n=t.rawName.slice(3);return new T(e,s,n)}if(t.name.endsWith("$")){const n=t.name.slice(0,-1);return new x(e,s,n,t.strings)}return new S(e,s,t.rawName,t.strings)}return N(e,t,s)};class S extends x{setValue(e,t){const s=this.strings;let n;n=2===s.length&&""===s[0]&&""===s[1]?m(this,e[t]):this._interpolate(e,t),this.element[this.name]=n}}class T{constructor(e,t,s){this.instance=e,this.element=t,this.eventName=s}setValue(e){const t=m(this,e),s=this._listener;t!==s&&(this._listener=t,null!=s&&this.element.removeEventListener(this.eventName,s),null!=t&&this.element.addEventListener(this.eventName,t))}}const V=Symbol("tag"),C=Symbol("needsRender"),E=Symbol("shadyTemplate"),$=e=>{if(window.ShadyCSS){const t=e.constructor;void 0===t[E]&&(t[E]=document.createElement("template"),t[E].innerHTML=e.shadowRoot.innerHTML,ShadyCSS.prepareTemplate(t[E],t.is)),ShadyCSS.styleElement(e)}},A=e=>e.replace(/([a-z])([A-Z])|(.)([A-Z][a-z])/g,"$1$3-$2$4").toLowerCase(),k=e=>{e.$={},e.shadowRoot.querySelectorAll("[id]").forEach(t=>{e.$[t.id]=t})};class L extends HTMLElement{static get is(){return this.hasOwnProperty(V)&&this[V]||(this[V]=A(this.name))}connectedCallback(){"template"in this&&(this.attachShadow({mode:"open"}),this.render({sync:!0}),k(this))}async render({sync:e=!1}={}){this[C]=!0,e||await 0,this[C]&&(this[C]=!1,i(this.template,this.shadowRoot),$(this))}}return e.GluonElement=L,e.html=((e,...s)=>t(e,s,r,!1)),e}({});