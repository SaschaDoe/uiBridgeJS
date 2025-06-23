#!/usr/bin/env node

/**
 * UIBridge HTTP API Server
 * 
 * A simple HTTP API server that allows AI agents to control web applications
 * using UIBridge commands via direct curl/HTTP requests.
 * 
 * Usage:
 *   node uibridge-api-server.js
 *   
 * Then use curl commands like:
 *   curl -X POST http://localhost:3002/navigate -H "Content-Type: application/json" -d '{"url": "https://example.com"}'
 *   curl -X POST http://localhost:3002/click -H "Content-Type: application/json" -d '{"selector": "#button"}'
 *   curl -X POST http://localhost:3002/screenshot -H "Content-Type: application/json" -d '{"fullPage": true}'
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Global browser and page instances
let browser = null;
let page = null;
let isInitialized = false;

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Initialize browser and UIBridge
 */
async function initializeBrowser() {
  if (isInitialized) return;
  
  try {
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    page = await browser.newPage();
    
    // Inject UIBridge into the page
    await page.addScriptTag({
      path: path.join(__dirname, 'dist/uibridge.min.js')
    });
    
    // Wait for UIBridge to initialize
    await page.waitForFunction(() => window.uibridge && window.uibridge._isInitialized, { timeout: 5000 });
    
    isInitialized = true;
    console.log('✅ Browser and UIBridge initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize browser:', error);
    throw error;
  }
}

/**
 * Ensure browser is initialized
 */
async function ensureInitialized() {
  if (!isInitialized) {
    await initializeBrowser();
  }
}

/**
 * Navigate to URL
 * POST /navigate
 * Body: { url: string }
 */
app.post('/navigate', async (req, res) => {
  try {
    await ensureInitialized();
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'Missing required field: url' 
      });
    }
    
    console.log(`🔗 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Re-inject UIBridge after navigation
    await page.addScriptTag({
      path: path.join(__dirname, 'dist/uibridge.min.js')
    });
    
    // Wait for UIBridge to initialize
    await page.waitForFunction(() => window.uibridge && window.uibridge._isInitialized, { timeout: 5000 });
    
    const title = await page.title();
    
    res.json({
      success: true,
      message: `Navigated to ${url}`,
      url: page.url(),
      title
    });
    
  } catch (error) {
    console.error('Navigate error:', error);
    res.status(500).json({
      error: 'Navigation failed',
      message: error.message
    });
  }
});

/**
 * Click element
 * POST /click
 * Body: { selector: string|object, options?: object }
 */
app.post('/click', async (req, res) => {
  try {
    await ensureInitialized();
    
    const { selector, options = {} } = req.body;
    
    if (!selector) {
      return res.status(400).json({ 
        error: 'Missing required field: selector' 
      });
    }
    
    console.log(`👆 Clicking: ${JSON.stringify(selector)}`);
    
    const result = await page.evaluate(async (sel, opts) => {
      return await window.uibridge.execute('click', sel, opts);
    }, selector, options);
    
    res.json({
      success: true,
      message: 'Click executed successfully',
      result
    });
    
  } catch (error) {
    console.error('Click error:', error);
    res.status(500).json({
      error: 'Click failed',
      message: error.message
    });
  }
});

/**
 * Take screenshot
 * POST /screenshot
 * Body: { fullPage?: boolean, selector?: string, format?: string, quality?: number, filename?: string }
 */
app.post('/screenshot', async (req, res) => {
  try {
    await ensureInitialized();
    
    const { 
      fullPage = true, 
      selector, 
      format = 'png', 
      quality = 90,
      filename 
    } = req.body;
    
    console.log('📸 Taking screenshot...');
    
    let screenshotBuffer;
    const screenshotOptions = {
      type: format,
      quality: format === 'jpeg' ? quality : undefined,
      fullPage: selector ? false : fullPage
    };
    
    if (selector) {
      // Screenshot specific element
      const element = await page.locator(selector).first();
      screenshotBuffer = await element.screenshot(screenshotOptions);
    } else {
      // Screenshot entire page or viewport
      screenshotBuffer = await page.screenshot(screenshotOptions);
    }
    
    // Generate filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const actualFilename = filename || `screenshot-${timestamp}.${format}`;
    const filePath = path.join(SCREENSHOTS_DIR, actualFilename);
    
    // Save screenshot  
    fs.writeFileSync(filePath, screenshotBuffer);
    
    console.log(`✅ Screenshot saved: ${filePath}`);
    
    res.json({
      success: true,
      message: 'Screenshot taken successfully',
      filename: actualFilename,
      path: filePath,
      size: screenshotBuffer.length,
      format,
      fullPage,
      selector
    });
    
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      error: 'Screenshot failed',
      message: error.message
    });
  }
});

/**
 * Execute custom UIBridge command
 * POST /execute
 * Body: { command: string, args?: array }
 */
app.post('/execute', async (req, res) => {
  try {
    await ensureInitialized();
    
    const { command, args = [] } = req.body;
    
    if (!command) {
      return res.status(400).json({ 
        error: 'Missing required field: command' 
      });
    }
    
    console.log(`⚡ Executing command: ${command}`, args);
    
    const result = await page.evaluate(async (cmd, cmdArgs) => {
      return await window.uibridge.execute(cmd, ...cmdArgs);
    }, command, args);
    
    res.json({
      success: true,
      message: `Command '${command}' executed successfully`,
      command,
      args,
      result
    });
    
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({
      error: 'Command execution failed',
      message: error.message,
      command: req.body.command
    });
  }
});

/**
 * Get page information
 * GET /page-info
 */
app.get('/page-info', async (req, res) => {
  try {
    await ensureInitialized();
    
    const title = await page.title();
    const url = page.url();
    const viewport = page.viewportSize();
    
    const pageInfo = await page.evaluate(() => {
      return {
        readyState: document.readyState,
        elementCount: document.querySelectorAll('*').length,
        hasUIBridge: !!(window.uibridge && window.uibridge._isInitialized),
        uibridgeCommands: window.uibridge ? window.uibridge.discover().map(c => c.name) : []
      };
    });
    
    res.json({
      success: true,
      page: {
        title,
        url,
        viewport,
        ...pageInfo
      }
    });
    
  } catch (error) {
    console.error('Page info error:', error);
    res.status(500).json({
      error: 'Failed to get page info',
      message: error.message
    });
  }
});

/**
 * Get available commands
 * GET /commands
 */
app.get('/commands', async (req, res) => {
  try {
    await ensureInitialized();
    
    const commands = await page.evaluate(() => {
      return window.uibridge ? window.uibridge.discover() : [];
    });
    
    const apiCommands = [
      {
        name: 'navigate',
        description: 'Navigate to a URL',
        method: 'POST',
        endpoint: '/navigate',
        parameters: [{ name: 'url', type: 'string', required: true }],
        example: 'curl -X POST http://localhost:3002/navigate -H "Content-Type: application/json" -d \'{"url": "https://example.com"}\''
      },
      {
        name: 'click',
        description: 'Click an element',
        method: 'POST',
        endpoint: '/click',
        parameters: [
          { name: 'selector', type: 'string|object', required: true },
          { name: 'options', type: 'object', required: false }
        ],
        example: 'curl -X POST http://localhost:3002/click -H "Content-Type: application/json" -d \'{"selector": "#button"}\''
      },
      {
        name: 'screenshot',
        description: 'Take a screenshot',
        method: 'POST',
        endpoint: '/screenshot',
        parameters: [
          { name: 'fullPage', type: 'boolean', required: false },
          { name: 'selector', type: 'string', required: false },
          { name: 'filename', type: 'string', required: false }
        ],
        example: 'curl -X POST http://localhost:3002/screenshot -H "Content-Type: application/json" -d \'{"fullPage": true}\''
      },
      {
        name: 'execute',
        description: 'Execute any UIBridge command',
        method: 'POST',
        endpoint: '/execute',
        parameters: [
          { name: 'command', type: 'string', required: true },
          { name: 'args', type: 'array', required: false }
        ],
        example: 'curl -X POST http://localhost:3002/execute -H "Content-Type: application/json" -d \'{"command": "help"}\''
      }
    ];
    
    res.json({
      success: true,
      api: {
        version: '1.0.0',
        baseUrl: `http://localhost:${PORT}`,
        commands: apiCommands
      },
      uibridge: {
        initialized: !!commands.length,
        commands
      }
    });
    
  } catch (error) {
    console.error('Commands error:', error);
    res.status(500).json({
      error: 'Failed to get commands',
      message: error.message
    });
  }
});

/**
 * Health check
 * GET /health
 */
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      browser: {
        initialized: isInitialized,
        connected: browser && browser.isConnected()
      },
      screenshots: {
        directory: SCREENSHOTS_DIR,
        count: fs.readdirSync(SCREENSHOTS_DIR).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * Cleanup on exit
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start server
app.listen(PORT, () => {
  console.log('🚀 UIBridge HTTP API Server Started!');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📁 Screenshots: ${SCREENSHOTS_DIR}`);
  console.log('');
  console.log('📋 Quick Start Commands:');
  console.log(`curl -X GET http://localhost:${PORT}/health`);
  console.log(`curl -X GET http://localhost:${PORT}/commands`);
  console.log(`curl -X POST http://localhost:${PORT}/navigate -H "Content-Type: application/json" -d '{"url": "https://example.com"}'`);
  console.log(`curl -X POST http://localhost:${PORT}/screenshot -H "Content-Type: application/json" -d '{"fullPage": true}'`);
  console.log('');
  console.log('🤖 Perfect for AI agents! Use simple HTTP requests to control web apps.');
  console.log('📖 Get all commands: GET /commands');
  console.log('');
});

module.exports = app;