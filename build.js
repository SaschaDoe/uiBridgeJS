import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

console.log('🏗️ Building @sashbot/uibridge...');
console.log(`Mode: ${isDev ? 'development' : 'production'}`);
console.log(`Watch: ${isWatch ? 'enabled' : 'disabled'}`);

const commonConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2020'],
  define: {
    VERSION: '"1.2.5"'
  },
  external: ['html2canvas'] // html2canvas will be loaded dynamically
};

async function buildAll() {
  try {
    // Ensure dist directory exists
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }

    console.log('📦 Building multiple formats for NPM...');

    // Build minified IIFE version for browser (main)
    await build({
      ...commonConfig,
      outfile: 'dist/uibridge.min.js',
      format: 'iife',
      globalName: 'UIBridge',
      minify: !isDev,
      platform: 'browser',
      banner: {
        js: `/*! @sashbot/uibridge v1.2.5 | MIT License | https://github.com/sashbot/uibridge-js */`
      }
    });
    
    const stats = fs.statSync('dist/uibridge.min.js');
    console.log(`✅ Built dist/uibridge.min.js (${Math.round(stats.size / 1024)}KB)`);
    
    // Build ESM version for modern bundlers (module)
    await build({
      ...commonConfig,
      outfile: 'dist/uibridge.esm.js',
      format: 'esm',
      minify: !isDev,
      platform: 'neutral',
      banner: {
        js: `/*! @sashbot/uibridge v1.2.5 ESM | MIT License */`
      }
    });
    
    const esmStats = fs.statSync('dist/uibridge.esm.js');
    console.log(`✅ Built dist/uibridge.esm.js (${Math.round(esmStats.size / 1024)}KB)`);
    
    // Build CommonJS version for Node.js
    await build({
      ...commonConfig,
      outfile: 'dist/uibridge.cjs.js',
      format: 'cjs',
      minify: !isDev,
      platform: 'node',
      banner: {
        js: `/*! @sashbot/uibridge v1.2.5 CJS | MIT License */`
      },
      footer: {
        js: `
// Ensure default export compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Object.assign(module.exports.default || module.exports, module.exports);
  module.exports.default = module.exports.UIBridge;
}`
      }
    });
    
    const cjsStats = fs.statSync('dist/uibridge.cjs.js');
    console.log(`✅ Built dist/uibridge.cjs.js (${Math.round(cjsStats.size / 1024)}KB)`);
    
    // Build development version (unminified)
    if (isDev) {
      await build({
        ...commonConfig,
        outfile: 'dist/uibridge.js',
        format: 'iife',
        globalName: 'UIBridge',
        minify: false,
        platform: 'browser'
      });
      
      const devStats = fs.statSync('dist/uibridge.js');
      console.log(`✅ Built dist/uibridge.js (${Math.round(devStats.size / 1024)}KB)`);
    }
    
    // Generate TypeScript definitions
    generateTypeDefinitions();
    
    // Generate package metadata
    generatePackageMetadata();
    
    // Copy to test app
    const testAppPath = 'test/sveltekit-app/static/uibridge.js';
    const sourceFile = isDev ? 'dist/uibridge.js' : 'dist/uibridge.min.js';
    
    if (fs.existsSync('test/sveltekit-app/static/')) {
      fs.copyFileSync(sourceFile, testAppPath);
      console.log('✅ Copied to SvelteKit test app');
    }
    
    console.log('🎉 Build completed successfully!');
    console.log('\n📊 Build Summary:');
    console.log(`   📦 UMD (browser): ${Math.round(fs.statSync('dist/uibridge.min.js').size / 1024)}KB`);
    console.log(`   📦 ESM (bundlers): ${Math.round(fs.statSync('dist/uibridge.esm.js').size / 1024)}KB`);
    console.log(`   📦 CJS (node): ${Math.round(fs.statSync('dist/uibridge.cjs.js').size / 1024)}KB`);
    console.log(`   📝 TypeScript definitions included`);
    console.log('\n🚀 Ready for npm publish!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function generateTypeDefinitions() {
  const dts = `// Type definitions for @sashbot/uibridge v1.2.5
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
`;

  fs.writeFileSync('dist/index.d.ts', dts);
  console.log('✅ Generated TypeScript definitions (dist/index.d.ts)');
}

function generatePackageMetadata() {
  const metadata = {
    name: '@sashbot/uibridge',
    version: '1.0.0',
    description: 'In-app automation framework for web applications - enables LLMs to control and interact with running web apps',
    built: new Date().toISOString(),
    formats: {
      umd: 'uibridge.min.js',
      esm: 'uibridge.esm.js',
      cjs: 'uibridge.cjs.js'
    },
    sizes: {
      umd: fs.statSync('dist/uibridge.min.js').size,
      esm: fs.statSync('dist/uibridge.esm.js').size,
      cjs: fs.statSync('dist/uibridge.cjs.js').size
    },
    features: [
      'Click automation',
      'Screenshot capture',
      'Command discovery',
      'LLM integration',
      'Framework agnostic'
    ]
  };
  
  fs.writeFileSync('dist/build-info.json', JSON.stringify(metadata, null, 2));
  console.log('✅ Generated build metadata (dist/build-info.json)');
}

if (isWatch) {
  console.log('👀 Watching for changes...');
  
  // Initial build
  await buildAll();
  
  // Use context API for watch mode
  const { context } = await import('esbuild');
  const ctx = await context({
    ...commonConfig,
    outfile: 'dist/uibridge.dev.js',
    format: 'iife',
    globalName: 'UIBridge',
    minify: false,
    platform: 'browser'
  });
  
  // Start watching
  await ctx.watch();
  
  console.log('✅ Watching started successfully');
  
  // Keep the process running
  process.on('SIGINT', async () => {
    await ctx.dispose();
    console.log('\n👋 Build watcher stopped');
    process.exit(0);
  });
  
} else {
  await buildAll();
} 