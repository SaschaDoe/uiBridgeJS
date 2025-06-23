# 🤖 PowerShell Agent Guide for UIBridge

## Quick Start for AI Agents

This guide provides everything an AI agent needs to automate web interactions using UIBridge with PowerShell and REST API.

### 1. Server Setup

```bash
# Install dependencies
npm install express cors fs-extra

# Start UIBridge REST API server
node server-example.cjs
```

Server runs on `http://localhost:3001`

### 2. Basic PowerShell Template

```powershell
# Global configuration
$global:UIBridgeConfig = @{
    BaseUri = 'http://localhost:3001'
    Headers = @{ 'Content-Type' = 'application/json' }
}

# Execute UIBridge commands
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
        Body    = (@{ command = $Command } + $Parameters + @{ options = $Options }) | ConvertTo-Json -Depth 4
    }
    
    try {
        return Invoke-RestMethod @params
    } catch {
        Write-Error "UIBridge command '$Command' failed: $_"
        throw
    }
}
```

### 3. Essential Commands for AI

#### Click Any Element
```powershell
# Multiple selector strategies (try in order)
$clickStrategies = @(
    @{ testId = 'submit-btn' },     # Highest reliability
    '#submit-button',               # High reliability
    @{ text = 'Submit' },           # Medium reliability
    @{ ariaLabel = 'Submit form' }  # Medium reliability
)

foreach ($selector in $clickStrategies) {
    try {
        $result = Invoke-UIBridgeCommand -Command 'click' -Parameters @{
            selector = $selector
        } -Options @{ force = $true }
        
        Write-Host "✅ Click successful with: $($selector | ConvertTo-Json -Compress)"
        break
    } catch {
        Write-Host "⚠️ Selector failed: $($selector | ConvertTo-Json -Compress)"
    }
}
```

#### Take Screenshots
```powershell
# Full page screenshot with auto-save
$screenshot = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
    fullPage = $true
    saveConfig = @{
        autoSave = $true
        folder = 'ai-automation'
        prefix = 'verification'
        timestamp = $true
    }
}

Write-Host "📸 Screenshot saved: $($screenshot.command.result.fileName)"
```

#### Get Help Information
```powershell
# Get all available commands
$help = Invoke-UIBridgeCommand -Command 'help'
$help.command.result.powershellPatterns | ConvertTo-Json -Depth 3
```

### 4. Complete AI Workflow Example

```powershell
function Start-AIAutomation {
    param([string]$Target = 'Submit')
    
    Write-Host "🤖 Starting AI automation workflow..."
    
    # 1. Check server status
    try {
        $status = Invoke-RestMethod -Uri 'http://localhost:3001/status'
        Write-Host "✅ UIBridge server is running"
    } catch {
        Write-Error "❌ Server not available. Run: node server-example.cjs"
        return
    }
    
    # 2. Take initial screenshot
    $before = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
        fullPage = $true
        saveConfig = @{ prefix = 'before'; timestamp = $true }
    }
    
    # 3. Smart click with fallbacks
    $selectors = @(
        @{ testId = $Target },
        "#$Target",
        @{ text = $Target }
    )
    
    $clickSuccess = $false
    foreach ($selector in $selectors) {
        try {
            Invoke-UIBridgeCommand -Command 'click' -Parameters @{
                selector = $selector
            } -Options @{ force = $true }
            
            Write-Host "🖱️ Clicked: $($selector | ConvertTo-Json -Compress)"
            $clickSuccess = $true
            break
        } catch {
            Write-Host "⚠️ Failed: $($selector | ConvertTo-Json -Compress)"
        }
    }
    
    if (-not $clickSuccess) {
        Write-Error "❌ All click attempts failed"
        return
    }
    
    # 4. Wait and verify
    Start-Sleep -Seconds 2
    
    $after = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
        fullPage = $true
        saveConfig = @{ prefix = 'after'; timestamp = $true }
    }
    
    Write-Host "✅ Workflow completed!"
    Write-Host "Before: $($before.command.result.fileName)"
    Write-Host "After: $($after.command.result.fileName)"
}

# Run the automation
Start-AIAutomation -Target 'submit'
```

### 5. Error Handling Best Practices

```powershell
function Invoke-RobustUIBridgeCommand {
    param(
        [string]$Command,
        [hashtable]$Parameters = @{},
        [int]$MaxRetries = 3
    )
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $result = Invoke-UIBridgeCommand -Command $Command -Parameters $Parameters
            Write-Host "✅ Command '$Command' succeeded (attempt $attempt)"
            return $result
        } catch {
            Write-Host "❌ Attempt $attempt failed: $_"
            
            if ($attempt -eq $MaxRetries) {
                # Take error screenshot for debugging
                try {
                    Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
                        saveConfig = @{ prefix = 'error'; timestamp = $true }
                    }
                } catch { }
                throw
            }
            
            Start-Sleep -Seconds 1
        }
    }
}
```

### 6. Pre-built Script

Use the included `example-powershell-automation.ps1` script:

```powershell
# Basic usage
.\example-powershell-automation.ps1

# Custom target
.\example-powershell-automation.ps1 -TargetSelector "login"

# Custom server
.\example-powershell-automation.ps1 -ServerUrl "http://localhost:3002"
```

### 7. Troubleshooting

| Issue | Solution | PowerShell Command |
|-------|----------|-------------------|
| Server not running | Start server | `node server-example.cjs` |
| Element not found | Try multiple selectors | `@{ testId='btn' }, '#btn', @{ text='Submit' }` |
| JSON depth issues | Use -Depth parameter | `ConvertTo-Json -Depth 4` |
| Click fails | Use force option | `@{ force = $true }` |
| Connection errors | Check server status | `Invoke-RestMethod -Uri 'http://localhost:3001/status'` |

### 8. Meta Prompt for Cursor AI

Copy this into Cursor for optimal PowerShell code generation:

```
When writing PowerShell code for UIBridge automation:

1. Always use Invoke-RestMethod with hashtable splatting
2. Include proper error handling with try/catch
3. Use ConvertTo-Json -Depth 4 for nested objects
4. Store common configuration in $global:UIBridgeConfig
5. Use multiple selector strategies for reliability

Template:
$params = @{
    Uri = 'http://localhost:3001/execute-command'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = @{
        command = '[COMMAND]'
        selector = '[SELECTOR]'
        options = @{ force = $true }
    } | ConvertTo-Json -Depth 4
}

try {
    $response = Invoke-RestMethod @params
    Write-Host "✅ Success: $($response.message)"
} catch {
    Write-Error "❌ Failed: $_"
}

Available commands: click, screenshot, help
Server must be running: node server-example.cjs
```

---

**🚀 Ready to automate!** Start the server, copy the templates, and begin AI-powered web automation with PowerShell. 