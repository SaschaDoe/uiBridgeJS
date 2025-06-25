# UIBridge Client-Server PowerShell Helpers
# 🤖 AI-FRIENDLY automation for LIVE browser sessions
# 
# This setup connects to your EXISTING browser where you can SEE automation happening!
# Perfect for AI agents that want visual feedback.

# Server configuration
$Global:UIBridgeServerUrl = "http://localhost:3002"

# Test if the UIBridge client-server is running and ready
function Test-UIBridgeClientServer {
    [CmdletBinding()]
    param()
    
    try {
        Write-Host "🔍 Checking UIBridge Client-Server..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/health" -Method GET -ErrorAction Stop
        
        if ($response.connectedClients -eq 0) {
            Write-Host "⚠️  Server is running but no browser clients connected!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "🎯 Quick Setup:" -ForegroundColor Cyan
            Write-Host "1. Add this to your web app HTML:" -ForegroundColor White
            Write-Host "   <script src='$Global:UIBridgeServerUrl/uibridge-client.js'></script>" -ForegroundColor Gray
            Write-Host "2. Open your web app in a browser" -ForegroundColor White
            Write-Host "3. You'll see the debug panel appear - now you're ready!" -ForegroundColor White
            Write-Host ""
            return $false
        }
        
        Write-Host "✅ Server healthy with $($response.connectedClients) browser client(s) connected" -ForegroundColor Green
        Write-Host "🎯 Mode: $($response.mode)" -ForegroundColor Cyan
        return $true
        
    } catch {
        Write-Host "❌ UIBridge Client-Server not responding" -ForegroundColor Red
        Write-Host "💡 Start it with: node client-server.cjs" -ForegroundColor Yellow
        return $false
    }
}

# Get list of connected browser clients
function Get-UIBridgeClients {
    [CmdletBinding()]
    param()
    
    try {
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/clients" -Method GET
        
        if ($response.total -eq 0) {
            Write-Host "No browser clients connected" -ForegroundColor Yellow
            return @()
        }
        
        Write-Host "Connected Browser Clients:" -ForegroundColor Green
        foreach ($client in $response.clients) {
            Write-Host "  🌐 $($client.id)" -ForegroundColor Cyan
            Write-Host "     URL: $($client.url)" -ForegroundColor Gray
            Write-Host "     Connected: $($client.connected)" -ForegroundColor Gray
            if ($client.pendingCommands -gt 0) {
                Write-Host "     Pending: $($client.pendingCommands) commands" -ForegroundColor Yellow
            }
        }
        
        return $response.clients
        
    } catch {
        Write-Host "❌ Failed to get client list: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Take a screenshot in the live browser session
function Take-UIBridgeLiveScreenshot {
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$Selector = $null,
        
        [Parameter()]
        [ValidateSet('png', 'jpeg', 'webp')]
        [string]$Format = 'png',
        
        [Parameter()]
        [double]$Quality = 0.92,
        
        [Parameter()]
        [switch]$FullPage,
        
        [Parameter()]
        [string]$BackgroundColor = 'auto',  # 'auto', 'transparent', or specific color like '#ffffff'
        
        [Parameter()]
        [string]$ClientId = $null
    )
    
    try {
        Write-Host "📸 Taking screenshot in live browser session..." -ForegroundColor Yellow
        
        $body = @{
            command = 'screenshot'
            options = @{
                format = $Format
                quality = $Quality
                fullPage = $FullPage.IsPresent
                backgroundColor = $BackgroundColor
            }
        }
        
        if ($Selector) {
            $body.selector = $Selector
        }
        
        if ($ClientId) {
            $body.clientId = $ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/execute" -Method POST -Body ($body | ConvertTo-Json -Depth 10) -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Screenshot command queued for browser client: $($response.clientId)" -ForegroundColor Green
            Write-Host "🎯 Check the debug panel in your browser to see the result!" -ForegroundColor Cyan
            Write-Host "📁 Screenshot will be saved to server screenshots folder" -ForegroundColor Gray
            
            return $response
        } else {
            Write-Host "❌ Screenshot failed: $($response.error)" -ForegroundColor Red
            return $null
        }
        
    } catch {
        Write-Host "❌ Screenshot error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Click element in the live browser session
function Click-UIBridgeLiveElement {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Selector,
        
        [Parameter()]
        [string]$ClientId = $null
    )
    
    try {
        Write-Host "🎯 Clicking element in live browser session: $Selector" -ForegroundColor Yellow
        
        $body = @{
            command = 'click'
            selector = $Selector
        }
        
        if ($ClientId) {
            $body.clientId = $ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/execute" -Method POST -Body ($body | ConvertTo-Json -Depth 10) -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Click command sent to browser client: $($response.clientId)" -ForegroundColor Green
            Write-Host "👀 You should see the click happen in your browser!" -ForegroundColor Cyan
            
            return $response
        } else {
            Write-Host "❌ Click failed: $($response.error)" -ForegroundColor Red
            return $null
        }
        
    } catch {
        Write-Host "❌ Click error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Click element by text content in the live browser session  
function Click-UIBridgeLiveText {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text,
        
        [Parameter()]
        [string]$ClientId = $null
    )
    
    try {
        Write-Host "🎯 Clicking text in live browser session: '$Text'" -ForegroundColor Yellow
        
        $body = @{
            command = 'click'
            selector = @{ text = $Text }
        }
        
        if ($ClientId) {
            $body.clientId = $ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/execute" -Method POST -Body ($body | ConvertTo-Json -Depth 10) -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Click text command sent to browser client: $($response.clientId)" -ForegroundColor Green
            Write-Host "👀 You should see the click happen in your browser!" -ForegroundColor Cyan
            
            return $response
        } else {
            Write-Host "❌ Click text failed: $($response.error)" -ForegroundColor Red
            return $null
        }
        
    } catch {
        Write-Host "❌ Click text error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Click element by test ID in the live browser session
function Click-UIBridgeLiveTestId {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$TestId,
        
        [Parameter()]
        [string]$ClientId = $null
    )
    
    try {
        Write-Host "🎯 Clicking test ID in live browser session: $TestId" -ForegroundColor Yellow
        
        $body = @{
            command = 'click'
            selector = @{ testId = $TestId }
        }
        
        if ($ClientId) {
            $body.clientId = $ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/execute" -Method POST -Body ($body | ConvertTo-Json -Depth 10) -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Click test ID command sent to browser client: $($response.clientId)" -ForegroundColor Green
            Write-Host "👀 You should see the click happen in your browser!" -ForegroundColor Cyan
            
            return $response
        } else {
            Write-Host "❌ Click test ID failed: $($response.error)" -ForegroundColor Red
            return $null
        }
        
    } catch {
        Write-Host "❌ Click test ID error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get recent activity from the debug panel
function Get-UIBridgeLiveActivity {
    [CmdletBinding()]
    param(
        [Parameter()]
        [int]$Limit = 10
    )
    
    try {
        $response = Invoke-RestMethod -Uri "$Global:UIBridgeServerUrl/activity?limit=$Limit" -Method GET
        
        if ($response.commands.Count -eq 0) {
            Write-Host "No recent activity" -ForegroundColor Gray
            return @()
        }
        
        Write-Host "Recent Activity (last $($response.commands.Count) commands):" -ForegroundColor Green
        foreach ($cmd in $response.commands) {
            $status = if ($cmd.success) { "✅" } else { "❌" }
            $timestamp = ([DateTime]$cmd.timestamp).ToString("HH:mm:ss")
            Write-Host "  $status [$timestamp] $($cmd.command)" -ForegroundColor $(if ($cmd.success) { "Green" } else { "Red" })
            
            if ($cmd.error) {
                Write-Host "     Error: $($cmd.error)" -ForegroundColor Red
            }
        }
        
        return $response.commands
        
    } catch {
        Write-Host "❌ Failed to get activity: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Complete setup for UIBridge Client-Server mode
function Start-UIBridgeLiveSession {
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$WebAppUrl = $null
    )
    
    Write-Host "🚀 Starting UIBridge Live Session Setup..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if server is running
    if (-not (Test-UIBridgeClientServer)) {
        Write-Host ""
        Write-Host "🔧 Starting UIBridge Client-Server..." -ForegroundColor Yellow
        Write-Host "💡 Run this command: node client-server.cjs" -ForegroundColor White
        Write-Host ""
        return $false
    }
    
    Write-Host ""
    Write-Host "🎯 Next Steps for Live Session Automation:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 📝 Add this line to your web app HTML:" -ForegroundColor Yellow
    Write-Host "   <script src='$Global:UIBridgeServerUrl/uibridge-client.js'></script>" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 🌐 Open your web app in a browser" -ForegroundColor Yellow
    if ($WebAppUrl) {
        Write-Host "   Suggested URL: $WebAppUrl" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "3. 👀 Look for the debug panel in the top-right corner" -ForegroundColor Yellow
    Write-Host "   This shows you're connected for live automation!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. 🤖 Use these commands to automate your live session:" -ForegroundColor Yellow
    Write-Host "   Click-UIBridgeLiveText -Text 'Submit'" -ForegroundColor White
    Write-Host "   Take-UIBridgeLiveScreenshot" -ForegroundColor White
    Write-Host "   Get-UIBridgeLiveActivity" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 You'll see automation happening LIVE in your browser!" -ForegroundColor Cyan
    
    return $true
}

# Display help for AI agents
function Show-UIBridgeLiveHelp {
    Write-Host ""
    Write-Host "🤖 UIBridge Live Session Automation - AI Agent Guide" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Key Concept: Automate your EXISTING browser session (not a hidden one!)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Essential Commands:" -ForegroundColor Green
    Write-Host "  Start-UIBridgeLiveSession          # Complete setup guide"
    Write-Host "  Test-UIBridgeClientServer          # Check connection status"
    Write-Host "  Get-UIBridgeClients                # List connected browsers"
    Write-Host ""
    Write-Host "🎯 Automation Commands:" -ForegroundColor Green  
    Write-Host "  Click-UIBridgeLiveText -Text 'Submit'      # Click by text content"
    Write-Host "  Click-UIBridgeLiveElement -Selector 'button'  # Click by CSS selector"
    Write-Host "  Click-UIBridgeLiveTestId -TestId 'btn-save'   # Click by test ID"
    Write-Host "  Take-UIBridgeLiveScreenshot                   # Screenshot of live page"
    Write-Host ""
    Write-Host "📊 Monitoring:" -ForegroundColor Green
    Write-Host "  Get-UIBridgeLiveActivity               # See recent commands"
    Write-Host ""
    Write-Host "🎉 Benefits:" -ForegroundColor Yellow
    Write-Host "  ✅ See automation happening in real-time"
    Write-Host "  ✅ Debug panel shows command results instantly"
    Write-Host "  ✅ No hidden browser windows"
    Write-Host "  ✅ Perfect for AI agents that need visual feedback"
    Write-Host ""
}

# Auto-display help when module loads
Show-UIBridgeLiveHelp

Write-Host "🎯 Ready for live session automation! Type 'Start-UIBridgeLiveSession' to begin." -ForegroundColor Cyan
Write-Host "" 