// Direct command test with detailed logging
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDirectCommand() {
  console.log('🚀 Testing Direct UIBridge Command Execution');
  console.log('===============================================');
  
  try {
    // 1. Send screenshot command
    console.log('\n1. 📸 Sending screenshot command...');
    const response = await fetch('http://localhost:3001/execute-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command: 'screenshot',
        options: {
          format: 'png',
          quality: 0.9,
          saveConfig: {
            autoSave: true,
            folder: 'direct-test',
            prefix: 'real-screenshot',
            timestamp: true,
            serverEndpoint: 'http://localhost:3001/save-screenshot'
          }
        }
      })
    });
    
    const commandData = await response.json();
    console.log('✅ Command sent successfully:', commandData);
    
    // 2. Monitor execution
    console.log('\n2. 👀 Monitoring command execution...');
    const commandId = commandData.commandId;
    let completed = false;
    let attempts = 0;
    const maxAttempts = 20; // 40 seconds
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      // Check pending commands
      const pendingResponse = await fetch('http://localhost:3001/pending-commands');
      const pendingData = await pendingResponse.json();
      
      const stillPending = pendingData.commands.some(cmd => cmd.id === commandId);
      
      if (!stillPending) {
        console.log(`✅ Command ${commandId} completed after ${attempts * 2} seconds!`);
        completed = true;
      } else {
        console.log(`⏳ Attempt ${attempts}/${maxAttempts}: Command still pending...`);
        
        // Show current pending commands
        if (pendingData.commands.length > 0) {
          console.log(`   📋 Pending commands: ${pendingData.commands.map(c => `${c.command}(${c.id})`).join(', ')}`);
        }
      }
    }
    
    if (!completed) {
      console.log('⚠️ Command did not complete within timeout period');
      console.log('🔍 This suggests the web app is not polling or executing commands');
    }
    
    // 3. Check for saved files
    console.log('\n3. 📁 Checking for saved screenshot files...');
    const fs = await import('fs');
    const path = await import('path');
    
    const screenshotDir = path.join(process.cwd(), 'saved-screenshots', 'direct-test');
    
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir);
      console.log(`✅ Found ${files.length} files in screenshot directory:`);
      
      files.forEach(file => {
        const filePath = path.join(screenshotDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   📄 ${file} (${stats.size} bytes, ${stats.mtime.toISOString()})`);
        
        if (stats.size > 1000) {
          console.log(`   ✅ File appears to be a valid screenshot (>1KB)`);
        } else {
          console.log(`   ⚠️ File is very small, may be invalid`);
        }
      });
    } else {
      console.log('❌ Screenshot directory not found - command was not executed');
    }
    
    // 4. Final status
    console.log('\n4. 🎯 Final Status:');
    if (completed) {
      console.log('✅ Command execution successful!');
      console.log('✅ UIBridge framework is working correctly');
      console.log('✅ LLM can control the web application remotely');
    } else {
      console.log('❌ Command execution failed');
      console.log('❌ Web app is not responding to commands');
      console.log('💡 Check if the web app is running and UIBridge is initialized');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testDirectCommand(); 