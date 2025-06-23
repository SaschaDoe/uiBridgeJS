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
      source: 'api-server.cjs',
      dest: 'uibridge-api-server.cjs',
      description: 'Full-featured API server (recommended for automation)'
    },
    {
      source: 'server-example.cjs',
      dest: 'uibridge-queue-server.cjs',
      description: 'Queue-only server example'
    },
    {
      source: 'test-screenshot-fix.html',
      dest: 'uibridge-test.html',
      description: 'Test page for verifying UIBridge functionality'
    },
    {
      source: 'test-screenshot-fix.ps1',
      dest: 'uibridge-test.ps1',
      description: 'PowerShell test script'
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
  console.log('\n🎉 Setup complete! Here\'s how to use the servers:');
  console.log('\n📋 Quick Start:');
  console.log('   1. Start the API server:');
  console.log('      node uibridge-api-server.cjs');
  console.log('   2. The server will run on: http://localhost:3002');
  console.log('   3. Test with PowerShell:');
  console.log('      .\\uibridge-test.ps1');
  console.log('   4. Or open test page: http://localhost:3002/uibridge-test.html');
  
  console.log('\n🔧 API Endpoints:');
  console.log('   POST /navigate - Navigate to a URL');
  console.log('   POST /execute  - Execute UIBridge commands');
  console.log('   GET  /health   - Health check');
  
  console.log('\n📝 PowerShell Example:');
  console.log(`   $params = @{
       Uri = 'http://localhost:3002/execute'
       Method = 'POST'
       Headers = @{ 'Content-Type' = 'application/json' }
       Body = @{
           command = 'screenshot'
           options = @{ fullPage = $true }
       } | ConvertTo-Json -Depth 3
   }
   $response = Invoke-RestMethod @params`);

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