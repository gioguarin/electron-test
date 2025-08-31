import React, { useState, useRef, useEffect } from 'react'
import './TracerouteTool.css'

interface Hop {
  number: number
  hostname?: string
  ip?: string
  times: string[]
  timeout?: boolean
}

export const TracerouteTool: React.FC = () => {
  const [host, setHost] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [hops, setHops] = useState<Hop[]>([])
  const outputRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
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

  const startTraceroute = async () => {
    if (!host.trim()) {
      alert('Please enter a hostname or IP address')
      return
    }

    setIsRunning(true)
    setOutput([])
    setHops([])

    // Set up data listener
    cleanupRef.current = window.electronAPI.networkTools.onTracerouteData((data: string) => {
      setOutput(prev => [...prev, data])
      parseHop(data)
    })

    try {
      const result = await window.electronAPI.networkTools.traceroute(host)
      
      if (result.success) {
        setOutput(prev => [...prev, '\n✓ Traceroute completed'])
      } else {
        setOutput(prev => [...prev, '\n✗ Traceroute failed'])
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

  const parseHop = (data: string) => {
    // Parse traceroute hop information
    // Linux/Mac format: " 1  192.168.1.1 (192.168.1.1)  0.407 ms  0.356 ms  0.333 ms"
    // Windows format: "  1     1 ms     1 ms     1 ms  192.168.1.1"
    
    const lines = data.split('\n')
    for (const line of lines) {
      // Skip empty lines and headers
      if (!line.trim() || line.includes('traceroute') || line.includes('Tracing')) {
        continue
      }

      // Linux/Mac format
      const linuxMatch = line.match(/^\s*(\d+)\s+(.+)/)
      if (linuxMatch) {
        const hopNum = parseInt(linuxMatch[1])
        const rest = linuxMatch[2]
        
        // Parse hostname and IP
        const hostMatch = rest.match(/([^\s]+)\s+\(([^)]+)\)(.*)/)
        let hop: Hop = { number: hopNum, times: [] }
        
        if (hostMatch) {
          hop.hostname = hostMatch[1]
          hop.ip = hostMatch[2]
          // Parse times
          const times = hostMatch[3].match(/[\d.]+\s+ms/g)
          if (times) {
            hop.times = times.map(t => t.trim())
          }
        } else if (rest.includes('*')) {
          hop.timeout = true
          hop.times = ['*', '*', '*']
        }
        
        setHops(prev => {
          const existing = prev.findIndex(h => h.number === hopNum)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = hop
            return updated
          }
          return [...prev, hop]
        })
      }

      // Windows format
      const winMatch = line.match(/^\s*(\d+)\s+([\d<]+\s+ms|\*)\s+([\d<]+\s+ms|\*)\s+([\d<]+\s+ms|\*)\s+(.*)/)
      if (winMatch) {
        const hop: Hop = {
          number: parseInt(winMatch[1]),
          times: [winMatch[2], winMatch[3], winMatch[4]].map(t => t.trim()),
          ip: winMatch[5].trim()
        }
        
        if (winMatch[5].includes('[')) {
          const ipMatch = winMatch[5].match(/([^\[]+)\s*\[([^\]]+)\]/)
          if (ipMatch) {
            hop.hostname = ipMatch[1].trim()
            hop.ip = ipMatch[2]
          }
        }
        
        setHops(prev => {
          const existing = prev.findIndex(h => h.number === hop.number)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = hop
            return updated
          }
          return [...prev, hop]
        })
      }
    }
  }

  const stopTraceroute = () => {
    setIsRunning(false)
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
  }

  const clearOutput = () => {
    setOutput([])
    setHops([])
  }

  const copyOutput = () => {
    const text = output.join('')
    navigator.clipboard.writeText(text)
  }

  const lookupASN = async (ip: string) => {
    if (!ip) return
    
    const asnWindow = window.open('', '_blank', 'width=600,height=400')
    if (asnWindow) {
      asnWindow.document.write(`
        <html>
          <head>
            <title>ASN Lookup: ${ip}</title>
            <style>
              body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #ccc; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h3>ASN Lookup for ${ip}</h3>
            <pre id="output">Looking up ASN information...</pre>
          </body>
        </html>
      `)
      
      const output: string[] = []
      const cleanup = window.electronAPI.networkTools.onAsnData((data: string) => {
        output.push(data)
        if (asnWindow && !asnWindow.closed) {
          const outputEl = asnWindow.document.getElementById('output')
          if (outputEl) {
            outputEl.textContent = output.join('')
          }
        }
      })
      
      try {
        await window.electronAPI.networkTools.asnLookup(ip)
      } finally {
        cleanup()
      }
    }
  }

  return (
    <div className="traceroute-tool">
      <div className="traceroute-header">
        <h2>🗺️ Traceroute Tool</h2>
        <p>Trace the path packets take to reach a destination</p>
      </div>

      <div className="traceroute-controls">
        <div className="traceroute-input-group">
          <label>
            Target Host:
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Enter hostname or IP address"
              disabled={isRunning}
              onKeyPress={(e) => e.key === 'Enter' && !isRunning && startTraceroute()}
            />
          </label>
        </div>

        <div className="traceroute-buttons">
          {!isRunning ? (
            <button className="traceroute-start" onClick={startTraceroute}>
              Start Traceroute
            </button>
          ) : (
            <button className="traceroute-stop" onClick={stopTraceroute}>
              Stop
            </button>
          )}
          <button className="traceroute-clear" onClick={clearOutput} disabled={isRunning}>
            Clear
          </button>
          <button className="traceroute-copy" onClick={copyOutput} disabled={output.length === 0}>
            Copy
          </button>
        </div>
      </div>

      {hops.length > 0 && (
        <div className="traceroute-hops">
          <h3>Route Hops</h3>
          <div className="hops-table">
            <div className="hop-header">
              <span className="hop-num">#</span>
              <span className="hop-host">Host</span>
              <span className="hop-ip">IP Address</span>
              <span className="hop-times">Response Times</span>
              <span className="hop-actions">Actions</span>
            </div>
            {hops.map(hop => (
              <div key={hop.number} className="hop-row">
                <span className="hop-num">{hop.number}</span>
                <span className="hop-host">{hop.hostname || '-'}</span>
                <span className="hop-ip">{hop.ip || '-'}</span>
                <span className="hop-times">
                  {hop.times.join(' / ')}
                </span>
                <span className="hop-actions">
                  {hop.ip && (
                    <button
                      className="asn-lookup-btn"
                      onClick={() => lookupASN(hop.ip!)}
                      title="Lookup ASN"
                    >
                      ASN
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="traceroute-output" ref={outputRef}>
        {output.length === 0 ? (
          <div className="traceroute-placeholder">
            Traceroute output will appear here...
          </div>
        ) : (
          <pre>{output.join('')}</pre>
        )}
      </div>
    </div>
  )
}