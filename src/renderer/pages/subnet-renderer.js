// Subnet Calculator Renderer Process
document.addEventListener('DOMContentLoaded', () => {
  // Display version information
  const versions = window.electronAPI.getVersions()
  const electronVersion = document.getElementById('electron-version')
  const nodeVersion = document.getElementById('node-version')
    
  if (electronVersion) electronVersion.textContent = versions.electron
  if (nodeVersion) nodeVersion.textContent = versions.node
    
  // Back button navigation
  const backButton = document.getElementById('backButton')
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.electronAPI.navigateToHome()
    })
  }
    
  // Focus on IP input
  const ipInput = document.getElementById('ip')
  if (ipInput) {
    ipInput.focus()
  }
})

// Validation functions
function validateIPAddress(ip) {
  const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ip.match(regex)
    
  if (!match) return false
    
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10)
    return num >= 0 && num <= 255
  })
}

function validateSubnetMask(mask) {
  // Check for CIDR notation
  if (mask.startsWith('/')) {
    const cidr = parseInt(mask.substring(1), 10)
    return !isNaN(cidr) && cidr >= 0 && cidr <= 32
  }
    
  // Check for dotted decimal notation
  if (validateIPAddress(mask)) {
    const octets = mask.split('.').map(o => parseInt(o, 10))
    const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('')
    // Valid subnet mask should have all 1s followed by all 0s
    const firstZero = binary.indexOf('0')
    if (firstZero === -1) return true // All 1s (255.255.255.255)
    return !binary.substring(firstZero).includes('1')
  }
    
  return false
}

function maskToCIDR(mask) {
  if (mask.startsWith('/')) {
    return parseInt(mask.substring(1), 10)
  }
    
  const octets = mask.split('.').map(o => parseInt(o, 10))
  const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('')
  return binary.split('1').length - 1
}

// Calculate subnet
async function calculateSubnet() {
  const ipInput = document.getElementById('ip')
  const subnetInput = document.getElementById('subnet')
  const ipError = document.getElementById('ipError')
  const subnetError = document.getElementById('subnetError')
  const calculateBtn = document.getElementById('calculateBtn')
    
  // Reset errors
  ipInput.classList.remove('error')
  subnetInput.classList.remove('error')
  ipError.classList.remove('show')
  subnetError.classList.remove('show')
    
  const ip = ipInput.value.trim()
  const subnet = subnetInput.value.trim()
    
  // Validate IP
  if (!ip) {
    ipInput.classList.add('error')
    ipError.classList.add('show')
    ipError.textContent = 'Please enter an IP address'
    return
  }
    
  if (!validateIPAddress(ip)) {
    ipInput.classList.add('error')
    ipError.classList.add('show')
    ipError.textContent = 'Please enter a valid IP address'
    return
  }
    
  // Validate subnet
  if (!subnet) {
    subnetInput.classList.add('error')
    subnetError.classList.add('show')
    subnetError.textContent = 'Please enter a subnet mask or CIDR'
    return
  }
    
  if (!validateSubnetMask(subnet)) {
    subnetInput.classList.add('error')
    subnetError.classList.add('show')
    subnetError.textContent = 'Please enter a valid subnet mask or CIDR notation'
    return
  }
    
  // Convert subnet mask to CIDR if needed
  const cidr = maskToCIDR(subnet)
    
  // Disable button during calculation
  calculateBtn.disabled = true
  calculateBtn.innerHTML = 'Calculating<span class="loading"></span>'
    
  try {
    const result = await window.electronAPI.calculateSubnet(ip, cidr)
        
    if (result.success) {
      displayResults(result.data)
      window.electronAPI.log.info('Subnet calculation completed successfully')
    } else {
      window.electronAPI.log.error('Calculation error:', result.error)
    }
  } catch (error) {
    window.electronAPI.log.error('Error:', error)
  } finally {
    calculateBtn.disabled = false
    calculateBtn.textContent = 'Calculate'
  }
}

// Display results
function displayResults(data) {
  const results = document.getElementById('results')
    
  // Network address
  document.getElementById('networkAddress').textContent = data.networkAddress
  document.getElementById('networkBinary').textContent = 
        data.networkAddress.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')
    
  // Broadcast address
  document.getElementById('broadcastAddress').textContent = data.broadcastAddress
  document.getElementById('broadcastBinary').textContent = 
        data.broadcastAddress.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')
    
  // Subnet mask
  document.getElementById('subnetMask').textContent = data.subnetMask
  document.getElementById('subnetBinary').textContent = 
        data.subnetMask.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')
    
  // CIDR
  document.getElementById('cidr').textContent = `/${data.cidr}`
    
  // Host range
  if (data.usableHosts > 0) {
    document.getElementById('hostRange').textContent = `${data.firstHost} - ${data.lastHost}`
  } else {
    document.getElementById('hostRange').textContent = 'N/A'
  }
    
  // Total hosts
  document.getElementById('totalHosts').textContent = `${data.totalHosts.toLocaleString()} (${data.usableHosts.toLocaleString()} usable)`
    
  // IP class
  document.getElementById('ipClass').textContent = data.ipClass
    
  // Show results
  results.classList.add('show')
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    
  // Save to history
  window.electronAPI.storage.saveToHistory(data)
    
  // Refresh history display
  loadHistory()
}

// Copy to clipboard function
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    const text = element.textContent
    window.electronAPI.clipboard.writeText(text)
    return text
  }
  return null
}

// Copy all results to clipboard
function copyAllResults() {
  const results = {
    'Network Address': document.getElementById('networkAddress').textContent,
    'Broadcast Address': document.getElementById('broadcastAddress').textContent,
    'Subnet Mask': document.getElementById('subnetMask').textContent,
    'CIDR': document.getElementById('cidr').textContent,
    'Host Range': document.getElementById('hostRange').textContent,
    'Total Hosts': document.getElementById('totalHosts').textContent,
    'IP Class': document.getElementById('ipClass').textContent
  }
    
  const formattedText = Object.entries(results)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
    
  window.electronAPI.clipboard.writeText(formattedText)
  return formattedText
}

// Load and display calculation history
function loadHistory() {
  const historyList = document.getElementById('historyList')
  const history = window.electronAPI.storage.getHistory()
    
  if (history && history.length > 0) {
    historyList.innerHTML = history.map(item => {
      const date = new Date(item.timestamp)
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
            
      return `
                <div class="history-item" data-ip="${item.ipAddress}" data-cidr="${item.cidr}">
                    <div class="history-timestamp">${formattedDate}</div>
                    <div class="history-details">
                        <span class="history-ip">${item.ipAddress}</span>
                        <span class="history-cidr">/${item.cidr}</span>
                    </div>
                </div>
            `
    }).join('')
  } else {
    historyList.innerHTML = '<div class="no-history">No calculations yet. Start by calculating a subnet above!</div>'
  }
}

// Load calculation from history
function loadFromHistory(ipAddress, cidr) {
  // Set values in input fields
  document.getElementById('ip').value = ipAddress
  document.getElementById('subnet').value = `/${cidr}`
    
  // Trigger calculation
  calculateSubnet()
    
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculateBtn')
  const ipInput = document.getElementById('ip')
  const subnetInput = document.getElementById('subnet')
    
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateSubnet)
  }
    
  // Enter key to calculate
  if (ipInput) {
    ipInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        calculateSubnet()
      }
    })
        
    ipInput.addEventListener('input', () => {
      ipInput.classList.remove('error')
      document.getElementById('ipError').classList.remove('show')
    })
  }
    
  if (subnetInput) {
    subnetInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        calculateSubnet()
      }
    })
        
    subnetInput.addEventListener('input', () => {
      subnetInput.classList.remove('error')
      document.getElementById('subnetError').classList.remove('show')
    })
  }
    
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      if (ipInput) ipInput.value = ''
      if (subnetInput) subnetInput.value = ''
      if (ipInput) ipInput.focus()
      const results = document.getElementById('results')
      if (results) results.classList.remove('show')
    }
  })
    
  // Copy button listeners
  document.addEventListener('click', (e) => {
    if (e.target.closest('.copy-button')) {
      const button = e.target.closest('.copy-button')
      const copyTarget = button.getAttribute('data-copy')
      if (copyTarget) {
        copyToClipboard(copyTarget)
                
        // Update button to show copied state
        const originalHTML = button.innerHTML
        button.classList.add('copied')
        button.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>'
                
        setTimeout(() => {
          button.classList.remove('copied')
          button.innerHTML = originalHTML
        }, 2000)
      }
    }
  })
    
  // Copy all button listener
  const copyAllBtn = document.getElementById('copyAllBtn')
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      copyAllResults()
            
      // Update button to show copied state
      const originalText = copyAllBtn.textContent
      copyAllBtn.textContent = '✓ All Results Copied!'
      copyAllBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
            
      setTimeout(() => {
        copyAllBtn.textContent = originalText
        copyAllBtn.style.background = ''
      }, 2000)
    })
  }
    
  // Load history on page load
  loadHistory()
    
  // History item click listener
  document.addEventListener('click', (e) => {
    const historyItem = e.target.closest('.history-item')
    if (historyItem) {
      const ip = historyItem.getAttribute('data-ip')
      const cidr = historyItem.getAttribute('data-cidr')
      loadFromHistory(ip, cidr)
    }
  })
    
  // Clear history button listener
  const clearHistoryBtn = document.getElementById('clearHistoryBtn')
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all calculation history?')) {
        window.electronAPI.storage.clearHistory()
        loadHistory()
        window.electronAPI.log.info('History cleared')
      }
    })
  }
})