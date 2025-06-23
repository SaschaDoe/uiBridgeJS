# UIBridge Screenshot Fix Test Script
# This script tests the fixed screenshot functionality

Write-Host "🖼️ UIBridge Screenshot Fix Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test configuration
$ServerUrl = "http://localhost:3002"
$TestUrl = "http://localhost:3002/test-screenshot-fix.html"

# Check if server is running
try {
    $healthCheck = Invoke-RestMethod -Uri "$ServerUrl/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not running. Please start the server first:" -ForegroundColor Red
    Write-Host "   node api-server.cjs" -ForegroundColor Yellow
    exit 1
}

# Function to execute UIBridge commands
function Invoke-UIBridgeCommand {
    param(
        [string]$Command,
        [hashtable]$Parameters = @{}
    )
    
    $body = @{
        command = $Command
    }
    
    if ($Parameters.Count -gt 0) {
        $body.Add('options', $Parameters)
    }
    
    $params = @{
        Uri = "$ServerUrl/execute"
        Method = 'POST'
        Headers = @{ 'Content-Type' = 'application/json' }
        Body = $body | ConvertTo-Json -Depth 4
        TimeoutSec = 60
    }
    
    try {
        return Invoke-RestMethod @params
    } catch {
        Write-Host "❌ Command failed: $_" -ForegroundColor Red
        return $null
    }
}

# Test 1: Navigate to test page
Write-Host "`n🌐 Test 1: Navigate to test page" -ForegroundColor Yellow
try {
    $navResult = Invoke-RestMethod -Uri "$ServerUrl/navigate" -Method POST -Headers @{'Content-Type'='application/json'} -Body (@{url=$TestUrl} | ConvertTo-Json)
    if ($navResult.success) {
        Write-Host "✅ Successfully navigated to test page" -ForegroundColor Green
        Write-Host "   Title: $($navResult.title)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Navigation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Navigation error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Basic screenshot
Write-Host "`n📸 Test 2: Basic screenshot" -ForegroundColor Yellow
$result = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
    format = 'png'
    quality = 0.9
}

if ($result -and $result.success) {
    Write-Host "✅ Basic screenshot successful" -ForegroundColor Green
    Write-Host "   Size: $($result.width)x$($result.height) pixels" -ForegroundColor Gray
    Write-Host "   File size: $($result.size) bytes" -ForegroundColor Gray
    if ($result.serverFilename) {
        Write-Host "   Saved as: $($result.serverFilename)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Basic screenshot failed" -ForegroundColor Red
    if ($result -and $result.error) {
        Write-Host "   Error: $($result.error)" -ForegroundColor Gray
    }
}

# Test 3: Full page screenshot
Write-Host "`n📄 Test 3: Full page screenshot" -ForegroundColor Yellow
$result = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
    fullPage = $true
    format = 'png'
}

if ($result -and $result.success) {
    Write-Host "✅ Full page screenshot successful" -ForegroundColor Green
    Write-Host "   Size: $($result.width)x$($result.height) pixels" -ForegroundColor Gray
    Write-Host "   File size: $($result.size) bytes" -ForegroundColor Gray
    if ($result.serverFilename) {
        Write-Host "   Saved as: $($result.serverFilename)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Full page screenshot failed" -ForegroundColor Red
    if ($result -and $result.error) {
        Write-Host "   Error: $($result.error)" -ForegroundColor Gray
    }
}

# Test 4: Element screenshot
Write-Host "`n🎯 Test 4: Element screenshot" -ForegroundColor Yellow
$result = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
    selector = '.container'
    format = 'png'
}

if ($result -and $result.success) {
    Write-Host "✅ Element screenshot successful" -ForegroundColor Green
    Write-Host "   Size: $($result.width)x$($result.height) pixels" -ForegroundColor Gray
    Write-Host "   File size: $($result.size) bytes" -ForegroundColor Gray
    if ($result.serverFilename) {
        Write-Host "   Saved as: $($result.serverFilename)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Element screenshot failed" -ForegroundColor Red
    if ($result -and $result.error) {
        Write-Host "   Error: $($result.error)" -ForegroundColor Gray
    }
}

# Test 5: Screenshot with auto-save configuration
Write-Host "`n💾 Test 5: Screenshot with auto-save" -ForegroundColor Yellow
$result = Invoke-UIBridgeCommand -Command 'screenshot' -Parameters @{
    format = 'png'
    saveConfig = @{
        autoSave = $true
        folder = 'uibridge-test-screenshots'
        prefix = 'test'
        timestamp = $true
        includeMetadata = $true
    }
}

if ($result -and $result.success) {
    Write-Host "✅ Auto-save screenshot successful" -ForegroundColor Green
    Write-Host "   Size: $($result.width)x$($result.height) pixels" -ForegroundColor Gray
    Write-Host "   File size: $($result.size) bytes" -ForegroundColor Gray
    Write-Host "   UIBridge filename: $($result.fileName)" -ForegroundColor Gray
    if ($result.serverFilename) {
        Write-Host "   Server filename: $($result.serverFilename)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Auto-save screenshot failed" -ForegroundColor Red
    if ($result -and $result.error) {
        Write-Host "   Error: $($result.error)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Screenshot tests completed!" -ForegroundColor Cyan
Write-Host "Check the screenshots folder for saved images." -ForegroundColor Gray 