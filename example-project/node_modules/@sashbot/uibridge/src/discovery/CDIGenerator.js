/**
 * CDIGenerator - Command Discovery Interface Generator
 * Generates documentation and discovery files for available commands
 */
export class CDIGenerator {
  constructor(registry) {
    this.registry = registry;
    this.version = '1.0.0';
  }

  /**
   * Generate markdown documentation
   * @returns {string} Markdown documentation
   */
  generateMarkdown() {
    const commands = this.registry.getAll();
    const date = new Date().toISOString();
    
    let markdown = `# UIBridge Commands Documentation\n\n`;
    markdown += `**Generated:** ${date}  \n`;
    markdown += `**Version:** ${this.version}  \n`;
    markdown += `**Total Commands:** ${commands.length}\n\n`;
    
    // Summary table
    markdown += `## Command Summary\n\n`;
    markdown += `| Command | Description | Parameters |\n`;
    markdown += `|---------|-------------|------------|\n`;
    
    commands.forEach(cmd => {
      const params = cmd.parameters.map(p => 
        `${p.name}${p.required ? '' : '?'}`
      ).join(', ');
      markdown += `| **${cmd.name}** | ${cmd.description} | ${params || 'None'} |\n`;
    });
    
    // Detailed documentation
    markdown += `\n## Command Details\n\n`;
    
    commands.forEach(cmd => {
      markdown += `### ${cmd.name}\n\n`;
      markdown += `${cmd.description}\n\n`;
      
      if (cmd.parameters.length > 0) {
        markdown += `**Parameters:**\n\n`;
        cmd.parameters.forEach(param => {
          const required = param.required ? '**required**' : '*optional*';
          markdown += `- \`${param.name}\` (${param.type}) - ${required}  \n`;
          markdown += `  ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      if (cmd.examples && cmd.examples.length > 0) {
        markdown += `**Examples:**\n\n`;
        cmd.examples.forEach(example => {
          markdown += `\`\`\`javascript\n${example}\n\`\`\`\n\n`;
        });
      }
      
      markdown += `---\n\n`;
    });
    
    return markdown;
  }

  /**
   * Generate JSON schema for commands
   * @returns {Object} JSON schema
   */
  generateJSON() {
    const commands = this.registry.getAll();
    
    return {
      version: this.version,
      generated: new Date().toISOString(),
      commands: commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        parameters: cmd.parameters,
        examples: cmd.examples || []
      }))
    };
  }

  /**
   * Save documentation to file
   * @param {string} format - Format (markdown, json)
   */
  async saveToFile(format = 'markdown') {
    const content = format === 'json' 
      ? JSON.stringify(this.generateJSON(), null, 2)
      : this.generateMarkdown();
    
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/markdown' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uibridge-commands.${format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate TypeScript definitions
   * @returns {string} TypeScript definitions
   */
  generateTypeScript() {
    const commands = this.registry.getAll();
    
    let ts = `// UIBridge Command Definitions\n`;
    ts += `// Generated: ${new Date().toISOString()}\n\n`;
    
    // Generate interface for each command's options
    commands.forEach(cmd => {
      const optionalParams = cmd.parameters.filter(p => !p.required);
      if (optionalParams.length > 0) {
        ts += `interface ${this._capitalize(cmd.name)}Options {\n`;
        optionalParams.forEach(param => {
          ts += `  ${param.name}?: ${this._mapTypeToTS(param.type)}; // ${param.description}\n`;
        });
        ts += `}\n\n`;
      }
    });
    
    // Generate main UIBridge interface
    ts += `interface UIBridge {\n`;
    commands.forEach(cmd => {
      const requiredParams = cmd.parameters.filter(p => p.required);
      const optionalParams = cmd.parameters.filter(p => !p.required);
      
      let signature = `  ${cmd.name}(`;
      
      // Add required parameters
      requiredParams.forEach((param, index) => {
        if (index > 0) signature += ', ';
        signature += `${param.name}: ${this._mapTypeToTS(param.type)}`;
      });
      
      // Add optional parameters as options object
      if (optionalParams.length > 0) {
        if (requiredParams.length > 0) signature += ', ';
        signature += `options?: ${this._capitalize(cmd.name)}Options`;
      }
      
      signature += `): Promise<any>; // ${cmd.description}\n`;
      ts += signature;
    });
    ts += `}\n\n`;
    
    // Export types
    ts += `export { UIBridge };\n`;
    commands.forEach(cmd => {
      const optionalParams = cmd.parameters.filter(p => !p.required);
      if (optionalParams.length > 0) {
        ts += `export { ${this._capitalize(cmd.name)}Options };\n`;
      }
    });
    
    return ts;
  }

  /**
   * Generate OpenAPI specification
   * @returns {Object} OpenAPI spec
   */
  generateOpenAPI() {
    const commands = this.registry.getAll();
    
    const spec = {
      openapi: "3.0.0",
      info: {
        title: "UIBridge API",
        description: "In-app automation framework for web applications",
        version: this.version,
        contact: {
          name: "UIBridge Team"
        }
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development server"
        }
      ],
      paths: {},
      components: {
        schemas: {}
      }
    };
    
    // Generate paths for each command
    commands.forEach(cmd => {
      const path = `/commands/${cmd.name}`;
      spec.paths[path] = {
        post: {
          summary: cmd.description,
          description: cmd.description,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: this._generateJSONSchema(cmd.parameters),
                  required: cmd.parameters.filter(p => p.required).map(p => p.name)
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Command executed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      result: { type: "object" },
                      timestamp: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Invalid parameters"
            },
            "500": {
              description: "Command execution failed"
            }
          }
        }
      };
    });
    
    return spec;
  }

  /**
   * Get live command statistics
   * @returns {Object} Command statistics
   */
  getStatistics() {
    const commands = this.registry.getAll();
    
    return {
      totalCommands: commands.length,
      commandNames: commands.map(c => c.name),
      totalParameters: commands.reduce((sum, cmd) => sum + cmd.parameters.length, 0),
      requiredParameters: commands.reduce((sum, cmd) => 
        sum + cmd.parameters.filter(p => p.required).length, 0),
      optionalParameters: commands.reduce((sum, cmd) => 
        sum + cmd.parameters.filter(p => !p.required).length, 0),
      commandsWithExamples: commands.filter(cmd => cmd.examples && cmd.examples.length > 0).length,
      averageParametersPerCommand: Math.round(
        commands.reduce((sum, cmd) => sum + cmd.parameters.length, 0) / commands.length * 100
      ) / 100,
      lastGenerated: new Date().toISOString()
    };
  }

  /**
   * Helper: Capitalize string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   * @private
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper: Map parameter type to TypeScript type
   * @param {string} type - Parameter type
   * @returns {string} TypeScript type
   * @private
   */
  _mapTypeToTS(type) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'object',
      'array': 'any[]',
      'Selector': 'string | object',
      'ClickOptions': 'object',
      'ScreenshotOptions': 'object'
    };
    
    return typeMap[type] || 'any';
  }

  /**
   * Helper: Generate JSON schema for parameters
   * @param {Array} parameters - Command parameters
   * @returns {Object} JSON schema properties
   * @private
   */
  _generateJSONSchema(parameters) {
    const properties = {};
    
    parameters.forEach(param => {
      properties[param.name] = {
        type: this._mapTypeToJSONSchema(param.type),
        description: param.description
      };
      
      if (param.default !== undefined) {
        properties[param.name].default = param.default;
      }
    });
    
    return properties;
  }

  /**
   * Helper: Map parameter type to JSON Schema type
   * @param {string} type - Parameter type
   * @returns {string} JSON Schema type
   * @private
   */
  _mapTypeToJSONSchema(type) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'object',
      'array': 'array',
      'Selector': 'string', // Simplified for JSON schema
      'ClickOptions': 'object',
      'ScreenshotOptions': 'object'
    };
    
    return typeMap[type] || 'string';
  }
} 