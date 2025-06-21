# 🤖 AI Agent Help Guide for UIBridge

## Quick Command Reference for AI Agents

### Essential Commands
```javascript
// Click any interactive element
await uibridge.execute('click', selector);

// Capture page screenshots
await uibridge.execute('screenshot', options);

// Get help and discover commands
await uibridge.execute('help', commandName);
```

## AI Automation Workflow

### 1. Initialize Connection
```javascript
// Check if UIBridge is available
if (!window.uibridge || !window.uibridge._isInitialized) {
  throw new Error('UIBridge not available. Ensure it is loaded and initialized.');
}

// Verify commands are available
const commands = window.uibridge.discover();
console.log(`Available commands: ${commands.map(c => c.name).join(', ')}`);
```

### 2. Element Interaction Strategy
```javascript
// AI Agent Pattern: Try selectors in order of reliability
async function smartClick(target) {
  const selectors = [
    // Highest reliability - Test IDs
    { testId: target },
    { testId: `${target}-btn` },
    { testId: `${target}-button` },
    
    // High reliability - IDs and specific attributes
    `#${target}`,
    `#${target}-btn`,
    `#${target}-button`,
    
    // Medium reliability - Text content
    { text: target },
    { text: `${target}` },
    { ariaLabel: target },
    
    // Lower reliability - Class names
    `.${target}`,
    `.btn-${target}`,
  ];
  
  for (const selector of selectors) {
    try {
      console.log(`Trying selector: ${JSON.stringify(selector)}`);
      const result = await uibridge.execute('click', selector);
      console.log(`✅ Success with selector: ${JSON.stringify(selector)}`);
      return result;
    } catch (error) {
      console.log(`❌ Failed with selector: ${JSON.stringify(selector)} - ${error.message}`);
    }
  }
  
  throw new Error(`Could not find clickable element for: ${target}`);
}
```

### 3. Screenshot for Verification
```javascript
// Always take screenshots to verify actions
async function verifyAction(actionName) {
  return await uibridge.execute('screenshot', {
    saveConfig: {
      autoSave: true,
      prefix: `verification-${actionName}`,
      timestamp: true,
      folder: 'ai-verification'
    }
  });
}
```

## AI Command Patterns

### Click Patterns
```javascript
// Basic click patterns for AI agents

// 1. Button clicking
await uibridge.execute('click', { text: 'Submit' });
await uibridge.execute('click', { text: 'Save' });
await uibridge.execute('click', { text: 'Continue' });

// 2. Form elements
await uibridge.execute('click', { testId: 'username-input' });
await uibridge.execute('click', { testId: 'password-input' });
await uibridge.execute('click', { testId: 'submit-button' });

// 3. Navigation
await uibridge.execute('click', { text: 'Home' });
await uibridge.execute('click', { text: 'Settings' });
await uibridge.execute('click', { ariaLabel: 'Menu' });

// 4. Complex selectors
await uibridge.execute('click', { xpath: '//button[contains(text(), "Download")]' });
```

### Screenshot Patterns
```javascript
// Screenshot patterns for AI verification

// 1. Full page capture
await uibridge.execute('screenshot', { 
  fullPage: true,
  saveConfig: { prefix: 'full-page', autoSave: true }
});

// 2. Element-specific capture
await uibridge.execute('screenshot', {
  selector: '#main-content',
  saveConfig: { prefix: 'content-area', autoSave: true }
});

// 3. Before/after comparison
await uibridge.execute('screenshot', { saveConfig: { prefix: 'before-action' } });
// ... perform action ...
await uibridge.execute('screenshot', { saveConfig: { prefix: 'after-action' } });
```

## Error Handling for AI

### Robust Error Recovery
```javascript
async function aiExecuteWithRetry(command, args, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uibridge.execute(command, ...args);
      console.log(`✅ Command succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        // Final attempt - provide helpful guidance
        const help = await uibridge.execute('help', command);
        console.log('Command help:', help);
        throw new Error(`Command failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### Smart Selector Fallbacks
```javascript
async function findElementSmartly(identifier) {
  // Common element finding strategies for AI
  const strategies = [
    // Direct strategies
    identifier,
    `#${identifier}`,
    `.${identifier}`,
    
    // Text-based strategies
    { text: identifier },
    { text: identifier.toLowerCase() },
    { text: identifier.toUpperCase() },
    
    // Attribute-based strategies
    { testId: identifier },
    { ariaLabel: identifier },
    { placeholder: identifier },
    
    // Advanced strategies
    { xpath: `//*[@id="${identifier}"]` },
    { xpath: `//*[contains(text(), "${identifier}")]` },
    { xpath: `//*[@data-testid="${identifier}"]` }
  ];
  
  for (const strategy of strategies) {
    try {
      const element = uibridge.findElement(strategy);
      if (element) {
        console.log(`✅ Found element with strategy: ${JSON.stringify(strategy)}`);
        return strategy;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  throw new Error(`Could not find element: ${identifier}`);
}
```

## AI Workflow Templates

### Form Submission Workflow
```javascript
async function submitForm(formData) {
  try {
    // 1. Take initial screenshot
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'form-initial' }
    });
    
    // 2. Fill form fields (if applicable)
    // Note: UIBridge currently focuses on clicking and screenshots
    // For form filling, you'd need additional tools
    
    // 3. Find and click submit button
    const submitResult = await smartClick('submit');
    console.log('Form submitted:', submitResult);
    
    // 4. Verify submission with screenshot
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for response
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'form-submitted' }
    });
    
    return { success: true, message: 'Form submitted successfully' };
    
  } catch (error) {
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'form-error' }
    });
    throw new Error(`Form submission failed: ${error.message}`);
  }
}
```

### Navigation Workflow
```javascript
async function navigateTo(targetPage) {
  try {
    // 1. Current page screenshot
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'nav-before' }
    });
    
    // 2. Find navigation element
    const navResult = await smartClick(targetPage);
    console.log('Navigation clicked:', navResult);
    
    // 3. Wait for page load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. Verify navigation
    await uibridge.execute('screenshot', { 
      saveConfig: { prefix: 'nav-after' }
    });
    
    return { success: true, navigatedTo: targetPage };
    
  } catch (error) {
    throw new Error(`Navigation failed: ${error.message}`);
  }
}
```

## AI Debugging Tools

### Status Check
```javascript
// Get current UIBridge status
const status = uibridge.getStatus();
console.log('UIBridge Status:', {
  initialized: status.initialized,
  version: status.version,
  commands: status.commands,
  uptime: `${(status.uptime / 1000).toFixed(2)}s`
});
```

### Command History
```javascript
// Get recent command history for debugging
const history = uibridge.getHistory(10);
history.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.command} - ${entry.status} (${entry.duration}ms)`);
  if (entry.error) {
    console.log(`   Error: ${entry.error}`);
  }
});
```

### Available Commands Discovery
```javascript
// Discover all available commands
const commands = uibridge.discover();
commands.forEach(cmd => {
  console.log(`Command: ${cmd.name}`);
  console.log(`  Description: ${cmd.description}`);
  console.log(`  Parameters: ${cmd.parameters.length}`);
  console.log(`  Examples: ${cmd.examples.slice(0, 2).join(', ')}`);
});
```

## Performance Tips for AI

### Batch Operations
```javascript
// Perform multiple screenshots efficiently
async function captureWorkflow() {
  const screenshots = [];
  
  // Initial state
  screenshots.push(await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'step-01' }
  }));
  
  // After each major action
  await smartClick('next');
  screenshots.push(await uibridge.execute('screenshot', { 
    saveConfig: { prefix: 'step-02' }
  }));
  
  return screenshots;
}
```

### Efficient Element Finding
```javascript
// Cache successful selectors for reuse
const selectorCache = new Map();

async function cachedClick(target) {
  // Check cache first
  if (selectorCache.has(target)) {
    try {
      return await uibridge.execute('click', selectorCache.get(target));
    } catch (error) {
      // Selector might be stale, remove from cache
      selectorCache.delete(target);
    }
  }
  
  // Find new selector
  const selector = await findElementSmartly(target);
  selectorCache.set(target, selector);
  return await uibridge.execute('click', selector);
}
```

## Emergency Procedures

### When UIBridge Fails
```javascript
// Diagnostic function for AI agents
async function diagnoseUIBridge() {
  console.log('🔍 UIBridge Diagnosis:');
  
  // Check availability
  if (typeof window === 'undefined') {
    console.log('❌ No window object - not in browser environment');
    return false;
  }
  
  if (!window.uibridge) {
    console.log('❌ UIBridge not found on window object');
    console.log('💡 Try: Check if UIBridge script is loaded');
    return false;
  }
  
  if (!window.uibridge._isInitialized) {
    console.log('❌ UIBridge not initialized');
    console.log('💡 Try: Wait for initialization or call init()');
    return false;
  }
  
  // Test basic functionality
  try {
    const help = await window.uibridge.execute('help');
    console.log('✅ UIBridge is working - commands available:', help.commands.length);
    return true;
  } catch (error) {
    console.log('❌ UIBridge execute failed:', error.message);
    return false;
  }
}
```

Remember: UIBridge is designed to be AI-friendly with clear error messages, consistent patterns, and helpful debugging information. Always check the help system first when encountering issues! 