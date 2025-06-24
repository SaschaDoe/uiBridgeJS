import { CommandRegistry } from './CommandRegistry.js';
import { SelectorEngine } from './SelectorEngine.js';
import { CDIGenerator } from '../discovery/CDIGenerator.js';
import { clickCommand } from '../commands/click.js';
import { screenshotCommand } from '../commands/screenshot.js';
import { helpCommand } from '../commands/help.js';

/**
 * UIBridge - Main automation framework class
 */
export class UIBridge {
  constructor(config = {}) {
    this.config = {
      debug: false,
      allowedOrigins: ['*'],
      commands: ['click', 'screenshot', 'help'],
      generateCDI: true,
      enableHttpDiscovery: false,
      autoInit: true,
              version: '1.3.2',
      
      // Remote control configuration (NEW)
      enableRemoteControl: false,
      serverUrl: 'http://localhost:3002',
      pollInterval: 500, // ms between polls
      autoStartPolling: true,
      
      // Screenshot save configuration
      defaultScreenshotConfig: {
        autoSave: false,
        folder: 'uibridge-screenshots',
        prefix: 'screenshot',
        timestamp: true,
        includeMetadata: false,
        persistInBrowser: false,
        serverEndpoint: null, // Optional server endpoint for saving
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
    this._isPolling = false;
    this._pollTimeoutId = null;
    
    // Auto-initialize if configured - only in browser environment
    if (this.config.autoInit && typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Delay initialization to ensure DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
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
      this._log('UIBridge already initialized');
      return;
    }
    
    this._initStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this._log('Initializing UIBridge...', this.config);
    
    try {
      // Register core commands
      await this._registerCoreCommands();
      
      // Setup CDI generator
      this.cdiGenerator = new CDIGenerator(this.registry);
      
      // Setup discovery endpoints
      this._setupDiscovery();
      
      // Expose global APIs
      this._setupGlobalAPI();
      
      this._isInitialized = true;
      const initTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - this._initStartTime;
      
      this._log(`UIBridge initialized successfully in ${initTime.toFixed(2)}ms`, {
        commands: this.registry.getNames(),
        version: this.config.version
      });
      
      // Generate CDI if configured
      if (this.config.generateCDI) {
        this._generateCDI();
      }
      
      // Start remote control polling if enabled
      if (this.config.enableRemoteControl && this.config.autoStartPolling) {
        this.startRemoteControl();
      }
      
      // Dispatch initialization event
      this._dispatchEvent('uibridge:initialized', {
        version: this.config.version,
        commands: this.registry.getNames(),
        initTime,
        remoteControlEnabled: this.config.enableRemoteControl
      });
      
    } catch (error) {
      this._log('Failed to initialize UIBridge:', error);
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
    // Handle help requests
    if (commandName === 'help' || commandName === '--help') {
      return this.getHelp(args[0]);
    }

    if (!this._isInitialized) {
      throw new Error('UIBridge not initialized. Call init() first.');
    }
    
    const command = this.registry.get(commandName);
    if (!command) {
      // Provide helpful error with available commands
      const available = this.registry.getAll().map(cmd => cmd.name).join(', ');
      throw new Error(`Unknown command: ${commandName}. Available commands: ${available}. Use 'help' for detailed information.`);
    }
    
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executionId = this._generateExecutionId();
    
    this._log(`Executing command: ${commandName}`, { args, executionId });
    
    try {
      // Add to command history
      const historyEntry = {
        id: executionId,
        command: commandName,
        args,
        startTime: new Date().toISOString(),
        status: 'running'
      };
      this._commandHistory.push(historyEntry);
      
      // Execute the command
      const result = await command.execute(this, ...args);
      
      // Update history
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = endTime - startTime;
      
      historyEntry.status = 'completed';
      historyEntry.duration = duration;
      historyEntry.result = result;
      historyEntry.endTime = new Date().toISOString();
      
      this._log(`Command completed: ${commandName} (${duration.toFixed(2)}ms)`, result);
      
      // Dispatch command event
      this._dispatchEvent('uibridge:command', {
        command: commandName,
        args,
        result,
        duration,
        executionId
      });
      
      // Add execution metadata
      const enhancedResult = {
        ...result,
        command: commandName,
        duration,
        timestamp: new Date().toISOString()
      };

      // Add to history
      this._addToHistory({
        command: commandName,
        args,
        result: enhancedResult,
        duration,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
      
      return enhancedResult;
      
    } catch (error) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = endTime - startTime;
      
      // Update history with error
      const historyEntry = this._commandHistory[this._commandHistory.length - 1];
      if (historyEntry && historyEntry.id === executionId) {
        historyEntry.status = 'failed';
        historyEntry.error = error.message;
        historyEntry.duration = duration;
        historyEntry.endTime = new Date().toISOString();
      }
      
      this._log(`Command failed: ${commandName} (${duration.toFixed(2)}ms)`, error);
      
      // Dispatch error event
      this._dispatchEvent('uibridge:error', {
        command: commandName,
        args,
        error: error.message,
        duration,
        executionId
      });
      
      // Add error to history
      this._addToHistory({
        command: commandName,
        args,
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
        status: 'failed'
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
    return this.registry.getAll().map(cmd => ({
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
    this._log('Command history cleared');
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
      uptime: this._initStartTime ? (typeof performance !== 'undefined' ? performance.now() : Date.now()) - this._initStartTime : 0
    };
  }

  /**
   * Register a custom command
   * @param {string} name - Command name
   * @param {Object} command - Command implementation
   */
  registerCommand(name, command) {
    this.registry.register(name, command);
    this._log(`Custom command registered: ${name}`);
    
    // Update CDI if available
    if (this.cdiGenerator) {
      this._generateCDI();
    }
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   * @returns {boolean} True if command was removed
   */
  unregisterCommand(name) {
    const removed = this.registry.unregister(name);
    if (removed) {
      this._log(`Command unregistered: ${name}`);
      
      // Update CDI if available
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
    this._log('Screenshot configuration updated:', this.config.defaultScreenshotConfig);
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
      { name: 'click', implementation: clickCommand },
      { name: 'screenshot', implementation: screenshotCommand },
      { name: 'help', implementation: helpCommand }
    ];
    
    for (const { name, implementation } of commands) {
      if (this.config.commands.includes(name)) {
        this.registry.register(name, implementation);
        this._log(`Registered core command: ${name}`);
      }
    }
  }

  /**
   * Setup discovery endpoints
   * @private
   */
  _setupDiscovery() {
    if (this.config.enableHttpDiscovery) {
      // Simulate HTTP endpoint for development
      window.__uibridge_discovery__ = () => {
        return this.discover();
      };
      
      window.__uibridge_status__ = () => {
        return this.getStatus();
      };
      
      this._log('HTTP discovery endpoints enabled');
    }
  }

  /**
   * Setup global APIs
   * @private
   */
  _setupGlobalAPI() {
    // Main global API
    window.UIBridge = UIBridge;
    window.uibridge = this;
    
    // Legacy/convenience APIs
    window.__uibridge__ = {
      execute: this.execute.bind(this),
      discover: this.discover.bind(this),
      findElement: this.findElement.bind(this),
      findElements: this.findElements.bind(this),
      getStatus: this.getStatus.bind(this),
      getHistory: this.getHistory.bind(this)
    };
    
    this._log('Global APIs exposed');
  }

  /**
   * Generate and optionally display CDI
   * @private
   */
  _generateCDI() {
    if (!this.cdiGenerator) return;
    
    try {
      if (this.config.debug) {
        console.log('=== UIBridge Command Discovery Interface ===');
        console.log(this.cdiGenerator.generateMarkdown());
        console.log('=== End CDI ===');
      }
      
      // Expose CDI methods globally for development
      window.__uibridge_cdi__ = {
        markdown: () => this.cdiGenerator.generateMarkdown(),
        json: () => this.cdiGenerator.generateJSON(),
        save: (format) => this.cdiGenerator.saveToFile(format)
      };
      
    } catch (error) {
      this._log('Failed to generate CDI:', error);
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
    if (typeof window !== 'undefined' && window.dispatchEvent) {
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
      console.log('[UIBridge]', ...args);
    }
  }

  /**
   * Get help information for commands - AI-friendly format
   * @param {string} commandName - Specific command to get help for, or null for general help
   * @returns {object} Help information structured for AI agents and developers
   */
  getHelp(commandName = null) {
    if (commandName) {
      // Get help for specific command
      const command = this.registry.get(commandName);
      if (!command) {
        const available = this.registry.getAll().map(cmd => cmd.name).join(', ');
        return {
          error: `Unknown command: ${commandName}`,
          availableCommands: available,
          suggestion: `Use 'help' without arguments to see all commands`,
          aiGuidance: `AI Agents: Use execute('help') to discover available commands or check spelling of '${commandName}'`
        };
      }

      return {
        command: command.name,
        description: command.description,
        parameters: command.parameters,
        examples: command.examples || [],
        usage: this._generateUsage(command),
        aiTips: this._getAITipsForCommand(command.name)
      };
    }

    // General help - AI-optimized
    const commands = this.registry.getAll();
    
    return {
      framework: 'UIBridge',
      version: this.config.version || '1.0.0',
      description: 'In-app automation framework for web applications - designed for AI agent control',
      
      // AI Quick Start Guide
      aiQuickStart: {
        step1: "Execute commands using: await uibridge.execute('commandName', ...args)",
        step2: "Find elements using selectors: CSS, text content, test IDs, XPath",
        step3: "Handle errors with try/catch blocks",
        step4: "Use await for all commands as they return promises"
      },

      // Core commands with AI usage patterns
      commands: commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        parameters: cmd.parameters.length,
        usage: this._generateUsage(cmd),
        aiUseCase: this._getAIUseCase(cmd.name)
      })),

      // AI-optimized automation patterns
      automationPatterns: {
        'Click any button': {
          pattern: "execute('click', selector)",
          examples: [
            "execute('click', '#submit')",
            "execute('click', { text: 'Submit' })",
            "execute('click', { testId: 'submit-btn' })"
          ],
          aiTip: "Try multiple selector strategies if one fails"
        },
        'Take screenshots': {
          pattern: "execute('screenshot', options)",
          examples: [
            "execute('screenshot', { fullPage: true })",
            "execute('screenshot', { selector: '#content' })",
            "execute('screenshot', { saveConfig: { autoSave: true } })"
          ],
          aiTip: "Screenshots are useful for verification and debugging"
        },
        'Discover available actions': {
          pattern: "discover() or execute('help')",
          examples: [
            "const commands = uibridge.discover()",
            "const help = await uibridge.execute('help')"
          ],
          aiTip: "Use this to understand what actions are available"
        }
      },

      // Selector strategies for AI agents
      selectorStrategies: {
        priority: "Try strategies in this order for best results",
        strategies: {
          1: { method: "Test ID", syntax: "{ testId: 'element-id' }", reliability: "highest" },
          2: { method: "CSS ID", syntax: "'#element-id'", reliability: "high" },
          3: { method: "CSS Class", syntax: "'.class-name'", reliability: "medium" },
          4: { method: "Text Content", syntax: "{ text: 'Button Text' }", reliability: "medium" },
          5: { method: "Aria Label", syntax: "{ ariaLabel: 'Button Label' }", reliability: "medium" },
          6: { method: "XPath", syntax: "{ xpath: '//button[text()=\"Submit\"]' }", reliability: "advanced" }
        }
      },

      // AI automation best practices
      aiBestPractices: [
        "Always use await when executing commands",
        "Wrap commands in try/catch blocks for error handling",
        "Use specific selectors (ID, testId) when possible",
        "Take screenshots to verify actions completed successfully",
        "Use help('commandName') to understand specific command options",
        "Check element existence before interaction",
        "Wait for dynamic content to load before acting"
      ],

      // Error handling guide for AI
      errorHandling: {
        "Element not found": {
          solution: "Try different selector strategies or wait for element to appear",
          code: "try { await execute('click', '#btn'); } catch(e) { await execute('click', {text: 'Submit'}); }"
        },
        "Command failed": {
          solution: "Check command syntax and parameters",
          code: "const help = await execute('help', 'click'); console.log(help.usage);"
        },
        "Screenshot failed": {
          solution: "Ensure element is visible and page is loaded",
          code: "await execute('screenshot', { selector: 'body', fullPage: true });"
        }
      },

      // Workflow patterns for AI agents
      workflowPatterns: {
        "Form submission": [
          "1. Find and fill input fields",
          "2. Click submit button", 
          "3. Take screenshot to verify",
          "Example: execute('click', { text: 'Submit' })"
        ],
        "Navigation and verification": [
          "1. Take screenshot of current state",
          "2. Click navigation element",
          "3. Wait for page load",
          "4. Take screenshot to verify navigation"
        ],
        "Content interaction": [
          "1. Find target element using multiple selector strategies",
          "2. Execute action (click, screenshot, etc.)",
          "3. Verify result with screenshot or status check"
        ]
      },

      // PowerShell REST API patterns for external AI agents
      powershellPatterns: {
        "Basic Click Command": {
          description: "Execute click action via PowerShell REST API",
          code: `$params = @{
    Uri = 'http://localhost:3001/execute-command'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = 'click'
        selector = '#submit-button'
    } | ConvertTo-Json
}
$response = Invoke-RestMethod @params`
        },
        "Screenshot with Auto-Save": {
          description: "Take screenshot and save automatically",
          code: `$params = @{
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
$response = Invoke-RestMethod @params`
        },
        "Reusable Function": {
          description: "Create reusable PowerShell function for UIBridge commands",
          code: `function Invoke-UIBridgeCommand {
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
Invoke-UIBridgeCommand -Command 'click' -Parameters @{selector='#btn'}`
        }
      },

      // External API information
      restApiInfo: {
        server: "Start with: node server-example.cjs",
        baseUrl: "http://localhost:3001",
        endpoints: {
          executeCommand: "POST /execute-command",
          getStatus: "GET /status", 
          getHelp: "GET /discover-commands"
        },
        powershellTips: [
          "Always use Invoke-RestMethod with hashtable splatting",
          "Include proper error handling with try/catch blocks",
          "Use ConvertTo-Json -Depth 4 for nested objects",
          "Store common configuration in reusable variables"
        ]
      }
    };
  }

  /**
   * Get AI-specific tips for a command
   * @private
   */
  _getAITipsForCommand(commandName) {
    const tips = {
      click: [
        "Try multiple selector strategies if element not found",
        "Use force: true option if element is covered",
        "Consider scroll behavior - element might be off-screen",
        "PowerShell API: Use selector parameter in request body"
      ],
      screenshot: [
        "Use fullPage: true for complete page capture",
        "Specify selector for element-specific screenshots", 
        "Set saveConfig for automatic file saving",
        "PowerShell API: Use -Depth 4 with ConvertTo-Json for nested options"
      ],
      help: [
        "Use without arguments for full command list",
        "Specify command name for detailed help",
        "Check usage examples for proper syntax",
        "PowerShell API: Available at GET /discover-commands endpoint"
      ]
    };
    return tips[commandName] || ["Execute with proper await syntax", "Handle errors with try/catch"];
  }

  /**
   * Get AI use case for a command
   * @private
   */
  _getAIUseCase(commandName) {
    const useCases = {
      click: "Interact with buttons, links, form elements, and any clickable UI component",
      screenshot: "Capture visual state for verification, debugging, or documentation",
      help: "Discover available commands and learn proper usage syntax"
    };
    return useCases[commandName] || "General automation command";
  }

  /**
   * Generate usage string for a command
   * @private
   */
  _generateUsage(command) {
    const params = command.parameters.map(p => {
      const name = p.required ? p.name : `[${p.name}]`;
      return name;
    }).join(', ');

    return `execute('${command.name}'${params ? ', ' + params : ''})`;
  }

  /**
   * Add command to execution history
   * @private
   */
  _addToHistory(entry) {
    if (!this._commandHistory) {
      this._commandHistory = [];
    }

    this._commandHistory.unshift(entry);
    
    // Keep only last 50 entries
    if (this._commandHistory.length > 50) {
      this._commandHistory = this._commandHistory.slice(0, 50);
    }
  }

  /**
   * Start remote control polling
   * This automatically checks for commands from the server
   */
  startRemoteControl() {
    if (this._isPolling) {
      this._log('Remote control already running');
      return;
    }

    if (typeof window === 'undefined') {
      this._log('Remote control not available in non-browser environment');
      return;
    }

    this._isPolling = true;
    this._log(`Starting remote control polling: ${this.config.serverUrl}`);
    
    // Make UIBridge globally available for the server
    window.uibridge = this;
    
    this._pollForCommands();
  }

  /**
   * Stop remote control polling
   */
  stopRemoteControl() {
    if (!this._isPolling) {
      return;
    }

    this._isPolling = false;
    if (this._pollTimeoutId) {
      clearTimeout(this._pollTimeoutId);
      this._pollTimeoutId = null;
    }
    
    this._log('Remote control polling stopped');
  }

  /**
   * Poll for commands from the server
   * @private
   */
  async _pollForCommands() {
    if (!this._isPolling) {
      return;
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/pending-commands`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.commands && data.commands.length > 0) {
          this._log(`Received ${data.commands.length} command(s) from server`);
          
          for (const command of data.commands) {
            await this._executeRemoteCommand(command);
          }
        }
      }
    } catch (error) {
      // Server might not be running yet or network error - that's ok
      if (this.config.debug) {
        this._log('Poll failed (server may not be running):', error.message);
      }
    }

    // Schedule next poll
    if (this._isPolling) {
      this._pollTimeoutId = setTimeout(() => {
        this._pollForCommands();
      }, this.config.pollInterval);
    }
  }

  /**
   * Execute a command received from the server
   * @param {Object} commandData - Command data from server
   * @private
   */
  async _executeRemoteCommand(commandData) {
    const { id, command, selector, options } = commandData;
    
    this._log(`Executing remote command: ${command}`, { id, selector, options });

    try {
      let result;
      
      // Execute the command based on type
      if (command === 'click') {
        result = await this.execute('click', selector, options);
      } else if (command === 'screenshot') {
        result = await this.execute('screenshot', options);
      } else {
        // Generic command execution
        const args = [];
        if (selector !== undefined) args.push(selector);
        if (options !== undefined) args.push(options);
        result = await this.execute(command, ...args);
      }

      // Send success result back to server
      await this._sendCommandResult(id, { success: true, result });
      
      this._log(`Remote command ${command} executed successfully`, result);
      
    } catch (error) {
      this._log(`Remote command ${command} failed:`, error);
      
      // Send error result back to server
      await this._sendCommandResult(id, { 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Send command result back to the server
   * @param {string} commandId - Command ID
   * @param {Object} result - Result data
   * @private
   */
  async _sendCommandResult(commandId, result) {
    try {
      await fetch(`${this.config.serverUrl}/command-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commandId,
          ...result
        })
      });
    } catch (error) {
      this._log('Failed to send command result:', error);
    }
  }

  /**
   * Get remote control status
   */
  getRemoteControlStatus() {
    return {
      enabled: this.config.enableRemoteControl,
      polling: this._isPolling,
      serverUrl: this.config.serverUrl,
      pollInterval: this.config.pollInterval
    };
  }


}

// Auto-initialize on load if window is available
if (typeof window !== 'undefined' && !window.UIBridge) {
  window.UIBridge = UIBridge;
} 