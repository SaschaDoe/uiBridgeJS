# 🌉 UIBridge - AI-Powered Browser Automation for AI Agents

> **Primary Method**: Use PowerShell helper functions for reliable, tested browser automation with built-in error handling and JSON validation.

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What UIBridge Does

UIBridge provides **reliable browser automation specifically designed for AI agents**. It runs automation against a real browser with visual feedback and comprehensive error handling.

**Perfect for**: AI agents, automation testing, web scraping, form filling, UI testing.

---

## 🚀 Quick Start for AI Agents (Recommended Method)

### Step 1: Install UIBridge
```bash
npm install @sashbot/uibridge
```

### Step 2: Start the Server
```bash
# Start the UIBridge server (keep this running)
node node_modules/@sashbot/uibridge/api-server.cjs
```
**✅ Server Status**: You should see `UIBridge API Server running on http://localhost:3002`

### Step 3: Load PowerShell Helper Functions
```powershell
# Download the helper functions (includes JSON corruption fixes)
curl -o uibridge-powershell-helpers.ps1 https://unpkg.com/@sashbot/uibridge@latest/uibridge-powershell-helpers.ps1

# Load the functions (do this first in every session)
. .\uibridge-powershell-helpers.ps1
```

### Step 4: Verify Everything Works
```powershell
# Test server connection
Test-UIBridgeServer

# Start a complete automation session (opens browser and takes screenshot)
Start-UIBridgeSession -Url "https://example.com"
```

**🎉 That's it!** You now have reliable browser automation with proper error handling.

---

## 🤖 Core AI Agent Commands (Primary Method)

### 🔗 Connection & Navigation
```powershell
# Always load helpers first in every session
. .\uibridge-powershell-helpers.ps1

# Test server connection
Test-UIBridgeServer

# Navigate to any URL
Open-UIBridgePage -Url "https://example.com"
Open-UIBridgePage -Url "http://localhost:3000"

# Get current page information
Get-UIBridgePageInfo
```

### 🖱️ Clicking Elements (Robust with Multiple Strategies)
```powershell
# Click by text content (RECOMMENDED - most reliable)
Click-UIBridgeText -Text "Submit"
Click-UIBridgeText -Text "Login"
Click-UIBridgeText -Text "Save Changes"

# Click by test ID (best for testing)
Click-UIBridgeTestId -TestId "submit-btn"
Click-UIBridgeTestId -TestId "login-button"

# Click by CSS selector (when other methods don't work)
Click-UIBridgeElement -Selector "#save-button"
Click-UIBridgeElement -Selector ".submit-btn"
Click-UIBridgeElement -Selector "button[type='submit']"
```

### 📸 Screenshots (Auto-Saved with Validation)
```powershell
# Basic screenshot (recommended)
Take-UIBridgeScreenshot

# Full page screenshot with options
Take-UIBridgeScreenshot -FullPage $true -Format "png" -Quality 90

# Screenshot with specific background color
Take-UIBridgeScreenshot -BackgroundColor "white"
Take-UIBridgeScreenshot -BackgroundColor "transparent"
Take-UIBridgeScreenshot -BackgroundColor "auto"  # Auto-detect page background

# List all saved screenshots
Get-UIBridgeScreenshots
```

### 🔄 Complete Automation Workflows
```powershell
# Complete automation session with error handling
Start-UIBridgeSession -Url "https://example.com"

# Example: Form automation workflow
. .\uibridge-powershell-helpers.ps1
Test-UIBridgeServer
Open-UIBridgePage -Url "https://example.com/form"
Take-UIBridgeScreenshot  # Before
Click-UIBridgeText -Text "Fill Form"
Take-UIBridgeScreenshot  # After
Click-UIBridgeTestId -TestId "submit-btn"
Take-UIBridgeScreenshot  # Final result
Get-UIBridgeScreenshots  # Review all screenshots
```

---

## ✅ Why PowerShell Helpers Are the Primary Method

### 🛡️ **Built-in Reliability** (v1.2.5+ includes JSON corruption fixes)
- **JSON Validation**: Every command validates JSON before sending to prevent corruption errors
- **Consistent Formatting**: All JSON uses proper depth and escaping
- **Error Handling**: Clear error messages with troubleshooting guidance
- **Special Character Support**: Handles quotes, apostrophes, unicode, emoji correctly

### 🎯 **AI Agent Optimized**
- **Simple Function Calls**: `Click-UIBridgeText -Text "Submit"` instead of complex JSON
- **Multiple Click Strategies**: Automatic fallback between text, testId, and CSS selectors
- **Auto-Save Screenshots**: Timestamps and organized file management
- **Connection Testing**: Built-in server health checks

### 🧪 **Comprehensive Testing**
- **17 Unit Tests**: JSON generation, special characters, error handling
- **Integration Tests**: Real server and browser testing
- **Regression Prevention**: Prevents the return of JSON corruption bugs

```powershell
# Run tests to verify everything works
pwsh -ExecutionPolicy Bypass -File test-powershell-helpers.ps1
```

---

## 🔧 When to Use Alternative Methods

The PowerShell helpers are the **recommended primary method**, but use alternatives for these specific scenarios:

### 🌐 Live Session Method (Visual Debugging)
**Use when**: You need to see automation happen in real-time in your own browser
```html
<!-- Add to your web app for live visual feedback -->
<script src="http://localhost:3002/uibridge-client.js"></script>
```
```powershell
# Download live session helpers
curl -o uibridge-live-session-helpers.ps1 https://unpkg.com/@sashbot/uibridge@latest/uibridge-live-session-helpers.ps1
. .\uibridge-live-session-helpers.ps1

# Control YOUR browser live
Click-UIBridgeLiveText -Text "Submit"  # You see it happen in your browser!
```

### 🔧 Direct HTTP API
**Use when**: 
- Working from non-PowerShell environments (Python, Node.js, etc.)
- Need custom JSON structures not supported by helpers
- Building your own wrapper functions

```bash
# Direct HTTP for other languages
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"click","selector":{"text":"Submit"}}'
```

### 📦 NPM Package Integration
**Use when**: Building JavaScript/TypeScript applications with UIBridge
```javascript
import { UIBridge } from '@sashbot/uibridge';
const bridge = new UIBridge();
await bridge.click({ text: 'Submit' });
```

---

## 🚨 Troubleshooting & Error Resolution

### Problem: JSON corruption errors
**✅ FIXED in v1.2.5+** 
The PowerShell helpers now generate valid JSON consistently:
```powershell
# Verify the fix works
pwsh -ExecutionPolicy Bypass -File test-powershell-helpers.ps1
# Should show: All tests passed! ✅
```

### Problem: Server not accessible
```powershell
Test-UIBridgeServer
# If this fails:
# 1. Restart server: node node_modules/@sashbot/uibridge/api-server.cjs
# 2. Check firewall/antivirus blocking port 3002
# 3. Try different port: . .\uibridge-powershell-helpers.ps1 -ServerUrl "http://localhost:3003"
```

### Problem: Elements not found
```powershell
# Try multiple strategies in order:
Click-UIBridgeText -Text "Button Text"        # Try this first (most reliable)
Click-UIBridgeTestId -TestId "button-id"      # If text doesn't work  
Click-UIBridgeElement -Selector "#button-id"  # If test ID doesn't work

# Take screenshot to see current page state
Take-UIBridgeScreenshot
```

### Problem: Special characters in text
```powershell
# These all work correctly with the fixed helpers:
Click-UIBridgeText -Text "Text with ""quotes"" and 'apostrophes'"
Click-UIBridgeText -Text "Button with emoji 🚀"
Click-UIBridgeText -Text "Unicode: 测试 العربية русский"
```

---

## 🎯 AI Agent Best Practices

### ✅ DO (Primary Method):
```powershell
# 1. Always load helpers first
. .\uibridge-powershell-helpers.ps1

# 2. Test connection before automating
Test-UIBridgeServer

# 3. Use text-based clicking first (most reliable)
Click-UIBridgeText -Text "Submit"

# 4. Take screenshots to verify actions
Take-UIBridgeScreenshot

# 5. Use complete workflows
Start-UIBridgeSession -Url "https://example.com"
```

### ⚠️ AVOID:
- Don't construct JSON manually - use the helper functions
- Don't skip `Test-UIBridgeServer` - always verify connection
- Don't use complex CSS selectors if text clicking works
- Don't forget to handle errors with try/catch blocks

---

## 📊 Helper Functions Reference

### Core Functions
| Function | Purpose | Example |
|----------|---------|---------|
| `Test-UIBridgeServer` | Check server connection | `Test-UIBridgeServer` |
| `Open-UIBridgePage` | Navigate to URL | `Open-UIBridgePage -Url "https://example.com"` |
| `Take-UIBridgeScreenshot` | Capture page screenshot | `Take-UIBridgeScreenshot -FullPage $true` |
| `Click-UIBridgeText` | Click by text content | `Click-UIBridgeText -Text "Submit"` |
| `Click-UIBridgeTestId` | Click by test ID | `Click-UIBridgeTestId -TestId "submit-btn"` |
| `Click-UIBridgeElement` | Click by CSS selector | `Click-UIBridgeElement -Selector "#btn"` |
| `Get-UIBridgePageInfo` | Get page title/URL | `Get-UIBridgePageInfo` |
| `Get-UIBridgeScreenshots` | List saved screenshots | `Get-UIBridgeScreenshots` |
| `Start-UIBridgeSession` | Complete automation setup | `Start-UIBridgeSession -Url "https://example.com"` |

### Advanced Usage
```powershell
# Custom timeout for slow pages
Click-UIBridgeText -Text "Submit" -Timeout 10000

# High quality screenshot
Take-UIBridgeScreenshot -Quality 95 -Format "png"

# Multiple screenshots for comparison
Take-UIBridgeScreenshot  # Before action
Click-UIBridgeText -Text "Change Background"
Take-UIBridgeScreenshot  # After action
```

---

## 🔬 Testing & Validation

### Run Built-in Tests
```powershell
# Test JSON generation and helper functions
pwsh -ExecutionPolicy Bypass -File test-powershell-helpers.ps1

# Expected result:
# 📊 Test Results Summary
# Total Tests: 17
# Passed: 17 ✅
# Failed: 0 ✅
```

### Integration with CI/CD
```powershell
# In your build scripts
$testResult = & pwsh -ExecutionPolicy Bypass -File test-powershell-helpers.ps1
if ($LASTEXITCODE -ne 0) {
    throw "UIBridge PowerShell helper tests failed"
}
```

---

## 🎉 Why UIBridge PowerShell Helpers Are Perfect for AI Agents

1. **🛡️ Reliability**: Built-in JSON validation prevents corruption errors
2. **🎯 Simplicity**: `Click-UIBridgeText -Text "Submit"` instead of complex APIs  
3. **📸 Auto-Management**: Screenshots auto-save with timestamps
4. **🔍 Error Handling**: Clear error messages with troubleshooting guidance
5. **🤖 AI-Optimized**: Functions designed specifically for AI agent workflows
6. **⚡ Fast Setup**: Load helpers, test connection, start automating
7. **🧪 Tested**: 17 unit tests ensure reliability
8. **🌐 Universal**: Works with any web application

---

## 📚 Additional Resources

- **🔧 [Advanced Configuration](./documentation/simple-example.md)**
- **🤖 [AI Agent Guidelines](./CURSOR_AI_USAGE_RULES.md)**  
- **📦 [NPM Package](https://www.npmjs.com/package/@sashbot/uibridge)**
- **🐛 [GitHub Issues](https://github.com/sashbot/uibridge-js/issues)**

---

**🌉 Built for AI Agents**: UIBridge provides the most reliable browser automation for AI agents with comprehensive error handling, JSON validation, and intuitive PowerShell functions. 