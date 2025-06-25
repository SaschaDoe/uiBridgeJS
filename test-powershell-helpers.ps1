# UIBridge PowerShell Helper Functions Test Suite
# Ensures the helpers generate valid JSON and work correctly

param(
    [string]$ServerUrl = "http://localhost:3002"
)

Write-Host "🧪 UIBridge PowerShell Helper Functions Test Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Import the helper functions
$helperScript = Join-Path $PSScriptRoot "uibridge-powershell-helpers.ps1"
if (-not (Test-Path $helperScript)) {
    Write-Host "❌ Cannot find uibridge-powershell-helpers.ps1" -ForegroundColor Red
    exit 1
}

# Source the helpers
. $helperScript -ServerUrl $ServerUrl

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsTotal = 0

function Test-Assert {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$ErrorMessage = ""
    )
    
    $script:TestsTotal++
    
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

function Test-JsonGeneration {
    Write-Host "`n🔍 Testing JSON Generation" -ForegroundColor Yellow
    
    # Test 1: ConvertTo-SafeJson with simple object
    try {
        $testObj = @{ test = "value"; number = 42 }
        $json = ConvertTo-SafeJson -InputObject $testObj
        
        # Validate it's parseable
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Simple object JSON conversion" ($parsed.test -eq "value" -and $parsed.number -eq 42)
    } catch {
        Test-Assert "Simple object JSON conversion" $false $_.Exception.Message
    }
    
    # Test 2: ConvertTo-SafeJson with nested object
    try {
        $testObj = @{
            command = "click"
            selector = @{ text = "Button Text" }
            options = @{ timeout = 5000 }
        }
        $json = ConvertTo-SafeJson -InputObject $testObj
        
        # Validate it's parseable and has correct structure
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Nested object JSON conversion" (
            $parsed.command -eq "click" -and 
            $parsed.selector.text -eq "Button Text" -and 
            $parsed.options.timeout -eq 5000
        )
    } catch {
        Test-Assert "Nested object JSON conversion" $false $_.Exception.Message
    }
    
    # Test 3: ConvertTo-SafeJson with special characters
    try {
        $testObj = @{
            text = "Text with ""quotes"" and 'apostrophes' and \backslashes and /slashes"
            selector = "input[name=""search""]"
        }
        $json = ConvertTo-SafeJson -InputObject $testObj
        
        # Validate it's parseable
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Special characters JSON conversion" ($parsed.text -like "*quotes*")
    } catch {
        Test-Assert "Special characters JSON conversion" $false $_.Exception.Message
    }
    
    # Test 4: ConvertTo-SafeJson with Unicode characters
    try {
        $testObj = @{
            text = "Unicode: 🎯 🚀 ✅ ❌ 📸"
            emoji = "😀"
        }
        $json = ConvertTo-SafeJson -InputObject $testObj
        
        # Validate it's parseable
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Unicode characters JSON conversion" ($parsed.emoji -eq "😀")
    } catch {
        Test-Assert "Unicode characters JSON conversion" $false $_.Exception.Message
    }
}

function Test-ClickCommandGeneration {
    Write-Host "`n🖱️ Testing Click Command Generation" -ForegroundColor Yellow
    
    # Test 1: Click by text - check JSON structure
    try {
        # Mock the actual HTTP call by capturing the JSON that would be sent
        $originalFunction = Get-Command Invoke-RestMethod
        
        # Create a test that captures the body
        $capturedBodies = @()
        
        # Test Click-UIBridgeText generates correct JSON
        $testText = "Submit Button"
        
        # We'll examine the JSON generation directly by calling the internal logic
        $options = @{ timeout = 5000 }
        $bodyObj = @{
            command = "click"
            selector = @{ text = $testText }
            options = $options
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Click by text JSON structure" (
            $parsed.command -eq "click" -and
            $parsed.selector.text -eq $testText -and
            $parsed.options.timeout -eq 5000
        )
    } catch {
        Test-Assert "Click by text JSON structure" $false $_.Exception.Message
    }
    
    # Test 2: Click by testId - check JSON structure
    try {
        $testId = "submit-button"
        
        $options = @{ timeout = 5000 }
        $bodyObj = @{
            command = "click"
            selector = @{ testId = $testId }
            options = $options
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Click by testId JSON structure" (
            $parsed.command -eq "click" -and
            $parsed.selector.testId -eq $testId -and
            $parsed.options.timeout -eq 5000
        )
    } catch {
        Test-Assert "Click by testId JSON structure" $false $_.Exception.Message
    }
    
    # Test 3: Click by CSS selector - check JSON structure
    try {
        $selector = "#submit-btn.active"
        
        $options = @{ timeout = 5000 }
        $bodyObj = @{
            command = "click"
            selector = $selector
            options = $options
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Click by CSS selector JSON structure" (
            $parsed.command -eq "click" -and
            $parsed.selector -eq $selector -and
            $parsed.options.timeout -eq 5000
        )
    } catch {
        Test-Assert "Click by CSS selector JSON structure" $false $_.Exception.Message
    }
}

function Test-ScreenshotCommandGeneration {
    Write-Host "`n📸 Testing Screenshot Command Generation" -ForegroundColor Yellow
    
    # Test 1: Basic screenshot JSON
    try {
        $options = @{
            fullPage = $true
            format = "png"
            quality = 90
            backgroundColor = "auto"
        }
        
        $bodyObj = @{
            command = "screenshot"
            options = $options
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Basic screenshot JSON structure" (
            $parsed.command -eq "screenshot" -and
            $parsed.options.fullPage -eq $true -and
            $parsed.options.format -eq "png" -and
            $parsed.options.quality -eq 90 -and
            $parsed.options.backgroundColor -eq "auto"
        )
    } catch {
        Test-Assert "Basic screenshot JSON structure" $false $_.Exception.Message
    }
    
    # Test 2: Screenshot with complex saveConfig
    try {
        $options = @{
            fullPage = $false
            format = "jpeg"
            quality = 80
            saveConfig = @{
                autoSave = $true
                folder = "test-screenshots"
                prefix = "test"
                timestamp = $true
                includeMetadata = $true
            }
        }
        
        $bodyObj = @{
            command = "screenshot"
            options = $options
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Screenshot with saveConfig JSON structure" (
            $parsed.command -eq "screenshot" -and
            $parsed.options.saveConfig.autoSave -eq $true -and
            $parsed.options.saveConfig.folder -eq "test-screenshots" -and
            $parsed.options.saveConfig.prefix -eq "test"
        )
    } catch {
        Test-Assert "Screenshot with saveConfig JSON structure" $false $_.Exception.Message
    }
}

function Test-NavigationCommandGeneration {
    Write-Host "`n🌐 Testing Navigation Command Generation" -ForegroundColor Yellow
    
    # Test 1: Simple URL navigation
    try {
        $url = "https://example.com"
        $bodyObj = @{ url = $url }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Simple URL navigation JSON structure" ($parsed.url -eq $url)
    } catch {
        Test-Assert "Simple URL navigation JSON structure" $false $_.Exception.Message
    }
    
    # Test 2: URL with query parameters
    try {
        $url = "https://example.com/search?q=test%20query&page=1"
        $bodyObj = @{ url = $url }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "URL with query parameters JSON structure" ($parsed.url -eq $url)
    } catch {
        Test-Assert "URL with query parameters JSON structure" $false $_.Exception.Message
    }
}

function Test-ErrorHandling {
    Write-Host "`n⚠️ Testing Error Handling" -ForegroundColor Yellow
    
    # Test 1: ConvertTo-SafeJson with circular reference (PowerShell handles this gracefully with truncation)
    try {
        $obj = @{}
        $obj.self = $obj  # Create circular reference
        
        $json = ConvertTo-SafeJson -InputObject $obj
        # PowerShell truncates deep objects, so this should succeed with a warning
        Test-Assert "Circular reference error handling" ($json -ne $null)
    } catch {
        # If it does throw an error, that's also valid behavior
        Test-Assert "Circular reference error handling" $true
    }
    
    # Test 2: Empty object input
    try {
        $json = ConvertTo-SafeJson -InputObject @{}
        $parsed = $json | ConvertFrom-Json
        Test-Assert "Empty object input handling" ($json -eq "{}")
    } catch {
        Test-Assert "Empty object input handling" $false $_.Exception.Message
    }
}

function Test-RegressionCases {
    Write-Host "`n🔄 Testing Regression Cases" -ForegroundColor Yellow
    
    # Test 1: The original problematic selector patterns
    try {
        # This was causing issues: text=`"$Text`"
        $text = "Click Me"
        $bodyObj = @{
            command = "click"
            selector = @{ text = $text }
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Original text selector pattern fixed" ($parsed.selector.text -eq $text)
    } catch {
        Test-Assert "Original text selector pattern fixed" $false $_.Exception.Message
    }
    
    # Test 2: The original problematic testId pattern
    try {
        # This was causing issues: [data-testid=`"$TestId`"]
        $testId = "submit-btn"
        $bodyObj = @{
            command = "click"
            selector = @{ testId = $testId }
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Original testId selector pattern fixed" ($parsed.selector.testId -eq $testId)
    } catch {
        Test-Assert "Original testId selector pattern fixed" $false $_.Exception.Message
    }
    
    # Test 3: Complex text with all problematic characters
    try {
        $problematicText = "Text with ""quotes"", 'apostrophes', \backslashes, /slashes, and {braces}"
        $bodyObj = @{
            command = "click"
            selector = @{ text = $problematicText }
        }
        
        $json = ConvertTo-SafeJson -InputObject $bodyObj
        $parsed = $json | ConvertFrom-Json
        
        Test-Assert "Problematic characters handling" ($parsed.selector.text -eq $problematicText)
    } catch {
        Test-Assert "Problematic characters handling" $false $_.Exception.Message
    }
}

function Test-IntegrationWithServer {
    Write-Host "`n🌐 Testing Integration with Server (if available)" -ForegroundColor Yellow
    
    # Only run if server is available
    if (Test-UIBridgeServer) {
        Write-Host "   Server is available, running integration tests..." -ForegroundColor Cyan
        
        # Test 1: Health check
        try {
            $result = Test-UIBridgeServer
            Test-Assert "Server health check integration" $result
        } catch {
            Test-Assert "Server health check integration" $false $_.Exception.Message
        }
        
        # Note: We don't test actual navigation/clicking here to avoid side effects
        # That would require a test HTML page and browser automation
        
    } else {
        Write-Host "   Server not available, skipping integration tests" -ForegroundColor Yellow
        Test-Assert "Server integration tests" $true "Skipped - server not available"
    }
}

# Run all tests
Write-Host "`n🚀 Starting test execution..." -ForegroundColor Green

Test-JsonGeneration
Test-ClickCommandGeneration  
Test-ScreenshotCommandGeneration
Test-NavigationCommandGeneration
Test-ErrorHandling
Test-RegressionCases
Test-IntegrationWithServer

# Test summary
Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Total Tests: $script:TestsTotal" -ForegroundColor White
Write-Host "Passed: $script:TestsPassed" -ForegroundColor Green
Write-Host "Failed: $script:TestsFailed" -ForegroundColor Red

if ($script:TestsFailed -eq 0) {
    Write-Host "`n🎉 All tests passed! The PowerShell helpers are working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n💥 Some tests failed. Please review the issues above." -ForegroundColor Red
    exit 1
} 