# Subnet Calculator - Complete Guide

## Overview

The Subnet Calculator is a powerful networking tool that helps you calculate and analyze IP subnets, network addresses, broadcast addresses, and host ranges. It supports both IPv4 subnet calculations and provides detailed binary representations for educational purposes.

## Features

### Core Capabilities
- **Subnet Analysis**: Calculate network and broadcast addresses instantly
- **Host Range Calculation**: Determine usable IP addresses in any subnet
- **Binary Representation**: View IP addresses in binary format for learning
- **CIDR Support**: Full support for Classless Inter-Domain Routing notation
- **Subnet Validation**: Check if an IP belongs to a specific subnet
- **Multiple Calculation Modes**: Different tools for various subnet tasks

## How to Use

### Basic Subnet Calculation

1. **Open the Tool**
   - Click the Network Tools icon in the Activity Bar (or press `Cmd+B` / `Ctrl+B`)
   - Select "Subnet Calculator" from the tools list
   - Or click the calculator icon directly in the Activity Bar

2. **Enter Network Information**
   - **IP Address**: Enter any IP address (e.g., `192.168.1.100`)
   - **CIDR Notation**: Enter the subnet mask in CIDR format (e.g., `/24`)
   - The tool automatically validates your input as you type

3. **View Results**
   The calculator instantly displays:
   - **Network Address**: The first IP in the subnet
   - **Broadcast Address**: The last IP in the subnet
   - **First Usable Host**: First assignable IP address
   - **Last Usable Host**: Last assignable IP address
   - **Total Hosts**: Number of possible addresses
   - **Usable Hosts**: Number of assignable addresses (Total - 2)
   - **Subnet Mask**: Traditional dotted decimal notation
   - **Wildcard Mask**: Inverse of subnet mask (used in ACLs)

### Subnet Checker Mode

Use this mode to verify if a specific IP address belongs to a given subnet:

1. Select "Subnet Checker" from the dropdown menu
2. Enter the target IP address
3. Enter the subnet network address and CIDR
4. The tool will confirm if the IP is within the subnet range

### Advanced Features

#### Binary View
- Toggle "Show Binary" to see the binary representation
- Useful for understanding subnet boundaries
- Helps visualize network/host bit divisions

#### Copy Results
- Click the copy button next to any value
- Paste directly into configurations or documentation
- Formatted for easy readability

## Common Use Cases

### 1. Network Planning
**Scenario**: You need to divide `10.0.0.0/8` into smaller subnets

**Solution**:
- Enter base network: `10.0.0.0/8`
- Calculate smaller subnets: `/16`, `/24`, etc.
- Document network ranges for each department

### 2. Troubleshooting Connectivity
**Scenario**: Two devices can't communicate

**Solution**:
- Enter Device A's IP and subnet mask
- Enter Device B's IP and subnet mask
- Check if they're in the same subnet
- If not, routing is required

### 3. Firewall Configuration
**Scenario**: Create ACL rules for a subnet

**Solution**:
- Calculate network and wildcard masks
- Use wildcard mask in Cisco ACLs
- Verify IP ranges before implementation

### 4. VLSM Planning
**Scenario**: Efficiently allocate IP addresses

**Solution**:
- Start with largest subnet requirement
- Calculate each subnet size needed
- Minimize IP address waste

## Technical Details

### Supported Formats
- **IPv4 Addresses**: Standard dotted decimal (0.0.0.0 - 255.255.255.255)
- **CIDR Notation**: /0 through /32
- **Subnet Masks**: 0.0.0.0 through 255.255.255.255

### Calculation Methods
The tool uses bitwise operations for accuracy:
- Network Address: `IP AND Subnet Mask`
- Broadcast Address: `Network OR Wildcard Mask`
- Host Calculation: `2^(32-CIDR) - 2`

### Special Cases
- **/31 Networks**: Point-to-point links (2 hosts, both usable)
- **/32 Networks**: Host routes (single IP)
- **Private Ranges**: Automatically detected and labeled
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16

## Tips and Best Practices

### 1. Subnet Design
- Plan for growth - leave room for expansion
- Use consistent subnet sizes where possible
- Document your subnet scheme thoroughly
- Consider summarization for routing efficiency

### 2. Common Subnet Sizes
| CIDR | Subnet Mask | Hosts | Typical Use |
|------|-------------|-------|-------------|
| /30 | 255.255.255.252 | 2 | Point-to-point links |
| /29 | 255.255.255.248 | 6 | Small branch office |
| /28 | 255.255.255.240 | 14 | Small department |
| /27 | 255.255.255.224 | 30 | Medium department |
| /26 | 255.255.255.192 | 62 | Large department |
| /25 | 255.255.255.128 | 126 | Small office |
| /24 | 255.255.255.0 | 254 | Standard LAN |

### 3. Quick Checks
- **Is it a valid host?**: First and last IPs are network/broadcast
- **Same subnet?**: Compare network addresses after calculation
- **How many subnets?**: 2^(borrowed bits)

### 4. Performance Tips
- The calculator updates in real-time
- No need to press Enter or click Calculate
- Use Tab to quickly move between fields
- Copy buttons save time in documentation

## Troubleshooting

### Common Issues

**"Invalid IP Address" Error**
- Check for typos in the IP address
- Ensure all octets are 0-255
- Remove any extra spaces

**"Invalid CIDR" Error**
- CIDR must be between 0 and 32
- Include the forward slash (e.g., `/24`)
- Don't mix CIDR with dotted decimal

**Unexpected Results**
- Verify your input values
- Check if using host IP vs network IP
- Remember: first IP is network, last is broadcast

## Integration with Other Tools

### BGP Route Server
- Use calculated subnets to query BGP routing
- Check how your subnets are advertised globally
- Verify routing policies for your networks

### Traceroute Tool
- Test connectivity to calculated subnet ranges
- Verify routing paths to different subnets
- Identify routing issues between subnets

### Ping Tool
- Test reachability to subnet gateways
- Verify host connectivity within subnets
- Check broadcast address responses

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd/Ctrl+C` | Copy selected value |
| `Cmd/Ctrl+A` | Select all in field |
| `Escape` | Clear current field |

## Educational Resources

### Understanding Subnetting
1. **Binary Basics**: Each octet represents 8 bits
2. **Network vs Host Bits**: CIDR determines the split
3. **Subnet Boundaries**: Always on power-of-2 boundaries
4. **Broadcast Domain**: All hosts in a subnet share broadcasts

### Practice Exercises
1. Calculate subnets for a /16 network divided into /24s
2. Find the smallest subnet to accommodate 500 hosts
3. Determine if two IPs can communicate without routing
4. Plan subnets for a multi-site organization

## Advanced Topics

### Variable Length Subnet Masking (VLSM)
- Optimize IP address allocation
- Use different subnet sizes as needed
- Reduce waste in IP addressing

### Subnet Summarization
- Combine multiple subnets into supernets
- Simplify routing tables
- Reduce routing protocol overhead

### IPv6 Considerations
- Future versions will support IPv6
- Different calculation methods apply
- Larger address space eliminates scarcity

## Best Practices for Production Networks

1. **Documentation**: Always document your subnet plan
2. **Consistency**: Use standard subnet sizes where possible
3. **Reserve Space**: Keep some addresses for network devices
4. **Growth Planning**: Allow room for expansion
5. **Security**: Use separate subnets for different security zones

## Conclusion

The Subnet Calculator is an essential tool for network engineers, administrators, and students. It simplifies complex subnet calculations, reduces errors, and helps visualize network architecture. Whether you're designing a new network, troubleshooting connectivity issues, or studying for certifications, this tool provides the accuracy and speed you need.

---

*Last updated: August 31, 2025*
*Version: 1.0.0*