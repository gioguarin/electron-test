import React, { useState, useRef, useEffect } from 'react'
import './BGPRouteServerTool.css'

interface RouteServer {
  name: string
  host: string
  location: string
  asn: string
}

const ROUTE_SERVERS: RouteServer[] = [
  { name: 'Hurricane Electric', host: 'route-server.he.net', location: 'Global', asn: 'AS6939' }
]

interface CommandOption {
  label: string
  value: string
  description: string
}

const COMMANDS: CommandOption[] = [
  { label: 'Show IP BGP (IPv4)', value: 'show ip bgp', description: 'Show BGP routing info for IPv4 address' },
  { label: 'Show IPv6 BGP', value: 'show ipv6 bgp', description: 'Show BGP routing info for IPv6 address' },
  { label: 'Show IP BGP Summary', value: 'show ip bgp summary', description: 'Show IPv4 BGP peer summary' },
  { label: 'Show IPv6 BGP Summary', value: 'show ipv6 bgp summary', description: 'Show IPv6 BGP peer summary' },
  { label: 'Show IP Route', value: 'show ip route', description: 'Show IPv4 routing table entry' },
  { label: 'Show IPv6 Route', value: 'show ipv6 route', description: 'Show IPv6 routing table entry' },
  { label: 'Traceroute', value: 'traceroute', description: 'Trace route to destination' },
  { label: 'Ping', value: 'ping', description: 'Test connectivity to destination' },
  { label: 'Show BGP Neighbors', value: 'show bgp neighbors', description: 'Show BGP neighbor details' },
  { label: 'Show IP BGP Neighbors', value: 'show ip bgp neighbors', description: 'Show IPv4 BGP neighbor details' },
  { label: 'Show IPv6 BGP Neighbors', value: 'show ipv6 bgp neighbors', description: 'Show IPv6 BGP neighbor details' },
  { label: 'Help', value: '?', description: 'Show available commands' },
]

export const BGPRouteServerTool: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<RouteServer>(ROUTE_SERVERS[0])
  const [command, setCommand] = useState<string>('show ip bgp')
  const [target, setTarget] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const outputRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (sessionId) {
        disconnectSession()
      }
    }
  }, [sessionId])

  const connectToServer = async () => {
    if (isConnecting || isConnected) return
    
    setIsConnecting(true)
    setOutput('')  // Clear output for new connection
    
    // Set up data listener first
    const cleanup = window.electronAPI.networkTools.onRouteServerData((data: any) => {
      setOutput(prev => prev + data.data)
      // Auto-scroll to bottom
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    })
    
    try {
      const result = await window.electronAPI.networkTools.connectRouteServer(selectedServer.host)
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId)
        setIsConnected(true)
        
        // Store cleanup function
        if (result.sessionId) {
          (window as any)[`cleanup_${result.sessionId}`] = cleanup
        }
      } else {
        setOutput(prev => prev + `\nFailed to connect: ${result.error}\n`)
        cleanup()  // Clean up listener on failure
      }
    } catch (error) {
      setOutput(prev => prev + `\nError: ${error}\n`)
      cleanup()  // Clean up listener on error
    } finally {
      setIsConnecting(false)
    }
  }

  const sendCommand = async () => {
    if (!isConnected || !sessionId) return
    
    // Commands that don't need a target
    const noTargetCommands = ['summary', 'neighbors', '?']
    const needsTarget = !noTargetCommands.some(cmd => command.includes(cmd))
    if (needsTarget && !target.trim()) return
    
    const fullCommand = needsTarget ? `${command} ${target.trim()}` : command
    
    try {
      await window.electronAPI.networkTools.sendRouteServerCommand(sessionId, fullCommand)
    } catch (error) {
      setOutput(prev => prev + `\nError sending command: ${error}\n`)
    }
  }

  const disconnectSession = async () => {
    if (sessionId) {
      try {
        await window.electronAPI.networkTools.disconnectRouteServer(sessionId)
        
        // Cleanup listener
        const cleanup = (window as any)[`cleanup_${sessionId}`]
        if (cleanup) {
          cleanup()
          delete (window as any)[`cleanup_${sessionId}`]
        }
      } catch (error) {
        console.error('Error disconnecting:', error)
      }
      
      setSessionId(null)
      setIsConnected(false)
      setOutput(prev => prev + '\n[Session closed]\n')
    }
  }

  const clearOutput = () => {
    setOutput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendCommand()
    }
  }

  return (
    <div className="bgp-route-server-tool">
      <div className="tool-header">
        <h2>BGP Route Server Tool</h2>
        <p>Connect to Hurricane Electric route servers for network diagnostics</p>
      </div>

      <div className="server-controls">
        <div className="control-group">
          <label>Route Server:</label>
          <select 
            value={selectedServer.host} 
            onChange={(e) => {
              const server = ROUTE_SERVERS.find(s => s.host === e.target.value)
              if (server) {
                if (isConnected) {
                  disconnectSession()
                }
                setSelectedServer(server)
              }
            }}
            disabled={isConnected}
          >
            {ROUTE_SERVERS.map(server => (
              <option key={server.host} value={server.host}>
                {server.name} - {server.location} ({server.asn})
              </option>
            ))}
          </select>
        </div>

        <div className="connection-controls">
          {!isConnected ? (
            <button 
              className="connect-btn"
              onClick={connectToServer}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button 
              className="disconnect-btn"
              onClick={disconnectSession}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {isConnected && (
        <div className="command-controls">
          <div className="control-group">
            <label>Command:</label>
            <select 
              value={command} 
              onChange={(e) => setCommand(e.target.value)}
            >
              {COMMANDS.map(cmd => (
                <option key={cmd.value} value={cmd.value} title={cmd.description}>
                  {cmd.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group flex-grow">
            <label>
              {command.includes('summary') || command.includes('neighbors') || command === '?' 
                ? 'Target (Not Required):' 
                : 'Target (IP or Hostname):'}
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                command.includes('summary') || command.includes('neighbors') || command === '?' 
                  ? 'Not required for this command' :
                command.includes('ipv6') 
                  ? 'e.g., 2001:4860:4860::8888' :
                command.includes('bgp') || command.includes('route') 
                  ? 'e.g., 8.8.8.8' :
                  'e.g., 8.8.8.8 or google.com'
              }
              disabled={command.includes('summary') || command.includes('neighbors') || command === '?'}
            />
          </div>

          <button 
            className="send-btn"
            onClick={sendCommand}
            disabled={
              (command.includes('summary') || command.includes('neighbors') || command === '?') 
                ? false 
                : !target.trim()
            }
          >
            Send Command
          </button>
        </div>
      )}

      <div className="output-section">
        <div className="output-header">
          <h3>Output</h3>
          <button className="clear-btn" onClick={clearOutput}>
            Clear
          </button>
        </div>
        <pre ref={outputRef} className="output-content">
          {output || 'No output yet. Connect to a route server to begin.'}
        </pre>
      </div>

      <div className="info-section">
        <h4>About BGP Route Servers</h4>
        <ul>
          <li>Route servers provide a looking glass into BGP routing tables</li>
          <li>Perform traceroutes from different geographic locations</li>
          <li>View BGP routing information and AS paths</li>
          <li>Test connectivity from major internet exchange points</li>
        </ul>
        
        <h4>Common Commands</h4>
        <ul>
          <li><code>show ip bgp &lt;ip&gt;</code> - Show BGP info for IPv4 address</li>
          <li><code>show ipv6 bgp &lt;ipv6&gt;</code> - Show BGP info for IPv6 address</li>
          <li><code>show ip bgp summary</code> - Show IPv4 BGP peer summary</li>
          <li><code>show ipv6 bgp summary</code> - Show IPv6 BGP peer summary</li>
          <li><code>show ip route &lt;ip&gt;</code> - Show IPv4 routing table entry</li>
          <li><code>show ipv6 route &lt;ipv6&gt;</code> - Show IPv6 routing table entry</li>
          <li><code>traceroute &lt;host&gt;</code> - Trace route to destination</li>
          <li><code>ping &lt;host&gt;</code> - Test connectivity</li>
          <li><code>show bgp neighbors</code> - Show all BGP neighbors</li>
          <li><code>?</code> - Show all available commands</li>
        </ul>
      </div>
    </div>
  )
}