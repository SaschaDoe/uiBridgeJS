/**
 * UIBridge Client-Server Mode
 * 🤖 AI-FRIENDLY SETUP - Connect to LIVE browser sessions
 * 
 * This server mode expects your web app to be ALREADY OPEN in a browser.
 * Commands are sent to the live session where you can SEE automation happening.
 * 
 * Perfect for AI agents that want visual feedback!
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
fs.ensureDirSync(SCREENSHOTS_DIR);

// Connected browser clients (live sessions)
const connectedClients = new Map();
let clientIdCounter = 0;

// Activity tracking for debug panel
let recentActivity = [];
const MAX_ACTIVITY_ENTRIES = 100;

/**
 * Helper function to track command activity
 */
function trackActivity(command, success, details = {}) {
  const activity = {
    id: Date.now() + Math.random(),
    command,
    success,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  recentActivity.unshift(activity);
  
  // Keep only recent entries
  if (recentActivity.length > MAX_ACTIVITY_ENTRIES) {
    recentActivity = recentActivity.slice(0, MAX_ACTIVITY_ENTRIES);
  }
  
  return activity;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const connectedCount = connectedClients.size;
  res.json({ 
    status: 'healthy', 
    connectedClients: connectedCount,
    mode: 'client-server',
    message: connectedCount === 0 
      ? 'No browser clients connected. Open your web app with UIBridge in a browser!'
      : `${connectedCount} browser client(s) connected and ready for automation`
  });
});

/**
 * Client registration endpoint
 * Called by UIBridge in the browser when page loads
 */
app.post('/register-client', (req, res) => {
  const clientId = `client_${++clientIdCounter}`;
  const clientInfo = {
    id: clientId,
    userAgent: req.body.userAgent || 'unknown',
    url: req.body.url || 'unknown',
    timestamp: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
  
  connectedClients.set(clientId, clientInfo);
  
  console.log(`🌐 New browser client connected: ${clientId} at ${clientInfo.url}`);
  
  trackActivity('client-connect', true, { clientId, url: clientInfo.url });
  
  res.json({ 
    success: true, 
    clientId,
    message: 'Client registered successfully',
    connectedClients: connectedClients.size
  });
});

/**
 * Client heartbeat endpoint
 * Keeps the connection alive
 */
app.post('/heartbeat/:clientId', (req, res) => {
  const { clientId } = req.params;
  const client = connectedClients.get(clientId);
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  
  client.lastSeen = new Date().toISOString();
  res.json({ success: true, serverTime: new Date().toISOString() });
});

/**
 * Get recent activity for debug panel
 * GET /activity
 */
app.get('/activity', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const commands = recentActivity.slice(0, limit);
  
  res.json({ 
    success: true, 
    commands,
    total: recentActivity.length,
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

/**
 * Execute UIBridge command on connected clients
 * POST /execute
 * Body: { command, selector?, options?, clientId? }
 */
app.post('/execute', async (req, res) => {
  try {
    const { command, selector, options = {}, clientId } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    if (connectedClients.size === 0) {
      trackActivity(command, false, { error: 'No clients connected' });
      return res.status(400).json({ 
        error: 'No browser clients connected',
        suggestion: 'Make sure your web app has UIBridge loaded and is open in a browser',
        setup: 'Add this to your HTML: <script src="https://unpkg.com/@sashbot/uibridge@latest/dist/uibridge.min.js"></script>'
      });
    }
    
    // Use specific client or first available
    const targetClient = clientId 
      ? connectedClients.get(clientId)
      : connectedClients.values().next().value;
    
    if (!targetClient) {
      return res.status(404).json({ error: 'Target client not found' });
    }
    
    // Store command for client to poll
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const commandData = {
      id: commandId,
      command,
      selector,
      options,
      timestamp: new Date().toISOString(),
      clientId: targetClient.id,
      status: 'pending'
    };
    
    // Store command for client polling
    if (!targetClient.pendingCommands) {
      targetClient.pendingCommands = [];
    }
    targetClient.pendingCommands.push(commandData);
    
    // Track the command
    trackActivity(command, true, { 
      commandId, 
      clientId: targetClient.id, 
      selector: typeof selector === 'object' ? JSON.stringify(selector) : selector 
    });
    
    res.json({
      success: true,
      commandId,
      clientId: targetClient.id,
      status: 'queued',
      message: `Command queued for execution in browser client ${targetClient.id}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Execute command error:', error);
    trackActivity(req.body.command || 'unknown', false, { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Client polls for pending commands
 * GET /poll-commands/:clientId
 */
app.get('/poll-commands/:clientId', (req, res) => {
  const { clientId } = req.params;
  const client = connectedClients.get(clientId);
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  
  const pendingCommands = client.pendingCommands || [];
  client.pendingCommands = []; // Clear after sending
  
  res.json({ 
    success: true, 
    commands: pendingCommands,
    timestamp: new Date().toISOString()
  });
});

/**
 * Client reports command result
 * POST /command-result/:commandId
 */
app.post('/command-result/:commandId', (req, res) => {
  const { commandId } = req.params;
  const result = req.body;
  
  // Update activity with result
  const activityIndex = recentActivity.findIndex(a => a.commandId === commandId);
  if (activityIndex !== -1) {
    recentActivity[activityIndex] = { ...recentActivity[activityIndex], ...result };
    
    // If screenshot result, store it
    if (result.dataUrl && result.command === 'screenshot') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.${result.format || 'png'}`;
      const filepath = path.join(SCREENSHOTS_DIR, filename);
      
      // Save screenshot
      try {
        const base64Data = result.dataUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filepath, buffer);
        
        result.serverFilename = filename;
        result.serverFilepath = filepath;
        
        console.log(`📸 Screenshot saved: ${filename} (${result.size} bytes)`);
      } catch (saveError) {
        console.error('Failed to save screenshot:', saveError);
      }
    }
  }
  
  res.json({ success: true, received: result });
});

/**
 * List connected clients
 * GET /clients
 */
app.get('/clients', (req, res) => {
  const clients = Array.from(connectedClients.values()).map(client => ({
    id: client.id,
    url: client.url,
    userAgent: client.userAgent,
    connected: client.timestamp,
    lastSeen: client.lastSeen,
    pendingCommands: (client.pendingCommands || []).length
  }));
  
  res.json({ success: true, clients, total: clients.length });
});

/**
 * Serve UIBridge client script
 * GET /uibridge-client.js
 */
app.get('/uibridge-client.js', (req, res) => {
  const clientScript = `
// UIBridge Client-Server Mode Auto-Setup
(async function() {
  console.log('🤖 UIBridge Client-Server Mode initializing...');
  
  // Load UIBridge if not already loaded
  if (typeof UIBridge === 'undefined') {
    console.log('📦 Loading UIBridge...');
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@sashbot/uibridge@latest/dist/uibridge.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  
  // Initialize UIBridge with debug panel
  console.log('🚀 Initializing UIBridge...');
  window.uibridge = new UIBridge({
    debug: true,
    showDebugPanel: true,
    debugPanelOptions: {
      position: 'top-right',
      collapsed: false,
      serverMode: true
    }
  });
  
  await window.uibridge.init();
  
  // Register with server
  const response = await fetch('${req.protocol}://${req.get('host')}/register-client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  });
  
  const { clientId } = await response.json();
  window.uibridgeClientId = clientId;
  
  console.log('✅ UIBridge Client-Server Mode ready! Client ID:', clientId);
  console.log('🎯 Your browser is now connected for live automation!');
  
  // Start polling for commands
  setInterval(async () => {
    try {
      const pollResponse = await fetch('${req.protocol}://${req.get('host')}/poll-commands/' + clientId);
      const { commands } = await pollResponse.json();
      
      for (const cmd of commands) {
        console.log('🎯 Executing command:', cmd.command, cmd.selector);
        
        try {
          const result = await window.uibridge.execute(cmd.command, cmd.selector, cmd.options);
          
          // Send result back to server
          await fetch('${req.protocol}://${req.get('host')}/command-result/' + cmd.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...result,
              commandId: cmd.id,
              success: true
            })
          });
          
        } catch (error) {
          await fetch('${req.protocol}://${req.get('host')}/command-result/' + cmd.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              error: error.message,
              commandId: cmd.id
            })
          });
        }
      }
    } catch (pollError) {
      // Silent fail for polling errors
    }
  }, 1000); // Poll every second
  
  // Heartbeat
  setInterval(async () => {
    try {
      await fetch('${req.protocol}://${req.get('host')}/heartbeat/' + clientId, {
        method: 'POST'
      });
    } catch (error) {
      // Silent fail
    }
  }, 30000); // Every 30 seconds
  
})().catch(console.error);
`;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(clientScript);
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

// Clean up disconnected clients periodically
setInterval(() => {
  const now = new Date();
  const timeoutMs = 5 * 60 * 1000; // 5 minutes
  
  for (const [clientId, client] of connectedClients.entries()) {
    const lastSeen = new Date(client.lastSeen);
    if (now - lastSeen > timeoutMs) {
      console.log(`🗑️ Removing inactive client: ${clientId}`);
      connectedClients.delete(clientId);
    }
  }
}, 60000); // Check every minute

// Start server
app.listen(PORT, () => {
  console.log(`🤖 UIBridge Client-Server Mode running on http://localhost:${PORT}`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('');
  console.log('🎯 FOR AI AGENTS - Quick Setup:');
  console.log('1. Add this to your web app HTML:');
  console.log(`   <script src="http://localhost:${PORT}/uibridge-client.js"></script>`);
  console.log('2. Open your web app in a browser');
  console.log('3. Use PowerShell commands or HTTP API to control the LIVE session!');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check + connected clients');
  console.log('  POST /execute - Execute command on live browser session');
  console.log('  GET  /clients - List connected browser sessions');
  console.log('  GET  /activity - Get command activity for debug panel');
  console.log('  GET  /uibridge-client.js - Auto-setup script for web apps');
  console.log('');
  console.log('Example usage:');
  console.log(`  curl -X POST http://localhost:${PORT}/execute -H "Content-Type: application/json" -d '{"command":"click","selector":{"text":"Submit"}}'`);
  console.log(`  curl -X POST http://localhost:${PORT}/execute -H "Content-Type: application/json" -d '{"command":"screenshot"}'`);
});

module.exports = app; 