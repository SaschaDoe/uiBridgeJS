/**
 * Help Command - Get help information about UIBridge commands and usage
 * Designed to provide clear, actionable information for AI agents and developers
 */
export const helpCommand = {
  name: 'help',
  description: 'Get help information about UIBridge commands and usage patterns for AI automation',
  examples: [
    "execute('help')",
    "execute('help', 'click')",
    "execute('help', 'screenshot')",
    "execute('--help')"
  ],
  parameters: [
    {
      name: 'commandName',
      type: 'string',
      required: false,
      description: 'Specific command to get help for (optional)'
    }
  ],

  async execute(bridge, commandName = null) {
    return bridge.getHelp(commandName);
  }
}; 