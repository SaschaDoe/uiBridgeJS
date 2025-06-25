# UIBridge PowerShell Helper Functions
# Makes it easier for AI agents to use UIBridge API

param(
    [string]$ServerUrl = "http://localhost:3002"
)

# Global configuration
$Global:UIBridgeConfig = @{
    ServerUrl = $ServerUrl
    Headers = @{ 'Content-Type' = 'application/json' }
}

# Helper function to safely create JSON with proper escaping
function ConvertTo-SafeJson {
    param(
        [Parameter(Mandatory=$true)]
        $InputObject,
        [int]$Depth = 10
    )
    
    try {
        # Convert to JSON with consistent depth and compression
        $json = $InputObject | ConvertTo-Json -Depth $Depth -Compress
        
        # Validate the JSON is parseable
        $null = $json | ConvertFrom-Json
        
        return $json
    } catch {
        Write-Host "❌ JSON conversion error: $($_.Exception.Message)" -ForegroundColor Red
        throw "Failed to create valid JSON: $($_.Exception.Message)"
    }
}

function Test-UIBridgeServer {
    <#
    .SYNOPSIS
    Check if UIBridge server is running
    #>
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/health" -Method GET
        Write-Host "✅ UIBridge server is healthy" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ UIBridge server not accessible: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Open-UIBridgePage {
    <#
    .SYNOPSIS
    Navigate to a URL
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Url
    )
    
    $bodyObj = @{ url = $Url }
    $body = ConvertTo-SafeJson -InputObject $bodyObj
    
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/navigate" -Method POST -Headers $Global:UIBridgeConfig.Headers -Body $body
        if ($response.success) {
            Write-Host "📍 Navigated to: $($response.url)" -ForegroundColor Green
            Write-Host "📄 Page title: $($response.title)" -ForegroundColor Cyan
            return $response
        } else {
            Write-Host "❌ Navigation failed" -ForegroundColor Red
            return $response
        }
    } catch {
        Write-Host "❌ Navigation error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Take-UIBridgeScreenshot {
    <#
    .SYNOPSIS
    Take a screenshot of the current page
    #>
    param(
        [bool]$FullPage = $true,
        [string]$Format = "png",
        [int]$Quality = 90,
        [string]$BackgroundColor = "auto"  # 'auto', 'transparent', or specific color
    )
    
    $options = @{
        fullPage = $FullPage
        format = $Format
        quality = $Quality
        backgroundColor = $BackgroundColor
    }
    
    $bodyObj = @{
        command = "screenshot"
        options = $options
    }
    
    $body = ConvertTo-SafeJson -InputObject $bodyObj
    
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/execute" -Method POST -Headers $Global:UIBridgeConfig.Headers -Body $body
        
        if ($response.success) {
            Write-Host "📸 Screenshot taken successfully" -ForegroundColor Green
            if ($response.serverFilename) {
                Write-Host "💾 Saved as: $($response.serverFilename)" -ForegroundColor Cyan
            }
            Write-Host "📊 Size: $($response.size) bytes" -ForegroundColor Cyan
            return $response
        } else {
            Write-Host "❌ Screenshot failed: $($response.error)" -ForegroundColor Red
            return $response
        }
    } catch {
        Write-Host "❌ Screenshot error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Click-UIBridgeElement {
    <#
    .SYNOPSIS
    Click an element on the page
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Selector,
        [int]$Timeout = 5000
    )
    
    $options = @{
        timeout = $Timeout
    }
    
    $bodyObj = @{
        command = "click"
        selector = $Selector
        options = $options
    }
    
    $body = ConvertTo-SafeJson -InputObject $bodyObj
    
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/execute" -Method POST -Headers $Global:UIBridgeConfig.Headers -Body $body
        
        if ($response.success) {
            Write-Host "👆 Clicked element: $Selector" -ForegroundColor Green
            return $response
        } else {
            Write-Host "❌ Click failed: $($response.error)" -ForegroundColor Red
            return $response
        }
    } catch {
        Write-Host "❌ Click error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Click-UIBridgeText {
    <#
    .SYNOPSIS
    Click an element by its text content
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Text,
        [int]$Timeout = 5000
    )
    
    # Use proper text selector object instead of string concatenation
    $options = @{
        timeout = $Timeout
    }
    
    $bodyObj = @{
        command = "click"
        selector = @{ text = $Text }
        options = $options
    }
    
    $body = ConvertTo-SafeJson -InputObject $bodyObj
    
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/execute" -Method POST -Headers $Global:UIBridgeConfig.Headers -Body $body
        
        if ($response.success) {
            Write-Host "👆 Clicked text: '$Text'" -ForegroundColor Green
            return $response
        } else {
            Write-Host "❌ Click text failed: $($response.error)" -ForegroundColor Red
            return $response
        }
    } catch {
        Write-Host "❌ Click text error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Click-UIBridgeTestId {
    <#
    .SYNOPSIS
    Click an element by its data-testid attribute
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$TestId,
        [int]$Timeout = 5000
    )
    
    # Use proper testId selector object instead of CSS selector string
    $options = @{
        timeout = $Timeout
    }
    
    $bodyObj = @{
        command = "click"
        selector = @{ testId = $TestId }
        options = $options
    }
    
    $body = ConvertTo-SafeJson -InputObject $bodyObj
    
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/execute" -Method POST -Headers $Global:UIBridgeConfig.Headers -Body $body
        
        if ($response.success) {
            Write-Host "👆 Clicked test ID: $TestId" -ForegroundColor Green
            return $response
        } else {
            Write-Host "❌ Click test ID failed: $($response.error)" -ForegroundColor Red
            return $response
        }
    } catch {
        Write-Host "❌ Click test ID error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Get-UIBridgePageInfo {
    <#
    .SYNOPSIS
    Get information about the current page
    #>
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/page-info" -Method GET
        Write-Host "📄 Page: $($response.title)" -ForegroundColor Cyan
        Write-Host "🔗 URL: $($response.url)" -ForegroundColor Cyan
        return $response
    } catch {
        Write-Host "❌ Page info error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Get-UIBridgeScreenshots {
    <#
    .SYNOPSIS
    List all saved screenshots
    #>
    try {
        $response = Invoke-RestMethod -Uri "$($Global:UIBridgeConfig.ServerUrl)/screenshots" -Method GET
        Write-Host "📸 Found $($response.screenshots.Count) screenshots:" -ForegroundColor Green
        
        foreach ($screenshot in $response.screenshots) {
            Write-Host "  • $($screenshot.filename) - $($screenshot.size) bytes - $($screenshot.created)" -ForegroundColor Cyan
        }
        
        return $response.screenshots
    } catch {
        Write-Host "❌ Screenshots list error: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Start-UIBridgeSession {
    <#
    .SYNOPSIS
    Start a new UIBridge automation session
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Url
    )
    
    Write-Host "🚀 Starting UIBridge session..." -ForegroundColor Yellow
    
    # Check server
    if (-not (Test-UIBridgeServer)) {
        throw "UIBridge server is not accessible"
    }
    
    # Navigate to URL
    $navigation = Open-UIBridgePage -Url $Url
    
    # Take initial screenshot
    $screenshot = Take-UIBridgeScreenshot
    
    Write-Host "✅ Session started successfully!" -ForegroundColor Green
    
    return @{
        Navigation = $navigation
        InitialScreenshot = $screenshot
    }
}

# Export functions (only works when loaded as module)
if ($MyInvocation.MyCommand.ModuleName) {
    Export-ModuleMember -Function *
}

# Show usage examples
Write-Host @"
🎯 UIBridge PowerShell Helper Functions Loaded!

Quick Examples:
  Test-UIBridgeServer                              # Check if server is running
  Open-UIBridgePage -Url "https://example.com"    # Navigate to a page
  Take-UIBridgeScreenshot                          # Take a screenshot
  Click-UIBridgeText -Text "Click Me"              # Click button by text
  Click-UIBridgeTestId -TestId "submit-btn"        # Click by test ID
  Click-UIBridgeElement -Selector "#submit-btn"    # Click by CSS selector
  Get-UIBridgePageInfo                             # Get current page info
  Get-UIBridgeScreenshots                          # List saved screenshots
  
  # Start a complete session
  Start-UIBridgeSession -Url "http://localhost:5173"

"@ -ForegroundColor Green 