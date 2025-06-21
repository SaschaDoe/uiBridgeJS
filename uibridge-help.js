#!/usr/bin/env node

/**
 * UIBridge Help System for AI Agents
 * 
 * This script provides comprehensive help information designed specifically
 * for AI agents and automated systems working with UIBridge.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`🤖 ${title}`, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
}

function printSection(title, content) {
  console.log('\n' + colorize(`📋 ${title}`, 'yellow'));
  console.log(colorize('-'.repeat(40), 'dim'));
  console.log(content);
}

function printCodeBlock(title, code) {
  console.log('\n' + colorize(`💻 ${title}`, 'green'));
  console.log(colorize('-'.repeat(40), 'dim'));
  console.log(colorize(code, 'cyan'));
}

function printAIQuickStart() {
  printHeader('AI Agent Quick Start Guide');
  
  printSection('Essential Commands', 
    'UIBridge provides three core commands for AI automation:\n' +
    '• click    - Interact with any clickable element\n' +
    '• screenshot - Capture visual state for verification\n' +
    '• help     - Get command details and guidance'
  );

  printCodeBlock('Basic AI Pattern', 
    `// 1. Check UIBridge availability
if (!window.uibridge?._isInitialized) {
  throw new Error('UIBridge not available');
}

// 2. Execute commands with error handling
try {
  await uibridge.execute('click', { text: 'Submit' });
  await uibridge.execute('screenshot', { fullPage: true });
} catch (error) {
  const help = await uibridge.execute('help', 'click');
  console.log('Alternative selectors:', help.examples);
}`
  );
}

function printSelectorStrategies() {
  printHeader('AI Selector Strategies');
  
  printSection('Priority Order (Highest to Lowest Reliability)',
    '1. Test ID     - { testId: "element-id" }     (Most reliable)\n' +
    '2. CSS ID      - "#element-id"               (High reliability)\n' +
    '3. CSS Class   - ".class-name"               (Medium reliability)\n' +
    '4. Text Content- { text: "Button Text" }     (Medium reliability)\n' +
    '5. Aria Label  - { ariaLabel: "Label" }      (Medium reliability)\n' +
    '6. XPath       - { xpath: "//button[@id=\'x\']" } (Advanced use)'
  );

  printCodeBlock('Smart Selector Fallback Pattern', 
    `async function smartClick(target) {
  const selectors = [
    { testId: target },
    \`#\${target}\`,
    { text: target },
    { ariaLabel: target },
    \`.\${target}\`
  ];
  
  for (const selector of selectors) {
    try {
      return await uibridge.execute('click', selector);
    } catch (error) {
      console.log(\`Failed: \${JSON.stringify(selector)}\`);
    }
  }
  throw new Error(\`Element not found: \${target}\`);
}`
  );
}

function printCommandReference() {
  printHeader('AI Command Reference');
  
  printSection('Click Command',
    'Purpose: Interact with buttons, links, form elements\n' +
    'Syntax:  execute("click", selector, options?)\n' +
    'Returns: { success: boolean, element: {...}, timestamp: string }'
  );

  printCodeBlock('Click Examples', 
    `// Basic clicks
await uibridge.execute('click', '#submit-btn');
await uibridge.execute('click', { text: 'Login' });
await uibridge.execute('click', { testId: 'user-menu' });

// With options
await uibridge.execute('click', '#btn', { 
  force: true,           // Click even if covered
  button: 'right',       // Right-click instead
  clickCount: 2          // Double-click
});`
  );

  printSection('Screenshot Command',
    'Purpose: Capture visual state for verification and debugging\n' +
    'Syntax:  execute("screenshot", options?)\n' +
    'Returns: { success: boolean, dataUrl: string, width: number, ... }'
  );

  printCodeBlock('Screenshot Examples', 
    `// Full page screenshot
await uibridge.execute('screenshot', { fullPage: true });

// Element screenshot
await uibridge.execute('screenshot', { 
  selector: '#main-content' 
});

// Auto-save screenshot
await uibridge.execute('screenshot', {
  saveConfig: {
    autoSave: true,
    folder: 'ai-screenshots',
    prefix: 'verification',
    timestamp: true
  }
});`
  );

  printSection('Help Command',
    'Purpose: Get detailed command information and AI guidance\n' +
    'Syntax:  execute("help", commandName?)\n' +
    'Returns: Structured object with examples, patterns, and tips'
  );

  printCodeBlock('Help Examples', 
    `// General help
const help = await uibridge.execute('help');
console.log(help.aiBestPractices);

// Command-specific help
const clickHelp = await uibridge.execute('help', 'click');
console.log(clickHelp.aiTips);`
  );
}

function printWorkflowPatterns() {
  printHeader('AI Workflow Patterns');
  
  printCodeBlock('Form Submission Pattern', 
    `async function submitForm() {
  // 1. Take before screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'before-submit' }
  });
  
  // 2. Find and click submit
  await uibridge.execute('click', { text: 'Submit' });
  
  // 3. Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Verify with screenshot
  await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'after-submit' }
  });
}`
  );

  printCodeBlock('Navigation Pattern', 
    `async function navigateToPage(pageName) {
  // 1. Current state
  const beforeNav = await uibridge.execute('screenshot');
  
  // 2. Navigate
  await uibridge.execute('click', { text: pageName });
  
  // 3. Wait for page load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 4. Verify navigation
  const afterNav = await uibridge.execute('screenshot');
  
  return { before: beforeNav, after: afterNav };
}`
  );

  printCodeBlock('Error Recovery Pattern', 
    `async function robustClick(target, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uibridge.execute('click', target);
    } catch (error) {
      if (attempt === maxRetries) {
        // Final attempt - get help
        const help = await uibridge.execute('help', 'click');
        console.log('Available options:', help.examples);
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}`
  );
}

function printDebuggingGuide() {
  printHeader('AI Debugging Guide');
  
  printSection('Status Checking',
    'Always verify UIBridge availability before automation'
  );

  printCodeBlock('Diagnostic Function', 
    `async function diagnoseUIBridge() {
  // Check environment
  if (typeof window === 'undefined') {
    throw new Error('Not in browser environment');
  }
  
  // Check UIBridge availability
  if (!window.uibridge) {
    throw new Error('UIBridge not loaded');
  }
  
  // Check initialization
  if (!window.uibridge._isInitialized) {
    throw new Error('UIBridge not initialized');
  }
  
  // Test functionality
  try {
    const help = await window.uibridge.execute('help');
    console.log(\`✅ UIBridge working - \${help.commands.length} commands available\`);
    return true;
  } catch (error) {
    console.log('❌ UIBridge test failed:', error.message);
    return false;
  }
}`
  );

  printSection('Common Issues & Solutions',
    '• Element not found → Try multiple selector strategies\n' +
    '• Click failed → Use force: true option\n' +
    '• Screenshot empty → Check element visibility\n' +
    '• Command unknown → Check available commands with discover()'
  );

  printCodeBlock('Debug Information', 
    `// Get current status
const status = uibridge.getStatus();
console.log('UIBridge Status:', status);

// Get command history
const history = uibridge.getHistory(5);
history.forEach((entry, i) => {
  console.log(\`\${i + 1}. \${entry.command} - \${entry.status}\`);
});

// Get available commands
const commands = uibridge.discover();
console.log('Available commands:', commands.map(c => c.name));`
  );
}

function printBestPractices() {
  printHeader('AI Best Practices');
  
  printSection('Essential Guidelines',
    '1. Always use await when executing commands\n' +
    '2. Wrap commands in try/catch blocks\n' +
    '3. Use specific selectors (testId, ID) when possible\n' +
    '4. Take screenshots to verify actions\n' +
    '5. Check help system when commands fail\n' +
    '6. Use multiple selector strategies for reliability\n' +
    '7. Wait for dynamic content before interacting'
  );

  printCodeBlock('Production-Ready AI Pattern', 
    `class UIBridgeAI {
  constructor() {
    this.selectorCache = new Map();
    this.retryCount = 3;
    this.waitTime = 1000;
  }
  
  async execute(command, ...args) {
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const result = await uibridge.execute(command, ...args);
        console.log(\`✅ \${command} succeeded (attempt \${attempt})\`);
        return result;
      } catch (error) {
        console.log(\`❌ \${command} failed (attempt \${attempt}): \${error.message}\`);
        
        if (attempt === this.retryCount) {
          await this.handleFailure(command, args, error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.waitTime));
      }
    }
  }
  
  async handleFailure(command, args, error) {
    // Take screenshot for debugging
    await uibridge.execute('screenshot', {
      saveConfig: { prefix: 'error', timestamp: true }
    });
    
    // Log detailed error information
    const help = await uibridge.execute('help', command);
    console.log('Command help:', help);
    console.log('Failed arguments:', args);
  }
}`
  );
}

function printEnvironmentSetup() {
  printHeader('Environment Setup for AI');
  
  printSection('Browser Environment',
    'UIBridge works in any modern browser environment'
  );

  printCodeBlock('Script Tag Method', 
    `<script src="https://unpkg.com/@sashbot/uibridge/dist/uibridge.min.js"></script>
<script>
  // UIBridge automatically initializes as window.uibridge
  window.addEventListener('load', async () => {
    if (window.uibridge?._isInitialized) {
      console.log('✅ UIBridge ready for AI automation');
    }
  });
</script>`
  );

  printCodeBlock('NPM Import Method', 
    `import UIBridge from '@sashbot/uibridge';

const bridge = new UIBridge({ 
  debug: true,  // Enable logging for AI debugging
  autoInit: false  // Manual initialization control
});

await bridge.init();
console.log('✅ UIBridge initialized for AI use');`
  );

  printSection('SvelteKit/SSR Environment',
    'Special handling required for server-side rendering'
  );

  printCodeBody('SSR-Safe Import', 
    `import { onMount } from 'svelte';
import { browser } from '$app/environment';

onMount(async () => {
  if (!browser) return; // Skip on server
  
  const { default: UIBridge } = await import('@sashbot/uibridge');
  const bridge = new UIBridge({ debug: true });
  await bridge.init();
  
  // AI automation ready
});`
  );
}

function printUsageExamples() {
  printHeader('Complete AI Usage Examples');
  
  printCodeBlock('E-commerce Automation', 
    `async function purchaseProduct(productName) {
  try {
    // 1. Search for product
    await uibridge.execute('click', { placeholder: 'Search products' });
    // Note: UIBridge focuses on clicking and screenshots
    // For text input, you'd need additional tools
    
    // 2. Click on product
    await uibridge.execute('click', { text: productName });
    
    // 3. Add to cart
    await uibridge.execute('click', { text: 'Add to Cart' });
    
    // 4. Verify addition with screenshot
    const cartScreenshot = await uibridge.execute('screenshot', {
      saveConfig: { prefix: 'cart-verification' }
    });
    
    // 5. Proceed to checkout
    await uibridge.execute('click', { text: 'Checkout' });
    
    return { success: true, screenshot: cartScreenshot };
    
  } catch (error) {
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'purchase-error' }
    });
    throw new Error(\`Purchase failed: \${error.message}\`);
  }
}`
  );

  printCodeBlock('Form Testing Automation', 
    `async function testFormValidation() {
  const results = [];
  
  // Test required field validation
  try {
    await uibridge.execute('click', { text: 'Submit' });
    
    // Capture validation errors
    const errorScreenshot = await uibridge.execute('screenshot', {
      saveConfig: { prefix: 'validation-errors' }
    });
    
    results.push({
      test: 'Required field validation',
      status: 'passed',
      screenshot: errorScreenshot
    });
    
  } catch (error) {
    results.push({
      test: 'Required field validation',
      status: 'failed',
      error: error.message
    });
  }
  
  return results;
}`
  );
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    // Full help
    printAIQuickStart();
    printSelectorStrategies();
    printCommandReference();
    printWorkflowPatterns();
    printDebuggingGuide();
    printBestPractices();
    printEnvironmentSetup();
    printUsageExamples();
    
    console.log('\n' + colorize('🎯 For specific help, use:', 'bright'));
    console.log(colorize('  node uibridge-help.js quickstart', 'cyan'));
    console.log(colorize('  node uibridge-help.js commands', 'cyan'));
    console.log(colorize('  node uibridge-help.js patterns', 'cyan'));
    console.log(colorize('  node uibridge-help.js debug', 'cyan'));
    console.log(colorize('  node uibridge-help.js examples', 'cyan'));
    
  } else if (command === 'quickstart') {
    printAIQuickStart();
    printSelectorStrategies();
    
  } else if (command === 'commands') {
    printCommandReference();
    
  } else if (command === 'patterns') {
    printWorkflowPatterns();
    
  } else if (command === 'debug') {
    printDebuggingGuide();
    
  } else if (command === 'best-practices') {
    printBestPractices();
    
  } else if (command === 'setup') {
    printEnvironmentSetup();
    
  } else if (command === 'examples') {
    printUsageExamples();
    
  } else {
    console.log(colorize('❌ Unknown command:', 'red') + ` ${command}`);
    console.log(colorize('Available commands: quickstart, commands, patterns, debug, best-practices, setup, examples', 'yellow'));
  }
}

// ES module compatibility
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  printAIQuickStart,
  printSelectorStrategies,
  printCommandReference,
  printWorkflowPatterns,
  printDebuggingGuide,
  printBestPractices,
  printEnvironmentSetup,
  printUsageExamples
}; 