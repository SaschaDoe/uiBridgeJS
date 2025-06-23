#!/usr/bin/env node

/**
 * Simple UIBridge HTTP API Demo
 * 
 * This demonstrates how AI agents can control UIBridge using simple HTTP requests.
 * It uses the existing server-example.cjs as the backend.
 * 
 * Usage:
 * 1. Start the server: node server-example.cjs
 * 2. Open debug-webapp.html in browser
 * 3. Run this demo: node simple-api-demo.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';

async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`🔗 ${method} ${url}`);
    if (data) console.log('📦 Data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || result.message}`);
    }
    
    console.log('✅ Response:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    throw error;
  }
}

async function checkHealth() {
  console.log('\n🏥 Checking server health...');
  return await makeRequest('GET', '/status');
}

async function clickButton(selector) {
  console.log(`\n👆 Clicking: ${JSON.stringify(selector)}`);
  return await makeRequest('POST', '/execute-command', {
    command: 'click',
    selector: selector
  });
}

async function takeScreenshot(options = {}) {
  console.log('\n📸 Taking screenshot...');
  return await makeRequest('POST', '/execute-command', {
    command: 'screenshot',
    options: {
      fullPage: true,
      saveConfig: {
        autoSave: true,
        timestamp: true,
        prefix: 'api-demo'
      },
      ...options
    }
  });
}

async function getCommands() {
  console.log('\n📋 Getting available commands...');
  return await makeRequest('GET', '/discover-commands');
}

async function waitForExecution(commandId, maxAttempts = 10) {
  console.log(`\n⏳ Waiting for command ${commandId} to execute...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const pendingResponse = await makeRequest('GET', '/pending-commands');
      const stillPending = pendingResponse.commands.some(cmd => 
        cmd.id === commandId && cmd.status === 'pending'
      );
      
      if (!stillPending) {
        console.log(`✅ Command ${commandId} completed!`);
        return true;
      }
      
      console.log(`⏳ Still waiting... (${i + 1}/${maxAttempts})`);
    } catch (error) {
      console.log(`⚠️ Error checking status: ${error.message}`);
    }
  }
  
  console.log(`⏰ Timeout waiting for command ${commandId}`);
  return false;
}

async function demonstrateCommands() {
  console.log('🚀 UIBridge HTTP API Demo');
  console.log('========================');
  
  try {
    // 1. Check health
    await checkHealth();
    
    // 2. Get available commands
    await getCommands();
    
    // 3. Take initial screenshot
    const screenshotResult = await takeScreenshot();
    if (screenshotResult.commandId) {
      await waitForExecution(screenshotResult.commandId);
    }
    
    // 4. Try clicking a button (assuming there's one in the test page)
    const clickResult = await clickButton({ text: 'Test Button' });
    if (clickResult.commandId) {
      await waitForExecution(clickResult.commandId);
    }
    
    // 5. Take another screenshot
    const finalScreenshot = await takeScreenshot({ 
      options: { 
        saveConfig: { 
          prefix: 'after-click' 
        } 
      } 
    });
    if (finalScreenshot.commandId) {
      await waitForExecution(finalScreenshot.commandId);
    }
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('📁 Check the saved-screenshots folder for results');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error.message);
    console.log('\n📋 Make sure to:');
    console.log('1. Start server: node server-example.cjs');
    console.log('2. Open debug-webapp.html in browser');
    console.log('3. Run this demo: node simple-api-demo.js');
  }
}

// Simple curl command examples
function showCurlExamples() {
  console.log('\n📖 Equivalent curl commands:');
  console.log('=============================');
  
  console.log('\n🏥 Health Check:');
  console.log('curl -X GET http://localhost:3001/status');
  
  console.log('\n📋 Get Commands:');
  console.log('curl -X GET http://localhost:3001/discover-commands');
  
  console.log('\n👆 Click Button:');
  console.log('curl -X POST http://localhost:3001/execute-command \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"command": "click", "selector": {"text": "Login"}}\'');
  
  console.log('\n📸 Take Screenshot:');
  console.log('curl -X POST http://localhost:3001/execute-command \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"command": "screenshot", "options": {"fullPage": true}}\'');
  
  console.log('\n⏳ Check Pending Commands:');
  console.log('curl -X GET http://localhost:3001/pending-commands');
}

// Main execution
async function main() {
  if (process.argv.includes('--help')) {
    showCurlExamples();
    return;
  }
  
  if (process.argv.includes('--curl')) {
    showCurlExamples();
    return;
  }
  
  await demonstrateCommands();
  showCurlExamples();
}

main().catch(console.error); 