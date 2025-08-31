const { ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const log = require('electron-log/main')
const { calculateSubnetInfo } = require('../utils/subnet-calculator')

/**
 * Register all IPC handlers
 */
function registerIpcHandlers() {
  // IPC Handler for subnet calculations
  ipcMain.handle('calculate-subnet', async (event, ipAddress, cidr) => {
    try {
      log.debug(`Calculating subnet for IP: ${ipAddress}, CIDR: ${cidr}`)
      const result = calculateSubnetInfo(ipAddress, cidr)
      log.debug('Subnet calculation successful')
      return { success: true, data: result }
    } catch (error) {
      log.error('Subnet calculation error:', error.message)
      return { success: false, error: error.message }
    }
  })

  // IPC Handler for navigation to specific tools
  ipcMain.handle('navigate-to-tool', async (event, toolName) => {
    log.info('Navigate to tool requested:', toolName)
    const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    if (window) {
      try {
        switch(toolName) {
        case 'subnet-calculator':
          log.info('Loading subnet calculator...')
          await window.loadFile(path.join(__dirname, '..', 'renderer', 'pages', 'subnet-calculator.html'))
          break
        default:
          log.warn(`Unknown tool: ${toolName}`)
        }
      } catch (error) {
        log.error('Error loading tool:', error)
      }
    } else {
      log.error('No window available for navigation')
    }
  })

  // IPC Handler for navigation to home
  ipcMain.handle('navigate-to-home', async (event) => {
    log.info('Navigate to home requested')
    const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    if (window) {
      try {
        await window.loadFile(path.join(__dirname, '..', 'renderer', 'landing.html'))
        log.info('Loaded landing page')
      } catch (error) {
        log.error('Error loading home:', error)
      }
    } else {
      log.error('No window available for navigation')
    }
  })

  log.info('IPC handlers registered')
}

module.exports = { registerIpcHandlers }