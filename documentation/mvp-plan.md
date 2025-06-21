# UIBridgeJS MVP Implementation Plan

## MVP Scope: Core Features Only

### Features to Implement
1. **DOM Element Finding** - Multiple selector strategies
2. **Click Command** - Synthetic click events
3. **Screenshot Command** - Full viewport capture
4. **Command Discovery Interface (CDI)** - Auto-generated command list

---

## Project Structure

```
uibridge-js/
├── src/
│   ├── core/
│   │   ├── UIBridge.js          # Main class
│   │   ├── CommandRegistry.js   # Command registration
│   │   ├── SelectorEngine.js    # DOM finding logic
│   │   └── EventSynthesizer.js  # Native event generation
│   ├── commands/
│   │   ├── click.js
│   │   └── screenshot.js
│   ├── discovery/
│   │   ├── CDIGenerator.js      # Generates discovery files
│   │   └── templates/
│   │       └── commands.md.template
│   └── index.js
├── dist/
│   └── uibridge.min.js
├── test/
│   └── sveltekit-app/           # Test SvelteKit app
└── package.json
```

---

## Implementation Plan

### Phase 1: Core Architecture (Days 1-2)

#### 1.1 Main UIBridge Class

```javascript
// src/core/UIBridge.js
class UIBridge {
  constructor(config = {}) {
    this.config = {
      debug: false,
      allowedOrigins: ['*'],
      commands: ['click', 'screenshot', 'discover'],
      ...config
    };
    
    this.registry = new CommandRegistry();
    this.selectorEngine = new SelectorEngine();
    this._isInitialized = false;
  }

  init() {
    if (this._isInitialized) return;
    
    // Register core commands
    this.registry.register('click', clickCommand);
    this.registry.register('screenshot', screenshotCommand);
    
    // Setup discovery endpoint
    this._setupDiscovery();
    
    // Expose global API
    window.UIBridge = this;
    window.__uibridge__ = {
      execute: this.execute.bind(this),
      discover: this.discover.bind(this)
    };
    
    this._isInitialized = true;
    this._log('UIBridge initialized');
  }

  async execute(commandName, ...args) {
    const command = this.registry.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    
    this._log(`Executing: ${commandName}`, args);
    return await command.execute(this, ...args);
  }

  findElement(selector) {
    return this.selectorEngine.find(selector);
  }

  discover() {
    return this.registry.getAll().map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      parameters: cmd.parameters
    }));
  }

  _log(...args) {
    if (this.config.debug) {
      console.log('[UIBridge]', ...args);
    }
  }
}
```

#### 1.2 Selector Engine

```javascript
// src/core/SelectorEngine.js
class SelectorEngine {
  constructor() {
    this.strategies = new Map();
    this._setupDefaultStrategies();
  }

  _setupDefaultStrategies() {
    // CSS Selector
    this.strategies.set('css', (selector) => {
      return document.querySelector(selector);
    });

    // XPath
    this.strategies.set('xpath', (xpath) => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    });

    // Text content
    this.strategies.set('text', (text) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim() === text) {
          return node.parentElement;
        }
      }
      return null;
    });

    // Data-testid
    this.strategies.set('testId', (id) => {
      return document.querySelector(`[data-testid="${id}"]`);
    });
  }

  find(selector) {
    // String = CSS selector
    if (typeof selector === 'string') {
      return this.strategies.get('css')(selector);
    }

    // Object selectors
    if (typeof selector === 'object') {
      if (selector.xpath) {
        return this.strategies.get('xpath')(selector.xpath);
      }
      if (selector.text) {
        return this.strategies.get('text')(selector.text);
      }
      if (selector.testId) {
        return this.strategies.get('testId')(selector.testId);
      }
    }

    throw new Error(`Invalid selector: ${JSON.stringify(selector)}`);
  }

  findAll(selector) {
    // Implementation for multiple elements
    // Similar to find() but returns array
  }
}
```

---

### Phase 2: Commands Implementation (Days 3-4)

#### 2.1 Click Command

```javascript
// src/commands/click.js
export const clickCommand = {
  name: 'click',
  description: 'Clicks on an element',
  parameters: [
    {
      name: 'selector',
      type: 'Selector',
      required: true,
      description: 'Element to click'
    },
    {
      name: 'options',
      type: 'ClickOptions',
      required: false,
      description: 'Click options'
    }
  ],

  async execute(bridge, selector, options = {}) {
    const element = bridge.findElement(selector);
    if (!element) {
      throw new Error(`Element not found: ${JSON.stringify(selector)}`);
    }

    // Default options
    const opts = {
      force: false,
      position: 'center',
      button: 'left',
      clickCount: 1,
      delay: 0,
      ...options
    };

    // Check visibility unless force is true
    if (!opts.force) {
      const isVisible = this._isElementVisible(element);
      if (!isVisible) {
        throw new Error('Element is not visible');
      }
    }

    // Calculate click position
    const rect = element.getBoundingClientRect();
    const position = this._calculatePosition(rect, opts.position);

    // Create synthetic mouse events
    const eventInit = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: position.x,
      clientY: position.y,
      button: opts.button === 'right' ? 2 : 0,
      buttons: opts.button === 'right' ? 2 : 1,
    };

    // Dispatch events
    element.dispatchEvent(new MouseEvent('mousedown', eventInit));
    
    if (opts.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, opts.delay));
    }
    
    element.dispatchEvent(new MouseEvent('mouseup', eventInit));
    element.dispatchEvent(new MouseEvent('click', eventInit));

    // Handle multiple clicks
    if (opts.clickCount > 1) {
      for (let i = 1; i < opts.clickCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        element.dispatchEvent(new MouseEvent('click', eventInit));
      }
    }

    // Focus element if it's focusable
    if (this._isFocusable(element)) {
      element.focus();
    }

    return {
      success: true,
      element: {
        tag: element.tagName.toLowerCase(),
        text: element.textContent.trim().substring(0, 100)
      }
    };
  },

  _isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  },

  _calculatePosition(rect, position) {
    const positions = {
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      topLeft: { x: rect.left, y: rect.top },
      topRight: { x: rect.right, y: rect.top },
      bottomLeft: { x: rect.left, y: rect.bottom },
      bottomRight: { x: rect.right, y: rect.bottom }
    };
    
    return positions[position] || positions.center;
  },

  _isFocusable(element) {
    const focusableTags = ['input', 'select', 'textarea', 'button', 'a'];
    return focusableTags.includes(element.tagName.toLowerCase()) ||
           element.hasAttribute('tabindex');
  }
};
```

#### 2.2 Screenshot Command

```javascript
// src/commands/screenshot.js
export const screenshotCommand = {
  name: 'screenshot',
  description: 'Takes a screenshot of the page or element',
  parameters: [
    {
      name: 'options',
      type: 'ScreenshotOptions',
      required: false,
      description: 'Screenshot options'
    }
  ],

  async execute(bridge, options = {}) {
    const opts = {
      selector: null,
      format: 'png',
      quality: 0.92,
      fullPage: false,
      ...options
    };

    let targetElement = document.body;
    
    // Find specific element if selector provided
    if (opts.selector) {
      targetElement = bridge.findElement(opts.selector);
      if (!targetElement) {
        throw new Error(`Element not found: ${JSON.stringify(opts.selector)}`);
      }
    }

    // Use html2canvas library (loaded dynamically)
    await this._loadHtml2Canvas();
    
    const canvas = await window.html2canvas(targetElement, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: window.devicePixelRatio || 1,
      width: opts.fullPage ? document.documentElement.scrollWidth : undefined,
      height: opts.fullPage ? document.documentElement.scrollHeight : undefined,
      windowWidth: opts.fullPage ? document.documentElement.scrollWidth : undefined,
      windowHeight: opts.fullPage ? document.documentElement.scrollHeight : undefined,
      x: opts.fullPage ? 0 : undefined,
      y: opts.fullPage ? 0 : undefined
    });

    // Convert to desired format
    const dataUrl = canvas.toDataURL(`image/${opts.format}`, opts.quality);
    
    return {
      success: true,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      format: opts.format
    };
  },

  async _loadHtml2Canvas() {
    if (window.html2canvas) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};
```

---

### Phase 3: Command Discovery Interface (Days 5-6)

#### 3.1 CDI Generator

```javascript
// src/discovery/CDIGenerator.js
class CDIGenerator {
  constructor(registry) {
    this.registry = registry;
  }

  generateMarkdown() {
    const commands = this.registry.getAll();
    const date = new Date().toISOString();
    
    let markdown = `# UIBridge Commands\n\n`;
    markdown += `Generated: ${date}\n\n`;
    markdown += `## Available Commands\n\n`;
    
    // Summary table
    markdown += `| Command | Description | Parameters |\n`;
    markdown += `|---------|-------------|------------|\n`;
    
    commands.forEach(cmd => {
      const params = cmd.parameters.map(p => 
        `${p.name}${p.required ? '' : '?'}`
      ).join(', ');
      markdown += `| ${cmd.name} | ${cmd.description} | ${params} |\n`;
    });
    
    // Detailed documentation
    markdown += `\n## Command Details\n\n`;
    
    commands.forEach(cmd => {
      markdown += `### ${cmd.name}\n\n`;
      markdown += `${cmd.description}\n\n`;
      
      if (cmd.parameters.length > 0) {
        markdown += `**Parameters:**\n\n`;
        cmd.parameters.forEach(param => {
          markdown += `- \`${param.name}\` (${param.type})${param.required ? ' **required**' : ''}: ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      // Add examples if available
      if (cmd.examples) {
        markdown += `**Examples:**\n\n`;
        cmd.examples.forEach(example => {
          markdown += `\`\`\`javascript\n${example}\n\`\`\`\n\n`;
        });
      }
    });
    
    return markdown;
  }

  generateJSON() {
    const commands = this.registry.getAll();
    
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      commands: commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        parameters: cmd.parameters,
        examples: cmd.examples || []
      }))
    };
  }

  async saveToFile(format = 'markdown') {
    const content = format === 'json' 
      ? JSON.stringify(this.generateJSON(), null, 2)
      : this.generateMarkdown();
    
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/markdown' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uibridge-commands.${format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

#### 3.2 Discovery Setup

```javascript
// Addition to UIBridge.js
_setupDiscovery() {
  // HTTP endpoint simulation (for development)
  if (this.config.enableHttpDiscovery) {
    // In production, this would be a real HTTP endpoint
    window.__uibridge_discovery__ = () => {
      return this.discover();
    };
  }

  // Generate CDI file on init if configured
  if (this.config.generateCDI) {
    const generator = new CDIGenerator(this.registry);
    
    // Auto-save in development
    if (this.config.debug) {
      console.log('[UIBridge] CDI Markdown:');
      console.log(generator.generateMarkdown());
    }
  }
}
```

---

### Phase 4: SvelteKit Integration & Testing (Days 7-8)

#### 4.1 SvelteKit Test App Structure

```
test/sveltekit-app/
├── src/
│   ├── app.html
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── test/
│   │       └── +page.svelte
│   └── lib/
│       └── UIBridge.svelte
├── static/
│   └── uibridge.js  # Built library
└── package.json
```

#### 4.2 SvelteKit Integration Component

```svelte
<!-- src/lib/UIBridge.svelte -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  export let config = {};
  
  onMount(() => {
    if (!browser) return;
    
    // Load UIBridge
    const script = document.createElement('script');
    script.src = '/uibridge.js';
    script.onload = () => {
      // Initialize UIBridge
      const bridge = new window.UIBridge({
        debug: true,
        generateCDI: true,
        ...config
      });
      
      bridge.init();
      
      // Expose for testing
      window.uibridge = bridge;
      
      console.log('UIBridge initialized in SvelteKit');
    };
    
    document.head.appendChild(script);
  });
</script>
```

#### 4.3 Test Page

```svelte
<!-- src/routes/test/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  
  let message = '';
  let screenshotUrl = '';
  let commandList = [];
  
  onMount(async () => {
    // Wait for UIBridge to initialize
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (window.uibridge) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    
    // Get available commands
    commandList = window.uibridge.discover();
  });
  
  async function handleTestClick() {
    message = 'Button clicked via UIBridge!';
  }
  
  async function testUIBridge() {
    try {
      // Test click command
      await window.uibridge.execute('click', '#test-button');
      
      // Test screenshot
      const result = await window.uibridge.execute('screenshot', {
        selector: '#test-area'
      });
      
      screenshotUrl = result.dataUrl;
    } catch (error) {
      console.error('UIBridge test error:', error);
      message = `Error: ${error.message}`;
    }
  }
</script>

<main>
  <h1>UIBridge Test Page</h1>
  
  <section id="test-area">
    <button 
      id="test-button" 
      data-testid="main-button"
      on:click={handleTestClick}
    >
      Click Me
    </button>
    
    <p>Message: {message}</p>
  </section>
  
  <section>
    <h2>Test Controls</h2>
    <button on:click={testUIBridge}>Run UIBridge Test</button>
    
    <h3>Available Commands:</h3>
    <ul>
      {#each commandList as cmd}
        <li>{cmd.name} - {cmd.description}</li>
      {/each}
    </ul>
  </section>
  
  {#if screenshotUrl}
    <section>
      <h3>Screenshot Result:</h3>
      <img src={screenshotUrl} alt="Screenshot" style="max-width: 100%;">
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    cursor: pointer;
  }
</style>
```

#### 4.4 Layout with UIBridge

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import UIBridge from '$lib/UIBridge.svelte';
</script>

<UIBridge config={{ debug: true }} />

<slot />
```

---

### Phase 5: Build & Bundle Configuration (Day 9)

#### 5.1 Build Script

```javascript
// build.js
import { build } from 'esbuild';
import fs from 'fs';

// Build minified version
build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/uibridge.min.js',
  format: 'iife',
  globalName: 'UIBridge',
  target: ['es2020'],
  define: {
    VERSION: '"1.0.0"'
  }
}).then(() => {
  console.log('✓ Built uibridge.min.js');
  
  // Copy to test app
  fs.copyFileSync(
    'dist/uibridge.min.js',
    'test/sveltekit-app/static/uibridge.js'
  );
  console.log('✓ Copied to SvelteKit test app');
});
```

#### 5.2 Package.json

```json
{
  "name": "uibridge",
  "version": "0.1.0",
  "description": "In-app automation framework for web applications",
  "main": "dist/uibridge.min.js",
  "scripts": {
    "build": "node build.js",
    "dev": "node build.js --watch",
    "test": "cd test/sveltekit-app && npm run dev",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "esbuild": "^0.17.0",
    "@playwright/test": "^1.30.0"
  },
  "keywords": ["automation", "testing", "ai", "web"],
  "license": "MIT"
}
```

---

### Phase 6: Testing Plan (Day 10)

#### 6.1 Manual Testing Checklist

```markdown
## UIBridge MVP Testing Checklist

### Basic Functionality
- [ ] Library loads without errors
- [ ] UIBridge initializes correctly
- [ ] Global API is accessible (window.uibridge)

### Click Command
- [ ] Clicks buttons successfully
- [ ] Click events trigger native handlers
- [ ] Works with different selector types:
  - [ ] CSS selector
  - [ ] XPath
  - [ ] Text content
  - [ ] data-testid
- [ ] Handles non-visible elements correctly
- [ ] Focus is set on focusable elements

### Screenshot Command
- [ ] Captures full viewport
- [ ] Captures specific elements
- [ ] Returns base64 data URL
- [ ] Works with different image formats

### Command Discovery
- [ ] discover() returns command list
- [ ] Generated markdown is correct
- [ ] JSON format is valid

### SvelteKit Integration
- [ ] No SSR errors
- [ ] Loads correctly in browser
- [ ] Commands work with Svelte components
- [ ] No conflicts with Svelte reactivity
```

#### 6.2 E2E Test Example

```javascript
// test/e2e/basic.spec.js
import { test, expect } from '@playwright/test';

test.describe('UIBridge MVP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/test');
    await page.waitForFunction(() => window.uibridge);
  });

  test('click command works', async ({ page }) => {
    // Execute click via UIBridge
    await page.evaluate(async () => {
      await window.uibridge.execute('click', '#test-button');
    });
    
    // Verify result
    const message = await page.textContent('p');
    expect(message).toContain('Button clicked via UIBridge!');
  });

  test('screenshot command works', async ({ page }) => {
    const result = await page.evaluate(async () => {
      return await window.uibridge.execute('screenshot');
    });
    
    expect(result.success).toBe(true);
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test('discover returns commands', async ({ page }) => {
    const commands = await page.evaluate(() => {
      return window.uibridge.discover();
    });
    
    expect(commands).toHaveLength(2);
    expect(commands.map(c => c.name)).toContain('click');
    expect(commands.map(c => c.name)).toContain('screenshot');
  });
});
```

---

## Development Timeline

| Day | Tasks | Deliverable |
|-----|-------|-------------|
| 1-2 | Core architecture | UIBridge class, Registry, SelectorEngine |
| 3-4 | Commands implementation | Click & Screenshot commands |
| 5-6 | CDI implementation | Discovery interface & file generation |
| 7-8 | SvelteKit integration | Test app with working examples |
| 9 | Build & bundle | Minified distribution file |
| 10 | Testing & refinement | Passing test suite |

---

## Next Steps After MVP

1. **Add more selector strategies** (label, aria-label, placeholder)
2. **Implement wait/waitFor commands** for async operations
3. **Add HTTP endpoint** for external agent communication
4. **Create browser extension** for command recording
5. **Add more commands** (type, navigate, scroll)
6. **Improve error messages** with suggestions
7. **Add telemetry** for command success tracking
8. **Create interactive documentation** site

---

## Quick Start Commands

```bash
# Create project
mkdir uibridge-js && cd uibridge-js
npm init -y

# Install dependencies
npm install -D esbuild @playwright/test

# Create directory structure
mkdir -p src/{core,commands,discovery} test/sveltekit-app dist

# Build library
npm run build

# Start test app
npm run test

# Run E2E tests
npm run test:e2e
```

This MVP focuses on the absolute essentials while maintaining a clean architecture that can be extended later. The implementation is pragmatic and ready to code!