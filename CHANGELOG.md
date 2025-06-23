# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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