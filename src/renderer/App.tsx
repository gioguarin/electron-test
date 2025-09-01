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
import { NavigationBar } from './components/NavigationBar'
import { PanelProvider, usePanelContext } from './contexts/PanelContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
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
  const { pushEntry, goBack, goForward } = useNavigation()

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
        icon: 'network',
        category: 'networking'
      })
    }

    if (!registry.getTool('bgp-route-server')) {
      registry.register('bgp-route-server', {
        name: 'BGP Route Server',
        description: 'Connect to route servers for traceroute and BGP queries',
        icon: 'route',
        category: 'networking'
      })
    }

    // Update registered tools state
    setRegisteredTools(registry.getAllTools())
  }, [])

  // Track navigation history
  useEffect(() => {
    // Add initial home entry
    if (showHome) {
      pushEntry({ type: 'home', title: 'Home' })
    }
  }, []) // Only on mount
  
  // Track navigation changes
  useEffect(() => {
    if (showSettings) {
      pushEntry({ type: 'settings', title: 'Settings' })
    } else if (showHome) {
      pushEntry({ type: 'home', title: 'Home' })
    } else if (selectedActivity === 'knowledge' && selectedKnowledgeFile) {
      const fileName = selectedKnowledgeFile.split('/').pop() || 'Document'
      pushEntry({ type: 'knowledge', id: selectedKnowledgeFile, title: fileName })
    } else if (activeTool) {
      const tool = registeredTools.find(t => t.id === activeTool)
      pushEntry({ type: 'tool', id: activeTool, title: tool?.name || 'Tool' })
    }
  }, [showSettings, showHome, selectedActivity, selectedKnowledgeFile, activeTool])
  
  // Handle navigation from history
  const handleNavigation = useCallback((entry: any) => {
    switch (entry.type) {
      case 'home':
        setShowHome(true)
        setShowSettings(false)
        setActiveTool(null)
        setSelectedActivity('home')
        break
      case 'settings':
        setShowSettings(true)
        setShowHome(false)
        break
      case 'tool':
        setActiveTool(entry.id)
        setShowHome(false)
        setShowSettings(false)
        setSelectedActivity('tools')
        if (!visibility.sidePanel) {
          showPanel('sidePanel')
        }
        break
      case 'knowledge':
        setSelectedKnowledgeFile(entry.id)
        setSelectedActivity('knowledge')
        setShowHome(false)
        setShowSettings(false)
        if (!visibility.sidePanel) {
          showPanel('sidePanel')
        }
        break
    }
  }, [visibility.sidePanel, showPanel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = window.electronAPI.platform === 'darwin'
      const modKey = isMac ? e.metaKey : e.ctrlKey
      
      // Navigation shortcuts - Alt+Arrow or Cmd/Ctrl+Arrow
      if ((e.altKey || modKey) && e.key === 'ArrowLeft') {
        e.preventDefault()
        const entry = goBack()
        if (entry) {
          handleNavigation(entry)
        }
      }
      if ((e.altKey || modKey) && e.key === 'ArrowRight') {
        e.preventDefault()
        const entry = goForward()
        if (entry) {
          handleNavigation(entry)
        }
      }
      
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
  }, [togglePanel, showSettings, selectedActivity, visibility.sidePanel, showPanel, hidePanel, goBack, goForward, handleNavigation])

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
                      <NavigationBar onNavigate={handleNavigation} />
                      <div className="editor-content">
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
                            // Navigate to knowledge section
                            setSelectedActivity('knowledge')
                            setShowHome(false)
                            
                            // Set the file path properly for public docs
                            if (file) {
                              if (file === 'START_HERE.md' || file === 'README.md') {
                                // These are public docs in the docs folder
                                setSelectedKnowledgeFile(`docs/${file}`)
                              } else {
                                setSelectedKnowledgeFile(file)
                              }
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
                            // Navigate to knowledge section
                            setSelectedActivity('knowledge')
                            setShowHome(false)
                            
                            // Set the file path properly for public docs
                            if (file) {
                              if (file === 'START_HERE.md' || file === 'README.md') {
                                // These are public docs in the docs folder
                                setSelectedKnowledgeFile(`docs/${file}`)
                              } else {
                                setSelectedKnowledgeFile(file)
                              }
                            }
                            
                            if (!visibility.sidePanel) {
                              showPanel('sidePanel')
                            }
                          }}
                        />
                      )}
                      </div>
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
    <NavigationProvider>
      <PanelProvider>
        <AppContent />
      </PanelProvider>
    </NavigationProvider>
  )
}