import React, { useState } from 'react'
import { Tool } from '../App'
import { KnowledgeExplorer } from './KnowledgeExplorer'
import './SidePanel.css'

interface SidePanelProps {
  activity: string
  tools: Tool[]
  onToolSelect: (toolId: string) => void
  activeTool: string | null
  onFileSelect?: (path: string) => void
  selectedFile?: string
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  activity, 
  tools, 
  onToolSelect,
  activeTool,
  onFileSelect,
  selectedFile
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['networking', 'diagnostics', 'security']))

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  // Filter tools based on search
  const filteredTools = searchQuery
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const renderToolsPanel = () => (
    <>
      <div className="side-panel-header">
        <h3>Network Tools</h3>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tools-tree">
        {searchQuery ? (
          // Show filtered results
          <div className="search-results">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className={`tool-item ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => onToolSelect(tool.id)}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </div>
            ))}
            {filteredTools.length === 0 && (
              <div className="no-results">No tools found</div>
            )}
          </div>
        ) : (
          // Show categorized view
          Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <div key={category} className="category-group">
              <div 
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                <span className="category-arrow">
                  {expandedCategories.has(category) ? '▼' : '▶'}
                </span>
                <span className="category-name">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                <span className="category-count">{categoryTools.length}</span>
              </div>
              
              {expandedCategories.has(category) && (
                <div className="category-tools">
                  {categoryTools.map(tool => (
                    <div
                      key={tool.id}
                      className={`tool-item ${activeTool === tool.id ? 'active' : ''}`}
                      onClick={() => onToolSelect(tool.id)}
                      title={tool.description}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <span className="tool-name">{tool.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )

  const renderKnowledgePanel = () => {
    if (!onFileSelect) return null
    return (
      <KnowledgeExplorer 
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
      />
    )
  }

  const renderTerminalPanel = () => (
    <>
      <div className="side-panel-header">
        <h3>Terminal Sessions</h3>
      </div>
      <div className="terminal-list">
        <p>Terminal integration coming soon...</p>
      </div>
    </>
  )

  const renderAssistantPanel = () => (
    <>
      <div className="side-panel-header">
        <h3>AI Assistant</h3>
      </div>
      <div className="assistant-chat">
        <p>AI Assistant coming soon...</p>
      </div>
    </>
  )

  const renderSettingsPanel = () => (
    <>
      <div className="side-panel-header">
        <h3>Settings</h3>
      </div>
      <div className="settings-list">
        <p>Settings coming soon...</p>
      </div>
    </>
  )

  const renderContent = () => {
    switch (activity) {
      case 'tools':
        return renderToolsPanel()
      case 'knowledge':
        return renderKnowledgePanel()
      case 'terminal':
        return renderTerminalPanel()
      case 'assistant':
        return renderAssistantPanel()
      case 'settings':
        return renderSettingsPanel()
      default:
        return renderToolsPanel()
    }
  }

  return (
    <div className="side-panel">
      {renderContent()}
    </div>
  )
}