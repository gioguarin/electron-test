const { contextBridge, ipcRenderer } = require('electron')

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
  })
})
