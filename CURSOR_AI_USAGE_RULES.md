# UIBridge Usage Rules for Cursor AI

## NEW v1.3.0: Zero-Configuration Remote Control

UIBridge now includes **built-in auto-polling** that eliminates manual setup. What used to require 50+ lines of code is now just one configuration option!

## Installation & Setup
```bash
npm install @sashbot/uibridge
npx uibridge-setup  # Copies server files
node uibridge-api-server.cjs  # Start server on port 3002
```

## Web App Integration (NEW - Simple!)
```javascript
// ✅ NEW WAY - This is ALL you need!
import UIBridge from '@sashbot/uibridge';

const uibridge = new UIBridge({ 
  enableRemoteControl: true,  // 🎯 Auto-polling enabled
  debug: true
});
await uibridge.init();
// 🤖 External automation now works automatically!
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

## PowerShell Automation (Recommended)
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
Invoke-UIBridgeCommand -Command 'click' -Parameters @{selector='#submit-btn'}
Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{options=@{fullPage=$true}}
```

## Selector Priority (Most to Least Reliable)
1. `{"testId": "element-id"}` - Best for automation
2. `"#element-id"` - CSS ID
3. `{"text": "Button Text"}` - Text content
4. `{"ariaLabel": "Label"}` - Accessibility
5. `".class-name"` - CSS class

## Complete Workflow Pattern
```bash
# 1. Install and setup
npm install @sashbot/uibridge
npx uibridge-setup

# 2. Start server
node uibridge-api-server.cjs

# 3. Enable in web app (simple!)
# Just add: new UIBridge({ enableRemoteControl: true })

# 4. External automation works immediately
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#submit-button"}'
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

## Key Benefits of v1.3.0
- ✅ **Zero manual polling** - Built into UIBridge
- ✅ **5 lines vs 50+ lines** - Massive simplification
- ✅ **Automatic error handling** - No more manual retry logic
- ✅ **Immediate execution** - Commands work right away
- ✅ **Framework agnostic** - Works with React, Vue, Svelte, vanilla JS

## Migration from Old Version
```javascript
// ❌ OLD WAY (v1.2.x) - Complex manual polling
uibridge = new UIBridge();
await uibridge.init();
window.uibridge = uibridge;
pollForCommands(); // 30+ lines of manual code

// ✅ NEW WAY (v1.3.0+) - Simple and automatic
uibridge = new UIBridge({ enableRemoteControl: true });
await uibridge.init();
// All automation now works automatically!
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
- Server must be running before API calls (`node uibridge-api-server.cjs`)
- Web app needs `enableRemoteControl: true` in UIBridge config
- Use port 3002 (not 3001) for api-server
- Commands return immediate results with base64 screenshot data
- All dependencies included in package - no extra installation needed
- Zero manual polling code required - UIBridge handles everything automatically

**🎯 The Bottom Line**: v1.3.0 eliminates complexity while maintaining all automation power. What used to be complicated is now trivial! 