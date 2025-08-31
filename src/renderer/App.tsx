import React, { useState, useEffect, useCallback } from 'react'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { ToolRegistry } from './components/ToolRegistry'
import { ToolPanel } from './components/ToolPanel'
import { ActivityBar } from './components/ActivityBar'
import { SidePanel } from './components/SidePanel'
import { TerminalPanel } from './components/TerminalPanel'
import { AssistantPanel } from './components/AssistantPanel'
import { KnowledgePanel } from './components/KnowledgePanel'
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
  const [selectedKnowledgeFile, setSelectedKnowledgeFile] = useState<string | null>(null)
  const { visibility, sizes, togglePanel, setPanelSize, showPanel, hidePanel } = usePanelContext()

  useEffect(() => {
    // Initialize tool registry
    const registry = ToolRegistry.getInstance()
    
    // Only register tools if not already registered
    if (!registry.getTool('subnet-calculator')) {
      registry.register('subnet-calculator', {
        name: 'Subnet Calculator',
        description: 'Calculate network addresses, broadcast addresses, and host ranges',
        icon: '🌐',
        category: 'networking'
      })
    }

    if (!registry.getTool('vlsm-calculator')) {
      registry.register('vlsm-calculator', {
        name: 'VLSM Calculator',
        description: 'Variable Length Subnet Mask calculator for efficient IP allocation',
        icon: '📊',
        category: 'networking'
      })
    }

    if (!registry.getTool('ping-tool')) {
      registry.register('ping-tool', {
        name: 'Ping Tool',
        description: 'Test network connectivity to hosts',
        icon: '📡',
        category: 'diagnostics'
      })
    }

    if (!registry.getTool('port-scanner')) {
      registry.register('port-scanner', {
        name: 'Port Scanner',
        description: 'Scan for open ports on target hosts',
        icon: '🔍',
        category: 'security'
      })
    }

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
    if (!newSizes) return
    
    // Save size whenever it changes (even if panel is being hidden)
    if (newSizes[0] !== undefined && newSizes[0] > 0) {
      setPanelSize('sidePanel', newSizes[0])
    }
  }, [setPanelSize])

  const handleTerminalSizeChange = useCallback((newSizes: number[] | undefined) => {
    if (!newSizes) return
    
    // For vertical split, save the terminal size (second pane)
    if (visibility.terminal && newSizes.length > 1 && newSizes[1] !== undefined) {
      setPanelSize('terminal', newSizes[1])
    }
  }, [setPanelSize, visibility.terminal])

  const handleAssistantSizeChange = useCallback((newSizes: number[] | undefined) => {
    if (!newSizes) return
    
    // For horizontal split, save the assistant size (second pane)
    if (visibility.assistant && newSizes.length > 1 && newSizes[1] !== undefined) {
      setPanelSize('assistant', newSizes[1])
    }
  }, [setPanelSize, visibility.assistant])

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
          <Allotment.Pane 
            minSize={visibility.sidePanel ? 180 : 0} 
            maxSize={visibility.sidePanel ? 600 : 0}
            preferredSize={visibility.sidePanel ? sizes.sidePanel : 0}
            snap={false}
          >
            <div style={{ display: visibility.sidePanel ? 'block' : 'none', height: '100%' }}>
              <SidePanel
                activity={selectedActivity}
                tools={registeredTools}
                onToolSelect={handleToolSelect}
                activeTool={activeTool}
                onFileSelect={setSelectedKnowledgeFile}
                selectedFile={selectedKnowledgeFile || undefined}
              />
            </div>
          </Allotment.Pane>
          
          <Allotment.Pane>
            <Allotment 
              vertical
              className="main-vertical-split"
              onChange={handleTerminalSizeChange}
            >
              <Allotment.Pane>
                <Allotment 
                  className="editor-horizontal-split"
                  onChange={handleAssistantSizeChange}
                >
                  <Allotment.Pane>
                    <div className="editor-area">
                      {selectedActivity === 'knowledge' ? (
                        <KnowledgePanel selectedFile={selectedKnowledgeFile} />
                      ) : activeTool ? (
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
              
              {visibility.terminal && (
                <Allotment.Pane 
                  minSize={150} 
                  maxSize={600}
                  preferredSize={sizes.terminal}
                >
                  <TerminalPanel />
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