!function(e){"use strict";function t(e,t,s=c){let n=t.__templateInstance;if(void 0!==n&&n.template===e.template&&n._partCallback===s)return void n.update(e.values);n=new u(e.template,s),t.__templateInstance=n;const i=n._clone();n.update(e.values);let o;for(;o=t.lastChild;)t.removeChild(o);t.appendChild(i)}const s=new Map;class n{constructor(e,t){this.template=e,this.values=t}}const i=`{{lit-${Math.random()}}}`;class o{constructor(e,t,s,n,i){this.type=e,this.index=t,this.name=s,this.rawName=n,this.strings=i}}class a{constructor(e){this.parts=[],this.element=document.createElement("template"),this.element.innerHTML=e.join(i);const t=document.createTreeWalker(this.element.content,5);let s=-1,n=0;const a=[];for(;t.nextNode();){s++;const l=t.currentNode;if(1===l.nodeType){if(!l.hasAttributes())continue;const t=l.attributes;for(let a=0;a<t.length;a++){const r=t.item(a),h=r.value.split(i);if(h.length>1){const t=e[n],i=t.substring(0,t.length-h[0].length).match(/((?:\w|[.\-_$])+)=["']?$/)[1];this.parts.push(new o("attribute",s,r.name,i,h)),l.removeAttribute(r.name),n+=h.length-1,a--}}}else if(3===l.nodeType){const e=l.nodeValue.split(i);if(e.length>1){const t=l.parentNode,i=e.length-1;n+=i,l.textContent=e[i];for(let n=0;n<i;n++)t.insertBefore(new Text(e[n]),l),this.parts.push(new o("node",s++))}else l.nodeValue.trim()||(a.push(l),s--)}}for(const e of a)e.parentNode.removeChild(e)}}const l=(e,t)=>(null!=t&&!0===t.__litDirective&&(t=t(e)),null===t?void 0:t);class r{constructor(e,t,s,n){this.instance=e,this.element=t,this.name=s,this.strings=n,this.size=n.length-1}setValue(e,t){const s=this.strings;let n="";for(let i=0;i<s.length;i++)if(n+=s[i],i<s.length-1){const s=l(this,e[t+i]);if(s&&(Array.isArray(s)||"string"!=typeof s&&s[Symbol.iterator]))for(const e of s)n+=e;else n+=s}this.element.setAttribute(this.name,n)}}class h{constructor(e,t,s){this.instance=e,this.startNode=t,this.endNode=s}setValue(e){if(null===(e=l(this,e))||"object"!=typeof e&&"function"!=typeof e){if(e===this._previousValue)return;this._setText(e)}else e instanceof n?this._setTemplateResult(e):Array.isArray(e)||e[Symbol.iterator]?this._setIterable(e):e instanceof Node?this._setNode(e):void 0!==e.then?this._setPromise(e):this._setText(e)}_insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}_setNode(e){this.clear(),this._insert(e),this._previousValue=e}_setText(e){const t=this.startNode.nextSibling;t===this.endNode.previousSibling&&t.nodeType===Node.TEXT_NODE?t.textContent=e:this._setNode(new Text(e)),this._previousValue=e}_setTemplateResult(e){let t;this._previousValue&&this._previousValue.template===e.template?t=this._previousValue:(t=new u(e.template,this.instance._partCallback),this._setNode(t._clone()),this._previousValue=t),t.update(e.values)}_setIterable(e){Array.isArray(this._previousValue)||(this.clear(),this._previousValue=[]);const t=this._previousValue;let s=0;for(const n of e){let e=t[s];if(void 0===e){let n=this.startNode;s>0&&(n=t[s-1].endNode=new Text,this._insert(n)),e=new h(this.instance,n,this.endNode),t.push(e)}e.setValue(n),s++}if(0===s)this.clear(),this._previousValue=void 0;else if(s<t.length){const e=t[s-1];this.clear(e.endNode.previousSibling),e.endNode=this.endNode}}_setPromise(e){e.then(t=>{this._previousValue===e&&this.setValue(t)}),this._previousValue=e}clear(e=this.startNode){let t;for(;(t=e.nextSibling)!==this.endNode;)t.parentNode.removeChild(t)}}const c=(e,t,s)=>{if("attribute"===t.type)return new r(e,s,t.name,t.strings);if("node"===t.type)return new h(e,s,s.nextSibling);throw new Error(`Unknown part type ${t.type}`)};class u{constructor(e,t=c){this._parts=[],this.template=e,this._partCallback=t}update(e){let t=0;for(const s of this._parts)void 0===s.size?(s.setValue(e[t]),t++):(s.setValue(e,t),t+=s.size)}_clone(){const e=document.importNode(this.template.element.content,!0);if(this.template.parts.length>0){const t=document.createTreeWalker(e,5),s=this.template.parts;let n=0,i=0,o=s[0],a=t.nextNode();for(;null!=a&&i<s.length;)n===o.index?(this._parts.push(this._partCallback(this,o,a)),o=s[++i]):(n++,a=t.nextNode())}return e}}const d=Symbol("tag"),p=Symbol("needsRender"),m=Symbol("shadyTemplate"),_=e=>{window.ShadyCSS&&(void 0===e[m]&&(e[m]=document.createElement("template"),e[m].innerHTML=e.shadowRoot.innerHTML,ShadyCSS.prepareTemplate(e[m],e.localName)),ShadyCSS.styleElement(e))},f=function(e){return e.replace(/([a-z])([A-Z])|(.)([A-Z][a-z])/g,"$1$3-$2$4").toLowerCase()},v=function(e){e.$={},e.shadowRoot.querySelectorAll("[id]").forEach(t=>{e.$[t.id]=t})};class N extends HTMLElement{static get is(){return this[d]||(this[d]=f(this.name))}connectedCallback(){"template"in this&&(this.attachShadow({mode:"open"}),this.render({sync:!0}),v(this))}async render({sync:e=!1}={}){this[p]=!0,e||await 0,this[p]&&(this[p]=!1,t(this.template,this.shadowRoot),_(this))}}e.html=function(e,...t){let i=s.get(e);return void 0===i&&(i=new a(e),s.set(e,i)),new n(i,t)},e.GluonElement=N}({});