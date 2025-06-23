/**
 * SelectorEngine - Handles different selector strategies for finding DOM elements
 */
export class SelectorEngine {
  constructor() {
    this.strategies = new Map();
    this._setupDefaultStrategies();
  }

  /**
   * Setup default selector strategies
   * @private
   */
  _setupDefaultStrategies() {
    // CSS Selector
    this.strategies.set('css', (selector) => {
      return document.querySelector(selector);
    });

    // CSS Selector for multiple elements
    this.strategies.set('cssAll', (selector) => {
      return Array.from(document.querySelectorAll(selector));
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

    // XPath for multiple elements
    this.strategies.set('xpathAll', (xpath) => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      const nodes = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        nodes.push(result.snapshotItem(i));
      }
      return nodes;
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

    // Partial text content
    this.strategies.set('partialText', (text) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim().includes(text)) {
          return node.parentElement;
        }
      }
      return null;
    });

    // Data-testid
    this.strategies.set('testId', (id) => {
      return document.querySelector(`[data-testid="${id}"]`);
    });

    // Data-test attribute
    this.strategies.set('dataTest', (id) => {
      return document.querySelector(`[data-test="${id}"]`);
    });

    // Label (for form inputs)
    this.strategies.set('label', (labelText) => {
      const labels = document.querySelectorAll('label');
      for (const label of labels) {
        if (label.textContent.trim() === labelText) {
          const forAttr = label.getAttribute('for');
          if (forAttr) {
            return document.getElementById(forAttr);
          }
          // Check for nested input
          const input = label.querySelector('input, select, textarea');
          if (input) {
            return input;
          }
        }
      }
      return null;
    });

    // Placeholder
    this.strategies.set('placeholder', (placeholder) => {
      return document.querySelector(`[placeholder="${placeholder}"]`);
    });

    // Aria-label
    this.strategies.set('ariaLabel', (label) => {
      return document.querySelector(`[aria-label="${label}"]`);
    });

    // Role
    this.strategies.set('role', (role) => {
      return document.querySelector(`[role="${role}"]`);
    });
  }

  /**
   * Find a single element
   * @param {string|Object} selector - Selector configuration
   * @returns {Element|null} Found element or null
   */
  find(selector) {
    // String = CSS selector
    if (typeof selector === 'string') {
      return this.strategies.get('css')(selector);
    }

    // Object selectors
    if (typeof selector === 'object' && selector !== null) {
      const strategies = [
        'xpath', 'text', 'partialText', 'testId', 'dataTest',
        'label', 'placeholder', 'ariaLabel', 'role', 'css'
      ];

      for (const strategy of strategies) {
        if (selector[strategy]) {
          const strategyFn = this.strategies.get(strategy);
          if (strategyFn) {
            const element = strategyFn(selector[strategy]);
            if (element) {
              return element;
            }
          }
        }
      }
    }

    throw new Error(`Invalid selector: ${JSON.stringify(selector)}`);
  }

  /**
   * Find multiple elements
   * @param {string|Object} selector - Selector configuration
   * @returns {Array<Element>} Found elements
   */
  findAll(selector) {
    // String = CSS selector
    if (typeof selector === 'string') {
      return this.strategies.get('cssAll')(selector);
    }

    // Object selectors
    if (typeof selector === 'object' && selector !== null) {
      if (selector.xpath) {
        return this.strategies.get('xpathAll')(selector.xpath);
      }
      if (selector.css) {
        return this.strategies.get('cssAll')(selector.css);
      }
      // For other strategies, find single and wrap in array
      const element = this.find(selector);
      return element ? [element] : [];
    }

    throw new Error(`Invalid selector: ${JSON.stringify(selector)}`);
  }

  /**
   * Register a custom selector strategy
   * @param {string} name - Strategy name
   * @param {Function} strategy - Strategy function
   */
  registerStrategy(name, strategy) {
    if (typeof strategy !== 'function') {
      throw new Error('Strategy must be a function');
    }
    this.strategies.set(name, strategy);
  }

  /**
   * Check if element is visible
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is visible
   */
  isVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      parseFloat(style.opacity) > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }

  /**
   * Get element information
   * @param {Element} element - Element to analyze
   * @returns {Object} Element information
   */
  getElementInfo(element) {
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: Array.from(element.classList),
      text: element.textContent?.trim().substring(0, 100) || '',
      attributes: this._getElementAttributes(element),
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      visible: this.isVisible(element),
      focusable: this._isFocusable(element)
    };
  }

  /**
   * Get element attributes
   * @param {Element} element - Element to analyze
   * @returns {Object} Element attributes
   * @private
   */
  _getElementAttributes(element) {
    const attrs = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }

  /**
   * Check if element is focusable
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is focusable
   * @private
   */
  _isFocusable(element) {
    const focusableTags = ['input', 'select', 'textarea', 'button', 'a'];
    return focusableTags.includes(element.tagName.toLowerCase()) ||
           element.hasAttribute('tabindex') ||
           element.hasAttribute('contenteditable');
  }
} 