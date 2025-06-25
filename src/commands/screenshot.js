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
      backgroundColor: 'auto', // 'auto' = detect from element, null = transparent, or specific color
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
      
      // Auto-detect background color if requested
      let actualBackgroundColor = opts.backgroundColor;
      if (opts.backgroundColor === 'auto') {
        actualBackgroundColor = this._detectBackgroundColor(targetElement);
        console.log('🖼️ [SCREENSHOT] Auto-detected background color:', actualBackgroundColor);
      }
      
      // Load html2canvas library if not already loaded
      console.log('🖼️ [SCREENSHOT] Loading html2canvas...');
      try {
        await this._ensureHtml2Canvas();
        console.log('🖼️ [SCREENSHOT] html2canvas loaded:', !!window.html2canvas);
      } catch (loadError) {
        console.error('🖼️ [SCREENSHOT] Failed to load html2canvas:', loadError.message);
        throw new Error(`Failed to load html2canvas library: ${loadError.message}. Please ensure you have internet connectivity or consider using a different screenshot method.`);
      }
      
      // Temporarily hide excluded elements
      const hiddenElements = this._hideElements(opts.excludeSelectors);
      
      // Prepare capture options
      const html2canvasOptions = {
        useCORS: true,
        allowTaint: false,
        backgroundColor: actualBackgroundColor,
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
      
      // Capture the screenshot with timeout
      const canvas = await Promise.race([
        window.html2canvas(targetElement, html2canvasOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Screenshot capture timed out after 30 seconds')), 30000)
        )
      ]);
      
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
   * Ensure html2canvas library is loaded with improved error handling
   * @private
   */
  async _ensureHtml2Canvas() {
    if (window.html2canvas) return;
    
    return new Promise((resolve, reject) => {
      // Multiple CDN sources for reliability (including newer versions)
      const cdnSources = [
        'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js',
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        // Fallback to latest version
        'https://unpkg.com/html2canvas@latest/dist/html2canvas.min.js'
      ];
      
      let currentIndex = 0;
      
      const tryLoadScript = () => {
        if (currentIndex >= cdnSources.length) {
          reject(new Error('Failed to load html2canvas from all CDN sources. Please check your internet connection or consider using a different screenshot method.'));
          return;
        }
        
        const script = document.createElement('script');
        script.src = cdnSources[currentIndex];
        script.crossOrigin = 'anonymous';
        script.async = true;
        
        // Add integrity checking for some CDNs
        if (script.src.includes('cdnjs.cloudflare.com')) {
          script.integrity = 'sha512-UHwkWYKZYKtkT6k7iF4FITLJAVkI/J1iOtLwSbwUXf/R+0P+WFbHFvdPRyZOmJIa3V1p8Yj8FxkgnyFb1m4qw==';
        }
        
        script.onload = () => {
          // Add a delay and validate the library is properly loaded
          setTimeout(() => {
            if (window.html2canvas && typeof window.html2canvas === 'function') {
              // Test that the library actually works
              try {
                const testDiv = document.createElement('div');
                testDiv.style.position = 'absolute';
                testDiv.style.left = '-9999px';
                testDiv.style.width = '1px';
                testDiv.style.height = '1px';
                document.body.appendChild(testDiv);
                
                // Quick functionality test
                window.html2canvas(testDiv, { width: 1, height: 1 }).then(() => {
                  document.body.removeChild(testDiv);
                  console.log('🖼️ [SCREENSHOT] html2canvas loaded and validated successfully from:', cdnSources[currentIndex]);
                  resolve();
                }).catch(() => {
                  document.body.removeChild(testDiv);
                  console.warn('🖼️ [SCREENSHOT] html2canvas loaded but failed validation test, trying next source...');
                  currentIndex++;
                  tryLoadScript();
                });
              } catch (testError) {
                console.warn('🖼️ [SCREENSHOT] html2canvas loaded but failed basic test, trying next source...');
                currentIndex++;
                tryLoadScript();
              }
            } else {
              console.warn('🖼️ [SCREENSHOT] html2canvas loaded but not functional, trying next source...');
              currentIndex++;
              tryLoadScript();
            }
          }, 200); // Increased delay for better stability
        };
        
        script.onerror = () => {
          console.warn('🖼️ [SCREENSHOT] Failed to load html2canvas from:', cdnSources[currentIndex]);
          currentIndex++;
          tryLoadScript();
        };
        
        // Add timeout for script loading
        const originalOnload = script.onload;
        const timeout = setTimeout(() => {
          console.warn('🖼️ [SCREENSHOT] Timeout loading html2canvas from:', cdnSources[currentIndex]);
          currentIndex++;
          tryLoadScript();
        }, 10000); // 10 second timeout
        
        script.onload = () => {
          clearTimeout(timeout);
          originalOnload(); // Call the original onload
        };
        
        // Check if script with same src is already being loaded
        const existingScript = document.querySelector(`script[src="${cdnSources[currentIndex]}"]`);
        if (existingScript) {
          // Wait for existing script to load
          if (window.html2canvas && typeof window.html2canvas === 'function') {
            resolve();
          } else {
            existingScript.onload = script.onload;
            existingScript.onerror = script.onerror;
          }
          return;
        }
        
        document.head.appendChild(script);
      };
      
      tryLoadScript();
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
  },

  /**
   * Detect actual background color from element and its parents
   * @param {Element} element - Target element
   * @returns {string|null} Detected background color or null for transparent
   * @private
   */
  _detectBackgroundColor(element) {
    let currentElement = element;
    
    // Walk up the DOM tree to find the first non-transparent background
    while (currentElement && currentElement !== document.documentElement) {
      const computedStyle = getComputedStyle(currentElement);
      const backgroundColor = computedStyle.backgroundColor;
      
      // Check if background color is not transparent
      if (backgroundColor && 
          backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          backgroundColor !== 'transparent') {
        console.log('🖼️ [SCREENSHOT] Found background color:', backgroundColor, 'on element:', currentElement.tagName);
        return backgroundColor;
      }
      
      currentElement = currentElement.parentElement;
    }
    
    // Check document.body and document.documentElement as fallbacks
    const bodyStyle = getComputedStyle(document.body);
    if (bodyStyle.backgroundColor && 
        bodyStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
        bodyStyle.backgroundColor !== 'transparent') {
      console.log('🖼️ [SCREENSHOT] Using body background color:', bodyStyle.backgroundColor);
      return bodyStyle.backgroundColor;
    }
    
    const htmlStyle = getComputedStyle(document.documentElement);
    if (htmlStyle.backgroundColor && 
        htmlStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
        htmlStyle.backgroundColor !== 'transparent') {
      console.log('🖼️ [SCREENSHOT] Using html background color:', htmlStyle.backgroundColor);
      return htmlStyle.backgroundColor;
    }
    
    // Default to white background instead of transparent for better visibility
    console.log('🖼️ [SCREENSHOT] No background color found, defaulting to white');
    return '#ffffff';
  }
}; 