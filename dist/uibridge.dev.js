/*
 * UIBridge v0.1.0
 * In-app automation framework for web applications
 * Built: 2025-06-21T14:47:15.863Z
 */
var UIBridge = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    CDIGenerator: () => CDIGenerator,
    CommandRegistry: () => CommandRegistry,
    SelectorEngine: () => SelectorEngine,
    UIBridge: () => UIBridge,
    clickCommand: () => clickCommand,
    createUIBridge: () => createUIBridge,
    default: () => src_default,
    initUIBridge: () => initUIBridge,
    name: () => name,
    screenshotCommand: () => screenshotCommand,
    version: () => version
  });

  // src/core/CommandRegistry.js
  var _CommandRegistry = class _CommandRegistry {
    constructor() {
      this.commands = /* @__PURE__ */ new Map();
    }
    /**
     * Register a new command
     * @param {string} name - Command name
     * @param {Object} command - Command implementation
     */
    register(name2, command) {
      if (!name2 || typeof name2 !== "string") {
        throw new Error("Command name must be a non-empty string");
      }
      if (!command || typeof command.execute !== "function") {
        throw new Error("Command must have an execute function");
      }
      const requiredFields = ["name", "description", "parameters"];
      for (const field of requiredFields) {
        if (!command[field]) {
          throw new Error(`Command must have a ${field} property`);
        }
      }
      this.commands.set(name2, {
        ...command,
        registeredAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    /**
     * Get a command by name
     * @param {string} name - Command name
     * @returns {Object|null} Command or null if not found
     */
    get(name2) {
      return this.commands.get(name2) || null;
    }
    /**
     * Get all registered commands
     * @returns {Array} Array of all commands
     */
    getAll() {
      return Array.from(this.commands.values());
    }
    /**
     * Check if a command exists
     * @param {string} name - Command name
     * @returns {boolean} True if command exists
     */
    has(name2) {
      return this.commands.has(name2);
    }
    /**
     * Unregister a command
     * @param {string} name - Command name
     * @returns {boolean} True if command was removed
     */
    unregister(name2) {
      return this.commands.delete(name2);
    }
    /**
     * Get command names
     * @returns {Array<string>} Array of command names
     */
    getNames() {
      return Array.from(this.commands.keys());
    }
    /**
     * Clear all commands
     */
    clear() {
      this.commands.clear();
    }
    /**
     * Get commands count
     * @returns {number} Number of registered commands
     */
    size() {
      return this.commands.size;
    }
  };
  __name(_CommandRegistry, "CommandRegistry");
  var CommandRegistry = _CommandRegistry;

  // src/core/SelectorEngine.js
  var _SelectorEngine = class _SelectorEngine {
    constructor() {
      this.strategies = /* @__PURE__ */ new Map();
      this._setupDefaultStrategies();
    }
    /**
     * Setup default selector strategies
     * @private
     */
    _setupDefaultStrategies() {
      this.strategies.set("css", (selector) => {
        return document.querySelector(selector);
      });
      this.strategies.set("cssAll", (selector) => {
        return Array.from(document.querySelectorAll(selector));
      });
      this.strategies.set("xpath", (xpath) => {
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue;
      });
      this.strategies.set("xpathAll", (xpath) => {
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const nodes = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          nodes.push(result.snapshotItem(i));
        }
        return nodes;
      });
      this.strategies.set("text", (text) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.trim() === text) {
            return node.parentElement;
          }
        }
        return null;
      });
      this.strategies.set("partialText", (text) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.trim().includes(text)) {
            return node.parentElement;
          }
        }
        return null;
      });
      this.strategies.set("testId", (id) => {
        return document.querySelector(`[data-testid="${id}"]`);
      });
      this.strategies.set("dataTest", (id) => {
        return document.querySelector(`[data-test="${id}"]`);
      });
      this.strategies.set("label", (labelText) => {
        const labels = document.querySelectorAll("label");
        for (const label of labels) {
          if (label.textContent.trim() === labelText) {
            const forAttr = label.getAttribute("for");
            if (forAttr) {
              return document.getElementById(forAttr);
            }
            const input = label.querySelector("input, select, textarea");
            if (input) {
              return input;
            }
          }
        }
        return null;
      });
      this.strategies.set("placeholder", (placeholder) => {
        return document.querySelector(`[placeholder="${placeholder}"]`);
      });
      this.strategies.set("ariaLabel", (label) => {
        return document.querySelector(`[aria-label="${label}"]`);
      });
      this.strategies.set("role", (role) => {
        return document.querySelector(`[role="${role}"]`);
      });
    }
    /**
     * Find a single element
     * @param {string|Object} selector - Selector configuration
     * @returns {Element|null} Found element or null
     */
    find(selector) {
      if (typeof selector === "string") {
        return this.strategies.get("css")(selector);
      }
      if (typeof selector === "object" && selector !== null) {
        const strategies = [
          "xpath",
          "text",
          "partialText",
          "testId",
          "dataTest",
          "label",
          "placeholder",
          "ariaLabel",
          "role",
          "css"
        ];
        for (const strategy of strategies) {
          if (selector[strategy]) {
            const strategyFn = this.strategies.get(strategy);
            if (strategyFn) {
              const element = strategyFn(selector[strategy]);
              if (element) {
                return element;
              }
            }
          }
        }
      }
      throw new Error(`Invalid selector: ${JSON.stringify(selector)}`);
    }
    /**
     * Find multiple elements
     * @param {string|Object} selector - Selector configuration
     * @returns {Array<Element>} Found elements
     */
    findAll(selector) {
      if (typeof selector === "string") {
        return this.strategies.get("cssAll")(selector);
      }
      if (typeof selector === "object" && selector !== null) {
        if (selector.xpath) {
          return this.strategies.get("xpathAll")(selector.xpath);
        }
        if (selector.css) {
          return this.strategies.get("cssAll")(selector.css);
        }
        const element = this.find(selector);
        return element ? [element] : [];
      }
      throw new Error(`Invalid selector: ${JSON.stringify(selector)}`);
    }
    /**
     * Register a custom selector strategy
     * @param {string} name - Strategy name
     * @param {Function} strategy - Strategy function
     */
    registerStrategy(name2, strategy) {
      if (typeof strategy !== "function") {
        throw new Error("Strategy must be a function");
      }
      this.strategies.set(name2, strategy);
    }
    /**
     * Check if element is visible
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is visible
     */
    isVisible(element) {
      if (!element)
        return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity) > 0 && rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
    }
    /**
     * Get element information
     * @param {Element} element - Element to analyze
     * @returns {Object} Element information
     */
    getElementInfo(element) {
      if (!element)
        return null;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        classes: Array.from(element.classList),
        text: element.textContent?.trim().substring(0, 100) || "",
        attributes: this._getElementAttributes(element),
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        visible: this.isVisible(element),
        focusable: this._isFocusable(element)
      };
    }
    /**
     * Get element attributes
     * @param {Element} element - Element to analyze
     * @returns {Object} Element attributes
     * @private
     */
    _getElementAttributes(element) {
      const attrs = {};
      for (const attr of element.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    }
    /**
     * Check if element is focusable
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is focusable
     * @private
     */
    _isFocusable(element) {
      const focusableTags = ["input", "select", "textarea", "button", "a"];
      return focusableTags.includes(element.tagName.toLowerCase()) || element.hasAttribute("tabindex") || element.hasAttribute("contenteditable");
    }
  };
  __name(_SelectorEngine, "SelectorEngine");
  var SelectorEngine = _SelectorEngine;

  // src/discovery/CDIGenerator.js
  var _CDIGenerator = class _CDIGenerator {
    constructor(registry) {
      this.registry = registry;
      this.version = "1.0.0";
    }
    /**
     * Generate markdown documentation
     * @returns {string} Markdown documentation
     */
    generateMarkdown() {
      const commands = this.registry.getAll();
      const date = (/* @__PURE__ */ new Date()).toISOString();
      let markdown = `# UIBridge Commands Documentation

`;
      markdown += `**Generated:** ${date}  
`;
      markdown += `**Version:** ${this.version}  
`;
      markdown += `**Total Commands:** ${commands.length}

`;
      markdown += `## Command Summary

`;
      markdown += `| Command | Description | Parameters |
`;
      markdown += `|---------|-------------|------------|
`;
      commands.forEach((cmd) => {
        const params = cmd.parameters.map(
          (p) => `${p.name}${p.required ? "" : "?"}`
        ).join(", ");
        markdown += `| **${cmd.name}** | ${cmd.description} | ${params || "None"} |
`;
      });
      markdown += `
## Command Details

`;
      commands.forEach((cmd) => {
        markdown += `### ${cmd.name}

`;
        markdown += `${cmd.description}

`;
        if (cmd.parameters.length > 0) {
          markdown += `**Parameters:**

`;
          cmd.parameters.forEach((param) => {
            const required = param.required ? "**required**" : "*optional*";
            markdown += `- \`${param.name}\` (${param.type}) - ${required}  
`;
            markdown += `  ${param.description}
`;
          });
          markdown += "\n";
        }
        if (cmd.examples && cmd.examples.length > 0) {
          markdown += `**Examples:**

`;
          cmd.examples.forEach((example) => {
            markdown += `\`\`\`javascript
${example}
\`\`\`

`;
          });
        }
        markdown += `---

`;
      });
      return markdown;
    }
    /**
     * Generate JSON schema for commands
     * @returns {Object} JSON schema
     */
    generateJSON() {
      const commands = this.registry.getAll();
      return {
        version: this.version,
        generated: (/* @__PURE__ */ new Date()).toISOString(),
        commands: commands.map((cmd) => ({
          name: cmd.name,
          description: cmd.description,
          parameters: cmd.parameters,
          examples: cmd.examples || []
        }))
      };
    }
    /**
     * Save documentation to file
     * @param {string} format - Format (markdown, json)
     */
    async saveToFile(format = "markdown") {
      const content = format === "json" ? JSON.stringify(this.generateJSON(), null, 2) : this.generateMarkdown();
      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/markdown"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uibridge-commands.${format === "json" ? "json" : "md"}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    /**
     * Generate TypeScript definitions
     * @returns {string} TypeScript definitions
     */
    generateTypeScript() {
      const commands = this.registry.getAll();
      let ts = `// UIBridge Command Definitions
`;
      ts += `// Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

`;
      commands.forEach((cmd) => {
        const optionalParams = cmd.parameters.filter((p) => !p.required);
        if (optionalParams.length > 0) {
          ts += `interface ${this._capitalize(cmd.name)}Options {
`;
          optionalParams.forEach((param) => {
            ts += `  ${param.name}?: ${this._mapTypeToTS(param.type)}; // ${param.description}
`;
          });
          ts += `}

`;
        }
      });
      ts += `interface UIBridge {
`;
      commands.forEach((cmd) => {
        const requiredParams = cmd.parameters.filter((p) => p.required);
        const optionalParams = cmd.parameters.filter((p) => !p.required);
        let signature = `  ${cmd.name}(`;
        requiredParams.forEach((param, index) => {
          if (index > 0)
            signature += ", ";
          signature += `${param.name}: ${this._mapTypeToTS(param.type)}`;
        });
        if (optionalParams.length > 0) {
          if (requiredParams.length > 0)
            signature += ", ";
          signature += `options?: ${this._capitalize(cmd.name)}Options`;
        }
        signature += `): Promise<any>; // ${cmd.description}
`;
        ts += signature;
      });
      ts += `}

`;
      ts += `export { UIBridge };
`;
      commands.forEach((cmd) => {
        const optionalParams = cmd.parameters.filter((p) => !p.required);
        if (optionalParams.length > 0) {
          ts += `export { ${this._capitalize(cmd.name)}Options };
`;
        }
      });
      return ts;
    }
    /**
     * Generate OpenAPI specification
     * @returns {Object} OpenAPI spec
     */
    generateOpenAPI() {
      const commands = this.registry.getAll();
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "UIBridge API",
          description: "In-app automation framework for web applications",
          version: this.version,
          contact: {
            name: "UIBridge Team"
          }
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Local development server"
          }
        ],
        paths: {},
        components: {
          schemas: {}
        }
      };
      commands.forEach((cmd) => {
        const path = `/commands/${cmd.name}`;
        spec.paths[path] = {
          post: {
            summary: cmd.description,
            description: cmd.description,
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: this._generateJSONSchema(cmd.parameters),
                    required: cmd.parameters.filter((p) => p.required).map((p) => p.name)
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Command executed successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        result: { type: "object" },
                        timestamp: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Invalid parameters"
              },
              "500": {
                description: "Command execution failed"
              }
            }
          }
        };
      });
      return spec;
    }
    /**
     * Get live command statistics
     * @returns {Object} Command statistics
     */
    getStatistics() {
      const commands = this.registry.getAll();
      return {
        totalCommands: commands.length,
        commandNames: commands.map((c) => c.name),
        totalParameters: commands.reduce((sum, cmd) => sum + cmd.parameters.length, 0),
        requiredParameters: commands.reduce((sum, cmd) => sum + cmd.parameters.filter((p) => p.required).length, 0),
        optionalParameters: commands.reduce((sum, cmd) => sum + cmd.parameters.filter((p) => !p.required).length, 0),
        commandsWithExamples: commands.filter((cmd) => cmd.examples && cmd.examples.length > 0).length,
        averageParametersPerCommand: Math.round(
          commands.reduce((sum, cmd) => sum + cmd.parameters.length, 0) / commands.length * 100
        ) / 100,
        lastGenerated: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    /**
     * Helper: Capitalize string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     * @private
     */
    _capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Helper: Map parameter type to TypeScript type
     * @param {string} type - Parameter type
     * @returns {string} TypeScript type
     * @private
     */
    _mapTypeToTS(type) {
      const typeMap = {
        "string": "string",
        "number": "number",
        "boolean": "boolean",
        "object": "object",
        "array": "any[]",
        "Selector": "string | object",
        "ClickOptions": "object",
        "ScreenshotOptions": "object"
      };
      return typeMap[type] || "any";
    }
    /**
     * Helper: Generate JSON schema for parameters
     * @param {Array} parameters - Command parameters
     * @returns {Object} JSON schema properties
     * @private
     */
    _generateJSONSchema(parameters) {
      const properties = {};
      parameters.forEach((param) => {
        properties[param.name] = {
          type: this._mapTypeToJSONSchema(param.type),
          description: param.description
        };
        if (param.default !== void 0) {
          properties[param.name].default = param.default;
        }
      });
      return properties;
    }
    /**
     * Helper: Map parameter type to JSON Schema type
     * @param {string} type - Parameter type
     * @returns {string} JSON Schema type
     * @private
     */
    _mapTypeToJSONSchema(type) {
      const typeMap = {
        "string": "string",
        "number": "number",
        "boolean": "boolean",
        "object": "object",
        "array": "array",
        "Selector": "string",
        // Simplified for JSON schema
        "ClickOptions": "object",
        "ScreenshotOptions": "object"
      };
      return typeMap[type] || "string";
    }
  };
  __name(_CDIGenerator, "CDIGenerator");
  var CDIGenerator = _CDIGenerator;

  // src/commands/click.js
  var clickCommand = {
    name: "click",
    description: "Clicks on an element using synthetic mouse events",
    parameters: [
      {
        name: "selector",
        type: "Selector",
        required: true,
        description: "Element to click (string, CSS selector, or selector object)"
      },
      {
        name: "options",
        type: "ClickOptions",
        required: false,
        description: "Click options: { force?, position?, button?, clickCount?, delay? }"
      }
    ],
    examples: [
      "await uibridge.execute('click', '#submit-button')",
      "await uibridge.execute('click', { testId: 'login-btn' })",
      "await uibridge.execute('click', 'button', { position: 'topLeft', clickCount: 2 })"
    ],
    async execute(bridge, selector, options = {}) {
      const element = bridge.findElement(selector);
      if (!element) {
        throw new Error(`Element not found: ${JSON.stringify(selector)}`);
      }
      const opts = {
        force: false,
        position: "center",
        // center, topLeft, topRight, bottomLeft, bottomRight
        button: "left",
        // left, right, middle
        clickCount: 1,
        delay: 0,
        scrollIntoView: true,
        ...options
      };
      bridge._log(`Clicking element: ${bridge.selectorEngine.getElementInfo(element)?.tag || "unknown"}`);
      if (opts.scrollIntoView) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!opts.force) {
        const isVisible = bridge.selectorEngine.isVisible(element);
        if (!isVisible) {
          throw new Error("Element is not visible. Use { force: true } to click anyway.");
        }
      }
      if (!opts.force) {
        const isActionable = this._isElementActionable(element);
        if (!isActionable) {
          throw new Error("Element is covered by another element. Use { force: true } to click anyway.");
        }
      }
      const rect = element.getBoundingClientRect();
      const position = this._calculatePosition(rect, opts.position);
      const eventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: position.x,
        clientY: position.y,
        button: this._getButtonCode(opts.button),
        buttons: this._getButtonsCode(opts.button),
        detail: opts.clickCount
      };
      try {
        element.dispatchEvent(new MouseEvent("mouseover", eventInit));
        element.dispatchEvent(new MouseEvent("mouseenter", eventInit));
        element.dispatchEvent(new MouseEvent("mousedown", eventInit));
        if (opts.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, opts.delay));
        }
        element.dispatchEvent(new MouseEvent("mouseup", eventInit));
        for (let i = 0; i < opts.clickCount; i++) {
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          element.dispatchEvent(new MouseEvent("click", {
            ...eventInit,
            detail: i + 1
          }));
        }
        if (bridge.selectorEngine._isFocusable(element)) {
          element.focus();
        }
        await this._handleSpecialElements(element, opts);
      } catch (error) {
        throw new Error(`Failed to click element: ${error.message}`);
      }
      return {
        success: true,
        element: bridge.selectorEngine.getElementInfo(element),
        position,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    },
    /**
     * Check if element is actionable (not covered by another element)
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is actionable
     * @private
     */
    _isElementActionable(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      return element === elementAtPoint || element.contains(elementAtPoint);
    },
    /**
     * Calculate click position based on position option
     * @param {DOMRect} rect - Element bounding rectangle
     * @param {string} position - Position option
     * @returns {Object} Coordinates {x, y}
     * @private
     */
    _calculatePosition(rect, position) {
      const positions = {
        center: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        topLeft: {
          x: rect.left + 1,
          y: rect.top + 1
        },
        topRight: {
          x: rect.right - 1,
          y: rect.top + 1
        },
        bottomLeft: {
          x: rect.left + 1,
          y: rect.bottom - 1
        },
        bottomRight: {
          x: rect.right - 1,
          y: rect.bottom - 1
        },
        topCenter: {
          x: rect.left + rect.width / 2,
          y: rect.top + 1
        },
        bottomCenter: {
          x: rect.left + rect.width / 2,
          y: rect.bottom - 1
        },
        leftCenter: {
          x: rect.left + 1,
          y: rect.top + rect.height / 2
        },
        rightCenter: {
          x: rect.right - 1,
          y: rect.top + rect.height / 2
        }
      };
      return positions[position] || positions.center;
    },
    /**
     * Get mouse button code
     * @param {string} button - Button name
     * @returns {number} Button code
     * @private
     */
    _getButtonCode(button) {
      const buttons = {
        left: 0,
        middle: 1,
        right: 2
      };
      return buttons[button] || 0;
    },
    /**
     * Get mouse buttons bitmask
     * @param {string} button - Button name
     * @returns {number} Buttons bitmask
     * @private
     */
    _getButtonsCode(button) {
      const buttons = {
        left: 1,
        middle: 4,
        right: 2
      };
      return buttons[button] || 1;
    },
    /**
     * Handle special element types (forms, checkboxes, etc.)
     * @param {Element} element - Element that was clicked
     * @param {Object} opts - Click options
     * @private
     */
    async _handleSpecialElements(element, opts) {
      const tagName = element.tagName.toLowerCase();
      const inputType = element.type?.toLowerCase();
      if (tagName === "button" && element.type === "submit") {
        const form = element.closest("form");
        if (form) {
          return;
        }
      }
      if (tagName === "input" && (inputType === "checkbox" || inputType === "radio")) {
        return;
      }
      if (tagName === "select") {
        setTimeout(() => {
          element.dispatchEvent(new Event("change", { bubbles: true }));
        }, 10);
      }
      if (tagName === "a" && element.href) {
        return;
      }
    }
  };

  // src/commands/screenshot.js
  var screenshotCommand = {
    name: "screenshot",
    description: "Takes a screenshot of the page or a specific element",
    parameters: [
      {
        name: "options",
        type: "ScreenshotOptions",
        required: false,
        description: "Screenshot options: { selector?, format?, quality?, fullPage?, saveConfig? }"
      }
    ],
    examples: [
      "await uibridge.execute('screenshot')",
      "await uibridge.execute('screenshot', { selector: '#main-content' })",
      "await uibridge.execute('screenshot', { saveConfig: { folder: 'test-screenshots', autoSave: true } })"
    ],
    async execute(bridge, options = {}) {
      console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Starting screenshot command execution");
      console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Raw options received:", JSON.stringify(options, null, 2));
      console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Bridge config:", JSON.stringify(bridge.config.defaultScreenshotConfig, null, 2));
      const opts = {
        selector: null,
        format: "png",
        // png, jpeg, webp
        quality: 0.92,
        // 0-1 for jpeg/webp
        fullPage: false,
        // capture entire page
        excludeSelectors: [],
        // elements to hide during capture
        backgroundColor: null,
        // background color override
        scale: window.devicePixelRatio || 1,
        // Enhanced save configuration
        saveConfig: {
          // Use bridge default config as base
          ...bridge.config.defaultScreenshotConfig,
          // Override with user options
          ...options.saveConfig
        },
        ...options
      };
      console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Final processed options:", JSON.stringify(opts, null, 2));
      bridge._log(`Taking screenshot with options:`, opts);
      let targetElement = document.body;
      if (opts.selector) {
        targetElement = bridge.findElement(opts.selector);
        if (!targetElement) {
          throw new Error(`Element not found for screenshot: ${JSON.stringify(opts.selector)}`);
        }
      }
      try {
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Target element:", targetElement?.tagName, targetElement?.id, targetElement?.className);
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Target element dimensions:", {
          width: targetElement?.offsetWidth,
          height: targetElement?.offsetHeight,
          scrollWidth: targetElement?.scrollWidth,
          scrollHeight: targetElement?.scrollHeight
        });
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Loading html2canvas...");
        await this._ensureHtml2Canvas();
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas loaded:", !!window.html2canvas);
        const hiddenElements = this._hideElements(opts.excludeSelectors);
        const html2canvasOptions = {
          useCORS: true,
          allowTaint: false,
          backgroundColor: opts.backgroundColor,
          scale: opts.scale,
          logging: true,
          // Force logging for debugging
          width: opts.fullPage ? document.documentElement.scrollWidth : void 0,
          height: opts.fullPage ? document.documentElement.scrollHeight : void 0,
          windowWidth: opts.fullPage ? document.documentElement.scrollWidth : void 0,
          windowHeight: opts.fullPage ? document.documentElement.scrollHeight : void 0,
          x: opts.fullPage ? 0 : void 0,
          y: opts.fullPage ? 0 : void 0,
          // Improve image quality
          foreignObjectRendering: true,
          imageTimeout: 15e3,
          removeContainer: true
        };
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] html2canvas options:", JSON.stringify(html2canvasOptions, null, 2));
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Starting html2canvas capture...");
        const canvas = await window.html2canvas(targetElement, html2canvasOptions);
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Canvas created:", {
          width: canvas.width,
          height: canvas.height,
          hasData: canvas.getContext("2d").getImageData(0, 0, 1, 1).data.some((x) => x !== 0)
        });
        this._restoreElements(hiddenElements);
        const mimeType = `image/${opts.format}`;
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Converting to format:", mimeType, "quality:", opts.quality);
        const dataUrl = canvas.toDataURL(mimeType, opts.quality);
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] DataURL created, length:", dataUrl.length, "starts with:", dataUrl.substring(0, 50));
        const fileName = this._generateFileName(opts);
        console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Generated filename:", fileName);
        if (opts.saveConfig.autoSave) {
          console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Auto-save enabled, saving...");
          await this._saveScreenshot(dataUrl, fileName, opts.saveConfig);
          console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Save completed");
        } else {
          console.log("\u{1F5BC}\uFE0F [SCREENSHOT] Auto-save disabled");
        }
        const result = {
          success: true,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          format: opts.format,
          fileName,
          filePath: opts.saveConfig.folder ? `${opts.saveConfig.folder}/${fileName}` : fileName,
          size: Math.round(dataUrl.length * 0.75),
          // Approximate file size in bytes
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          saveConfig: opts.saveConfig
        };
        if (opts.selector) {
          result.element = bridge.selectorEngine.getElementInfo(targetElement);
          if (opts.saveConfig.includeMetadata) {
            result.metadata = {
              selector: opts.selector,
              element: result.element,
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight
              },
              userAgent: navigator.userAgent,
              timestamp: result.timestamp
            };
          }
        }
        bridge._log(`Screenshot captured: ${result.width}x${result.height}, ${result.size} bytes, saved as: ${result.filePath}`);
        return result;
      } catch (error) {
        throw new Error(`Failed to take screenshot: ${error.message}`);
      }
    },
    /**
     * Generate filename based on configuration
     * @param {Object} opts - Screenshot options
     * @returns {string} Generated filename
     * @private
     */
    _generateFileName(opts) {
      const config = opts.saveConfig;
      if (config.customName) {
        return this._ensureExtension(config.customName, opts.format);
      }
      let fileName = config.prefix || "screenshot";
      if (config.includeMetadata) {
        if (opts.selector) {
          const selectorStr = typeof opts.selector === "string" ? opts.selector.replace(/[#.]/g, "").substring(0, 20) : "element";
          fileName += `_${selectorStr}`;
        }
        if (opts.fullPage) {
          fileName += "_fullpage";
        }
        fileName += `_${opts.width || "auto"}x${opts.height || "auto"}`;
      }
      if (config.timestamp) {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").substring(0, 19);
        fileName += `_${timestamp}`;
      }
      return this._ensureExtension(fileName, opts.format);
    },
    /**
     * Ensure filename has correct extension
     * @param {string} fileName - Base filename
     * @param {string} format - Image format
     * @returns {string} Filename with extension
     * @private
     */
    _ensureExtension(fileName, format) {
      const extension = format === "jpeg" ? "jpg" : format;
      if (!fileName.toLowerCase().endsWith(`.${extension}`)) {
        return `${fileName}.${extension}`;
      }
      return fileName;
    },
    /**
     * Save screenshot using available methods
     * @param {string} dataUrl - Image data URL
     * @param {string} fileName - File name
     * @param {Object} saveConfig - Save configuration
     * @private
     */
    async _saveScreenshot(dataUrl, fileName, saveConfig) {
      try {
        await this._downloadImage(dataUrl, fileName);
        if (saveConfig.serverEndpoint) {
          await this._saveToServer(dataUrl, fileName, saveConfig);
        }
        if (saveConfig.persistInBrowser) {
          await this._saveToIndexedDB(dataUrl, fileName, saveConfig);
        }
      } catch (error) {
        console.warn("Failed to save screenshot:", error);
        throw new Error(`Screenshot save failed: ${error.message}`);
      }
    },
    /**
     * Save to server endpoint (if configured)
     * @param {string} dataUrl - Image data URL
     * @param {string} fileName - File name
     * @param {Object} saveConfig - Save configuration
     * @private
     */
    async _saveToServer(dataUrl, fileName, saveConfig) {
      if (!saveConfig.serverEndpoint)
        return;
      try {
        const response = await fetch(saveConfig.serverEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileName,
            folder: saveConfig.folder,
            dataUrl,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          })
        });
        if (!response.ok) {
          throw new Error(`Server save failed: ${response.status} ${response.statusText}`);
        }
        console.log(`Screenshot saved to server: ${fileName}`);
      } catch (error) {
        console.error("Server save error:", error);
        throw error;
      }
    },
    /**
     * Save to IndexedDB for browser persistence
     * @param {string} dataUrl - Image data URL
     * @param {string} fileName - File name
     * @param {Object} saveConfig - Save configuration
     * @private
     */
    async _saveToIndexedDB(dataUrl, fileName, saveConfig) {
      return new Promise((resolve, reject) => {
        const dbName = "UIBridgeScreenshots";
        const storeName = "screenshots";
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(new Error("IndexedDB open failed"));
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
            store.createIndex("fileName", "fileName", { unique: false });
            store.createIndex("timestamp", "timestamp", { unique: false });
          }
        };
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);
          const screenshot = {
            fileName,
            folder: saveConfig.folder,
            dataUrl,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            size: Math.round(dataUrl.length * 0.75)
          };
          const addRequest = store.add(screenshot);
          addRequest.onsuccess = () => {
            console.log(`Screenshot saved to IndexedDB: ${fileName}`);
            resolve();
          };
          addRequest.onerror = () => {
            reject(new Error("IndexedDB save failed"));
          };
        };
      });
    },
    /**
     * Ensure html2canvas library is loaded
     * @private
     */
    async _ensureHtml2Canvas() {
      if (window.html2canvas)
        return;
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.integrity = "sha512-dK1lSuLiS6pQ6nrGT7iQFmQ5xOFCHBcynHgSc1h5tEGE6a86/30XnRrOXKmr5AZ+z3OqQQ4SdMzS0i1h1D5w3g==";
        script.crossOrigin = "anonymous";
        script.onload = () => {
          if (window.html2canvas) {
            resolve();
          } else {
            reject(new Error("html2canvas failed to load properly"));
          }
        };
        script.onerror = () => {
          reject(new Error("Failed to load html2canvas library"));
        };
        const existingScript = document.querySelector('script[src*="html2canvas"]');
        if (existingScript) {
          if (window.html2canvas) {
            resolve();
          } else {
            existingScript.onload = resolve;
            existingScript.onerror = reject;
          }
          return;
        }
        document.head.appendChild(script);
      });
    },
    /**
     * Hide elements temporarily
     * @param {Array<string>} selectors - CSS selectors to hide
     * @returns {Array} Array of elements that were hidden
     * @private
     */
    _hideElements(selectors) {
      const hiddenElements = [];
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const originalDisplay = element.style.display;
            element.style.display = "none";
            hiddenElements.push({ element, originalDisplay });
          }
        } catch (error) {
          console.warn(`Invalid selector for hiding: ${selector}`, error);
        }
      }
      return hiddenElements;
    },
    /**
     * Restore previously hidden elements
     * @param {Array} hiddenElements - Elements to restore
     * @private
     */
    _restoreElements(hiddenElements) {
      for (const { element, originalDisplay } of hiddenElements) {
        element.style.display = originalDisplay;
      }
    },
    /**
     * Download the image
     * @param {string} dataUrl - Image data URL
     * @param {string} fileName - File name
     * @private
     */
    _downloadImage(dataUrl, fileName) {
      try {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.warn("Failed to auto-download screenshot:", error);
      }
    }
  };

  // src/core/UIBridge.js
  var _UIBridge = class _UIBridge {
    constructor(config = {}) {
      this.config = {
        debug: false,
        allowedOrigins: ["*"],
        commands: ["click", "screenshot"],
        generateCDI: true,
        enableHttpDiscovery: false,
        autoInit: true,
        version: "0.1.0",
        // Screenshot save configuration
        defaultScreenshotConfig: {
          autoSave: false,
          folder: "uibridge-screenshots",
          prefix: "screenshot",
          timestamp: true,
          includeMetadata: false,
          persistInBrowser: false,
          serverEndpoint: null,
          // Optional server endpoint for saving
          ...config.defaultScreenshotConfig
        },
        ...config
      };
      this.registry = new CommandRegistry();
      this.selectorEngine = new SelectorEngine();
      this.cdiGenerator = null;
      this._isInitialized = false;
      this._initStartTime = null;
      this._commandHistory = [];
      if (this.config.autoInit && typeof window !== "undefined") {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.init());
        } else {
          setTimeout(() => this.init(), 0);
        }
      }
    }
    /**
     * Initialize UIBridge
     * @returns {Promise<void>}
     */
    async init() {
      if (this._isInitialized) {
        this._log("UIBridge already initialized");
        return;
      }
      this._initStartTime = performance.now();
      this._log("Initializing UIBridge...", this.config);
      try {
        await this._registerCoreCommands();
        this.cdiGenerator = new CDIGenerator(this.registry);
        this._setupDiscovery();
        this._setupGlobalAPI();
        this._isInitialized = true;
        const initTime = performance.now() - this._initStartTime;
        this._log(`UIBridge initialized successfully in ${initTime.toFixed(2)}ms`, {
          commands: this.registry.getNames(),
          version: this.config.version
        });
        if (this.config.generateCDI) {
          this._generateCDI();
        }
        this._dispatchEvent("uibridge:initialized", {
          version: this.config.version,
          commands: this.registry.getNames(),
          initTime
        });
      } catch (error) {
        this._log("Failed to initialize UIBridge:", error);
        throw new Error(`UIBridge initialization failed: ${error.message}`);
      }
    }
    /**
     * Execute a command
     * @param {string} commandName - Name of the command to execute
     * @param {...any} args - Command arguments
     * @returns {Promise<any>} Command result
     */
    async execute(commandName, ...args) {
      if (!this._isInitialized) {
        throw new Error("UIBridge not initialized. Call init() first.");
      }
      const command = this.registry.get(commandName);
      if (!command) {
        throw new Error(`Unknown command: ${commandName}. Available commands: ${this.registry.getNames().join(", ")}`);
      }
      const startTime = performance.now();
      const executionId = this._generateExecutionId();
      this._log(`Executing command: ${commandName}`, { args, executionId });
      try {
        const historyEntry = {
          id: executionId,
          command: commandName,
          args,
          startTime: (/* @__PURE__ */ new Date()).toISOString(),
          status: "running"
        };
        this._commandHistory.push(historyEntry);
        const result = await command.execute(this, ...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        historyEntry.status = "completed";
        historyEntry.duration = duration;
        historyEntry.result = result;
        historyEntry.endTime = (/* @__PURE__ */ new Date()).toISOString();
        this._log(`Command completed: ${commandName} (${duration.toFixed(2)}ms)`, result);
        this._dispatchEvent("uibridge:command", {
          command: commandName,
          args,
          result,
          duration,
          executionId
        });
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        const historyEntry = this._commandHistory[this._commandHistory.length - 1];
        if (historyEntry && historyEntry.id === executionId) {
          historyEntry.status = "failed";
          historyEntry.error = error.message;
          historyEntry.duration = duration;
          historyEntry.endTime = (/* @__PURE__ */ new Date()).toISOString();
        }
        this._log(`Command failed: ${commandName} (${duration.toFixed(2)}ms)`, error);
        this._dispatchEvent("uibridge:error", {
          command: commandName,
          args,
          error: error.message,
          duration,
          executionId
        });
        throw error;
      }
    }
    /**
     * Find an element using the selector engine
     * @param {string|Object} selector - Selector to find element
     * @returns {Element|null} Found element
     */
    findElement(selector) {
      return this.selectorEngine.find(selector);
    }
    /**
     * Find multiple elements using the selector engine
     * @param {string|Object} selector - Selector to find elements
     * @returns {Array<Element>} Found elements
     */
    findElements(selector) {
      return this.selectorEngine.findAll(selector);
    }
    /**
     * Get command discovery information
     * @returns {Array} Array of command information
     */
    discover() {
      return this.registry.getAll().map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        parameters: cmd.parameters,
        examples: cmd.examples || []
      }));
    }
    /**
     * Get command execution history
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Command history
     */
    getHistory(limit = 50) {
      return this._commandHistory.slice(-limit);
    }
    /**
     * Clear command history
     */
    clearHistory() {
      this._commandHistory = [];
      this._log("Command history cleared");
    }
    /**
     * Get UIBridge status and statistics
     * @returns {Object} Status information
     */
    getStatus() {
      return {
        initialized: this._isInitialized,
        version: this.config.version,
        commands: this.registry.getNames(),
        commandCount: this.registry.size(),
        historyLength: this._commandHistory.length,
        config: { ...this.config },
        uptime: this._initStartTime ? performance.now() - this._initStartTime : 0
      };
    }
    /**
     * Register a custom command
     * @param {string} name - Command name
     * @param {Object} command - Command implementation
     */
    registerCommand(name2, command) {
      this.registry.register(name2, command);
      this._log(`Custom command registered: ${name2}`);
      if (this.cdiGenerator) {
        this._generateCDI();
      }
    }
    /**
     * Unregister a command
     * @param {string} name - Command name
     * @returns {boolean} True if command was removed
     */
    unregisterCommand(name2) {
      const removed = this.registry.unregister(name2);
      if (removed) {
        this._log(`Command unregistered: ${name2}`);
        if (this.cdiGenerator) {
          this._generateCDI();
        }
      }
      return removed;
    }
    /**
     * Configure default screenshot settings
     * @param {Object} config - Screenshot configuration
     */
    configureScreenshots(config) {
      this.config.defaultScreenshotConfig = {
        ...this.config.defaultScreenshotConfig,
        ...config
      };
      this._log("Screenshot configuration updated:", this.config.defaultScreenshotConfig);
    }
    /**
     * Get current screenshot configuration
     * @returns {Object} Screenshot configuration
     */
    getScreenshotConfig() {
      return { ...this.config.defaultScreenshotConfig };
    }
    /**
     * Register core commands
     * @private
     */
    async _registerCoreCommands() {
      const commands = [
        { name: "click", implementation: clickCommand },
        { name: "screenshot", implementation: screenshotCommand }
      ];
      for (const { name: name2, implementation } of commands) {
        if (this.config.commands.includes(name2)) {
          this.registry.register(name2, implementation);
          this._log(`Registered core command: ${name2}`);
        }
      }
    }
    /**
     * Setup discovery endpoints
     * @private
     */
    _setupDiscovery() {
      if (this.config.enableHttpDiscovery) {
        window.__uibridge_discovery__ = () => {
          return this.discover();
        };
        window.__uibridge_status__ = () => {
          return this.getStatus();
        };
        this._log("HTTP discovery endpoints enabled");
      }
    }
    /**
     * Setup global APIs
     * @private
     */
    _setupGlobalAPI() {
      window.UIBridge = _UIBridge;
      window.uibridge = this;
      window.__uibridge__ = {
        execute: this.execute.bind(this),
        discover: this.discover.bind(this),
        findElement: this.findElement.bind(this),
        findElements: this.findElements.bind(this),
        getStatus: this.getStatus.bind(this),
        getHistory: this.getHistory.bind(this)
      };
      this._log("Global APIs exposed");
    }
    /**
     * Generate and optionally display CDI
     * @private
     */
    _generateCDI() {
      if (!this.cdiGenerator)
        return;
      try {
        if (this.config.debug) {
          console.log("=== UIBridge Command Discovery Interface ===");
          console.log(this.cdiGenerator.generateMarkdown());
          console.log("=== End CDI ===");
        }
        window.__uibridge_cdi__ = {
          markdown: () => this.cdiGenerator.generateMarkdown(),
          json: () => this.cdiGenerator.generateJSON(),
          save: (format) => this.cdiGenerator.saveToFile(format)
        };
      } catch (error) {
        this._log("Failed to generate CDI:", error);
      }
    }
    /**
     * Generate unique execution ID
     * @returns {string} Execution ID
     * @private
     */
    _generateExecutionId() {
      return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event details
     * @private
     */
    _dispatchEvent(eventName, detail) {
      if (typeof window !== "undefined" && window.dispatchEvent) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
      }
    }
    /**
     * Log message with debug configuration
     * @param {...any} args - Arguments to log
     * @private
     */
    _log(...args) {
      if (this.config.debug) {
        console.log("[UIBridge]", ...args);
      }
    }
  };
  __name(_UIBridge, "UIBridge");
  var UIBridge = _UIBridge;
  if (typeof window !== "undefined" && !window.UIBridge) {
    window.UIBridge = UIBridge;
  }

  // src/index.js
  function createUIBridge(config = {}) {
    return new UIBridge({
      debug: true,
      generateCDI: true,
      enableHttpDiscovery: true,
      ...config
    });
  }
  __name(createUIBridge, "createUIBridge");
  async function initUIBridge(config = {}) {
    const bridge = createUIBridge(config);
    await bridge.init();
    return bridge;
  }
  __name(initUIBridge, "initUIBridge");
  if (typeof window !== "undefined") {
    if (!window.uibridge) {
      const defaultInstance = createUIBridge({
        debug: false,
        generateCDI: false,
        autoInit: true
      });
      window.uibridge = defaultInstance;
      window.UIBridge = UIBridge;
      if (window.location.hostname === "localhost") {
        window.createUIBridge = createUIBridge;
        window.initUIBridge = initUIBridge;
      }
    }
  }
  var version = "0.1.0";
  var name = "UIBridge";
  var src_default = UIBridge;
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=uibridge.dev.js.map
