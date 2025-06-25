# Example: How AI agents can use UIBridge with the improved helper functions

# Load the helper functions
. .\uibridge-powershell-helpers.ps1

Write-Host "=== UIBridge Automation Example ===" -ForegroundColor Yellow

# Instead of this complex code that the AI struggled with:
<#
$navigateParams = @{ 
    Uri = 'http://localhost:3002/navigate'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = '{"url":"http://localhost:5173"}' 
}
Invoke-RestMethod @navigateParams

$screenshotParams = @{ 
    Uri = 'http://localhost:3002/execute'
    Method = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body = '{"command":"screenshot","options":{"fullPage":true}}' 
}
Invoke-RestMethod @screenshotParams
#>

# AI agents can now use these simple commands:

# 1. Start a complete session (check server, navigate, take initial screenshot)
$session = Start-UIBridgeSession -Url "http://localhost:5173"

# 2. Click a button by text
Click-UIBridgeText -Text "Make Background Yellow"

# 3. Take another screenshot to see the result
Take-UIBridgeScreenshot

# 4. Get page information
Get-UIBridgePageInfo

# 5. List all screenshots taken
Get-UIBridgeScreenshots

Write-Host "=== Automation Complete! ===" -ForegroundColor Green

# Benefits for AI agents:
# ✅ No complex JSON construction
# ✅ No need to remember HTTP headers/endpoints
# ✅ Built-in error handling and user feedback
# ✅ Clear, descriptive function names
# ✅ Simple parameters with sensible defaults
# ✅ Automatic validation and retry logic
# ✅ Rich console output for debugging 