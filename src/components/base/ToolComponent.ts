/**
 * Base class for all tool components in the Network Tools Hub
 * TypeScript version with strong typing
 */

export interface ToolOptions {
  id?: string
  name?: string
  description?: string
  [key: string]: any
}

export interface ToolContext {
  toolName: string
  state: Record<string, any>
  isActive: boolean
  timestamp: number
}

export interface EventListenerRecord {
  target: EventTarget
  event: string
  handler: EventListener
  options?: boolean | AddEventListenerOptions
}

export type Disposable = (() => void) | { dispose(): void }

export abstract class ToolComponent {
  protected container: HTMLElement
  protected options: ToolOptions
  protected state: Record<string, any> = {}
  protected isActive: boolean = false
  protected eventListeners: EventListenerRecord[] = []
  protected disposables: Disposable[] = []

  constructor(container: HTMLElement, options: ToolOptions = {}) {
    this.container = container
    this.options = options
  }

  /**
   * Initialize the component - called once when component is created
   * Override this in child classes for custom initialization
   */
  async initialize(): Promise<void> {
    // To be implemented by child classes
  }

  /**
   * Render the component's UI
   * @param container - The container element to render into
   */
  abstract render(container?: HTMLElement): Promise<void>

  /**
   * Get the current context/state of the tool
   * Used for saving state, AI assistant integration, etc.
   */
  getContext(): ToolContext {
    return {
      toolName: this.getToolName(),
      state: this.state,
      isActive: this.isActive,
      timestamp: Date.now()
    }
  }

  /**
   * Set the tool's state from a context object
   * Used for restoring state
   */
  setContext(context: Partial<ToolContext>): void {
    if (context && context.state) {
      this.state = { ...this.state, ...context.state }
      this.onStateChange()
    }
  }

  /**
   * Get the tool's display name
   */
  getToolName(): string {
    return this.constructor.name.replace('Tool', '').replace('Component', '')
  }

  /**
   * Get the tool's unique identifier
   */
  getToolId(): string {
    return this.options.id || this.getToolName().toLowerCase().replace(/\s+/g, '-')
  }

  /**
   * Activate the tool (make it visible/active)
   */
  activate(): void {
    this.isActive = true
    this.onActivate()
  }

  /**
   * Deactivate the tool (hide it but keep in memory)
   */
  deactivate(): void {
    this.isActive = false
    this.onDeactivate()
  }

  /**
   * Called when tool is activated
   * Override in child classes for custom behavior
   */
  protected onActivate(): void {
    // To be implemented by child classes
  }

  /**
   * Called when tool is deactivated
   * Override in child classes for custom behavior
   */
  protected onDeactivate(): void {
    // To be implemented by child classes
  }

  /**
   * Called when state changes
   * Override in child classes to react to state changes
   */
  protected onStateChange(): void {
    // To be implemented by child classes
  }

  /**
   * Update the component's state
   */
  setState(newState: Record<string, any>): void {
    this.state = { ...this.state, ...newState }
    this.onStateChange()
  }

  /**
   * Add an event listener that will be automatically cleaned up on dispose
   */
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options)
    this.eventListeners.push({ target, event, handler, options })
  }

  /**
   * Add a disposable resource that will be cleaned up on dispose
   */
  addDisposable(disposable: Disposable): void {
    this.disposables.push(disposable)
  }

  /**
   * Clean up and dispose of the component
   * Removes all event listeners and cleans up resources
   */
  dispose(): void {
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
  protected onDispose(): void {
    // To be implemented by child classes
  }

  /**
   * Utility method to create DOM elements
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: Record<string, any> = {},
    children: (string | HTMLElement)[] | string = []
  ): HTMLElementTagNameMap[K] {
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
   */
  protected notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    if ((window as any).electronAPI?.showNotification) {
      (window as any).electronAPI.showNotification(message, type)
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }

  /**
   * Log a message
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logMessage = `[${this.getToolName()}] ${message}`
    
    if ((window as any).electronAPI?.log) {
      (window as any).electronAPI.log[level](logMessage, data)
    } else {
      console[level](logMessage, data)
    }
  }
}