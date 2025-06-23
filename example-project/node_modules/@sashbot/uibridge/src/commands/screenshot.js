/**
 * Screenshot Command - Capture page or element screenshots
 */
export const screenshotCommand = {
  name: 'screenshot',
  description: 'Takes a screenshot of the page or a specific element',
  examples: [
    "execute('screenshot')",
    "execute('screenshot', { format: 'png', quality: 0.9 })",
    "execute('screenshot', { selector: '#main-content' })",
    "execute('screenshot', { fullPage: true, saveConfig: { autoSave: true, folder: 'tests' } })"
  ],
  parameters: [
    {
      name: 'options',
      type: 'ScreenshotOptions',
      required: false,
      description: 'Screenshot options: { selector?, format?, quality?, fullPage?, saveConfig? }'
    }
  ],

  async execute(bridge, options = {}) {
    console.log('🖼️ [SCREENSHOT] Starting screenshot command execution');
    console.log('🖼️ [SCREENSHOT] Raw options received:', JSON.stringify(options, null, 2));
    console.log('🖼️ [SCREENSHOT] Bridge config:', JSON.stringify(bridge.config.defaultScreenshotConfig, null, 2));
    
    const opts = {
      selector: null,
      format: 'png',         // png, jpeg, webp
      quality: 0.92,         // 0-1 for jpeg/webp
      fullPage: false,       // capture entire page
      excludeSelectors: [],  // elements to hide during capture
      backgroundColor: null, // background color override
      scale: window.devicePixelRatio || 1,
      
      // Enhanced save configuration
      saveConfig: {
        // Use bridge default config as base
        ...bridge.config.defaultScreenshotConfig,
        // Override with user options
        ...options.saveConfig
      },
      
      ...options
    };

    console.log('🖼️ [SCREENSHOT] Final processed options:', JSON.stringify(opts, null, 2));
    
    // Log the action
    bridge._log(`Taking screenshot with options:`, opts);

    let targetElement = document.body;
    
    // Find specific element if selector provided
    if (opts.selector) {
      targetElement = bridge.findElement(opts.selector);
      if (!targetElement) {
        throw new Error(`Element not found for screenshot: ${JSON.stringify(opts.selector)}`);
      }
    }

    try {
      console.log('🖼️ [SCREENSHOT] Target element:', targetElement?.tagName, targetElement?.id, targetElement?.className);
      console.log('🖼️ [SCREENSHOT] Target element dimensions:', {
        width: targetElement?.offsetWidth,
        height: targetElement?.offsetHeight,
        scrollWidth: targetElement?.scrollWidth,
        scrollHeight: targetElement?.scrollHeight
      });
      
      // Load html2canvas library if not already loaded
      console.log('🖼️ [SCREENSHOT] Loading html2canvas...');
      await this._ensureHtml2Canvas();
      console.log('🖼️ [SCREENSHOT] html2canvas loaded:', !!window.html2canvas);
      
      // Temporarily hide excluded elements
      const hiddenElements = this._hideElements(opts.excludeSelectors);
      
      // Prepare capture options
      const html2canvasOptions = {
        useCORS: true,
        allowTaint: false,
        backgroundColor: opts.backgroundColor,
        scale: opts.scale,
        logging: true, // Force logging for debugging
        width: opts.fullPage ? document.documentElement.scrollWidth : undefined,
        height: opts.fullPage ? document.documentElement.scrollHeight : undefined,
        windowWidth: opts.fullPage ? document.documentElement.scrollWidth : undefined,
        windowHeight: opts.fullPage ? document.documentElement.scrollHeight : undefined,
        x: opts.fullPage ? 0 : undefined,
        y: opts.fullPage ? 0 : undefined,
        // Improve image quality
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true
      };

      console.log('🖼️ [SCREENSHOT] html2canvas options:', JSON.stringify(html2canvasOptions, null, 2));
      console.log('🖼️ [SCREENSHOT] Starting html2canvas capture...');
      
      // Capture the screenshot
      const canvas = await window.html2canvas(targetElement, html2canvasOptions);
      
      console.log('🖼️ [SCREENSHOT] Canvas created:', {
        width: canvas.width,
        height: canvas.height,
        hasData: canvas.getContext('2d').getImageData(0, 0, 1, 1).data.some(x => x !== 0)
      });
      
      // Restore hidden elements
      this._restoreElements(hiddenElements);

      // Convert to desired format
      const mimeType = `image/${opts.format}`;
      console.log('🖼️ [SCREENSHOT] Converting to format:', mimeType, 'quality:', opts.quality);
      const dataUrl = canvas.toDataURL(mimeType, opts.quality);
      console.log('🖼️ [SCREENSHOT] DataURL created, length:', dataUrl.length, 'starts with:', dataUrl.substring(0, 50));
      
      // Generate filename based on configuration
      const fileName = this._generateFileName(opts);
      console.log('🖼️ [SCREENSHOT] Generated filename:', fileName);
      
      // Auto-save if configured
      if (opts.saveConfig.autoSave) {
        console.log('🖼️ [SCREENSHOT] Auto-save enabled, saving...');
        await this._saveScreenshot(dataUrl, fileName, opts.saveConfig);
        console.log('🖼️ [SCREENSHOT] Save completed');
      } else {
        console.log('🖼️ [SCREENSHOT] Auto-save disabled');
      }

      const result = {
        success: true,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: opts.format,
        fileName,
        filePath: opts.saveConfig.folder ? `${opts.saveConfig.folder}/${fileName}` : fileName,
        size: Math.round(dataUrl.length * 0.75), // Approximate file size in bytes
        timestamp: new Date().toISOString(),
        saveConfig: opts.saveConfig
      };

      // Add element info if specific element was captured
      if (opts.selector) {
        result.element = bridge.selectorEngine.getElementInfo(targetElement);
        
        // Add element info to metadata if requested
        if (opts.saveConfig.includeMetadata) {
          result.metadata = {
            selector: opts.selector,
            element: result.element,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            timestamp: result.timestamp
          };
        }
      }

      bridge._log(`Screenshot captured: ${result.width}x${result.height}, ${result.size} bytes, saved as: ${result.filePath}`);
      
      return result;

    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  },

  /**
   * Generate filename based on configuration
   * @param {Object} opts - Screenshot options
   * @returns {string} Generated filename
   * @private
   */
  _generateFileName(opts) {
    const config = opts.saveConfig;
    
    // Use custom name if provided
    if (config.customName) {
      return this._ensureExtension(config.customName, opts.format);
    }
    
    let fileName = config.prefix || 'screenshot';
    
    // Add metadata to filename if requested
    if (config.includeMetadata) {
      if (opts.selector) {
        const selectorStr = typeof opts.selector === 'string' 
          ? opts.selector.replace(/[#.]/g, '').substring(0, 20)
          : 'element';
        fileName += `_${selectorStr}`;
      }
      
      if (opts.fullPage) {
        fileName += '_fullpage';
      }
      
      fileName += `_${opts.width || 'auto'}x${opts.height || 'auto'}`;
    }
    
    // Add timestamp if requested
    if (config.timestamp) {
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .substring(0, 19);
      fileName += `_${timestamp}`;
    }
    
    return this._ensureExtension(fileName, opts.format);
  },

  /**
   * Ensure filename has correct extension
   * @param {string} fileName - Base filename
   * @param {string} format - Image format
   * @returns {string} Filename with extension
   * @private
   */
  _ensureExtension(fileName, format) {
    const extension = format === 'jpeg' ? 'jpg' : format;
    if (!fileName.toLowerCase().endsWith(`.${extension}`)) {
      return `${fileName}.${extension}`;
    }
    return fileName;
  },

  /**
   * Save screenshot using available methods
   * @param {string} dataUrl - Image data URL
   * @param {string} fileName - File name
   * @param {Object} saveConfig - Save configuration
   * @private
   */
  async _saveScreenshot(dataUrl, fileName, saveConfig) {
    try {
      // Browser download method
      await this._downloadImage(dataUrl, fileName);
      
      // Additional save methods can be added here:
      // - IndexedDB storage for browser persistence
      // - Server-side upload if endpoint is configured
      // - File system API if available and user grants permission
      
      // Server-side save (if endpoint configured)
      if (saveConfig.serverEndpoint) {
        await this._saveToServer(dataUrl, fileName, saveConfig);
      }
      
      // IndexedDB save (for browser persistence)
      if (saveConfig.persistInBrowser) {
        await this._saveToIndexedDB(dataUrl, fileName, saveConfig);
      }
      
    } catch (error) {
      console.warn('Failed to save screenshot:', error);
      throw new Error(`Screenshot save failed: ${error.message}`);
    }
  },

  /**
   * Save to server endpoint (if configured)
   * @param {string} dataUrl - Image data URL
   * @param {string} fileName - File name
   * @param {Object} saveConfig - Save configuration
   * @private
   */
  async _saveToServer(dataUrl, fileName, saveConfig) {
    if (!saveConfig.serverEndpoint) return;
    
    try {
      const response = await fetch(saveConfig.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          folder: saveConfig.folder,
          dataUrl,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server save failed: ${response.status} ${response.statusText}`);
      }
      
      console.log(`Screenshot saved to server: ${fileName}`);
    } catch (error) {
      console.error('Server save error:', error);
      throw error;
    }
  },

  /**
   * Save to IndexedDB for browser persistence
   * @param {string} dataUrl - Image data URL
   * @param {string} fileName - File name
   * @param {Object} saveConfig - Save configuration
   * @private
   */
  async _saveToIndexedDB(dataUrl, fileName, saveConfig) {
    return new Promise((resolve, reject) => {
      const dbName = 'UIBridgeScreenshots';
      const storeName = 'screenshots';
      
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = () => reject(new Error('IndexedDB open failed'));
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('fileName', 'fileName', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const screenshot = {
          fileName,
          folder: saveConfig.folder,
          dataUrl,
          timestamp: new Date().toISOString(),
          size: Math.round(dataUrl.length * 0.75)
        };
        
        const addRequest = store.add(screenshot);
        
        addRequest.onsuccess = () => {
          console.log(`Screenshot saved to IndexedDB: ${fileName}`);
          resolve();
        };
        
        addRequest.onerror = () => {
          reject(new Error('IndexedDB save failed'));
        };
      };
    });
  },

  /**
   * Ensure html2canvas library is loaded
   * @private
   */
  async _ensureHtml2Canvas() {
    if (window.html2canvas) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.integrity = 'sha512-dK1lSuLiS6pQ6nrGT7iQFmQ5xOFCHBcynHgSc1h5tEGE6a86/30XnRrOXKmr5AZ+z3OqQQ4SdMzS0i1h1D5w3g==';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        if (window.html2canvas) {
          resolve();
        } else {
          reject(new Error('html2canvas failed to load properly'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load html2canvas library'));
      };
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="html2canvas"]');
      if (existingScript) {
        // Wait for existing script to load
        if (window.html2canvas) {
          resolve();
        } else {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
        }
        return;
      }
      
      document.head.appendChild(script);
    });
  },

  /**
   * Hide elements temporarily
   * @param {Array<string>} selectors - CSS selectors to hide
   * @returns {Array} Array of elements that were hidden
   * @private
   */
  _hideElements(selectors) {
    const hiddenElements = [];
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const originalDisplay = element.style.display;
          element.style.display = 'none';
          hiddenElements.push({ element, originalDisplay });
        }
      } catch (error) {
        console.warn(`Invalid selector for hiding: ${selector}`, error);
      }
    }
    
    return hiddenElements;
  },

  /**
   * Restore previously hidden elements
   * @param {Array} hiddenElements - Elements to restore
   * @private
   */
  _restoreElements(hiddenElements) {
    for (const { element, originalDisplay } of hiddenElements) {
      element.style.display = originalDisplay;
    }
  },

  /**
   * Download the image
   * @param {string} dataUrl - Image data URL
   * @param {string} fileName - File name
   * @private
   */
  _downloadImage(dataUrl, fileName) {
    try {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.warn('Failed to auto-download screenshot:', error);
    }
  }
}; 