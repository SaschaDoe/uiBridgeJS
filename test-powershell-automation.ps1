# UIBridge PowerShell REST API Test Script
param(
    [string]$ServerUrl = 'http://localhost:3001',
    [switch]$Verbose = $false
)

$global:UIBridgeConfig = @{
    BaseUri = $ServerUrl
    Headers = @{ 'Content-Type' = 'application/json' }
}

$global:TestResults = @()
$global:TestCounter = 0

function Write-TestInfo {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Cyan
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-TestError {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Magenta
    Write-Host "🧪 $Title" -ForegroundColor Magenta
    Write-Host "=" * 60 -ForegroundColor Magenta
}

function Test-UIBridgeServer {
    Write-TestInfo "Testing UIBridge server connectivity..."
    
    try {
        $status = Invoke-RestMethod -Uri "$($global:UIBridgeConfig.BaseUri)/status" -ErrorAction Stop
        Write-TestSuccess "UIBridge server is running on $($global:UIBridgeConfig.BaseUri)"
        return $true
    } catch {
        Write-TestError "UIBridge server not available: $_"
        return $false
    }
}

function Invoke-UIBridgeCommand {
    param(
        [string]$Command,
        [hashtable]$Parameters = @{},
        [hashtable]$Options = @{},
        [string]$TestName = "Unknown Test"
    )
    
    $global:TestCounter++
    Write-TestInfo "Test #$global:TestCounter - $TestName"
    
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
    
    try {
        $response = Invoke-RestMethod @params
        
        if ($response.success) {
            Write-TestSuccess "Command '$Command' executed successfully"
            $global:TestResults += @{
                TestNumber = $global:TestCounter
                TestName = $TestName
                Status = 'PASSED'
            }
            return $response
        } else {
            throw "Command execution failed: $($response.error)"
        }
    } catch {
        Write-TestError "UIBridge command '$Command' failed: $_"
        $global:TestResults += @{
            TestNumber = $global:TestCounter
            TestName = $TestName
            Status = 'FAILED'
        }
        throw
    }
}

function Test-BasicCommands {
    Write-TestHeader "Testing Basic Commands"
    
    # Test help command
    try {
        $result = Invoke-UIBridgeCommand -Command 'help' -TestName "Help Command"
        Write-TestSuccess "Help command returned successfully"
    } catch {
        Write-TestError "Help command failed: $_"
    }
    
    # Test screenshot command
    try {
        $result = Invoke-UIBridgeCommand -Command 'screenshot' -Options @{
            saveConfig = @{
                autoSave = $true
                folder = 'powershell-test'
                prefix = 'test'
                timestamp = $true
            }
        } -TestName "Screenshot Command"
        
        if ($result.command.result.fileName) {
            Write-TestSuccess "Screenshot saved: $($result.command.result.fileName)"
        }
    } catch {
        Write-TestError "Screenshot command failed: $_"
    }
}

function Show-TestSummary {
    Write-TestHeader "Test Summary"
    
    $passed = ($global:TestResults | Where-Object { $_.Status -eq 'PASSED' }).Count
    $failed = ($global:TestResults | Where-Object { $_.Status -eq 'FAILED' }).Count
    $total = $global:TestResults.Count
    
    Write-Host ""
    Write-Host "📊 Test Results:" -ForegroundColor Magenta
    Write-Host "   Total Tests: $total" -ForegroundColor White
    Write-Host "   Passed: $passed" -ForegroundColor Green
    Write-Host "   Failed: $failed" -ForegroundColor Red
    
    if ($total -gt 0) {
        $successRate = [math]::Round(($passed / $total) * 100, 2)
        Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($passed -eq $total) { 'Green' } else { 'Yellow' })
    }
}

# Main execution
Write-Host "🚀 UIBridge PowerShell REST API Test Suite" -ForegroundColor Magenta
Write-Host "Server: $ServerUrl" -ForegroundColor Gray
Write-Host ""

if (-not (Test-UIBridgeServer)) {
    Write-TestError "Cannot proceed without UIBridge server"
    Write-TestInfo "Please run: node server-example.cjs"
    exit 1
}

Test-BasicCommands
Show-TestSummary

Write-Host ""
Write-TestSuccess "🎉 Test suite completed!"
