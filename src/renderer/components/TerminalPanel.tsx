import React, { useState } from 'react'
import '../styles/TerminalPanel.css'

interface TerminalTab {
  id: string
  name: string
  content: string[]
}

export const TerminalPanel: React.FC = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'terminal-1',
      name: 'Terminal',
      content: [
        'Network Tools Hub Terminal v1.0.0',
        'Type "help" for available commands',
        ''
      ]
    }
  ])
  const [activeTab, setActiveTab] = useState('terminal-1')
  const [currentCommand, setCurrentCommand] = useState('')

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    const activeTabData = tabs.find(t => t.id === activeTab)
    if (!activeTabData) return

    const updatedTabs = tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          content: [
            ...tab.content,
            `$ ${currentCommand}`,
            `Command "${currentCommand}" is not yet implemented`,
            ''
          ]
        }
      }
      return tab
    })

    setTabs(updatedTabs)
    setCurrentCommand('')
  }

  const addNewTab = () => {
    const newTabId = `terminal-${tabs.length + 1}`
    const newTab: TerminalTab = {
      id: newTabId,
      name: `Terminal ${tabs.length + 1}`,
      content: [
        'Network Tools Hub Terminal v1.0.0',
        'Type "help" for available commands',
        ''
      ]
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTabId)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return // Don't close the last tab
    
    const filteredTabs = tabs.filter(t => t.id !== tabId)
    setTabs(filteredTabs)
    
    if (activeTab === tabId) {
      setActiveTab(filteredTabs[0].id)
    }
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

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
          <button className="terminal-tab-add" onClick={addNewTab}>
            +
          </button>
        </div>
        <div className="terminal-actions">
          <button className="terminal-action" title="Clear Terminal">
            <span>Clear</span>
          </button>
          <button className="terminal-action" title="Split Terminal">
            <span>Split</span>
          </button>
          <button className="terminal-action" title="Kill Terminal">
            <span>Kill</span>
          </button>
        </div>
      </div>
      
      <div className="terminal-content">
        <div className="terminal-output">
          {activeTabData?.content.map((line, index) => (
            <div key={index} className="terminal-line">
              {line}
            </div>
          ))}
        </div>
        
        <form className="terminal-input-container" onSubmit={handleCommandSubmit}>
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            className="terminal-input"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            placeholder="Enter command..."
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}