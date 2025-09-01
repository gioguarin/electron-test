# BGP Route Server Tool - Complete Guide

## Overview

The BGP Route Server Tool provides direct access to Hurricane Electric's global network of route servers, enabling you to analyze BGP routing information, perform traceroutes, and understand internet routing from multiple geographic vantage points around the world. This powerful tool gives you the same view of the internet that major ISPs and content providers have.

## What is BGP?

**Border Gateway Protocol (BGP)** is the routing protocol that makes the internet work. It's how autonomous systems (AS) - large networks operated by ISPs, corporations, and other organizations - exchange routing information to determine the best paths for data to travel across the internet.

## Features

### Core Capabilities
- **Global Route Server Access**: Connect to 20+ servers worldwide
- **Real-time BGP Data**: View live routing tables and path information
- **Multiple Commands**: Support for various show commands and traceroute
- **Geographic Diversity**: Servers in North America, Europe, and Asia
- **Automatic Authentication**: Seamless connection with built-in credentials
- **Command Templates**: Pre-configured commands for common queries

## Available Route Servers

### North America
- **Seattle, WA** - route-server.seattle.wa.us.he.net
- **San Jose, CA** - route-server.sanjose.ca.us.he.net
- **Los Angeles, CA** - route-server.losangeles.ca.us.he.net
- **Chicago, IL** - route-server.chicago.il.us.he.net
- **Dallas, TX** - route-server.dallas.tx.us.he.net
- **Toronto, Canada** - route-server.toronto.on.ca.he.net
- **New York, NY** - route-server.newyork.ny.us.he.net
- **Ashburn, VA** - route-server.ashburn.va.us.he.net
- **Miami, FL** - route-server.miami.fl.us.he.net
- **Denver, CO** - route-server.denver.co.us.he.net
- **Kansas City, MO** - route-server.kansascity.mo.us.he.net

### Europe
- **London, UK** - route-server.london.uk.he.net
- **Amsterdam, NL** - route-server.amsterdam.nl.he.net
- **Frankfurt, DE** - route-server.frankfurt.de.he.net
- **Paris, FR** - route-server.paris.fr.he.net
- **Zurich, CH** - route-server.zurich.ch.he.net
- **Stockholm, SE** - route-server.stockholm.se.he.net

### Asia-Pacific
- **Hong Kong** - route-server.hongkong.hk.he.net
- **Tokyo, Japan** - route-server.tokyo.jp.he.net
- **Singapore** - route-server.singapore.sg.he.net

## How to Use

### Basic Connection

1. **Open the Tool**
   - Click the BGP Route Server icon in the Activity Bar
   - Or navigate through Network Tools → BGP Route Server

2. **Select a Server**
   - Choose a route server from the dropdown
   - Consider geographic proximity to your target
   - The tool shows server location for reference

3. **Connect**
   - Click the "Connect" button
   - Wait for "Connected successfully" message
   - The tool auto-authenticates with password: `rviews`

4. **Execute Commands**
   - Select a command from the dropdown
   - Enter target IP/hostname if required
   - Click "Send Command"
   - View results in the output area

### Available Commands

#### BGP Information Commands

**`show ip bgp <IP>`**
- Shows BGP routing information for a specific IP
- Displays AS path, next hop, and origin
- Use to understand how traffic reaches a destination

**`show ip bgp summary`**
- Overview of BGP peer relationships
- Shows neighbor count and prefix statistics
- Useful for verifying server connectivity

**`show bgp ipv4 unicast <IP>`**
- Detailed IPv4 BGP information
- More verbose than standard show ip bgp
- Includes community strings and attributes

**`show bgp ipv6 unicast <IP>`**
- IPv6 BGP routing information
- Essential for IPv6 troubleshooting
- Shows IPv6 AS paths and prefixes

#### Network Diagnostic Commands

**`traceroute <host>`**
- Traces packet path from route server to destination
- Shows each hop with latency measurements
- Identifies routing paths and potential issues

**`show route <IP>`**
- Displays the routing table entry
- Shows how the server would route to an IP
- Includes next-hop and interface information

**`show ip route <IP>`**
- IPv4 specific routing information
- More detailed than show route
- Includes administrative distance and metrics

#### Informational Commands

**`?`**
- Lists all available commands on the server
- Helpful for discovering advanced features
- Context-sensitive help system

**`show version`**
- Displays router software version
- Useful for documentation
- Shows system capabilities

## Common Use Cases

### 1. Analyzing BGP Paths

**Scenario**: Understanding how traffic reaches your website from different locations

**Steps**:
1. Connect to a route server near your users
2. Run `show ip bgp <your-server-ip>`
3. Note the AS path
4. Connect to servers in other regions
5. Compare AS paths to identify routing differences

**Example Output**:
```
BGP routing table entry for 8.8.8.8/32
Paths: (3 available, best #1)
  15169
    206.81.80.0 from 206.81.80.0
      Origin IGP, metric 0, localpref 100, valid, external, best
```

### 2. Troubleshooting Connectivity Issues

**Scenario**: Users in Europe can't reach your US-based service

**Steps**:
1. Connect to a European route server (e.g., Frankfurt)
2. Run `traceroute <your-service-ip>`
3. Identify where packets are dropped or delayed
4. Check `show ip bgp <your-service-ip>` for routing issues
5. Compare with working regions

### 3. Verifying BGP Announcements

**Scenario**: Confirming your prefixes are visible globally

**Steps**:
1. Connect to multiple route servers
2. Run `show ip bgp <your-prefix>`
3. Verify your AS is the origin
4. Check AS path length from different locations
5. Ensure consistent visibility

### 4. Investigating DDoS Mitigation

**Scenario**: Understanding traffic redirection during attacks

**Steps**:
1. Connect to servers near the attack source
2. Check BGP paths before and during mitigation
3. Verify anycast or scrubbing center redirection
4. Monitor path changes over time

## Advanced Techniques

### AS Path Analysis

Understanding AS paths helps identify:
- **Routing Efficiency**: Shorter paths generally mean better performance
- **Transit Providers**: Which networks carry your traffic
- **Peering Relationships**: Direct connections between networks
- **Routing Anomalies**: Unusual or suboptimal paths

**Example AS Path**: `701 1299 15169`
- 701: Verizon
- 1299: Telia
- 15169: Google (destination)

### Multi-Location Comparison

1. **Create a Testing Matrix**:
   - List target IPs/services
   - Select diverse route server locations
   - Document normal baselines

2. **Regular Monitoring**:
   - Check paths during different times
   - Note changes in routing
   - Identify patterns or issues

3. **Performance Correlation**:
   - Compare BGP paths with actual performance
   - Identify correlation between path length and latency
   - Find optimal peering points

### BGP Community Analysis

Communities are tags that control routing policies:
- **NO_EXPORT**: Don't advertise outside AS
- **NO_ADVERTISE**: Don't advertise to any peer
- **Customer Communities**: Provider-specific tags

Check communities with extended BGP commands when available.

## Best Practices

### 1. Server Selection
- Start with geographically close servers
- Use multiple servers for comprehensive analysis
- Consider network topology, not just geography

### 2. Command Sequencing
- Begin with `show ip bgp summary` to verify connectivity
- Use broader commands before specific queries
- Save output for comparison and documentation

### 3. Data Interpretation
- Understand AS numbers (use ASN lookup tool)
- Learn common transit provider AS numbers
- Recognize private AS numbers (64512-65535)

### 4. Documentation
- Record baseline routing for your networks
- Document changes during incidents
- Create runbooks for common scenarios

## Integration with Other Tools

### Subnet Calculator
- Calculate network prefixes for BGP queries
- Understand subnet boundaries in routing
- Plan BGP announcements

### ASN Lookup
- Identify AS numbers from BGP output
- Research organizations behind AS numbers
- Understand peering relationships

### Traceroute Tool
- Compare local traceroute with route server results
- Identify asymmetric routing
- Correlate hop count with AS path length

### Ping Tool
- Verify basic connectivity before BGP analysis
- Test reachability from your location
- Compare with route server accessibility

## Troubleshooting Guide

### Connection Issues

**"Connection timeout" Error**
- Check internet connectivity
- Verify firewall allows telnet (port 23)
- Try a different route server

**"Authentication failed"**
- The password is automatically provided
- If issues persist, try reconnecting
- Check for server maintenance notices

### Command Errors

**"Unknown command"**
- Use the `?` command to list available options
- Check command syntax carefully
- Some servers may have limited command sets

**"No route to host"**
- The target may be unreachable from that location
- Try different route servers
- Verify the IP/hostname is correct

### Output Interpretation

**Empty BGP Results**
- The prefix may not be announced
- Check for typos in IP address
- Try a broader prefix (e.g., /24 instead of /32)

**Multiple Paths**
- Normal for well-connected destinations
- Best path is marked with ">"
- Consider all paths for redundancy analysis

## Security Considerations

### Read-Only Access
- Route servers provide view-only access
- Cannot modify routing tables
- Safe for learning and analysis

### Information Disclosure
- BGP data is public information
- Don't rely on obscurity for security
- Assume attackers can see routing too

### Rate Limiting
- Be respectful of shared resources
- Avoid excessive queries
- Use output caching when possible

## Educational Value

### Learning BGP

The tool helps understand:
1. **How the Internet Works**: See actual routing decisions
2. **Network Interconnection**: Understand peering and transit
3. **Global Perspective**: View routing from different locations
4. **Troubleshooting Skills**: Develop diagnostic techniques

### Certification Preparation

Useful for:
- **CCNP/CCIE**: BGP configuration and troubleshooting
- **JNCIE**: Juniper BGP expertise
- **Network+/Security+**: Understanding routing fundamentals

### Research Applications

- **Network Performance**: Analyze routing efficiency
- **Internet Topology**: Study AS relationships
- **Security Research**: Investigate BGP hijacking
- **Academic Studies**: Internet measurement research

## Common BGP Attributes

### Origin Codes
- **i** - IGP (Internal Gateway Protocol)
- **e** - EGP (External Gateway Protocol)
- **?** - Incomplete

### Path Selection Criteria
1. Highest LOCAL_PREF
2. Shortest AS_PATH
3. Lowest ORIGIN type
4. Lowest MED (Multi-Exit Discriminator)
5. eBGP over iBGP
6. Lowest IGP metric to next hop
7. Oldest path (stability)
8. Lowest router ID

## Practical Examples

### Example 1: Checking Google DNS Routing
```
Command: show ip bgp 8.8.8.8
Output: AS Path: 6939 15169
Interpretation: Traffic goes through Hurricane Electric (6939) to Google (15169)
```

### Example 2: Investigating Slow Performance
```
1. Traceroute from affected location
2. Note high latency hops
3. Check BGP for those IPs
4. Identify suboptimal routing
5. Contact ISP with findings
```

### Example 3: Verifying Anycast
```
1. Query same IP from multiple locations
2. Note different AS paths
3. Confirm multiple origin ASes
4. Verify geographic distribution
```

## Tips for Power Users

### 1. Scripting and Automation
- Save common command sequences
- Parse output for monitoring
- Create alerts for path changes

### 2. Building a Routing Database
- Regular snapshots of important prefixes
- Track routing changes over time
- Identify patterns and anomalies

### 3. Correlation with Performance
- Match BGP paths with latency measurements
- Identify optimal peering locations
- Plan network improvements

## Conclusion

The BGP Route Server Tool provides unprecedented visibility into global internet routing. Whether you're troubleshooting connectivity issues, analyzing network performance, or learning about BGP, this tool offers real-world data from actual internet routers. By understanding how to effectively use route servers, you gain the same insights that network operators use to manage the global internet.

Remember that BGP is dynamic - routes change based on network conditions, policies, and failures. Regular monitoring and analysis help you understand your network's behavior and optimize connectivity for users worldwide.

---

*Last updated: August 31, 2025*
*Version: 1.0.0*
*Tool Version: BGP Route Server 2.0*