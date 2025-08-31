# BGP Basics Tutorial

## What is BGP?

Border Gateway Protocol (BGP) is the routing protocol that makes the internet work. It's responsible for finding the best path for data to travel between autonomous systems (AS).

## Key Concepts

### Autonomous System (AS)
- A collection of IP networks under single administrative control
- Identified by AS Number (ASN)
- Examples: ISPs, large organizations, cloud providers

### BGP Attributes
1. **AS Path** - List of AS numbers the route has traversed
2. **Next Hop** - IP address of the next router
3. **Local Preference** - Preference for outbound traffic
4. **MED (Multi-Exit Discriminator)** - Hint for inbound traffic
5. **Community** - Route tagging for policy application

## BGP Session Types

### eBGP (External BGP)
- Between different autonomous systems
- TTL typically set to 1
- Changes next-hop attribute

### iBGP (Internal BGP)
- Within the same autonomous system  
- Requires full mesh or route reflectors
- Preserves next-hop attribute

## BGP Path Selection Algorithm

BGP uses the following criteria in order:
1. Highest Local Preference
2. Shortest AS Path
3. Lowest Origin Type (IGP < EGP < Incomplete)
4. Lowest MED
5. eBGP over iBGP
6. Lowest IGP metric to next hop
7. Oldest route
8. Lowest Router ID
9. Shortest cluster list
10. Lowest neighbor address

## Common BGP Commands

### Cisco IOS
```
show ip bgp summary
show ip bgp
show ip bgp neighbors
show ip route bgp
clear ip bgp * soft
```

### Juniper JunOS
```
show bgp summary
show route protocol bgp
show bgp neighbor
clear bgp neighbor soft
```

## BGP Best Practices

### Security
- Use MD5 authentication
- Implement prefix filters
- Set maximum prefix limits
- Use BGP TTL security

### Stability
- Use loopback interfaces for iBGP
- Implement route dampening carefully
- Use BFD for faster convergence
- Regular backup of configurations

### Traffic Engineering
- Use communities for policy control
- Implement proper route filtering
- Use local preference for outbound control
- Use AS path prepending for inbound influence

## Troubleshooting BGP

### Common Issues
1. **Session not establishing**
   - Check IP connectivity
   - Verify AS numbers
   - Check authentication

2. **Routes not being advertised**
   - Verify network statements
   - Check route maps/filters
   - Ensure routes exist in routing table

3. **Suboptimal routing**
   - Review BGP attributes
   - Check for asymmetric routing
   - Verify policy configuration

## BGP Looking Glass

Many networks provide looking glass servers for BGP troubleshooting:
- Route Views: http://www.routeviews.org/
- Hurricane Electric: https://lg.he.net/
- RIPE RIS: https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris

These tools allow you to see BGP routing information from different vantage points on the internet.