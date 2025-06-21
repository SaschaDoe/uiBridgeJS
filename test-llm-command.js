// Test script for LLM command execution
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testScreenshotCommand() {
  console.log('🤖 Testing UIBridge LLM Command Execution');
  console.log('==========================================');
  
  try {
    // Test server health
    console.log('1. Checking server health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Server status:', healthData.status);
    
    // Test command discovery
    console.log('\n2. Getting command discovery...');
    const discoveryResponse = await fetch('http://localhost:3001/discover-commands');
    const discoveryData = await discoveryResponse.json();
    console.log('✅ Available commands:', discoveryData.commands.map(c => c.name).join(', '));
    
    // Send screenshot command
    console.log('\n3. Sending screenshot command...');
    const commandResponse = await fetch('http://localhost:3001/execute-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command: 'screenshot',
        options: {
          saveConfig: {
            autoSave: true,
            folder: 'llm-command-test',
            prefix: 'real-screenshot',
            timestamp: true
          }
        }
      })
    });
    
    const commandData = await commandResponse.json();
    console.log('✅ Command queued:', commandData);
    
    // Wait for execution and check result
    console.log('\n4. Waiting for command execution...');
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if command completed by looking for pending commands
      const pendingResponse = await fetch('http://localhost:3001/pending-commands');
      const pendingData = await pendingResponse.json();
      
      const stillPending = pendingData.commands.some(cmd => cmd.id === commandData.commandId);
      
      if (!stillPending) {
        console.log('✅ Command completed!');
        break;
      }
      
      attempts++;
      console.log(`⏳ Waiting... (${attempts}/${maxAttempts})`);
    }
    
    if (attempts >= maxAttempts) {
      console.log('⚠️ Command may still be executing or web app is not responding');
    }
    
    // Check if screenshot file was created
    console.log('\n5. Checking for saved screenshot...');
    const fs = await import('fs');
    const path = await import('path');
    
    const screenshotDir = path.join(process.cwd(), 'saved-screenshots', 'llm-command-test');
    
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir);
      if (files.length > 0) {
        console.log('✅ Screenshot files found:', files);
        
        // Check file size
        const latestFile = files[files.length - 1];
        const filePath = path.join(screenshotDir, latestFile);
        const stats = fs.statSync(filePath);
        console.log(`📄 File: ${latestFile} (${stats.size} bytes)`);
        
        if (stats.size > 1000) {
          console.log('✅ Screenshot appears to be valid (size > 1KB)');
        } else {
          console.log('⚠️ Screenshot file is very small, may be invalid');
        }
      } else {
        console.log('❌ No screenshot files found in directory');
      }
    } else {
      console.log('❌ Screenshot directory not created');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScreenshotCommand(); 