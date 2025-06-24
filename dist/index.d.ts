// Type definitions for @sashbot/uibridge v1.3.0
// Project: https://github.com/sashbot/uibridge-js
// Definitions by: sashbot

export interface SelectorOptions {
  xpath?: string;
  text?: string;
  testId?: string;
  css?: string;
}

export type Selector = string | SelectorOptions;

export interface ClickOptions {
  force?: boolean;
  position?: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
}

export interface ScreenshotSaveConfig {
  autoSave?: boolean;
  folder?: string;
  prefix?: string;
  timestamp?: boolean;
  includeMetadata?: boolean;
  customName?: string;
  persistInBrowser?: boolean;
  serverEndpoint?: string;
}

export interface ScreenshotOptions {
  selector?: Selector;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  fullPage?: boolean;
  saveConfig?: ScreenshotSaveConfig;
}

export interface ScreenshotResult {
  success: boolean;
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  fileName?: string;
  filePath?: string;
  size?: number;
  timestamp: string;
}

export interface ClickResult {
  success: boolean;
  element: {
    tag: string;
    text: string;
  };
  timestamp: string;
}

export interface CommandParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface CommandInfo {
  name: string;
  description: string;
  parameters: CommandParameter[];
  examples?: string[];
}

export interface UIBridgeConfig {
  debug?: boolean;
  allowedOrigins?: string[];
  commands?: string[];
  generateCDI?: boolean;
  enableHttpDiscovery?: boolean;
  screenshotConfig?: ScreenshotSaveConfig;
}

export declare class UIBridge {
  constructor(config?: UIBridgeConfig);
  
  init(): void;
  execute(commandName: string, ...args: any[]): Promise<any>;
  findElement(selector: Selector): HTMLElement | null;
  discover(): CommandInfo[];
  
  readonly _isInitialized: boolean;
}

export declare const clickCommand: {
  name: string;
  description: string;
  parameters: CommandParameter[];
  execute(bridge: UIBridge, selector: Selector, options?: ClickOptions): Promise<ClickResult>;
};

export declare const screenshotCommand: {
  name: string;
  description: string;
  parameters: CommandParameter[];
  execute(bridge: UIBridge, options?: ScreenshotOptions): Promise<ScreenshotResult>;
};

// Global window interface extension
declare global {
  interface Window {
    UIBridge?: typeof UIBridge;
    uibridge?: UIBridge;
    __uibridge__?: {
      execute: (commandName: string, ...args: any[]) => Promise<any>;
      discover: () => CommandInfo[];
    };
  }
}

export default UIBridge;
