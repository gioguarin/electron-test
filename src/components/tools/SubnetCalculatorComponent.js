/**
 * Subnet Calculator Tool Component
 * Provides subnet calculation functionality within the component framework
 */

// Import base class (works in both Node and browser environments)
const ToolComponent = typeof require !== 'undefined' 
  ? require('../base/ToolComponent')
  : window.ToolComponent

class SubnetCalculatorComponent extends ToolComponent {
  constructor(container, options = {}) {
    super(container, options)
    
    // Initialize state with default values
    this.state = {
      ipAddress: '',
      subnet: '',
      results: null,
      history: [],
      errors: {
        ip: null,
        subnet: null
      }
    }
    
    // Bind methods
    this.calculateSubnet = this.calculateSubnet.bind(this)
    this.validateIPAddress = this.validateIPAddress.bind(this)
    this.validateSubnetMask = this.validateSubnetMask.bind(this)
    this.loadHistory = this.loadHistory.bind(this)
  }

  /**
   * Initialize the component
   */
  async initialize() {
    // Load calculation history
    this.loadHistory()
  }

  /**
   * Render the subnet calculator UI
   */
  async render(container = this.container) {
    // Clear container
    container.innerHTML = ''
    
    // Create main structure
    const wrapper = this.createElement('div', { className: 'subnet-calculator-component' })
    
    // Add header
    const header = this.createElement('div', { className: 'tool-header' }, [
      this.createElement('h2', {}, 'Subnet Calculator'),
      this.createElement('p', { className: 'tool-description' }, 
        'Calculate network addresses, broadcast addresses, and available host ranges')
    ])
    wrapper.appendChild(header)
    
    // Add input section
    const inputSection = this.createInputSection()
    wrapper.appendChild(inputSection)
    
    // Add results section
    const resultsSection = this.createResultsSection()
    wrapper.appendChild(resultsSection)
    
    // Add history section
    const historySection = this.createHistorySection()
    wrapper.appendChild(historySection)
    
    // Append to container
    container.appendChild(wrapper)
    
    // Focus on IP input
    const ipInput = container.querySelector('#ip-input')
    if (ipInput) {
      ipInput.focus()
    }
  }

  /**
   * Create the input section of the calculator
   */
  createInputSection() {
    const section = this.createElement('div', { className: 'input-section card' })
    
    // IP Address input
    const ipGroup = this.createElement('div', { className: 'form-group' })
    
    const ipLabel = this.createElement('label', { htmlFor: 'ip-input' }, 'IP Address')
    ipGroup.appendChild(ipLabel)
    
    const ipInputWrapper = this.createElement('div', { className: 'input-wrapper' })
    const ipInput = this.createElement('input', {
      type: 'text',
      id: 'ip-input',
      className: 'form-input',
      placeholder: 'e.g., 192.168.1.0',
      value: this.state.ipAddress
    })
    
    this.addEventListener(ipInput, 'input', (e) => {
      this.setState({ 
        ipAddress: e.target.value,
        errors: { ...this.state.errors, ip: null }
      })
      this.clearError('ip')
    })
    
    this.addEventListener(ipInput, 'keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.calculateSubnet()
      }
    })
    
    ipInputWrapper.appendChild(ipInput)
    
    const ipError = this.createElement('span', {
      id: 'ip-error',
      className: 'error-message'
    })
    ipInputWrapper.appendChild(ipError)
    
    ipGroup.appendChild(ipInputWrapper)
    section.appendChild(ipGroup)
    
    // Subnet Mask input
    const subnetGroup = this.createElement('div', { className: 'form-group' })
    
    const subnetLabel = this.createElement('label', { htmlFor: 'subnet-input' }, 
      'Subnet Mask / CIDR')
    subnetGroup.appendChild(subnetLabel)
    
    const subnetInputWrapper = this.createElement('div', { className: 'input-wrapper' })
    const subnetInput = this.createElement('input', {
      type: 'text',
      id: 'subnet-input',
      className: 'form-input',
      placeholder: 'e.g., 255.255.255.0 or /24',
      value: this.state.subnet
    })
    
    this.addEventListener(subnetInput, 'input', (e) => {
      this.setState({ 
        subnet: e.target.value,
        errors: { ...this.state.errors, subnet: null }
      })
      this.clearError('subnet')
    })
    
    this.addEventListener(subnetInput, 'keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.calculateSubnet()
      }
    })
    
    subnetInputWrapper.appendChild(subnetInput)
    
    const subnetError = this.createElement('span', {
      id: 'subnet-error',
      className: 'error-message'
    })
    subnetInputWrapper.appendChild(subnetError)
    
    subnetGroup.appendChild(subnetInputWrapper)
    section.appendChild(subnetGroup)
    
    // Calculate button
    const buttonGroup = this.createElement('div', { className: 'button-group' })
    
    const calculateBtn = this.createElement('button', {
      id: 'calculate-btn',
      className: 'btn btn-primary',
      onClick: this.calculateSubnet
    }, 'Calculate')
    buttonGroup.appendChild(calculateBtn)
    
    const clearBtn = this.createElement('button', {
      className: 'btn btn-secondary',
      onClick: () => this.clearInputs()
    }, 'Clear')
    buttonGroup.appendChild(clearBtn)
    
    section.appendChild(buttonGroup)
    
    return section
  }

  /**
   * Create the results section
   */
  createResultsSection() {
    const section = this.createElement('div', {
      id: 'results-section',
      className: 'results-section card',
      style: { display: this.state.results ? 'block' : 'none' }
    })
    
    if (this.state.results) {
      const results = this.state.results
      
      // Network information
      const networkInfo = this.createElement('div', { className: 'result-group' })
      networkInfo.appendChild(this.createElement('h3', {}, 'Network Information'))
      
      const infoGrid = this.createElement('div', { className: 'info-grid' })
      
      // Add result items
      const resultItems = [
        { label: 'Network Address', value: results.networkAddress, id: 'network-address' },
        { label: 'Broadcast Address', value: results.broadcastAddress, id: 'broadcast-address' },
        { label: 'Subnet Mask', value: results.subnetMask, id: 'subnet-mask' },
        { label: 'CIDR Notation', value: `/${results.cidr}`, id: 'cidr' },
        { label: 'IP Class', value: results.ipClass, id: 'ip-class' },
        { label: 'Total Hosts', value: `${results.totalHosts.toLocaleString()} (${results.usableHosts.toLocaleString()} usable)`, id: 'total-hosts' },
        { label: 'Host Range', value: results.usableHosts > 0 ? `${results.firstHost} - ${results.lastHost}` : 'N/A', id: 'host-range' }
      ]
      
      resultItems.forEach(item => {
        const itemDiv = this.createElement('div', { className: 'result-item' })
        itemDiv.appendChild(this.createElement('label', {}, item.label))
        
        const valueWrapper = this.createElement('div', { className: 'value-wrapper' })
        valueWrapper.appendChild(this.createElement('span', { id: item.id }, item.value))
        
        const copyBtn = this.createElement('button', {
          className: 'copy-btn',
          title: 'Copy to clipboard',
          onClick: () => this.copyToClipboard(item.value, copyBtn)
        }, '📋')
        valueWrapper.appendChild(copyBtn)
        
        itemDiv.appendChild(valueWrapper)
        infoGrid.appendChild(itemDiv)
      })
      
      networkInfo.appendChild(infoGrid)
      section.appendChild(networkInfo)
      
      // Binary representation
      if (results.ipBinary) {
        const binarySection = this.createElement('div', { className: 'result-group' })
        binarySection.appendChild(this.createElement('h3', {}, 'Binary Representation'))
        
        const binaryGrid = this.createElement('div', { className: 'binary-grid' })
        binaryGrid.appendChild(this.createElement('div', { className: 'binary-item' }, [
          this.createElement('label', {}, 'IP Address'),
          this.createElement('code', {}, results.ipBinary)
        ]))
        
        binarySection.appendChild(binaryGrid)
        section.appendChild(binarySection)
      }
      
      // Copy all button
      const copyAllBtn = this.createElement('button', {
        className: 'btn btn-secondary',
        onClick: () => this.copyAllResults()
      }, 'Copy All Results')
      section.appendChild(copyAllBtn)
    }
    
    return section
  }

  /**
   * Create the history section
   */
  createHistorySection() {
    const section = this.createElement('div', { className: 'history-section card' })
    
    const header = this.createElement('div', { className: 'history-header' })
    header.appendChild(this.createElement('h3', {}, 'Calculation History'))
    
    if (this.state.history.length > 0) {
      const clearBtn = this.createElement('button', {
        className: 'btn btn-small btn-danger',
        onClick: () => this.clearHistory()
      }, 'Clear History')
      header.appendChild(clearBtn)
    }
    
    section.appendChild(header)
    
    const historyList = this.createElement('div', { 
      id: 'history-list',
      className: 'history-list' 
    })
    
    if (this.state.history.length > 0) {
      this.state.history.forEach(item => {
        const historyItem = this.createElement('div', {
          className: 'history-item',
          onClick: () => this.loadFromHistory(item)
        })
        
        const timestamp = new Date(item.timestamp)
        const formattedDate = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString()
        
        historyItem.appendChild(this.createElement('div', { className: 'history-timestamp' }, formattedDate))
        historyItem.appendChild(this.createElement('div', { className: 'history-details' }, [
          this.createElement('span', { className: 'history-ip' }, item.ipAddress),
          this.createElement('span', { className: 'history-cidr' }, `/${item.cidr}`)
        ]))
        
        historyList.appendChild(historyItem)
      })
    } else {
      historyList.appendChild(this.createElement('div', { className: 'no-history' }, 
        'No calculations yet. Start by calculating a subnet above!'))
    }
    
    section.appendChild(historyList)
    return section
  }

  /**
   * Calculate subnet information
   */
  async calculateSubnet() {
    // Clear previous errors
    this.clearAllErrors()
    
    const { ipAddress, subnet } = this.state
    
    // Validate inputs
    if (!ipAddress) {
      this.showError('ip', 'Please enter an IP address')
      return
    }
    
    if (!this.validateIPAddress(ipAddress)) {
      this.showError('ip', 'Please enter a valid IP address')
      return
    }
    
    if (!subnet) {
      this.showError('subnet', 'Please enter a subnet mask or CIDR')
      return
    }
    
    if (!this.validateSubnetMask(subnet)) {
      this.showError('subnet', 'Please enter a valid subnet mask or CIDR notation')
      return
    }
    
    // Convert subnet mask to CIDR if needed
    const cidr = this.maskToCIDR(subnet)
    
    // Disable button during calculation
    const calculateBtn = this.container.querySelector('#calculate-btn')
    if (calculateBtn) {
      calculateBtn.disabled = true
      calculateBtn.textContent = 'Calculating...'
    }
    
    try {
      // Call IPC to calculate subnet
      const result = await window.electronAPI.calculateSubnet(ipAddress, cidr)
      
      if (result.success) {
        this.setState({ results: result.data })
        this.updateResultsDisplay()
        this.saveToHistory(result.data)
        this.log('info', 'Subnet calculation completed successfully')
      } else {
        this.showError('ip', result.error || 'Calculation failed')
        this.log('error', 'Calculation error:', result.error)
      }
    } catch (error) {
      this.showError('ip', 'An error occurred during calculation')
      this.log('error', 'Error:', error)
    } finally {
      if (calculateBtn) {
        calculateBtn.disabled = false
        calculateBtn.textContent = 'Calculate'
      }
    }
  }

  /**
   * Validate IP address format
   */
  validateIPAddress(ip) {
    const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = ip.match(regex)
    
    if (!match) return false
    
    return match.slice(1).every(octet => {
      const num = parseInt(octet, 10)
      return num >= 0 && num <= 255
    })
  }

  /**
   * Validate subnet mask format
   */
  validateSubnetMask(mask) {
    // Check for CIDR notation
    if (mask.startsWith('/')) {
      const cidr = parseInt(mask.substring(1), 10)
      return !isNaN(cidr) && cidr >= 0 && cidr <= 32
    }
    
    // Check for dotted decimal notation
    if (this.validateIPAddress(mask)) {
      const octets = mask.split('.').map(o => parseInt(o, 10))
      const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('')
      // Valid subnet mask should have all 1s followed by all 0s
      const firstZero = binary.indexOf('0')
      if (firstZero === -1) return true // All 1s (255.255.255.255)
      return !binary.substring(firstZero).includes('1')
    }
    
    return false
  }

  /**
   * Convert subnet mask to CIDR notation
   */
  maskToCIDR(mask) {
    if (mask.startsWith('/')) {
      return parseInt(mask.substring(1), 10)
    }
    
    const octets = mask.split('.').map(o => parseInt(o, 10))
    const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('')
    return binary.split('1').length - 1
  }

  /**
   * Update the results display
   */
  updateResultsDisplay() {
    const resultsSection = this.container.querySelector('#results-section')
    if (resultsSection) {
      // Re-render results section
      const newResultsSection = this.createResultsSection()
      resultsSection.replaceWith(newResultsSection)
    }
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text, button) {
    if (window.electronAPI && window.electronAPI.clipboard) {
      window.electronAPI.clipboard.writeText(text)
    } else {
      navigator.clipboard.writeText(text)
    }
    
    // Update button to show copied state
    if (button) {
      const originalText = button.textContent
      button.textContent = '✓'
      button.classList.add('copied')
      
      setTimeout(() => {
        button.textContent = originalText
        button.classList.remove('copied')
      }, 2000)
    }
    
    this.notify('Copied to clipboard', 'success')
  }

  /**
   * Copy all results to clipboard
   */
  copyAllResults() {
    if (!this.state.results) return
    
    const results = this.state.results
    const formattedText = `
Network Address: ${results.networkAddress}
Broadcast Address: ${results.broadcastAddress}
Subnet Mask: ${results.subnetMask}
CIDR: /${results.cidr}
Host Range: ${results.usableHosts > 0 ? `${results.firstHost} - ${results.lastHost}` : 'N/A'}
Total Hosts: ${results.totalHosts} (${results.usableHosts} usable)
IP Class: ${results.ipClass}
    `.trim()
    
    this.copyToClipboard(formattedText)
  }

  /**
   * Clear input fields
   */
  clearInputs() {
    this.setState({
      ipAddress: '',
      subnet: '',
      results: null,
      errors: { ip: null, subnet: null }
    })
    
    // Update input values
    const ipInput = this.container.querySelector('#ip-input')
    const subnetInput = this.container.querySelector('#subnet-input')
    
    if (ipInput) ipInput.value = ''
    if (subnetInput) subnetInput.value = ''
    
    // Hide results
    const resultsSection = this.container.querySelector('#results-section')
    if (resultsSection) {
      resultsSection.style.display = 'none'
    }
    
    // Clear errors
    this.clearAllErrors()
    
    // Focus on IP input
    if (ipInput) ipInput.focus()
  }

  /**
   * Show an error message
   */
  showError(field, message) {
    this.setState({
      errors: { ...this.state.errors, [field]: message }
    })
    
    const errorElement = this.container.querySelector(`#${field}-error`)
    const inputElement = this.container.querySelector(`#${field}-input`)
    
    if (errorElement) {
      errorElement.textContent = message
      errorElement.classList.add('show')
    }
    
    if (inputElement) {
      inputElement.classList.add('error')
    }
  }

  /**
   * Clear an error message
   */
  clearError(field) {
    const errorElement = this.container.querySelector(`#${field}-error`)
    const inputElement = this.container.querySelector(`#${field}-input`)
    
    if (errorElement) {
      errorElement.textContent = ''
      errorElement.classList.remove('show')
    }
    
    if (inputElement) {
      inputElement.classList.remove('error')
    }
  }

  /**
   * Clear all error messages
   */
  clearAllErrors() {
    this.clearError('ip')
    this.clearError('subnet')
  }

  /**
   * Load calculation history
   */
  loadHistory() {
    if (window.electronAPI && window.electronAPI.storage) {
      const history = window.electronAPI.storage.getHistory() || []
      this.setState({ history })
    }
  }

  /**
   * Save calculation to history
   */
  saveToHistory(data) {
    if (window.electronAPI && window.electronAPI.storage) {
      window.electronAPI.storage.saveToHistory({
        ...data,
        timestamp: Date.now()
      })
      this.loadHistory()
      
      // Update history display
      const historySection = this.container.querySelector('.history-section')
      if (historySection) {
        const newHistorySection = this.createHistorySection()
        historySection.replaceWith(newHistorySection)
      }
    }
  }

  /**
   * Load calculation from history
   */
  loadFromHistory(item) {
    this.setState({
      ipAddress: item.ipAddress,
      subnet: `/${item.cidr}`
    })
    
    // Update input values
    const ipInput = this.container.querySelector('#ip-input')
    const subnetInput = this.container.querySelector('#subnet-input')
    
    if (ipInput) ipInput.value = item.ipAddress
    if (subnetInput) subnetInput.value = `/${item.cidr}`
    
    // Trigger calculation
    this.calculateSubnet()
    
    // Scroll to top
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /**
   * Clear calculation history
   */
  clearHistory() {
    if (confirm('Are you sure you want to clear all calculation history?')) {
      if (window.electronAPI && window.electronAPI.storage) {
        window.electronAPI.storage.clearHistory()
        this.setState({ history: [] })
        
        // Update history display
        const historySection = this.container.querySelector('.history-section')
        if (historySection) {
          const newHistorySection = this.createHistorySection()
          historySection.replaceWith(newHistorySection)
        }
        
        this.log('info', 'History cleared')
        this.notify('History cleared', 'info')
      }
    }
  }

  /**
   * Get current context for state saving
   */
  getContext() {
    return {
      ...super.getContext(),
      inputs: {
        ipAddress: this.state.ipAddress,
        subnet: this.state.subnet
      },
      results: this.state.results,
      history: this.state.history
    }
  }

  /**
   * Restore context from saved state
   */
  setContext(context) {
    super.setContext(context)
    
    if (context.inputs) {
      this.setState({
        ipAddress: context.inputs.ipAddress || '',
        subnet: context.inputs.subnet || ''
      })
    }
    
    if (context.results) {
      this.setState({ results: context.results })
      this.updateResultsDisplay()
    }
    
    if (context.history) {
      this.setState({ history: context.history })
    }
  }

  /**
   * Called when component is activated
   */
  onActivate() {
    // Focus on IP input when activated
    const ipInput = this.container.querySelector('#ip-input')
    if (ipInput) {
      ipInput.focus()
    }
  }

  /**
   * Called when component state changes
   */
  onStateChange() {
    // Update input values if they exist
    const ipInput = this.container.querySelector('#ip-input')
    const subnetInput = this.container.querySelector('#subnet-input')
    
    if (ipInput && ipInput.value !== this.state.ipAddress) {
      ipInput.value = this.state.ipAddress
    }
    
    if (subnetInput && subnetInput.value !== this.state.subnet) {
      subnetInput.value = this.state.subnet
    }
  }
}

// Export for use in both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubnetCalculatorComponent
} else {
  window.SubnetCalculatorComponent = SubnetCalculatorComponent
}