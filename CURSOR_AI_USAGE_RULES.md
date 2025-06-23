# UIBridge Usage Rules for Cursor AI

## Installation
```bash
npm install @sashbot/uibridge
```

## Start Server
```bash
# Dependencies included - no manual setup needed
node node_modules/@sashbot/uibridge/server-example.cjs
# Server runs on http://localhost:3001
```

## API Usage
```bash
# Health check
curl http://localhost:3001/health

# Click element
curl -X POST http://localhost:3001/execute-command \
  -H "Content-Type: application/json" \
  -d '{"command": "click", "selector": "#button-id"}'

# Take screenshot
curl -X POST http://localhost:3001/execute-command \
  -H "Content-Type: application/json" \
  -d '{"command": "screenshot", "options": {"fullPage": true}}'
```

## Selector Priority (Most to Least Reliable)
1. `{"testId": "element-id"}` - Best
2. `"#element-id"` - CSS ID
3. `{"text": "Button Text"}` - Text content
4. `{"ariaLabel": "Label"}` - Accessibility
5. `".class-name"` - CSS class

## Error Handling Pattern
Try multiple selectors in order until one succeeds. Always use try-catch for robustness.

## Help
```bash
node node_modules/@sashbot/uibridge/uibridge-help.js --help
```

## Key Points
- Server must be running before API calls
- Use fullPage screenshots for verification
- Click commands return success/failure status
- All dependencies included in package 