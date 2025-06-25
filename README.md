# 🌉 UIBridge - AI-Powered Web Automation Framework

> **For AI Agents & Developers**: UIBridge enables programmatic control of web applications through simple commands. Perfect for AI-driven automation, testing, and interaction workflows.

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 NEW in v1.3.0: AI-Optimized Automation

UIBridge now includes **simplified PowerShell helpers** that make AI automation incredibly easy. What used to require complex REST calls is now simple function calls!

```powershell
# ✅ NEW AI-FRIENDLY WAY - Copy helper file to your project
. .\uibridge-powershell-helpers.ps1

# Complete automation in 3 lines:
Start-UIBridgeSession -Url "http://localhost:5173"    # Setup + navigate + screenshot
Click-UIBridgeText -Text "Submit"                     # Click button by text
Take-UIBridgeScreenshot                               # Verify with screenshot
```

```javascript
// ✅ Enable in your web app - All you need for remote control
const uibridge = new UIBridge({ 
  enableRemoteControl: true  // 🎯 That's it!
});
await uibridge.init();
// 🤖 External automation now works automatically!
```

📖 **[Complete Migration Guide](./documentation/ssd.md)** | 🚀 **[PowerShell Helpers](./uibridge-powershell-helpers.ps1)**

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

### 4. External Automation (PowerShell/AI) - **RECOMMENDED**
```powershell
# ✅ Use the simplified PowerShell helpers (MUCH easier for AI agents)
. .\uibridge-powershell-helpers.ps1

# Complete automation in 3 simple commands:
Start-UIBridgeSession -Url "http://localhost:5173"
Click-UIBridgeText -Text "Submit"
Take-UIBridgeScreenshot
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

## 🚀 PowerShell Automation for AI - **SIMPLIFIED**

### ⚡ Quick Setup (One-Time)
```powershell
# Download the helper functions to your project
# Copy uibridge-powershell-helpers.ps1 to your project folder
```

### 🎯 AI-Friendly Functions
```powershell
# Load helpers (do this once per session)
. .\uibridge-powershell-helpers.ps1

# Essential commands for AI agents:
Test-UIBridgeServer                          # Check if server is running
Open-UIBridgePage -Url "https://example.com" # Navigate to page
Take-UIBridgeScreenshot                      # Screenshot (auto-saves)
Click-UIBridgeText -Text "Submit"            # Click by button text
Click-UIBridgeElement -Selector "#btn"       # Click by CSS selector
Get-UIBridgePageInfo                         # Get page title/URL
Start-UIBridgeSession -Url "URL"             # Complete setup in one command
```

### 🤖 AI Automation Pattern
```powershell
# Complete automation workflow - simple & reliable
. .\uibridge-powershell-helpers.ps1

# Start session (checks server + navigates + initial screenshot)
$session = Start-UIBridgeSession -Url "http://localhost:5173"

# Interact with the page
Click-UIBridgeText -Text "Make Background Yellow"

# Verify the change
Take-UIBridgeScreenshot

# Done! 🎉
```

### 🔍 Why This Is Better for AI Agents
- **No JSON construction** - functions handle it internally
- **Built-in error handling** - clear success/failure messages
- **Automatic screenshots** - saved with timestamps
- **Simple function names** - easy for AI to remember
- **Rich console feedback** - colored output for debugging

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

## 🤖 AI Agent Quick Rules

**For Cursor/AI Tools - Use these simple patterns:**

```powershell
# 1. Always load helpers first
. .\uibridge-powershell-helpers.ps1

# 2. Start with session setup
Start-UIBridgeSession -Url "YOUR_URL"

# 3. Click elements by text (most reliable)
Click-UIBridgeText -Text "Button Text"

# 4. Take screenshots for verification
Take-UIBridgeScreenshot

# 5. Check server health if things fail
Test-UIBridgeServer
```

**🎯 AI Success Pattern:**
1. **Load helpers** → 2. **Start session** → 3. **Click/interact** → 4. **Take screenshot** → 5. **Done!**

**⚠️ AI Common Mistakes to Avoid:**
- Don't construct JSON manually - use the helper functions
- Don't forget to load the helpers with `. .\uibridge-powershell-helpers.ps1`
- Don't skip screenshots - they verify your actions worked
- Don't use complex selectors - prefer text-based clicking

## 📚 Documentation & Support

- **📖 Setup Guide**: [Simplified Setup Documentation](./documentation/ssd.md)
- **🤖 AI Guide**: [CURSOR_AI_USAGE_RULES.md](./CURSOR_AI_USAGE_RULES.md)
- **⚡ PowerShell Helpers**: `uibridge-powershell-helpers.ps1` (copy to your project)
- **🛠️ API Reference**: Use `execute('help')` for built-in documentation
- **🐛 Issues**: [GitHub Issues](https://github.com/sashbot/uibridge-js/issues)
- **📦 NPM**: [@sashbot/uibridge](https://www.npmjs.com/package/@sashbot/uibridge)

## 🎯 Key Benefits

- **🚀 Zero Setup**: `enableRemoteControl: true` and you're done
- **🤖 AI-Optimized**: PowerShell helpers make automation 10x easier for AI agents
- **⚡ Simple Commands**: `Click-UIBridgeText -Text "Submit"` instead of complex REST calls
- **📱 Universal**: Works with any JavaScript framework
- **🛡️ Reliable**: Built-in error handling and retry logic
- **📸 Auto-Screenshots**: Every action can be verified visually
- **🔒 Secure**: Standard HTTP communication, no special permissions needed

---

**🤖 Built for AI**: UIBridge v1.3.0+ is specifically designed to make web automation trivial for AI agents, eliminating complexity while providing powerful automation capabilities. 