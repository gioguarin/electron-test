interface ElectronAPI {
  // Subnet calculation API
  calculateSubnet: (ipAddress: string, cidr: number) => Promise<any>
  
  // Navigation API
  navigateToTool: (toolName: string) => Promise<void>
  navigateToHome: () => Promise<void>
  
  // System information
  getVersions: () => {
    node: string
    chrome: string
    electron: string
  }
  
  // Platform information
  platform: NodeJS.Platform
  
  // Logging API
  log: {
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    debug: (...args: any[]) => void
  }
  
  // Clipboard API
  clipboard: {
    writeText: (text: string) => void
    readText: () => string
  }
  
  // Knowledge Base API
  getKnowledgeTree: () => Promise<any>
  readKnowledgeFile: (filePath: string) => Promise<string>
  saveKnowledgeFile: (filePath: string, content: string) => Promise<boolean>
  openKnowledgeFolder: (location?: string) => Promise<void>
  openExternal: (url: string) => Promise<void>
  selectFolder: () => Promise<string | undefined>
  setVaultPath: (path: string) => Promise<void>
  getVaultPath: () => Promise<string | null>
  
  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  
  // Settings API
  loadSettings: () => Promise<any>
  saveSettings: (settings: any) => Promise<void>
  resetSettings: () => Promise<void>
  
  // Network Tools API
  networkTools: {
    ping: (host: string, count: number) => Promise<any>
    traceroute: (host: string) => Promise<any>
    asnLookup: (ip: string) => Promise<any>
    bgpLookup: (ip: string) => Promise<any>
    dnsLookup: (hostname: string) => Promise<any>
    onPingData: (callback: (data: any) => void) => () => void
    onTracerouteData: (callback: (data: any) => void) => () => void
    onAsnData: (callback: (data: any) => void) => () => void
    onBgpData: (callback: (data: any) => void) => () => void
    // Route Server API
    connectRouteServer: (host: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>
    sendRouteServerCommand: (sessionId: string, command: string) => Promise<{ success: boolean; error?: string }>
    disconnectRouteServer: (sessionId: string) => Promise<{ success: boolean; error?: string }>
    onRouteServerData: (callback: (data: any) => void) => () => void
  }
  
  // Terminal API
  terminal: {
    create: (cols: number, rows: number) => Promise<{ id: string; pid: number }>
    write: (id: string, data: string) => Promise<void>
    resize: (id: string, cols: number, rows: number) => Promise<void>
    kill: (id: string) => Promise<void>
    onData: (id: string, callback: (data: string) => void) => () => void
    onExit: (id: string, callback: (data: any) => void) => () => void
  }
  
  // Storage API
  storage: {
    getHistory: () => any[]
    saveToHistory: (calculation: any) => boolean
    clearHistory: () => boolean
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}