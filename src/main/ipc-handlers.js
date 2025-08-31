const { ipcMain, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises
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
        case 'component-test':
          log.info('Loading component test page...')
          await window.loadFile(path.join(__dirname, '..', 'renderer', 'pages', 'component-test.html'))
          break
        case 'registry-test':
          log.info('Loading registry test page...')
          await window.loadFile(path.join(__dirname, '..', 'renderer', 'pages', 'registry-test.html'))
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

  // Knowledge Base IPC Handlers
  
  // Get knowledge tree structure
  ipcMain.handle('get-knowledge-tree', async () => {
    try {
      const knowledgeBasePath = path.join(__dirname, '..', '..', 'devnotes')
      const tree = await buildFileTree(knowledgeBasePath, knowledgeBasePath)
      return tree
    } catch (error) {
      log.error('Error getting knowledge tree:', error)
      throw error
    }
  })

  // Read knowledge file
  ipcMain.handle('read-knowledge-file', async (event, filePath) => {
    try {
      const fullPath = path.join(__dirname, '..', '..', 'devnotes', filePath)
      const content = await fs.readFile(fullPath, 'utf-8')
      return content
    } catch (error) {
      log.error('Error reading knowledge file:', error)
      throw error
    }
  })

  // Save knowledge file
  ipcMain.handle('save-knowledge-file', async (event, filePath, content) => {
    try {
      const fullPath = path.join(__dirname, '..', '..', 'devnotes', filePath)
      await fs.writeFile(fullPath, content, 'utf-8')
      log.info('Knowledge file saved:', filePath)
      return true
    } catch (error) {
      log.error('Error saving knowledge file:', error)
      throw error
    }
  })

  // Open knowledge folder in system file explorer
  ipcMain.handle('open-knowledge-folder', async () => {
    try {
      const knowledgeBasePath = path.join(__dirname, '..', '..', 'devnotes')
      await shell.openPath(knowledgeBasePath)
      return true
    } catch (error) {
      log.error('Error opening knowledge folder:', error)
      throw error
    }
  })

  // Open external link
  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url)
      return true
    } catch (error) {
      log.error('Error opening external link:', error)
      throw error
    }
  })

  // Window control handlers
  ipcMain.handle('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.minimize()
      log.info('Window minimized')
    }
  })

  ipcMain.handle('maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
        log.info('Window restored')
      } else {
        win.maximize()
        log.info('Window maximized')
      }
    }
  })

  ipcMain.handle('close-window', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.close()
      log.info('Window closed')
    }
  })

  log.info('IPC handlers registered')
}

// Helper function to build file tree
async function buildFileTree(dir, baseDir) {
  const items = []
  const files = await fs.readdir(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = await fs.stat(filePath)
    const relativePath = path.relative(baseDir, filePath)
    
    if (stat.isDirectory()) {
      const children = await buildFileTree(filePath, baseDir)
      items.push({
        name: file,
        path: relativePath,
        type: 'directory',
        children
      })
    } else if (file.endsWith('.md')) {
      items.push({
        name: file,
        path: relativePath,
        type: 'file',
        lastModified: stat.mtime.toISOString()
      })
    }
  }
  
  return items.sort((a, b) => {
    // Directories first, then files
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

module.exports = { registerIpcHandlers }