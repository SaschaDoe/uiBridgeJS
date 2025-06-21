/**
 * UIBridge - In-app automation framework for web applications
 * Version: 1.0.0
 */

// Core exports
export { UIBridge } from './core/UIBridge.js';
export { CommandRegistry } from './core/CommandRegistry.js';
export { SelectorEngine } from './core/SelectorEngine.js';

// Command exports
export { clickCommand } from './commands/click.js';
export { screenshotCommand } from './commands/screenshot.js';

// Discovery exports
export { CDIGenerator } from './discovery/CDIGenerator.js';

// Default instance for immediate use
import { UIBridge } from './core/UIBridge.js';

/**
 * Create a new UIBridge instance with default configuration
 * @param {Object} config - Configuration options
 * @returns {UIBridge} UIBridge instance
 */
export function createUIBridge(config = {}) {
  return new UIBridge({
    debug: true,
    generateCDI: true,
    enableHttpDiscovery: true,
    ...config
  });
}

/**
 * Initialize UIBridge with default settings (for quick setup)
 * @param {Object} config - Configuration options
 * @returns {Promise<UIBridge>} Initialized UIBridge instance
 */
export async function initUIBridge(config = {}) {
  const bridge = createUIBridge(config);
  await bridge.init();
  return bridge;
}

// Auto-initialize default instance if in browser environment
// Only do this if we're not in SSR and window is available
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Check if UIBridge is already initialized
  if (!window.uibridge) {
    const defaultInstance = createUIBridge({
      debug: false,
      generateCDI: false,
      autoInit: true
    });
    
    // Expose on window for global access
    window.uibridge = defaultInstance;
    
    // Also expose the class for manual instantiation
    window.UIBridge = UIBridge;
    
    // Development helpers
    if (process?.env?.NODE_ENV === 'development' || window.location?.hostname === 'localhost') {
      window.createUIBridge = createUIBridge;
      window.initUIBridge = initUIBridge;
    }
  }
}

// Version information
export const version = '1.0.0';
export const name = 'UIBridge';

// Default export for convenience
export default UIBridge; 