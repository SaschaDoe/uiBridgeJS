#!/usr/bin/env node

/**
 * UIBridge Test Automation Script
 * Following the rules from CURSOR_AI_USAGE_RULES.md
 */

const { exec } = require('child_process');
const path = require('path');

async function makeRequest(url, options = {}) {
    const fetch = (await import('node-fetch')).default;
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { success: true, data, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testUIBridge() {
    console.log('🤖 UIBridge Test Automation');
    console.log('Following rules from CURSOR_AI_USAGE_RULES.md\n');

    // Step 1: Health check (as per rules)
    console.log('📊 Step 1: Health Check');
    const healthCheck = await makeRequest('http://localhost:3001/health');
    
    if (!healthCheck.success) {
        console.error('❌ Server not running. Please start server first:');
        console.log('node node_modules/@sashbot/uibridge/server-example.cjs');
        return;
    }
    
    console.log('✅ Server is healthy:', healthCheck.data);

    // Step 2: Test click command
    console.log('\n🎯 Step 2: Testing Click Command');
    
    const clickResult = await makeRequest('http://localhost:3001/execute-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            command: 'click',
            selector: '#test-button'
        })
    });

    if (clickResult.success) {
        console.log('✅ Click command processed:', clickResult.data);
    } else {
        console.log('⚠️  Click command failed:', clickResult.error);
    }

    // Step 3: Screenshot test (using fullPage as per rules)
    console.log('\n📸 Step 3: Screenshot Test');
    
    const screenshotResult = await makeRequest('http://localhost:3001/execute-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            command: 'screenshot',
            options: { fullPage: true }
        })
    });

    if (screenshotResult.success) {
        console.log('✅ Screenshot command processed:', screenshotResult.data);
    } else {
        console.log('❌ Screenshot failed:', screenshotResult.error);
    }

    console.log('\n🎉 Test automation completed!');
    console.log('📋 Summary:');
    console.log('- Server health check: ✅');
    console.log('- Click command test: Completed');
    console.log('- Screenshot test: Completed'); 
}

// Run the test
if (require.main === module) {
    console.log('🚀 Starting UIBridge automation test...\n');
    console.log('Make sure you have:');
    console.log('1. Started the server: node node_modules/@sashbot/uibridge/server-example.cjs');
    console.log('2. Opened test-page.html in your browser');
    console.log('\nPress Ctrl+C to cancel, or wait 3 seconds to start...\n');
    
    setTimeout(() => {
        testUIBridge().catch(console.error);
    }, 3000);
} 