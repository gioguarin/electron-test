const { ipcMain, BrowserWindow, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises
const log = require('electron-log/main')
const { calculateSubnetInfo } = require('../utils/subnet-calculator')
const { registerTerminalHandlers } = require('./terminal')
const networkTools = require('./network-tools')

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
  
  // Define settings path for use in multiple handlers
  const settingsPath = path.join(__dirname, '..', '..', 'settings.json')
  
  // Helper to get user's vault path from settings
  async function getUserVaultPath() {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      const settings = JSON.parse(data)
      if (settings.vaultPath) {
        // Ensure the vault directory exists
        try {
          await fs.mkdir(settings.vaultPath, { recursive: true })
        } catch (error) {
          log.warn('Could not create vault directory:', error)
        }
        return settings.vaultPath
      }
    } catch (error) {
      // Settings file doesn't exist or no vault path set
    }
    // Default to user's documents folder
    const os = require('os')
    const userHome = os.homedir()
    const defaultPath = path.join(userHome, 'Documents', 'KnowledgeVault')
    // Try to create default path
    try {
      await fs.mkdir(defaultPath, { recursive: true })
    } catch (error) {
      log.warn('Could not create default vault directory:', error)
    }
    return defaultPath
  }

  // Get knowledge tree structure (combines public docs and user vault)
  ipcMain.handle('get-knowledge-tree', async () => {
    try {
      const trees = []
      
      // Add public docs
      const publicDocsPath = path.join(__dirname, '..', '..', 'docs')
      try {
        await fs.access(publicDocsPath)
        const publicTree = await buildFileTree(publicDocsPath, publicDocsPath)
        trees.push({
          name: '📚 Public Docs',
          path: 'docs',
          type: 'directory',
          isPublic: true,
          children: publicTree
        })
      } catch (error) {
        // Public docs folder doesn't exist
        log.warn('Public docs folder not found:', publicDocsPath)
      }
      
      // Add user vault
      const userVaultPath = await getUserVaultPath()
      try {
        await fs.access(userVaultPath)
        const userTree = await buildFileTree(userVaultPath, userVaultPath)
        trees.push({
          name: '🔒 My Vault',
          path: 'vault',
          type: 'directory',
          isUserVault: true,
          children: userTree
        })
      } catch (error) {
        // User vault doesn't exist yet - will be created on first save
        log.info('User vault not found (will be created on first save):', userVaultPath)
      }
      
      return trees
    } catch (error) {
      log.error('Error getting knowledge tree:', error)
      throw error
    }
  })

  // Read knowledge file
  ipcMain.handle('read-knowledge-file', async (event, filePath) => {
    try {
      let fullPath
      
      // Determine if it's a public doc or user vault file
      if (filePath.startsWith('docs/')) {
        // Public docs
        const relativePath = filePath.substring(5) // Remove 'docs/' prefix
        fullPath = path.join(__dirname, '..', '..', 'docs', relativePath)
      } else if (filePath.startsWith('vault/')) {
        // User vault
        const relativePath = filePath.substring(6) // Remove 'vault/' prefix
        const userVaultPath = await getUserVaultPath()
        fullPath = path.join(userVaultPath, relativePath)
      } else {
        // Legacy support - try docs first, then vault
        const docsPath = path.join(__dirname, '..', '..', 'docs', filePath)
        try {
          await fs.access(docsPath)
          fullPath = docsPath
        } catch {
          const userVaultPath = await getUserVaultPath()
          fullPath = path.join(userVaultPath, filePath)
        }
      }
      
      const content = await fs.readFile(fullPath, 'utf-8')
      return content
    } catch (error) {
      log.error('Error reading knowledge file:', error)
      throw error
    }
  })

  // Save knowledge file
  ipcMain.handle('save-knowledge-file', async (event, filePath, content, forceLocation) => {
    try {
      let fullPath
      
      // Determine save location
      if (forceLocation === 'docs' || filePath.startsWith('docs/')) {
        // Save to public docs (only if explicitly requested)
        const relativePath = filePath.startsWith('docs/') ? filePath.substring(5) : filePath
        fullPath = path.join(__dirname, '..', '..', 'docs', relativePath)
      } else if (filePath.startsWith('vault/')) {
        // User vault
        const relativePath = filePath.substring(6) // Remove 'vault/' prefix
        const userVaultPath = await getUserVaultPath()
        fullPath = path.join(userVaultPath, relativePath)
      } else {
        // Default to user vault for new files
        const userVaultPath = await getUserVaultPath()
        fullPath = path.join(userVaultPath, filePath)
      }
      
      // Ensure the directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, 'utf-8')
      log.info('Knowledge file saved:', fullPath)
      
      // Return the location where it was saved
      if (fullPath.includes(path.join(__dirname, '..', '..', 'docs'))) {
        return { success: true, location: 'docs' }
      } else {
        return { success: true, location: 'vault' }
      }
    } catch (error) {
      log.error('Error saving knowledge file:', error)
      throw error
    }
  })

  // Open knowledge folder in system file explorer
  ipcMain.handle('open-knowledge-folder', async (event, location) => {
    try {
      let folderPath
      if (location === 'docs') {
        folderPath = path.join(__dirname, '..', '..', 'docs')
      } else {
        // Default to user vault
        folderPath = await getUserVaultPath()
        // Ensure it exists
        await fs.mkdir(folderPath, { recursive: true })
      }
      await shell.openPath(folderPath)
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

  // Settings handlers - removed duplicate, using the one declared above
  
  ipcMain.handle('load-settings', async () => {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      log.error('Error loading settings:', error)
      // Return default settings if file doesn't exist
      const defaultSettings = require('../../settings.json')
      return defaultSettings
    }
  })

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
      log.info('Settings saved successfully')
      return true
    } catch (error) {
      log.error('Error saving settings:', error)
      throw error
    }
  })

  ipcMain.handle('reset-settings', async () => {
    try {
      const defaultSettings = require('../../settings.json')
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf-8')
      log.info('Settings reset to defaults')
      return defaultSettings
    } catch (error) {
      log.error('Error resetting settings:', error)
      throw error
    }
  })

  // Network Tools handlers
  ipcMain.handle('network-ping', (event, host, count) => {
    return new Promise((resolve) => {
      const results = []
      networkTools.ping(host, count, 
        (data) => {
          event.sender.send('network-ping-data', data)
        },
        (result) => {
          resolve(result)
        }
      )
    })
  })

  ipcMain.handle('network-traceroute', (event, host) => {
    return new Promise((resolve) => {
      const results = []
      networkTools.traceroute(host,
        (data) => {
          event.sender.send('network-traceroute-data', data)
        },
        (result) => {
          resolve(result)
        }
      )
    })
  })

  ipcMain.handle('network-asn-lookup', (event, ip) => {
    return new Promise((resolve) => {
      networkTools.lookupASN(ip,
        (data) => {
          event.sender.send('network-asn-data', data)
        },
        (result) => {
          resolve(result)
        }
      )
    })
  })

  ipcMain.handle('network-bgp-lookup', (event, ip) => {
    return new Promise((resolve) => {
      networkTools.lookupBGPInfo(ip,
        (data) => {
          event.sender.send('network-bgp-data', data)
        },
        (result) => {
          resolve(result)
        }
      )
    })
  })

  ipcMain.handle('network-dns-lookup', (event, hostname) => {
    return new Promise((resolve) => {
      networkTools.dnsLookup(hostname, (result) => {
        resolve(result)
      })
    })
  })

  // BGP Route Server handlers
  ipcMain.handle('route-server-connect', async (event, host) => {
    try {
      const result = await networkTools.connectRouteServer(host, 23, event.sender)
      return result
    } catch (error) {
      log.error('Route server connect error:', error)
      return { success: false, error: error.message }
    }
  })
  
  ipcMain.handle('route-server-command', async (event, sessionId, command) => {
    try {
      const result = await networkTools.sendRouteServerCommand(sessionId, command)
      return result
    } catch (error) {
      log.error('Route server command error:', error)
      return { success: false, error: error.message }
    }
  })
  
  ipcMain.handle('route-server-disconnect', async (event, sessionId) => {
    try {
      const result = await networkTools.disconnectRouteServer(sessionId)
      return result
    } catch (error) {
      log.error('Route server disconnect error:', error)
      return { success: false, error: error.message }
    }
  })

  // IPC handler to set vault path
  ipcMain.handle('set-vault-path', async (event, newPath) => {
    try {
      log.info('Setting vault path to:', newPath)
      
      // Load current settings
      let settings = {}
      try {
        const data = await fs.readFile(settingsPath, 'utf-8')
        settings = JSON.parse(data)
        log.info('Loaded existing settings')
      } catch (err) {
        // Settings file doesn't exist yet
        log.info('No existing settings file, creating new one')
      }
      
      // Update vault path
      settings.vaultPath = newPath
      
      // Save settings
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
      log.info('Settings saved successfully')
      
      // Create the vault folder if it doesn't exist
      await fs.mkdir(newPath, { recursive: true })
      log.info('Vault directory created/verified:', newPath)
      
      log.info('Vault path updated successfully:', newPath)
      return true
    } catch (error) {
      log.error('Error setting vault path:', error)
      log.error('Error details:', error.message, error.stack)
      throw error
    }
  })

  // IPC handler to get current vault path
  ipcMain.handle('get-vault-path', async () => {
    return await getUserVaultPath()
  })

  // IPC handler for folder selection dialog
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Your Knowledge Vault Location',
      buttonLabel: 'Select Folder',
      message: 'Choose where to store your personal knowledge vault'
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // Register terminal handlers
  registerTerminalHandlers()

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