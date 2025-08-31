import React, { useState, useRef, useEffect } from 'react'
import './ASNLookupTool.css'

interface ASNInfo {
  ip: string
  asn: string | null
  asnName: string | null
  network: string | null
  country: string | null
  description: string | null
}

export const ASNLookupTool: React.FC = () => {
  const [ip, setIp] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [asnInfo, setAsnInfo] = useState<ASNInfo | null>(null)
  const [history, setHistory] = useState<ASNInfo[]>([])
  const outputRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('asnHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load ASN history:', e)
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const validateIP = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
    
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.')
      return parts.every(part => {
        const num = parseInt(part)
        return num >= 0 && num <= 255
      })
    }
    
    return ipv6Regex.test(ip)
  }

  const lookupASN = async () => {
    if (!ip.trim()) {
      alert('Please enter an IP address')
      return
    }

    if (!validateIP(ip.trim())) {
      alert('Please enter a valid IP address')
      return
    }

    setIsRunning(true)
    setOutput([])
    setAsnInfo(null)

    const info: ASNInfo = {
      ip: ip.trim(),
      asn: null,
      asnName: null,
      network: null,
      country: null,
      description: null
    }

    // Set up data listener
    cleanupRef.current = window.electronAPI.networkTools.onAsnData((data: string) => {
      setOutput(prev => [...prev, data])
      
      // Parse ASN information from the response
      const lines = data.split('\n')
      for (const line of lines) {
        // Look for ASN number
        if (line.includes('AS') && !info.asn) {
          const asnMatch = line.match(/AS(\d+)/)
          if (asnMatch) {
            info.asn = asnMatch[1]
          }
        }
        
        // Look for organization/description
        if (line.toLowerCase().includes('descr') || line.toLowerCase().includes('organization')) {
          const descrMatch = line.match(/:\s*(.+)/)
          if (descrMatch && !info.description) {
            info.description = descrMatch[1].trim()
          }
        }
        
        // Look for network/route
        if (line.includes('route') || line.includes('prefix')) {
          const routeMatch = line.match(/(\d+\.\d+\.\d+\.\d+\/\d+)/)
          if (routeMatch && !info.network) {
            info.network = routeMatch[1]
          }
        }
        
        // Look for country
        if (line.toLowerCase().includes('country')) {
          const countryMatch = line.match(/country:\s*([A-Z]{2})/i)
          if (countryMatch && !info.country) {
            info.country = countryMatch[1].toUpperCase()
          }
        }
      }
    })

    try {
      const result = await window.electronAPI.networkTools.asnLookup(ip.trim())
      
      if (result.success) {
        setOutput(prev => [...prev, '\n✓ ASN lookup completed'])
        setAsnInfo(info)
        
        // Save to history
        if (info.asn) {
          const newHistory = [info, ...history.filter(h => h.ip !== info.ip)].slice(0, 20)
          setHistory(newHistory)
          localStorage.setItem('asnHistory', JSON.stringify(newHistory))
        }
      } else {
        setOutput(prev => [...prev, '\n✗ ASN lookup failed'])
      }
    } catch (error) {
      setOutput(prev => [...prev, `\nError: ${error}`])
    } finally {
      setIsRunning(false)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }

  const lookupBGP = async () => {
    if (!ip.trim() || !validateIP(ip.trim())) {
      alert('Please enter a valid IP address')
      return
    }

    setIsRunning(true)
    setOutput(['\nQuerying BGP information from Route Views...\n'])

    const cleanup = window.electronAPI.networkTools.onBgpData((data: string) => {
      setOutput(prev => [...prev, data])
    })

    try {
      const result = await window.electronAPI.networkTools.bgpLookup(ip.trim())
      
      if (result.success && result.parsed) {
        const parsed = result.parsed
        setAsnInfo({
          ip: parsed.ip,
          asn: parsed.asn,
          asnName: parsed.asnName,
          network: parsed.bgpPrefix || parsed.network,
          country: parsed.country,
          description: null
        })
      }
    } catch (error) {
      setOutput(prev => [...prev, `\nError: ${error}`])
    } finally {
      setIsRunning(false)
      cleanup()
    }
  }

  const clearOutput = () => {
    setOutput([])
    setAsnInfo(null)
  }

  const copyOutput = () => {
    const text = output.join('')
    navigator.clipboard.writeText(text)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('asnHistory')
  }

  const loadFromHistory = (info: ASNInfo) => {
    setIp(info.ip)
    setAsnInfo(info)
    setOutput([`Loaded from history: ${info.ip}\n`])
  }

  return (
    <div className="asn-tool">
      <div className="asn-header">
        <h2>🌐 ASN Lookup Tool</h2>
        <p>Look up Autonomous System Number information using Hurricane Electric</p>
      </div>

      <div className="asn-controls">
        <div className="asn-input-group">
          <label>
            IP Address:
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              disabled={isRunning}
              onKeyPress={(e) => e.key === 'Enter' && !isRunning && lookupASN()}
            />
          </label>
        </div>

        <div className="asn-buttons">
          {!isRunning ? (
            <>
              <button className="asn-lookup" onClick={lookupASN}>
                ASN Lookup
              </button>
              <button className="bgp-lookup" onClick={lookupBGP}>
                BGP Info
              </button>
            </>
          ) : (
            <button className="asn-stop" disabled>
              Looking up...
            </button>
          )}
          <button className="asn-clear" onClick={clearOutput} disabled={isRunning}>
            Clear
          </button>
          <button className="asn-copy" onClick={copyOutput} disabled={output.length === 0}>
            Copy
          </button>
        </div>
      </div>

      {asnInfo && (
        <div className="asn-info">
          <h3>ASN Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">IP Address:</span>
              <span className="info-value">{asnInfo.ip}</span>
            </div>
            {asnInfo.asn && (
              <div className="info-item">
                <span className="info-label">ASN:</span>
                <span className="info-value asn-number">AS{asnInfo.asn}</span>
              </div>
            )}
            {asnInfo.asnName && (
              <div className="info-item">
                <span className="info-label">AS Name:</span>
                <span className="info-value">{asnInfo.asnName}</span>
              </div>
            )}
            {asnInfo.network && (
              <div className="info-item">
                <span className="info-label">Network:</span>
                <span className="info-value network">{asnInfo.network}</span>
              </div>
            )}
            {asnInfo.country && (
              <div className="info-item">
                <span className="info-label">Country:</span>
                <span className="info-value">{asnInfo.country}</span>
              </div>
            )}
            {asnInfo.description && (
              <div className="info-item full-width">
                <span className="info-label">Description:</span>
                <span className="info-value">{asnInfo.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="asn-content">
        <div className="asn-output" ref={outputRef}>
          {output.length === 0 ? (
            <div className="asn-placeholder">
              ASN lookup results will appear here...
            </div>
          ) : (
            <pre>{output.join('')}</pre>
          )}
        </div>

        {history.length > 0 && (
          <div className="asn-history">
            <div className="history-header">
              <h3>Recent Lookups</h3>
              <button className="clear-history" onClick={clearHistory}>
                Clear
              </button>
            </div>
            <div className="history-list">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                >
                  <span className="history-ip">{item.ip}</span>
                  {item.asn && <span className="history-asn">AS{item.asn}</span>}
                  {item.description && (
                    <span className="history-desc">{item.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}