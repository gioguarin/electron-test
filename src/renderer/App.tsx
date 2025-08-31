import React, { useState, useEffect } from 'react'
import { ToolRegistry } from './components/ToolRegistry'
import { ToolPanel } from './components/ToolPanel'
import { ActivityBar } from './components/ActivityBar'
import { SidePanel } from './components/SidePanel'
import './styles/App.css'

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [sidePanelVisible, setSidePanelVisible] = useState(true)
  const [registeredTools, setRegisteredTools] = useState<Tool[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string>('tools')

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

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
  }

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity)
    setSidePanelVisible(true)
  }

  const toggleSidePanel = () => {
    setSidePanelVisible(!sidePanelVisible)
  }

  return (
    <div className="app">
      <ActivityBar 
        selectedActivity={selectedActivity}
        onActivitySelect={handleActivitySelect}
      />
      
      {sidePanelVisible && (
        <SidePanel
          activity={selectedActivity}
          tools={registeredTools}
          onToolSelect={handleToolSelect}
          activeTool={activeTool}
        />
      )}
      
      <div className="main-content">
        {activeTool ? (
          <ToolPanel toolId={activeTool} />
        ) : (
          <div className="welcome-screen">
            <h1>Network Tools Hub</h1>
            <p>Select a tool from the sidebar to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}