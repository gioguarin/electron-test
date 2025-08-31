/**
 * Subnet Calculator Tool Component - TypeScript version
 */

import { ToolComponent, ToolOptions } from '../../../components/base/ToolComponent'

interface SubnetCalculatorState {
  mode: 'checker' | 'calculator'
  ipAddress: string
  subnet: string
  targetSubnet: string  // For checker mode - the subnet to check against
  results: SubnetResults | null
  validationResult: ValidationResult | null
  history: SubnetHistoryItem[]
  errors: {
    ip: string | null
    subnet: string | null
    targetSubnet: string | null
  }
}

interface ValidationResult {
  isWithinSubnet: boolean
  ipAddress: string
  targetNetwork: string
  targetCidr: number
  targetNetworkAddress: string
  targetBroadcastAddress: string
  targetSubnetMask: string
}

interface SubnetResults {
  ipAddress: string
  cidr: number
  subnetMask: string
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  ipClass: string
  ipBinary: string
}

interface SubnetHistoryItem extends SubnetResults {
  timestamp: number
}

export class SubnetCalculatorComponent extends ToolComponent {
  protected state: SubnetCalculatorState = {
    mode: 'checker',  // Default to Subnet Checker
    ipAddress: '',
    subnet: '',
    targetSubnet: '',
    results: null,
    validationResult: null,
    history: [],
    errors: {
      ip: null,
      subnet: null,
      targetSubnet: null
    }
  }

  constructor(container: HTMLElement, options: ToolOptions = {}) {
    super(container, options)
    
    // Bind methods
    this.calculateSubnet = this.calculateSubnet.bind(this)
    this.validateIPAddress = this.validateIPAddress.bind(this)
    this.validateSubnetMask = this.validateSubnetMask.bind(this)
    this.loadHistory = this.loadHistory.bind(this)
  }

  /**
   * Initialize the component
   */
  async initialize(): Promise<void> {
    // Load calculation history
    this.loadHistory()
  }

  /**
   * Render the subnet calculator UI
   */
  async render(container: HTMLElement = this.container): Promise<void> {
    // Clear container
    container.innerHTML = ''
    
    // Create main structure
    const wrapper = this.createElement('div', { className: 'subnet-calculator-component' })
    
    // Add header
    const header = this.createElement('div', { className: 'tool-header' }, [
      this.createElement('h2', {}, 'Subnet Calculator'),
      this.createElement('p', { className: 'tool-description' }, 
        this.state.mode === 'checker' 
          ? 'Check if an IP address is within a specified subnet'
          : 'Calculate network addresses, broadcast addresses, and available host ranges')
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
    const ipInput = container.querySelector('#ip-input') as HTMLInputElement
    if (ipInput) {
      ipInput.focus()
    }
  }

  /**
   * Create the input section of the calculator
   */
  private createInputSection(): HTMLElement {
    const section = this.createElement('div', { className: 'input-section card' })
    
    // Mode selector dropdown
    const modeGroup = this.createElement('div', { className: 'form-group' })
    
    const modeLabel = this.createElement('label', { htmlFor: 'mode-select' }, 'Mode')
    modeGroup.appendChild(modeLabel)
    
    const modeSelect = this.createElement('select', {
      id: 'mode-select',
      className: 'form-input',
      value: this.state.mode
    })
    
    const checkerOption = this.createElement('option', { value: 'checker' }, 'Subnet Checker - Validate if IP is within subnet')
    const calculatorOption = this.createElement('option', { value: 'calculator' }, 'Subnet Calculator - Calculate subnet details')
    
    if (this.state.mode === 'checker') {
      checkerOption.setAttribute('selected', 'selected')
    } else {
      calculatorOption.setAttribute('selected', 'selected')
    }
    
    modeSelect.appendChild(checkerOption)
    modeSelect.appendChild(calculatorOption)
    
    this.addEventListener(modeSelect, 'change', (e) => {
      const target = e.target as HTMLSelectElement
      this.setState({ 
        mode: target.value as 'checker' | 'calculator',
        results: null,
        validationResult: null,
        errors: { ip: null, subnet: null, targetSubnet: null }
      })
      this.render()
    })
    
    modeGroup.appendChild(modeSelect)
    section.appendChild(modeGroup)
    
    // IP Address input
    const ipGroup = this.createElement('div', { className: 'form-group' })
    
    const ipLabel = this.createElement('label', { htmlFor: 'ip-input' }, 
      this.state.mode === 'checker' ? 'IP Address to Check' : 'IP Address')
    ipGroup.appendChild(ipLabel)
    
    const ipInputWrapper = this.createElement('div', { className: 'input-wrapper' })
    const ipInput = this.createElement('input', {
      type: 'text',
      id: 'ip-input',
      className: 'form-input',
      placeholder: this.state.mode === 'checker' ? 'e.g., 192.168.1.50' : 'e.g., 192.168.1.0',
      value: this.state.ipAddress
    })
    
    this.addEventListener(ipInput, 'input', (e) => {
      const target = e.target as HTMLInputElement
      this.setState({ 
        ipAddress: target.value,
        errors: { ...this.state.errors, ip: null }
      })
      this.clearError('ip')
    })
    
    this.addEventListener(ipInput, 'keypress', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
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
    
    // For checker mode, add target subnet input
    if (this.state.mode === 'checker') {
      const targetSubnetGroup = this.createElement('div', { className: 'form-group' })
      
      const targetSubnetLabel = this.createElement('label', { htmlFor: 'target-subnet-input' }, 
        'Target Subnet to Check Against')
      targetSubnetGroup.appendChild(targetSubnetLabel)
      
      const targetSubnetInputWrapper = this.createElement('div', { className: 'input-wrapper' })
      const targetSubnetInput = this.createElement('input', {
        type: 'text',
        id: 'target-subnet-input',
        className: 'form-input',
        placeholder: 'e.g., 192.168.1.0/24 or 192.168.1.0 255.255.255.0',
        value: this.state.targetSubnet
      })
      
      this.addEventListener(targetSubnetInput, 'input', (e) => {
        const target = e.target as HTMLInputElement
        this.setState({ 
          targetSubnet: target.value,
          errors: { ...this.state.errors, targetSubnet: null }
        })
        this.clearError('targetSubnet')
      })
      
      this.addEventListener(targetSubnetInput, 'keypress', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          e.preventDefault()
          this.state.mode === 'checker' ? this.checkSubnet() : this.calculateSubnet()
        }
      })
      
      targetSubnetInputWrapper.appendChild(targetSubnetInput)
      
      const targetSubnetError = this.createElement('span', {
        id: 'targetSubnet-error',
        className: 'error-message'
      })
      targetSubnetInputWrapper.appendChild(targetSubnetError)
      
      targetSubnetGroup.appendChild(targetSubnetInputWrapper)
      section.appendChild(targetSubnetGroup)
    }
    
    // Subnet Mask input (only for calculator mode)
    if (this.state.mode === 'calculator') {
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
        const target = e.target as HTMLInputElement
        this.setState({ 
          subnet: target.value,
          errors: { ...this.state.errors, subnet: null }
        })
        this.clearError('subnet')
      })
      
      this.addEventListener(subnetInput, 'keypress', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
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
    }
    
    // Calculate button
    const buttonGroup = this.createElement('div', { className: 'button-group' })
    
    const calculateBtn = this.createElement('button', {
      id: 'calculate-btn',
      className: 'btn btn-primary',
      onClick: () => {
        if (this.state.mode === 'checker') {
          this.checkSubnet()
        } else {
          this.calculateSubnet()
        }
      }
    }, this.state.mode === 'checker' ? 'Check IP' : 'Calculate')
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
  private createResultsSection(): HTMLElement {
    const section = this.createElement('div', {
      id: 'results-section',
      className: 'results-section card',
      style: { display: (this.state.results || this.state.validationResult) ? 'block' : 'none' }
    })
    
    // Show validation results for checker mode
    if (this.state.mode === 'checker' && this.state.validationResult) {
      const validation = this.state.validationResult
      
      // Validation result header
      const resultHeader = this.createElement('div', { className: 'result-group' })
      const statusClass = validation.isWithinSubnet ? 'status-success' : 'status-error'
      const statusIcon = validation.isWithinSubnet ? '✓' : '✗'
      const statusText = validation.isWithinSubnet 
        ? `IP ${validation.ipAddress} IS within subnet ${validation.targetNetwork}/${validation.targetCidr}`
        : `IP ${validation.ipAddress} is NOT within subnet ${validation.targetNetwork}/${validation.targetCidr}`
      
      resultHeader.appendChild(this.createElement('h3', { className: statusClass }, [
        this.createElement('span', {}, statusIcon + ' '),
        this.createElement('span', {}, statusText)
      ]))
      section.appendChild(resultHeader)
      
      // Subnet details
      const detailsGroup = this.createElement('div', { className: 'result-group' })
      detailsGroup.appendChild(this.createElement('h4', {}, 'Target Subnet Details'))
      
      const infoGrid = this.createElement('div', { className: 'info-grid' })
      
      const resultItems = [
        { label: 'Network Address', value: validation.targetNetworkAddress, id: 'target-network' },
        { label: 'Broadcast Address', value: validation.targetBroadcastAddress, id: 'target-broadcast' },
        { label: 'Subnet Mask', value: validation.targetSubnetMask, id: 'target-mask' },
        { label: 'CIDR', value: `/${validation.targetCidr}`, id: 'target-cidr' }
      ]
      
      resultItems.forEach(item => {
        const itemDiv = this.createElement('div', { className: 'result-item' })
        itemDiv.appendChild(this.createElement('label', {}, item.label))
        
        const valueWrapper = this.createElement('div', { className: 'value-wrapper' })
        valueWrapper.appendChild(this.createElement('span', { id: item.id }, item.value))
        
        const copyBtn = this.createElement('button', {
          className: 'copy-btn',
          title: 'Copy to clipboard',
          onClick: () => this.copyToClipboard(item.value, copyBtn as HTMLButtonElement)
        }, '📋')
        valueWrapper.appendChild(copyBtn)
        
        itemDiv.appendChild(valueWrapper)
        infoGrid.appendChild(itemDiv)
      })
      
      detailsGroup.appendChild(infoGrid)
      section.appendChild(detailsGroup)
      
      return section
    }
    
    // Show calculation results for calculator mode
    if (this.state.mode === 'calculator' && this.state.results) {
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
          onClick: () => this.copyToClipboard(item.value, copyBtn as HTMLButtonElement)
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
  private createHistorySection(): HTMLElement {
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
   * Check if IP is within a subnet
   */
  private async checkSubnet(): Promise<void> {
    // Clear previous errors
    this.clearAllErrors()
    
    const { ipAddress, targetSubnet } = this.state
    
    // Validate inputs
    if (!ipAddress) {
      this.showError('ip', 'Please enter an IP address to check')
      return
    }
    
    if (!this.validateIPAddress(ipAddress)) {
      this.showError('ip', 'Please enter a valid IP address')
      return
    }
    
    if (!targetSubnet) {
      this.showError('targetSubnet', 'Please enter a target subnet')
      return
    }
    
    // Parse target subnet (support both formats: "192.168.1.0/24" or "192.168.1.0 255.255.255.0")
    let targetNetwork = ''
    let targetCidr = 0
    
    if (targetSubnet.includes('/')) {
      // CIDR notation
      const parts = targetSubnet.split('/')
      targetNetwork = parts[0].trim()
      targetCidr = parseInt(parts[1], 10)
      
      if (!this.validateIPAddress(targetNetwork)) {
        this.showError('targetSubnet', 'Invalid network address in target subnet')
        return
      }
      
      if (isNaN(targetCidr) || targetCidr < 0 || targetCidr > 32) {
        this.showError('targetSubnet', 'Invalid CIDR notation (must be 0-32)')
        return
      }
    } else if (targetSubnet.includes(' ')) {
      // IP + Subnet mask format
      const parts = targetSubnet.split(' ')
      targetNetwork = parts[0].trim()
      const mask = parts[1].trim()
      
      if (!this.validateIPAddress(targetNetwork)) {
        this.showError('targetSubnet', 'Invalid network address in target subnet')
        return
      }
      
      if (!this.validateSubnetMask(mask)) {
        this.showError('targetSubnet', 'Invalid subnet mask')
        return
      }
      
      targetCidr = this.maskToCIDR(mask)
    } else {
      this.showError('targetSubnet', 'Please use format: 192.168.1.0/24 or 192.168.1.0 255.255.255.0')
      return
    }
    
    // Disable button during calculation
    const calculateBtn = this.container.querySelector('#calculate-btn') as HTMLButtonElement
    if (calculateBtn) {
      calculateBtn.disabled = true
      calculateBtn.textContent = 'Checking...'
    }
    
    try {
      // Calculate subnet details for the target
      const targetResult = await (window as any).electronAPI.calculateSubnet(targetNetwork, targetCidr)
      
      if (targetResult.success) {
        // Check if IP is within the subnet
        const ipOctets = ipAddress.split('.').map((o: string) => parseInt(o, 10))
        const networkOctets = targetResult.data.networkAddress.split('.').map((o: string) => parseInt(o, 10))
        const broadcastOctets = targetResult.data.broadcastAddress.split('.').map((o: string) => parseInt(o, 10))
        
        // Convert to 32-bit unsigned integers for comparison (avoid JavaScript signed int issues)
        const ipInt = (ipOctets[0] * 16777216) + (ipOctets[1] * 65536) + (ipOctets[2] * 256) + ipOctets[3]
        const networkInt = (networkOctets[0] * 16777216) + (networkOctets[1] * 65536) + (networkOctets[2] * 256) + networkOctets[3]
        const broadcastInt = (broadcastOctets[0] * 16777216) + (broadcastOctets[1] * 65536) + (broadcastOctets[2] * 256) + broadcastOctets[3]
        
        const isWithinSubnet = ipInt >= networkInt && ipInt <= broadcastInt
        
        const validationResult: ValidationResult = {
          isWithinSubnet,
          ipAddress,
          targetNetwork,
          targetCidr,
          targetNetworkAddress: targetResult.data.networkAddress,
          targetBroadcastAddress: targetResult.data.broadcastAddress,
          targetSubnetMask: targetResult.data.subnetMask
        }
        
        this.setState({ validationResult })
        this.updateResultsDisplay()
        this.log('info', `IP check completed: ${isWithinSubnet ? 'Within subnet' : 'Not in subnet'}`)
      } else {
        this.showError('targetSubnet', targetResult.error || 'Validation failed')
        this.log('error', 'Validation error:', targetResult.error)
      }
    } catch (error) {
      this.showError('targetSubnet', 'An error occurred during validation')
      this.log('error', 'Error:', error)
    } finally {
      if (calculateBtn) {
        calculateBtn.disabled = false
        calculateBtn.textContent = 'Check IP'
      }
    }
  }

  /**
   * Calculate subnet information
   */
  private async calculateSubnet(): Promise<void> {
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
    const calculateBtn = this.container.querySelector('#calculate-btn') as HTMLButtonElement
    if (calculateBtn) {
      calculateBtn.disabled = true
      calculateBtn.textContent = 'Calculating...'
    }
    
    try {
      // Call IPC to calculate subnet
      const result = await (window as any).electronAPI.calculateSubnet(ipAddress, cidr)
      
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
  private validateIPAddress(ip: string): boolean {
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
  private validateSubnetMask(mask: string): boolean {
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
  private maskToCIDR(mask: string): number {
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
  private updateResultsDisplay(): void {
    const resultsSection = this.container.querySelector('#results-section') as HTMLElement
    if (resultsSection) {
      // Re-render results section
      const newResultsSection = this.createResultsSection()
      resultsSection.replaceWith(newResultsSection)
    }
  }

  /**
   * Copy text to clipboard
   */
  private copyToClipboard(text: string, button?: HTMLButtonElement): void {
    if ((window as any).electronAPI?.clipboard) {
      (window as any).electronAPI.clipboard.writeText(text)
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
  private copyAllResults(): void {
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
  private clearInputs(): void {
    this.setState({
      ipAddress: '',
      subnet: '',
      targetSubnet: '',
      results: null,
      validationResult: null,
      errors: { ip: null, subnet: null, targetSubnet: null }
    })
    
    // Update input values
    const ipInput = this.container.querySelector('#ip-input') as HTMLInputElement
    const subnetInput = this.container.querySelector('#subnet-input') as HTMLInputElement
    const targetSubnetInput = this.container.querySelector('#target-subnet-input') as HTMLInputElement
    
    if (ipInput) ipInput.value = ''
    if (subnetInput) subnetInput.value = ''
    if (targetSubnetInput) targetSubnetInput.value = ''
    
    // Hide results
    const resultsSection = this.container.querySelector('#results-section') as HTMLElement
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
  private showError(field: string, message: string): void {
    this.setState({
      errors: { ...this.state.errors, [field]: message }
    })
    
    const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement
    const inputElement = this.container.querySelector(`#${field}-input`) as HTMLElement
    
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
  private clearError(field: string): void {
    const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement
    const inputElement = this.container.querySelector(`#${field}-input`) as HTMLElement
    
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
  private clearAllErrors(): void {
    this.clearError('ip')
    this.clearError('subnet')
    this.clearError('targetSubnet')
  }

  /**
   * Load calculation history
   */
  private loadHistory(): void {
    if ((window as any).electronAPI?.storage) {
      const history = (window as any).electronAPI.storage.getHistory() || []
      this.setState({ history })
    }
  }

  /**
   * Save calculation to history
   */
  private saveToHistory(data: SubnetResults): void {
    if ((window as any).electronAPI?.storage) {
      (window as any).electronAPI.storage.saveToHistory({
        ...data,
        timestamp: Date.now()
      })
      this.loadHistory()
      
      // Update history display
      const historySection = this.container.querySelector('.history-section') as HTMLElement
      if (historySection) {
        const newHistorySection = this.createHistorySection()
        historySection.replaceWith(newHistorySection)
      }
    }
  }

  /**
   * Load calculation from history
   */
  private loadFromHistory(item: SubnetHistoryItem): void {
    this.setState({
      ipAddress: item.ipAddress,
      subnet: `/${item.cidr}`
    })
    
    // Update input values
    const ipInput = this.container.querySelector('#ip-input') as HTMLInputElement
    const subnetInput = this.container.querySelector('#subnet-input') as HTMLInputElement
    
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
  private clearHistory(): void {
    if (confirm('Are you sure you want to clear all calculation history?')) {
      if ((window as any).electronAPI?.storage) {
        (window as any).electronAPI.storage.clearHistory()
        this.setState({ history: [] })
        
        // Update history display
        const historySection = this.container.querySelector('.history-section') as HTMLElement
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
   * Called when component is activated
   */
  protected onActivate(): void {
    // Focus on IP input when activated
    const ipInput = this.container.querySelector('#ip-input') as HTMLInputElement
    if (ipInput) {
      ipInput.focus()
    }
  }

  /**
   * Called when component state changes
   */
  protected onStateChange(): void {
    // Update input values if they exist
    const ipInput = this.container.querySelector('#ip-input') as HTMLInputElement
    const subnetInput = this.container.querySelector('#subnet-input') as HTMLInputElement
    
    if (ipInput && ipInput.value !== this.state.ipAddress) {
      ipInput.value = this.state.ipAddress
    }
    
    if (subnetInput && subnetInput.value !== this.state.subnet) {
      subnetInput.value = this.state.subnet
    }
  }
}