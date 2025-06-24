# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2024-12-28

### 🎯 Architecture Simplified - ONE SERVER ONLY
- **REMOVED**: `server-example.cjs` - was confusing and redundant
- **KEPT**: Only `api-server.cjs` (port 3002) - executes commands directly with Playwright
- **UPDATED**: All documentation and examples to use port 3002
- **SIMPLIFIED**: External tools just send commands to one server and get immediate results

### Why This Change?
The old `server-example.cjs` was a queue-only server that required web apps to poll for commands. With the new auto-polling feature in v1.3.0, this created unnecessary confusion:

**Before (confusing)**:
- Option A: `api-server.cjs` → Direct execution with Playwright  
- Option B: `server-example.cjs` → Queue commands → Web app polls → Execute

**After (simple)**:
- Only: `api-server.cjs` → Direct execution with Playwright → Immediate results

### Files Changed
- ❌ Deleted `server-example.cjs`
- ✅ Updated `setup-server.js` to only copy `api-server.cjs`
- ✅ Updated default `serverUrl` from port 3001 → 3002
- ✅ Updated all documentation to use port 3002

## [1.3.1] - 2024-12-28

### 🧹 Cleanup: Removed Confusing Old Files
**SIMPLIFIED**: Deleted all outdated examples and confusing files to focus on the new v1.3.0+ approach

### Removed
- **Old demo files**: Deleted 15+ confusing demo/test files that used manual polling
- **Outdated examples**: Removed files that showed the old complex setup approach
- **Duplicate servers**: Cleaned up redundant server files
- **Legacy tests**: Removed old test files that don't reflect current best practices

### Architecture Clarification
- **Server still required**: The server is essential for browser security - external tools can't directly access web apps
- **Two server options**: 
  - `api-server.cjs` (port 3002) - Direct command execution with Playwright
  - `server-example.cjs` (port 3001) - Command queuing for web app polling
- **Auto-polling**: Web apps now poll automatically with `enableRemoteControl: true`

### Architecture Simplified
- ✅ **ONE SERVER**: Only `api-server.cjs` needed - executes commands directly with Playwright
- ❌ **Deleted**: `server-example.cjs` - was confusing and redundant
- ✅ `setup-server.js` - Easy server setup helper
- ✅ `test-screenshot-fix.html` - Current working test page
- ✅ `test-help-browser.html` - Help system test
- ✅ `example-powershell-automation.ps1` - Current PowerShell example

### Why Only One Server Now?
- **Before**: `server-example.cjs` queued commands → web app polled → executed
- **Now**: `api-server.cjs` executes commands directly → immediate results
- **Simpler**: External tools just send commands to port 3002 and get results
- **No confusion**: One server, one port, one way to do automation

## [1.3.0] - 2024-12-28

### 🚀 Major Feature: Built-in Remote Control
**BREAKING CHANGE**: This eliminates the need for manual polling implementation!

### Added
- **Auto-polling functionality**: UIBridge now handles command polling internally
- **Remote control configuration**: `enableRemoteControl`, `serverUrl`, `pollInterval` options
- **Automatic server connection**: No more manual `pollForCommands()` implementation needed
- **Built-in command execution**: Server commands are automatically executed and results sent back
- **Simplified API**: Just set `enableRemoteControl: true` and UIBridge handles everything

### Changed
- **Drastically simplified usage**: Web apps no longer need to implement polling logic
- **Better developer experience**: Reduced from ~50 lines of polling code to 1 config option
- **Automatic initialization**: Remote control starts automatically when enabled

### Fixed
- **Complexity issue**: Eliminated the need for users to manually implement server communication
- **User experience**: What was previously complex setup is now automatic

### Migration Guide
**Before (complex):**
```javascript
// Old way - required manual polling implementation
uibridge = new UIBridge();
await uibridge.init();
pollForCommands(); // Manual polling function needed
async function pollForCommands() { /* 30+ lines of code */ }
```

**After (simple):**
```javascript
// New way - just enable remote control
uibridge = new UIBridge({ 
  enableRemoteControl: true  // That's it!
});
await uibridge.init();
// Remote control now works automatically
```

## [1.2.6] - 2024-12-28

### Added
- **Server Setup Helper**: New `setup-server.js` script to copy server files to user projects
- **Binary Command**: Added `npx uibridge-setup` command for easy server setup
- **npm Script**: Added `npm run setup-server` for package users
- **Enhanced Documentation**: Updated README with prominent server setup instructions

### Changed
- Made server files much easier to discover and set up after installation
- Updated README with clear step-by-step server setup instructions
- Improved PowerShell examples to use the correct port (3002) for api-server

### Fixed
- **Discoverability Issue**: Server files now have clear setup process instead of being "hidden" in node_modules
- AI agents and users can now easily find and copy the required server files

## [1.2.5] - 2024-12-28

### Fixed
- **Screenshot functionality**: Fixed "Failed to load html2canvas library" error
  - Improved html2canvas loading with multiple CDN fallbacks for reliability
  - Removed problematic integrity hash that was causing loading failures
  - Added timeout protection (30 seconds) for screenshot capture operations
  - Enhanced error handling with more descriptive error messages
  - Fixed server integration to properly use UIBridge screenshots instead of bypassing with Playwright

### Added
- Multiple CDN sources for html2canvas loading (cdnjs, unpkg, jsdelivr)
- Better initialization checks and validation for html2canvas
- Comprehensive test files:
  - `test-screenshot-fix.html` - Interactive browser test page
  - `test-screenshot-fix.ps1` - PowerShell automation test script
- Enhanced logging and debugging information for screenshot operations

### Changed
- Improved screenshot command reliability and error reporting
- Better server-side handling of UIBridge screenshot operations
- Enhanced timeout management for screenshot capture

### Technical Details
- Fixed `_ensureHtml2Canvas` method with robust CDN fallback mechanism
- Added Promise.race timeout wrapper for screenshot operations
- Updated api-server.cjs to properly initialize and use UIBridge
- Improved error propagation and debugging capabilities

## [1.2.4] - Previous Release

### Features
- Core UIBridge functionality
- Click automation
- Screenshot capabilities
- Server integration
- PowerShell automation support 