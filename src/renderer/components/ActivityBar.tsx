import React from 'react'
import './ActivityBar.css'

interface ActivityBarProps {
  selectedActivity: string
  onActivitySelect: (activity: string) => void
  onToggleSidebar?: () => void
  onToggleTerminal?: () => void
  onToggleAssistant?: () => void
}

interface Activity {
  id: string
  icon: string
  title: string
  action?: 'select' | 'toggle'
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ 
  selectedActivity, 
  onActivitySelect,
  onToggleSidebar,
  onToggleTerminal,
  onToggleAssistant
}) => {
  const isMac = (window as any).electronAPI?.platform === 'darwin'
  const modKey = isMac ? 'Cmd' : 'Ctrl'
  
  const topActivities: Activity[] = [
    { id: 'home', icon: '🏠', title: 'Home', action: 'select' },
    { id: 'tools', icon: '🔧', title: `Network Tools (${modKey}+B)`, action: 'toggle' },
    { id: 'knowledge', icon: '📚', title: `Knowledge Base (${modKey}+K)`, action: 'toggle' },
    { id: 'terminal', icon: '💻', title: `Terminal (${modKey}+T)`, action: 'toggle' },
    { id: 'assistant', icon: '🤖', title: `AI Assistant (${modKey}+Shift+A)`, action: 'toggle' }
  ]

  const bottomActivities: Activity[] = [
    { id: 'settings', icon: '⚙️', title: `Settings (${modKey}+,)`, action: 'select' }
  ]

  const handleActivityClick = (activity: Activity) => {
    if (activity.action === 'toggle') {
      // Handle toggle actions for specific panels
      switch (activity.id) {
        case 'terminal':
          onToggleTerminal?.()
          break
        case 'assistant':
          onToggleAssistant?.()
          break
        case 'tools':
        case 'knowledge':
          // Toggle sidebar and set the appropriate activity
          if (selectedActivity === activity.id) {
            onToggleSidebar?.()
          } else {
            onActivitySelect(activity.id)
          }
          break
        default:
          break
      }
    } else {
      // Handle regular activity selection (Home, Settings)
      onActivitySelect(activity.id)
    }
  }

  return (
    <div className="activity-bar">
      <div className="activity-bar-items-top">
        {topActivities.map(activity => (
          <button
            key={activity.id}
            className={`activity-item ${
              activity.action === 'select' && selectedActivity === activity.id ? 'active' : ''
            }`}
            onClick={() => handleActivityClick(activity)}
            title={activity.title}
          >
            <span className="activity-icon">{activity.icon}</span>
          </button>
        ))}
      </div>
      <div className="activity-bar-items-bottom">
        {bottomActivities.map(activity => (
          <button
            key={activity.id}
            className={`activity-item ${
              activity.action === 'select' && selectedActivity === activity.id ? 'active' : ''
            }`}
            onClick={() => handleActivityClick(activity)}
            title={activity.title}
          >
            <span className="activity-icon">{activity.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}