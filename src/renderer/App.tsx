import React, { useState, useEffect, useCallback } from 'react'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { ToolRegistry } from './components/ToolRegistry'
import { ToolPanel } from './components/ToolPanel'
import { ActivityBar } from './components/ActivityBar'
import { SidePanel } from './components/SidePanel'
import { TerminalPanel } from './components/TerminalPanel'
import { AssistantPanel } from './components/AssistantPanel'
import { PanelProvider, usePanelContext } from './contexts/PanelContext'
import './styles/App.css'
import './styles/Allotment.css'

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

const AppContent: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [registeredTools, setRegisteredTools] = useState<Tool[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string>('tools')
  const { visibility, sizes, togglePanel, setPanelSize } = usePanelContext()

  useEffect(() => {
    // Initialize tool registry
    const registry = ToolRegistry.getInstance()
    
    // Register available tools
    registry.register('subnet-calculator', {
      name: 'Subnet Calculator',
      description: 'Calculate network addresses, broadcast addresses, and host ranges',
      icon: '🌐',
      category: 'networking'
    })

    registry.register('vlsm-calculator', {
      name: 'VLSM Calculator',
      description: 'Variable Length Subnet Mask calculator for efficient IP allocation',
      icon: '📊',
      category: 'networking'
    })

    registry.register('ping-tool', {
      name: 'Ping Tool',
      description: 'Test network connectivity to hosts',
      icon: '📡',
      category: 'diagnostics'
    })

    registry.register('port-scanner', {
      name: 'Port Scanner',
      description: 'Scan for open ports on target hosts',
      icon: '🔍',
      category: 'security'
    })

    // Update registered tools state
    setRegisteredTools(registry.getAllTools())
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B or Cmd+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        togglePanel('sidePanel')
      }
      // Ctrl+` to toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        togglePanel('terminal')
      }
      // Ctrl+Shift+A to toggle AI assistant
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        togglePanel('assistant')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
  }

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity)
    if (!visibility.sidePanel) {
      togglePanel('sidePanel')
    }
  }

  const handleSidePanelSizeChange = useCallback((newSizes: number[] | undefined) => {
    if (newSizes && newSizes[0]) {
      setPanelSize('sidePanel', newSizes[0])
    }
  }, [setPanelSize])

  const handleTerminalSizeChange = useCallback((newSizes: number[] | undefined) => {
    if (newSizes && newSizes[1]) {
      setPanelSize('terminal', newSizes[1])
    }
  }, [setPanelSize])

  const handleAssistantSizeChange = useCallback((newSizes: number[] | undefined) => {
    if (newSizes && newSizes[1]) {
      setPanelSize('assistant', newSizes[1])
    }
  }, [setPanelSize])

  return (
    <div className="app">
      <ActivityBar 
        selectedActivity={selectedActivity}
        onActivitySelect={handleActivitySelect}
        onToggleSidebar={() => togglePanel('sidePanel')}
        onToggleTerminal={() => togglePanel('terminal')}
        onToggleAssistant={() => togglePanel('assistant')}
      />
      
      <div className="app-main">
        <Allotment 
          className="main-horizontal-split"
          onChange={handleSidePanelSizeChange}
        >
          {visibility.sidePanel && (
            <Allotment.Pane 
              minSize={200} 
              maxSize={600}
              preferredSize={sizes.sidePanel}
            >
              <SidePanel
                activity={selectedActivity}
                tools={registeredTools}
                onToolSelect={handleToolSelect}
                activeTool={activeTool}
              />
            </Allotment.Pane>
          )}
          
          <Allotment.Pane>
            <Allotment 
              vertical
              className="editor-vertical-split"
              onChange={handleAssistantSizeChange}
            >
              <Allotment.Pane>
                <Allotment 
                  vertical
                  className="terminal-vertical-split"
                  onChange={handleTerminalSizeChange}
                >
                  <Allotment.Pane>
                    <div className="editor-area">
                      {activeTool ? (
                        <ToolPanel toolId={activeTool} />
                      ) : (
                        <div className="welcome-screen">
                          <h1>Network Tools Hub</h1>
                          <p>Select a tool from the sidebar to get started</p>
                          <div className="keyboard-shortcuts">
                            <h3>Keyboard Shortcuts</h3>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd> + <kbd>B</kbd>
                              <span>Toggle Sidebar</span>
                            </div>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd> + <kbd>`</kbd>
                              <span>Toggle Terminal</span>
                            </div>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
                              <span>Toggle AI Assistant</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Allotment.Pane>
                  
                  {visibility.terminal && (
                    <Allotment.Pane 
                      minSize={100} 
                      maxSize={600}
                      preferredSize={sizes.terminal}
                    >
                      <TerminalPanel />
                    </Allotment.Pane>
                  )}
                </Allotment>
              </Allotment.Pane>
              
              {visibility.assistant && (
                <Allotment.Pane 
                  minSize={250} 
                  maxSize={600}
                  preferredSize={sizes.assistant}
                >
                  <AssistantPanel />
                </Allotment.Pane>
              )}
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <PanelProvider>
      <AppContent />
    </PanelProvider>
  )
}