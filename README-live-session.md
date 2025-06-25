# 🤖 UIBridge - Live Session Automation for AI Agents

> **Perfect for AI Agents**: Control your EXISTING browser session - see automation happen in real-time in the browser you're already using!

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 The Problem UIBridge Solves for AI Agents

**Before UIBridge**: AI agents control hidden browser windows. You can't see what's happening. Debugging is impossible.

**With UIBridge**: AI agents control your LIVE browser session. You watch automation happen in real-time with a visual debug panel!

## 🌟 NEW: Client-Server Mode (Recommended for AI)

UIBridge v1.4.1+ provides **Live Session Automation** - connect to your existing browser instead of creating hidden ones.

### ✅ Client-Server Mode Benefits:
- 👀 **Visual Feedback**: See automation happening in your actual browser
- 🎯 **Real-time Debug Panel**: Live command activity, screenshots, success/error tracking
- 🚀 **AI-Friendly**: Simple PowerShell commands, no complex REST APIs
- 🔄 **No Hidden Windows**: Control the browser you're already using

### ❌ Traditional Hidden Browser Problems:
- Can't see what's happening
- Hard to debug when things go wrong  
- AI agents get confused without visual feedback
- Separate browser context from your work

---

## 🚀 Quick Start for AI Agents

### 1. Install UIBridge
```bash
npm install @sashbot/uibridge
```

### 2. Start Client-Server Mode
```bash
# Download the client-server
curl -o client-server.cjs https://unpkg.com/@sashbot/uibridge@latest/client-server.cjs

# Start the live session server
node client-server.cjs
```

### 3. Connect Your Web App
Add this **one line** to your web app's HTML:
```html
<script src="http://localhost:3002/uibridge-client.js"></script>
```

### 4. Open Your Web App
Navigate to your web app in any browser. You'll see the **debug panel** appear in the top-right corner!

### 5. Automate with PowerShell (AI-Friendly)
```powershell
# Download AI-friendly helpers
curl -o uibridge-live-session-helpers.ps1 https://unpkg.com/@sashbot/uibridge@latest/uibridge-live-session-helpers.ps1

# Load helpers and start automating
. .\uibridge-live-session-helpers.ps1

# Simple commands that work immediately:
Start-UIBridgeLiveSession                          # Check setup
Click-UIBridgeLiveText -Text "Submit"              # Click button by text
Take-UIBridgeLiveScreenshot                        # Screenshot of live page
Get-UIBridgeLiveActivity                           # See recent commands
```

---

## 🎯 Live Session Commands for AI Agents

### Essential Commands
```powershell
# Setup and connection
Test-UIBridgeClientServer                          # Check if server is running
Get-UIBridgeClients                               # List connected browsers
Start-UIBridgeLiveSession                         # Complete setup guide

# Automation commands (visible in your browser!)
Click-UIBridgeLiveText -Text "Submit"              # Click by text content
Click-UIBridgeLiveElement -Selector "button"       # Click by CSS selector  
Click-UIBridgeLiveTestId -TestId "btn-save"        # Click by test ID
Take-UIBridgeLiveScreenshot                        # Screenshot with auto-save

# Monitoring and debugging
Get-UIBridgeLiveActivity -Limit 10                 # Recent command history
Show-UIBridgeLiveHelp                              # Show all commands
```

### HTTP API (for non-PowerShell environments)
```bash
# Check connection status
curl http://localhost:3002/health

# Click by text (you'll see it happen in your browser!)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"click","selector":{"text":"Submit"}}'

# Take screenshot of live session
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"screenshot"}'
```

---

## 🎮 Visual Debug Panel

When you connect your web app, you'll see a **floating debug panel** that shows:

- 📊 **Real-time Activity**: Every command as it executes
- 📸 **Live Screenshots**: Preview images right in the panel
- ✅ **Success/Error Status**: Immediate feedback on command results
- 🔗 **Connection Status**: Know when your browser is connected
- 📈 **Command Statistics**: Success rates and performance

The debug panel updates automatically when AI agents send commands!

---

## 🤖 AI Agent Integration Examples

### Example 1: Form Automation
```powershell
# AI agent workflow - all visible in real-time!
Start-UIBridgeLiveSession -WebAppUrl "http://localhost:3000"

# AI can see the form and interact naturally
Click-UIBridgeLiveText -Text "Name"
# Type name... (extend with input commands)
Click-UIBridgeLiveText -Text "Submit"

# Verify with screenshot
Take-UIBridgeLiveScreenshot
Get-UIBridgeLiveActivity  # Review what happened
```

### Example 2: Testing Workflow
```powershell
# AI agent testing a web app
Test-UIBridgeClientServer                          # Ensure connection
Take-UIBridgeLiveScreenshot                        # Before state
Click-UIBridgeLiveTestId -TestId "add-item-btn"    # Action
Take-UIBridgeLiveScreenshot                        # After state
Get-UIBridgeLiveActivity                           # Review test results
```

---

## 🔧 Advanced Configuration

### Custom Client-Server Setup
```javascript
// In your web app - full control
import UIBridge from '@sashbot/uibridge';

const uibridge = new UIBridge({
  showDebugPanel: true,           // Enable visual debugging
  debugPanelOptions: {
    position: 'top-right',        // Position on screen
    collapsed: false,             # Start expanded
    serverMode: true              # Client-server mode
  },
  debug: true
});

await uibridge.init();

// Register with server for remote control
await fetch('http://localhost:3002/register-client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: window.location.href,
    userAgent: navigator.userAgent
  })
});
```

### Server Configuration
```javascript
// client-server.cjs customization
const PORT = process.env.PORT || 3002;
const SCREENSHOTS_DIR = './my-screenshots';

// Start server
node client-server.cjs
```

---

## 🆚 Comparison: Client-Server vs Classic Mode

| Feature | Client-Server Mode (🌟 Recommended) | Classic Mode |
|---------|-------------------------------------|--------------|
| **Visual Feedback** | ✅ See automation in your browser | ❌ Hidden browser window |
| **Debug Panel** | ✅ Real-time activity display | ✅ Basic logging only |
| **AI-Friendly** | ✅ Simple PowerShell commands | ⚠️ Complex REST API calls |
| **Setup Complexity** | ✅ One script tag | ⚠️ Server setup required |
| **Use Case** | 🎯 Live development, AI agents | 🔧 Headless automation |

## 🎯 Why Client-Server Mode for AI Agents?

1. **Visual Debugging**: AI agents can see the results of their actions immediately
2. **Easier Debugging**: When something goes wrong, you can see what happened
3. **Natural Workflow**: Control the browser you're already using for development
4. **Reduced Complexity**: No need to manage hidden browser instances
5. **Better Feedback**: Debug panel provides instant visual confirmation

---

## 📚 Additional Resources

- 🔧 **[Complete Setup Guide](./documentation/simple-example.md)**
- 🤖 **[AI Agent Patterns](./documentation/ssd.md)**  
- 💻 **[PowerShell Helpers](./uibridge-live-session-helpers.ps1)**
- 🖥️ **[Example HTML Page](./uibridge-debug-panel-example.html)**

---

## 🎉 Ready to Start?

1. **Install**: `npm install @sashbot/uibridge`
2. **Download server**: Get `client-server.cjs` from npm package
3. **Start server**: `node client-server.cjs`
4. **Add to web app**: `<script src="http://localhost:3002/uibridge-client.js"></script>`
5. **Load helpers**: `. .\uibridge-live-session-helpers.ps1`
6. **Start automating**: `Start-UIBridgeLiveSession`

**🎯 Perfect for AI agents that need visual feedback and real-time control!** 