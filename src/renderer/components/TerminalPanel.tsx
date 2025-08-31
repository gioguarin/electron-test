import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import '../styles/TerminalPanel.css'

interface TerminalTab {
  id: string
  name: string
  terminalId?: string
  terminal?: Terminal
  fitAddon?: FitAddon
}

export const TerminalPanel: React.FC = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const terminalsMap = useRef<Map<string, { terminal: Terminal, cleanup: () => void }>>(new Map())

  // Initialize first tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createNewTab()
    }
  }, [])

  // Initialize terminals when tabs change
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = []
    
    tabs.forEach(tab => {
      // Check if this tab needs initialization
      if (!tab.terminalId && terminalRefs.current.has(tab.id)) {
        // Give React a moment to ensure the DOM is ready
        const timeoutId = setTimeout(() => {
          if (terminalRefs.current.has(tab.id)) {
            initializeTerminal(tab.id)
          }
        }, 100)
        timeoutIds.push(timeoutId)
      }
    })
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [tabs])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Kill all terminals
      terminalsMap.current.forEach(({ cleanup }, id) => {
        cleanup()
        window.electronAPI.terminal.kill(id)
      })
    }
  }, [])

  const createNewTab = async () => {
    const tabId = `tab-${Date.now()}`
    const newTab: TerminalTab = {
      id: tabId,
      name: `Terminal ${tabs.length + 1}`
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTab(tabId)
    // Don't initialize here - let useEffect handle it
  }

  const initializeTerminal = async (tabId: string) => {
    const container = terminalRefs.current.get(tabId)
    if (!container) {
      console.error('Container not found for tab:', tabId)
      // Retry once after a delay
      setTimeout(() => {
        const retryContainer = terminalRefs.current.get(tabId)
        if (retryContainer) {
          initializeTerminal(tabId)
        }
      }, 200)
      return
    }

    // Check if already initialized
    const existingTab = tabs.find(t => t.id === tabId)
    if (existingTab?.terminalId) {
      console.log('Terminal already initialized for tab:', tabId)
      return
    }

    try {
      // Create xterm.js terminal
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
          cursorAccent: '#000000',
          selectionBackground: '#4e94ce',
          selectionForeground: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5'
        }
      })

      // Add addons
      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()
      
      terminal.loadAddon(fitAddon)
      terminal.loadAddon(webLinksAddon)
      
      // Open terminal in container
      terminal.open(container)
      fitAddon.fit()

      // Create PTY terminal on backend
      const result = await window.electronAPI.terminal.create(
        terminal.cols,
        terminal.rows
      )
      const terminalId = result.id

      // Set up data listener
      const cleanupData = window.electronAPI.terminal.onData(terminalId, (data: string) => {
        terminal.write(data)
      })

      // Set up exit listener
      const cleanupExit = window.electronAPI.terminal.onExit(terminalId, ({ exitCode }: any) => {
        terminal.write(`\r\n[Process exited with code ${exitCode}]\r\n`)
        terminal.dispose()
      })

      // Send terminal input to PTY
      terminal.onData((data: string) => {
        window.electronAPI.terminal.write(terminalId, data)
      })

      // Handle resize
      terminal.onResize(({ cols, rows }) => {
        window.electronAPI.terminal.resize(terminalId, cols, rows)
      })

      // Store terminal and cleanup functions
      terminalsMap.current.set(terminalId, {
        terminal,
        cleanup: () => {
          cleanupData()
          cleanupExit()
          terminal.dispose()
        }
      })

      // Update tab with terminal info
      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, terminalId, terminal, fitAddon }
          : tab
      ))

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit()
      }
      window.addEventListener('resize', handleResize)
      
      // Store cleanup for this specific terminal
      const existingCleanup = terminalsMap.current.get(terminalId)?.cleanup
      if (existingCleanup) {
        terminalsMap.current.set(terminalId, {
          terminal,
          cleanup: () => {
            existingCleanup()
            window.removeEventListener('resize', handleResize)
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize terminal:', error)
    }
  }

  const closeTab = async (tabId: string) => {
    if (tabs.length === 1) {
      // Don't close the last tab, just clear it
      const tab = tabs[0]
      if (tab.terminal) {
        tab.terminal.clear()
      }
      return
    }

    const tab = tabs.find(t => t.id === tabId)
    if (tab?.terminalId) {
      const terminalInfo = terminalsMap.current.get(tab.terminalId)
      if (terminalInfo) {
        terminalInfo.cleanup()
        await window.electronAPI.terminal.kill(tab.terminalId)
        terminalsMap.current.delete(tab.terminalId)
      }
    }

    const filteredTabs = tabs.filter(t => t.id !== tabId)
    setTabs(filteredTabs)
    
    if (activeTab === tabId && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0].id)
    }
  }

  const clearTerminal = () => {
    const tab = tabs.find(t => t.id === activeTab)
    if (tab?.terminal) {
      tab.terminal.clear()
    }
  }

  const killTerminal = async () => {
    const tab = tabs.find(t => t.id === activeTab)
    if (tab?.terminalId) {
      await window.electronAPI.terminal.kill(tab.terminalId)
      // Re-initialize the terminal
      initializeTerminal(tab.id)
    }
  }

  // Resize terminals when tab changes
  useEffect(() => {
    const activeTabData = tabs.find(t => t.id === activeTab)
    if (activeTabData?.fitAddon) {
      setTimeout(() => {
        activeTabData.fitAddon?.fit()
      }, 0)
    }
  }, [activeTab, tabs])

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div className="terminal-tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`terminal-tab ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="terminal-tab-icon">&#x2630;</span>
              <span className="terminal-tab-name">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  className="terminal-tab-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="terminal-tab-add" onClick={createNewTab}>
            +
          </button>
        </div>
        <div className="terminal-actions">
          <button className="terminal-action" title="Clear Terminal" onClick={clearTerminal}>
            <span>Clear</span>
          </button>
          <button className="terminal-action" title="Kill Terminal" onClick={killTerminal}>
            <span>Kill</span>
          </button>
        </div>
      </div>
      
      <div className="terminal-content">
        {tabs.map(tab => (
          <div
            key={tab.id}
            ref={el => {
              if (el) terminalRefs.current.set(tab.id, el)
              else terminalRefs.current.delete(tab.id)
            }}
            className="terminal-container"
            style={{ display: tab.id === activeTab ? 'block' : 'none', height: '100%' }}
          />
        ))}
      </div>
    </div>
  )
}