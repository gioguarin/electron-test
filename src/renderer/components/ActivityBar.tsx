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
  const topActivities: Activity[] = [
    { id: 'home', icon: '🏠', title: 'Home', action: 'select' },
    { id: 'tools', icon: '🔧', title: 'Network Tools (Ctrl+B)', action: 'select' },
    { id: 'knowledge', icon: '📚', title: 'Knowledge Base', action: 'select' },
    { id: 'terminal', icon: '💻', title: 'Terminal (Ctrl+`)', action: 'toggle' },
    { id: 'assistant', icon: '🤖', title: 'AI Assistant (Ctrl+Shift+A)', action: 'toggle' }
  ]

  const bottomActivities: Activity[] = [
    { id: 'settings', icon: '⚙️', title: 'Settings', action: 'select' }
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
        default:
          break
      }
    } else {
      // Handle regular activity selection
      if (activity.id === 'tools' && selectedActivity === 'tools') {
        // If already on tools, toggle the sidebar
        onToggleSidebar?.()
      } else {
        onActivitySelect(activity.id)
      }
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