import React, { useEffect, useState } from 'react'
import { usePanelContext } from '../contexts/PanelContext'
import './TitleBar.css'

export const TitleBar: React.FC = () => {
  const { visibility, togglePanel } = usePanelContext()
  const [isMacOS, setIsMacOS] = useState(false)

  useEffect(() => {
    // Check if running on macOS
    setIsMacOS(window.electronAPI.platform === 'darwin')
  }, [])

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI.closeWindow()
  }

  return (
    <div className={`title-bar ${isMacOS ? 'macos' : ''}`}>
      {/* Title centered for all platforms */}
      <div className="title-bar-title">Network Tools Hub</div>
      
      {/* Drag region that respects traffic lights on macOS */}
      <div className="title-bar-drag-region" />
      
      <div className="title-bar-controls">
        {/* Layout Controls */}
        <div className="layout-controls">
          <button 
            className={`title-bar-button ${visibility.sidePanel ? 'active' : ''}`}
            onClick={() => togglePanel('sidePanel')}
            title="Toggle Sidebar (Ctrl+B)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="4" height="12" />
              <rect x="6" y="2" width="9" height="12" />
            </svg>
          </button>
          
          <button 
            className={`title-bar-button ${visibility.terminal ? 'active' : ''}`}
            onClick={() => togglePanel('terminal')}
            title="Toggle Terminal (Ctrl+`)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="8" />
              <rect x="1" y="11" width="14" height="3" />
            </svg>
          </button>
          
          <button 
            className={`title-bar-button ${visibility.assistant ? 'active' : ''}`}
            onClick={() => togglePanel('assistant')}
            title="Toggle AI Assistant (Ctrl+Shift+A)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="10" height="12" />
              <rect x="12" y="2" width="3" height="12" />
            </svg>
          </button>
        </div>

        {/* Only show window controls on non-macOS platforms */}
        {!isMacOS && (
          <>
            <div className="window-controls-separator" />

            {/* Window Controls */}
            <div className="window-controls">
              <button 
                className="title-bar-button minimize" 
                onClick={handleMinimize}
                title="Minimize"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M 0 5 L 10 5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
              
              <button 
                className="title-bar-button maximize" 
                onClick={handleMaximize}
                title="Maximize/Restore"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <rect x="0" y="0" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </button>
              
              <button 
                className="title-bar-button close" 
                onClick={handleClose}
                title="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}