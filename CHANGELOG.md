# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- ✅ `