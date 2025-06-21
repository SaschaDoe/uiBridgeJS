# 🚀 Publishing @sashbot/uibridge to NPM

## ✅ Pre-Publishing Checklist

All items below have been completed and verified:

- ✅ **Package.json configured** with correct name, version, and metadata
- ✅ **Build system working** - creates UMD, ESM, and CJS builds
- ✅ **TypeScript definitions** generated and tested
- ✅ **License file** created (MIT)
- ✅ **README.md** updated with NPM-specific content
- ✅ **NPM ignore file** configured to exclude unnecessary files
- ✅ **Package structure** verified with `npm pack --dry-run`
- ✅ **Build artifacts** created in `dist/` directory
- ✅ **Source code** included for transparency

## 📦 Package Contents

The package includes:
- **dist/uibridge.min.js** - UMD build for browsers (25KB)
- **dist/uibridge.esm.js** - ESM build for modern bundlers (24KB)  
- **dist/uibridge.cjs.js** - CommonJS build for Node.js (25KB)
- **dist/index.d.ts** - TypeScript definitions
- **src/** - Complete source code
- **README.md** - Comprehensive documentation
- **LICENSE** - MIT license
- **UIBRIDGE_COMMANDS.md** - LLM integration documentation

## 🔑 Publishing Steps

### 1. Login to NPM (if not already logged in)
```bash
npm login
```

### 2. Verify Package Contents
```bash
npm pack --dry-run
```

### 3. Test Package Locally (Optional)
```bash
# Create a test package
npm pack

# Install locally in another project
npm install ./sashbot-uibridge-1.0.0.tgz
```

### 4. Publish to NPM
```bash
npm publish
```

That's it! The package will be published to NPM and available for installation.

## 📊 Package Stats

- **Name**: @sashbot/uibridge
- **Version**: 1.0.0
- **Package Size**: ~138KB (compressed)
- **Unpacked Size**: ~564KB
- **Total Files**: 23
- **Build Formats**: UMD, ESM, CJS
- **TypeScript**: Full definitions included

## 🔧 Post-Publishing

After publishing, users can install with:

```bash
npm install @sashbot/uibridge
```

And use in their projects:

```javascript
// ES Modules
import UIBridge from '@sashbot/uibridge';

// CommonJS
const UIBridge = require('@sashbot/uibridge');

// Browser UMD
<script src="node_modules/@sashbot/uibridge/dist/uibridge.min.js"></script>
```

## 🔄 Future Updates

To publish updates:

1. Update version in `package.json`
2. Run `npm run build` 
3. Run `npm publish`

Use semantic versioning:
- **Patch** (1.0.1) - Bug fixes
- **Minor** (1.1.0) - New features
- **Major** (2.0.0) - Breaking changes

## 📈 Package Features

✅ **Framework Agnostic** - Works with React, Vue, Angular, Svelte, vanilla JS
✅ **LLM Ready** - HTTP API for AI agent integration  
✅ **TypeScript Support** - Full type definitions
✅ **Multiple Builds** - UMD, ESM, CJS for maximum compatibility
✅ **Comprehensive Documentation** - README, API docs, examples
✅ **Zero Dependencies** - No external runtime dependencies
✅ **Small Size** - ~25KB minified
✅ **MIT Licensed** - Free for commercial use

The package is ready for immediate use by the community! 🎉 

# 📦 UIBridge Publishing & Usage Guide

## Publishing to NPM

### Initial Setup (One-time)

1. **Create NPM Account** (if you don't have one):
   ```bash
   npm adduser
   # Follow prompts to create account
   ```

2. **Login to NPM**:
   ```bash
   npm login
   # Enter your NPM credentials
   ```

3. **Verify Login**:
   ```bash
   npm whoami
   # Should show your NPM username
   ```

### Publishing Workflow

#### 1. Pre-publish Checklist
```bash
# 1. Ensure all changes are committed
git status
git add .
git commit -m "feat: describe your changes"

# 2. Run tests (if any)
npm test

# 3. Build the package
npm run build

# 4. Verify build output
ls -la dist/
# Should see: uibridge.min.js, uibridge.esm.js, uibridge.cjs.js, index.d.ts
```

#### 2. Version Management
```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.1 → 1.1.0)
npm version minor

# For breaking changes (1.1.0 → 2.0.0)
npm version major

# Or set specific version
npm version 1.2.3
```

#### 3. Publish to NPM
```bash
# Publish to NPM
npm publish

# Or publish with tag (for beta versions)
npm publish --tag beta
```

#### 4. Verify Publication
```bash
# Check if package is available
npm view @sashbot/uibridge

# Check latest version
npm view @sashbot/uibridge version
```

### Update Existing Package

```bash
# 1. Make your changes
# 2. Update version
npm version patch  # or minor/major
# 3. Build
npm run build
# 4. Publish
npm publish
```

### NPM Scripts for Publishing
Add these to your `package.json`:

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test",
    "postpublish": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish", 
    "release:major": "npm version major && npm publish"
  }
}
```

---

## Using UIBridge in Other Projects

### Method 1: NPM Installation (Recommended)

#### Installation
```bash
# Install UIBridge
npm install @sashbot/uibridge

# Or with yarn
yarn add @sashbot/uibridge
```

#### Usage in Different Environments

##### 1. **React/Vue/Vanilla JS Projects**
```javascript
import UIBridge from '@sashbot/uibridge';

// Initialize UIBridge
const bridge = new UIBridge({ 
  debug: true,
  autoInit: false 
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await bridge.init();
  console.log('✅ UIBridge ready for automation');
  
  // Example usage
  await bridge.execute('click', '#my-button');
  await bridge.execute('screenshot', { fullPage: true });
});
```

##### 2. **SvelteKit Projects**
```javascript
// src/routes/+page.svelte
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let uibridge = null;
  
  onMount(async () => {
    if (!browser) return; // Skip on server
    
    const { default: UIBridge } = await import('@sashbot/uibridge');
    uibridge = new UIBridge({ debug: true });
    await uibridge.init();
    
    console.log('✅ UIBridge ready in SvelteKit');
  });
  
  async function handleClick() {
    if (uibridge) {
      await uibridge.execute('click', { text: 'Submit' });
    }
  }
</script>

<button on:click={handleClick}>Test UIBridge</button>
```

##### 3. **Next.js Projects**
```javascript
// pages/index.js or app/page.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [uibridge, setUibridge] = useState(null);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      import('@sashbot/uibridge').then(async ({ default: UIBridge }) => {
        const bridge = new UIBridge({ debug: true });
        await bridge.init();
        setUibridge(bridge);
        console.log('✅ UIBridge ready in Next.js');
      });
    }
  }, []);
  
  const handleTest = async () => {
    if (uibridge) {
      await uibridge.execute('screenshot', { fullPage: true });
    }
  };
  
  return (
    <div>
      <button onClick={handleTest}>Take Screenshot</button>
    </div>
  );
}
```

##### 4. **Node.js/Playwright Integration**
```javascript
// test-automation.js
import { chromium } from 'playwright';

async function automateWithUIBridge() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to your app
  await page.goto('http://localhost:3000');
  
  // Inject UIBridge
  await page.addScriptTag({
    url: 'https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js'
  });
  
  // Wait for UIBridge to initialize
  await page.waitForFunction(() => window.uibridge?._isInitialized);
  
  // Use UIBridge for automation
  const result = await page.evaluate(async () => {
    // Click button
    await window.uibridge.execute('click', { text: 'Submit' });
    
    // Take screenshot
    const screenshot = await window.uibridge.execute('screenshot', {
      saveConfig: { autoSave: true, prefix: 'automation' }
    });
    
    return { success: true, screenshot: screenshot.fileName };
  });
  
  console.log('Automation result:', result);
  await browser.close();
}

automateWithUIBridge();
```

### Method 2: CDN Usage (No Installation)

#### Basic HTML
```html
<!DOCTYPE html>
<html>
<head>
  <title>UIBridge Test</title>
</head>
<body>
  <button id="test-btn">Click Me</button>
  
  <!-- Load UIBridge from CDN -->
  <script src="https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js"></script>
  
  <script>
    // UIBridge automatically initializes as window.uibridge
    window.addEventListener('load', async () => {
      if (window.uibridge?._isInitialized) {
        console.log('✅ UIBridge loaded from CDN');
        
        // Test automation
        setTimeout(async () => {
          await window.uibridge.execute('click', '#test-btn');
          await window.uibridge.execute('screenshot', { fullPage: true });
        }, 1000);
      }
    });
  </script>
</body>
</html>
```

#### With Module Loading
```html
<script type="module">
  // Load as ES module
  import UIBridge from 'https://unpkg.com/@sashbot/uibridge/dist/uibridge.esm.js';
  
  const bridge = new UIBridge({ debug: true });
  await bridge.init();
  
  // Ready for automation
  await bridge.execute('help'); // Get available commands
</script>
```

---

## AI Agent Integration Examples

### 1. **Autonomous Testing Bot**
```javascript
// ai-testing-bot.js
import UIBridge from '@sashbot/uibridge';

class AITestingBot {
  constructor() {
    this.bridge = new UIBridge({ 
      debug: true,
      defaultScreenshotConfig: {
        autoSave: true,
        folder: 'ai-test-results',
        timestamp: true
      }
    });
  }
  
  async init() {
    await this.bridge.init();
    console.log('🤖 AI Testing Bot initialized');
  }
  
  async runTestSuite(testCases) {
    const results = [];
    
    for (const testCase of testCases) {
      try {
        console.log(`🧪 Running test: ${testCase.name}`);
        
        // Before screenshot
        await this.bridge.execute('screenshot', {
          saveConfig: { prefix: `test-${testCase.name}-before` }
        });
        
        // Execute test steps
        for (const step of testCase.steps) {
          await this.bridge.execute(step.command, ...step.args);
        }
        
        // After screenshot
        await this.bridge.execute('screenshot', {
          saveConfig: { prefix: `test-${testCase.name}-after` }
        });
        
        results.push({ name: testCase.name, status: 'passed' });
        console.log(`✅ Test passed: ${testCase.name}`);
        
      } catch (error) {
        // Error screenshot
        await this.bridge.execute('screenshot', {
          saveConfig: { prefix: `test-${testCase.name}-error` }
        });
        
        results.push({ 
          name: testCase.name, 
          status: 'failed', 
          error: error.message 
        });
        console.log(`❌ Test failed: ${testCase.name} - ${error.message}`);
      }
    }
    
    return results;
  }
}

// Usage
const bot = new AITestingBot();
await bot.init();

const testCases = [
  {
    name: 'login-flow',
    steps: [
      { command: 'click', args: [{ text: 'Login' }] },
      { command: 'click', args: [{ testId: 'submit-btn' }] }
    ]
  }
];

const results = await bot.runTestSuite(testCases);
console.log('Test Results:', results);
```

### 2. **LLM-Controlled Browser**
```javascript
// llm-browser-controller.js
import UIBridge from '@sashbot/uibridge';

class LLMBrowserController {
  constructor() {
    this.bridge = new UIBridge({ debug: true });
    this.actionHistory = [];
  }
  
  async init() {
    await this.bridge.init();
    
    // Get available commands for LLM context
    const help = await this.bridge.execute('help');
    this.capabilities = help;
    
    console.log('🧠 LLM Browser Controller ready');
    return this.capabilities;
  }
  
  async executeInstruction(instruction) {
    console.log(`🎯 Executing: ${instruction}`);
    
    try {
      // Parse instruction into UIBridge command
      const command = this.parseInstruction(instruction);
      
      // Execute command
      const result = await this.bridge.execute(command.name, ...command.args);
      
      // Take verification screenshot
      const screenshot = await this.bridge.execute('screenshot', {
        saveConfig: { 
          prefix: `action-${this.actionHistory.length + 1}`,
          timestamp: true 
        }
      });
      
      // Record action
      this.actionHistory.push({
        instruction,
        command,
        result,
        screenshot: screenshot.fileName,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        result,
        screenshot: screenshot.fileName,
        message: `Successfully executed: ${instruction}`
      };
      
    } catch (error) {
      console.error(`❌ Failed to execute: ${instruction}`, error);
      
      // Error screenshot
      const errorScreenshot = await this.bridge.execute('screenshot', {
        saveConfig: { prefix: 'error', timestamp: true }
      });
      
      return {
        success: false,
        error: error.message,
        screenshot: errorScreenshot.fileName,
        suggestion: await this.getSuggestion(instruction, error)
      };
    }
  }
  
  parseInstruction(instruction) {
    // Simple instruction parsing (extend with NLP)
    const lower = instruction.toLowerCase();
    
    if (lower.includes('click')) {
      // Extract target from instruction
      const target = this.extractTarget(instruction);
      return { name: 'click', args: [target] };
    }
    
    if (lower.includes('screenshot') || lower.includes('capture')) {
      return { name: 'screenshot', args: [{ fullPage: true }] };
    }
    
    if (lower.includes('help')) {
      return { name: 'help', args: [] };
    }
    
    throw new Error(`Cannot parse instruction: ${instruction}`);
  }
  
  extractTarget(instruction) {
    // Extract button/element references
    if (instruction.includes('"') || instruction.includes("'")) {
      const match = instruction.match(/["']([^"']+)["']/);
      if (match) return { text: match[1] };
    }
    
    if (instruction.includes('#')) {
      const match = instruction.match(/#[\w-]+/);
      if (match) return match[0];
    }
    
    // Default fallback
    return { text: 'Submit' };
  }
  
  async getSuggestion(instruction, error) {
    const help = await this.bridge.execute('help');
    return `Try these alternatives: ${help.aiBestPractices.slice(0, 2).join(', ')}`;
  }
  
  getHistory() {
    return this.actionHistory;
  }
}

// Usage with OpenAI/Claude/etc
const controller = new LLMBrowserController();
const capabilities = await controller.init();

// LLM can now control the browser
const result1 = await controller.executeInstruction('Click the "Login" button');
const result2 = await controller.executeInstruction('Take a screenshot of the page');

console.log('Action history:', controller.getHistory());
```

---

## Development Workflow

### Local Development with Other Projects

1. **Link for Local Development**:
   ```bash
   # In UIBridge directory
   npm link
   
   # In your other project
   npm link @sashbot/uibridge
   ```

2. **Test Changes Locally**:
   ```bash
   # In UIBridge directory - rebuild after changes
   npm run build
   
   # Changes are immediately available in linked projects
   ```

3. **Unlink When Done**:
   ```bash
   # In your other project
   npm unlink @sashbot/uibridge
   npm install @sashbot/uibridge  # Install from NPM
   ```

### Version Management Strategy

- **Patch (1.0.x)**: Bug fixes, documentation updates
- **Minor (1.x.0)**: New commands, new features, backward compatible
- **Major (x.0.0)**: Breaking changes, API changes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped appropriately
- [ ] Build successful
- [ ] Published to NPM
- [ ] Git tags pushed
- [ ] Release notes written

---

## Troubleshooting

### Common Publishing Issues

1. **"Package already exists"**:
   ```bash
   # Check current version
   npm view @sashbot/uibridge version
   # Bump version
   npm version patch
   ```

2. **"Not logged in"**:
   ```bash
   npm login
   ```

3. **"Build fails"**:
   ```bash
   npm run build
   # Fix any build errors before publishing
   ```

### Common Usage Issues

1. **SSR Errors**: Use dynamic imports in SSR environments
2. **Module not found**: Ensure correct import syntax for your environment
3. **Commands not working**: Check if UIBridge is properly initialized

---

This guide covers everything you need to publish UIBridge to NPM and use it in other projects. The package is designed to work seamlessly across different JavaScript environments and frameworks! 