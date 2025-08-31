import React, { useState } from 'react'
import './SubnetCalculatorTool.css'

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

interface ValidationResult {
  isWithinSubnet: boolean
  ipAddress: string
  targetNetwork: string
  targetCidr: number
  targetNetworkAddress: string
  targetBroadcastAddress: string
  targetSubnetMask: string
}

type CalculatorMode = 'checker' | 'calculator'

export const SubnetCalculatorTool: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('checker')
  const [ipAddress, setIpAddress] = useState<string>('')
  const [subnet, setSubnet] = useState<string>('')
  const [targetSubnet, setTargetSubnet] = useState<string>('')
  const [results, setResults] = useState<SubnetResults | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const validateIPAddress = (ip: string): boolean => {
    const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = ip.match(regex)
    
    if (!match) return false
    
    return match.slice(1).every(octet => {
      const num = parseInt(octet, 10)
      return num >= 0 && num <= 255
    })
  }

  const validateSubnetMask = (mask: string): boolean => {
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

  const maskToCIDR = (mask: string): number => {
    if (mask.startsWith('/')) {
      return parseInt(mask.substring(1), 10)
    }
    
    const octets = mask.split('.').map(o => parseInt(o, 10))
    const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('')
    return binary.split('1').length - 1
  }

  const handleCalculate = async () => {
    setError('')
    setResults(null)
    setValidationResult(null)

    if (!ipAddress) {
      setError(mode === 'checker' ? 'Please enter an IP address to check' : 'Please enter an IP address')
      return
    }

    if (!validateIPAddress(ipAddress)) {
      setError('Please enter a valid IP address')
      return
    }

    if (mode === 'calculator') {
      if (!subnet) {
        setError('Please enter a subnet mask or CIDR')
        return
      }

      if (!validateSubnetMask(subnet)) {
        setError('Please enter a valid subnet mask or CIDR notation')
        return
      }

      const cidr = maskToCIDR(subnet)
      setIsCalculating(true)

      try {
        const result = await window.electronAPI.calculateSubnet(ipAddress, cidr)
        if (result.success) {
          setResults(result.data)
        } else {
          setError(result.error || 'Calculation failed')
        }
      } catch (err) {
        setError('An error occurred during calculation')
      } finally {
        setIsCalculating(false)
      }
    } else {
      // Checker mode
      if (!targetSubnet) {
        setError('Please enter a target subnet')
        return
      }

      // Parse target subnet
      let targetNetwork = ''
      let targetCidr = 0

      if (targetSubnet.includes('/')) {
        const parts = targetSubnet.split('/')
        targetNetwork = parts[0].trim()
        targetCidr = parseInt(parts[1], 10)

        if (!validateIPAddress(targetNetwork)) {
          setError('Invalid network address in target subnet')
          return
        }

        if (isNaN(targetCidr) || targetCidr < 0 || targetCidr > 32) {
          setError('Invalid CIDR notation (must be 0-32)')
          return
        }
      } else if (targetSubnet.includes(' ')) {
        const parts = targetSubnet.split(' ')
        targetNetwork = parts[0].trim()
        const mask = parts[1].trim()

        if (!validateIPAddress(targetNetwork)) {
          setError('Invalid network address in target subnet')
          return
        }

        if (!validateSubnetMask(mask)) {
          setError('Invalid subnet mask')
          return
        }

        targetCidr = maskToCIDR(mask)
      } else {
        setError('Please use format: 192.168.1.0/24 or 192.168.1.0 255.255.255.0')
        return
      }

      setIsCalculating(true)

      try {
        const targetResult = await window.electronAPI.calculateSubnet(targetNetwork, targetCidr)
        
        if (targetResult.success) {
          // Check if IP is within the subnet
          const ipOctets = ipAddress.split('.').map((o: string) => parseInt(o, 10))
          const networkOctets = targetResult.data.networkAddress.split('.').map((o: string) => parseInt(o, 10))
          const broadcastOctets = targetResult.data.broadcastAddress.split('.').map((o: string) => parseInt(o, 10))
          
          // Convert to 32-bit unsigned integers for comparison
          const ipInt = (ipOctets[0] * 16777216) + (ipOctets[1] * 65536) + (ipOctets[2] * 256) + ipOctets[3]
          const networkInt = (networkOctets[0] * 16777216) + (networkOctets[1] * 65536) + (networkOctets[2] * 256) + networkOctets[3]
          const broadcastInt = (broadcastOctets[0] * 16777216) + (broadcastOctets[1] * 65536) + (broadcastOctets[2] * 256) + broadcastOctets[3]
          
          const isWithinSubnet = ipInt >= networkInt && ipInt <= broadcastInt
          
          setValidationResult({
            isWithinSubnet,
            ipAddress,
            targetNetwork,
            targetCidr,
            targetNetworkAddress: targetResult.data.networkAddress,
            targetBroadcastAddress: targetResult.data.broadcastAddress,
            targetSubnetMask: targetResult.data.subnetMask
          })
        } else {
          setError(targetResult.error || 'Validation failed')
        }
      } catch (err) {
        setError('An error occurred during validation')
      } finally {
        setIsCalculating(false)
      }
    }
  }

  const handleClear = () => {
    setIpAddress('')
    setSubnet('')
    setTargetSubnet('')
    setResults(null)
    setValidationResult(null)
    setError('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllResults = () => {
    if (results) {
      const text = `Network Address: ${results.networkAddress}
Broadcast Address: ${results.broadcastAddress}
Subnet Mask: ${results.subnetMask}
CIDR: /${results.cidr}
Host Range: ${results.usableHosts > 0 ? `${results.firstHost} - ${results.lastHost}` : 'N/A'}
Total Hosts: ${results.totalHosts} (${results.usableHosts} usable)
IP Class: ${results.ipClass}`
      copyToClipboard(text)
    } else if (validationResult) {
      const text = `IP Address: ${validationResult.ipAddress}
Status: ${validationResult.isWithinSubnet ? 'Within subnet' : 'Not in subnet'}
Target Network: ${validationResult.targetNetwork}/${validationResult.targetCidr}
Network Address: ${validationResult.targetNetworkAddress}
Broadcast Address: ${validationResult.targetBroadcastAddress}
Subnet Mask: ${validationResult.targetSubnetMask}`
      copyToClipboard(text)
    }
  }

  return (
    <div className="subnet-calculator-tool">
      <div className="tool-header">
        <h2>Subnet Calculator</h2>
        <p>
          {mode === 'checker' 
            ? 'Check if an IP address is within a specified subnet'
            : 'Calculate network addresses, broadcast addresses, and available host ranges'}
        </p>
      </div>

      <div className="input-controls">
        <div className="control-group">
          <label>Mode:</label>
          <select 
            value={mode} 
            onChange={(e) => {
              setMode(e.target.value as CalculatorMode)
              handleClear()
            }}
          >
            <option value="checker">Subnet Checker - Validate if IP is within subnet</option>
            <option value="calculator">Subnet Calculator - Calculate subnet details</option>
          </select>
        </div>

        <div className="control-group">
          <label>{mode === 'checker' ? 'IP Address to Check:' : 'IP Address:'}</label>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder={mode === 'checker' ? 'e.g., 192.168.1.50' : 'e.g., 192.168.1.0'}
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          />
        </div>

        {mode === 'checker' ? (
          <div className="control-group flex-grow">
            <label>Target Subnet to Check Against:</label>
            <input
              type="text"
              value={targetSubnet}
              onChange={(e) => setTargetSubnet(e.target.value)}
              placeholder="e.g., 192.168.1.0/24 or 192.168.1.0 255.255.255.0"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
          </div>
        ) : (
          <div className="control-group flex-grow">
            <label>Subnet Mask / CIDR:</label>
            <input
              type="text"
              value={subnet}
              onChange={(e) => setSubnet(e.target.value)}
              placeholder="e.g., 255.255.255.0 or /24"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
          </div>
        )}

        <div className="button-controls">
          <button 
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? 'Processing...' : (mode === 'checker' ? 'Check IP' : 'Calculate')}
          </button>
          <button 
            className="clear-btn"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {validationResult && (
        <div className="results-section">
          <div className="results-header">
            <h3>Validation Result</h3>
            <button className="copy-btn" onClick={copyAllResults}>Copy All</button>
          </div>
          <div className="results-content">
            <div className={`validation-status ${validationResult.isWithinSubnet ? 'status-success' : 'status-error'}`}>
              <span className="status-icon">{validationResult.isWithinSubnet ? '✓' : '✗'}</span>
              <span>
                IP {validationResult.ipAddress} {validationResult.isWithinSubnet ? 'IS' : 'is NOT'} within subnet {validationResult.targetNetwork}/{validationResult.targetCidr}
              </span>
            </div>
            <div className="result-grid">
              <div className="result-item">
                <label>Network Address:</label>
                <div className="result-value">
                  <span>{validationResult.targetNetworkAddress}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(validationResult.targetNetworkAddress)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>Broadcast Address:</label>
                <div className="result-value">
                  <span>{validationResult.targetBroadcastAddress}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(validationResult.targetBroadcastAddress)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>Subnet Mask:</label>
                <div className="result-value">
                  <span>{validationResult.targetSubnetMask}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(validationResult.targetSubnetMask)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>CIDR:</label>
                <div className="result-value">
                  <span>/{validationResult.targetCidr}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(`/${validationResult.targetCidr}`)}>📋</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h3>Calculation Results</h3>
            <button className="copy-btn" onClick={copyAllResults}>Copy All</button>
          </div>
          <div className="results-content">
            <div className="result-grid">
              <div className="result-item">
                <label>Network Address:</label>
                <div className="result-value">
                  <span>{results.networkAddress}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(results.networkAddress)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>Broadcast Address:</label>
                <div className="result-value">
                  <span>{results.broadcastAddress}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(results.broadcastAddress)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>Subnet Mask:</label>
                <div className="result-value">
                  <span>{results.subnetMask}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(results.subnetMask)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>CIDR Notation:</label>
                <div className="result-value">
                  <span>/{results.cidr}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(`/${results.cidr}`)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>IP Class:</label>
                <div className="result-value">
                  <span>{results.ipClass}</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(results.ipClass)}>📋</button>
                </div>
              </div>
              <div className="result-item">
                <label>Total Hosts:</label>
                <div className="result-value">
                  <span>{results.totalHosts.toLocaleString()} ({results.usableHosts.toLocaleString()} usable)</span>
                  <button className="copy-icon" onClick={() => copyToClipboard(`${results.totalHosts} (${results.usableHosts} usable)`)}>📋</button>
                </div>
              </div>
              {results.usableHosts > 0 && (
                <div className="result-item">
                  <label>Host Range:</label>
                  <div className="result-value">
                    <span>{results.firstHost} - {results.lastHost}</span>
                    <button className="copy-icon" onClick={() => copyToClipboard(`${results.firstHost} - ${results.lastHost}`)}>📋</button>
                  </div>
                </div>
              )}
              <div className="result-item full-width">
                <label>IP Binary:</label>
                <div className="result-value">
                  <code>{results.ipBinary}</code>
                  <button className="copy-icon" onClick={() => copyToClipboard(results.ipBinary)}>📋</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>Quick Reference</h4>
        <ul>
          <li><code>/24</code> = 255.255.255.0 = 256 addresses (254 usable hosts)</li>
          <li><code>/16</code> = 255.255.0.0 = 65,536 addresses (65,534 usable hosts)</li>
          <li><code>/30</code> = 255.255.255.252 = 4 addresses (2 usable hosts, point-to-point)</li>
          <li><code>/32</code> = 255.255.255.255 = 1 address (single host)</li>
        </ul>
        <h4>Tips</h4>
        <ul>
          <li>Use Subnet Checker mode to quickly validate if an IP belongs to a subnet</li>
          <li>Use Subnet Calculator mode for detailed network planning</li>
          <li>Both CIDR notation (/24) and subnet masks (255.255.255.0) are supported</li>
        </ul>
      </div>
    </div>
  )
}