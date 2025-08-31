import React, { useEffect, useRef, useState } from 'react'
import { ToolRegistry } from './ToolRegistry'
import './ToolPanel.css'

interface ToolPanelProps {
  toolId: string
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ toolId }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toolInstanceRef = useRef<any>(null)

  useEffect(() => {
    const loadTool = async () => {
      if (!containerRef.current) return

      setLoading(true)
      setError(null)

      try {
        const registry = ToolRegistry.getInstance()
        
        // Dispose previous tool instance if exists
        if (toolInstanceRef.current) {
          if (typeof toolInstanceRef.current.dispose === 'function') {
            toolInstanceRef.current.dispose()
          }
          toolInstanceRef.current = null
        }

        // Clear container
        containerRef.current.innerHTML = ''

        // Load the appropriate component based on toolId
        let toolComponent = null

        switch (toolId) {
          case 'subnet-calculator':
            // Dynamically import the subnet calculator component
            const { SubnetCalculatorComponent } = await import('./tools/SubnetCalculatorComponent')
            toolComponent = new SubnetCalculatorComponent(containerRef.current)
            break
          
          default:
            // For other tools, show a placeholder
            containerRef.current.innerHTML = `
              <div class="tool-placeholder">
                <h2>${toolId}</h2>
                <p>This tool is not yet implemented in the React version.</p>
                <p>Coming soon!</p>
              </div>
            `
            setLoading(false)
            return
        }

        if (toolComponent) {
          toolInstanceRef.current = toolComponent
          await toolComponent.initialize()
          await toolComponent.render()
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading tool:', err)
        setError(`Failed to load tool: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setLoading(false)
      }
    }

    loadTool()

    // Cleanup on unmount or tool change
    return () => {
      if (toolInstanceRef.current && typeof toolInstanceRef.current.dispose === 'function') {
        toolInstanceRef.current.dispose()
        toolInstanceRef.current = null
      }
    }
  }, [toolId])

  return (
    <div className="tool-panel">
      {loading && (
        <div className="tool-loading">
          <div className="spinner"></div>
          <p>Loading tool...</p>
        </div>
      )}
      
      {error && (
        <div className="tool-error">
          <h3>Error Loading Tool</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="tool-container"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  )
}