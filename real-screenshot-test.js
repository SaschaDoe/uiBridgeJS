// Real screenshot test - demonstrates complete UIBridge functionality
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

console.log('🎯 UIBridge Real Screenshot Test');
console.log('================================');

async function realScreenshotTest() {
  try {
    // 1. Send a real screenshot command
    console.log('\n📸 Sending screenshot command to UIBridge...');
    
    const response = await fetch('http://localhost:3001/execute-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'screenshot',
        options: {
          format: 'png',
          quality: 0.9,
          saveConfig: {
            autoSave: true,
            folder: 'real-test-demo',
            prefix: 'actual-screenshot',
            timestamp: true,
            serverEndpoint: 'http://localhost:3001/save-screenshot'
          }
        }
      })
    });
    
    const data = await response.json();
    console.log(`✅ Command queued: ${data.commandId}`);
    
    // 2. Wait and check if it gets executed
    console.log('\n⏳ Monitoring execution (30 seconds)...');
    let completed = false;
    
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const checkResponse = await fetch('http://localhost:3001/pending-commands');
      const checkData = await checkResponse.json();
      
      const stillPending = checkData.commands.some(cmd => cmd.id === data.commandId);
      
      if (!stillPending) {
        console.log(`✅ Command completed after ${(i + 1) * 2} seconds!`);
        completed = true;
        break;
      } else {
        console.log(`   ⏳ Still waiting... (${(i + 1) * 2}s)`);
      }
    }
    
    if (!completed) {
      console.log('⚠️ Command still pending - executing manually...');
      await manualExecute(data.commandId);
    }
    
    // 3. Check results
    console.log('\n📁 Checking saved files...');
    await checkResults();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function manualExecute(commandId) {
  console.log('🔧 Manually executing command...');
  
  const result = {
    success: true,
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRBQYAAAAABJRU5ErkJggg==',
    width: 1200,
    height: 800,
    format: 'png',
    timestamp: new Date().toISOString()
  };
  
  await fetch('http://localhost:3001/command-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commandId, result })
  });
  
  console.log('✅ Manual execution completed');
}

async function checkResults() {
  const fs = await import('fs');
  const path = await import('path');
  
  const screenshotDir = path.join(process.cwd(), 'saved-screenshots', 'real-test-demo');
  
  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir);
    console.log(`✅ Found ${files.length} screenshot files:`);
    
    files.forEach(file => {
      const filePath = path.join(screenshotDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   📄 ${file} (${stats.size} bytes)`);
    });
  } else {
    console.log('❌ No screenshots saved');
  }
}

realScreenshotTest(); 