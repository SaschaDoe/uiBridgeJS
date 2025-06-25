# 🌉 UIBridge - AI-Powered Live Session Automation

> **For AI Agents**: Control web applications in your LIVE browser - see automation happen in real-time with visual feedback!

[![npm version](https://badge.fury.io/js/@sashbot/uibridge.svg)](https://www.npmjs.com/package/@sashbot/uibridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What UIBridge Does

UIBridge lets AI agents control web applications in your **actual browser** instead of hidden windows. You see every click, screenshot, and action happen live with a real-time debug panel.

**Perfect for**: AI agents, automation testing, live debugging, visual feedback workflows.

---

## 🚀 Super Simple Setup for AI Agents

### Step 1: Install UIBridge
```bash
npm install @sashbot/uibridge
```

### Step 2: Download & Start the Server
```bash
# Download the live session server (one-time)
curl -o client-server.cjs https://unpkg.com/@sashbot/uibridge@latest/client-server.cjs

# Start the server (keep this running)
node client-server.cjs
```
**✅ Server Status**: You should see `UIBridge Client-Server running on http://localhost:3002`

### Step 3: Connect Your Web App
Add **ONE LINE** to your web app's HTML (anywhere in `<head>` or `<body>`):
```html
<script src="http://localhost:3002/uibridge-client.js"></script>
```

### Step 4: Open Your Web App
Navigate to your web app in any browser. You'll immediately see a **debug panel** in the top-right corner showing "Connected to UIBridge Server" ✅

### Step 5: Download AI Helper Functions
```bash
# Download PowerShell helpers for easy automation
curl -o uibridge-live-session-helpers.ps1 https://unpkg.com/@sashbot/uibridge@latest/uibridge-live-session-helpers.ps1
```

### Step 6: Start Automating!
```powershell
# Load the helper functions
. .\uibridge-live-session-helpers.ps1

# Test everything is working
Start-UIBridgeLiveSession

# Click something (you'll see it happen in your browser!)
Click-UIBridgeLiveText -Text "Submit"

# Take a screenshot (auto-saves with timestamp)
Take-UIBridgeLiveScreenshot
```

**🎉 That's it!** You now have live browser automation with visual feedback.

---

## 🤖 Essential AI Agent Commands

### 🔗 Connection & Setup
```powershell
# Load helpers (do this first in every session)
. .\uibridge-live-session-helpers.ps1

# Check if everything is connected properly
Test-UIBridgeClientServer          # ✅ Checks server is running
Get-UIBridgeClients               # ✅ Shows connected browsers
Start-UIBridgeLiveSession         # ✅ Complete connection test + guide
```

### 🖱️ Clicking Elements (You'll See It Happen Live!)
```powershell
# Click by button text (RECOMMENDED - most reliable)
Click-UIBridgeLiveText -Text "Submit"
Click-UIBridgeLiveText -Text "Save"
Click-UIBridgeLiveText -Text "Login"

# Click by CSS selector (when text doesn't work)
Click-UIBridgeLiveElement -Selector "#save-button"
Click-UIBridgeLiveElement -Selector ".submit-btn"

# Click by test ID (best for testing)
Click-UIBridgeLiveTestId -TestId "submit-btn"
```

### 📸 Screenshots (Auto-Saved with Timestamps)
```powershell
# Take screenshot of entire page (automatically detects background color)
Take-UIBridgeLiveScreenshot

# Take screenshot with specific background color (fixes transparency issues)
Take-UIBridgeLiveScreenshot -BackgroundColor "#ffffff"   # White background
Take-UIBridgeLiveScreenshot -BackgroundColor "yellow"    # Yellow background
Take-UIBridgeLiveScreenshot -BackgroundColor "transparent" # Transparent background

# Screenshot gets auto-saved as: screenshots/screenshot_2024-01-15_14-30-25.png
```

### 📊 Monitoring & Debugging
```powershell
# See what commands were executed recently
Get-UIBridgeLiveActivity

# Show all available commands
Show-UIBridgeLiveHelp

# Check connection status
Get-UIBridgeClients
```

---

## 🎯 Complete AI Automation Example

```powershell
# 1. Load helpers (always first)
. .\uibridge-live-session-helpers.ps1

# 2. Verify connection
Start-UIBridgeLiveSession

# 3. Take "before" screenshot
Take-UIBridgeLiveScreenshot

# 4. Click something (you see it happen live!)
Click-UIBridgeLiveText -Text "Make Background Yellow"

# 5. Take "after" screenshot to verify
Take-UIBridgeLiveScreenshot

# 6. Review what happened
Get-UIBridgeLiveActivity
```

**🎮 What You See**: Every command appears instantly in the debug panel in your browser, and you watch the clicks happen in real-time!

---

## 🎨 Visual Debug Panel Features

When connected, you'll see a floating panel showing:
- 📊 **Live Command Feed**: Every click/screenshot as it happens
- 📸 **Screenshot Previews**: Thumbnail views of captured images  
- ✅ **Success/Error Status**: Instant feedback on each command
- 🔗 **Connection Indicator**: Green = connected, Red = disconnected
- 📈 **Command Statistics**: Success rates and timing

---

## 🔧 Framework Integration

### React
```javascript
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // UIBridge auto-connects via the script tag
    // No additional setup needed!
  }, []);
  
  return <div>Your App</div>;
}
```

### Vue.js
```javascript
export default {
  mounted() {
    // UIBridge auto-connects via the script tag
    // No additional setup needed!
  }
};
```

### SvelteKit
```javascript
import { onMount } from 'svelte';
import { browser } from '$app/environment';

onMount(() => {
  if (browser) {
    // UIBridge auto-connects via the script tag
    // No additional setup needed!
  }
});
```

### Vanilla HTML
```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <script src="http://localhost:3002/uibridge-client.js"></script>
</head>
<body>
  <h1>My Application</h1>
  <button id="test-btn">Click Me</button>
</body>
</html>
```

---

## 🛠️ HTTP API (Alternative to PowerShell)

If you can't use PowerShell, you can use HTTP directly:

```bash
# Check server health
curl http://localhost:3002/health

# Click by text (you'll see it in your browser!)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"click","selector":{"text":"Submit"}}'

# Take screenshot
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"screenshot"}'

# List connected clients
curl http://localhost:3002/clients
```

---

## 🚨 Troubleshooting for AI Agents

### Problem: Can't connect to server
```powershell
Test-UIBridgeClientServer
# If this fails, restart the server:
# node client-server.cjs
```

### Problem: No debug panel appears
1. Check the browser console for errors
2. Verify the script tag: `<script src="http://localhost:3002/uibridge-client.js"></script>`
3. Make sure the server is running on port 3002

### Problem: Clicks don't work
```powershell
# Try different click strategies in order:
Click-UIBridgeLiveText -Text "Button Text"        # Try this first
Click-UIBridgeLiveTestId -TestId "button-id"      # If text doesn't work
Click-UIBridgeLiveElement -Selector "#button-id"  # If test ID doesn't work
```

### Problem: Can't find element
```powershell
# Take a screenshot first to see what's on the page
Take-UIBridgeLiveScreenshot

# Check recent activity for error details
Get-UIBridgeLiveActivity
```

### Problem: Screenshots show transparent instead of colored backgrounds
```powershell
# Solution 1: Use auto-detection (default - should work in most cases)
Take-UIBridgeLiveScreenshot -BackgroundColor "auto"

# Solution 2: Specify the expected background color explicitly
Take-UIBridgeLiveScreenshot -BackgroundColor "yellow"      # For yellow backgrounds
Take-UIBridgeLiveScreenshot -BackgroundColor "#ffff00"     # Hex color
Take-UIBridgeLiveScreenshot -BackgroundColor "rgb(255,255,0)" # RGB color

# Solution 3: Force white background for visibility
Take-UIBridgeLiveScreenshot -BackgroundColor "#ffffff"
```

---

## 🎯 AI Agent Best Practices

### ✅ DO:
- Always load helpers first: `. .\uibridge-live-session-helpers.ps1`
- Use `Click-UIBridgeLiveText` first (most reliable)
- Take screenshots to verify actions worked
- Use `Start-UIBridgeLiveSession` to test connection
- Check `Get-UIBridgeLiveActivity` when things fail

### ❌ DON'T:
- Don't construct JSON manually - use the helper functions
- Don't skip the script tag in your HTML
- Don't forget to start the server first
- Don't use complex CSS selectors if text clicking works

---

## 🎉 Why This Is Perfect for AI Agents

1. **👀 Visual Feedback**: See every action happen in real-time
2. **🎯 Simple Commands**: `Click-UIBridgeLiveText -Text "Submit"` instead of complex APIs
3. **📸 Auto-Screenshots**: Every screenshot auto-saves with timestamps
4. **🔍 Easy Debugging**: Debug panel shows exactly what happened
5. **🤖 AI-Friendly**: PowerShell functions designed specifically for AI agents
6. **⚡ Fast Setup**: One script tag, one server command, start automating
7. **🌐 Universal**: Works with any web framework
8. **🛡️ Reliable**: Built-in error handling and retry logic

---

## 📚 Additional Resources

- **🔧 [Complete Setup Guide](./documentation/simple-example.md)**
- **🤖 [AI Agent Rules](./CURSOR_AI_USAGE_RULES.md)**
- **📦 [NPM Package](https://www.npmjs.com/package/@sashbot/uibridge)**
- **🐛 [GitHub Issues](https://github.com/sashbot/uibridge-js/issues)**

---

**🌉 Built for AI Agents**: UIBridge bridges the gap between AI automation and visual feedback - finally see what your automation is doing in real-time! 