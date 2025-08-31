import React from 'react'
import { useNavigation } from '../contexts/NavigationContext'
import './NavigationBar.css'

interface NavigationBarProps {
  onNavigate: (entry: any) => void
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate }) => {
  const { canGoBack, canGoForward, goBack, goForward, history, currentIndex } = useNavigation()
  
  // Detect platform for shortcuts
  const isMac = (window as any).electronAPI?.platform === 'darwin'
  const modKey = isMac ? 'Cmd' : 'Ctrl'
  
  const handleBack = () => {
    const entry = goBack()
    if (entry) {
      onNavigate(entry)
    }
  }
  
  const handleForward = () => {
    const entry = goForward()
    if (entry) {
      onNavigate(entry)
    }
  }
  
  // Get current location for display
  const currentEntry = history[currentIndex]
  const currentTitle = currentEntry?.title || 'Home'
  
  return (
    <div className="navigation-bar">
      <div className="nav-controls">
        <button 
          className="nav-button"
          onClick={handleBack}
          disabled={!canGoBack}
          title={`Go back (${modKey}+Left or Alt+Left)`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 13l-5-5 5-5v10z"/>
          </svg>
        </button>
        <button 
          className="nav-button"
          onClick={handleForward}
          disabled={!canGoForward}
          title={`Go forward (${modKey}+Right or Alt+Right)`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3l5 5-5 5V3z"/>
          </svg>
        </button>
      </div>
      <div className="nav-breadcrumb">
        <span className="breadcrumb-item">{currentTitle}</span>
      </div>
    </div>
  )
}