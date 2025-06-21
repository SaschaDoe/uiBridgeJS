# 🤖 UIBridge Commands Reference for AI Agents

This document provides a comprehensive reference for AI agents working with UIBridge automation framework.

## Quick Command Summary

| Command | Purpose | AI Use Case |
|---------|---------|-------------|
| `click` | Interact with elements | Button clicks, navigation, form submission |
| `screenshot` | Capture visual state | Verification, debugging, documentation |
| `help` | Get command information | Discover capabilities and troubleshoot |

## Click Command - `execute('click', selector, options?)`

### Purpose
Interact with any clickable element on the page using synthetic mouse events.

### AI Usage Patterns

#### Basic Clicks
```javascript
// High reliability selectors (try these first)
await uibridge.execute('click', { testId: 'submit-button' });
await uibridge.execute('click', '#login-btn');

// Medium reliability selectors
await uibridge.execute('click', { text: 'Submit' });
await uibridge.execute('click', { ariaLabel: 'Close dialog' });

// Lower reliability selectors (use as fallback)
await uibridge.execute('click', '.submit-button');
await uibridge.execute('click', 'button[type="submit"]');
```

#### Selector Strategies for AI
```javascript
// AI Pattern: Multiple selector fallback
async function smartClick(target) {
  const strategies = [
    // Highest reliability
    { testId: target },
    { testId: `${target}-btn` },
    { testId: `${target}-button` },
    
    // High reliability
    `#${target}`,
    `#${target}-btn`,
    
    // Medium reliability
    { text: target },
    { ariaLabel: target },
    
    // Lower reliability fallbacks
    `.${target}`,
    `button:contains("${target}")`,
  ];
  
  for (const selector of strategies) {
    try {
      return await uibridge.execute('click', selector);
    } catch (error) {
      console.log(`Failed selector: ${JSON.stringify(selector)}`);
    }
  }
  throw new Error(`Could not click: ${target}`);
}
```

#### Click Options for AI
```javascript
// Force click when element might be covered
await uibridge.execute('click', '#btn', { force: true });

// Right-click for context menus
await uibridge.execute('click', '#item', { button: 'right' });

// Double-click for special actions
await uibridge.execute('click', '#file', { clickCount: 2 });

// Click with delay (useful for slow interfaces)
await uibridge.execute('click', '#btn', { delay: 500 });
```

### Return Value
```javascript
{
  success: true,
  element: {
    tag: "button",
    text: "Submit",
    id: "submit-btn",
    className: "btn btn-primary"
  },
  timestamp: "2024-01-15T10:30:00.000Z",
  position: { x: 100, y: 200 }
}
```

### AI Error Handling
```javascript
try {
  const result = await uibridge.execute('click', selector);
  console.log('✅ Click successful:', result);
} catch (error) {
  console.error('❌ Click failed:', error.message);
  
  // Get help for alternative approaches
  const help = await uibridge.execute('help', 'click');
  console.log('Alternative selectors:', help.examples);
  
  // Try alternative selector
  if (error.message.includes('not found')) {
    await uibridge.execute('click', { text: 'Submit' });
  }
}
```

## Screenshot Command - `execute('screenshot', options?)`

### Purpose
Capture visual state of the page or specific elements for verification, debugging, and documentation.

### AI Usage Patterns

#### Full Page Screenshots
```javascript
// Complete page capture for AI analysis
await uibridge.execute('screenshot', { 
  fullPage: true,
  format: 'png',
  quality: 0.9
});
```

#### Element-Specific Screenshots
```javascript
// Capture specific UI components
await uibridge.execute('screenshot', {
  selector: '#main-content',
  format: 'png'
});

// Multiple elements
await uibridge.execute('screenshot', {
  selector: '.notification, .alert, .error',
  format: 'jpeg',
  quality: 0.8
});
```

#### Auto-Save for AI Workflows
```javascript
// Automatically save with AI-friendly naming
await uibridge.execute('screenshot', {
  saveConfig: {
    autoSave: true,
    folder: 'ai-automation-logs',
    prefix: 'step-01-initial-state',
    timestamp: true,
    includeMetadata: true
  }
});
```

#### Before/After Comparison Pattern
```javascript
// AI workflow verification pattern
async function verifyAction(actionName, actionFn) {
  // Before screenshot
  const before = await uibridge.execute('screenshot', {
    saveConfig: { prefix: `before-${actionName}` }
  });
  
  // Perform action
  await actionFn();
  
  // After screenshot
  const after = await uibridge.execute('screenshot', {
    saveConfig: { prefix: `after-${actionName}` }
  });
  
  return { before, after };
}
```

### Screenshot Options

#### Format Options
- `png` - Best quality, larger files (default)
- `jpeg` - Smaller files, good for AI processing
- `webp` - Modern format, excellent compression

#### Quality Settings
- `1.0` - Maximum quality (larger files)
- `0.8` - Good balance for AI analysis
- `0.5` - Smaller files for bulk processing

#### Save Configuration
```javascript
{
  autoSave: true,           // Automatically save to disk
  folder: 'ai-screenshots', // Custom folder name
  prefix: 'test-',          // Filename prefix
  timestamp: true,          // Add timestamp to filename
  includeMetadata: true,    // Include capture metadata
  customName: 'specific-screenshot', // Override automatic naming
  persistInBrowser: false,  // Don't keep in browser memory
  serverEndpoint: '/api/screenshots' // Send to server endpoint
}
```

### Return Value
```javascript
{
  success: true,
  dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  width: 1920,
  height: 1080,
  format: "png",
  fileName: "screenshot-2024-01-15-10-30-00.png",
  filePath: "/screenshots/screenshot-2024-01-15-10-30-00.png",
  size: 245760,
  timestamp: "2024-01-15T10:30:00.000Z",
  metadata: {
    url: "https://example.com",
    title: "Example Page",
    selector: "#main-content"
  }
}
```

### AI Screenshot Analysis
```javascript
// AI pattern for screenshot verification
async function verifyScreenshot(expectedElements) {
  const screenshot = await uibridge.execute('screenshot', {
    fullPage: true,
    saveConfig: { prefix: 'verification' }
  });
  
  // AI can analyze the dataUrl or saved file
  console.log('Screenshot captured:', {
    size: `${screenshot.width}x${screenshot.height}`,
    fileSize: `${(screenshot.size / 1024).toFixed(1)}KB`,
    saved: screenshot.fileName
  });
  
  return screenshot;
}
```

## Help Command - `execute('help', commandName?)`

### Purpose
Get comprehensive information about UIBridge commands, designed specifically for AI agent consumption.

### AI Usage Patterns

#### General Help Discovery
```javascript
// Get all available information
const help = await uibridge.execute('help');

console.log('Available commands:', help.commands.map(c => c.name));
console.log('AI Best Practices:', help.aiBestPractices);
console.log('Automation Patterns:', help.automationPatterns);
console.log('Error Handling:', help.errorHandling);
```

#### Command-Specific Help
```javascript
// Get detailed help for specific command
const clickHelp = await uibridge.execute('help', 'click');
console.log('Click usage:', clickHelp.usage);
console.log('AI tips:', clickHelp.aiTips);
console.log('Examples:', clickHelp.examples);
```

#### Error Recovery with Help
```javascript
// AI error recovery pattern
async function recoverFromError(command, error) {
  console.log(`Command ${command} failed: ${error.message}`);
  
  const help = await uibridge.execute('help', command);
  console.log('Available alternatives:');
  
  help.examples.forEach((example, i) => {
    console.log(`${i + 1}. ${example}`);
  });
  
  if (help.aiTips) {
    console.log('AI Tips:', help.aiTips);
  }
}
```

### Help Return Structure
```javascript
{
  framework: "UIBridge",
  version: "1.0.0",
  description: "In-app automation framework for web applications - designed for AI agent control",
  
  // AI-specific quick start
  aiQuickStart: {
    step1: "Execute commands using: await uibridge.execute('commandName', ...args)",
    step2: "Find elements using selectors: CSS, text content, test IDs, XPath",
    step3: "Handle errors with try/catch blocks",
    step4: "Use await for all commands as they return promises"
  },
  
  // Commands with AI use cases
  commands: [
    {
      name: "click",
      description: "Interact with buttons, links, form elements, and any clickable UI component",
      parameters: 2,
      usage: "execute('click', selector, options?)",
      aiUseCase: "Interact with buttons, links, form elements, and any clickable UI component"
    }
  ],
  
  // AI-optimized patterns
  automationPatterns: {
    "Click any button": {
      pattern: "execute('click', selector)",
      examples: ["execute('click', '#submit')", "execute('click', { text: 'Submit' })"],
      aiTip: "Try multiple selector strategies if one fails"
    }
  },
  
  // Selector strategies with reliability ratings
  selectorStrategies: {
    priority: "Try strategies in this order for best results",
    strategies: {
      1: { method: "Test ID", syntax: "{ testId: 'element-id' }", reliability: "highest" },
      2: { method: "CSS ID", syntax: "'#element-id'", reliability: "high" }
    }
  },
  
  // AI best practices
  aiBestPractices: [
    "Always use await when executing commands",
    "Wrap commands in try/catch blocks for error handling",
    "Use specific selectors (ID, testId) when possible"
  ],
  
  // Error handling guide
  errorHandling: {
    "Element not found": {
      solution: "Try different selector strategies or wait for element to appear",
      code: "try { await execute('click', '#btn'); } catch(e) { await execute('click', {text: 'Submit'}); }"
    }
  },
  
  // Workflow patterns
  workflowPatterns: {
    "Form submission": [
      "1. Find and fill input fields",
      "2. Click submit button",
      "3. Take screenshot to verify"
    ]
  }
}
```

## Advanced AI Patterns

### Multi-Step Automation
```javascript
async function automateWorkflow() {
  try {
    // Step 1: Initial screenshot
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'workflow-start' }
    });
    
    // Step 2: Navigate to form
    await uibridge.execute('click', { text: 'New Item' });
    
    // Step 3: Submit form
    await uibridge.execute('click', { testId: 'submit-button' });
    
    // Step 4: Verify completion
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'workflow-complete' }
    });
    
    return { success: true };
    
  } catch (error) {
    // Error recovery
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'workflow-error' }
    });
    throw new Error(`Workflow failed: ${error.message}`);
  }
}
```

### Element Discovery for AI
```javascript
// AI pattern for discovering available interactions
async function discoverInteractions() {
  // Get all available commands
  const commands = uibridge.discover();
  
  // Get help for each command
  const capabilities = {};
  for (const cmd of commands) {
    capabilities[cmd.name] = await uibridge.execute('help', cmd.name);
  }
  
  return capabilities;
}
```

### Performance Optimization for AI
```javascript
// Batch operations for efficiency
async function batchScreenshots(elements) {
  const screenshots = [];
  
  for (const element of elements) {
    try {
      const screenshot = await uibridge.execute('screenshot', {
        selector: element,
        format: 'jpeg',
        quality: 0.7,
        saveConfig: { 
          autoSave: true,
          prefix: `element-${element.replace(/[^a-zA-Z0-9]/g, '-')}`
        }
      });
      screenshots.push(screenshot);
    } catch (error) {
      console.log(`Failed to screenshot ${element}: ${error.message}`);
    }
  }
  
  return screenshots;
}
```

## AI Integration Examples

### Playwright Integration
```javascript
// Using UIBridge with Playwright for AI automation
const page = await browser.newPage();
await page.goto('https://example.com');

// Inject UIBridge
await page.addScriptTag({
  url: 'https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js'
});

// Wait for initialization
await page.waitForFunction(() => window.uibridge?._isInitialized);

// AI can now control the page
const result = await page.evaluate(async () => {
  return await window.uibridge.execute('click', { text: 'Submit' });
});
```

### Testing Framework Integration
```javascript
// AI-powered testing with UIBridge
async function aiTest(testName, testFn) {
  console.log(`🤖 Starting AI test: ${testName}`);
  
  try {
    // Pre-test screenshot
    await uibridge.execute('screenshot', {
      saveConfig: { prefix: `test-${testName}-start` }
    });
    
    // Run test
    await testFn();
    
    // Post-test screenshot
    await uibridge.execute('screenshot', {
      saveConfig: { prefix: `test-${testName}-success` }
    });
    
    console.log(`✅ AI test passed: ${testName}`);
    
  } catch (error) {
    // Error screenshot
    await uibridge.execute('screenshot', {
      saveConfig: { prefix: `test-${testName}-error` }
    });
    
    console.log(`❌ AI test failed: ${testName} - ${error.message}`);
    throw error;
  }
}
```

## Troubleshooting for AI Agents

### Common Issues and Solutions

| Issue | Symptoms | AI Solution |
|-------|----------|-------------|
| Element not found | Click fails with "not found" | Try multiple selector strategies |
| Element not clickable | Click fails with "not clickable" | Use `force: true` option |
| Page not loaded | Actions fail randomly | Add wait delays between actions |
| Screenshot empty | Empty or black screenshots | Check element visibility and page load |

### Diagnostic Commands
```javascript
// AI diagnostic workflow
async function diagnoseIssue() {
  // Check UIBridge status
  const status = uibridge.getStatus();
  console.log('UIBridge status:', status);
  
  // Get recent history
  const history = uibridge.getHistory(5);
  console.log('Recent commands:', history);
  
  // Test basic functionality
  try {
    const help = await uibridge.execute('help');
    console.log('✅ UIBridge responding normally');
  } catch (error) {
    console.log('❌ UIBridge not responding:', error.message);
  }
  
  // Take diagnostic screenshot
  await uibridge.execute('screenshot', {
    saveConfig: { prefix: 'diagnostic' }
  });
}
```

Remember: UIBridge is designed with AI agents in mind - use the help system extensively, implement robust error handling, and always verify actions with screenshots! 