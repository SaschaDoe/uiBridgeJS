/**
 * UIBridge Direct API Server
 * This server can actually execute UIBridge commands directly using Playwright
 * and return immediate results - not just queue them.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
fs.ensureDirSync(SCREENSHOTS_DIR);

// Browser instance (reused for performance)
let browser = null;
let page = null;

/**
 * Initialize browser and page
 */
async function initBrowser() {
  if (!browser) {
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({ headless: false }); // Set to true for production
    page = await browser.newPage();
    
    // Load UIBridge into the page
    const uibridgePath = path.join(__dirname, 'dist', 'uibridge.min.js');
    if (fs.existsSync(uibridgePath)) {
      const uibridgeCode = fs.readFileSync(uibridgePath, 'utf8');
      await page.evaluate(uibridgeCode);
      await page.evaluate(() => {
        if (typeof UIBridge !== 'undefined') {
          window.uibridge = new UIBridge({ debug: true });
          return window.uibridge.init();
        }
      });
      console.log('✅ UIBridge loaded and initialized in browser');
    }
  }
  return { browser, page };
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * Navigate to a URL
 * POST /navigate
 * Body: { url }
 */
app.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    await initBrowser();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Re-inject UIBridge after navigation
    const uibridgePath = path.join(__dirname, 'dist', 'uibridge.min.js');
    if (fs.existsSync(uibridgePath)) {
      const uibridgeCode = fs.readFileSync(uibridgePath, 'utf8');
      await page.evaluate(uibridgeCode);
      await page.evaluate(() => {
        if (typeof UIBridge !== 'undefined') {
          window.uibridge = new UIBridge({ debug: true });
          return window.uibridge.init();
        }
      });
    }
    
    res.json({ 
      success: true, 
      url, 
      title: await page.title(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Navigation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute UIBridge command directly
 * POST /execute
 * Body: { command, selector?, options? }
 */
app.post('/execute', async (req, res) => {
  try {
    const { command, selector, options = {} } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    await initBrowser();
    
    let result;
    
    if (command === 'click') {
      if (!selector) {
        return res.status(400).json({ error: 'Selector is required for click command' });
      }
      
      // Execute click using Playwright
      try {
        if (typeof selector === 'string') {
          await page.click(selector, options);
        } else if (selector.testId) {
          await page.click(`[data-testid="${selector.testId}"]`, options);
        } else if (selector.text) {
          await page.click(`text="${selector.text}"`, options);
        } else if (selector.ariaLabel) {
          await page.click(`[aria-label="${selector.ariaLabel}"]`, options);
        } else {
          throw new Error('Unsupported selector format');
        }
        
        result = {
          success: true,
          command: 'click',
          selector,
          timestamp: new Date().toISOString()
        };
        
      } catch (clickError) {
        result = {
          success: false,
          command: 'click',
          selector,
          error: clickError.message,
          timestamp: new Date().toISOString()
        };
      }
      
    } else if (command === 'screenshot') {
      
      try {
        // Use UIBridge screenshot functionality
        result = await page.evaluate(async (opts) => {
          try {
            if (!window.uibridge) {
              throw new Error('UIBridge not initialized');
            }
            return await window.uibridge.execute('screenshot', opts);
          } catch (error) {
            return {
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
            };
          }
        }, options);
        
        // If UIBridge screenshot succeeded and has dataUrl, optionally save to server
        if (result.success && result.dataUrl) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `screenshot-${timestamp}.${result.format || 'png'}`;
          const filepath = path.join(SCREENSHOTS_DIR, filename);
          
          // Convert dataUrl to buffer and save
          const base64Data = result.dataUrl.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          await fs.writeFile(filepath, buffer);
          
          // Add server file info to result
          result.serverFilename = filename;
          result.serverFilepath = filepath;
          
          console.log(`📸 Screenshot saved: ${filename} (${result.size} bytes)`);
        }
        
      } catch (screenshotError) {
        result = {
          success: false,
          command: 'screenshot',
          error: screenshotError.message,
          timestamp: new Date().toISOString()
        };
      }
      
    } else {
      return res.status(400).json({ error: `Unsupported command: ${command}` });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Execute command error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get page info
 * GET /page-info
 */
app.get('/page-info', async (req, res) => {
  try {
    await initBrowser();
    
    const info = {
      title: await page.title(),
      url: page.url(),
      timestamp: new Date().toISOString()
    };
    
    res.json(info);
    
  } catch (error) {
    console.error('Page info error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List screenshots
 * GET /screenshots
 */
app.get('/screenshots', async (req, res) => {
  try {
    const files = await fs.readdir(SCREENSHOTS_DIR);
    const screenshots = [];
    
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
        const filepath = path.join(SCREENSHOTS_DIR, file);
        const stats = await fs.stat(filepath);
        screenshots.push({
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          url: `/screenshots/${file}`
        });
      }
    }
    
    res.json({ screenshots });
    
  } catch (error) {
    console.error('List screenshots error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Serve screenshot file
 * GET /screenshots/:filename
 */
app.get('/screenshots/:filename', (req, res) => {
  try {
    const filepath = path.join(SCREENSHOTS_DIR, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    
    res.sendFile(filepath);
    
  } catch (error) {
    console.error('Serve screenshot error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cleanup - close browser
 */
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 UIBridge Direct API Server running on http://localhost:${PORT}`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  POST /navigate - Navigate to URL');
  console.log('  POST /execute - Execute UIBridge command directly');
  console.log('  GET  /page-info - Get current page info');
  console.log('  GET  /screenshots - List saved screenshots');
  console.log('  GET  /screenshots/:filename - Serve screenshot file');
  console.log('');
  console.log('Examples:');
  console.log('  curl -X POST http://localhost:' + PORT + '/navigate -H "Content-Type: application/json" -d \'{"url":"https://example.com"}\'');
  console.log('  curl -X POST http://localhost:' + PORT + '/execute -H "Content-Type: application/json" -d \'{"command":"screenshot","options":{"fullPage":true}}\'');
  
  // Initialize browser on startup
  try {
    await initBrowser();
    console.log('✅ Browser initialized and ready');
  } catch (error) {
    console.error('❌ Failed to initialize browser:', error.message);
  }
});

module.exports = app; 