const { app, BrowserWindow } = require('electron')
const path = require('path')
const log = require('electron-log/main')
const { createMenu } = require('./menu')
const { registerIpcHandlers } = require('./ipc-handlers')

// Configure electron-log
log.initialize()
log.transports.file.level = 'info'
log.transports.console.level = 'debug'
log.info('Application starting...')

// Security: Prevent window.open from creating insecure windows
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    log.warn('Prevented window.open from creating new window:', navigationUrl)
    event.preventDefault()
  })
})

function createWindow () {
  log.info('Creating main window...')
  
  // Platform-specific window options
  const windowOptions = {
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,  // Security: Enable context isolation
      nodeIntegration: false,  // Security: Disable node integration
      sandbox: true,           // Security: Enable sandbox
      webSecurity: true,       // Security: Enable web security
      preload: path.join(__dirname, '..', '..', 'dist', 'preload.js')
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'), // Add app icon
    show: false // Don't show until ready
  }

  // macOS specific options for native title bar
  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hiddenInset'  // Native macOS traffic lights with inset position
    windowOptions.frame = true  // Use native frame on macOS
    windowOptions.trafficLightPosition = { x: 12, y: 10 }  // Position traffic lights
  } else {
    // Windows and Linux keep custom title bar
    windowOptions.frame = false  // Remove default title bar
    windowOptions.titleBarStyle = 'hidden'
  }

  const mainWindow = new BrowserWindow(windowOptions)

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    log.info('Main window ready to show')
    mainWindow.show()
  })

  // Load the React app from dist folder
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
  log.info('Loaded React app')

  // Open DevTools for debugging
  // DevTools disabled by default - press F12 to open
  // mainWindow.webContents.openDevTools()

  // Handle window closed
  mainWindow.on('closed', () => {
    log.info('Main window closed')
    // Dereference window object
  })
}

app.whenReady().then(() => {
  log.info('App ready, creating menu and window')
  createMenu()
  registerIpcHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      log.info('App activated, creating new window')
      createWindow()
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    log.info('All windows closed, quitting app')
    app.quit()
  }
})