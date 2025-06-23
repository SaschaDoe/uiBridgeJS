# UIBridge Usage Rules for Cursor AI

## Installation
```bash
npm install @sashbot/uibridge
```

## Start API Server (NEW - Actually Works!)
```bash
# Use the new direct execution API server (port 3002)
node node_modules/@sashbot/uibridge/api-server.cjs

# OR use npm script after installation
npm run api-server
```

## API Usage (UPDATED - Returns Real Results)
```bash
# Health check
curl http://localhost:3002/health

# Navigate to page first (required)
curl -X POST http://localhost:3002/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Click element (returns immediate result)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#button-id"}'

# Take screenshot (returns base64 image data)
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'

# Get page info
curl http://localhost:3002/page-info

# List saved screenshots
curl http://localhost:3002/screenshots
```

## Selector Priority (Most to Least Reliable)
1. `{"testId": "element-id"}` - Best
2. `"#element-id"` - CSS ID
3. `{"text": "Button Text"}` - Text content
4. `{"ariaLabel": "Label"}` - Accessibility
5. `".class-name"` - CSS class

## Complete Workflow Pattern
```bash
# 1. Start server
node node_modules/@sashbot/uibridge/api-server.cjs

# 2. Navigate to target page
curl -X POST http://localhost:3002/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-target-site.com"}'

# 3. Take initial screenshot
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'

# 4. Perform actions
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#submit-button"}'

# 5. Verify with screenshot
curl -X POST http://localhost:3002/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'
```

## Response Format
### Successful Click:
```json
{
  "success": true,
  "command": "click",
  "selector": "#button-id",
  "timestamp": "2025-06-23T04:00:00.000Z"
}
```

### Successful Screenshot:
```json
{
  "success": true,
  "command": "screenshot",
  "filename": "screenshot-2025-06-23T04-00-00-000Z.png",
  "filepath": "/path/to/screenshot.png",
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "size": 12345,
  "timestamp": "2025-06-23T04:00:00.000Z"
}
```

## Key Differences from Old Server
- ✅ **Actually executes commands** (not just queues them)
- ✅ **Returns immediate results** with real data
- ✅ **Includes screenshot base64** in response
- ✅ **Uses Playwright** for reliable automation
- ✅ **Runs on port 3002** (not 3001)
- ✅ **Requires navigation** to target page first

## Error Handling
Try multiple selectors with fallback pattern. Commands return success/failure immediately.

## Help
```bash
node node_modules/@sashbot/uibridge/uibridge-help.js --help
```

## Key Points
- Server must be running before API calls
- Use fullPage screenshots for verification
- Click commands return success/failure status
- All dependencies included in package 