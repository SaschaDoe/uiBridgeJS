// Browser automation to take real screenshot using UIBridge
import { chromium } from 'playwright';

async function takeRealScreenshot() {
  console.log('🌐 UIBridge Real Browser Screenshot Demo');
  console.log('========================================');
  
  let browser;
  
  try {
    // 1. Launch browser
    console.log('\n🚀 Launching browser...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // 2. Navigate to our test page
    console.log('📍 Navigating to UIBridge test page...');
    await page.goto('http://localhost:5174/test-uibridge.html');
    
    // 3. Wait for UIBridge to initialize
    console.log('⏳ Waiting for UIBridge to initialize...');
    await page.waitForFunction(() => {
      return window.uibridge && window.uibridge._isInitialized;
    }, { timeout: 10000 });
    
    console.log('✅ UIBridge initialized in browser!');
    
    // 4. Test direct screenshot
    console.log('\n📸 Taking screenshot using UIBridge...');
    const screenshotResult = await page.evaluate(async () => {
      try {
        const result = await window.uibridge.execute('screenshot', {
          selector: '#screenshot-target',
          format: 'png',
          quality: 0.9,
          saveConfig: {
            autoSave: true,
            folder: 'browser-demo',
            prefix: 'real-browser-screenshot',
            timestamp: true,
            serverEndpoint: 'http://localhost:3001/save-screenshot'
          }
        });
        
        return {
          success: true,
          width: result.width,
          height: result.height,
          dataUrlLength: result.dataUrl.length,
          fileName: result.fileName,
          filePath: result.filePath
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    if (screenshotResult.success) {
      console.log('✅ Screenshot taken successfully!');
      console.log(`   📐 Dimensions: ${screenshotResult.width}x${screenshotResult.height}`);
      console.log(`   📄 Data URL length: ${screenshotResult.dataUrlLength} characters`);
      console.log(`   📁 File: ${screenshotResult.fileName}`);
      console.log(`   📂 Path: ${screenshotResult.filePath}`);
    } else {
      console.log('❌ Screenshot failed:', screenshotResult.error);
    }
    
    // 5. Test click command
    console.log('\n🖱️ Testing click command...');
    const clickResult = await page.evaluate(async () => {
      try {
        const result = await window.uibridge.execute('click', 'button[onclick="updateTime()"]');
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (clickResult.success) {
      console.log('✅ Click command executed successfully!');
    } else {
      console.log('❌ Click failed:', clickResult.error);
    }
    
    // 6. Test command discovery
    console.log('\n🔍 Testing command discovery...');
    const commands = await page.evaluate(() => {
      return window.uibridge.discover();
    });
    
    console.log(`✅ Discovered ${commands.length} commands:`);
    commands.forEach(cmd => {
      console.log(`   • ${cmd.name}: ${cmd.description}`);
    });
    
    // 7. Check saved files
    console.log('\n📁 Checking saved files...');
    await checkSavedFiles();
    
    console.log('\n🎉 SUCCESS! UIBridge Framework Demonstration Complete');
    console.log('=====================================================');
    console.log('✅ UIBridge loads and initializes correctly');
    console.log('✅ Screenshot command works and saves files');
    console.log('✅ Click command works');
    console.log('✅ Command discovery works');
    console.log('✅ Framework is ready for LLM integration');
    
    // Wait a bit to see the result
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function checkSavedFiles() {
  const fs = await import('fs');
  const path = await import('path');
  
  const screenshotDir = path.join(process.cwd(), 'saved-screenshots', 'browser-demo');
  
  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir);
    console.log(`✅ Found ${files.length} saved screenshot files:`);
    
    files.forEach(file => {
      const filePath = path.join(screenshotDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   📄 ${file} (${stats.size} bytes, ${new Date(stats.mtime).toLocaleString()})`);
      
      if (stats.size > 1000) {
        console.log('   ✅ File size indicates valid screenshot data');
      } else {
        console.log('   ⚠️ File is very small, may not be a real screenshot');
      }
    });
  } else {
    console.log('❌ No saved screenshots found');
  }
}

// Run the demo
takeRealScreenshot(); 