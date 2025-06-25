# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2024-12-31

### 🚀 MAJOR: PowerShell Helpers Now Primary Method for AI Agents

**BREAKING CHANGE**: PowerShell helpers are now the PRIMARY and recommended method for AI agents to use UIBridge, with alternative methods positioned as secondary options for specific use cases.

### 🛡️ Fixed Critical JSON Corruption Issues
- **FIXED**: `SyntaxError: Expected property name or '}' in JSON at position 1` errors
- **FIXED**: String escaping issues in `Click-UIBridgeText` and `Click-UIBridgeTestId` functions  
- **FIXED**: Inconsistent JSON depth settings across different functions
- **ADDED**: `ConvertTo-SafeJson` function with built-in validation and consistent formatting
- **IMPROVED**: Proper selector objects instead of problematic string concatenation

### 🧪 Comprehensive Testing Infrastructure
- **ADDED**: `test-powershell-helpers.ps1` - 17 unit tests for JSON generation and validation
- **ADDED**: `test-powershell-helpers-live.ps1` - Integration tests with real server
- **ADDED**: Regression tests to prevent JSON corruption bugs from returning
- **COVERS**: Special characters, unicode, emoji, complex nested objects, error handling

### 📚 README Restructured as Single Source of Truth
- **RESTRUCTURED**: PowerShell helpers now prominently featured as primary method
- **CONSOLIDATED**: Merged POWERSHELL_HELPERS_README.md into main README.md
- **CLARIFIED**: Clear guidance on when to use alternative methods:
  - Live Session: Visual debugging in your own browser
  - HTTP API: Non-PowerShell environments (Python, Node.js)
  - NPM Package: JavaScript/TypeScript applications
- **IMPROVED**: AI agent best practices and comprehensive troubleshooting

### 🎯 Enhanced PowerShell Helper Functions
- **IMPROVED**: All functions now use `ConvertTo-SafeJson` for consistent, validated JSON
- **FIXED**: Special character handling (quotes, apostrophes, unicode, emoji)
- **ADDED**: Better error messages with troubleshooting guidance
- **ADDED**: Comprehensive function reference table
- **ENHANCED**: Multiple click strategies with automatic fallback

### 🔧 Technical Improvements
- **VALIDATION**: Every JSON payload is validated before sending to server
- **CONSISTENCY**: All JSON uses depth=10 and proper compression
- **ERROR HANDLING**: Clear error messages for debugging JSON issues
- **RELIABILITY**: Prevents malformed JSON from reaching the server

### 📊 What's Fixed
- ❌ **Before**: `"text=`"$Text`""` (caused JSON corruption)
- ✅ **After**: `@{ text = $Text }` (proper object structure)
- ❌ **Before**: Inconsistent JSON depth settings  
- ✅ **After**: Consistent `ConvertTo-SafeJson` function
- ❌ **Before**: No JSON validation
- ✅ **After**: Every JSON validated before sending

### 🎉 Benefits for AI Agents
1. **Reliability**: Built-in JSON validation prevents corruption errors
2. **Simplicity**: `Click-UIBridgeText -Text "Submit"` instead of complex APIs
3. **Testing**: 17 unit tests ensure consistent behavior
4. **Error Handling**: Clear troubleshooting guidance
5. **Universal**: Works with any web application
6. **Performance**: Auto-save screenshots with timestamps

### 🔬 Test Results
```
📊 Test Results Summary
Total Tests: 17
Passed: 17 ✅
Failed: 0 ✅
```

### Migration Guide
- **Automatic**: Existing PowerShell helper usage gets reliability improvements automatically
- **Testing**: Run `pwsh -ExecutionPolicy Bypass -File test-powershell-helpers.ps1` to verify
- **Documentation**: Main README.md is now the single source of truth

## [1.5.2] - 2024-12-30

### 🔧 TypeScript Definitions Fixed
- **FIXED**: Updated TypeScript definitions to include all missing configuration properties
- **ADDED**: `enableRemoteControl`, `showDebugPanel`, `debugPanelOptions` to UIBridgeConfig interface
- **ADDED**: `DebugPanelOptions` interface with proper typing for debug panel configuration
- **ADDED**: `serverUrl`, `pollInterval`, `autoStartPolling` remote control properties
- **UPDATED**: TypeScript definitions version from v1.3.2 to v1.5.2

### What Was Broken
- TypeScript users got error: `'enableRemoteControl' does not exist in type 'UIBridgeConfig'`
- Documentation showed properties that weren't in the TypeScript definitions
- SvelteKit and other TypeScript projects couldn't use the remote control features

### What's Fixed
- All configuration properties now properly typed in TypeScript
- IntelliSense and autocompletion works for all configuration options
- No more TypeScript errors when using `enableRemoteControl`, `showDebugPanel`, etc.

## [1.5.1] - 2024-12-30

### 📚 Documentation Clarification
- **CLARIFIED**: Screenshot documentation now clearly explains we capture the ACTUAL page background
- **REMOVED**: Confusing examples that suggested overriding page colors (e.g., `-BackgroundColor "yellow"`)
- **IMPROVED**: Troubleshooting section emphasizes auto-detection of real page backgrounds
- **GOAL**: Make it crystal clear that the purpose is to see YOUR page's actual background, not override it

### What Changed
- **Default behavior**: `Take-UIBridgeLiveScreenshot` captures your page's actual background color
- **Auto-detection**: The system detects computed CSS background colors from your HTML page
- **No override needed**: You should see yellow backgrounds as yellow, blue as blue, etc.
- **Fallback options**: Only use manual colors if auto-detection fails

## [1.5.0] - 2024-12-30

### 🎯 MAJOR: Fixed Screenshot Transparency Issue
- **SOLVED**: Screenshots now capture REAL background colors instead of showing transparent
- **Auto-detection**: New `backgroundColor: 'auto'` default automatically detects computed background colors
- **Smart fallback**: Walks up DOM tree to find the first non-transparent background color
- **Manual override**: PowerShell commands now support `-BackgroundColor` parameter for specific colors
- **Default safety**: Falls back to white background instead of transparent for better visibility

### 📚 Documentation Consolidated & Simplified
- **MERGED**: Combined README.md and README-live-session.md into single crystal-clear guide
- **AI-OPTIMIZED**: Super clear 6-step setup specifically designed for AI agents
- **FOCUSED**: Live session automation is now THE primary approach (not an alternative)
- **TROUBLESHOOTING**: Added comprehensive troubleshooting section including background color fixes

### 🤖 Enhanced AI Agent Support
- **PowerShell improvements**: Both helper files now support `-BackgroundColor` parameter
- **Clear examples**: Documentation shows exactly how to fix background color issues
- **Simple workflow**: Get server → Connect → Click → Screenshot with proper backgrounds
- **Visual feedback**: Emphasis on real-time visual debugging throughout

### 🔧 Technical Improvements
- **_detectBackgroundColor()**: New method that intelligently finds actual background colors
- **Better defaults**: `backgroundColor: 'auto'` instead of `null` for real color capture
- **DOM traversal**: Smart parent element checking for background color inheritance
- **Error handling**: Clear logging and fallback behavior for better debugging

### Breaking Changes
- **Default behavior**: Screenshots now default to auto-detected backgrounds instead of transparent
- **File removal**: Deleted redundant README-live-session.md (content merged into main README)

### Migration
- **Automatic**: Existing code gets better screenshots automatically
- **Compatibility**: All existing PowerShell commands continue to work
- **Enhancement**: Add `-BackgroundColor` parameter for explicit color control

## [1.4.3] - 2024-12-20

### 🌟 NEW: Live Session Automation for AI Agents
- **client-server.cjs**: Revolutionary new server mode that connects to your existing browser
- **Live Session Control**: No more hidden browsers - see automation happening in real-time
- **AI-Optimized PowerShell Helpers**: `uibridge-live-session-helpers.ps1` with ultra-simple commands
- **Visual Debug Panel Integration**: Real-time activity feed updates automatically from external commands

### 🔧 Enhanced Screenshot Functionality  
- **Fixed html2canvas Loading**: Multiple CDN fallbacks with validation testing
- **Improved Error Handling**: Better timeout handling and CORS support
- **Validation Testing**: Ensures html2canvas actually works before proceeding

### 📚 Updated Documentation
- **README-live-session.md**: Complete guide for AI agents emphasizing live session automation
- **Updated Setup Script**: Now includes both client-server and classic modes with clear recommendations
- **Version Updates**: All documentation updated to v1.4.2 with live session emphasis

### 🤖 AI Agent Benefits
- ✅ See automation happening in real-time in your existing browser
- ✅ Visual debug panel shows command results instantly  
- ✅ Simple PowerShell commands: `Click-UIBridgeLiveText -Text "Submit"`
- ✅ No more hidden browser confusion

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