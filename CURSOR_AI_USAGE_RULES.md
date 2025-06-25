# UIBridge Usage Rules for Cursor AI

## NEW v1.4.2: Live Session Automation + Visual Debug Panel

UIBridge now includes a **real-time visual debug panel** that shows automation happening live in your web app! Plus **built-in auto-polling** for zero-configuration automation.

## Installation & Setup
```bash
npm install @sashbot/uibridge
npx uibridge-setup  # Copies server files
node uibridge-api-server.cjs  # Start server on port 3002
```

## Web App Integration (RECOMMENDED - Visual Debugging!)
```javascript
// ✅ RECOMMENDED: Enable visual debug panel + remote control
import UIBridge from '@sashbot/uibridge';

const uibridge = new UIBridge({ 
  enableRemoteControl: true,    // Auto-polling enabled
  showDebugPanel: true,         // 🔥 Shows real-time automation activity
  debugPanelOptions: {
    position: 'bottom-right',   // Visual position
    showScreenshots: true,      // Screenshot previews
    autoConnect: true          // Auto-connect to server
  },
  debug: true
});
await uibridge.init();
// 🌉 Debug panel appears showing live automation activity!
```

## External API Usage (UPDATED)
```bash
# Health check
curl http://localhost:3002/health

# Click element (immediate result)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#button-id"}'

# Take screenshot (returns base64 image data)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'

# Get page info
curl http://localhost:3002/page-info

# List saved screenshots
curl http://localhost:3002/screenshots
```

## Visual Debug Panel - **CRITICAL FOR AI DEVELOPMENT**

The debug panel is **essential** for AI automation - it shows what's happening in real-time:

### What You Get:
- 📊 **Live Command Feed**: See every click/screenshot as it executes
- 📸 **Screenshot Previews**: Visual confirmation of automation results
- 🟢 **Connection Status**: Know if the server is responding
- 📈 **Success/Error Counts**: Track automation health
- 🔄 **Real-time Updates**: See external commands instantly

### Enable Debug Panel:
```javascript
// ALWAYS use this configuration for AI development
const uibridge = new UIBridge({
  enableRemoteControl: true,
  showDebugPanel: true,        // 🔥 ESSENTIAL for debugging
  debugPanelOptions: {
    position: 'bottom-right',
    showScreenshots: true,     // See automation screenshots
    autoConnect: true
  }
});
```

## PowerShell Automation (Simplified with Visual Feedback)
```powershell
# ✅ RECOMMENDED: Use the simplified helper functions
. .\uibridge-powershell-helpers.ps1

# Essential commands that show in debug panel:
Test-UIBridgeServer                          # Check server health
Start-UIBridgeSession -Url "http://localhost:5173"  # Setup + navigate + screenshot  
Click-UIBridgeText -Text "Submit"            # Click by text (shows in panel)
Take-UIBridgeScreenshot                      # Screenshot (appears in panel)
Get-UIBridgePageInfo                         # Page info

# Alternative: Manual REST calls (more complex)
$response = Invoke-RestMethod -Uri 'http://localhost:3002/execute' -Method POST -Headers @{ 'Content-Type' = 'application/json' } -Body '{"command":"click","selector":"#submit-btn"}'
```

## Selector Priority (Most to Least Reliable)
1. `{"testId": "element-id"}` - Best for automation
2. `"#element-id"` - CSS ID
3. `{"text": "Button Text"}` - Text content
4. `{"ariaLabel": "Label"}` - Accessibility
5. `".class-name"` - CSS class

## Complete Workflow Pattern (WITH DEBUG PANEL)
```bash
# 1. Install and setup
npm install @sashbot/uibridge
npx uibridge-setup

# 2. Start server
node uibridge-api-server.cjs

# 3. Enable in web app WITH debug panel
# new UIBridge({ 
#   enableRemoteControl: true,
#   showDebugPanel: true,
#   debugPanelOptions: { position: 'bottom-right', showScreenshots: true }
# })

# 4. Load PowerShell helpers
. .\uibridge-powershell-helpers.ps1

# 5. Automation with visual feedback
Start-UIBridgeSession -Url "http://localhost:5173"
Click-UIBridgeText -Text "Submit"
Take-UIBridgeScreenshot
# ↑ All these commands appear instantly in the debug panel!
```

## PowerShell Workflow Example
```powershell
function Start-WebAutomation {
    Write-Host "🤖 Starting automation..."
    
    # Take initial screenshot
    $initial = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
        options = @{
            fullPage = $true
            saveConfig = @{ prefix = 'initial'; timestamp = $true }
        }
    }
    
    # Click action
    Invoke-UIBridgeCommand -Command 'click' -Parameters @{
        selector = @{ text = 'Submit' }
    }
    
    # Verification screenshot
    Start-Sleep -Seconds 2
    $final = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
        options = @{
            fullPage = $true
            saveConfig = @{ prefix = 'final'; timestamp = $true }
        }
    }
    
    Write-Host "✅ Automation completed!"
}
```

## Response Formats

### Successful Click:
```json
{
  "success": true,
  "command": "click",
  "selector": "#button-id",
  "timestamp": "2024-12-28T10:00:00.000Z"
}
```

### Successful Screenshot:
```json
{
  "success": true,
  "command": "screenshot",
  "filename": "screenshot-2024-12-28T10-00-00-000Z.png",
  "filepath": "/path/to/screenshot.png",
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "size": 12345,
  "timestamp": "2024-12-28T10:00:00.000Z"
}
```

## Key Benefits of v1.4.2
- 🌉 **Visual Debug Panel** - See automation happening live in your web app
- ✅ **Zero manual polling** - Built into UIBridge
- ✅ **PowerShell helpers** - Simple AI-friendly functions
- ✅ **Live screenshot previews** - Visual verification in debug panel
- ✅ **Automatic error handling** - No more manual retry logic
- ✅ **Immediate execution** - Commands work right away
- ✅ **Framework agnostic** - Works with React, Vue, Svelte, vanilla JS

## Migration from Old Version
```javascript
// ❌ OLD WAY (v1.2.x) - Complex manual polling + no visibility
uibridge = new UIBridge();
await uibridge.init();
window.uibridge = uibridge;
pollForCommands(); // 30+ lines of manual code

// ✅ NEW WAY (v1.4.2+) - Live session + visual debugging
uibridge = new UIBridge({ 
  enableRemoteControl: true,
  showDebugPanel: true,        // 🔥 See automation happen live!
  debugPanelOptions: {
    position: 'bottom-right',
    showScreenshots: true
  }
});
await uibridge.init();
// Automation works automatically + you see everything happening!
```

## Error Handling
Try multiple selectors with fallback pattern. Commands return success/failure immediately with detailed error messages.

## Status & Verification
```javascript
// Check if remote control is working
const status = uibridge.getRemoteControlStatus();
console.log(status);
// { enabled: true, polling: true, serverUrl: 'http://localhost:3002' }
```

## Key Points for AI Agents

### ESSENTIAL Setup:
- **Server**: Must run `node uibridge-api-server.cjs` on port 3002
- **Web App**: MUST include debug panel configuration:
  ```javascript
  new UIBridge({ 
    enableRemoteControl: true,
    showDebugPanel: true,        // 🔥 CRITICAL for visibility
    debugPanelOptions: { position: 'bottom-right', showScreenshots: true }
  })
  ```
- **PowerShell**: Use helper functions (`. .\uibridge-powershell-helpers.ps1`)

### What You Get:
- 🌉 **Visual feedback**: See every command in real-time debug panel
- 📸 **Screenshot previews**: Instant visual verification
- 🟢 **Connection status**: Know if automation is working
- ✅ **Success/error tracking**: Monitor automation health
- 🚀 **Zero polling code**: Everything handled automatically

### Why Debug Panel is Essential:
- **Bridges the gap** between external automation and web app
- **Visual confirmation** that commands are working
- **Instant feedback** on success/failure
- **Screenshot verification** without saving files
- **Real-time monitoring** of automation health

**🎯 The Bottom Line**: v1.4.2 combines powerful automation with live session control and visual debugging - you finally **see what's happening** in your existing browser instead of guessing! The client-server mode and debug panel are the game-changers that make UIBridge perfect for AI automation. 