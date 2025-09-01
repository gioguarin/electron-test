/**
 * Base class for all tool components in the Network Tools Hub
 * Provides a consistent interface for rendering, lifecycle management, and state handling
 */
class ToolComponent {
  constructor(container, options = {}) {
    this.container = container
    this.options = options
    this.state = {}
    this.isActive = false
    this.eventListeners = []
    this.disposables = []
  }

  /**
   * Initialize the component - called once when component is created
   * Override this in child classes for custom initialization
   */
  async initialize() {
    // To be implemented by child classes
  }

  /**
   * Render the component's UI
   * @param {HTMLElement} container - The container element to render into
   * @returns {Promise<void>}
   */
  async render(container = this.container) {
    throw new Error('render() method must be implemented by child class')
  }

  /**
   * Get the current context/state of the tool
   * Used for saving state, AI assistant integration, etc.
   * @returns {Object} Current tool context
   */
  getContext() {
    return {
      toolName: this.getToolName(),
      state: this.state,
      isActive: this.isActive,
      timestamp: Date.now(),
    }
  }

  /**
   * Set the tool's state from a context object
   * Used for restoring state
   * @param {Object} context - Context object to restore from
   */
  setContext(context) {
    if (context && context.state) {
      this.state = { ...this.state, ...context.state }
      this.onStateChange()
    }
  }

  /**
   * Get the tool's display name
   * @returns {string} Tool name
   */
  getToolName() {
    return this.constructor.name.replace('Tool', '').replace('Component', '')
  }

  /**
   * Get the tool's unique identifier
   * @returns {string} Tool ID
   */
  getToolId() {
    return this.options.id || this.getToolName().toLowerCase().replace(/\s+/g, '-')
  }

  /**
   * Activate the tool (make it visible/active)
   */
  activate() {
    this.isActive = true
    this.onActivate()
  }

  /**
   * Deactivate the tool (hide it but keep in memory)
   */
  deactivate() {
    this.isActive = false
    this.onDeactivate()
  }

  /**
   * Called when tool is activated
   * Override in child classes for custom behavior
   */
  onActivate() {
    // To be implemented by child classes
  }

  /**
   * Called when tool is deactivated
   * Override in child classes for custom behavior
   */
  onDeactivate() {
    // To be implemented by child classes
  }

  /**
   * Called when state changes
   * Override in child classes to react to state changes
   */
  onStateChange() {
    // To be implemented by child classes
  }

  /**
   * Update the component's state
   * @param {Object} newState - New state to merge with existing state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.onStateChange()
  }

  /**
   * Add an event listener that will be automatically cleaned up on dispose
   * @param {EventTarget} target - The target element or object
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  addEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options)
    this.eventListeners.push({ target, event, handler, options })
  }

  /**
   * Add a disposable resource that will be cleaned up on dispose
   * @param {Function|Object} disposable - Function to call or object with dispose() method
   */
  addDisposable(disposable) {
    this.disposables.push(disposable)
  }

  /**
   * Clean up and dispose of the component
   * Removes all event listeners and cleans up resources
   */
  dispose() {
    // Remove all event listeners
    this.eventListeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options)
    })
    this.eventListeners = []

    // Dispose of all disposable resources
    this.disposables.forEach(disposable => {
      if (typeof disposable === 'function') {
        disposable()
      } else if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose()
      }
    })
    this.disposables = []

    // Clear the container
    if (this.container) {
      this.container.innerHTML = ''
    }

    // Call child class cleanup
    this.onDispose()
  }

  /**
   * Called during disposal for child class cleanup
   * Override in child classes for custom cleanup
   */
  onDispose() {
    // To be implemented by child classes
  }

  /**
   * Utility method to create DOM elements
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Array|string} children - Child elements or text content
   * @returns {HTMLElement} Created element
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag)

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value)
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase()
        this.addEventListener(element, eventName, value)
      } else {
        element.setAttribute(key, value)
      }
    })

    // Add children
    if (typeof children === 'string') {
      element.textContent = children
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else if (child instanceof HTMLElement) {
          element.appendChild(child)
        }
      })
    }

    return element
  }

  /**
   * Show a notification to the user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  notify(message, type = 'info') {
    if (window.electronAPI && window.electronAPI.showNotification) {
      window.electronAPI.showNotification(message, type)
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }

  /**
   * Log a message
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  log(level, message, data = null) {
    const logMessage = `[${this.getToolName()}] ${message}`

    if (window.electronAPI && window.electronAPI.log) {
      window.electronAPI.log[level](logMessage, data)
    } else {
      console[level](logMessage, data)
    }
  }
}

// Export for use in both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToolComponent
} else {
  window.ToolComponent = ToolComponent
}