# Electron.js Setup Guide

## What is Electron?
Electron is a framework for building cross-platform desktop applications using web technologies (HTML, CSS, JavaScript). It combines Chromium and Node.js into a single runtime.

## Prerequisites

### 1. Install Node.js and npm
- Download from: https://nodejs.org/
- Choose the LTS version for stability
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

## Setting Up Your First Electron App

### Method 1: Quick Start (Recommended for Beginners)

1. **Clone the Quick Start repository**
   ```bash
   git clone https://github.com/electron/electron-quick-start
   cd electron-quick-start
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app**
   ```bash
   npm start
   ```

### Method 2: Manual Setup from Scratch

1. **Create project directory**
   ```bash
   mkdir my-electron-app
   cd my-electron-app
   ```

2. **Initialize npm project**
   ```bash
   npm init -y
   ```

3. **Install Electron as dev dependency**
   ```bash
   npm install --save-dev electron
   ```

4. **Create main.js file**
   ```javascript
   const { app, BrowserWindow } = require('electron')
   const path = require('path')

   function createWindow () {
     const mainWindow = new BrowserWindow({
       width: 800,
       height: 600,
       webPreferences: {
         preload: path.join(__dirname, 'preload.js')
       }
     })

     mainWindow.loadFile('index.html')
   }

   app.whenReady().then(() => {
     createWindow()

     app.on('activate', function () {
       if (BrowserWindow.getAllWindows().length === 0) createWindow()
     })
   })

   app.on('window-all-closed', function () {
     if (process.platform !== 'darwin') app.quit()
   })
   ```

5. **Create preload.js file**
   ```javascript
   window.addEventListener('DOMContentLoaded', () => {
     const replaceText = (selector, text) => {
       const element = document.getElementById(selector)
       if (element) element.innerText = text
     }

     for (const type of ['chrome', 'node', 'electron']) {
       replaceText(`${type}-version`, process.versions[type])
     }
   })
   ```

6. **Create index.html file**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <title>Hello World!</title>
     <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
   </head>
   <body>
     <h1>Hello World!</h1>
     <p>We are using Node.js <span id="node-version"></span>,</p>
     <p>Chromium <span id="chrome-version"></span>,</p>
     <p>and Electron <span id="electron-version"></span>.</p>
   </body>
   </html>
   ```

7. **Update package.json**
   Add start script:
   ```json
   {
     "name": "my-electron-app",
     "version": "1.0.0",
     "description": "A minimal Electron application",
     "main": "main.js",
     "scripts": {
       "start": "electron ."
     },
     "devDependencies": {
       "electron": "^latest"
     }
   }
   ```

8. **Run your app**
   ```bash
   npm start
   ```

## Development Tools

### Electron Forge (Recommended)
Simplifies building and packaging:
```bash
npm install --save-dev @electron-forge/cli
npx electron-forge import
npm run make  # Creates distributable
```

### Electron Builder
Alternative packaging tool:
```bash
npm install --save-dev electron-builder
```

### DevTools
- Press `Ctrl+Shift+I` (or `Cmd+Opt+I` on Mac) in your app to open Chrome DevTools
- Add to main.js for auto-open:
  ```javascript
  mainWindow.webContents.openDevTools()
  ```

## Project Structure
```
my-electron-app/
├── package.json
├── main.js           # Main process
├── preload.js        # Preload script
├── index.html        # Renderer process
├── renderer.js       # Optional renderer JS
├── styles.css        # Optional styles
└── node_modules/
```

## Key Concepts

### Main Process
- Runs Node.js
- Creates and manages application windows
- Handles system events
- File: main.js

### Renderer Process
- Runs in each web page
- Displays the UI
- Limited Node.js access for security
- Files: HTML, CSS, JS files

### Preload Script
- Bridges main and renderer processes
- Runs before renderer loads
- Has access to Node.js APIs
- File: preload.js

## Common Features Implementation

### Menu Bar
```javascript
const { Menu } = require('electron')

const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```

### System Tray
```javascript
const { Tray } = require('electron')

let tray = new Tray('/path/to/icon.png')
tray.setToolTip('My App')
```

### IPC Communication
Main process:
```javascript
const { ipcMain } = require('electron')
ipcMain.on('message', (event, arg) => {
  console.log(arg)
  event.reply('reply', 'Response')
})
```

Renderer process:
```javascript
const { ipcRenderer } = require('electron')
ipcRenderer.send('message', 'Hello')
ipcRenderer.on('reply', (event, arg) => {
  console.log(arg)
})
```

## Building for Distribution

### Using Electron Forge
```bash
npm run make
```
Output in `out/` directory

### Manual Building
1. Install electron-packager:
   ```bash
   npm install --save-dev electron-packager
   ```

2. Add to package.json:
   ```json
   "scripts": {
     "build": "electron-packager . app-name --platform=all --out=dist/"
   }
   ```

3. Build:
   ```bash
   npm run build
   ```

## Platform-Specific Builds

### Windows
```bash
npm run make -- --platform=win32
```

### macOS
```bash
npm run make -- --platform=darwin
```

### Linux
```bash
npm run make -- --platform=linux
```

## Useful Resources

- Official Documentation: https://www.electronjs.org/docs
- API Demos App: https://github.com/electron/electron-api-demos
- Electron Fiddle (playground): https://www.electronjs.org/fiddle
- Awesome Electron (curated list): https://github.com/sindresorhus/awesome-electron
- Security Best Practices: https://www.electronjs.org/docs/tutorial/security

## Common Issues & Solutions

### Issue: npm install fails
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json, reinstall

### Issue: App won't start
- Check main field in package.json points to correct file
- Verify all required files exist
- Check console for error messages

### Issue: White screen on launch
- Check if index.html path is correct in loadFile()
- Verify HTML file exists
- Check DevTools console for errors

## Next Steps

1. Learn about Electron's security best practices
2. Explore native OS integration features
3. Implement auto-updates
4. Add code signing for distribution
5. Optimize performance and bundle size