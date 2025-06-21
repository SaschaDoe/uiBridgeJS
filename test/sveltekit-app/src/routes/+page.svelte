<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let message = '';
  let screenshotUrl = '';
  let commandList = [];
  let bridgeStatus = null;
  let commandHistory = [];
  let isInitialized = false;
  let loading = false;
  let testUIBridge = null;
  
  onMount(async () => {
    if (!browser) return;
    
    // Test importing UIBridge in browser environment
    try {
      const { default: UIBridge } = await import('@sashbot/uibridge');
      testUIBridge = new UIBridge({ debug: true });
      await testUIBridge.init();
      console.log('✅ Imported UIBridge initialized successfully!', testUIBridge);
      
      // Test that both instances work
      const testResult = await testUIBridge.execute('help');
      console.log('✅ Imported UIBridge execute test:', testResult.framework);
    } catch (error) {
      console.error('❌ Failed to initialize imported UIBridge:', error);
    }
    
    // Wait for global UIBridge to initialize
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    const waitForBridge = async () => {
      while (attempts < maxAttempts) {
        if (window.uibridge && window.uibridge._isInitialized) {
          isInitialized = true;
          await loadBridgeInfo();
          
          // Start command polling for external commands
          startCommandPolling();
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!isInitialized) {
        message = 'Failed to initialize UIBridge. Please refresh the page.';
      }
    };
    
    await waitForBridge();
  });
  
  async function loadBridgeInfo() {
    try {
      commandList = window.uibridge.discover();
      bridgeStatus = window.uibridge.getStatus();
      commandHistory = window.uibridge.getHistory(10);
    } catch (error) {
      console.error('Failed to load bridge info:', error);
    }
  }
  
  async function handleTestClick() {
    message = 'Button clicked via Svelte handler! 🎉';
  }
  
  async function testClickCommand() {
    loading = true;
    try {
      message = 'Testing UIBridge click command...';
      
      // Test clicking the test button
      const result = await window.uibridge.execute('click', '#test-button');
      
      message = `✅ Click command successful! Element: ${result.element?.tag}`;
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Click command failed: ${error.message}`;
      console.error('Click test error:', error);
    } finally {
      loading = false;
    }
  }
  
  async function testClickByTestId() {
    loading = true;
    try {
      message = 'Testing click by test ID...';
      
      const result = await window.uibridge.execute('click', { testId: 'main-button' });
      
      message = `✅ Click by testId successful! Element: ${result.element?.tag}`;
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Click by testId failed: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function testClickByText() {
    loading = true;
    try {
      message = 'Testing click by text content...';
      
      const result = await window.uibridge.execute('click', { text: 'Click Me!' });
      
      message = `✅ Click by text successful! Element: ${result.element?.tag}`;
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Click by text failed: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function testScreenshot() {
    loading = true;
    try {
      message = 'Taking screenshot with new save config...';
      
      const result = await window.uibridge.execute('screenshot', {
        selector: '#test-area',
        saveConfig: {
          autoSave: true,
          folder: 'sveltekit-test-screenshots',
          prefix: 'test-area',
          timestamp: true,
          includeMetadata: true,
          serverEndpoint: 'http://localhost:3001/save-screenshot'
        }
      });
      
      screenshotUrl = result.dataUrl;
      message = `✅ Screenshot saved to: ${result.filePath} | Size: ${result.width}x${result.height}`;
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Screenshot failed: ${error.message}`;
      console.error('Screenshot error:', error);
    } finally {
      loading = false;
    }
  }
  
  async function testFullPageScreenshot() {
    loading = true;
    try {
      message = 'Taking full page screenshot with server save...';
      
      const result = await window.uibridge.execute('screenshot', {
        fullPage: true,
        format: 'jpeg',
        quality: 0.8,
        saveConfig: {
          autoSave: true,
          folder: 'sveltekit-test-screenshots',
          prefix: 'fullpage',
          timestamp: true,
          includeMetadata: true,
          serverEndpoint: 'http://localhost:3001/save-screenshot'
        }
      });
      
      screenshotUrl = result.dataUrl;
      message = `✅ Full page screenshot saved to: ${result.filePath} | Size: ${result.width}x${result.height}`;
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Full page screenshot failed: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function downloadCDI() {
    try {
      if (window.__uibridge_cdi__) {
        window.__uibridge_cdi__.save('markdown');
        message = '✅ CDI documentation downloaded!';
      } else {
        message = '⚠️ CDI not available. Enable debug mode.';
      }
    } catch (error) {
      message = `❌ CDI download failed: ${error.message}`;
    }
  }
  
    function clearHistory() {
    window.uibridge.clearHistory();
    commandHistory = [];
    message = '✅ Command history cleared!';
  }

  async function testServerSave() {
    loading = true;
    try {
      message = 'Testing server-side screenshot save...';
      
      // Configure UIBridge for server saving
      window.uibridge.configureScreenshots({
        autoSave: true,
        folder: 'server-test-screenshots',
        prefix: 'server-test',
        timestamp: true,
        includeMetadata: true,
        serverEndpoint: 'http://localhost:3001/save-screenshot'
      });
      
      const result = await window.uibridge.execute('screenshot', {
        selector: '#test-area'
      });
      
      screenshotUrl = result.dataUrl;
      message = `✅ Server save test: ${result.filePath} | Size: ${result.width}x${result.height}`;
      
      // Check if file was saved on server
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:3001/screenshots');
          const data = await response.json();
          console.log('Screenshots on server:', data.screenshots);
          message += ` | Found ${data.screenshots.length} files on server`;
        } catch (error) {
          console.error('Server check failed:', error);
        }
      }, 1000);
      
      await loadBridgeInfo();
    } catch (error) {
      message = `❌ Server save test failed: ${error.message}`;
      console.error('Server save test error:', error);
    } finally {
      loading = false;
    }
  }

  function formatDuration(duration) {
    return duration ? `${duration.toFixed(2)}ms` : 'N/A';
  }

  // Command polling for external commands (LLM integration)
  let commandPollingInterval;
  
  function startCommandPolling() {
    console.log('🤖 [POLLING] Starting command polling...');
    // Poll for external commands every 2 seconds
    commandPollingInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/pending-commands');
        const data = await response.json();
        
        if (data.commands && data.commands.length > 0) {
          console.log('🤖 [POLLING] Found pending commands:', data.commands.length);
          for (const cmd of data.commands) {
            console.log('🤖 [POLLING] Executing command:', cmd.command, 'ID:', cmd.id);
            await executeExternalCommand(cmd);
          }
        } else {
          console.debug('🤖 [POLLING] No pending commands');
        }
      } catch (error) {
        // Silently fail - server might not be running
        console.debug('🤖 [POLLING] Command polling failed:', error.message);
      }
    }, 2000);
  }
  
  async function executeExternalCommand(cmd) {
    try {
      console.log('🤖 [EXECUTE] Starting external command execution:', cmd);
      message = `🤖 Executing external command: ${cmd.command}`;
      loading = true;
      
      let result;
      
      if (cmd.command === 'click') {
        console.log('🤖 [EXECUTE] Executing click command');
        result = await window.uibridge.execute('click', cmd.selector || cmd.args[0], cmd.options);
      } else if (cmd.command === 'screenshot') {
        console.log('🤖 [EXECUTE] Executing screenshot command with options:', cmd.options);
        result = await window.uibridge.execute('screenshot', cmd.options);
        console.log('🤖 [EXECUTE] Screenshot result:', result);
        if (result.dataUrl) {
          screenshotUrl = result.dataUrl;
          console.log('🤖 [EXECUTE] Screenshot URL set, length:', result.dataUrl.length);
        }
      } else {
        // Generic command execution
        console.log('🤖 [EXECUTE] Executing generic command:', cmd.command);
        result = await window.uibridge.execute(cmd.command, ...(cmd.args || []), cmd.options);
      }
      
      console.log('🤖 [EXECUTE] Command execution completed:', result);
      
      // Send result back to server
      await fetch('http://localhost:3001/command-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: cmd.id,
          result
        })
      });
      
      message = `✅ External command completed: ${cmd.command}`;
      await loadBridgeInfo();
      
    } catch (error) {
      console.error('External command failed:', error);
      
      // Send error back to server
      await fetch('http://localhost:3001/command-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: cmd.id,
          error: error.message
        })
      });
      
      message = `❌ External command failed: ${cmd.command} - ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  // Cleanup on component destroy
  import { onDestroy } from 'svelte';
  
  onDestroy(() => {
    if (commandPollingInterval) {
      clearInterval(commandPollingInterval);
    }
  });
</script>

<svelte:head>
  <title>UIBridge Test App</title>
  <script src="/uibridge.js" async></script>
</svelte:head>

<main>
  <header>
    <h1>🌉 UIBridge Test Application</h1>
    <p>Testing the in-app automation framework</p>
    
    {#if !isInitialized}
      <div class="status loading">
        <span class="spinner"></span>
        Initializing UIBridge...
      </div>
    {:else}
      <div class="status initialized">
        ✅ UIBridge Initialized
      </div>
    {/if}
  </header>

  <!-- Test Area -->
  <section id="test-area" class="test-section">
    <h2>🎯 Test Area</h2>
    
    <div class="buttons">
      <button 
        id="test-button" 
        data-testid="main-button"
        class="test-btn primary"
        on:click={handleTestClick}
        disabled={loading}
      >
        Click Me!
      </button>
      
      <button 
        class="test-btn secondary"
        on:click={handleTestClick}
        disabled={loading}
      >
        Another Button
      </button>
    </div>
    
    <div class="message-area">
      <strong>Status:</strong> 
      <span class="message" class:loading>{message || 'Ready for testing'}</span>
      {#if loading}
        <span class="spinner small"></span>
      {/if}
    </div>
  </section>

  <!-- Command Testing -->
  <section class="test-section">
    <h2>🚀 Command Testing</h2>
    
    <div class="command-grid">
      <div class="command-group">
        <h3>Click Commands</h3>
        <button class="action-btn" on:click={testClickCommand} disabled={!isInitialized || loading}>
          Test Click by ID
        </button>
        <button class="action-btn" on:click={testClickByTestId} disabled={!isInitialized || loading}>
          Test Click by TestID
        </button>
        <button class="action-btn" on:click={testClickByText} disabled={!isInitialized || loading}>
          Test Click by Text
        </button>
      </div>
      
      <div class="command-group">
        <h3>Screenshot Commands</h3>
        <button class="action-btn" on:click={testScreenshot} disabled={!isInitialized || loading}>
          Screenshot Element
        </button>
        <button class="action-btn" on:click={testFullPageScreenshot} disabled={!isInitialized || loading}>
          Full Page Screenshot
        </button>
        <button class="action-btn server-test" on:click={testServerSave} disabled={!isInitialized || loading}>
          🖥️ Test Server Save
        </button>
      </div>
      
      <div class="command-group">
        <h3>Discovery & Utils</h3>
        <button class="action-btn" on:click={downloadCDI} disabled={!isInitialized}>
          Download CDI Docs
        </button>
        <button class="action-btn" on:click={clearHistory} disabled={!isInitialized}>
          Clear History
        </button>
      </div>
    </div>
  </section>

  <!-- Screenshot Result -->
  {#if screenshotUrl}
    <section class="test-section">
      <h2>📸 Screenshot Result</h2>
      <div class="screenshot-container">
        <img src={screenshotUrl} alt="Screenshot" class="screenshot" />
        <p class="screenshot-info">
          Click to view full size • Right-click to save
        </p>
      </div>
    </section>
  {/if}

  <!-- Bridge Status -->
  {#if bridgeStatus}
    <section class="test-section">
      <h2>📊 UIBridge Status</h2>
      <div class="status-grid">
        <div class="status-item">
          <label>Version:</label>
          <span>{bridgeStatus.version}</span>
        </div>
        <div class="status-item">
          <label>Commands:</label>
          <span>{bridgeStatus.commandCount}</span>
        </div>
        <div class="status-item">
          <label>History:</label>
          <span>{bridgeStatus.historyLength} entries</span>
        </div>
        <div class="status-item">
          <label>Uptime:</label>
          <span>{formatDuration(bridgeStatus.uptime)}</span>
        </div>
      </div>
    </section>
  {/if}

  <!-- Available Commands -->
  {#if commandList.length > 0}
    <section class="test-section">
      <h2>📋 Available Commands</h2>
      <div class="commands-list">
        {#each commandList as cmd}
          <div class="command-card">
            <h4>{cmd.name}</h4>
            <p class="description">{cmd.description}</p>
            {#if cmd.parameters.length > 0}
              <div class="parameters">
                <strong>Parameters:</strong>
                <ul>
                  {#each cmd.parameters as param}
                    <li>
                      <code>{param.name}</code>
                      <span class="type">({param.type})</span>
                      {#if param.required}
                        <span class="required">required</span>
                      {/if}
                      - {param.description}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            {#if cmd.examples?.length > 0}
              <div class="examples">
                <strong>Examples:</strong>
                {#each cmd.examples as example}
                  <code class="example">{example}</code>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Command History -->
  {#if commandHistory.length > 0}
    <section class="test-section">
      <h2>📈 Recent Command History</h2>
      <div class="history-list">
        {#each commandHistory.slice().reverse() as entry}
          <div class="history-item" class:success={entry.status === 'completed'} class:error={entry.status === 'failed'}>
            <div class="history-header">
              <strong>{entry.command}</strong>
              <span class="duration">{formatDuration(entry.duration)}</span>
              <span class="status {entry.status}">{entry.status}</span>
            </div>
            {#if entry.args?.length > 0}
              <div class="history-args">
                Args: {JSON.stringify(entry.args)}
              </div>
            {/if}
            {#if entry.error}
              <div class="history-error">
                Error: {entry.error}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: #333;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
    color: white;
  }

  header h1 {
    font-size: 3rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  header p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin: 0.5rem 0 1.5rem 0;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 500;
  }

  .status.loading {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .status.initialized {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 2px solid rgba(16, 185, 129, 0.3);
  }

  .test-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .test-section h2 {
    margin: 0 0 1.5rem 0;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .test-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
  }

  .test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .test-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .test-btn.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .test-btn.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 2px solid #d1d5db;
  }

  .test-btn.secondary:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .message-area {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
  }

  .message {
    color: #1e40af;
    font-weight: 500;
  }

  .message.loading {
    color: #f59e0b;
  }

  .command-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .command-group h3 {
    margin: 0 0 1rem 0;
    color: #4b5563;
    font-size: 1.2rem;
  }

  .action-btn {
    display: block;
    width: 100%;
    padding: 0.8rem 1rem;
    margin: 0.5rem 0;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .action-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .action-btn.server-test {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
  }

  .action-btn.server-test:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .screenshot-container {
    text-align: center;
  }

  .screenshot {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .screenshot-info {
    color: #6b7280;
    font-style: italic;
    margin-top: 0.5rem;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem;
    background: #f8fafc;
    border-radius: 6px;
  }

  .status-item label {
    font-weight: 600;
    color: #4b5563;
  }

  .commands-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .command-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fafafa;
  }

  .command-card h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1.3rem;
  }

  .description {
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .parameters ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .parameters li {
    margin: 0.3rem 0;
    color: #4b5563;
  }

  .type {
    color: #7c3aed;
    font-weight: 500;
  }

  .required {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .examples code {
    display: block;
    background: #1f2937;
    color: #f9fafb;
    padding: 0.5rem;
    border-radius: 4px;
    margin: 0.3rem 0;
    font-size: 0.9rem;
    overflow-x: auto;
  }

  .history-list {
    space-y: 0.5rem;
  }

  .history-item {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    margin: 0.5rem 0;
    background: #fafafa;
  }

  .history-item.success {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .history-item.error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .duration {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .status.completed {
    color: #10b981;
    font-weight: 600;
  }

  .status.failed {
    color: #ef4444;
    font-weight: 600;
  }

  .history-args, .history-error {
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 0.3rem;
  }

  .history-error {
    color: #dc2626;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.small {
    width: 12px;
    height: 12px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  code {
    background: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
    
    header h1 {
      font-size: 2rem;
    }
    
    .command-grid {
      grid-template-columns: 1fr;
    }
    
    .commands-list {
      grid-template-columns: 1fr;
    }
  }
</style>
