#!/usr/bin/env node

/**
 * Test the NEW Working UIBridge API Server from NPM Package
 * This verifies that v1.2.4 actually returns real screenshot data
 */

import fetch from 'node-fetch';

async function testUIBridgeAPI() {
    console.log('🧪 Testing UIBridge v1.2.4 API Server from NPM Package');
    console.log('================================================\n');
    
    const baseUrl = 'http://localhost:3002';
    
    try {
        // Step 1: Health Check
        console.log('📊 Step 1: Health Check');
        const health = await fetch(`${baseUrl}/health`);
        
        if (!health.ok) {
            console.error('❌ Server not running. Please start with:');
            console.log('   npm run server');
            return;
        }
        
        const healthData = await health.json();
        console.log('✅ Server is healthy:', healthData);
        
        // Step 2: Navigate to a test page
        console.log('\n🌐 Step 2: Navigate to Test Page');
        const navResponse = await fetch(`${baseUrl}/navigate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: 'https://httpbin.org'
            })
        });
        
        const navData = await navResponse.json();
        console.log('✅ Navigation result:', navData);
        
        // Step 3: Take screenshot - The critical test!
        console.log('\n📸 Step 3: Take Screenshot (The Real Test!)');
        console.log('   This should return actual base64 data, not just "queued"...');
        
        const screenshotResponse = await fetch(`${baseUrl}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'screenshot',
                options: { fullPage: true }
            })
        });
        
        const screenshotData = await screenshotResponse.json();
        
        console.log('\n🔍 Screenshot Response Analysis:');
        console.log('=====================================');
        
        if (screenshotData.success) {
            console.log('✅ Success:', screenshotData.success);
            console.log('📁 Filename:', screenshotData.filename || 'Not provided');
            console.log('📏 Size:', screenshotData.size || 'Not provided', 'bytes');
            
            if (screenshotData.dataUrl) {
                console.log('🎉 HAS BASE64 DATA: YES!');
                console.log('📊 Base64 length:', screenshotData.dataUrl.length, 'characters');
                console.log('🔗 Data URL prefix:', screenshotData.dataUrl.substring(0, 50) + '...');
                
                // Verify it's actual image data
                if (screenshotData.dataUrl.startsWith('data:image/')) {
                    console.log('✅ Valid image data format detected');
                } else {
                    console.log('❌ Invalid image data format');
                }
            } else {
                console.log('❌ NO BASE64 DATA - Still broken!');
            }
            
            console.log('📅 Timestamp:', screenshotData.timestamp);
        } else {
            console.log('❌ Screenshot failed:', screenshotData);
        }
        
        // Step 4: Test clicking (optional)
        console.log('\n🖱️ Step 4: Test Click Command');
        const clickResponse = await fetch(`${baseUrl}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'click',
                selector: 'body' // Simple selector that should exist
            })
        });
        
        const clickData = await clickResponse.json();
        console.log('✅ Click result:', clickData);
        
        // Final verdict
        console.log('\n🎯 FINAL VERDICT');
        console.log('=================');
        
        if (screenshotData.success && screenshotData.dataUrl && screenshotData.dataUrl.startsWith('data:image/')) {
            console.log('🎉 SUCCESS: UIBridge v1.2.4 is working correctly!');
            console.log('✅ Screenshots return real base64 data');
            console.log('✅ API executes commands immediately');
            console.log('✅ No more "command queued" fake responses');
        } else {
            console.log('❌ FAILED: Still not working as expected');
            console.log('   Expected: Real base64 screenshot data');
            console.log('   Got:', screenshotData);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\nMake sure the API server is running:');
        console.log('npm run server');
    }
}

// Run the test
testUIBridgeAPI().catch(console.error); 