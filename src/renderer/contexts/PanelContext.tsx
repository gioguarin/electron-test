import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PanelSizes {
  sidePanel: number
  terminal: number
  assistant: number
}

interface PanelVisibility {
  sidePanel: boolean
  terminal: boolean
  assistant: boolean
}

interface PanelContextType {
  visibility: PanelVisibility
  sizes: PanelSizes
  togglePanel: (panel: keyof PanelVisibility) => void
  setPanelSize: (panel: keyof PanelSizes, size: number) => void
  showPanel: (panel: keyof PanelVisibility) => void
  hidePanel: (panel: keyof PanelVisibility) => void
}

const defaultSizes: PanelSizes = {
  sidePanel: 240,
  terminal: 200,
  assistant: 300
}

const defaultVisibility: PanelVisibility = {
  sidePanel: true,
  terminal: false,
  assistant: false
}

const PanelContext = createContext<PanelContextType | undefined>(undefined)

export const usePanelContext = () => {
  const context = useContext(PanelContext)
  if (!context) {
    throw new Error('usePanelContext must be used within a PanelProvider')
  }
  return context
}

interface PanelProviderProps {
  children: ReactNode
}

export const PanelProvider: React.FC<PanelProviderProps> = ({ children }) => {
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const savedSizes = localStorage.getItem('panel-sizes')
      const savedVisibility = localStorage.getItem('panel-visibility')
      
      return {
        sizes: savedSizes ? JSON.parse(savedSizes) : defaultSizes,
        visibility: savedVisibility ? JSON.parse(savedVisibility) : defaultVisibility
      }
    } catch {
      return {
        sizes: defaultSizes,
        visibility: defaultVisibility
      }
    }
  }

  const [state, setState] = useState(() => loadSavedState())

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('panel-sizes', JSON.stringify(state.sizes))
      localStorage.setItem('panel-visibility', JSON.stringify(state.visibility))
    } catch (error) {
      console.error('Failed to save panel state:', error)
    }
  }, [state])

  const togglePanel = (panel: keyof PanelVisibility) => {
    setState(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [panel]: !prev.visibility[panel]
      }
    }))
  }

  const showPanel = (panel: keyof PanelVisibility) => {
    setState(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [panel]: true
      }
    }))
  }

  const hidePanel = (panel: keyof PanelVisibility) => {
    setState(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [panel]: false
      }
    }))
  }

  const setPanelSize = (panel: keyof PanelSizes, size: number) => {
    setState(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [panel]: size
      }
    }))
  }

  const value: PanelContextType = {
    visibility: state.visibility,
    sizes: state.sizes,
    togglePanel,
    setPanelSize,
    showPanel,
    hidePanel
  }

  return (
    <PanelContext.Provider value={value}>
      {children}
    </PanelContext.Provider>
  )
}