import React from 'react'
import './HomePage.css'

interface HomePageProps {
  onNavigateToTool?: (toolId: string) => void
  onNavigateToKnowledge?: (file?: string) => void
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToTool, onNavigateToKnowledge }) => {
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
      icon: '🔀',
      action: () => onNavigateToTool?.('bgp-route-server')
    },
    { 
      title: 'Subnet Calculator', 
      description: 'Calculate network addresses and CIDR ranges',
      icon: '🌐',
      action: () => onNavigateToTool?.('subnet-calculator')
    },
    { 
      title: 'VLSM Calculator', 
      description: 'Variable Length Subnet Mask optimization',
      icon: '📊',
      action: () => onNavigateToTool?.('vlsm-calculator')
    },
    { 
      title: 'Knowledge Base', 
      description: 'Browse documentation and tutorials',
      icon: '📚',
      action: () => onNavigateToKnowledge?.()
    }
  ]

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
            📖 Read START HERE Tutorial
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={action.action}>
              <div className="action-icon">{action.icon}</div>
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
            <h3>🌍 Global BGP Analysis & Diagnostics</h3>
            <p>Connect to Hurricane Electric route servers worldwide. Run traceroute, ping, and BGP queries from 20+ global locations</p>
          </div>
          <div className="feature-item">
            <h3>🛠️ Network Planning Tools</h3>
            <p>Subnet calculator for CIDR planning and VLSM calculator for efficient IP address allocation</p>
          </div>
          <div className="feature-item">
            <h3>💻 Integrated Terminal</h3>
            <p>Full terminal access with support for your system's default shell for advanced operations</p>
          </div>
          <div className="feature-item">
            <h3>📚 Knowledge Base</h3>
            <p>Built-in documentation viewer and editor with Markdown support and comprehensive tutorials</p>
          </div>
        </div>
      </div>

      <div className="keyboard-shortcuts-preview">
        <h2>Essential Keyboard Shortcuts</h2>
        <div className="shortcuts-grid">
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>B</kbd>
            <span>Toggle Sidebar</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>`</kbd>
            <span>Toggle Terminal</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
            <span>Toggle AI Assistant</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>,</kbd>
            <span>Open Settings</span>
          </div>
        </div>
      </div>

      <div className="footer-info">
        <p>Version 1.0.0 | Built with Electron & React</p>
        <p>© 2024 Network Tools Hub by Giovanny Guarin</p>
      </div>
    </div>
  )
}