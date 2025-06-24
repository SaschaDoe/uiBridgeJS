# 🌉 UIBridge - AI-Powered Web Automation Framework

> **For AI Agents & Developers**: UIBridge enables programmatic control of web applications through simple commands. Perfect for AI-driven automation, testing, and interaction workflows.

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 NEW in v1.3.0: Zero-Configuration Remote Control

UIBridge now includes **built-in auto-polling** that eliminates the need for manual polling code. What used to require 50+ lines of boilerplate is now just one config option!

```javascript
// ✅ NEW WAY - All you need for remote control
const uibridge = new UIBridge({ 
  enableRemoteControl: true  // 🎯 That's it!
});
await uibridge.init();
// 🤖 External automation now works automatically!
```

📖 **[Complete Migration Guide](./documentation/ssd.md)** | 🚀 **[PowerShell Examples](./CURSOR_AI_USAGE_RULES.md)**

## ⚡ Quick Start

### 1. Installation
```bash
npm install @sashbot/uibridge
```

### 2. Setup Server (Essential for AI Automation)
```bash
npx uibridge-setup  # Copies server files to your project
node uibridge-api-server.cjs  # Start on port 3002
```

### 3. Enable in Your Web App
```javascript
// React/Svelte/Vue/Vanilla - works everywhere
import UIBridge from '@sashbot/uibridge';

const uibridge = new UIBridge({ 
  enableRemoteControl: true,  // Auto-polling enabled
  debug: true
});
await uibridge.init();
```

### 4. External Automation (PowerShell/AI)
```powershell
# Commands work immediately - no setup needed in web app
$params = @{
    Uri = 'http://localhost:3002/execute'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = 'click'
        selector = '#submit-button'
    } | ConvertTo-Json
}
$response = Invoke-RestMethod @params
```

## 🎯 Core Commands for AI Agents

### Click Automation
```javascript
// Multiple selector strategies - try in order of reliability:
await uibridge.execute('click', { testId: 'submit-btn' });    // Highest reliability
await uibridge.execute('click', '#submit-button');           // High reliability  
await uibridge.execute('click', { text: 'Submit' });         // Medium reliability
await uibridge.execute('click', { ariaLabel: 'Submit form' }); // Medium reliability
```

### Screenshot Capture
```javascript
// Full page screenshot for verification
await uibridge.execute('screenshot', { fullPage: true });

// Element-specific screenshot with auto-save
await uibridge.execute('screenshot', { 
  selector: '#main-content',
  saveConfig: { autoSave: true, folder: 'ai-screenshots' }
});
```

### Command Discovery
```javascript
// Get all available commands for AI agents
const commands = uibridge.discover();
const help = await uibridge.execute('help');
console.log(help.automationPatterns); // AI-specific patterns
```

## 🧠 AI Automation Patterns

### Pattern 1: Robust Element Interaction
```javascript
async function clickWithFallbacks(identifier) {
  const strategies = [
    { testId: identifier },
    `#${identifier}`,
    { text: identifier },
    { ariaLabel: identifier }
  ];
  
  for (const strategy of strategies) {
    try {
      await uibridge.execute('click', strategy);
      await uibridge.execute('screenshot', { fullPage: true }); // Verify
      return;
    } catch (error) {
      console.log(`Strategy failed: ${JSON.stringify(strategy)}`);
    }
  }
  throw new Error(`Could not find element: ${identifier}`);
}
```

### Pattern 2: Form Workflow
```javascript
async function submitFormWorkflow() {
  // Before screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'before-submit' }
  });
  
  // Submit action
  await uibridge.execute('click', { text: 'Submit' });
  
  // Verification screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'after-submit' }
  });
}
```

## 🔧 Configuration Options

```javascript
const uibridge = new UIBridge({
  // Remote control (NEW in v1.3.0)
  enableRemoteControl: true,        // Enable auto-polling
  serverUrl: 'http://localhost:3002', // Server endpoint
  pollInterval: 500,                // Polling frequency (ms)
  
  // General settings
  debug: true,
  defaultScreenshotConfig: {
    autoSave: true,
    folder: 'automation-screenshots',
    timestamp: true,
    includeMetadata: true
  }
});
```

## 🌐 Framework Compatibility

### SvelteKit/SSR Safe
```javascript
import { onMount } from 'svelte';
import { browser } from '$app/environment';

onMount(async () => {
  if (!browser) return; // SSR safety
  
  const { default: UIBridge } = await import('@sashbot/uibridge');
  const uibridge = new UIBridge({ 
    enableRemoteControl: true,
    debug: true 
  });
  await uibridge.init();
});
```

### React Integration
```javascript
import { useEffect } from 'react';
import UIBridge from '@sashbot/uibridge';

function App() {
  useEffect(() => {
    const initUIBridge = async () => {
      const uibridge = new UIBridge({ 
        enableRemoteControl: true 
      });
      await uibridge.init();
    };
    initUIBridge();
  }, []);
  
  return <div>Your App</div>;
}
```

### Vue.js Integration
```javascript
import { onMounted } from 'vue';
import UIBridge from '@sashbot/uibridge';

export default {
  setup() {
    onMounted(async () => {
      const uibridge = new UIBridge({ 
        enableRemoteControl: true 
      });
      await uibridge.init();
    });
  }
};
```

## 🚀 PowerShell Automation for AI

### Reusable Functions
```powershell
# Configuration
$global:UIBridgeConfig = @{
    BaseUri = 'http://localhost:3002'
    Headers = @{ 'Content-Type' = 'application/json' }
}

function Invoke-UIBridgeCommand {
    param([string]$Command, [hashtable]$Parameters = @{})
    
    $params = @{
        Uri = "$($global:UIBridgeConfig.BaseUri)/execute"
        Method = 'POST'
        Headers = $global:UIBridgeConfig.Headers
        Body = (@{ command = $Command } + $Parameters) | ConvertTo-Json -Depth 4
    }
    
    try {
        return Invoke-RestMethod @params
    } catch {
        Write-Error "UIBridge command failed: $_"
        throw
    }
}

# Usage examples:
Invoke-UIBridgeCommand -Command 'click' -Parameters @{selector='#btn'}
Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{options=@{fullPage=$true}}
```

### AI Workflow Example
```powershell
function Start-AIAutomation {
    Write-Host "🤖 Starting automation..."
    
    # Initial screenshot
    $screenshot1 = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
        options = @{
            fullPage = $true
            saveConfig = @{ prefix = 'initial'; timestamp = $true }
        }
    }
    
    # Execute action
    Invoke-UIBridgeCommand -Command 'click' -Parameters @{
        selector = @{ text = 'Submit' }
    }
    
    # Verification screenshot
    Start-Sleep -Seconds 2
    $screenshot2 = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
        options = @{
            fullPage = $true
            saveConfig = @{ prefix = 'after-click'; timestamp = $true }
        }
    }
    
    Write-Host "✅ Automation completed!"
}
```

## 🔍 Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `click` | Interact with elements | `execute('click', '#button')` |
| `screenshot` | Capture page/element | `execute('screenshot', {fullPage: true})` |
| `help` | Get documentation | `execute('help', 'click')` |

### Selector Priority (Most Reliable First)
1. **Test ID**: `{ testId: 'element-id' }` - Best for automation
2. **CSS ID**: `'#element-id'` - High reliability
3. **Text Content**: `{ text: 'Button Text' }` - Natural language
4. **Aria Label**: `{ ariaLabel: 'Label' }` - Accessibility-friendly
5. **CSS Class**: `'.class-name'` - Use sparingly

## 🛠️ Error Handling

```javascript
async function robustExecution(command, ...args) {
  try {
    const result = await uibridge.execute(command, ...args);
    console.log(`✅ ${command} succeeded:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${command} failed:`, error.message);
    
    // Get help for the command
    const help = await uibridge.execute('help', command);
    console.log('Available options:', help.examples);
    
    throw error;
  }
}
```

## 🧪 Testing & Verification

### Check Remote Control Status
```javascript
const status = uibridge.getRemoteControlStatus();
console.log(status);
// {
//   enabled: true,
//   polling: true,
//   serverUrl: 'http://localhost:3002',
//   pollInterval: 500
// }
```

### Test External Commands
```bash
# Health check
curl http://localhost:3002/health

# Test click command
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#test-button"}'

# Test screenshot
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'
```

## 📚 Documentation & Support

- **📖 Setup Guide**: [Simplified Setup Documentation](./documentation/ssd.md)
- **🤖 AI Guide**: [CURSOR_AI_USAGE_RULES.md](./CURSOR_AI_USAGE_RULES.md)
- **🛠️ API Reference**: Use `execute('help')` for built-in documentation
- **🐛 Issues**: [GitHub Issues](https://github.com/sashbot/uibridge-js/issues)
- **📦 NPM**: [@sashbot/uibridge](https://www.npmjs.com/package/@sashbot/uibridge)

## 🎯 Key Benefits

- **🚀 Zero Setup**: `enableRemoteControl: true` and you're done
- **🤖 AI-Friendly**: Designed for LLM agents and automation tools
- **📱 Universal**: Works with any JavaScript framework
- **🛡️ Reliable**: Built-in error handling and retry logic
- **⚡ Fast**: Optimized polling with minimal overhead
- **🔒 Secure**: Standard HTTP communication, no special permissions needed

---

**🤖 Built for AI**: UIBridge v1.3.0+ is specifically designed to make web automation trivial for AI agents, eliminating complexity while providing powerful automation capabilities. 