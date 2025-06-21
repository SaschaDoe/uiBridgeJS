# UIBridge Usage Examples

## Installation

```bash
npm install @sashbot/uibridge
```

## Usage Methods

### Method 1: Browser Script Tag (Global Instance)

```html
<script src="https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js"></script>
<script>
  // UIBridge automatically initializes and creates window.uibridge
  window.addEventListener('load', async () => {
    // Use the global instance
    await window.uibridge.execute('click', '#my-button');
    await window.uibridge.execute('screenshot', { format: 'png' });
  });
</script>
```

### Method 2: ES Module Import (Recommended)

```javascript
import UIBridge from '@sashbot/uibridge';

// Create your own instance
const bridge = new UIBridge({
  debug: true,
  autoInit: false // Don't auto-init when importing
});

// Initialize when ready
await bridge.init();

// Use the instance
await bridge.execute('click', '#my-button');
await bridge.execute('screenshot', { format: 'png' });
```

### Method 3: SvelteKit/SSR Compatible (Dynamic Import)

```javascript
// In a Svelte component or SSR environment
import { onMount } from 'svelte';
import { browser } from '$app/environment';

let bridge = null;

onMount(async () => {
  if (!browser) return; // Only run in browser
  
  // Dynamic import to avoid SSR issues
  const { default: UIBridge } = await import('@sashbot/uibridge');
  
  bridge = new UIBridge({ debug: true });
  await bridge.init();
  
  // Now you can use it
  await bridge.execute('click', '#my-button');
});
```

### Method 4: Node.js/Testing Environment

```javascript
// In Node.js for testing with Playwright, Puppeteer, etc.
import UIBridge from '@sashbot/uibridge';

// For Playwright/Puppeteer testing
const page = await browser.newPage();
await page.goto('http://localhost:3000');

// Inject UIBridge into the page
await page.addScriptTag({
  url: 'https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js'
});

// Wait for it to initialize
await page.waitForFunction(() => window.uibridge?._isInitialized);

// Use it via page.evaluate
const result = await page.evaluate(async () => {
  return await window.uibridge.execute('click', '#my-button');
});
```

## Common Commands

### Click Commands

```javascript
// Click by CSS selector
await bridge.execute('click', '#submit-button');

// Click by text content
await bridge.execute('click', { text: 'Submit' });

// Click by test ID
await bridge.execute('click', { testId: 'submit-btn' });

// Click with options
await bridge.execute('click', '#button', {
  position: 'center',
  clickCount: 2,
  force: true
});
```

### Screenshot Commands

```javascript
// Full page screenshot
await bridge.execute('screenshot', { 
  fullPage: true,
  format: 'png'
});

// Element screenshot
await bridge.execute('screenshot', {
  selector: '#main-content',
  format: 'jpeg',
  quality: 0.8
});

// Auto-save screenshot
await bridge.execute('screenshot', {
  saveConfig: {
    autoSave: true,
    folder: 'screenshots',
    prefix: 'test',
    timestamp: true
  }
});
```

### Help Commands

```javascript
// Get general help
const help = await bridge.execute('help');

// Get help for specific command
const clickHelp = await bridge.execute('help', 'click');
```

## Advanced Usage

### Custom Configuration

```javascript
const bridge = new UIBridge({
  debug: true,
  generateCDI: true,
  enableHttpDiscovery: true,
  defaultScreenshotConfig: {
    autoSave: true,
    folder: 'my-screenshots',
    serverEndpoint: 'http://localhost:3001/save-screenshot'
  }
});
```

### Command Discovery

```javascript
// Get all available commands
const commands = bridge.discover();
console.log(commands); // Array of command objects

// Get status
const status = bridge.getStatus();
console.log(status); // Bridge status and config
```

### Error Handling

```javascript
try {
  const result = await bridge.execute('click', '#non-existent');
} catch (error) {
  console.error('Command failed:', error.message);
  
  // Get available commands
  const commands = bridge.discover();
  console.log('Available commands:', commands.map(c => c.name));
}
```

## Troubleshooting

### SSR Issues
- Use dynamic imports in SSR environments
- Only initialize UIBridge in browser context
- Use `browser` environment check in SvelteKit

### Module Not Found
- Ensure you've installed the package: `npm install @sashbot/uibridge`
- Check your package.json has the dependency
- For TypeScript, the types are included automatically

### Performance
- Use `autoInit: false` when creating multiple instances
- Initialize only when needed
- Consider using the global instance for simple use cases 