/**
 * Tool Registry - Manages registration and instantiation of tool components
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map()
    this.instances = new Map()
  }

  /**
   * Register a tool component class
   * @param {string} id - Unique identifier for the tool
   * @param {Object} config - Tool configuration
   * @param {Function} config.component - The tool component class
   * @param {string} config.name - Display name
   * @param {string} config.description - Tool description
   * @param {string} config.icon - Icon identifier
   * @param {string} config.category - Tool category
   */
  register(id, config) {
    if (this.tools.has(id)) {
      console.warn(`Tool ${id} is already registered`)
      return
    }

    this.tools.set(id, {
      id,
      component: config.component,
      name: config.name || id,
      description: config.description || '',
      icon: config.icon || '🔧',
      category: config.category || 'general',
      metadata: config.metadata || {}
    })

    console.log(`Registered tool: ${id}`)
  }

  /**
   * Unregister a tool
   * @param {string} id - Tool identifier
   */
  unregister(id) {
    // Dispose instance if exists
    if (this.instances.has(id)) {
      this.disposeInstance(id)
    }
    
    this.tools.delete(id)
    console.log(`Unregistered tool: ${id}`)
  }

  /**
   * Get tool configuration
   * @param {string} id - Tool identifier
   * @returns {Object|null} Tool configuration
   */
  getTool(id) {
    return this.tools.get(id) || null
  }

  /**
   * Get all registered tools
   * @returns {Array} Array of tool configurations
   */
  getAllTools() {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools by category
   * @param {string} category - Category name
   * @returns {Array} Array of tool configurations
   */
  getToolsByCategory(category) {
    return this.getAllTools().filter(tool => tool.category === category)
  }

  /**
   * Get all tool categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    const categories = new Set()
    this.tools.forEach(tool => {
      categories.add(tool.category)
    })
    return Array.from(categories)
  }

  /**
   * Create an instance of a tool
   * @param {string} id - Tool identifier
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Tool options
   * @returns {Object|null} Tool instance
   */
  createInstance(id, container, options = {}) {
    const toolConfig = this.getTool(id)
    
    if (!toolConfig) {
      console.error(`Tool ${id} not found`)
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
   * @param {string} id - Tool identifier
   * @returns {Object|null} Tool instance
   */
  getInstance(id) {
    return this.instances.get(id) || null
  }

  /**
   * Get all active instances
   * @returns {Array} Array of {id, instance} objects
   */
  getAllInstances() {
    const instances = []
    this.instances.forEach((instance, id) => {
      instances.push({ id, instance })
    })
    return instances
  }

  /**
   * Dispose a tool instance
   * @param {string} id - Tool identifier
   */
  disposeInstance(id) {
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
  disposeAllInstances() {
    this.instances.forEach((instance, id) => {
      this.disposeInstance(id)
    })
  }

  /**
   * Search tools by name or description
   * @param {string} query - Search query
   * @returns {Array} Array of matching tool configurations
   */
  searchTools(query) {
    const lowerQuery = query.toLowerCase()
    
    return this.getAllTools().filter(tool => {
      return tool.name.toLowerCase().includes(lowerQuery) ||
             tool.description.toLowerCase().includes(lowerQuery) ||
             tool.category.toLowerCase().includes(lowerQuery)
    })
  }

  /**
   * Export tool registry as JSON
   * @returns {Object} Serialized registry
   */
  toJSON() {
    const tools = {}
    
    this.tools.forEach((config, id) => {
      tools[id] = {
        name: config.name,
        description: config.description,
        icon: config.icon,
        category: config.category,
        metadata: config.metadata
      }
    })
    
    return {
      version: '1.0.0',
      tools
    }
  }

  /**
   * Get statistics about the registry
   * @returns {Object} Registry statistics
   */
  getStats() {
    const categories = this.getCategories()
    const categoryStats = {}
    
    categories.forEach(category => {
      categoryStats[category] = this.getToolsByCategory(category).length
    })
    
    return {
      totalTools: this.tools.size,
      activeInstances: this.instances.size,
      categories: categories.length,
      categoryBreakdown: categoryStats
    }
  }
}

// Create a singleton instance
const toolRegistry = new ToolRegistry()

// Export for use in both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToolRegistry, toolRegistry }
} else {
  window.ToolRegistry = ToolRegistry
  window.toolRegistry = toolRegistry
}