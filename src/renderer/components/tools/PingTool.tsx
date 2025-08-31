import React, { useState, useRef, useEffect } from 'react'
import './PingTool.css'

export const PingTool: React.FC = () => {
  const [host, setHost] = useState('')
  const [count, setCount] = useState(4)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new output arrives
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const startPing = async () => {
    if (!host.trim()) {
      alert('Please enter a hostname or IP address')
      return
    }

    setIsRunning(true)
    setOutput([])
    setStatistics(null)

    // Set up data listener
    cleanupRef.current = window.electronAPI.networkTools.onPingData((data: string) => {
      setOutput(prev => [...prev, data])
      
      // Parse statistics from output
      if (data.includes('packets transmitted') || data.includes('Packets:')) {
        parseStatistics(data)
      }
    })

    try {
      const result = await window.electronAPI.networkTools.ping(host, count)
      
      if (result.success) {
        setOutput(prev => [...prev, '\n✓ Ping completed successfully'])
      } else {
        setOutput(prev => [...prev, '\n✗ Ping failed'])
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

  const parseStatistics = (data: string) => {
    // Parse ping statistics
    const stats: any = {}
    
    // Linux/Mac format: "4 packets transmitted, 4 received, 0% packet loss"
    const linuxMatch = data.match(/(\d+) packets transmitted, (\d+) received, (\d+)% packet loss/)
    if (linuxMatch) {
      stats.transmitted = parseInt(linuxMatch[1])
      stats.received = parseInt(linuxMatch[2])
      stats.loss = parseInt(linuxMatch[3])
    }
    
    // Windows format: "Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"
    const winMatch = data.match(/Sent = (\d+), Received = (\d+), Lost = (\d+) \((\d+)% loss\)/)
    if (winMatch) {
      stats.transmitted = parseInt(winMatch[1])
      stats.received = parseInt(winMatch[2])
      stats.lost = parseInt(winMatch[3])
      stats.loss = parseInt(winMatch[4])
    }
    
    // Parse RTT statistics
    const rttMatch = data.match(/min\/avg\/max(?:\/mdev)? = ([\d.]+)\/([\d.]+)\/([\d.]+)/)
    if (rttMatch) {
      stats.min = parseFloat(rttMatch[1])
      stats.avg = parseFloat(rttMatch[2])
      stats.max = parseFloat(rttMatch[3])
    }
    
    if (Object.keys(stats).length > 0) {
      setStatistics(stats)
    }
  }

  const stopPing = () => {
    // In a real implementation, we'd need to kill the ping process
    setIsRunning(false)
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
  }

  const clearOutput = () => {
    setOutput([])
    setStatistics(null)
  }

  const copyOutput = () => {
    const text = output.join('')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="ping-tool">
      <div className="ping-header">
        <h2>🏓 Ping Tool</h2>
        <p>Test network connectivity to a host</p>
      </div>

      <div className="ping-controls">
        <div className="ping-input-group">
          <label>
            Target Host:
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Enter hostname or IP address"
              disabled={isRunning}
              onKeyPress={(e) => e.key === 'Enter' && !isRunning && startPing()}
            />
          </label>
        </div>

        <div className="ping-input-group">
          <label>
            Count:
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="100"
              disabled={isRunning}
            />
          </label>
        </div>

        <div className="ping-buttons">
          {!isRunning ? (
            <button className="ping-start" onClick={startPing}>
              Start Ping
            </button>
          ) : (
            <button className="ping-stop" onClick={stopPing}>
              Stop
            </button>
          )}
          <button className="ping-clear" onClick={clearOutput} disabled={isRunning}>
            Clear
          </button>
          <button className="ping-copy" onClick={copyOutput} disabled={output.length === 0}>
            Copy
          </button>
        </div>
      </div>

      {statistics && (
        <div className="ping-statistics">
          <h3>Statistics</h3>
          <div className="stat-grid">
            {statistics.transmitted !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Transmitted:</span>
                <span className="stat-value">{statistics.transmitted}</span>
              </div>
            )}
            {statistics.received !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Received:</span>
                <span className="stat-value">{statistics.received}</span>
              </div>
            )}
            {statistics.loss !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Packet Loss:</span>
                <span className={`stat-value ${statistics.loss > 0 ? 'loss' : 'success'}`}>
                  {statistics.loss}%
                </span>
              </div>
            )}
            {statistics.min !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Min RTT:</span>
                <span className="stat-value">{statistics.min}ms</span>
              </div>
            )}
            {statistics.avg !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Avg RTT:</span>
                <span className="stat-value">{statistics.avg}ms</span>
              </div>
            )}
            {statistics.max !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Max RTT:</span>
                <span className="stat-value">{statistics.max}ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ping-output" ref={outputRef}>
        {output.length === 0 ? (
          <div className="ping-placeholder">
            Ping output will appear here...
          </div>
        ) : (
          <pre>{output.join('')}</pre>
        )}
      </div>
    </div>
  )
}