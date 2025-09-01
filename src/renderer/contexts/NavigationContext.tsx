import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface NavigationEntry {
  type: 'home' | 'tool' | 'knowledge' | 'settings'
  id?: string // Tool ID or file path
  title: string
  timestamp: number
}

interface NavigationContextType {
  history: NavigationEntry[]
  currentIndex: number
  canGoBack: boolean
  canGoForward: boolean
  pushEntry: (entry: Omit<NavigationEntry, 'timestamp'>) => void
  goBack: () => NavigationEntry | null
  goForward: () => NavigationEntry | null
  clearHistory: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

interface NavigationProviderProps {
  children: ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<NavigationEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const pushEntry = useCallback((entry: Omit<NavigationEntry, 'timestamp'>) => {
    const newEntry: NavigationEntry = {
      ...entry,
      timestamp: Date.now()
    }
    
    setHistory(prev => {
      // If we're not at the end of history, remove everything after current index
      const newHistory = currentIndex < prev.length - 1 
        ? prev.slice(0, currentIndex + 1)
        : [...prev]
      
      // Don't add duplicate consecutive entries
      const lastEntry = newHistory[newHistory.length - 1]
      if (lastEntry && lastEntry.type === newEntry.type && lastEntry.id === newEntry.id) {
        return newHistory
      }
      
      // Add new entry and limit history to 50 items
      const updatedHistory = [...newHistory, newEntry]
      if (updatedHistory.length > 50) {
        updatedHistory.shift()
        setCurrentIndex(updatedHistory.length - 1)
        return updatedHistory
      }
      
      setCurrentIndex(updatedHistory.length - 1)
      return updatedHistory
    })
  }, [currentIndex])

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      return history[newIndex]
    }
    return null
  }, [currentIndex, history])

  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      return history[newIndex]
    }
    return null
  }, [currentIndex, history])

  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  const value: NavigationContextType = {
    history,
    currentIndex,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < history.length - 1,
    pushEntry,
    goBack,
    goForward,
    clearHistory
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}