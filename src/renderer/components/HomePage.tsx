import React from 'react'
import { RouteIcon, NetworkIcon, BookIcon, TerminalIcon, InfoIcon } from './Icons'
import './HomePage.css'

interface HomePageProps {
  onNavigateToTool?: (toolId: string) => void
  onNavigateToKnowledge?: (file?: string) => void
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToTool, onNavigateToKnowledge }) => {
  const isMac = window.electronAPI.platform === 'darwin'
  const modKey = isMac ? 'Cmd' : 'Ctrl'
  
  const openTutorial = () => {
    // Navigate to Knowledge Base and open START_HERE.md
    if (onNavigateToKnowledge) {
      onNavigateToKnowledge('START_HERE.md')
    }
  }

  const quickActions = [
    { 
      title: 'BGP Route Server', 
      description: 'Connect to global route servers for BGP analysis and network diagnostics',
      icon: 'route',
      action: () => onNavigateToTool?.('bgp-route-server')
    },
    { 
      title: 'Subnet Calculator', 
      description: 'Calculate network addresses and CIDR ranges',
      icon: 'network',
      action: () => onNavigateToTool?.('subnet-calculator')
    },
    { 
      title: 'Knowledge Base', 
      description: 'Browse documentation and tutorials',
      icon: 'book',
      action: () => onNavigateToKnowledge?.()
    },
    { 
      title: 'Terminal', 
      description: 'Access integrated terminal',
      icon: 'terminal',
      action: () => {
        // This will trigger the terminal panel
        const event = new KeyboardEvent('keydown', {
          key: 't',
          metaKey: window.electronAPI.platform === 'darwin',
          ctrlKey: window.electronAPI.platform !== 'darwin'
        })
        window.dispatchEvent(event)
      }
    }
  ]
  
  const renderActionIcon = (iconName: string) => {
    switch(iconName) {
      case 'route': return <RouteIcon size={32} />
      case 'network': return <NetworkIcon size={32} />
      case 'book': return <BookIcon size={32} />
      case 'terminal': return <TerminalIcon size={32} />
      default: return null
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Welcome to Network Tools Hub</h1>
        <p className="tagline">Your comprehensive network diagnostics and BGP analysis toolkit</p>
      </div>

      <div className="getting-started-banner">
        <div className="banner-content">
          <h2>New to Network Tools Hub?</h2>
          <p>Check out our comprehensive guide to get started quickly</p>
          <button className="primary-button" onClick={openTutorial}>
            <BookIcon size={16} /> Read START HERE Tutorial
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={action.action}>
              <div className="action-icon">{renderActionIcon(action.icon)}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="features-overview">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3><NetworkIcon size={20} /> Global BGP Analysis & Diagnostics</h3>
            <p>Connect to Hurricane Electric route servers worldwide. Run traceroute, ping, and BGP queries from 20+ global locations</p>
          </div>
          <div className="feature-item">
            <h3><RouteIcon size={20} /> Network Planning Tools</h3>
            <p>Subnet calculator for comprehensive CIDR planning and IP address management</p>
          </div>
          <div className="feature-item">
            <h3><TerminalIcon size={20} /> Integrated Terminal</h3>
            <p>Full terminal access with support for your system's default shell for advanced operations</p>
          </div>
          <div className="feature-item">
            <h3><BookIcon size={20} /> Knowledge Base</h3>
            <p>Built-in documentation viewer and editor with Markdown support and comprehensive tutorials</p>
          </div>
        </div>
      </div>

      <div className="keyboard-shortcuts-preview">
        <h2>Essential Keyboard Shortcuts</h2>
        <div className="shortcuts-grid">
          <div className="shortcut-item">
            <kbd>{modKey}</kbd> + <kbd>B</kbd>
            <span>Toggle Sidebar</span>
          </div>
          <div className="shortcut-item">
            <kbd>{modKey}</kbd> + <kbd>T</kbd>
            <span>Toggle Terminal</span>
          </div>
          <div className="shortcut-item">
            <kbd>{modKey}</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
            <span>Toggle AI Assistant</span>
          </div>
          <div className="shortcut-item">
            <kbd>{modKey}</kbd> + <kbd>,</kbd>
            <span>Toggle Settings</span>
          </div>
        </div>
      </div>

      <div className="footer-info">
        <p>Version 1.0.0 | Built with Electron & React</p>
        <p>© 2025 Network Tools Hub by Giovanny Guarin</p>
      </div>
    </div>
  )
}