const { spawn } = require('child_process')
const net = require('net')
const log = require('electron-log/main')

class NetworkTools {
  /**
   * Execute ping command
   * @param {string} host - Hostname or IP to ping
   * @param {number} count - Number of pings to send
   * @param {function} onData - Callback for data chunks
   * @param {function} onComplete - Callback when complete
   */
  ping(host, count = 4, onData, onComplete) {
    const isWindows = process.platform === 'win32'
    const pingCmd = isWindows ? 'ping' : 'ping'
    const args = isWindows 
      ? [`-n`, count.toString(), host]
      : [`-c`, count.toString(), host]

    log.info(`Starting ping to ${host} with count ${count}`)
    
    const pingProcess = spawn(pingCmd, args)
    let output = ''

    pingProcess.stdout.on('data', (data) => {
      const chunk = data.toString()
      output += chunk
      if (onData) onData(chunk)
    })

    pingProcess.stderr.on('data', (data) => {
      const error = data.toString()
      log.error('Ping error:', error)
      if (onData) onData(`Error: ${error}`)
    })

    pingProcess.on('close', (code) => {
      log.info(`Ping process exited with code ${code}`)
      if (onComplete) {
        onComplete({
          success: code === 0,
          output,
          code
        })
      }
    })

    return pingProcess
  }

  /**
   * Execute traceroute command
   * @param {string} host - Hostname or IP to trace
   * @param {function} onData - Callback for data chunks
   * @param {function} onComplete - Callback when complete
   */
  traceroute(host, onData, onComplete) {
    const isWindows = process.platform === 'win32'
    const traceCmd = isWindows ? 'tracert' : 'traceroute'
    const args = [host]

    log.info(`Starting traceroute to ${host}`)
    
    const traceProcess = spawn(traceCmd, args)
    let output = ''

    traceProcess.stdout.on('data', (data) => {
      const chunk = data.toString()
      output += chunk
      if (onData) onData(chunk)
    })

    traceProcess.stderr.on('data', (data) => {
      const error = data.toString()
      log.error('Traceroute error:', error)
      if (onData) onData(`Error: ${error}`)
    })

    traceProcess.on('close', (code) => {
      log.info(`Traceroute process exited with code ${code}`)
      if (onComplete) {
        onComplete({
          success: code === 0,
          output,
          code
        })
      }
    })

    return traceProcess
  }

  /**
   * Lookup ASN information using Hurricane Electric's telnet service
   * @param {string} ip - IP address to lookup
   * @param {function} onData - Callback for data chunks
   * @param {function} onComplete - Callback when complete
   */
  lookupASN(ip, onData, onComplete) {
    log.info(`Looking up ASN for IP: ${ip}`)
    
    const client = new net.Socket()
    let output = ''
    let error = null

    // Connect to Hurricane Electric's ASN lookup service
    // whois.he.net on port 43 (standard whois port)
    client.connect(43, 'whois.he.net', () => {
      log.info('Connected to Hurricane Electric whois service')
      // Send the IP address to lookup
      client.write(`${ip}\r\n`)
    })

    client.on('data', (data) => {
      const chunk = data.toString()
      output += chunk
      
      // Parse ASN information from the response
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.includes('AS') || line.includes('Origin') || line.includes('Description')) {
          if (onData) onData(line + '\n')
        }
      }
    })

    client.on('error', (err) => {
      error = err
      log.error('ASN lookup error:', err)
      if (onData) onData(`Error: ${err.message}\n`)
    })

    client.on('close', () => {
      log.info('ASN lookup connection closed')
      if (onComplete) {
        onComplete({
          success: !error,
          output,
          error: error?.message
        })
      }
    })

    // Set timeout for the connection
    client.setTimeout(10000)
    client.on('timeout', () => {
      log.warn('ASN lookup timeout')
      client.destroy()
      if (onData) onData('Connection timeout\n')
    })

    return client
  }

  /**
   * Enhanced ASN lookup with BGP information
   * @param {string} ip - IP address to lookup
   * @param {function} onData - Callback for data chunks
   * @param {function} onComplete - Callback when complete
   */
  lookupBGPInfo(ip, onData, onComplete) {
    log.info(`Looking up BGP info for IP: ${ip}`)
    
    const client = new net.Socket()
    let output = ''
    let parsedInfo = {
      ip: ip,
      asn: null,
      asnName: null,
      network: null,
      country: null,
      registry: null,
      allocated: null,
      bgpPrefix: null
    }

    // Alternative: Use route-views.routeviews.org telnet service
    client.connect(23, 'route-views.routeviews.org', () => {
      log.info('Connected to Route Views telnet service')
      // Login sequence for route-views
      setTimeout(() => {
        client.write(`show ip bgp ${ip}\r\n`)
        setTimeout(() => {
          client.write('exit\r\n')
        }, 3000)
      }, 1000)
    })

    client.on('data', (data) => {
      const chunk = data.toString()
      output += chunk
      
      // Parse BGP information
      const lines = chunk.split('\n')
      for (const line of lines) {
        // Look for AS path information
        if (line.includes('AS path:') || line.includes('Origin AS:')) {
          const asnMatch = line.match(/\b(AS\d+|\d+)\b/g)
          if (asnMatch && asnMatch.length > 0) {
            parsedInfo.asn = asnMatch[asnMatch.length - 1].replace('AS', '')
          }
        }
        // Look for network prefix
        if (line.includes('/')) {
          const prefixMatch = line.match(/\d+\.\d+\.\d+\.\d+\/\d+/)
          if (prefixMatch) {
            parsedInfo.bgpPrefix = prefixMatch[0]
          }
        }
        
        if (onData) onData(line + '\n')
      }
    })

    client.on('error', (err) => {
      log.error('BGP lookup error:', err)
      if (onData) onData(`Error: ${err.message}\n`)
    })

    client.on('close', () => {
      log.info('BGP lookup connection closed')
      if (onComplete) {
        onComplete({
          success: true,
          output,
          parsed: parsedInfo
        })
      }
    })

    client.setTimeout(15000)
    client.on('timeout', () => {
      log.warn('BGP lookup timeout')
      client.destroy()
    })

    return client
  }

  /**
   * Perform DNS lookup
   * @param {string} hostname - Hostname to resolve
   * @param {function} callback - Callback with results
   */
  dnsLookup(hostname, callback) {
    const dns = require('dns').promises
    
    Promise.all([
      dns.resolve4(hostname).catch(() => []),
      dns.resolve6(hostname).catch(() => []),
      dns.resolveMx(hostname).catch(() => []),
      dns.resolveTxt(hostname).catch(() => []),
      dns.resolveNs(hostname).catch(() => [])
    ]).then(([ipv4, ipv6, mx, txt, ns]) => {
      callback({
        success: true,
        ipv4,
        ipv6,
        mx,
        txt,
        ns
      })
    }).catch(error => {
      callback({
        success: false,
        error: error.message
      })
    })
  }
}

module.exports = new NetworkTools()