/**
 * UIBridge Screenshot Server Example
 * This is a simple Node.js server that can receive screenshots from UIBridge
 * and save them to actual file system locations.
 * 
 * Usage:
 * 1. npm install express cors fs-extra
 * 2. node server-example.js
 * 3. Configure UIBridge with serverEndpoint: 'http://localhost:3001/save-screenshot'
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

// Configuration
const SCREENSHOTS_BASE_DIR = path.join(__dirname, 'saved-screenshots');

// Ensure screenshots directory exists
fs.ensureDirSync(SCREENSHOTS_BASE_DIR);

/**
 * Save screenshot endpoint
 * POST /save-screenshot
 * Body: { fileName, folder, dataUrl, timestamp }
 */
app.post('/save-screenshot', async (req, res) => {
  try {
    const { fileName, folder, dataUrl, timestamp } = req.body;
    
    if (!fileName || !dataUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName, dataUrl' 
      });
    }
    
    // Create folder path
    const folderPath = folder 
      ? path.join(SCREENSHOTS_BASE_DIR, folder)
      : SCREENSHOTS_BASE_DIR;
    
    // Ensure folder exists
    await fs.ensureDir(folderPath);
    
    // Extract base64 data
    const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create full file path
    const filePath = path.join(folderPath, fileName);
    
    // Save file
    await fs.writeFile(filePath, base64Data, 'base64');
    
    console.log(`Screenshot saved: ${filePath}`);
    
    res.json({
      success: true,
      message: 'Screenshot saved successfully',
      filePath: filePath,
      relativePath: path.relative(SCREENSHOTS_BASE_DIR, filePath),
      timestamp: timestamp || new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Save screenshot error:', error);
    res.status(500).json({
      error: 'Failed to save screenshot',
      message: error.message
    });
  }
});

/**
 * List saved screenshots endpoint
 * GET /screenshots
 */
app.get('/screenshots', async (req, res) => {
  try {
    const { folder } = req.query;
    
    const searchPath = folder 
      ? path.join(SCREENSHOTS_BASE_DIR, folder)
      : SCREENSHOTS_BASE_DIR;
    
    if (!await fs.pathExists(searchPath)) {
      return res.json({ screenshots: [] });
    }
    
    const files = await fs.readdir(searchPath, { withFileTypes: true });
    
    const screenshots = await Promise.all(
      files
        .filter(file => file.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(file.name))
        .map(async (file) => {
          const filePath = path.join(searchPath, file.name);
          const stats = await fs.stat(filePath);
          
          return {
            name: file.name,
            path: path.relative(SCREENSHOTS_BASE_DIR, filePath),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
    );
    
    res.json({ screenshots });
    
  } catch (error) {
    console.error('List screenshots error:', error);
    res.status(500).json({
      error: 'Failed to list screenshots',
      message: error.message
    });
  }
});

/**
 * Serve saved screenshots
 * GET /screenshots/:folder?/:filename
 */
app.get('/screenshots/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(SCREENSHOTS_BASE_DIR, folder, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Screenshot not found' });
  }
  
  res.sendFile(filePath);
});

app.get('/screenshots/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(SCREENSHOTS_BASE_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Screenshot not found' });
  }
  
  res.sendFile(filePath);
});

/**
 * Get server status
 * GET /status
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    screenshotsDir: SCREENSHOTS_BASE_DIR,
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

/**
 * Execute UIBridge command endpoint
 * POST /execute-command
 * Body: { command, args, selector?, options? }
 */
app.post('/execute-command', async (req, res) => {
  try {
    const { command, args = [], selector, options = {} } = req.body;
    
    if (!command) {
      return res.status(400).json({ 
        error: 'Missing required field: command' 
      });
    }
    
    // Store command for web app to pick up
    const commandId = Date.now().toString();
    const commandData = {
      id: commandId,
      command,
      args,
      selector,
      options,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Store in memory (in production, use Redis or database)
    if (!global.pendingCommands) {
      global.pendingCommands = new Map();
    }
    
    global.pendingCommands.set(commandId, commandData);
    
    console.log(`Command queued: ${command} (ID: ${commandId})`);
    
    res.json({
      success: true,
      commandId,
      message: 'Command queued for execution',
      command: commandData
    });
    
  } catch (error) {
    console.error('Execute command error:', error);
    res.status(500).json({
      error: 'Failed to queue command',
      message: error.message
    });
  }
});

/**
 * Get pending commands for web app
 * GET /pending-commands
 */
app.get('/pending-commands', (req, res) => {
  try {
    if (!global.pendingCommands) {
      global.pendingCommands = new Map();
    }
    
    const pending = Array.from(global.pendingCommands.values())
      .filter(cmd => cmd.status === 'pending');
    
    res.json({ commands: pending });
    
  } catch (error) {
    console.error('Get pending commands error:', error);
    res.status(500).json({
      error: 'Failed to get pending commands',
      message: error.message
    });
  }
});

/**
 * Update command result
 * POST /command-result
 * Body: { commandId, result, error? }
 */
app.post('/command-result', async (req, res) => {
  try {
    const { commandId, result, error } = req.body;
    
    if (!commandId) {
      return res.status(400).json({ 
        error: 'Missing required field: commandId' 
      });
    }
    
    if (!global.pendingCommands) {
      global.pendingCommands = new Map();
    }
    
    const command = global.pendingCommands.get(commandId);
    if (!command) {
      return res.status(404).json({
        error: 'Command not found',
        commandId
      });
    }
    
    // Update command status
    command.status = error ? 'failed' : 'completed';
    command.result = result;
    command.error = error;
    command.completedAt = new Date().toISOString();
    
    global.pendingCommands.set(commandId, command);
    
    console.log(`Command ${error ? 'failed' : 'completed'}: ${command.command} (ID: ${commandId})`);
    
    res.json({
      success: true,
      command
    });
    
  } catch (error) {
    console.error('Command result error:', error);
    res.status(500).json({
      error: 'Failed to update command result',
      message: error.message
    });
  }
});

/**
 * Get command discovery information
 * GET /discover-commands
 */
app.get('/discover-commands', (req, res) => {
  try {
    // Return UIBridge command information
    const commands = [
      {
        name: 'click',
        description: 'Clicks on an element using synthetic mouse events',
        parameters: [
          {
            name: 'selector',
            type: 'Selector',
            required: true,
            description: 'Element to click (string, CSS selector, or selector object)'
          },
          {
            name: 'options',
            type: 'ClickOptions',
            required: false,
            description: 'Click options: { force?, position?, button?, clickCount?, delay? }'
          }
        ],
        examples: [
          "{ command: 'click', selector: '#submit-button' }",
          "{ command: 'click', selector: { testId: 'login-btn' } }",
          "{ command: 'click', selector: 'button', options: { position: 'topLeft' } }"
        ]
      },
      {
        name: 'screenshot',
        description: 'Takes a screenshot of the page or a specific element',
        parameters: [
          {
            name: 'options',
            type: 'ScreenshotOptions',
            required: false,
            description: 'Screenshot options: { selector?, format?, quality?, fullPage?, saveConfig? }'
          }
        ],
        examples: [
          "{ command: 'screenshot' }",
          "{ command: 'screenshot', options: { selector: '#main-content' } }",
          "{ command: 'screenshot', options: { fullPage: true, format: 'jpeg' } }"
        ]
      }
    ];
    
    res.json({
      version: '0.1.0',
      generated: new Date().toISOString(),
      commands,
      endpoints: {
        executeCommand: 'POST /execute-command',
        getPendingCommands: 'GET /pending-commands',
        updateResult: 'POST /command-result',
        discoverCommands: 'GET /discover-commands'
      }
    });
    
  } catch (error) {
    console.error('Discover commands error:', error);
    res.status(500).json({
      error: 'Failed to get command discovery',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UIBridge Screenshot Server running on http://localhost:${PORT}`);
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOTS_BASE_DIR}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /save-screenshot - Save a screenshot');
  console.log('  GET /screenshots - List saved screenshots');
  console.log('  GET /screenshots/:filename - Serve a screenshot');
  console.log('  GET /status - Server status');
  console.log('');
  console.log('Configure UIBridge with:');
  console.log(`  serverEndpoint: 'http://localhost:${PORT}/save-screenshot'`);
});

module.exports = app; 