const { ipcMain, app } = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const log = require('electron-log/main')

// Try to load node-pty with error handling
let pty = null
let ptyError = null

try {
  pty = require('node-pty')
  log.info('node-pty loaded successfully')
} catch (error) {
  ptyError = error
  log.error('Failed to load node-pty:', error.message)
  log.error('This usually means node-pty needs to be rebuilt for your Electron version')
}

class TerminalManager {
  constructor() {
    this.terminals = new Map()
    this.nextId = 1
  }

  checkPtyAvailable() {
    if (!pty) {
      // Try to load node-pty again in case it's available now
      try {
        pty = require('node-pty')
        log.info('node-pty loaded on retry')
      } catch (retryError) {
        log.error('Failed to load node-pty on retry:', retryError.message)
        throw new Error(`Terminal functionality is not available. node-pty failed to load: ${ptyError?.message || 'Unknown error'}. Please rebuild the app with: npx electron-rebuild -f -w node-pty`)
      }
    }
  }

  findAvailableShell() {
    const platform = os.platform()
    
    if (platform === 'win32') {
      // Windows shells
      const shells = [
        { shell: 'powershell.exe', args: [] },
        { shell: 'cmd.exe', args: [] }
      ]
      
      for (const { shell, args } of shells) {
        // On Windows, just try the shell names as they should be in PATH
        log.info(`Trying Windows shell: ${shell}`)
        return { shell, args }
      }
    } else {
      // Unix-like shells (macOS and Linux)
      const shellPaths = [
        process.env.SHELL,
        '/bin/zsh',
        '/usr/bin/zsh',
        '/bin/bash',
        '/usr/bin/bash',
        '/bin/sh',
        '/usr/bin/sh'
      ]
      
      // First try without arguments for better compatibility
      for (const shellPath of shellPaths) {
        if (shellPath && fs.existsSync(shellPath)) {
          log.info(`Found shell at: ${shellPath}`)
          // Try without login/interactive flags first as they can cause issues
          return { shell: shellPath, args: [] }
        }
      }
      
      // If no shell found, try with basic sh
      log.warn('No preferred shell found, falling back to /bin/sh')
      return { shell: '/bin/sh', args: [] }
    }
    
    // Final fallback
    const fallback = platform === 'win32' 
      ? { shell: 'cmd.exe', args: [] }
      : { shell: '/bin/sh', args: [] }
    
    log.warn(`Using final fallback shell: ${fallback.shell}`)
    return fallback
  }

  createTerminal(cols = 80, rows = 24) {
    // Check if node-pty is available
    this.checkPtyAvailable()
    
    // Find an available shell
    const { shell, args: shellArgs } = this.findAvailableShell()
    const platform = os.platform()
    
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
          '/sbin'
        ]
        
        // Only add HOME paths if HOME is defined
        if (process.env.HOME) {
          additionalPaths.push(
            `${process.env.HOME}/.local/bin`,
            `${process.env.HOME}/bin`
          )
        }
        
        const currentPath = env.PATH || ''
        const pathSet = new Set(currentPath.split(':').filter(Boolean))
        additionalPaths.forEach(p => {
          if (p) pathSet.add(p)
        })
        env.PATH = Array.from(pathSet).filter(Boolean).join(':')
        
        // Ensure TERM is set for proper terminal emulation
        env.TERM = env.TERM || 'xterm-256color'
        
        // Set LANG for proper character encoding if not set
        if (!env.LANG) {
          env.LANG = 'en_US.UTF-8'
        }
      }
      
      // Verify shell exists before trying to spawn (skip on Windows)
      if (platform !== 'win32' && !fs.existsSync(shell)) {
        log.error(`Shell not found at path: ${shell}`)
        // Try to find an alternative
        const fallback = this.findAvailableShell()
        if (fallback.shell !== shell) {
          log.info(`Retrying with fallback shell: ${fallback.shell}`)
          return this.createTerminal(cols, rows)
        }
        throw new Error(`Shell not found at path: ${shell}`)
      }
      
      // Determine the working directory
      let cwd = process.env.HOME || process.env.USERPROFILE || '/'
      
      // In packaged app, we might need to use a different directory
      if (app.isPackaged && !fs.existsSync(cwd)) {
        cwd = app.getPath('home') || '/'
      }
      
      log.info(`Spawning terminal:`)
      log.info(`  Shell: ${shell}`)
      log.info(`  Args: ${shellArgs.join(' ')}`)
      log.info(`  CWD: ${cwd}`)
      log.info(`  PATH: ${env.PATH}`)
      
      // Create terminal with proper options
      const terminal = pty.spawn(shell, shellArgs, {
        name: 'xterm-256color',
        cols,
        rows,
        cwd,
        env,
        encoding: 'utf8',
        // Add handling for M1 Macs and different architectures
        handleFlowControl: true
      })

      // Verify the terminal was created successfully
      if (!terminal || typeof terminal.pid !== 'number') {
        throw new Error('Terminal spawn returned invalid object')
      }

      this.terminals.set(id, terminal)
      
      // Log terminal creation
      log.info(`Terminal created successfully: ${id} with shell: ${shell}, PID: ${terminal.pid}`)
      
      return { id, pid: terminal.pid }
    } catch (error) {
      log.error('Failed to create terminal:', error)
      log.error('Error stack:', error.stack)
      log.error('Shell path:', shell)
      log.error('Shell args:', shellArgs)
      log.error('Platform:', platform)
      log.error('Architecture:', process.arch)
      log.error('Node version:', process.version)
      log.error('Electron version:', process.versions.electron)
      log.error('Environment HOME:', process.env.HOME)
      log.error('Environment PATH:', process.env.PATH)
      
      // Provide more helpful error message
      let errorMessage = `Terminal creation failed: ${error.message}`
      
      if (error.message.includes('posix_spawnp')) {
        errorMessage += '. This usually indicates node-pty needs to be rebuilt for your Electron version. Try running: npx electron-rebuild -f -w node-pty'
      } else if (error.message.includes('not found')) {
        errorMessage += '. Shell executable not found. Please check your system configuration.'
      }
      
      throw new Error(errorMessage)
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