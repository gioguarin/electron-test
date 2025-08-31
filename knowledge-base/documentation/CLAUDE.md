# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Electron desktop application project called "Network Tools Hub" that provides various network administration and diagnostic tools. The application is built with Electron Forge for packaging and uses a modular architecture with clear separation of concerns.

## Current Implementation Status
- **Subnet Calculator**: Fully functional with IP/CIDR input, binary representation, copy-to-clipboard, and persistent history
- **Landing Page**: Tool selection hub with search functionality
- **Navigation System**: IPC-based navigation between tools
- **Logging**: Professional logging with electron-log (main process only)
- **Icons**: Custom network-themed application icons

## Development Commands

### Running the Application
```bash
npm start                # Start the Electron app using Electron Forge
```

### Building and Packaging
```bash
npm run package          # Package the app without creating distributable
npm run make            # Create platform-specific distributables
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix linting issues
```

## Architecture

### Directory Structure
```
src/
├── main/
│   ├── main.js              # Main process entry point
│   ├── ipc-handlers.js      # IPC communication handlers
│   └── menu.js              # Application menu configuration
├── renderer/
│   ├── landing.html         # Landing page
│   ├── landing-renderer.js  # Landing page logic
│   ├── styles.css           # Common styles
│   └── pages/
│       ├── subnet-calculator.html
│       └── subnet-renderer.js
├── preload/
│   └── preload.js           # Preload script with contextBridge
└── utils/
    └── subnet-calculator.js # Business logic utilities
```

### Key Files and Their Roles
- `src/main/main.js`: Creates BrowserWindow, initializes app, loads landing page
- `src/main/ipc-handlers.js`: Handles all IPC communication including navigation and subnet calculations
- `src/preload/preload.js`: Exposes safe APIs to renderer via contextBridge
- `src/utils/subnet-calculator.js`: Contains pure subnet calculation logic

### Security Configuration
- Context isolation: **ENABLED**
- Node integration: **DISABLED**  
- Sandbox: **ENABLED**
- Preload uses contextBridge for secure IPC
- Content Security Policy headers in HTML files

## Important Implementation Notes

### Logging Limitations
- electron-log CANNOT be used in the preload script when sandbox is enabled
- Use console.log with prefixes in preload/renderer for logging
- electron-log works fine in the main process

### Adding New Tools
1. Create HTML file in `src/renderer/pages/`
2. Create corresponding renderer JS file
3. Add case in `src/main/ipc-handlers.js` navigation handler
4. Add tool card in `src/renderer/landing.html`

### IPC Communication Pattern
```javascript
// Renderer → Main (via preload)
window.electronAPI.navigateToTool('tool-name')

// Main process handler
ipcMain.handle('navigate-to-tool', async (event, toolName) => {
  // Handle navigation
})
```

### Build Configuration
- Electron Forge with makers for: ZIP, DEB (Linux), Squirrel (Windows)
- RPM maker removed due to rpmbuild dependency
- Security fuses enabled to enforce ASAR and disable dangerous features

## Common Tasks

### Run Tests
Currently no tests implemented. Consider adding:
```bash
npm install --save-dev jest @testing-library/electron
npm test
```

### Debug Issues
1. Open DevTools with F12 in the app
2. Check main process logs in terminal
3. Look for sandbox/preload errors in console

### Update Dependencies
```bash
npm update                    # Update to latest minor versions
npm install electron@latest   # Update Electron specifically
```

## Known Issues & Workarounds

### Issue: "Unable to load preload script"
**Cause**: electron-log/renderer cannot be used in sandboxed preload
**Solution**: Use console.log instead of electron-log in preload

### Issue: Navigation not working
**Check**:
1. IPC handlers registered in main.js
2. Tool name matches in HTML data-tool attribute
3. Path in ipc-handlers.js is correct

## Future Improvements Priority
1. **Immediate**: Add unit tests for subnet calculations
2. **Short-term**: Implement remaining network tools (VLSM, Ping, Port Scanner)
3. **Medium-term**: Add dark/light theme toggle, IPv6 support
4. **Long-term**: Auto-updater, network topology visualization

## Development Tips
- Always maintain sandbox security - don't disable it
- Test navigation after any structural changes
- Keep business logic in utils/ for reusability
- Use IPC handlers for all main-renderer communication
- Validate all user input on both frontend and backend