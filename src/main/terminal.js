const { ipcMain } = require('electron')
const pty = require('node-pty')
const os = require('os')
const log = require('electron-log/main')

class TerminalManager {
  constructor() {
    this.terminals = new Map()
    this.nextId = 1
  }

  createTerminal(cols = 80, rows = 24) {
    // Determine the shell based on platform
    let shell
    let shellArgs = []
    const platform = os.platform()
    
    if (platform === 'win32') {
      shell = 'powershell.exe'
    } else if (platform === 'darwin') {
      // macOS - use zsh by default (macOS Catalina+) or bash
      // In packaged apps, SHELL might not be set, so check multiple sources
      shell = process.env.SHELL || '/bin/zsh'
      // Force interactive login shell to load user's profile
      shellArgs = ['-l', '-i']
    } else {
      // Linux
      shell = process.env.SHELL || '/bin/bash'
      shellArgs = ['-l', '-i']
    }
    
    const id = `terminal-${this.nextId++}`
    
    try {
      // Set up environment variables
      const env = { ...process.env }
      
      // Fix PATH for macOS apps (they often have limited PATH)
      if (platform === 'darwin') {
        // Add common paths for macOS
        const additionalPaths = [
          '/usr/local/bin',
          '/opt/homebrew/bin',
          '/opt/homebrew/sbin',
          '/usr/bin',
          '/bin',
          '/usr/sbin',
          '/sbin',
          `${process.env.HOME}/.local/bin`,
          `${process.env.HOME}/bin`
        ]
        const currentPath = env.PATH || ''
        const pathSet = new Set(currentPath.split(':'))
        additionalPaths.forEach(p => pathSet.add(p))
        env.PATH = Array.from(pathSet).filter(Boolean).join(':')
        
        // Ensure TERM is set for proper terminal emulation
        env.TERM = 'xterm-256color'
        // Set LANG for proper character encoding
        if (!env.LANG) {
          env.LANG = 'en_US.UTF-8'
        }
      }
      
      // Create terminal with proper options
      const terminal = pty.spawn(shell, shellArgs, {
        name: 'xterm-256color',
        cols,
        rows,
        cwd: process.env.HOME || process.env.USERPROFILE || '/',
        env,
        encoding: 'utf8'
      })

      this.terminals.set(id, terminal)
      
      // Log terminal creation
      log.info(`Terminal created: ${id} with shell: ${shell}`)
      
      return { id, pid: terminal.pid }
    } catch (error) {
      log.error('Failed to create terminal:', error)
      throw error
    }
  }

  writeToTerminal(id, data) {
    const terminal = this.terminals.get(id)
    if (terminal) {
      terminal.write(data)
    } else {
      log.warn(`Terminal not found: ${id}`)
    }
  }

  resizeTerminal(id, cols, rows) {
    const terminal = this.terminals.get(id)
    if (terminal) {
      terminal.resize(cols, rows)
      log.debug(`Terminal resized: ${id} to ${cols}x${rows}`)
    }
  }

  killTerminal(id) {
    const terminal = this.terminals.get(id)
    if (terminal) {
      terminal.kill()
      this.terminals.delete(id)
      log.info(`Terminal killed: ${id}`)
      return true
    }
    return false
  }

  killAllTerminals() {
    this.terminals.forEach((terminal, id) => {
      terminal.kill()
      log.info(`Terminal killed: ${id}`)
    })
    this.terminals.clear()
  }

  getTerminal(id) {
    return this.terminals.get(id)
  }
}

// Create singleton instance
const terminalManager = new TerminalManager()

// Register IPC handlers
function registerTerminalHandlers() {
  // Create a new terminal
  ipcMain.handle('terminal-create', (event, cols, rows) => {
    try {
      const result = terminalManager.createTerminal(cols, rows)
      const terminal = terminalManager.getTerminal(result.id)
      
      // Set up data listener for this terminal
      terminal.onData((data) => {
        event.sender.send(`terminal-data-${result.id}`, data)
      })
      
      // Set up exit listener
      terminal.onExit(({ exitCode, signal }) => {
        event.sender.send(`terminal-exit-${result.id}`, { exitCode, signal })
        terminalManager.killTerminal(result.id)
      })
      
      return result
    } catch (error) {
      log.error('Error creating terminal:', error)
      throw error
    }
  })

  // Write data to terminal
  ipcMain.handle('terminal-write', (event, id, data) => {
    terminalManager.writeToTerminal(id, data)
  })

  // Resize terminal
  ipcMain.handle('terminal-resize', (event, id, cols, rows) => {
    terminalManager.resizeTerminal(id, cols, rows)
  })

  // Kill terminal
  ipcMain.handle('terminal-kill', (event, id) => {
    return terminalManager.killTerminal(id)
  })

  // Kill all terminals on app quit
  ipcMain.on('before-quit', () => {
    terminalManager.killAllTerminals()
  })

  log.info('Terminal handlers registered')
}

module.exports = { registerTerminalHandlers, terminalManager }