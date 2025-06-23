/**
 * Click Command - Synthetic click interactions
 */
export const clickCommand = {
  name: 'click',
  description: 'Clicks on an element using synthetic mouse events',
  examples: [
    "execute('click', '#submit-button')",
    "execute('click', { text: 'Submit' })",
    "execute('click', { testId: 'login-btn' })",
    "execute('click', '#button', { position: 'center', clickCount: 2 })"
  ],
  parameters: [
    {
      name: 'selector',
      type: 'Selector',
      required: true,
      description: 'Element to click (string, CSS selector, or selector object)'
    },
    {
      name: 'options',
      type: 'ClickOptions',
      required: false,
      description: 'Click options: { force?, position?, button?, clickCount?, delay? }'
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
      position: 'center', // center, topLeft, topRight, bottomLeft, bottomRight
      button: 'left',     // left, right, middle
      clickCount: 1,
      delay: 0,
      scrollIntoView: true,
      ...options
    };

    // Log the action
    bridge._log(`Clicking element: ${bridge.selectorEngine.getElementInfo(element)?.tag || 'unknown'}`);

    // Scroll element into view if requested
    if (opts.scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Small delay to allow scroll to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check visibility unless force is true
    if (!opts.force) {
      const isVisible = bridge.selectorEngine.isVisible(element);
      if (!isVisible) {
        throw new Error('Element is not visible. Use { force: true } to click anyway.');
      }
    }

    // Check if element is actionable (not covered by another element)
    if (!opts.force) {
      const isActionable = this._isElementActionable(element);
      if (!isActionable) {
        throw new Error('Element is covered by another element. Use { force: true } to click anyway.');
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
      button: this._getButtonCode(opts.button),
      buttons: this._getButtonsCode(opts.button),
      detail: opts.clickCount
    };

    // Dispatch mouse events sequence
    try {
      // Hover first
      element.dispatchEvent(new MouseEvent('mouseover', eventInit));
      element.dispatchEvent(new MouseEvent('mouseenter', eventInit));

      // Mouse down
      element.dispatchEvent(new MouseEvent('mousedown', eventInit));
      
      // Optional delay between mousedown and mouseup
      if (opts.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, opts.delay));
      }
      
      // Mouse up
      element.dispatchEvent(new MouseEvent('mouseup', eventInit));
      
      // Click event(s)
      for (let i = 0; i < opts.clickCount; i++) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between multiple clicks
        }
        element.dispatchEvent(new MouseEvent('click', {
          ...eventInit,
          detail: i + 1
        }));
      }

      // Focus element if it's focusable
      if (bridge.selectorEngine._isFocusable(element)) {
        element.focus();
      }

      // Special handling for different element types
      await this._handleSpecialElements(element, opts);

    } catch (error) {
      throw new Error(`Failed to click element: ${error.message}`);
    }

    return {
      success: true,
      element: bridge.selectorEngine.getElementInfo(element),
      position: position,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Check if element is actionable (not covered by another element)
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is actionable
   * @private
   */
  _isElementActionable(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const elementAtPoint = document.elementFromPoint(centerX, centerY);
    
    // Check if the element at the point is the same element or a descendant
    return element === elementAtPoint || element.contains(elementAtPoint);
  },

  /**
   * Calculate click position based on position option
   * @param {DOMRect} rect - Element bounding rectangle
   * @param {string} position - Position option
   * @returns {Object} Coordinates {x, y}
   * @private
   */
  _calculatePosition(rect, position) {
    const positions = {
      center: { 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      },
      topLeft: { 
        x: rect.left + 1, 
        y: rect.top + 1 
      },
      topRight: { 
        x: rect.right - 1, 
        y: rect.top + 1 
      },
      bottomLeft: { 
        x: rect.left + 1, 
        y: rect.bottom - 1 
      },
      bottomRight: { 
        x: rect.right - 1, 
        y: rect.bottom - 1 
      },
      topCenter: {
        x: rect.left + rect.width / 2,
        y: rect.top + 1
      },
      bottomCenter: {
        x: rect.left + rect.width / 2,
        y: rect.bottom - 1
      },
      leftCenter: {
        x: rect.left + 1,
        y: rect.top + rect.height / 2
      },
      rightCenter: {
        x: rect.right - 1,
        y: rect.top + rect.height / 2
      }
    };
    
    return positions[position] || positions.center;
  },

  /**
   * Get mouse button code
   * @param {string} button - Button name
   * @returns {number} Button code
   * @private
   */
  _getButtonCode(button) {
    const buttons = {
      left: 0,
      middle: 1,
      right: 2
    };
    return buttons[button] || 0;
  },

  /**
   * Get mouse buttons bitmask
   * @param {string} button - Button name
   * @returns {number} Buttons bitmask
   * @private
   */
  _getButtonsCode(button) {
    const buttons = {
      left: 1,
      middle: 4,
      right: 2
    };
    return buttons[button] || 1;
  },

  /**
   * Handle special element types (forms, checkboxes, etc.)
   * @param {Element} element - Element that was clicked
   * @param {Object} opts - Click options
   * @private
   */
  async _handleSpecialElements(element, opts) {
    const tagName = element.tagName.toLowerCase();
    const inputType = element.type?.toLowerCase();

    // Handle form submission
    if (tagName === 'button' && element.type === 'submit') {
      const form = element.closest('form');
      if (form) {
        // Let the natural form submission happen
        return;
      }
    }

    // Handle checkbox/radio button state
    if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
      // The native click event should handle the state change
      return;
    }

    // Handle select elements
    if (tagName === 'select') {
      // Dispatch change event after click
      setTimeout(() => {
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, 10);
    }

    // Handle links
    if (tagName === 'a' && element.href) {
      // Let natural navigation happen, but can be intercepted if needed
      return;
    }
  }
}; 