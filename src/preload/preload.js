const { contextBridge, ipcRenderer, clipboard } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Subnet calculation API
  calculateSubnet: (ipAddress, cidr) => ipcRenderer.invoke('calculate-subnet', ipAddress, cidr),
  
  // Navigation API
  navigateToTool: (toolName) => ipcRenderer.invoke('navigate-to-tool', toolName),
  navigateToHome: () => ipcRenderer.invoke('navigate-to-home'),
  
  // System information
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }),
  
  // Logging API for renderer (using console for now due to sandbox restrictions)
  log: {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args)
  },
  
  // Clipboard API
  clipboard: {
    writeText: (text) => {
      clipboard.writeText(text)
      console.log('[INFO] Copied to clipboard:', text.substring(0, 50) + '...')
    },
    readText: () => clipboard.readText()
  },
  
  // Knowledge Base API
  getKnowledgeTree: () => ipcRenderer.invoke('get-knowledge-tree'),
  readKnowledgeFile: (filePath) => ipcRenderer.invoke('read-knowledge-file', filePath),
  saveKnowledgeFile: (filePath, content) => ipcRenderer.invoke('save-knowledge-file', filePath, content),
  openKnowledgeFolder: () => ipcRenderer.invoke('open-knowledge-folder'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Storage API for calculation history
  storage: {
    getHistory: () => {
      try {
        const history = localStorage.getItem('subnetHistory')
        return history ? JSON.parse(history) : []
      } catch (error) {
        console.error('[ERROR] Error reading history:', error)
        return []
      }
    },
    saveToHistory: (calculation) => {
      try {
        const history = localStorage.getItem('subnetHistory')
        const historyArray = history ? JSON.parse(history) : []
        
        // Add new calculation with timestamp
        const entry = {
          ...calculation,
          timestamp: new Date().toISOString(),
          id: Date.now()
        }
        
        // Keep only last 50 calculations
        historyArray.unshift(entry)
        if (historyArray.length > 50) {
          historyArray.pop()
        }
        
        localStorage.setItem('subnetHistory', JSON.stringify(historyArray))
        console.log('[INFO] Saved calculation to history')
        return true
      } catch (error) {
        console.error('[ERROR] Error saving to history:', error)
        return false
      }
    },
    clearHistory: () => {
      try {
        localStorage.removeItem('subnetHistory')
        console.log('[INFO] History cleared')
        return true
      } catch (error) {
        console.error('[ERROR] Error clearing history:', error)
        return false
      }
    }
  }
})
