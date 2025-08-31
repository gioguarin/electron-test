// Renderer process JavaScript
// This file contains the UI logic for the subnet calculator

// Display version information
window.addEventListener('DOMContentLoaded', () => {
  const versions = window.electronAPI.getVersions()
  document.getElementById('node-version').textContent = versions.node
  document.getElementById('chrome-version').textContent = versions.chrome
  document.getElementById('electron-version').textContent = versions.electron
  
  // Set focus to IP input if it exists
  const ipInput = document.getElementById('ip')
  if (ipInput) {
    ipInput.focus()
  }
})

// Input validation
function validateIPAddress(ip) {
  const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ip.match(regex)
  
  if (!match) return false
  
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10)
    return num >= 0 && num <= 255
  })
}

function validateCIDR(cidr) {
  const num = parseInt(cidr, 10)
  return !isNaN(num) && num >= 0 && num <= 32
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message')
  errorElement.textContent = message
  errorElement.classList.add('show')
  
  setTimeout(() => {
    errorElement.classList.remove('show')
  }, 5000)
}

// Clear error message
function clearError() {
  const errorElement = document.getElementById('error-message')
  errorElement.classList.remove('show')
}

// Handle calculation
async function calculateSubnet() {
  const ipInput = document.getElementById('ip')
  const cidrInput = document.getElementById('subnet')
  const ip = ipInput.value.trim()
  const cidr = cidrInput.value.trim()

  // Clear previous errors
  clearError()
  ipInput.classList.remove('error')
  cidrInput.classList.remove('error')

  // Validate inputs
  if (!ip) {
    ipInput.classList.add('error')
    showError('Please enter an IP address')
    return
  }

  if (!validateIPAddress(ip)) {
    ipInput.classList.add('error')
    showError('Invalid IP address format')
    return
  }

  if (!cidr) {
    cidrInput.classList.add('error')
    showError('Please enter a CIDR prefix')
    return
  }

  if (!validateCIDR(cidr)) {
    cidrInput.classList.add('error')
    showError('CIDR prefix must be between 0 and 32')
    return
  }

  try {
    // Call the Electron API
    const result = await window.electronAPI.calculateSubnet(ip, parseInt(cidr, 10))
    
    if (result.success) {
      displayResults(result.data)
      saveToHistory(ip, cidr, result.data)
    } else {
      showError(result.error || 'Calculation failed')
    }
  } catch (error) {
    showError('An error occurred during calculation')
    console.error(error)
  }
}

// Display results
function displayResults(data) {
  document.getElementById('network-address').textContent = data.networkAddress
  document.getElementById('broadcast-address').textContent = data.broadcastAddress
  document.getElementById('subnet-mask').textContent = data.subnetMask
  document.getElementById('cidr-notation').textContent = `/${data.cidr}`
  document.getElementById('first-host').textContent = data.firstHost
  document.getElementById('last-host').textContent = data.lastHost
  document.getElementById('total-hosts').textContent = data.totalHosts.toLocaleString()
  document.getElementById('usable-hosts').textContent = data.usableHosts.toLocaleString()
  document.getElementById('ip-class').textContent = data.ipClass
  document.getElementById('ip-binary').textContent = data.ipBinary

  // Show results section with animation
  const resultsSection = document.getElementById('results')
  resultsSection.classList.add('show')
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Save to history (localStorage)
function saveToHistory(ip, cidr, data) {
  try {
    const history = JSON.parse(localStorage.getItem('subnetHistory') || '[]')
    const entry = {
      timestamp: new Date().toISOString(),
      ip,
      cidr,
      network: data.networkAddress,
      mask: data.subnetMask
    }
    
    // Add to beginning and limit to 10 entries
    history.unshift(entry)
    if (history.length > 10) {
      history.pop()
    }
    
    localStorage.setItem('subnetHistory', JSON.stringify(history))
  } catch (error) {
    console.warn('Failed to save to history:', error)
  }
}

// Load history
function loadHistory() {
  try {
    const history = JSON.parse(localStorage.getItem('subnetHistory') || '[]')
    return history
  } catch (error) {
    console.warn('Failed to load history:', error)
    return []
  }
}

// Event listeners
document.getElementById('calculateBtn').addEventListener('click', calculateSubnet)

// Back button navigation
const backButton = document.getElementById('backButton')
if (backButton) {
  backButton.addEventListener('click', () => {
    window.electronAPI.navigateToHome()
  })
}

// Allow Enter key to trigger calculation
const ipElement = document.getElementById('ip')
const subnetElement = document.getElementById('subnet')

if (ipElement) {
  ipElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      calculateSubnet()
    }
  })
  
  ipElement.addEventListener('input', () => {
    ipElement.classList.remove('error')
    clearError()
  })
}

if (subnetElement) {
  subnetElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      calculateSubnet()
    }
  })
  
  subnetElement.addEventListener('input', () => {
    subnetElement.classList.remove('error')
    clearError()
  })
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+K or Cmd+K to clear inputs
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    const ipInput = document.getElementById('ip')
    const subnetInput = document.getElementById('subnet')
    if (ipInput) ipInput.value = ''
    if (subnetInput) subnetInput.value = ''
    if (ipInput) ipInput.focus()
    const results = document.getElementById('results')
    if (results) results.classList.remove('show')
  }
  
  // Escape to clear errors
  if (e.key === 'Escape') {
    clearError()
  }
})