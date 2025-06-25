#!/usr/bin/env node

/**
 * UIBridge Server Setup Helper
 * This script helps you set up UIBridge servers in your project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 UIBridge Server Setup Helper');
console.log('================================');

// Find the UIBridge package directory
function findUIBridgePackage() {
  // Try different possible locations
  const possiblePaths = [
    // If run from within the package itself
    __dirname,
    // If run from node_modules
    path.resolve(__dirname, '..', '..'),
    // If installed globally
    path.resolve(__dirname, '..'),
    // Current working directory
    process.cwd()
  ];

  for (const basePath of possiblePaths) {
    const packagePath = path.join(basePath, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.name === '@sashbot/uibridge') {
          return basePath;
        }
      } catch (e) {
        // Continue searching
      }
    }
  }
  
  // Try to find in node_modules
  const nodeModulesPath = path.resolve(process.cwd(), 'node_modules', '@sashbot', 'uibridge');
  if (fs.existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }
  
  return null;
}

function copyServerFiles() {
  const uibridgePath = findUIBridgePackage();
  
  if (!uibridgePath) {
    console.error('❌ Could not find UIBridge package. Make sure it\'s installed:');
    console.error('   npm install @sashbot/uibridge');
    process.exit(1);
  }

  console.log(`📦 Found UIBridge package at: ${uibridgePath}`);

  const serverFiles = [
    {
      source: 'client-server.cjs',
      dest: 'uibridge-client-server.cjs',
      description: '🌟 RECOMMENDED: Live session server - Control your existing browser'
    },
    {
      source: 'api-server.cjs',
      dest: 'uibridge-api-server.cjs',
      description: 'Classic server - Executes commands in hidden browser with Playwright'
    },
    {
      source: 'uibridge-live-session-helpers.ps1',
      dest: 'uibridge-live-session-helpers.ps1',
      description: '🤖 AI-friendly PowerShell helpers for live session automation'
    },
    {
      source: 'test-screenshot-fix.html',
      dest: 'uibridge-test.html',
      description: 'Test page for verifying UIBridge functionality'
    },
    {
      source: 'test-screenshot-fix.ps1',
      dest: 'uibridge-test.ps1',
      description: 'PowerShell test script for classic server'
    }
  ];

  console.log('\n📂 Copying server files to current directory:');
  
  for (const file of serverFiles) {
    const sourcePath = path.join(uibridgePath, file.source);
    const destPath = path.join(process.cwd(), file.dest);
    
    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(destPath)) {
        console.log(`⚠️  ${file.dest} already exists, skipping...`);
      } else {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${file.dest} - ${file.description}`);
      }
    } else {
      console.log(`❌ Source file not found: ${file.source}`);
    }
  }
}

function showInstructions() {
  console.log('\n🎉 Setup complete! You now have two automation modes:');
  
  console.log('\n🌟 RECOMMENDED: Live Session Mode (Perfect for AI Agents)');
  console.log('   1. Start the live session server:');
  console.log('      node uibridge-client-server.cjs');
  console.log('   2. Add to your web app HTML:');
  console.log('      <script src="http://localhost:3002/uibridge-client.js"></script>');
  console.log('   3. Open your web app in a browser (see debug panel appear!)');
  console.log('   4. Use AI-friendly PowerShell:');
  console.log('      . .\\uibridge-live-session-helpers.ps1');
  console.log('      Start-UIBridgeLiveSession');
  
  console.log('\n🔧 Alternative: Classic Hidden Browser Mode');
  console.log('   1. Start the classic server:');
  console.log('      node uibridge-api-server.cjs');
  console.log('   2. Test with PowerShell:');
  console.log('      .\\uibridge-test.ps1');
  console.log('   3. Or open test page: http://localhost:3002/uibridge-test.html');
  
  console.log('\n🤖 AI Agent Benefits with Live Session Mode:');
  console.log('   ✅ See automation happening in real-time');
  console.log('   ✅ Visual debug panel shows command results');
  console.log('   ✅ No hidden browser confusion');
  console.log('   ✅ Simple PowerShell commands');
  
  console.log('\n📝 Live Session PowerShell Example:');
  console.log(`   . .\\uibridge-live-session-helpers.ps1
   Click-UIBridgeLiveText -Text "Submit"
   Take-UIBridgeLiveScreenshot`);

  console.log('\n📚 For more help:');
  console.log('   npm run help:quickstart');
  console.log('   https://github.com/sashbot/uibridge-js');
}

// Main execution
try {
  copyServerFiles();
  showInstructions();
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 