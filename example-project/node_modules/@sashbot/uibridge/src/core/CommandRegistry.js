/**
 * CommandRegistry - Manages command registration and retrieval
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  /**
   * Register a new command
   * @param {string} name - Command name
   * @param {Object} command - Command implementation
   */
  register(name, command) {
    if (!name || typeof name !== 'string') {
      throw new Error('Command name must be a non-empty string');
    }

    if (!command || typeof command.execute !== 'function') {
      throw new Error('Command must have an execute function');
    }

    // Validate command structure
    const requiredFields = ['name', 'description', 'parameters'];
    for (const field of requiredFields) {
      if (!command[field]) {
        throw new Error(`Command must have a ${field} property`);
      }
    }

    this.commands.set(name, {
      ...command,
      registeredAt: new Date().toISOString()
    });
  }

  /**
   * Get a command by name
   * @param {string} name - Command name
   * @returns {Object|null} Command or null if not found
   */
  get(name) {
    return this.commands.get(name) || null;
  }

  /**
   * Get all registered commands
   * @returns {Array} Array of all commands
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Check if a command exists
   * @param {string} name - Command name
   * @returns {boolean} True if command exists
   */
  has(name) {
    return this.commands.has(name);
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   * @returns {boolean} True if command was removed
   */
  unregister(name) {
    return this.commands.delete(name);
  }

  /**
   * Get command names
   * @returns {Array<string>} Array of command names
   */
  getNames() {
    return Array.from(this.commands.keys());
  }

  /**
   * Clear all commands
   */
  clear() {
    this.commands.clear();
  }

  /**
   * Get commands count
   * @returns {number} Number of registered commands
   */
  size() {
    return this.commands.size;
  }
} 