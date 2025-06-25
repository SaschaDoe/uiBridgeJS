/**
 * UIBridge Visual Debug Panel
 * Shows real-time command execution, server status, and automation activity
 * Can be embedded in any web app for live debugging
 */

export class UIBridgeDebugPanel {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right', // top-left, top-right, bottom-left, bottom-right
      serverUrl: 'http://localhost:3002',
      autoConnect: true,
      minimized: false,
      showScreenshots: true,
      maxLogEntries: 50,
      ...options
    };
    
    this.isConnected = false;
    this.commandHistory = [];
    this.element = null;
    this.isMinimized = this.options.minimized;
    this.wsConnection = null;
    
    this.init();
  }
  
  init() {
    this.createPanel();
    this.attachStyles();
    if (this.options.autoConnect) {
      this.connectToServer();
    }
  }
  
  createPanel() {
    // Create main container
    this.element = document.createElement('div');
    this.element.className = 'uibridge-debug-panel';
    this.element.innerHTML = this.getHTML();
    
    // Position the panel
    this.element.style.position = 'fixed';
    this.element.style.zIndex = '999999';
    this.setPosition();
    
    // Add event listeners
    this.attachEventListeners();
    
    // Add to DOM
    document.body.appendChild(this.element);
    
    // Update initial state
    this.updateConnectionStatus();
  }
  
  getHTML() {
    return `
      <div class="debug-panel-header">
        <div class="panel-title">
          <span class="uibridge-logo">🌉</span>
          <span>UIBridge Debug</span>
          <span class="connection-status ${this.isConnected ? 'connected' : 'disconnected'}">
            ${this.isConnected ? '🟢' : '🔴'}
          </span>
        </div>
        <div class="panel-controls">
          <button class="minimize-btn" title="${this.isMinimized ? 'Expand' : 'Minimize'}">
            ${this.isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button class="close-btn" title="Close">❌</button>
        </div>
      </div>
      
      <div class="debug-panel-content" style="display: ${this.isMinimized ? 'none' : 'block'}">
        <div class="server-controls">
          <button class="connect-btn">${this.isConnected ? 'Disconnect' : 'Connect'}</button>
          <input type="text" class="server-url" value="${this.options.serverUrl}" placeholder="Server URL">
        </div>
        
        <div class="activity-section">
          <h4>📊 Live Activity</h4>
          <div class="command-log"></div>
        </div>
        
        <div class="screenshot-section" style="display: ${this.options.showScreenshots ? 'block' : 'none'}">
          <h4>📸 Latest Screenshot</h4>
          <div class="screenshot-preview">
            <div class="no-screenshot">No screenshot yet</div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">Commands:</span>
            <span class="stat-value" id="command-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Success:</span>
            <span class="stat-value success" id="success-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Errors:</span>
            <span class="stat-value error" id="error-count">0</span>
          </div>
        </div>
      </div>
    `;
  }
  
  attachStyles() {
    if (document.getElementById('uibridge-debug-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'uibridge-debug-styles';
    style.textContent = `
      .uibridge-debug-panel {
        width: 320px;
        max-height: 500px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
        font-size: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }
      
      .debug-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: move;
      }
      
      .panel-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      
      .uibridge-logo {
        font-size: 16px;
      }
      
      .connection-status {
        font-size: 10px;
      }
      
      .panel-controls {
        display: flex;
        gap: 4px;
      }
      
      .panel-controls button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        font-size: 10px;
      }
      
      .panel-controls button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .debug-panel-content {
        padding: 12px;
        max-height: 420px;
        overflow-y: auto;
      }
      
      .server-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .connect-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
      }
      
      .connect-btn:hover {
        background: #45a049;
      }
      
      .connect-btn.disconnect {
        background: #f44336;
      }
      
      .server-url {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 6px 8px;
        border-radius: 4px;
        font-size: 11px;
      }
      
      .activity-section h4,
      .screenshot-section h4,
      .stats-section h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #ccc;
      }
      
      .command-log {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        max-height: 120px;
        overflow-y: auto;
        margin-bottom: 12px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
      }
      
      .log-entry {
        margin-bottom: 4px;
        padding: 2px 4px;
        border-radius: 2px;
      }
      
      .log-entry.success {
        background: rgba(76, 175, 80, 0.2);
      }
      
      .log-entry.error {
        background: rgba(244, 67, 54, 0.2);
      }
      
      .log-entry.info {
        background: rgba(33, 150, 243, 0.2);
      }
      
      .log-timestamp {
        color: #888;
        font-size: 9px;
      }
      
      .screenshot-preview {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        text-align: center;
        margin-bottom: 12px;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .screenshot-preview img {
        max-width: 100%;
        max-height: 80px;
        border-radius: 4px;
      }
      
      .no-screenshot {
        color: #666;
        font-size: 10px;
      }
      
      .stats-section {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      
      .stat-item {
        flex: 1;
        text-align: center;
        padding: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      
      .stat-label {
        display: block;
        font-size: 9px;
        color: #aaa;
        margin-bottom: 2px;
      }
      
      .stat-value {
        display: block;
        font-size: 14px;
        font-weight: 600;
      }
      
      .stat-value.success {
        color: #4CAF50;
      }
      
      .stat-value.error {
        color: #f44336;
      }
      
      /* Position classes */
      .uibridge-debug-panel.top-left {
        top: 20px;
        left: 20px;
      }
      
      .uibridge-debug-panel.top-right {
        top: 20px;
        right: 20px;
      }
      
      .uibridge-debug-panel.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .uibridge-debug-panel.bottom-right {
        bottom: 20px;
        right: 20px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setPosition() {
    this.element.className = `uibridge-debug-panel ${this.options.position}`;
  }
  
  attachEventListeners() {
    // Minimize/Expand
    const minimizeBtn = this.element.querySelector('.minimize-btn');
    minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    
    // Close panel
    const closeBtn = this.element.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.destroy());
    
    // Connect/Disconnect
    const connectBtn = this.element.querySelector('.connect-btn');
    connectBtn.addEventListener('click', () => this.toggleConnection());
    
    // Server URL change
    const serverUrlInput = this.element.querySelector('.server-url');
    serverUrlInput.addEventListener('change', (e) => {
      this.options.serverUrl = e.target.value;
    });
    
    // Make panel draggable
    this.makeDraggable();
  }
  
  makeDraggable() {
    const header = this.element.querySelector('.debug-panel-header');
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        this.element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const content = this.element.querySelector('.debug-panel-content');
    const minimizeBtn = this.element.querySelector('.minimize-btn');
    
    content.style.display = this.isMinimized ? 'none' : 'block';
    minimizeBtn.textContent = this.isMinimized ? '⬆️' : '⬇️';
    minimizeBtn.title = this.isMinimized ? 'Expand' : 'Minimize';
  }
  
  async connectToServer() {
    try {
      // Test connection
      const response = await fetch(`${this.options.serverUrl}/health`);
      
      if (response.ok) {
        this.isConnected = true;
        this.logActivity('Connected to UIBridge server', 'success');
        this.startPolling();
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      this.isConnected = false;
      this.logActivity(`Connection failed: ${error.message}`, 'error');
    }
    
    this.updateConnectionStatus();
  }
  
  disconnectFromServer() {
    this.isConnected = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.logActivity('Disconnected from server', 'info');
    this.updateConnectionStatus();
  }
  
  toggleConnection() {
    if (this.isConnected) {
      this.disconnectFromServer();
    } else {
      this.connectToServer();
    }
  }
  
  startPolling() {
    // Poll for command activity every 500ms
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.options.serverUrl}/activity`);
        if (response.ok) {
          const activity = await response.json();
          if (activity.commands && activity.commands.length > 0) {
            this.handleNewCommands(activity.commands);
          }
        }
      } catch (error) {
        // Silently handle polling errors
      }
    }, 500);
  }
  
  handleNewCommands(commands) {
    commands.forEach(command => {
      const isNew = !this.commandHistory.find(c => c.id === command.id);
      if (isNew) {
        this.logActivity(
          `${command.command.toUpperCase()}: ${command.selector || 'page'}`,
          command.success ? 'success' : 'error'
        );
        
        if (command.screenshot) {
          this.updateScreenshot(command.screenshot);
        }
        
        this.commandHistory.push(command);
      }
    });
    
    this.updateStats();
  }
  
  updateConnectionStatus() {
    const statusSpan = this.element.querySelector('.connection-status');
    const connectBtn = this.element.querySelector('.connect-btn');
    
    statusSpan.textContent = this.isConnected ? '🟢' : '🔴';
    statusSpan.className = `connection-status ${this.isConnected ? 'connected' : 'disconnected'}`;
    
    connectBtn.textContent = this.isConnected ? 'Disconnect' : 'Connect';
    connectBtn.className = this.isConnected ? 'connect-btn disconnect' : 'connect-btn';
  }
  
  logActivity(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      timestamp,
      message,
      type,
      time: Date.now()
    };
    
    // Update UI
    const logContainer = this.element.querySelector('.command-log');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
      <span class="log-timestamp">${timestamp}</span>
      ${message}
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Remove old entries from UI
    while (logContainer.children.length > this.options.maxLogEntries) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }
  
  updateScreenshot(screenshotData) {
    if (!this.options.showScreenshots) return;
    
    const preview = this.element.querySelector('.screenshot-preview');
    preview.innerHTML = `<img src="${screenshotData}" alt="Latest screenshot" />`;
  }
  
  updateStats() {
    const totalCommands = this.commandHistory.length;
    const successCount = this.commandHistory.filter(cmd => cmd.success).length;
    const errorCount = this.commandHistory.filter(cmd => !cmd.success).length;
    
    this.element.querySelector('#command-count').textContent = totalCommands;
    this.element.querySelector('#success-count').textContent = successCount;
    this.element.querySelector('#error-count').textContent = errorCount;
  }
  
  destroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    const styles = document.getElementById('uibridge-debug-styles');
    if (styles) {
      styles.remove();
    }
  }
  
  // Public API methods
  show() {
    this.element.style.display = 'block';
  }
  
  hide() {
    this.element.style.display = 'none';
  }
  
  setPosition(position) {
    this.options.position = position;
    this.setPosition();
  }
} 