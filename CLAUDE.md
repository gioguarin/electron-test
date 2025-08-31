# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Electron desktop application project called "Network Tools Hub" that provides various network administration and diagnostic tools. The application is built with Electron Forge for packaging and uses a modular architecture with clear separation of concerns.

## Current Implementation Status
- **VS Code-Inspired Interface**: Professional IDE layout with resizable panels using Allotment
- **React + TypeScript**: Modern frontend stack with type safety
- **Knowledge Repository**: Built-in markdown documentation manager with fuzzy search
- **Subnet Calculator**: Fully functional with IP/CIDR input, binary representation, copy-to-clipboard, and persistent history
- **Panel System**: Activity Bar, Side Panel, Terminal, AI Assistant with keyboard shortcuts
- **State Persistence**: Panel sizes and visibility saved between sessions
- **Logging**: Professional logging with electron-log (main process only)
- **Icons**: Custom network-themed application icons

## Development Commands

### Running the Application
```bash
npm start                # Build and start the Electron app
npm run start:dev        # Start with development build
npm run start:prod       # Start with production build
```

### Building
```bash
npm run build            # Build for production with webpack
npm run build:dev        # Build for development with webpack
npm run build:watch      # Watch mode for development
```

### TypeScript Compilation
```bash
npm run compile          # Compile TypeScript files
npm run compile:watch    # Watch mode for TypeScript
```

### Packaging and Distribution
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
│   ├── index.tsx            # React app entry point
│   ├── App.tsx              # Main app component with panel layout
│   ├── components/          # React components
│   │   ├── ActivityBar.tsx  # VS Code-style activity bar
│   │   ├── SidePanel.tsx    # Side panel with tool navigation
│   │   ├── ToolPanel.tsx    # Tool rendering component
│   │   ├── TerminalPanel.tsx # Terminal interface
│   │   ├── AssistantPanel.tsx # AI assistant interface
│   │   ├── KnowledgePanel.tsx # Knowledge repository main view
│   │   ├── KnowledgeExplorer.tsx # File explorer with fuzzy search
│   │   └── MarkdownViewer.tsx # Markdown viewer/editor
│   ├── contexts/            # React contexts
│   │   └── PanelContext.tsx # Panel state management
│   └── styles/              # CSS styles
├── preload/
│   └── preload.js           # Preload script with contextBridge
├── components/              # Legacy component system
│   ├── base/                # Base component classes
│   └── tools/               # Tool components
├── utils/
│   └── subnet-calculator.js # Business logic utilities
└── knowledge-base/          # Documentation repository
    ├── project/             # Project-specific docs
    ├── documentation/       # General documentation
    ├── guides/              # How-to guides
    └── notes/               # Personal notes
```

### Key Files and Their Roles
- `src/main/main.js`: Creates BrowserWindow, initializes app, loads React app from dist/
- `src/main/ipc-handlers.js`: Handles all IPC communication including navigation, subnet calculations, and knowledge base operations
- `src/preload/preload.js`: Exposes safe APIs to renderer via contextBridge
- `src/renderer/App.tsx`: Main React component orchestrating the VS Code-like panel layout
- `src/renderer/contexts/PanelContext.tsx`: Manages panel visibility and sizes with persistence
- `webpack.config.js`: Three separate configurations for main, preload, and renderer processes

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
1. Create a new React component in `src/renderer/components/tools/`
2. Register the tool in `src/renderer/App.tsx`
3. Add IPC handlers if needed in `src/main/ipc-handlers.js`
4. Update the preload script if new APIs are required
5. Add to SidePanel.tsx for navigation

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
- Webpack with separate configurations for main, preload, and renderer processes
- Renderer target set to 'web' to avoid Node.js module issues
- TypeScript compilation with ts-loader
- CSS modules support with style-loader and css-loader
- HtmlWebpackPlugin for automatic HTML generation
- Electron Forge with makers for: ZIP, DEB (Linux), Squirrel (Windows)
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

### Issue: "require is not defined" in renderer
**Cause**: Node.js modules being used in browser context
**Solution**: Set webpack target to 'web' and add fallbacks for Node.js core modules

### Issue: App loads old landing page instead of React app
**Cause**: main.js pointing to wrong file
**Solution**: Ensure main.js loads from `dist/index.html` after webpack build

## Future Improvements Priority
1. **Immediate**: Migrate Subnet Calculator to React component
2. **Short-term**: Implement remaining network tools (VLSM, Ping, Port Scanner)
3. **Medium-term**: Complete terminal integration with node-pty, AI Assistant with LLM
4. **Long-term**: Redux state management, plugin system, network topology visualization

## Development Tips
- Always maintain sandbox security - don't disable it
- Test navigation after any structural changes
- Keep business logic in utils/ for reusability
- Use IPC handlers for all main-renderer communication
- Validate all user input on both frontend and backend