import React from 'react'
import { 
  HomeIcon, 
  ToolsIcon, 
  BookIcon, 
  NetworkIcon, 
  RouteIcon, 
  TerminalIcon, 
  AtomAltIcon, 
  GearIcon 
} from './Icons'
import './ActivityBar.css'

interface ActivityBarProps {
  selectedActivity: string
  onActivitySelect: (activity: string) => void
  onToggleSidebar?: () => void
  onToggleTerminal?: () => void
  onToggleAssistant?: () => void
  onOpenTool?: (toolId: string) => void
}

interface Activity {
  id: string
  icon: string
  title: string
  action?: 'select' | 'toggle' | 'tool'
  toolId?: string
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ 
  selectedActivity, 
  onActivitySelect,
  onToggleSidebar,
  onToggleTerminal,
  onToggleAssistant,
  onOpenTool
}) => {
  const isMac = (window as any).electronAPI?.platform === 'darwin'
  const modKey = isMac ? 'Cmd' : 'Ctrl'
  
  const topActivities: Activity[] = [
    { id: 'home', icon: 'home', title: 'Home', action: 'select' },
    { id: 'tools', icon: 'tools', title: `Network Tools (${modKey}+B)`, action: 'toggle' },
    { id: 'knowledge', icon: 'book', title: `Knowledge Base (${modKey}+K)`, action: 'toggle' },
    { id: 'subnet-calculator', icon: 'network', title: 'Subnet Calculator', action: 'tool', toolId: 'subnet-calculator' },
    { id: 'bgp-route-server', icon: 'route', title: 'BGP Route Server', action: 'tool', toolId: 'bgp-route-server' }
  ]

  const bottomActivities: Activity[] = [
    { id: 'terminal', icon: 'terminal', title: `Terminal (${modKey}+T)`, action: 'toggle' },
    { id: 'assistant', icon: 'atom', title: `AI Assistant (${modKey}+Shift+A)`, action: 'toggle' },
    { id: 'settings', icon: 'gear', title: `Settings (${modKey}+,)`, action: 'select' }
  ]
  
  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'home': return <HomeIcon size={20} />
      case 'tools': return <ToolsIcon size={20} />
      case 'book': return <BookIcon size={20} />
      case 'network': return <NetworkIcon size={20} />
      case 'route': return <RouteIcon size={20} />
      case 'terminal': return <TerminalIcon size={20} />
      case 'atom': return <AtomAltIcon size={20} />
      case 'gear': return <GearIcon size={20} />
      default: return null
    }
  }

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
    } else if (activity.action === 'tool') {
      // Handle direct tool shortcuts
      if (activity.toolId) {
        onOpenTool?.(activity.toolId)
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
            {renderIcon(activity.icon)}
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
            {renderIcon(activity.icon)}
          </button>
        ))}
      </div>
    </div>
  )
}