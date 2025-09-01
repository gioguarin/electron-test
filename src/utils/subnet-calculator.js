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

  // Convert IP to 32-bit unsigned integer (avoiding JavaScript's signed integer issues)
  const ipDecimal = (octets[0] * 16777216) + (octets[1] * 65536) + (octets[2] * 256) + octets[3]

  // Calculate subnet mask as unsigned 32-bit integer
  const hostBits = 32 - cidr
  const maskDecimal = cidr === 0 ? 0 : (0xFFFFFFFF << hostBits) >>> 0

  // Calculate network address (use >>> 0 to ensure unsigned)
  const networkDecimal = (ipDecimal & maskDecimal) >>> 0
  const networkOctets = [
    (networkDecimal >>> 24) & 0xFF,
    (networkDecimal >>> 16) & 0xFF,
    (networkDecimal >>> 8) & 0xFF,
    networkDecimal & 0xFF,
  ]

  // Calculate broadcast address
  const broadcastDecimal = cidr === 32 ? networkDecimal : (networkDecimal | (~maskDecimal >>> 0)) >>> 0
  const broadcastOctets = [
    (broadcastDecimal >>> 24) & 0xFF,
    (broadcastDecimal >>> 16) & 0xFF,
    (broadcastDecimal >>> 8) & 0xFF,
    broadcastDecimal & 0xFF,
  ]

  // Calculate subnet mask octets
  const maskOctets = [
    (maskDecimal >>> 24) & 0xFF,
    (maskDecimal >>> 16) & 0xFF,
    (maskDecimal >>> 8) & 0xFF,
    maskDecimal & 0xFF,
  ]

  // Calculate usable hosts
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0

  // Calculate first and last host addresses
  let firstHost = 'N/A'
  let lastHost = 'N/A'

  if (usableHosts > 0) {
    const firstHostDecimal = networkDecimal + 1
    firstHost = [
      (firstHostDecimal >>> 24) & 0xFF,
      (firstHostDecimal >>> 16) & 0xFF,
      (firstHostDecimal >>> 8) & 0xFF,
      firstHostDecimal & 0xFF,
    ].join('.')

    const lastHostDecimal = broadcastDecimal - 1
    lastHost = [
      (lastHostDecimal >>> 24) & 0xFF,
      (lastHostDecimal >>> 16) & 0xFF,
      (lastHostDecimal >>> 8) & 0xFF,
      lastHostDecimal & 0xFF,
    ].join('.')
  }

  return {
    ipAddress: ipAddress,
    cidr: cidr,
    subnetMask: maskOctets.join('.'),
    networkAddress: networkOctets.join('.'),
    broadcastAddress: broadcastOctets.join('.'),
    firstHost: firstHost,
    lastHost: lastHost,
    totalHosts: totalHosts,
    usableHosts: usableHosts,
    ipClass: getIPClass(octets[0]),
    ipBinary: octets.map(o => o.toString(2).padStart(8, '0')).join('.'),
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
  getIPClass,
}