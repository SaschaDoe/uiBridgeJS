# UIBridge PowerShell Automation Script for AI Agents
# This script demonstrates how to use UIBridge REST API with PowerShell
# Perfect for AI agents like Cursor to automate web interactions

param(
    [string]$ServerUrl = 'http://localhost:3001',
    [string]$TargetSelector = '#submit-button',
    [switch]$FullPageScreenshot = $true,
    [string]$ScreenshotFolder = 'ai-automation'
)

# Store common configuration
$global:UIBridgeConfig = @{
    BaseUri = $ServerUrl
    Headers = @{ 'Content-Type' = 'application/json' }
}

function Write-LogInfo {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Cyan
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-LogError {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Test-UIBridgeServer {
    Write-LogInfo "Checking UIBridge server status..."
    
    try {
        $status = Invoke-RestMethod -Uri "$($global:UIBridgeConfig.BaseUri)/status" -ErrorAction Stop
        Write-LogSuccess "UIBridge server is running on $($global:UIBridgeConfig.BaseUri)"
        return $true
    } catch {
        Write-LogError "UIBridge server not available at $($global:UIBridgeConfig.BaseUri)"
        Write-LogInfo "To start the server, run: node server-example.cjs"
        return $false
    }
}

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
        Body    = @{
            command = $Command
        } | ConvertTo-Json -Depth 4
    }
    
    # Add parameters to body
    $bodyObj = $params.Body | ConvertFrom-Json
    if ($Parameters.Count -gt 0) {
        foreach ($key in $Parameters.Keys) {
            $bodyObj | Add-Member -NotePropertyName $key -NotePropertyValue $Parameters[$key]
        }
    }
    if ($Options.Count -gt 0) {
        $bodyObj | Add-Member -NotePropertyName 'options' -NotePropertyValue $Options
    }
    
    $params.Body = $bodyObj | ConvertTo-Json -Depth 4
    
    Write-LogInfo "Executing UIBridge command: $Command"
    
    try {
        $response = Invoke-RestMethod @params
        if ($response.success) {
            Write-LogSuccess "Command '$Command' executed successfully"
            return $response
        } else {
            Write-LogError "Command '$Command' failed: $($response.error)"
            throw "Command execution failed"
        }
    } catch {
        Write-LogError "UIBridge command '$Command' failed: $_"
        throw
    }
}

function Invoke-SmartClick {
    param([string]$Target)
    
    Write-LogInfo "Attempting to click element: $Target"
    
    # Multiple selector strategies (in order of reliability)
    $selectorStrategies = @(
        @{ testId = $Target },
        @{ testId = "$Target-btn" },
        @{ testId = "$Target-button" },
        "#$Target",
        "#$Target-btn", 
        "#$Target-button",
        @{ text = $Target },
        @{ ariaLabel = $Target },
        ".$Target",
        ".btn-$Target"
    )
    
    foreach ($selector in $selectorStrategies) {
        try {
            Write-LogInfo "Trying selector: $($selector | ConvertTo-Json -Compress)"
            
            $result = Invoke-UIBridgeCommand -Command 'click' -Parameters @{
                selector = $selector
            } -Options @{
                force = $true
            }
            
            Write-LogSuccess "Click successful with selector: $($selector | ConvertTo-Json -Compress)"
            return $result
            
        } catch {
            Write-LogWarning "Selector failed: $($selector | ConvertTo-Json -Compress) - $($_.Exception.Message)"
        }
    }
    
    throw "Could not find clickable element for: $Target"
}

function Invoke-Screenshot {
    param(
        [switch]$FullPage = $true,
        [string]$Prefix = 'screenshot',
        [string]$Folder = 'screenshots'
    )
    
    $options = @{
        fullPage = $FullPage.IsPresent
        saveConfig = @{
            autoSave = $true
            folder = $Folder
            prefix = $Prefix
            timestamp = $true
        }
    }
    
    try {
        $result = Invoke-UIBridgeCommand -Command 'screenshot' -Options $options
        
        if ($result.command.result.fileName) {
            Write-LogSuccess "Screenshot saved: $($result.command.result.fileName)"
            return $result.command.result.fileName
        } else {
            Write-LogWarning "Screenshot taken but filename not returned"
            return $null
        }
    } catch {
        Write-LogError "Screenshot failed: $_"
        throw
    }
}

function Start-AutomationWorkflow {
    param(
        [string]$ClickTarget = $TargetSelector,
        [string]$WorkflowName = 'automation'
    )
    
    Write-LogInfo "🤖 Starting UIBridge automation workflow: $WorkflowName"
    
    # Check server availability
    if (-not (Test-UIBridgeServer)) {
        return $false
    }
    
    try {
        # Step 1: Take initial screenshot
        Write-LogInfo "📸 Taking initial screenshot..."
        $initialScreenshot = Invoke-Screenshot -Prefix "$WorkflowName-initial" -Folder $ScreenshotFolder
        
        # Step 2: Execute click action
        Write-LogInfo "🖱️ Executing click action..."
        $clickResult = Invoke-SmartClick -Target $ClickTarget
        
        # Step 3: Wait for page response
        Write-LogInfo "⏳ Waiting for page response..."
        Start-Sleep -Seconds 2
        
        # Step 4: Take verification screenshot
        Write-LogInfo "📸 Taking verification screenshot..."
        $finalScreenshot = Invoke-Screenshot -Prefix "$WorkflowName-final" -Folder $ScreenshotFolder
        
        Write-LogSuccess "✅ Automation workflow '$WorkflowName' completed successfully!"
        
        return @{
            success = $true
            workflow = $WorkflowName
            initialScreenshot = $initialScreenshot
            finalScreenshot = $finalScreenshot
            clickResult = $clickResult
        }
        
    } catch {
        Write-LogError "❌ Automation workflow failed: $_"
        
        # Take error screenshot for debugging
        try {
            $errorScreenshot = Invoke-Screenshot -Prefix "$WorkflowName-error" -Folder $ScreenshotFolder
            Write-LogInfo "🔍 Error screenshot saved: $errorScreenshot"
        } catch {
            Write-LogWarning "Could not take error screenshot"
        }
        
        return @{
            success = $false
            error = $_.Exception.Message
        }
    }
}

# Main execution
Write-LogInfo "🚀 UIBridge PowerShell Automation Script"
Write-LogInfo "Server: $ServerUrl"
Write-LogInfo "Target: $TargetSelector"
Write-LogInfo "Screenshot Folder: $ScreenshotFolder"

$result = Start-AutomationWorkflow -ClickTarget $TargetSelector -WorkflowName 'ai-automation'

if ($result.success) {
    Write-LogSuccess "🎉 Automation completed successfully!"
    Write-Host "Initial Screenshot: $($result.initialScreenshot)" -ForegroundColor Gray
    Write-Host "Final Screenshot: $($result.finalScreenshot)" -ForegroundColor Gray
} else {
    Write-LogError "💥 Automation failed: $($result.error)"
    exit 1
}

# Example usage commands:
<#
# Basic usage:
.\example-powershell-automation.ps1

# Custom target:
.\example-powershell-automation.ps1 -TargetSelector "submit"

# Custom server:
.\example-powershell-automation.ps1 -ServerUrl "http://localhost:3002"

# No full page screenshot:
.\example-powershell-automation.ps1 -FullPageScreenshot:$false
#> 