// Subnet calculation utility functions

/**
 * Calculate subnet information from IP address and CIDR
 * @param {string} ipAddress - IP address in dot notation
 * @param {number} cidr - CIDR prefix length (0-32)
 * @returns {Object} Subnet information
 */
function calculateSubnetInfo(ipAddress, cidr) {
  // Validate IP address
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ipAddress.match(ipRegex)
  
  if (!match) {
    throw new Error('Invalid IP address format')
  }
  
  const octets = match.slice(1).map(Number)
  
  if (octets.some(octet => octet > 255)) {
    throw new Error('Invalid IP address: octets must be 0-255')
  }
  
  if (cidr < 0 || cidr > 32) {
    throw new Error('Invalid CIDR: must be between 0 and 32')
  }
  
  // Convert IP to binary
  const ipBinary = octets.map(octet => octet.toString(2).padStart(8, '0')).join('')
  const ipDecimal = parseInt(ipBinary, 2)
  
  // Calculate subnet mask
  const maskBinary = '1'.repeat(cidr) + '0'.repeat(32 - cidr)
  const maskDecimal = parseInt(maskBinary, 2)
  
  // Calculate network address
  const networkDecimal = ipDecimal & maskDecimal
  const networkBinary = networkDecimal.toString(2).padStart(32, '0')
  const networkOctets = [
    parseInt(networkBinary.substring(0, 8), 2),
    parseInt(networkBinary.substring(8, 16), 2),
    parseInt(networkBinary.substring(16, 24), 2),
    parseInt(networkBinary.substring(24, 32), 2)
  ]
  
  // Calculate broadcast address
  const hostBits = 32 - cidr
  const broadcastDecimal = networkDecimal | ((1 << hostBits) - 1)
  const broadcastBinary = broadcastDecimal.toString(2).padStart(32, '0')
  const broadcastOctets = [
    parseInt(broadcastBinary.substring(0, 8), 2),
    parseInt(broadcastBinary.substring(8, 16), 2),
    parseInt(broadcastBinary.substring(16, 24), 2),
    parseInt(broadcastBinary.substring(24, 32), 2)
  ]
  
  // Calculate subnet mask octets
  const maskOctets = [
    parseInt(maskBinary.substring(0, 8), 2),
    parseInt(maskBinary.substring(8, 16), 2),
    parseInt(maskBinary.substring(16, 24), 2),
    parseInt(maskBinary.substring(24, 32), 2)
  ]
  
  // Calculate usable hosts
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0
  
  return {
    ipAddress: ipAddress,
    cidr: cidr,
    subnetMask: maskOctets.join('.'),
    networkAddress: networkOctets.join('.'),
    broadcastAddress: broadcastOctets.join('.'),
    firstHost: usableHosts > 0 ? 
      [networkOctets[0], networkOctets[1], networkOctets[2], networkOctets[3] + 1].join('.') : 'N/A',
    lastHost: usableHosts > 0 ? 
      [broadcastOctets[0], broadcastOctets[1], broadcastOctets[2], broadcastOctets[3] - 1].join('.') : 'N/A',
    totalHosts: totalHosts,
    usableHosts: usableHosts,
    ipClass: getIPClass(octets[0]),
    ipBinary: octets.map(o => o.toString(2).padStart(8, '0')).join('.')
  }
}

/**
 * Determine IP address class
 * @param {number} firstOctet - First octet of IP address
 * @returns {string} IP class
 */
function getIPClass(firstOctet) {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A'
  if (firstOctet >= 128 && firstOctet <= 191) return 'B'
  if (firstOctet >= 192 && firstOctet <= 223) return 'C'
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)'
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)'
  return 'Unknown'
}

module.exports = {
  calculateSubnetInfo,
  getIPClass
}