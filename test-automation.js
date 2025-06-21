/**
 * Test Automation Script for UIBridge Screenshot Demo
 * This script demonstrates the screenshot saving functionality
 * 
 * To use:
 * 1. Open http://localhost:5173 in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this script
 * 4. Run the commands to test screenshot functionality
 */

// Wait for UIBridge to be initialized
async function waitForUIBridge() {
  let attempts = 0;
  while (attempts < 50) {
    if (window.uibridge && window.uibridge._isInitialized) {
      console.log('✅ UIBridge is ready!');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  console.error('❌ UIBridge failed to initialize');
  return false;
}

// Test 1: Configure UIBridge for server saving
async function configureForServerSaving() {
  console.log('🔧 Configuring UIBridge for server saving...');
  
  window.uibridge.configureScreenshots({
    autoSave: true,
    folder: 'automation-test-screenshots',
    prefix: 'demo-test',
    timestamp: true,
    includeMetadata: true,
    serverEndpoint: 'http://localhost:3001/save-screenshot'
  });
  
  const config = window.uibridge.getScreenshotConfig();
  console.log('📋 Current configuration:', config);
}

// Test 2: Take element screenshot
async function takeElementScreenshot() {
  console.log('📸 Taking element screenshot...');
  
  try {
    const result = await window.uibridge.execute('screenshot', {
      selector: '#test-area'
    });
    
    console.log('✅ Element screenshot result:', {
      fileName: result.fileName,
      filePath: result.filePath,
      size: `${result.width}x${result.height}`,
      format: result.format
    });
    
    return result;
  } catch (error) {
    console.error('❌ Element screenshot failed:', error);
    throw error;
  }
}

// Test 3: Take full page screenshot
async function takeFullPageScreenshot() {
  console.log('📸 Taking full page screenshot...');
  
  try {
    const result = await window.uibridge.execute('screenshot', {
      fullPage: true,
      format: 'jpeg',
      quality: 0.8
    });
    
    console.log('✅ Full page screenshot result:', {
      fileName: result.fileName,
      filePath: result.filePath,
      size: `${result.width}x${result.height}`,
      format: result.format
    });
    
    return result;
  } catch (error) {
    console.error('❌ Full page screenshot failed:', error);
    throw error;
  }
}

// Test 4: Custom named screenshot
async function takeCustomNamedScreenshot() {
  console.log('📸 Taking custom named screenshot...');
  
  try {
    const customName = `custom-demo-${Date.now()}.png`;
    
    const result = await window.uibridge.execute('screenshot', {
      selector: '#test-area',
      saveConfig: {
        customName: customName,
        folder: 'custom-test-folder'
      }
    });
    
    console.log('✅ Custom named screenshot result:', {
      fileName: result.fileName,
      filePath: result.filePath,
      size: `${result.width}x${result.height}`,
      format: result.format
    });
    
    return result;
  } catch (error) {
    console.error('❌ Custom named screenshot failed:', error);
    throw error;
  }
}

// Test 5: Check server for saved files
async function checkServerFiles() {
  console.log('🖥️ Checking server for saved files...');
  
  try {
    const response = await fetch('http://localhost:3001/screenshots');
    const data = await response.json();
    
    console.log(`📁 Found ${data.screenshots.length} screenshots on server:`);
    data.screenshots.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (${file.size} bytes) - ${file.path}`);
    });
    
    return data.screenshots;
  } catch (error) {
    console.error('❌ Failed to check server files:', error);
    throw error;
  }
}

// Main test function - run all tests
async function runAllTests() {
  console.log('🚀 Starting UIBridge Screenshot Tests...');
  console.log('========================================');
  
  try {
    // Initialize
    const isReady = await waitForUIBridge();
    if (!isReady) return;
    
    // Configure
    await configureForServerSaving();
    
    // Take screenshots
    await takeElementScreenshot();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    
    await takeFullPageScreenshot();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    
    await takeCustomNamedScreenshot();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server save
    
    // Check results
    await checkServerFiles();
    
    console.log('========================================');
    console.log('✅ All tests completed successfully!');
    console.log('📁 Check the "saved-screenshots" folder in the project directory');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Quick test functions for individual testing
window.testUIBridge = {
  runAll: runAllTests,
  configure: configureForServerSaving,
  elementScreenshot: takeElementScreenshot,
  fullPageScreenshot: takeFullPageScreenshot,
  customScreenshot: takeCustomNamedScreenshot,
  checkServer: checkServerFiles
};

console.log('🌉 UIBridge Test Suite Loaded!');
console.log('📋 Available commands:');
console.log('  testUIBridge.runAll() - Run all tests');
console.log('  testUIBridge.configure() - Configure for server saving');
console.log('  testUIBridge.elementScreenshot() - Take element screenshot');
console.log('  testUIBridge.fullPageScreenshot() - Take full page screenshot');
console.log('  testUIBridge.customScreenshot() - Take custom named screenshot');
console.log('  testUIBridge.checkServer() - Check server for saved files');
console.log('');
console.log('🚀 Run testUIBridge.runAll() to start the demo!'); 