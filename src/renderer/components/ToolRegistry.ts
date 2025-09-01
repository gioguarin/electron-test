/**
 * Tool Registry - Manages registration and instantiation of tool components
 * TypeScript version with singleton pattern
 */

export interface ToolConfig {
  name: string
  description: string
  icon: string
  category: string
  component?: any // Tool component class (optional for placeholders)
  metadata?: Record<string, any>
}

export interface RegisteredTool extends ToolConfig {
  id: string
}

export class ToolRegistry {
  private static instance: ToolRegistry
  private tools: Map<string, RegisteredTool> = new Map()
  private instances: Map<string, any> = new Map()

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of ToolRegistry
   */
  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry()
    }
    return ToolRegistry.instance
  }

  /**
   * Register a tool
   */
  register(id: string, config: ToolConfig): void {
    if (this.tools.has(id)) {
      console.warn(`Tool ${id} is already registered`)
      return
    }

    this.tools.set(id, {
      id,
      ...config
    })

    console.log(`Registered tool: ${id}`)
  }

  /**
   * Unregister a tool
   */
  unregister(id: string): void {
    // Dispose instance if exists
    if (this.instances.has(id)) {
      this.disposeInstance(id)
    }
    
    this.tools.delete(id)
    console.log(`Unregistered tool: ${id}`)
  }

  /**
   * Get tool configuration
   */
  getTool(id: string): RegisteredTool | undefined {
    return this.tools.get(id)
  }

  /**
   * Get all registered tools
   */
  getAllTools(): RegisteredTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): RegisteredTool[] {
    return this.getAllTools().filter(tool => tool.category === category)
  }

  /**
   * Get all tool categories
   */
  getCategories(): string[] {
    const categories = new Set<string>()
    this.tools.forEach(tool => {
      categories.add(tool.category)
    })
    return Array.from(categories)
  }

  /**
   * Create an instance of a tool
   */
  createInstance(id: string, container: HTMLElement, options: Record<string, any> = {}): any {
    const toolConfig = this.getTool(id)
    
    if (!toolConfig) {
      console.error(`Tool ${id} not found`)
      return null
    }

    if (!toolConfig.component) {
      console.warn(`Tool ${id} has no component implementation`)
      return null
    }

    // Dispose existing instance if any
    if (this.instances.has(id)) {
      this.disposeInstance(id)
    }

    try {
      const ComponentClass = toolConfig.component
      const instance = new ComponentClass(container, {
        ...options,
        id,
        name: toolConfig.name,
        description: toolConfig.description
      })

      this.instances.set(id, instance)
      console.log(`Created instance of tool: ${id}`)
      
      return instance
    } catch (error) {
      console.error(`Failed to create instance of tool ${id}:`, error)
      return null
    }
  }

  /**
   * Get an existing instance of a tool
   */
  getInstance(id: string): any {
    return this.instances.get(id)
  }

  /**
   * Get all active instances
   */
  getAllInstances(): Array<{ id: string; instance: any }> {
    const instances: Array<{ id: string; instance: any }> = []
    this.instances.forEach((instance, id) => {
      instances.push({ id, instance })
    })
    return instances
  }

  /**
   * Dispose a tool instance
   */
  disposeInstance(id: string): void {
    const instance = this.instances.get(id)
    
    if (instance) {
      if (typeof instance.dispose === 'function') {
        instance.dispose()
      }
      this.instances.delete(id)
      console.log(`Disposed instance of tool: ${id}`)
    }
  }

  /**
   * Dispose all tool instances
   */
  disposeAllInstances(): void {
    this.instances.forEach((instance, id) => {
      this.disposeInstance(id)
    })
  }

  /**
   * Search tools by name or description
   */
  searchTools(query: string): RegisteredTool[] {
    const lowerQuery = query.toLowerCase()
    
    return this.getAllTools().filter(tool => {
      return tool.name.toLowerCase().includes(lowerQuery) ||
             tool.description.toLowerCase().includes(lowerQuery) ||
             tool.category.toLowerCase().includes(lowerQuery)
    })
  }

  /**
   * Get statistics about the registry
   */
  getStats(): {
    totalTools: number
    activeInstances: number
    categories: number
    categoryBreakdown: Record<string, number>
  } {
    const categories = this.getCategories()
    const categoryBreakdown: Record<string, number> = {}
    
    categories.forEach(category => {
      categoryBreakdown[category] = this.getToolsByCategory(category).length
    })
    
    return {
      totalTools: this.tools.size,
      activeInstances: this.instances.size,
      categories: categories.length,
      categoryBreakdown
    }
  }
}