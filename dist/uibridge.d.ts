// UIBridge Type Definitions
declare global {
  interface Window {
    UIBridge: typeof UIBridge;
    uibridge: UIBridge;
    createUIBridge: (config?: any) => UIBridge;
    initUIBridge: (config?: any) => Promise<UIBridge>;
  }
}

export interface UIBridgeConfig {
  debug?: boolean;
  commands?: string[];
  generateCDI?: boolean;
  enableHttpDiscovery?: boolean;
  autoInit?: boolean;
  version?: string;
}

export interface CommandResult {
  success: boolean;
  [key: string]: any;
}

export class UIBridge {
  constructor(config?: UIBridgeConfig);
  init(): Promise<void>;
  execute(command: string, ...args: any[]): Promise<CommandResult>;
  findElement(selector: string | object): Element | null;
  findElements(selector: string | object): Element[];
  discover(): any[];
  getHistory(limit?: number): any[];
  clearHistory(): void;
  getStatus(): any;
  registerCommand(name: string, command: any): void;
  unregisterCommand(name: string): boolean;
}

export function createUIBridge(config?: UIBridgeConfig): UIBridge;
export function initUIBridge(config?: UIBridgeConfig): Promise<UIBridge>;

export default UIBridge;