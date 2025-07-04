/*! @sashbot/uibridge v1.3.2 CJS | MIT License */
var S=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var I=Object.getOwnPropertyNames;var T=Object.prototype.hasOwnProperty;var k=(o,e)=>{for(var t in e)S(o,t,{get:e[t],enumerable:!0})},P=(o,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of I(e))!T.call(o,s)&&s!==t&&S(o,s,{get:()=>e[s],enumerable:!(n=_(e,s))||n.enumerable});return o};var $=o=>P(S({},"__esModule",{value:!0}),o);var U={};k(U,{CDIGenerator:()=>f,CommandRegistry:()=>g,SelectorEngine:()=>p,UIBridge:()=>u,clickCommand:()=>w,createUIBridge:()=>x,default:()=>H,initUIBridge:()=>E,name:()=>O,screenshotCommand:()=>v,version:()=>D});module.exports=$(U);var g=class{constructor(){this.commands=new Map}register(e,t){if(!e||typeof e!="string")throw new Error("Command name must be a non-empty string");if(!t||typeof t.execute!="function")throw new Error("Command must have an execute function");let n=["name","description","parameters"];for(let s of n)if(!t[s])throw new Error(`Command must have a ${s} property`);this.commands.set(e,{...t,registeredAt:new Date().toISOString()})}get(e){return this.commands.get(e)||null}getAll(){return Array.from(this.commands.values())}has(e){return this.commands.has(e)}unregister(e){return this.commands.delete(e)}getNames(){return Array.from(this.commands.keys())}clear(){this.commands.clear()}size(){return this.commands.size}};var p=class{constructor(){this.strategies=new Map,this._setupDefaultStrategies()}_setupDefaultStrategies(){this.strategies.set("css",e=>document.querySelector(e)),this.strategies.set("cssAll",e=>Array.from(document.querySelectorAll(e))),this.strategies.set("xpath",e=>document.evaluate(e,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue),this.strategies.set("xpathAll",e=>{let t=document.evaluate(e,document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null),n=[];for(let s=0;s<t.snapshotLength;s++)n.push(t.snapshotItem(s));return n}),this.strategies.set("text",e=>{let t=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,!1),n;for(;n=t.nextNode();)if(n.textContent.trim()===e)return n.parentElement;return null}),this.strategies.set("partialText",e=>{let t=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,!1),n;for(;n=t.nextNode();)if(n.textContent.trim().includes(e))return n.parentElement;return null}),this.strategies.set("testId",e=>document.querySelector(`[data-testid="${e}"]`)),this.strategies.set("dataTest",e=>document.querySelector(`[data-test="${e}"]`)),this.strategies.set("label",e=>{let t=document.querySelectorAll("label");for(let n of t)if(n.textContent.trim()===e){let s=n.getAttribute("for");if(s)return document.getElementById(s);let i=n.querySelector("input, select, textarea");if(i)return i}return null}),this.strategies.set("placeholder",e=>document.querySelector(`[placeholder="${e}"]`)),this.strategies.set("ariaLabel",e=>document.querySelector(`[aria-label="${e}"]`)),this.strategies.set("role",e=>document.querySelector(`[role="${e}"]`))}find(e){if(typeof e=="string")return this.strategies.get("css")(e);if(typeof e=="object"&&e!==null){let t=["xpath","text","partialText","testId","dataTest","label","placeholder","ariaLabel","role","css"];for(let n of t)if(e[n]){let s=this.strategies.get(n);if(s){let i=s(e[n]);if(i)return i}}}throw new Error(`Invalid selector: ${JSON.stringify(e)}`)}findAll(e){if(typeof e=="string")return this.strategies.get("cssAll")(e);if(typeof e=="object"&&e!==null){if(e.xpath)return this.strategies.get("xpathAll")(e.xpath);if(e.css)return this.strategies.get("cssAll")(e.css);let t=this.find(e);return t?[t]:[]}throw new Error(`Invalid selector: ${JSON.stringify(e)}`)}registerStrategy(e,t){if(typeof t!="function")throw new Error("Strategy must be a function");this.strategies.set(e,t)}isVisible(e){if(!e)return!1;let t=e.getBoundingClientRect(),n=window.getComputedStyle(e);return t.width>0&&t.height>0&&n.display!=="none"&&n.visibility!=="hidden"&&parseFloat(n.opacity)>0&&t.top<window.innerHeight&&t.bottom>0&&t.left<window.innerWidth&&t.right>0}getElementInfo(e){if(!e)return null;let t=e.getBoundingClientRect(),n=window.getComputedStyle(e);return{tag:e.tagName.toLowerCase(),id:e.id||null,classes:Array.from(e.classList),text:e.textContent?.trim().substring(0,100)||"",attributes:this._getElementAttributes(e),position:{x:t.left,y:t.top,width:t.width,height:t.height},visible:this.isVisible(e),focusable:this._isFocusable(e)}}_getElementAttributes(e){let t={};for(let n of e.attributes)t[n.name]=n.value;return t}_isFocusable(e){return["input","select","textarea","button","a"].includes(e.tagName.toLowerCase())||e.hasAttribute("tabindex")||e.hasAttribute("contenteditable")}};var f=class{constructor(e){this.registry=e,this.version="1.0.0"}generateMarkdown(){let e=this.registry.getAll(),t=new Date().toISOString(),n=`# UIBridge Commands Documentation

`;return n+=`**Generated:** ${t}  
`,n+=`**Version:** ${this.version}  
`,n+=`**Total Commands:** ${e.length}

`,n+=`## Command Summary

`,n+=`| Command | Description | Parameters |
`,n+=`|---------|-------------|------------|
`,e.forEach(s=>{let i=s.parameters.map(r=>`${r.name}${r.required?"":"?"}`).join(", ");n+=`| **${s.name}** | ${s.description} | ${i||"None"} |
`}),n+=`
## Command Details

`,e.forEach(s=>{n+=`### ${s.name}

`,n+=`${s.description}

`,s.parameters.length>0&&(n+=`**Parameters:**

`,s.parameters.forEach(i=>{let r=i.required?"**required**":"*optional*";n+=`- \`${i.name}\` (${i.type}) - ${r}  
`,n+=`  ${i.description}
`}),n+=`
`),s.examples&&s.examples.length>0&&(n+=`**Examples:**

`,s.examples.forEach(i=>{n+=`\`\`\`javascript
${i}
\`\`\`

`})),n+=`---

`}),n}generateJSON(){let e=this.registry.getAll();return{version:this.version,generated:new Date().toISOString(),commands:e.map(t=>({name:t.name,description:t.description,parameters:t.parameters,examples:t.examples||[]}))}}async saveToFile(e="markdown"){let t=e==="json"?JSON.stringify(this.generateJSON(),null,2):this.generateMarkdown(),n=new Blob([t],{type:e==="json"?"application/json":"text/markdown"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=`uibridge-commands.${e==="json"?"json":"md"}`,i.click(),URL.revokeObjectURL(s)}generateTypeScript(){let e=this.registry.getAll(),t=`// UIBridge Command Definitions
`;return t+=`// Generated: ${new Date().toISOString()}

`,e.forEach(n=>{let s=n.parameters.filter(i=>!i.required);s.length>0&&(t+=`interface ${this._capitalize(n.name)}Options {
`,s.forEach(i=>{t+=`  ${i.name}?: ${this._mapTypeToTS(i.type)}; // ${i.description}
`}),t+=`}

`)}),t+=`interface UIBridge {
`,e.forEach(n=>{let s=n.parameters.filter(a=>a.required),i=n.parameters.filter(a=>!a.required),r=`  ${n.name}(`;s.forEach((a,c)=>{c>0&&(r+=", "),r+=`${a.name}: ${this._mapTypeToTS(a.type)}`}),i.length>0&&(s.length>0&&(r+=", "),r+=`options?: ${this._capitalize(n.name)}Options`),r+=`): Promise<any>; // ${n.description}
`,t+=r}),t+=`}

`,t+=`export { UIBridge };
`,e.forEach(n=>{n.parameters.filter(i=>!i.required).length>0&&(t+=`export { ${this._capitalize(n.name)}Options };
`)}),t}generateOpenAPI(){let e=this.registry.getAll(),t={openapi:"3.0.0",info:{title:"UIBridge API",description:"In-app automation framework for web applications",version:this.version,contact:{name:"UIBridge Team"}},servers:[{url:"http://localhost:3000",description:"Local development server"}],paths:{},components:{schemas:{}}};return e.forEach(n=>{let s=`/commands/${n.name}`;t.paths[s]={post:{summary:n.description,description:n.description,requestBody:{required:!0,content:{"application/json":{schema:{type:"object",properties:this._generateJSONSchema(n.parameters),required:n.parameters.filter(i=>i.required).map(i=>i.name)}}}},responses:{200:{description:"Command executed successfully",content:{"application/json":{schema:{type:"object",properties:{success:{type:"boolean"},result:{type:"object"},timestamp:{type:"string",format:"date-time"}}}}}},400:{description:"Invalid parameters"},500:{description:"Command execution failed"}}}}}),t}getStatistics(){let e=this.registry.getAll();return{totalCommands:e.length,commandNames:e.map(t=>t.name),totalParameters:e.reduce((t,n)=>t+n.parameters.length,0),requiredParameters:e.reduce((t,n)=>t+n.parameters.filter(s=>s.required).length,0),optionalParameters:e.reduce((t,n)=>t+n.parameters.filter(s=>!s.required).length,0),commandsWithExamples:e.filter(t=>t.examples&&t.examples.length>0).length,averageParametersPerCommand:Math.round(e.reduce((t,n)=>t+n.parameters.length,0)/e.length*100)/100,lastGenerated:new Date().toISOString()}}_capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}_mapTypeToTS(e){return{string:"string",number:"number",boolean:"boolean",object:"object",array:"any[]",Selector:"string | object",ClickOptions:"object",ScreenshotOptions:"object"}[e]||"any"}_generateJSONSchema(e){let t={};return e.forEach(n=>{t[n.name]={type:this._mapTypeToJSONSchema(n.type),description:n.description},n.default!==void 0&&(t[n.name].default=n.default)}),t}_mapTypeToJSONSchema(e){return{string:"string",number:"number",boolean:"boolean",object:"object",array:"array",Selector:"string",ClickOptions:"object",ScreenshotOptions:"object"}[e]||"string"}};var y=class{constructor(e={}){this.options={position:"bottom-right",serverUrl:"http://localhost:3002",autoConnect:!0,minimized:!1,showScreenshots:!0,maxLogEntries:50,...e},this.isConnected=!1,this.commandHistory=[],this.element=null,this.isMinimized=this.options.minimized,this.wsConnection=null,this.init()}init(){this.createPanel(),this.attachStyles(),this.options.autoConnect&&this.connectToServer()}createPanel(){this.element=document.createElement("div"),this.element.className="uibridge-debug-panel",this.element.innerHTML=this.getHTML(),this.element.style.position="fixed",this.element.style.zIndex="999999",this.setPosition(),this.attachEventListeners(),document.body.appendChild(this.element),this.updateConnectionStatus()}getHTML(){return`
      <div class="debug-panel-header">
        <div class="panel-title">
          <span class="uibridge-logo">\u{1F309}</span>
          <span>UIBridge Debug</span>
          <span class="connection-status ${this.isConnected?"connected":"disconnected"}">
            ${this.isConnected?"\u{1F7E2}":"\u{1F534}"}
          </span>
        </div>
        <div class="panel-controls">
          <button class="minimize-btn" title="${this.isMinimized?"Expand":"Minimize"}">
            ${this.isMinimized?"\u2B06\uFE0F":"\u2B07\uFE0F"}
          </button>
          <button class="close-btn" title="Close">\u274C</button>
        </div>
      </div>
      
      <div class="debug-panel-content" style="display: ${this.isMinimized?"none":"block"}">
        <div class="server-controls">
          <button class="connect-btn">${this.isConnected?"Disconnect":"Connect"}</button>
          <input type="text" class="server-url" value="${this.options.serverUrl}" placeholder="Server URL">
        </div>
        
        <div class="activity-section">
          <h4>\u{1F4CA} Live Activity</h4>
          <div class="command-log"></div>
        </div>
        
        <div class="screenshot-section" style="display: ${this.options.showScreenshots?"block":"none"}">
          <h4>\u{1F4F8} Latest Screenshot</h4>
          <div class="screenshot-preview">
            <div class="no-screenshot">No screenshot yet</div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">Commands:</span>
            <span class="stat-value" id="command-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Success:</span>
            <span class="stat-value success" id="success-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Errors:</span>
            <span class="stat-value error" id="error-count">0</span>
          </div>
        </div>
      </div>
    `}attachStyles(){if(document.getElementById("uibridge-debug-styles"))return;let e=document.createElement("style");e.id="uibridge-debug-styles",e.textContent=`
      .uibridge-debug-panel {
        width: 320px;
        max-height: 500px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
        font-size: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }
      
      .debug-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: move;
      }
      
      .panel-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      
      .uibridge-logo {
        font-size: 16px;
      }
      
      .connection-status {
        font-size: 10px;
      }
      
      .panel-controls {
        display: flex;
        gap: 4px;
      }
      
      .panel-controls button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        font-size: 10px;
      }
      
      .panel-controls button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .debug-panel-content {
        padding: 12px;
        max-height: 420px;
        overflow-y: auto;
      }
      
      .server-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .connect-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
      }
      
      .connect-btn:hover {
        background: #45a049;
      }
      
      .connect-btn.disconnect {
        background: #f44336;
      }
      
      .server-url {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 6px 8px;
        border-radius: 4px;
        font-size: 11px;
      }
      
      .activity-section h4,
      .screenshot-section h4,
      .stats-section h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #ccc;
      }
      
      .command-log {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        max-height: 120px;
        overflow-y: auto;
        margin-bottom: 12px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
      }
      
      .log-entry {
        margin-bottom: 4px;
        padding: 2px 4px;
        border-radius: 2px;
      }
      
      .log-entry.success {
        background: rgba(76, 175, 80, 0.2);
      }
      
      .log-entry.error {
        background: rgba(244, 67, 54, 0.2);
      }
      
      .log-entry.info {
        background: rgba(33, 150, 243, 0.2);
      }
      
      .log-timestamp {
        color: #888;
        font-size: 9px;
      }
      
      .screenshot-preview {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        text-align: center;
        margin-bottom: 12px;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .screenshot-preview img {
        max-width: 100%;
        max-height: 80px;
        border-radius: 4px;
      }
      
      .no-screenshot {
        color: #666;
        font-size: 10px;
      }
      
      .stats-section {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      
      .stat-item {
        flex: 1;
        text-align: center;
        padding: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      
      .stat-label {
        display: block;
        font-size: 9px;
        color: #aaa;
        margin-bottom: 2px;
      }
      
      .stat-value {
        display: block;
        font-size: 14px;
        font-weight: 600;
      }
      
      .stat-value.success {
        color: #4CAF50;
      }
      
      .stat-value.error {
        color: #f44336;
      }
      
      /* Position classes */
      .uibridge-debug-panel.top-left {
        top: 20px;
        left: 20px;
      }
      
      .uibridge-debug-panel.top-right {
        top: 20px;
        right: 20px;
      }
      
      .uibridge-debug-panel.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .uibridge-debug-panel.bottom-right {
        bottom: 20px;
        right: 20px;
      }
    `,document.head.appendChild(e)}setPosition(){this.element.className=`uibridge-debug-panel ${this.options.position}`}attachEventListeners(){this.element.querySelector(".minimize-btn").addEventListener("click",()=>this.toggleMinimize()),this.element.querySelector(".close-btn").addEventListener("click",()=>this.destroy()),this.element.querySelector(".connect-btn").addEventListener("click",()=>this.toggleConnection()),this.element.querySelector(".server-url").addEventListener("change",i=>{this.options.serverUrl=i.target.value}),this.makeDraggable()}makeDraggable(){let e=this.element.querySelector(".debug-panel-header"),t=!1,n=0,s=0,i=0,r=0;e.addEventListener("mousedown",a=>{t=!0,i=a.clientX-n,r=a.clientY-s}),document.addEventListener("mousemove",a=>{t&&(a.preventDefault(),n=a.clientX-i,s=a.clientY-r,this.element.style.transform=`translate(${n}px, ${s}px)`)}),document.addEventListener("mouseup",()=>{t=!1})}toggleMinimize(){this.isMinimized=!this.isMinimized;let e=this.element.querySelector(".debug-panel-content"),t=this.element.querySelector(".minimize-btn");e.style.display=this.isMinimized?"none":"block",t.textContent=this.isMinimized?"\u2B06\uFE0F":"\u2B07\uFE0F",t.title=this.isMinimized?"Expand":"Minimize"}async connectToServer(){try{if((await fetch(`${this.options.serverUrl}/health`)).ok)this.isConnected=!0,this.logActivity("Connected to UIBridge server","success"),this.startPolling();else throw new Error("Server not responding")}catch(e){this.isConnected=!1,this.logActivity(`Connection failed: ${e.message}`,"error")}this.updateConnectionStatus()}disconnectFromServer(){this.isConnected=!1,this.pollingInterval&&clearInterval(this.pollingInterval),this.logActivity("Disconnected from server","info"),this.updateConnectionStatus()}toggleConnection(){this.isConnected?this.disconnectFromServer():this.connectToServer()}startPolling(){this.pollingInterval=setInterval(async()=>{try{let e=await fetch(`${this.options.serverUrl}/activity`);if(e.ok){let t=await e.json();t.commands&&t.commands.length>0&&this.handleNewCommands(t.commands)}}catch{}},500)}handleNewCommands(e){e.forEach(t=>{!this.commandHistory.find(s=>s.id===t.id)&&(this.logActivity(`${t.command.toUpperCase()}: ${t.selector||"page"}`,t.success?"success":"error"),t.screenshot&&this.updateScreenshot(t.screenshot),this.commandHistory.push(t))}),this.updateStats()}updateConnectionStatus(){let e=this.element.querySelector(".connection-status"),t=this.element.querySelector(".connect-btn");e.textContent=this.isConnected?"\u{1F7E2}":"\u{1F534}",e.className=`connection-status ${this.isConnected?"connected":"disconnected"}`,t.textContent=this.isConnected?"Disconnect":"Connect",t.className=this.isConnected?"connect-btn disconnect":"connect-btn"}logActivity(e,t="info"){let n=new Date().toLocaleTimeString(),s={timestamp:n,message:e,type:t,time:Date.now()},i=this.element.querySelector(".command-log"),r=document.createElement("div");for(r.className=`log-entry ${t}`,r.innerHTML=`
      <span class="log-timestamp">${n}</span>
      ${e}
    `,i.appendChild(r),i.scrollTop=i.scrollHeight;i.children.length>this.options.maxLogEntries;)i.removeChild(i.firstChild)}updateScreenshot(e){if(!this.options.showScreenshots)return;let t=this.element.querySelector(".screenshot-preview");t.innerHTML=`<img src="${e}" alt="Latest screenshot" />`}updateStats(){let e=this.commandHistory.length,t=this.commandHistory.filter(s=>s.success).length,n=this.commandHistory.filter(s=>!s.success).length;this.element.querySelector("#command-count").textContent=e,this.element.querySelector("#success-count").textContent=t,this.element.querySelector("#error-count").textContent=n}destroy(){this.pollingInterval&&clearInterval(this.pollingInterval),this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element);let e=document.getElementById("uibridge-debug-styles");e&&e.remove()}show(){this.element.style.display="block"}hide(){this.element.style.display="none"}setDebugPanelPosition(e){this.options.position=e,this.setPosition()}};var w={name:"click",description:"Clicks on an element using synthetic mouse events",examples:["execute('click', '#submit-button')","execute('click', { text: 'Submit' })","execute('click', { testId: 'login-btn' })","execute('click', '#button', { position: 'center', clickCount: 2 })"],parameters:[{name:"selector",type:"Selector",required:!0,description:"Element to click (string, CSS selector, or selector object)"},{name:"options",type:"ClickOptions",required:!1,description:"Click options: { force?, position?, button?, clickCount?, delay? }"}],async execute(o,e,t={}){let n=o.findElement(e);if(!n)throw new Error(`Element not found: ${JSON.stringify(e)}`);let s={force:!1,position:"center",button:"left",clickCount:1,delay:0,scrollIntoView:!0,...t};if(o._log(`Clicking element: ${o.selectorEngine.getElementInfo(n)?.tag||"unknown"}`),s.scrollIntoView&&(n.scrollIntoView({behavior:"smooth",block:"center"}),await new Promise(c=>setTimeout(c,100))),!s.force&&!o.selectorEngine.isVisible(n))throw new Error("Element is not visible. Use { force: true } to click anyway.");if(!s.force&&!this._isElementActionable(n))throw new Error("Element is covered by another element. Use { force: true } to click anyway.");let i=n.getBoundingClientRect(),r=this._calculatePosition(i,s.position),a={bubbles:!0,cancelable:!0,view:window,clientX:r.x,clientY:r.y,button:this._getButtonCode(s.button),buttons:this._getButtonsCode(s.button),detail:s.clickCount};try{n.dispatchEvent(new MouseEvent("mouseover",a)),n.dispatchEvent(new MouseEvent("mouseenter",a)),n.dispatchEvent(new MouseEvent("mousedown",a)),s.delay>0&&await new Promise(c=>setTimeout(c,s.delay)),n.dispatchEvent(new MouseEvent("mouseup",a));for(let c=0;c<s.clickCount;c++)c>0&&await new Promise(l=>setTimeout(l,50)),n.dispatchEvent(new MouseEvent("click",{...a,detail:c+1}));o.selectorEngine._isFocusable(n)&&n.focus(),await this._handleSpecialElements(n,s)}catch(c){throw new Error(`Failed to click element: ${c.message}`)}return{success:!0,element:o.selectorEngine.getElementInfo(n),position:r,timestamp:new Date().toISOString()}},_isElementActionable(o){let e=o.getBoundingClientRect(),t=e.left+e.width/2,n=e.top+e.height/2,s=document.elementFromPoint(t,n);return o===s||o.contains(s)},_calculatePosition(o,e){let t={center:{x:o.left+o.width/2,y:o.top+o.height/2},topLeft:{x:o.left+1,y:o.top+1},topRight:{x:o.right-1,y:o.top+1},bottomLeft:{x:o.left+1,y:o.bottom-1},bottomRight:{x:o.right-1,y:o.bottom-1},topCenter:{x:o.left+o.width/2,y:o.top+1},bottomCenter:{x:o.left+o.width/2,y:o.bottom-1},leftCenter:{x:o.left+1,y:o.top+o.height/2},rightCenter:{x:o.right-1,y:o.top+o.height/2}};return t[e]||t.center},_getButtonCode(o){return{left:0,middle:1,right:2}[o]||0},_getButtonsCode(o){return{left:1,middle:4,right:2}[o]||1},async _handleSpecialElements(o,e){let t=o.tagName.toLowerCase(),n=o.type?.toLowerCase();t==="button"&&o.type==="submit"&&o.closest("form")||t==="input"&&(n==="checkbox"||n==="radio")||(t==="select"&&setTimeout(()=>{o.dispatchEvent(new Event("change",{bubbles:!0}))},10),t==="a"&&o.href)}};var v={name:"screenshot",description:"Takes a screenshot of the page or a specific element",examples:["execute('screenshot')","execute('screenshot', { format: 'png', quality: 0.9 })","execute('screenshot', { selector: '#main-content' })","execute('screenshot', { fullPage: true, saveConfig: { autoSave: true, folder: 'tests' } })"],parameters:[{name:"options",type:"ScreenshotOptions",required:!1,description:"Screenshot options: { selector?, format?, quality?, fullPage?, saveConfig? }"}],async execute(o,e={}){console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Starting screenshot command execution"),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Raw options received:",JSON.stringify(e,null,2)),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Bridge config:",JSON.stringify(o.config.defaultScreenshotConfig,null,2));let t={selector:null,format:"png",quality:.92,fullPage:!1,excludeSelectors:[],backgroundColor:"auto",scale:window.devicePixelRatio||1,saveConfig:{...o.config.defaultScreenshotConfig,...e.saveConfig},...e};console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Final processed options:",JSON.stringify(t,null,2)),o._log("Taking screenshot with options:",t);let n=document.body;if(t.selector&&(n=o.findElement(t.selector),!n))throw new Error(`Element not found for screenshot: ${JSON.stringify(t.selector)}`);try{console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Target element:",n?.tagName,n?.id,n?.className),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Target element dimensions:",{width:n?.offsetWidth,height:n?.offsetHeight,scrollWidth:n?.scrollWidth,scrollHeight:n?.scrollHeight});let s=t.backgroundColor;t.backgroundColor==="auto"&&(s=this._detectBackgroundColor(n),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Auto-detected background color:",s)),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Loading html2canvas...");try{await this._ensureHtml2Canvas(),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded:",!!window.html2canvas)}catch(h){throw console.error("\u{1F5BC}\uFE0F [SCREENSHOT] Failed to load html2canvas:",h.message),new Error(`Failed to load html2canvas library: ${h.message}. Please ensure you have internet connectivity or consider using a different screenshot method.`)}let i=this._hideElements(t.excludeSelectors),r={useCORS:!0,allowTaint:!1,backgroundColor:s,scale:t.scale,logging:!0,width:t.fullPage?document.documentElement.scrollWidth:void 0,height:t.fullPage?document.documentElement.scrollHeight:void 0,windowWidth:t.fullPage?document.documentElement.scrollWidth:void 0,windowHeight:t.fullPage?document.documentElement.scrollHeight:void 0,x:t.fullPage?0:void 0,y:t.fullPage?0:void 0,foreignObjectRendering:!0,imageTimeout:15e3,removeContainer:!0};console.log("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas options:",JSON.stringify(r,null,2)),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Starting html2canvas capture...");let a=await Promise.race([window.html2canvas(n,r),new Promise((h,b)=>setTimeout(()=>b(new Error("Screenshot capture timed out after 30 seconds")),3e4))]);console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Canvas created:",{width:a.width,height:a.height,hasData:a.getContext("2d").getImageData(0,0,1,1).data.some(h=>h!==0)}),this._restoreElements(i);let c=`image/${t.format}`;console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Converting to format:",c,"quality:",t.quality);let l=a.toDataURL(c,t.quality);console.log("\u{1F5BC}\uFE0F [SCREENSHOT] DataURL created, length:",l.length,"starts with:",l.substring(0,50));let d=this._generateFileName(t);console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Generated filename:",d),t.saveConfig.autoSave?(console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Auto-save enabled, saving..."),await this._saveScreenshot(l,d,t.saveConfig),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Save completed")):console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Auto-save disabled");let m={success:!0,dataUrl:l,width:a.width,height:a.height,format:t.format,fileName:d,filePath:t.saveConfig.folder?`${t.saveConfig.folder}/${d}`:d,size:Math.round(l.length*.75),timestamp:new Date().toISOString(),saveConfig:t.saveConfig};return t.selector&&(m.element=o.selectorEngine.getElementInfo(n),t.saveConfig.includeMetadata&&(m.metadata={selector:t.selector,element:m.element,viewport:{width:window.innerWidth,height:window.innerHeight},userAgent:navigator.userAgent,timestamp:m.timestamp})),o._log(`Screenshot captured: ${m.width}x${m.height}, ${m.size} bytes, saved as: ${m.filePath}`),m}catch(s){throw new Error(`Failed to take screenshot: ${s.message}`)}},_generateFileName(o){let e=o.saveConfig;if(e.customName)return this._ensureExtension(e.customName,o.format);let t=e.prefix||"screenshot";if(e.includeMetadata){if(o.selector){let n=typeof o.selector=="string"?o.selector.replace(/[#.]/g,"").substring(0,20):"element";t+=`_${n}`}o.fullPage&&(t+="_fullpage"),t+=`_${o.width||"auto"}x${o.height||"auto"}`}if(e.timestamp){let n=new Date().toISOString().replace(/[:.]/g,"-").replace("T","_").substring(0,19);t+=`_${n}`}return this._ensureExtension(t,o.format)},_ensureExtension(o,e){let t=e==="jpeg"?"jpg":e;return o.toLowerCase().endsWith(`.${t}`)?o:`${o}.${t}`},async _saveScreenshot(o,e,t){try{await this._downloadImage(o,e),t.serverEndpoint&&await this._saveToServer(o,e,t),t.persistInBrowser&&await this._saveToIndexedDB(o,e,t)}catch(n){throw console.warn("Failed to save screenshot:",n),new Error(`Screenshot save failed: ${n.message}`)}},async _saveToServer(o,e,t){if(t.serverEndpoint)try{let n=await fetch(t.serverEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:e,folder:t.folder,dataUrl:o,timestamp:new Date().toISOString()})});if(!n.ok)throw new Error(`Server save failed: ${n.status} ${n.statusText}`);console.log(`Screenshot saved to server: ${e}`)}catch(n){throw console.error("Server save error:",n),n}},async _saveToIndexedDB(o,e,t){return new Promise((n,s)=>{let i="UIBridgeScreenshots",r="screenshots",a=indexedDB.open(i,1);a.onerror=()=>s(new Error("IndexedDB open failed")),a.onupgradeneeded=c=>{let l=c.target.result;if(!l.objectStoreNames.contains(r)){let d=l.createObjectStore(r,{keyPath:"id",autoIncrement:!0});d.createIndex("fileName","fileName",{unique:!1}),d.createIndex("timestamp","timestamp",{unique:!1})}},a.onsuccess=c=>{let m=c.target.result.transaction([r],"readwrite").objectStore(r),h={fileName:e,folder:t.folder,dataUrl:o,timestamp:new Date().toISOString(),size:Math.round(o.length*.75)},b=m.add(h);b.onsuccess=()=>{console.log(`Screenshot saved to IndexedDB: ${e}`),n()},b.onerror=()=>{s(new Error("IndexedDB save failed"))}}})},async _ensureHtml2Canvas(){if(!window.html2canvas)return new Promise((o,e)=>{let t=["https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js","https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js","https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js","https://unpkg.com/html2canvas@latest/dist/html2canvas.min.js"],n=0,s=()=>{if(n>=t.length){e(new Error("Failed to load html2canvas from all CDN sources. Please check your internet connection or consider using a different screenshot method."));return}let i=document.createElement("script");i.src=t[n],i.crossOrigin="anonymous",i.async=!0,i.src.includes("cdnjs.cloudflare.com")&&(i.integrity="sha512-UHwkWYKZYKtkT6k7iF4FITLJAVkI/J1iOtLwSbwUXf/R+0P+WFbHFvdPRyZOmJIa3V1p8Yj8FxkgnyFb1m4qw=="),i.onload=()=>{setTimeout(()=>{if(window.html2canvas&&typeof window.html2canvas=="function")try{let l=document.createElement("div");l.style.position="absolute",l.style.left="-9999px",l.style.width="1px",l.style.height="1px",document.body.appendChild(l),window.html2canvas(l,{width:1,height:1}).then(()=>{document.body.removeChild(l),console.log("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded and validated successfully from:",t[n]),o()}).catch(()=>{document.body.removeChild(l),console.warn("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded but failed validation test, trying next source..."),n++,s()})}catch{console.warn("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded but failed basic test, trying next source..."),n++,s()}else console.warn("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded but not functional, trying next source..."),n++,s()},200)},i.onerror=()=>{console.warn("\u{1F5BC}\uFE0F [SCREENSHOT] Failed to load html2canvas from:",t[n]),n++,s()};let r=i.onload,a=setTimeout(()=>{console.warn("\u{1F5BC}\uFE0F [SCREENSHOT] Timeout loading html2canvas from:",t[n]),n++,s()},1e4);i.onload=()=>{clearTimeout(a),r()};let c=document.querySelector(`script[src="${t[n]}"]`);if(c){window.html2canvas&&typeof window.html2canvas=="function"?o():(c.onload=i.onload,c.onerror=i.onerror);return}document.head.appendChild(i)};s()})},_hideElements(o){let e=[];for(let t of o)try{let n=document.querySelectorAll(t);for(let s of n){let i=s.style.display;s.style.display="none",e.push({element:s,originalDisplay:i})}}catch(n){console.warn(`Invalid selector for hiding: ${t}`,n)}return e},_restoreElements(o){for(let{element:e,originalDisplay:t}of o)e.style.display=t},_downloadImage(o,e){try{let t=document.createElement("a");t.download=e,t.href=o,document.body.appendChild(t),t.click(),document.body.removeChild(t)}catch(t){console.warn("Failed to auto-download screenshot:",t)}},_detectBackgroundColor(o){let e=o;for(;e&&e!==document.documentElement;){let i=getComputedStyle(e).backgroundColor;if(i&&i!=="rgba(0, 0, 0, 0)"&&i!=="transparent")return console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Found background color:",i,"on element:",e.tagName),i;e=e.parentElement}let t=getComputedStyle(document.body);if(t.backgroundColor&&t.backgroundColor!=="rgba(0, 0, 0, 0)"&&t.backgroundColor!=="transparent")return console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Using body background color:",t.backgroundColor),t.backgroundColor;let n=getComputedStyle(document.documentElement);return n.backgroundColor&&n.backgroundColor!=="rgba(0, 0, 0, 0)"&&n.backgroundColor!=="transparent"?(console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Using html background color:",n.backgroundColor),n.backgroundColor):(console.log("\u{1F5BC}\uFE0F [SCREENSHOT] No background color found, defaulting to white"),"#ffffff")}};var C={name:"help",description:"Get help information about UIBridge commands and usage patterns for AI automation",examples:["execute('help')","execute('help', 'click')","execute('help', 'screenshot')","execute('--help')"],parameters:[{name:"commandName",type:"string",required:!1,description:"Specific command to get help for (optional)"}],async execute(o,e=null){return o.getHelp(e)}};var u=class o{constructor(e={}){this.config={debug:!1,allowedOrigins:["*"],commands:["click","screenshot","help"],generateCDI:!0,enableHttpDiscovery:!1,autoInit:!0,version:"1.3.2",enableRemoteControl:!1,serverUrl:"http://localhost:3002",pollInterval:500,autoStartPolling:!0,showDebugPanel:!1,debugPanelOptions:{position:"bottom-right",minimized:!1,showScreenshots:!0,autoConnect:!0},defaultScreenshotConfig:{autoSave:!1,folder:"uibridge-screenshots",prefix:"screenshot",timestamp:!0,includeMetadata:!1,persistInBrowser:!1,serverEndpoint:null,...e.defaultScreenshotConfig},...e},this.registry=new g,this.selectorEngine=new p,this.cdiGenerator=null,this.debugPanel=null,this._isInitialized=!1,this._initStartTime=null,this._commandHistory=[],this._isPolling=!1,this._pollTimeoutId=null,this.config.autoInit&&typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.init()):setTimeout(()=>this.init(),0))}async init(){if(this._isInitialized){this._log("UIBridge already initialized");return}this._initStartTime=typeof performance<"u"?performance.now():Date.now(),this._log("Initializing UIBridge...",this.config);try{await this._registerCoreCommands(),this.cdiGenerator=new f(this.registry),this._setupDiscovery(),this._setupGlobalAPI(),this._isInitialized=!0;let e=(typeof performance<"u"?performance.now():Date.now())-this._initStartTime;this._log(`UIBridge initialized successfully in ${e.toFixed(2)}ms`,{commands:this.registry.getNames(),version:this.config.version}),this.config.generateCDI&&this._generateCDI(),this.config.enableRemoteControl&&this.config.autoStartPolling&&this.startRemoteControl(),this.config.showDebugPanel&&typeof window<"u"&&this._initDebugPanel(),this._dispatchEvent("uibridge:initialized",{version:this.config.version,commands:this.registry.getNames(),initTime:e,remoteControlEnabled:this.config.enableRemoteControl,debugPanelEnabled:this.config.showDebugPanel})}catch(e){throw this._log("Failed to initialize UIBridge:",e),new Error(`UIBridge initialization failed: ${e.message}`)}}async execute(e,...t){if(e==="help"||e==="--help")return this.getHelp(t[0]);if(!this._isInitialized)throw new Error("UIBridge not initialized. Call init() first.");let n=this.registry.get(e);if(!n){let r=this.registry.getAll().map(a=>a.name).join(", ");throw new Error(`Unknown command: ${e}. Available commands: ${r}. Use 'help' for detailed information.`)}let s=typeof performance<"u"?performance.now():Date.now(),i=this._generateExecutionId();this._log(`Executing command: ${e}`,{args:t,executionId:i});try{let r={id:i,command:e,args:t,startTime:new Date().toISOString(),status:"running"};this._commandHistory.push(r);let a=await n.execute(this,...t),l=(typeof performance<"u"?performance.now():Date.now())-s;r.status="completed",r.duration=l,r.result=a,r.endTime=new Date().toISOString(),this._log(`Command completed: ${e} (${l.toFixed(2)}ms)`,a),this._dispatchEvent("uibridge:command",{command:e,args:t,result:a,duration:l,executionId:i});let d={...a,command:e,duration:l,timestamp:new Date().toISOString()};return this._addToHistory({command:e,args:t,result:d,duration:l,timestamp:new Date().toISOString(),status:"completed"}),d}catch(r){let c=(typeof performance<"u"?performance.now():Date.now())-s,l=this._commandHistory[this._commandHistory.length-1];throw l&&l.id===i&&(l.status="failed",l.error=r.message,l.duration=c,l.endTime=new Date().toISOString()),this._log(`Command failed: ${e} (${c.toFixed(2)}ms)`,r),this._dispatchEvent("uibridge:error",{command:e,args:t,error:r.message,duration:c,executionId:i}),this._addToHistory({command:e,args:t,error:r.message,duration:c,timestamp:new Date().toISOString(),status:"failed"}),r}}findElement(e){return this.selectorEngine.find(e)}findElements(e){return this.selectorEngine.findAll(e)}discover(){return this.registry.getAll().map(e=>({name:e.name,description:e.description,parameters:e.parameters,examples:e.examples||[]}))}getHistory(e=50){return this._commandHistory.slice(-e)}clearHistory(){this._commandHistory=[],this._log("Command history cleared")}getStatus(){return{initialized:this._isInitialized,version:this.config.version,commands:this.registry.getNames(),commandCount:this.registry.size(),historyLength:this._commandHistory.length,config:{...this.config},uptime:this._initStartTime?(typeof performance<"u"?performance.now():Date.now())-this._initStartTime:0}}registerCommand(e,t){this.registry.register(e,t),this._log(`Custom command registered: ${e}`),this.cdiGenerator&&this._generateCDI()}unregisterCommand(e){let t=this.registry.unregister(e);return t&&(this._log(`Command unregistered: ${e}`),this.cdiGenerator&&this._generateCDI()),t}configureScreenshots(e){this.config.defaultScreenshotConfig={...this.config.defaultScreenshotConfig,...e},this._log("Screenshot configuration updated:",this.config.defaultScreenshotConfig)}getScreenshotConfig(){return{...this.config.defaultScreenshotConfig}}async _registerCoreCommands(){let e=[{name:"click",implementation:w},{name:"screenshot",implementation:v},{name:"help",implementation:C}];for(let{name:t,implementation:n}of e)this.config.commands.includes(t)&&(this.registry.register(t,n),this._log(`Registered core command: ${t}`))}_setupDiscovery(){this.config.enableHttpDiscovery&&(window.__uibridge_discovery__=()=>this.discover(),window.__uibridge_status__=()=>this.getStatus(),this._log("HTTP discovery endpoints enabled"))}_setupGlobalAPI(){window.UIBridge=o,window.uibridge=this,window.__uibridge__={execute:this.execute.bind(this),discover:this.discover.bind(this),findElement:this.findElement.bind(this),findElements:this.findElements.bind(this),getStatus:this.getStatus.bind(this),getHistory:this.getHistory.bind(this)},this._log("Global APIs exposed")}_generateCDI(){if(this.cdiGenerator)try{this.config.debug&&(console.log("=== UIBridge Command Discovery Interface ==="),console.log(this.cdiGenerator.generateMarkdown()),console.log("=== End CDI ===")),window.__uibridge_cdi__={markdown:()=>this.cdiGenerator.generateMarkdown(),json:()=>this.cdiGenerator.generateJSON(),save:e=>this.cdiGenerator.saveToFile(e)}}catch(e){this._log("Failed to generate CDI:",e)}}_generateExecutionId(){return`exec_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}_dispatchEvent(e,t){if(typeof window<"u"&&window.dispatchEvent){let n=new CustomEvent(e,{detail:t});window.dispatchEvent(n)}}_log(...e){this.config.debug&&console.log("[UIBridge]",...e)}getHelp(e=null){if(e){let n=this.registry.get(e);if(!n){let s=this.registry.getAll().map(i=>i.name).join(", ");return{error:`Unknown command: ${e}`,availableCommands:s,suggestion:"Use 'help' without arguments to see all commands",aiGuidance:`AI Agents: Use execute('help') to discover available commands or check spelling of '${e}'`}}return{command:n.name,description:n.description,parameters:n.parameters,examples:n.examples||[],usage:this._generateUsage(n),aiTips:this._getAITipsForCommand(n.name)}}let t=this.registry.getAll();return{framework:"UIBridge",version:this.config.version||"1.0.0",description:"In-app automation framework for web applications - designed for AI agent control",aiQuickStart:{step1:"Execute commands using: await uibridge.execute('commandName', ...args)",step2:"Find elements using selectors: CSS, text content, test IDs, XPath",step3:"Handle errors with try/catch blocks",step4:"Use await for all commands as they return promises"},commands:t.map(n=>({name:n.name,description:n.description,parameters:n.parameters.length,usage:this._generateUsage(n),aiUseCase:this._getAIUseCase(n.name)})),automationPatterns:{"Click any button":{pattern:"execute('click', selector)",examples:["execute('click', '#submit')","execute('click', { text: 'Submit' })","execute('click', { testId: 'submit-btn' })"],aiTip:"Try multiple selector strategies if one fails"},"Take screenshots":{pattern:"execute('screenshot', options)",examples:["execute('screenshot', { fullPage: true })","execute('screenshot', { selector: '#content' })","execute('screenshot', { saveConfig: { autoSave: true } })"],aiTip:"Screenshots are useful for verification and debugging"},"Discover available actions":{pattern:"discover() or execute('help')",examples:["const commands = uibridge.discover()","const help = await uibridge.execute('help')"],aiTip:"Use this to understand what actions are available"}},selectorStrategies:{priority:"Try strategies in this order for best results",strategies:{1:{method:"Test ID",syntax:"{ testId: 'element-id' }",reliability:"highest"},2:{method:"CSS ID",syntax:"'#element-id'",reliability:"high"},3:{method:"CSS Class",syntax:"'.class-name'",reliability:"medium"},4:{method:"Text Content",syntax:"{ text: 'Button Text' }",reliability:"medium"},5:{method:"Aria Label",syntax:"{ ariaLabel: 'Button Label' }",reliability:"medium"},6:{method:"XPath",syntax:`{ xpath: '//button[text()="Submit"]' }`,reliability:"advanced"}}},aiBestPractices:["Always use await when executing commands","Wrap commands in try/catch blocks for error handling","Use specific selectors (ID, testId) when possible","Take screenshots to verify actions completed successfully","Use help('commandName') to understand specific command options","Check element existence before interaction","Wait for dynamic content to load before acting"],errorHandling:{"Element not found":{solution:"Try different selector strategies or wait for element to appear",code:"try { await execute('click', '#btn'); } catch(e) { await execute('click', {text: 'Submit'}); }"},"Command failed":{solution:"Check command syntax and parameters",code:"const help = await execute('help', 'click'); console.log(help.usage);"},"Screenshot failed":{solution:"Ensure element is visible and page is loaded",code:"await execute('screenshot', { selector: 'body', fullPage: true });"}},workflowPatterns:{"Form submission":["1. Find and fill input fields","2. Click submit button","3. Take screenshot to verify","Example: execute('click', { text: 'Submit' })"],"Navigation and verification":["1. Take screenshot of current state","2. Click navigation element","3. Wait for page load","4. Take screenshot to verify navigation"],"Content interaction":["1. Find target element using multiple selector strategies","2. Execute action (click, screenshot, etc.)","3. Verify result with screenshot or status check"]},powershellPatterns:{"Basic Click Command":{description:"Execute click action via PowerShell REST API",code:`$params = @{
    Uri = 'http://localhost:3001/execute-command'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = 'click'
        selector = '#submit-button'
    } | ConvertTo-Json
}
$response = Invoke-RestMethod @params`},"Screenshot with Auto-Save":{description:"Take screenshot and save automatically",code:`$params = @{
    Uri = 'http://localhost:3001/execute-command'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = 'screenshot'
        options = @{
            fullPage = $true
            saveConfig = @{
                autoSave = $true
                folder = 'ai-automation'
                timestamp = $true
            }
        }
    } | ConvertTo-Json -Depth 4
}
$response = Invoke-RestMethod @params`},"Reusable Function":{description:"Create reusable PowerShell function for UIBridge commands",code:`function Invoke-UIBridgeCommand {
    param([string]$Command, [hashtable]$Parameters = @{})
    
    $params = @{
        Uri = 'http://localhost:3001/execute-command'
        Method = 'POST'
        Headers = @{ 'Content-Type' = 'application/json' }
        Body = (@{ command = $Command } + $Parameters) | ConvertTo-Json -Depth 4
    }
    
    try {
        return Invoke-RestMethod @params
    } catch {
        Write-Error "UIBridge command failed: $_"
        throw
    }
}

# Usage:
Invoke-UIBridgeCommand -Command 'click' -Parameters @{selector='#btn'}`}},restApiInfo:{server:"Start with: node server-example.cjs",baseUrl:"http://localhost:3001",endpoints:{executeCommand:"POST /execute-command",getStatus:"GET /status",getHelp:"GET /discover-commands"},powershellTips:["Always use Invoke-RestMethod with hashtable splatting","Include proper error handling with try/catch blocks","Use ConvertTo-Json -Depth 4 for nested objects","Store common configuration in reusable variables"]}}}_getAITipsForCommand(e){return{click:["Try multiple selector strategies if element not found","Use force: true option if element is covered","Consider scroll behavior - element might be off-screen","PowerShell API: Use selector parameter in request body"],screenshot:["Use fullPage: true for complete page capture","Specify selector for element-specific screenshots","Set saveConfig for automatic file saving","PowerShell API: Use -Depth 4 with ConvertTo-Json for nested options"],help:["Use without arguments for full command list","Specify command name for detailed help","Check usage examples for proper syntax","PowerShell API: Available at GET /discover-commands endpoint"]}[e]||["Execute with proper await syntax","Handle errors with try/catch"]}_getAIUseCase(e){return{click:"Interact with buttons, links, form elements, and any clickable UI component",screenshot:"Capture visual state for verification, debugging, or documentation",help:"Discover available commands and learn proper usage syntax"}[e]||"General automation command"}_generateUsage(e){let t=e.parameters.map(n=>n.required?n.name:`[${n.name}]`).join(", ");return`execute('${e.name}'${t?", "+t:""})`}_addToHistory(e){this._commandHistory||(this._commandHistory=[]),this._commandHistory.unshift(e),this._commandHistory.length>50&&(this._commandHistory=this._commandHistory.slice(0,50))}startRemoteControl(){if(this._isPolling){this._log("Remote control already running");return}if(typeof window>"u"){this._log("Remote control not available in non-browser environment");return}this._isPolling=!0,this._log(`Starting remote control polling: ${this.config.serverUrl}`),window.uibridge=this,this._pollForCommands()}stopRemoteControl(){this._isPolling&&(this._isPolling=!1,this._pollTimeoutId&&(clearTimeout(this._pollTimeoutId),this._pollTimeoutId=null),this._log("Remote control polling stopped"))}async _pollForCommands(){if(this._isPolling){try{let e=await fetch(`${this.config.serverUrl}/pending-commands`,{method:"GET",headers:{Accept:"application/json"}});if(e.ok){let t=await e.json();if(t.success&&t.commands&&t.commands.length>0){this._log(`Received ${t.commands.length} command(s) from server`);for(let n of t.commands)await this._executeRemoteCommand(n)}}}catch(e){this.config.debug&&this._log("Poll failed (server may not be running):",e.message)}this._isPolling&&(this._pollTimeoutId=setTimeout(()=>{this._pollForCommands()},this.config.pollInterval))}}async _executeRemoteCommand(e){let{id:t,command:n,selector:s,options:i}=e;this._log(`Executing remote command: ${n}`,{id:t,selector:s,options:i});try{let r;if(n==="click")r=await this.execute("click",s,i);else if(n==="screenshot")r=await this.execute("screenshot",i);else{let a=[];s!==void 0&&a.push(s),i!==void 0&&a.push(i),r=await this.execute(n,...a)}await this._sendCommandResult(t,{success:!0,result:r}),this._log(`Remote command ${n} executed successfully`,r)}catch(r){this._log(`Remote command ${n} failed:`,r),await this._sendCommandResult(t,{success:!1,error:r.message})}}async _sendCommandResult(e,t){try{await fetch(`${this.config.serverUrl}/command-result`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({commandId:e,...t})})}catch(n){this._log("Failed to send command result:",n)}}getRemoteControlStatus(){return{enabled:this.config.enableRemoteControl,polling:this._isPolling,serverUrl:this.config.serverUrl,pollInterval:this.config.pollInterval}}_initDebugPanel(){try{this.debugPanel=new y({serverUrl:this.config.serverUrl,...this.config.debugPanelOptions}),this._log("Debug panel initialized")}catch(e){this._log("Failed to initialize debug panel:",e)}}showDebugPanel(){!this.debugPanel&&typeof window<"u"&&this._initDebugPanel(),this.debugPanel&&this.debugPanel.show()}hideDebugPanel(){this.debugPanel&&this.debugPanel.hide()}toggleDebugPanel(){if(!this.debugPanel&&typeof window<"u"){this._initDebugPanel();return}this.debugPanel&&(this.debugPanel.element.style.display==="none"?this.debugPanel.show():this.debugPanel.hide())}destroyDebugPanel(){this.debugPanel&&(this.debugPanel.destroy(),this.debugPanel=null)}};typeof window<"u"&&!window.UIBridge&&(window.UIBridge=u);function x(o={}){return new u({debug:!0,generateCDI:!0,enableHttpDiscovery:!0,...o})}async function E(o={}){let e=x(o);return await e.init(),e}if(typeof window<"u"&&typeof document<"u"&&!window.uibridge){let o=x({debug:!1,generateCDI:!1,autoInit:!0});window.uibridge=o,window.UIBridge=u,(process?.env?.NODE_ENV==="development"||window.location?.hostname==="localhost")&&(window.createUIBridge=x,window.initUIBridge=E)}var D="1.0.0",O="UIBridge",H=u;0&&(module.exports={CDIGenerator,CommandRegistry,SelectorEngine,UIBridge,clickCommand,createUIBridge,initUIBridge,name,screenshotCommand,version});

// Ensure default export compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Object.assign(module.exports.default || module.exports, module.exports);
  module.exports.default = module.exports.UIBridge;
}
//# sourceMappingURL=uibridge.cjs.js.map
