const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')

// Security: Prevent window.open from creating insecure windows
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})

function createWindow () {
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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add app icon
    show: false // Don't show until ready
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadFile('landing.html')

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    // Dereference window object
  })
}

// IPC Handlers for subnet calculations
ipcMain.handle('calculate-subnet', async (event, ipAddress, cidr) => {
  try {
    // Basic subnet calculation logic
    const result = calculateSubnetInfo(ipAddress, cidr)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// IPC Handlers for navigation
ipcMain.handle('navigate-to-tool', async (event, toolName) => {
  console.log('Navigate to tool requested:', toolName)
  const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  if (window) {
    try {
      switch(toolName) {
        case 'subnet-calculator':
          console.log('Loading subnet calculator...')
          await window.loadFile(path.join(__dirname, 'subnet-calculator.html'))
          break
        default:
          console.warn(`Unknown tool: ${toolName}`)
      }
    } catch (error) {
      console.error('Error loading tool:', error)
    }
  } else {
    console.error('No window available for navigation')
  }
})

ipcMain.handle('navigate-to-home', async (event) => {
  console.log('Navigate to home requested')
  const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  if (window) {
    try {
      await window.loadFile(path.join(__dirname, 'landing.html'))
    } catch (error) {
      console.error('Error loading home:', error)
    }
  } else {
    console.error('No window available for navigation')
  }
})

// Basic subnet calculation function
function calculateSubnetInfo(ipAddress, cidr) {
  // Validate IP address
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ipAddress.match(ipRegex)
  
  if (!match) {
    throw new Error('Invalid IP address format')
  }
  
  const octets = match.slice(1).map(Number)
  
  if (octets.some(octet => octet > 255)) {
    throw new Error('Invalid IP address: octets must be 0-255')
  }
  
  if (cidr < 0 || cidr > 32) {
    throw new Error('Invalid CIDR: must be between 0 and 32')
  }
  
  // Convert IP to binary
  const ipBinary = octets.map(octet => octet.toString(2).padStart(8, '0')).join('')
  const ipDecimal = parseInt(ipBinary, 2)
  
  // Calculate subnet mask
  const maskBinary = '1'.repeat(cidr) + '0'.repeat(32 - cidr)
  const maskDecimal = parseInt(maskBinary, 2)
  
  // Calculate network address
  const networkDecimal = ipDecimal & maskDecimal
  const networkBinary = networkDecimal.toString(2).padStart(32, '0')
  const networkOctets = [
    parseInt(networkBinary.substring(0, 8), 2),
    parseInt(networkBinary.substring(8, 16), 2),
    parseInt(networkBinary.substring(16, 24), 2),
    parseInt(networkBinary.substring(24, 32), 2)
  ]
  
  // Calculate broadcast address
  const hostBits = 32 - cidr
  const broadcastDecimal = networkDecimal | ((1 << hostBits) - 1)
  const broadcastBinary = broadcastDecimal.toString(2).padStart(32, '0')
  const broadcastOctets = [
    parseInt(broadcastBinary.substring(0, 8), 2),
    parseInt(broadcastBinary.substring(8, 16), 2),
    parseInt(broadcastBinary.substring(16, 24), 2),
    parseInt(broadcastBinary.substring(24, 32), 2)
  ]
  
  // Calculate subnet mask octets
  const maskOctets = [
    parseInt(maskBinary.substring(0, 8), 2),
    parseInt(maskBinary.substring(8, 16), 2),
    parseInt(maskBinary.substring(16, 24), 2),
    parseInt(maskBinary.substring(24, 32), 2)
  ]
  
  // Calculate usable hosts
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0
  
  return {
    ipAddress: ipAddress,
    cidr: cidr,
    subnetMask: maskOctets.join('.'),
    networkAddress: networkOctets.join('.'),
    broadcastAddress: broadcastOctets.join('.'),
    firstHost: usableHosts > 0 ? 
      [networkOctets[0], networkOctets[1], networkOctets[2], networkOctets[3] + 1].join('.') : 'N/A',
    lastHost: usableHosts > 0 ? 
      [broadcastOctets[0], broadcastOctets[1], broadcastOctets[2], broadcastOctets[3] - 1].join('.') : 'N/A',
    totalHosts: totalHosts,
    usableHosts: usableHosts,
    ipClass: getIPClass(octets[0]),
    ipBinary: octets.map(o => o.toString(2).padStart(8, '0')).join('.')
  }
}

function getIPClass(firstOctet) {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A'
  if (firstOctet >= 128 && firstOctet <= 191) return 'B'
  if (firstOctet >= 192 && firstOctet <= 223) return 'C'
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)'
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)'
  return 'Unknown'
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const { dialog } = require('electron')
            dialog.showMessageBox({
              type: 'info',
              title: 'About Subnet Calculator',
              message: 'Subnet Calculator',
              detail: 'A simple subnet calculator built with Electron.\nVersion: 1.0.0',
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createMenu()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})