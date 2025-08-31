import React, { useState, useEffect, useCallback } from 'react'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { ToolRegistry } from './components/ToolRegistry'
import { ToolPanel } from './components/ToolPanel'
import { TitleBar } from './components/TitleBar'
import { ActivityBar } from './components/ActivityBar'
import { SidePanel } from './components/SidePanel'
import { TerminalPanel } from './components/TerminalPanel'
import { AssistantPanel } from './components/AssistantPanel'
import { KnowledgePanel } from './components/KnowledgePanel'
import { Settings } from './components/Settings'
import { HomePage } from './components/HomePage'
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
  const [selectedActivity, setSelectedActivity] = useState<string>('home')
  const [selectedKnowledgeFile, setSelectedKnowledgeFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHome, setShowHome] = useState(true)
  const { visibility, sizes, togglePanel, setPanelSize, showPanel, hidePanel } = usePanelContext()

  useEffect(() => {
    // Load and apply initial theme
    const loadInitialSettings = async () => {
      try {
        const settings = await window.electronAPI.loadSettings()
        const theme = settings.appearance?.theme || 'dark'
        document.documentElement.setAttribute('data-theme', theme)
        
        if (settings.appearance?.fontSize) {
          document.documentElement.style.setProperty('--base-font-size', `${settings.appearance.fontSize}px`)
        }
      } catch (error) {
        console.error('Failed to load initial settings:', error)
        document.documentElement.setAttribute('data-theme', 'dark')
      }
    }
    loadInitialSettings()

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

    if (!registry.getTool('bgp-route-server')) {
      registry.register('bgp-route-server', {
        name: 'BGP Route Server',
        description: 'Connect to route servers for traceroute and BGP queries',
        icon: '🔀',
        category: 'networking'
      })
    }

    // Update registered tools state
    setRegisteredTools(registry.getAllTools())
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = window.electronAPI.platform === 'darwin'
      const modKey = isMac ? e.metaKey : e.ctrlKey
      
      // Cmd+B (Mac) or Ctrl+B (Windows/Linux) to toggle tools sidebar
      if (modKey && e.key === 'b') {
        e.preventDefault()
        if (selectedActivity === 'tools' && visibility.sidePanel) {
          hidePanel('sidePanel')
        } else {
          setSelectedActivity('tools')
          setShowHome(false)
          showPanel('sidePanel')
        }
      }
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle knowledge base
      if (modKey && e.key === 'k') {
        e.preventDefault()
        if (selectedActivity === 'knowledge' && visibility.sidePanel) {
          hidePanel('sidePanel')
        } else {
          setSelectedActivity('knowledge')
          setShowHome(false)
          showPanel('sidePanel')
        }
      }
      // Cmd+T (Mac) or Ctrl+T (Windows/Linux) to toggle terminal
      // Also try Cmd+` as a fallback
      if (modKey && e.key === 't') {
        e.preventDefault()
        togglePanel('terminal')
      }
      // Alternative: Cmd+` (Mac) or Ctrl+` (Windows/Linux) 
      if ((modKey && e.code === 'Backquote') || 
          (modKey && e.key === '`')) {
        e.preventDefault()
        togglePanel('terminal')
      }
      // Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows/Linux) to toggle AI assistant
      if (modKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        togglePanel('assistant')
      }
      // Cmd+, (Mac) or Ctrl+, (Windows/Linux) to toggle settings
      if (modKey && e.key === ',') {
        e.preventDefault()
        if (showSettings) {
          setShowSettings(false)
          setShowHome(true)
        } else {
          setShowSettings(true)
          setShowHome(false)
        }
      }
      // Escape to close settings
      if (e.key === 'Escape' && showSettings) {
        e.preventDefault()
        setShowSettings(false)
        setShowHome(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel, showSettings, selectedActivity, visibility.sidePanel, showPanel, hidePanel])

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
    setShowHome(false)
  }

  const handleActivitySelect = (activity: string) => {
    if (activity === 'settings') {
      setShowSettings(prev => !prev)  // Toggle settings instead of always showing
      setShowHome(false)
    } else if (activity === 'home') {
      setShowHome(true)
      setActiveTool(null)
      setSelectedActivity('home')
      setShowSettings(false)  // Close settings when switching to home
      hidePanel('sidePanel')
    } else if (activity === 'tools' || activity === 'knowledge') {
      // For tools and knowledge, toggle the sidebar
      setSelectedActivity(activity)
      setShowHome(false)
      setShowSettings(false)  // Close settings when switching activities
      if (activity === 'tools') {
        // Reset to show tool list when switching to tools
        setActiveTool(null)
      }
      if (!visibility.sidePanel) {
        showPanel('sidePanel')
      }
    } else {
      setSelectedActivity(activity)
      setShowHome(false)
      setShowSettings(false)  // Close settings when switching activities
      if (!visibility.sidePanel) {
        togglePanel('sidePanel')
      }
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
    <div className="app-with-titlebar">
      <TitleBar />
      <div className="app">
        <ActivityBar 
          selectedActivity={selectedActivity}
          onActivitySelect={handleActivitySelect}
          onToggleSidebar={() => togglePanel('sidePanel')}
          onToggleTerminal={() => togglePanel('terminal')}
          onToggleAssistant={() => togglePanel('assistant')}
          onOpenTool={(toolId) => {
            setActiveTool(toolId)
            setShowHome(false)
            setSelectedActivity('tools')
            if (!visibility.sidePanel) {
              showPanel('sidePanel')
            }
          }}
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
                onCreateNewDocument={async () => {
                  // Check if vault is configured first
                  try {
                    const settings = await window.electronAPI.loadSettings()
                    if (!settings.vaultPath) {
                      // Vault not configured, the KnowledgePanel will handle showing the setup dialog
                    }
                  } catch (error) {
                    console.error('Error checking vault configuration:', error)
                  }
                  
                  // Immediately switch to new document
                  setSelectedKnowledgeFile('__new__')
                  setSelectedActivity('knowledge')
                  setShowHome(false)
                  setShowSettings(false)
                  setActiveTool(null)
                }}
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
                      {showHome ? (
                        <HomePage 
                          onNavigateToTool={(toolId) => {
                            setActiveTool(toolId)
                            setShowHome(false)
                            setSelectedActivity('tools')
                            if (!visibility.sidePanel) {
                              showPanel('sidePanel')
                            }
                          }}
                          onNavigateToKnowledge={(file) => {
                            setSelectedActivity('knowledge')
                            setShowHome(false)
                            if (file) {
                              setSelectedKnowledgeFile(file)
                            }
                            if (!visibility.sidePanel) {
                              showPanel('sidePanel')
                            }
                          }}
                        />
                      ) : showSettings ? (
                        <Settings onClose={() => {
                          setShowSettings(false)
                          setShowHome(true)
                        }} />
                      ) : selectedActivity === 'knowledge' ? (
                        <KnowledgePanel 
                          selectedFile={selectedKnowledgeFile}
                          onFileSelect={setSelectedKnowledgeFile}
                        />
                      ) : activeTool ? (
                        <ToolPanel toolId={activeTool} />
                      ) : (
                        <HomePage 
                          onNavigateToTool={(toolId) => {
                            setActiveTool(toolId)
                            setShowHome(false)
                            setSelectedActivity('tools')
                            if (!visibility.sidePanel) {
                              showPanel('sidePanel')
                            }
                          }}
                          onNavigateToKnowledge={(file) => {
                            setSelectedActivity('knowledge')
                            setShowHome(false)
                            if (file) {
                              setSelectedKnowledgeFile(file)
                            }
                            if (!visibility.sidePanel) {
                              showPanel('sidePanel')
                            }
                          }}
                        />
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