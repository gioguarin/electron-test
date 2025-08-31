import React from 'react'
import './ActivityBar.css'

interface ActivityBarProps {
  selectedActivity: string
  onActivitySelect: (activity: string) => void
}

interface Activity {
  id: string
  icon: string
  title: string
}

const activities: Activity[] = [
  { id: 'tools', icon: '🔧', title: 'Network Tools' },
  { id: 'knowledge', icon: '📚', title: 'Knowledge Base' },
  { id: 'terminal', icon: '💻', title: 'Terminal' },
  { id: 'assistant', icon: '🤖', title: 'AI Assistant' },
  { id: 'settings', icon: '⚙️', title: 'Settings' }
]

export const ActivityBar: React.FC<ActivityBarProps> = ({ 
  selectedActivity, 
  onActivitySelect 
}) => {
  return (
    <div className="activity-bar">
      <div className="activity-bar-items">
        {activities.map(activity => (
          <button
            key={activity.id}
            className={`activity-item ${selectedActivity === activity.id ? 'active' : ''}`}
            onClick={() => onActivitySelect(activity.id)}
            title={activity.title}
          >
            <span className="activity-icon">{activity.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}