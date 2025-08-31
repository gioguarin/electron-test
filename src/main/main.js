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
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,  // Security: Enable context isolation
      nodeIntegration: false,  // Security: Disable node integration
      sandbox: true,           // Security: Enable sandbox
      webSecurity: true,       // Security: Enable web security
      preload: path.join(__dirname, '..', 'preload', 'preload.js')
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'), // Add app icon
    show: false // Don't show until ready
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    log.info('Main window ready to show')
    mainWindow.show()
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'landing.html'))
  log.info('Loaded landing page')

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

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