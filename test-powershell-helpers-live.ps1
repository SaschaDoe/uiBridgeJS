# UIBridge PowerShell Helper Functions Live Integration Test
# Tests the helpers against a real UIBridge server with actual HTML page

param(
    [string]$ServerUrl = "http://localhost:3002",
    [switch]$SkipServerStart = $false
)

Write-Host "🚀 UIBridge PowerShell Helper Functions Live Integration Test" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$script:ServerProcess = $null
$script:TestsPassed = 0
$script:TestsFailed = 0

function Test-Assert {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$ErrorMessage = ""
    )
    
    if ($Condition) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($ErrorMessage) {
            Write-Host "   Error: $ErrorMessage" -ForegroundColor Gray
        }
        $script:TestsFailed++
    }
}

function Start-TestServer {
    if ($SkipServerStart) {
        Write-Host "⏭️ Skipping server start (using existing server)" -ForegroundColor Yellow
        return
    }

    Write-Host "🔧 Starting UIBridge test server..." -ForegroundColor Yellow
    
    # Check if server is already running
    try {
        $response = Invoke-RestMethod -Uri "$ServerUrl/health" -Method GET -TimeoutSec 2
        Write-Host "✅ Server already running" -ForegroundColor Green
        return
    } catch {
        Write-Host "   Server not running, starting new instance..." -ForegroundColor Gray
    }
    
    # Start the server
    try {
        $serverScript = Join-Path $PSScriptRoot "api-server.cjs"
        if (-not (Test-Path $serverScript)) {
            throw "Cannot find api-server.cjs"
        }
        
        Write-Host "   Starting: node $serverScript" -ForegroundColor Gray
        $script:ServerProcess = Start-Process -FilePath "node" -ArgumentList $serverScript -PassThru -WindowStyle Hidden
        
        # Wait for server to start
        $attempts = 0
        $maxAttempts = 30
        
        do {
            Start-Sleep -Seconds 1
            $attempts++
            try {
                $response = Invoke-RestMethod -Uri "$ServerUrl/health" -Method GET -TimeoutSec 2
                Write-Host "✅ Server started successfully" -ForegroundColor Green
                return
            } catch {
                if ($attempts -eq $maxAttempts) {
                    throw "Server failed to start after $maxAttempts seconds"
                }
            }
        } while ($attempts -lt $maxAttempts)
    } catch {
        Write-Host "❌ Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Stop-TestServer {
    if ($script:ServerProcess -and -not $script:ServerProcess.HasExited) {
        Write-Host "🛑 Stopping test server..." -ForegroundColor Yellow
        try {
            $script:ServerProcess.Kill()
            $script:ServerProcess.WaitForExit(5000)
            Write-Host "✅ Server stopped" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Failed to stop server gracefully" -ForegroundColor Yellow
        }
    }
}

function Create-TestHtmlPage {
    Write-Host "📄 Creating test HTML page..." -ForegroundColor Yellow
    
    $testHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UIBridge PowerShell Helper Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .button { padding: 12px 24px; margin: 10px; border: none; border-radius: 4px; cursor: pointer; }
        .button-primary { background: #007cba; color: white; }
        .button-secondary { background: #6c757d; color: white; }
        .button-success { background: #28a745; color: white; }
        .test-status { margin: 20px 0; padding: 10px; border-radius: 4px; }
        .status-waiting { background: #fff3cd; border: 1px solid #ffeaa7; }
        .status-success { background: #d4edda; border: 1px solid #c3e6cb; }
        .status-error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .special-chars { font-style: italic; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>UIBridge PowerShell Helper Test Page</h1>
        <p>This page is used for testing the PowerShell helper functions.</p>
        
        <div class="test-status status-waiting" id="testStatus">
            ⏳ Waiting for PowerShell tests...
        </div>
        
        <h2>Test Buttons</h2>
        <button class="button button-primary" data-testid="submit-btn" onclick="markClicked(this)">Submit Button</button>
        <button class="button button-secondary" data-testid="cancel-btn" onclick="markClicked(this)">Cancel</button>
        <button class="button button-success" onclick="markClicked(this)">Click Me</button>
        
        <h2>Special Characters Test</h2>
        <button class="button button-primary" onclick="markClicked(this)">Text with "quotes" and 'apostrophes'</button>
        <button class="button button-secondary" onclick="markClicked(this)">Button with emoji 🚀</button>
        
        <div class="special-chars">
            <p>Special characters: &lt;&gt; &amp; &quot; &#x27; \ / { } [ ]</p>
        </div>
        
        <h2>Test Results</h2>
        <div id="clickResults">
            <p>No clicks recorded yet.</p>
        </div>
    </div>
    
    <script>
        let clickCount = 0;
        
        function markClicked(button) {
            clickCount++;
            const results = document.getElementById('clickResults');
            const timestamp = new Date().toLocaleTimeString();
            
            const newResult = document.createElement('div');
            newResult.innerHTML = `<strong>Click ${clickCount}:</strong> "${button.textContent}" at ${timestamp}`;
            newResult.style.margin = '5px 0';
            newResult.style.padding = '5px';
            newResult.style.background = '#e7f3ff';
            newResult.style.borderRadius = '3px';
            
            if (results.firstChild.textContent === 'No clicks recorded yet.') {
                results.innerHTML = '';
            }
            
            results.appendChild(newResult);
            
            // Update test status
            const status = document.getElementById('testStatus');
            status.className = 'test-status status-success';
            status.innerHTML = `✅ Test in progress - ${clickCount} successful clicks`;
            
            // Highlight the clicked button briefly
            const originalBackground = button.style.background;
            button.style.background = '#ffeb3b';
            setTimeout(() => {
                button.style.background = originalBackground;
            }, 1000);
        }
        
        // Listen for UIBridge commands (if debug panel is loaded)
        if (window.UIBridge) {
            console.log('UIBridge detected - ready for automation!');
        } else {
            console.log('UIBridge not loaded - this page can still be tested with external commands');
        }
    </script>
</body>
</html>
"@
    
    $testPagePath = Join-Path $PSScriptRoot "test-powershell-helpers.html"
    $testHtml | Out-File -FilePath $testPagePath -Encoding UTF8
    
    Write-Host "✅ Test page created: $testPagePath" -ForegroundColor Green
    return $testPagePath
}

function Test-LiveIntegration {
    Write-Host "`n🔧 Testing Live Integration with Server..." -ForegroundColor Yellow
    
    # Import the helper functions
    $helperScript = Join-Path $PSScriptRoot "uibridge-powershell-helpers.ps1"
    . $helperScript -ServerUrl $ServerUrl
    
    # Test 1: Server health check
    try {
        $isHealthy = Test-UIBridgeServer
        Test-Assert "Server health check" $isHealthy
    } catch {
        Test-Assert "Server health check" $false $_.Exception.Message
        return
    }
    
    # Test 2: Navigate to test page
    try {
        $testPagePath = Create-TestHtmlPage
        $testUrl = "file:///$($testPagePath.Replace('\', '/'))"
        
        $navResult = Open-UIBridgePage -Url $testUrl
        Test-Assert "Navigate to test page" ($navResult.success -eq $true)
        
        if ($navResult.success) {
            Write-Host "   ✅ Successfully navigated to: $($navResult.title)" -ForegroundColor Cyan
        }
    } catch {
        Test-Assert "Navigate to test page" $false $_.Exception.Message
        return
    }
    
    # Test 3: Take initial screenshot
    try {
        $screenshotResult = Take-UIBridgeScreenshot -FullPage $true
        Test-Assert "Take initial screenshot" ($screenshotResult.success -eq $true)
        
        if ($screenshotResult.success) {
            Write-Host "   📸 Screenshot size: $($screenshotResult.size) bytes" -ForegroundColor Cyan
        }
    } catch {
        Test-Assert "Take initial screenshot" $false $_.Exception.Message
    }
    
    # Test 4: Click by test ID
    try {
        $clickResult = Click-UIBridgeTestId -TestId "submit-btn"
        Test-Assert "Click by test ID" ($clickResult.success -eq $true)
        
        # Wait a moment for the click to register
        Start-Sleep -Seconds 1
    } catch {
        Test-Assert "Click by test ID" $false $_.Exception.Message
    }
    
    # Test 5: Click by text
    try {
        $clickResult = Click-UIBridgeText -Text "Cancel"
        Test-Assert "Click by text" ($clickResult.success -eq $true)
        
        Start-Sleep -Seconds 1
    } catch {
        Test-Assert "Click by text" $false $_.Exception.Message
    }
    
    # Test 6: Click by CSS selector
    try {
        $clickResult = Click-UIBridgeElement -Selector ".button-success"
        Test-Assert "Click by CSS selector" ($clickResult.success -eq $true)
        
        Start-Sleep -Seconds 1
    } catch {
        Test-Assert "Click by CSS selector" $false $_.Exception.Message
    }
    
    # Test 7: Click text with special characters
    try {
        $clickResult = Click-UIBridgeText -Text "Text with \"quotes\" and 'apostrophes'"
        Test-Assert "Click text with special characters" ($clickResult.success -eq $true)
        
        Start-Sleep -Seconds 1
    } catch {
        Test-Assert "Click text with special characters" $false $_.Exception.Message
    }
    
    # Test 8: Click text with emoji
    try {
        $clickResult = Click-UIBridgeText -Text "Button with emoji 🚀"
        Test-Assert "Click text with emoji" ($clickResult.success -eq $true)
        
        Start-Sleep -Seconds 1
    } catch {
        Test-Assert "Click text with emoji" $false $_.Exception.Message
    }
    
    # Test 9: Take final screenshot
    try {
        $screenshotResult = Take-UIBridgeScreenshot -FullPage $true
        Test-Assert "Take final screenshot" ($screenshotResult.success -eq $true)
    } catch {
        Test-Assert "Take final screenshot" $false $_.Exception.Message
    }
    
    # Test 10: Get page info
    try {
        $pageInfo = Get-UIBridgePageInfo
        Test-Assert "Get page info" ($pageInfo.title -like "*Test Page*")
    } catch {
        Test-Assert "Get page info" $false $_.Exception.Message
    }
    
    # Test 11: List screenshots
    try {
        $screenshots = Get-UIBridgeScreenshots
        Test-Assert "List screenshots" ($screenshots.Count -ge 2)
    } catch {
        Test-Assert "List screenshots" $false $_.Exception.Message
    }
}

# Main execution
try {
    Start-TestServer
    Test-LiveIntegration
    
    Write-Host "`n📊 Live Integration Test Results" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Passed: $script:TestsPassed" -ForegroundColor Green
    Write-Host "Failed: $script:TestsFailed" -ForegroundColor Red
    
    if ($script:TestsFailed -eq 0) {
        Write-Host "`n🎉 All live integration tests passed!" -ForegroundColor Green
        Write-Host "   The PowerShell helpers are working correctly with the UIBridge server." -ForegroundColor Green
    } else {
        Write-Host "`n💥 Some live integration tests failed." -ForegroundColor Red
        Write-Host "   Please check the server and helper functions." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Live integration test failed: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Stop-TestServer
    
    # Clean up test file
    $testPagePath = Join-Path $PSScriptRoot "test-powershell-helpers.html"
    if (Test-Path $testPagePath) {
        Remove-Item $testPagePath -Force
        Write-Host "🧹 Cleaned up test page" -ForegroundColor Gray
    }
}

if ($script:TestsFailed -eq 0) {
    exit 0
} else {
    exit 1
} 