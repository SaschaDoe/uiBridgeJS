# 🌉 UIBridge - AI-Powered Web Automation Framework

> **For AI Agents & Developers**: UIBridge enables programmatic control of web applications through simple commands. Perfect for AI-driven automation, testing, and interaction workflows.

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🤖 AI Agent Quick Start

UIBridge is designed to be AI-friendly with simple, natural commands:

### For AI Agents Using PowerShell (Recommended)
```powershell
# 1. First run: npx uibridge-setup (copies server files)
# 2. Start server: node uibridge-api-server.cjs

$params = @{
    Uri = 'http://localhost:3002/execute'  # Note: Port 3002 for api-server
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = 'click'
        selector = '#submit-button'
    } | ConvertTo-Json
}
$response = Invoke-RestMethod @params
```

📖 **[Complete PowerShell Guide](./POWERSHELL_AGENT_GUIDE.md)** | 🚀 **[Example Script](./example-powershell-automation.ps1)**

### For Browser/JavaScript Integration
```javascript
// Basic automation pattern for AI agents
await uibridge.execute('click', '#submit-button');
await uibridge.execute('screenshot', { fullPage: true });
await uibridge.execute('help', 'click'); // Get command details
```

## ⚡ Installation & Setup

### Method 1: NPM Package (Recommended for AI)
```bash
npm install @sashbot/uibridge
```

### 🚀 Quick Server Setup (Essential for AI Automation)
After installing UIBridge, you need to copy the server files to your project:

```bash
# Option 1: Use the setup helper (recommended)
npx uibridge-setup

# Option 2: Use npm script
npm run setup-server
```

This will copy:
- `uibridge-api-server.cjs` - Full API server for automation (Port 3002)
- `uibridge-queue-server.cjs` - Queue-only server (Port 3001) 
- `uibridge-test.html` - Test page for verification
- `uibridge-test.ps1` - PowerShell test script

Then start the server:
```bash
node uibridge-api-server.cjs   # Recommended for AI agents
# OR
node uibridge-queue-server.cjs # Basic queue functionality
```

```javascript
import UIBridge from '@sashbot/uibridge';

const bridge = new UIBridge({ debug: true });
await bridge.init();

// Now ready for AI automation
await bridge.execute('click', { text: 'Submit' });
```

### Method 2: Browser Script (Global Instance)
```html
<script src="https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js"></script>
<script>
  // Automatically available as window.uibridge
  await window.uibridge.execute('click', '#my-button');
</script>
```

## 🎯 Core Commands for AI Agents

### 1. Click Automation
```javascript
// Multiple selector strategies - try in order of reliability:
await uibridge.execute('click', { testId: 'submit-btn' });    // Highest reliability
await uibridge.execute('click', '#submit-button');           // High reliability  
await uibridge.execute('click', { text: 'Submit' });         // Medium reliability
await uibridge.execute('click', { ariaLabel: 'Submit form' }); // Medium reliability
```

### 2. Screenshot Capture
```javascript
// Full page screenshot for verification
await uibridge.execute('screenshot', { fullPage: true });

// Element-specific screenshot
await uibridge.execute('screenshot', { 
  selector: '#main-content',
  saveConfig: { autoSave: true, folder: 'ai-screenshots' }
});
```

### 3. Command Discovery
```javascript
// Get all available commands
const commands = uibridge.discover();

// Get detailed help
const help = await uibridge.execute('help');
console.log(help.automationPatterns); // AI-specific patterns
```

## 🧠 AI Automation Patterns

### Pattern 1: Element Interaction with Fallbacks
```javascript
async function aiClickElement(identifier) {
  const strategies = [
    { testId: identifier },
    `#${identifier}`,
    { text: identifier },
    { ariaLabel: identifier }
  ];
  
  for (const strategy of strategies) {
    try {
      const result = await uibridge.execute('click', strategy);
      await uibridge.execute('screenshot', { fullPage: true }); // Verify
      return result;
    } catch (error) {
      console.log(`Strategy failed: ${JSON.stringify(strategy)}`);
    }
  }
  throw new Error(`Could not find element: ${identifier}`);
}
```

### Pattern 2: Form Submission Workflow
```javascript
async function submitForm(formData) {
  // 1. Take before screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'before-submit' }
  });
  
  // 2. Find and click submit
  await uibridge.execute('click', { text: 'Submit' });
  
  // 3. Verify with after screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'after-submit' }
  });
}
```

### Pattern 3: Page Navigation & Verification
```javascript
async function navigateAndVerify(linkText) {
  await uibridge.execute('click', { text: linkText });
  
  // Wait a moment for navigation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Capture result
  return await uibridge.execute('screenshot', { fullPage: true });
}
```

## 🎛️ Advanced AI Configuration

```javascript
const bridge = new UIBridge({
  debug: true, // Enable logging for AI debugging
  autoInit: false, // Manual control over initialization
  defaultScreenshotConfig: {
    autoSave: true,
    folder: 'ai-automation-screenshots',
    timestamp: true,
    includeMetadata: true // Useful for AI analysis
  }
});

await bridge.init();
```

## 🔧 Error Handling for AI Agents

```javascript
async function robustAIExecution(command, ...args) {
  try {
    const result = await uibridge.execute(command, ...args);
    console.log(`✅ Command ${command} succeeded:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Command ${command} failed:`, error.message);
    
    // Get help for the command
    const help = await uibridge.execute('help', command);
    console.log('Available options:', help.examples);
    
    // Try alternative approaches based on command
    if (command === 'click') {
      return await tryAlternativeSelectors(args[0]);
    }
    
    throw error;
  }
}
```

## 🌐 Environment Compatibility

### SvelteKit/SSR Environments
```javascript
import { onMount } from 'svelte';
import { browser } from '$app/environment';

onMount(async () => {
  if (!browser) return; // SSR safety
  
  const { default: UIBridge } = await import('@sashbot/uibridge');
  const bridge = new UIBridge({ debug: true });
  await bridge.init();
  
  // AI automation ready
});
```

### Playwright/Puppeteer Integration
```javascript
// In your test/automation script
const page = await browser.newPage();
await page.goto('http://localhost:3000');

// Inject UIBridge
await page.addScriptTag({
  url: 'https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js'
});

// Wait for initialization
await page.waitForFunction(() => window.uibridge?._isInitialized);

// AI can now control the page
const result = await page.evaluate(async () => {
  return await window.uibridge.execute('click', { text: 'Submit' });
});
```

## 📊 AI Command Discovery

```javascript
// Get machine-readable command information
const commands = uibridge.discover();
commands.forEach(cmd => {
  console.log(`${cmd.name}: ${cmd.description}`);
  console.log(`Parameters: ${cmd.parameters.length}`);
  console.log(`Examples: ${cmd.examples}`);
});

// Get AI-optimized help
const aiHelp = await uibridge.execute('help');
console.log('AI Best Practices:', aiHelp.aiBestPractices);
console.log('Automation Patterns:', aiHelp.automationPatterns);
console.log('Error Handling:', aiHelp.errorHandling);
```

## 🚀 Production AI Deployment

### Environment Variables
```bash
# For AI debugging
UIBRIDGE_DEBUG=true
UIBRIDGE_SCREENSHOT_FOLDER=ai-automation-logs
UIBRIDGE_AUTO_SAVE=true
```

### Performance Optimization
```javascript
// Optimized for AI batch operations
const bridge = new UIBridge({
  debug: false, // Disable in production
  generateCDI: false, // Skip documentation generation
  defaultScreenshotConfig: {
    format: 'jpeg',
    quality: 0.7, // Smaller files for AI processing
    autoSave: false // Handle saving manually
  }
});
```

## 📚 Complete API Reference

### Core Methods
- `execute(command, ...args)` - Execute any UIBridge command
- `discover()` - Get all available commands
- `getStatus()` - Get bridge status and configuration
- `getHistory()` - Get command execution history

### Available Commands
- `click` - Interact with any clickable element
- `screenshot` - Capture page or element screenshots
- `help` - Get command documentation and AI guidance

### Selector Strategies (Priority Order)
1. **Test ID**: `{ testId: 'element-id' }` - Most reliable
2. **CSS ID**: `'#element-id'` - High reliability
3. **CSS Class**: `'.class-name'` - Medium reliability
4. **Text Content**: `{ text: 'Button Text' }` - Medium reliability
5. **Aria Label**: `{ ariaLabel: 'Label' }` - Medium reliability
6. **XPath**: `{ xpath: '//button[@id="submit"]' }` - Advanced use

## 🌐 REST API for AI Agents (PowerShell & Curl)

UIBridge includes a REST API server for external control, perfect for AI agents like Cursor using PowerShell commands.

### Starting the REST API Server
```bash
# Install dependencies first
npm install express cors fs-extra

# Start the UIBridge REST API server
node server-example.cjs
```

Server runs on `http://localhost:3001` with these endpoints:
- `POST /execute-command` - Execute UIBridge commands
- `GET /pending-commands` - Get queued commands for web app
- `POST /command-result` - Update command results
- `POST /save-screenshot` - Save screenshot data
- `GET /status` - Server health check

### PowerShell Automation for AI Agents

**Best Practice: Use `Invoke-RestMethod` with splatting for clean, maintainable PowerShell code.**

#### Click Element via PowerShell
```powershell
# Define parameters in a hashtable (PowerShell best practice)
$params = @{
    Uri         = 'http://localhost:3001/execute-command'
    Method      = 'POST'
    Headers     = @{
        'Content-Type' = 'application/json'
        'Accept'       = 'application/json'
    }
    Body        = @{
        command  = 'click'
        selector = '#submit-button'
        options  = @{
            force = $true
        }
    } | ConvertTo-Json
}

# Execute the request
try {
    $response = Invoke-RestMethod @params
    Write-Host "✅ Click successful: $($response.message)"
} catch {
    Write-Error "❌ Click failed: $_"
}
```

#### Take Screenshot via PowerShell
```powershell
$params = @{
    Uri         = 'http://localhost:3001/execute-command'
    Method      = 'POST'
    Headers     = @{ 'Content-Type' = 'application/json' }
    Body        = @{
        command = 'screenshot'
        options = @{
            fullPage = $true
            saveConfig = @{
                autoSave = $true
                folder = 'ai-screenshots'
                prefix = 'automation'
                timestamp = $true
            }
        }
    } | ConvertTo-Json -Depth 4
}

$response = Invoke-RestMethod @params
Write-Host "📸 Screenshot saved: $($response.command.result.fileName)"
```

#### Reusable PowerShell Functions for AI
```powershell
# Store common configuration
$global:UIBridgeConfig = @{
    BaseUri = 'http://localhost:3001'
    Headers = @{ 'Content-Type' = 'application/json' }
}

function Invoke-UIBridgeCommand {
    param(
        [string]$Command,
        [hashtable]$Parameters = @{},
        [hashtable]$Options = @{}
    )
    
    $params = @{
        Uri     = "$($global:UIBridgeConfig.BaseUri)/execute-command"
        Method  = 'POST'
        Headers = $global:UIBridgeConfig.Headers
        Body    = @{
            command = $Command
        } | ConvertTo-Json -Depth 4
    }
    
    # Add parameters to body
    $bodyObj = $params.Body | ConvertFrom-Json
    if ($Parameters.Count -gt 0) {
        foreach ($key in $Parameters.Keys) {
            $bodyObj | Add-Member -NotePropertyName $key -NotePropertyValue $Parameters[$key]
        }
    }
    if ($Options.Count -gt 0) {
        $bodyObj | Add-Member -NotePropertyName 'options' -NotePropertyValue $Options
    }
    
    $params.Body = $bodyObj | ConvertTo-Json -Depth 4
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Error "UIBridge command '$Command' failed: $_"
        throw
    }
}

# Usage examples:
# Invoke-UIBridgeCommand -Command 'click' -Parameters @{selector='#btn'}
# Invoke-UIBridgeCommand -Command 'screenshot' -Options @{fullPage=$true}
```

#### AI Agent Workflow with PowerShell
```powershell
# Complete automation workflow
function Start-UIBridgeAutomation {
    param([string]$TargetUrl = 'http://localhost:3000')
    
    Write-Host "🤖 Starting UIBridge automation workflow..."
    
    # 1. Check server status
    try {
        $status = Invoke-RestMethod -Uri 'http://localhost:3001/status'
        Write-Host "✅ UIBridge server is running"
    } catch {
        Write-Error "❌ UIBridge server not available. Run: node server-example.cjs"
        return
    }
    
    # 2. Take initial screenshot
    $screenshot1 = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
        fullPage = $true
        saveConfig = @{
            prefix = 'initial-state'
            timestamp = $true
        }
    }
    Write-Host "📸 Initial screenshot: $($screenshot1.command.result.fileName)"
    
    # 3. Execute click action
    $clickResult = Invoke-UIBridgeCommand -Command 'click' -Parameters @{
        selector = @{ text = 'Submit' }
    } -Options @{
        force = $true
    }
    Write-Host "🖱️ Click executed successfully"
    
    # 4. Take verification screenshot
    Start-Sleep -Seconds 2  # Wait for page response
    $screenshot2 = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
        fullPage = $true
        saveConfig = @{
            prefix = 'after-click'
            timestamp = $true
        }
    }
    Write-Host "📸 Verification screenshot: $($screenshot2.command.result.fileName)"
    
    Write-Host "✅ Automation workflow completed!"
}

# Run the automation
Start-UIBridgeAutomation
```

### Meta Prompt for Cursor AI

Use this meta prompt in Cursor to ensure clean PowerShell code generation:

```
When writing PowerShell code to send HTTP requests to UIBridge REST API, always follow these rules:

1. Use Invoke-RestMethod with hashtable splatting (not Invoke-WebRequest or curl)
2. Convert body data to JSON using ConvertTo-Json
3. Include proper error handling with try/catch
4. Use single quotes for strings unless variable interpolation is needed
5. Store common configuration in reusable variables

Template structure:
$params = @{
    Uri         = 'http://localhost:3001/execute-command'
    Method      = 'POST'
    Headers     = @{ 'Content-Type' = 'application/json' }
    Body        = @{
        command = '[COMMAND_NAME]'
        # Add command-specific parameters
    } | ConvertTo-Json
}

try {
    $response = Invoke-RestMethod @params
    # Process $response here
} catch {
    Write-Error "Request failed: $_"
}

Available UIBridge commands:
- click: Interact with elements (requires selector parameter)
- screenshot: Capture page images (optional: fullPage, selector, saveConfig)
- help: Get command documentation

Use -Depth parameter with ConvertTo-Json for nested objects.
```

## 🔍 Troubleshooting for AI

### Common Issues & Solutions

| Issue | AI Solution | PowerShell Example |
|-------|-------------|-------------------|
| Element not found | Try multiple selectors | `$selector = @{text='Submit'}; if($failed) {$selector='#submit'}` |
| Click failed | Use force option | `$options = @{force=$true}` |
| Screenshot empty | Check element visibility | `$options = @{selector='body'; fullPage=$true}` |
| Server not running | Start UIBridge server | `node server-example.cjs` |
| JSON depth issues | Use -Depth parameter | `ConvertTo-Json -Depth 4` |

### Debug Mode for AI
```javascript
// Enable detailed logging
const bridge = new UIBridge({ debug: true });

// All operations will log:
// - Command execution details
// - Element finding attempts  
// - Success/failure reasons
// - Performance metrics
```

```powershell
# PowerShell debugging
$params = @{
    Uri     = 'http://localhost:3001/execute-command'
    Method  = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body    = @{
        command = 'help'
    } | ConvertTo-Json
}

$help = Invoke-RestMethod @params
$help.command.result | ConvertTo-Json -Depth 3
```

## 📞 Support & Integration

- **🤖 PowerShell AI Guide**: [POWERSHELL_AGENT_GUIDE.md](./POWERSHELL_AGENT_GUIDE.md)
- **🚀 PowerShell Script**: [example-powershell-automation.ps1](./example-powershell-automation.ps1)
- **📚 Documentation**: [Full Usage Examples](./USAGE_EXAMPLES.md)
- **🛠️ AI Agent Guide**: Built-in help system with `execute('help')`
- **🌐 REST API**: Start with `node server-example.cjs` on port 3001
- **💻 PowerShell Scripts**: Use `Invoke-RestMethod` with splatting pattern
- **🐛 Issues**: [GitHub Issues](https://github.com/sashbot/uibridge-js/issues)
- **📦 NPM**: [@sashbot/uibridge](https://www.npmjs.com/package/@sashbot/uibridge)

---

**🤖 Built for AI**: UIBridge is specifically designed with AI agents in mind, providing clear command patterns, robust error handling, extensive automation capabilities, and PowerShell-friendly REST API integration. 