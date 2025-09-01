# CCNA Study Guide - Comprehensive Exam Preparation

## Overview

This guide covers all topics for the Cisco Certified Network Associate (CCNA 200-301) exam, providing essential knowledge for network fundamentals, security, automation, and programmability.

## Exam Topics Distribution

- **Network Fundamentals**: 20%
- **Network Access**: 20%
- **IP Connectivity**: 25%
- **IP Services**: 10%
- **Security Fundamentals**: 15%
- **Automation and Programmability**: 10%

---

## 1. Network Fundamentals (20%)

### 1.1 OSI Model & TCP/IP Stack

#### OSI Model Layers
1. **Physical**: Bits, cables, signals
2. **Data Link**: Frames, switches, MAC addresses
3. **Network**: Packets, routers, IP addresses
4. **Transport**: Segments, TCP/UDP, port numbers
5. **Session**: Session establishment and termination
6. **Presentation**: Encryption, compression, data formats
7. **Application**: User interface, HTTP, FTP, DNS

#### TCP/IP Model
1. **Network Access** (OSI 1-2)
2. **Internet** (OSI 3)
3. **Transport** (OSI 4)
4. **Application** (OSI 5-7)

### 1.2 IPv4 Addressing & Subnetting

#### IPv4 Address Classes
```
Class A: 1.0.0.0 - 126.255.255.255    (/8 default)
Class B: 128.0.0.0 - 191.255.255.255  (/16 default)
Class C: 192.0.0.0 - 223.255.255.255  (/24 default)
Class D: 224.0.0.0 - 239.255.255.255  (Multicast)
Class E: 240.0.0.0 - 255.255.255.255  (Reserved)
```

#### Private IP Ranges (RFC 1918)
```
10.0.0.0 - 10.255.255.255     (10.0.0.0/8)
172.16.0.0 - 172.31.255.255   (172.16.0.0/12)
192.168.0.0 - 192.168.255.255 (192.168.0.0/16)
```

#### Subnetting Quick Reference
```
CIDR | Subnet Mask       | Hosts | Networks
/24  | 255.255.255.0     | 254   | 1
/25  | 255.255.255.128   | 126   | 2
/26  | 255.255.255.192   | 62    | 4
/27  | 255.255.255.224   | 30    | 8
/28  | 255.255.255.240   | 14    | 16
/29  | 255.255.255.248   | 6     | 32
/30  | 255.255.255.252   | 2     | 64
```

### 1.3 IPv6 Fundamentals

#### IPv6 Address Types
- **Unicast**: One-to-one communication
  - Global Unicast: 2000::/3
  - Unique Local: FC00::/7
  - Link-Local: FE80::/10
- **Multicast**: One-to-many (FF00::/8)
- **Anycast**: One-to-nearest

#### IPv6 Address Representation
```
Full:       2001:0DB8:0000:0000:0008:0800:200C:417A
Compressed: 2001:DB8::8:800:200C:417A
```

### 1.4 Networking Devices

#### Device Functions
- **Hub**: Layer 1, broadcasts to all ports
- **Switch**: Layer 2, forwards based on MAC
- **Router**: Layer 3, routes based on IP
- **Multilayer Switch**: Layer 2/3, switching and routing
- **Firewall**: Security filtering
- **Access Point**: Wireless connectivity
- **Controller**: SDN management

### 1.5 Network Topologies

- **Star**: Central connection point
- **Mesh**: Multiple redundant paths
- **Bus**: Single backbone
- **Ring**: Circular connection
- **Hybrid**: Combination of topologies

### 1.6 Cabling and Connections

#### Cable Types
- **Copper**:
  - Straight-through: Unlike devices (PC to switch)
  - Crossover: Like devices (switch to switch)
  - Rollover: Console connections
- **Fiber**:
  - Single-mode: Long distance (up to 100km)
  - Multi-mode: Short distance (up to 2km)

#### Cable Standards
```
Cat5e:  100 Mbps - 1 Gbps, 100m
Cat6:   1 Gbps - 10 Gbps, 55m (10G)
Cat6a:  10 Gbps, 100m
Cat7:   10 Gbps, 100m (shielded)
```

---

## 2. Network Access (20%)

### 2.1 VLANs and Trunking

#### VLAN Configuration
```cisco
Switch(config)# vlan 10
Switch(config-vlan)# name Sales
Switch(config)# interface gi0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
```

#### Trunk Configuration (802.1Q)
```cisco
Switch(config)# interface gi0/24
Switch(config-if)# switchport trunk encapsulation dot1q
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
Switch(config-if)# switchport trunk native vlan 99
```

#### Inter-VLAN Routing
```cisco
# Router-on-a-Stick
Router(config)# interface gi0/0.10
Router(config-subif)# encapsulation dot1q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

# Layer 3 Switch
Switch(config)# ip routing
Switch(config)# interface vlan 10
Switch(config-if)# ip address 192.168.10.1 255.255.255.0
```

### 2.2 Spanning Tree Protocol (STP)

#### STP Variants
- **802.1D (STP)**: Original, slow convergence (50s)
- **802.1w (RSTP)**: Rapid convergence (6s)
- **802.1s (MST)**: Multiple instances
- **PVST+**: Cisco, per-VLAN STP
- **Rapid PVST+**: Cisco, per-VLAN RSTP

#### STP Port States
1. **Blocking**: No frames forwarded
2. **Listening**: Building topology
3. **Learning**: Learning MAC addresses
4. **Forwarding**: Normal operation
5. **Disabled**: Administratively down

#### STP Configuration
```cisco
Switch(config)# spanning-tree mode rapid-pvst
Switch(config)# spanning-tree vlan 10 root primary
Switch(config)# spanning-tree vlan 10 priority 4096
Switch(config-if)# spanning-tree portfast
Switch(config-if)# spanning-tree bpduguard enable
```

### 2.3 EtherChannel

#### Configuration Methods
- **Static**: Manual configuration
- **LACP**: IEEE 802.3ad standard
- **PAgP**: Cisco proprietary

```cisco
# LACP Configuration
Switch(config)# interface range gi0/1-2
Switch(config-if-range)# channel-group 1 mode active
Switch(config-if-range)# exit
Switch(config)# interface port-channel 1
Switch(config-if)# switchport trunk encapsulation dot1q
Switch(config-if)# switchport mode trunk
```

### 2.4 Wireless Fundamentals

#### WiFi Standards
```
802.11a:  5 GHz, 54 Mbps
802.11b:  2.4 GHz, 11 Mbps
802.11g:  2.4 GHz, 54 Mbps
802.11n:  2.4/5 GHz, 600 Mbps (WiFi 4)
802.11ac: 5 GHz, 6.93 Gbps (WiFi 5)
802.11ax: 2.4/5/6 GHz, 9.6 Gbps (WiFi 6)
```

#### Security Protocols
- **WEP**: Deprecated, insecure
- **WPA**: TKIP encryption
- **WPA2**: AES encryption (current standard)
- **WPA3**: Enhanced security (latest)

#### Wireless Modes
- **Personal**: Pre-shared key (PSK)
- **Enterprise**: 802.1X authentication

---

## 3. IP Connectivity (25%)

### 3.1 Static Routing

```cisco
# IPv4 Static Route
Router(config)# ip route 192.168.2.0 255.255.255.0 10.1.1.2
Router(config)# ip route 0.0.0.0 0.0.0.0 10.1.1.1

# IPv6 Static Route
Router(config)# ipv6 route 2001:DB8:2::/64 2001:DB8:1::2
Router(config)# ipv6 route ::/0 2001:DB8:1::1
```

### 3.2 Dynamic Routing

#### Routing Protocol Types
- **Distance Vector**: RIP, EIGRP
- **Link State**: OSPF, IS-IS
- **Path Vector**: BGP

#### Administrative Distances
```
Connected:      0
Static:         1
EIGRP:          90
OSPF:           110
RIP:            120
External EIGRP: 170
```

### 3.3 OSPF (Single Area)

```cisco
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.1.1.0 0.0.0.3 area 0
Router(config-router)# passive-interface gi0/0
Router(config-router)# default-information originate

# OSPF Interface Configuration
Router(config-if)# ip ospf 1 area 0
Router(config-if)# ip ospf cost 10
Router(config-if)# ip ospf priority 100
```

#### OSPF States
1. **Down**: No hellos received
2. **Init**: Hello received
3. **2-Way**: Bidirectional communication
4. **ExStart**: Master/slave election
5. **Exchange**: DBD exchange
6. **Loading**: LSR/LSU exchange
7. **Full**: Synchronized databases

### 3.4 First Hop Redundancy Protocols

#### HSRP Configuration
```cisco
Router(config-if)# standby 1 ip 192.168.1.254
Router(config-if)# standby 1 priority 110
Router(config-if)# standby 1 preempt
Router(config-if)# standby 1 track gi0/1
```

#### VRRP Configuration
```cisco
Router(config-if)# vrrp 1 ip 192.168.1.254
Router(config-if)# vrrp 1 priority 110
Router(config-if)# vrrp 1 preempt
```

---

## 4. IP Services (10%)

### 4.1 DHCP

```cisco
# DHCP Server Configuration
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
Router(config)# ip dhcp pool LAN
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# lease 7

# DHCP Relay
Router(config-if)# ip helper-address 10.1.1.100
```

### 4.2 NAT/PAT

```cisco
# Static NAT
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.10

# Dynamic NAT
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat pool PUBLIC 203.0.113.1 203.0.113.10 netmask 255.255.255.0
Router(config)# ip nat inside source list 1 pool PUBLIC

# PAT (Overload)
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat inside source list 1 interface gi0/0 overload

# Interface Configuration
Router(config-if)# ip nat inside   # LAN interface
Router(config-if)# ip nat outside  # WAN interface
```

### 4.3 NTP

```cisco
# NTP Server
Router(config)# ntp master 3

# NTP Client
Router(config)# ntp server 10.1.1.1
Router(config)# clock timezone EST -5

# Verification
Router# show ntp status
Router# show ntp associations
```

### 4.4 DNS

```cisco
Router(config)# ip domain-name example.com
Router(config)# ip name-server 8.8.8.8
Router(config)# ip domain-lookup
```

### 4.5 SNMP

```cisco
# SNMPv2c Configuration
Router(config)# snmp-server community public RO
Router(config)# snmp-server community private RW
Router(config)# snmp-server host 10.1.1.100 public

# SNMPv3 Configuration
Router(config)# snmp-server group ADMIN v3 priv
Router(config)# snmp-server user admin ADMIN v3 auth sha Pass123 priv aes 128 Key123
```

### 4.6 Syslog

```cisco
Router(config)# logging host 10.1.1.100
Router(config)# logging trap informational
Router(config)# logging source-interface gi0/0
Router(config)# service timestamps log datetime msec
```

### 4.7 QoS

#### Classification and Marking
```cisco
Router(config)# class-map match-all VOICE
Router(config-cmap)# match protocol rtp

Router(config)# policy-map QOS-POLICY
Router(config-pmap)# class VOICE
Router(config-pmap-c)# set dscp ef
Router(config-pmap-c)# priority 1000

Router(config-if)# service-policy output QOS-POLICY
```

---

## 5. Security Fundamentals (15%)

### 5.1 Access Control Lists (ACLs)

#### Standard ACL (1-99, 1300-1999)
```cisco
Router(config)# access-list 10 deny 192.168.1.100
Router(config)# access-list 10 permit 192.168.1.0 0.0.0.255
Router(config)# access-list 10 deny any
Router(config-if)# ip access-group 10 in
```

#### Extended ACL (100-199, 2000-2699)
```cisco
Router(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 80
Router(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 443
Router(config)# access-list 100 deny ip any any log
Router(config-if)# ip access-group 100 in
```

#### Named ACL
```cisco
Router(config)# ip access-list extended WEB-TRAFFIC
Router(config-ext-nacl)# permit tcp any any eq 80
Router(config-ext-nacl)# permit tcp any any eq 443
Router(config-ext-nacl)# deny ip any any
Router(config-if)# ip access-group WEB-TRAFFIC in
```

### 5.2 Port Security

```cisco
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 2
Switch(config-if)# switchport port-security mac-address sticky
Switch(config-if)# switchport port-security violation restrict

# Violation Modes:
# - protect: Drop frames
# - restrict: Drop frames + log
# - shutdown: Error-disable port (default)
```

### 5.3 DHCP Snooping

```cisco
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 10
Switch(config-if)# ip dhcp snooping trust  # Uplink port
Switch(config)# ip dhcp snooping verify mac-address
```

### 5.4 Dynamic ARP Inspection (DAI)

```cisco
Switch(config)# ip arp inspection vlan 10
Switch(config-if)# ip arp inspection trust  # Uplink port
Switch(config)# ip arp inspection validate src-mac dst-mac ip
```

### 5.5 802.1X Authentication

```cisco
Switch(config)# aaa new-model
Switch(config)# radius server ISE
Switch(config-radius-server)# address ipv4 10.1.1.100
Switch(config-radius-server)# key RadiusKey123

Switch(config-if)# authentication port-control auto
Switch(config-if)# dot1x pae authenticator
```

### 5.6 Device Security

#### Password Security
```cisco
Router(config)# enable secret EnableSecret123
Router(config)# service password-encryption
Router(config)# security passwords min-length 8
Router(config)# login block-for 120 attempts 3 within 60

# Line Passwords
Router(config)# line console 0
Router(config-line)# password ConsolePass123
Router(config-line)# login

Router(config)# line vty 0 4
Router(config-line)# password VtyPass123
Router(config-line)# login local
Router(config-line)# transport input ssh
```

#### SSH Configuration
```cisco
Router(config)# hostname R1
Router(config)# ip domain-name example.com
Router(config)# crypto key generate rsa modulus 2048
Router(config)# ip ssh version 2
Router(config)# username admin privilege 15 secret AdminPass123
```

### 5.7 VPN Fundamentals

#### Types of VPNs
- **Site-to-Site**: Connects entire networks
- **Remote Access**: Individual user connections
- **SSL/TLS VPN**: Browser-based
- **IPSec VPN**: Network layer encryption

#### IPSec Components
- **AH**: Authentication Header
- **ESP**: Encapsulating Security Payload
- **IKE**: Internet Key Exchange

---

## 6. Automation and Programmability (10%)

### 6.1 Network Automation Concepts

#### Benefits
- Consistency and standardization
- Reduced human error
- Faster deployment
- Scalability
- Documentation

#### Tools and Technologies
- **Ansible**: Agentless automation
- **Python**: Scripting language
- **APIs**: REST, NETCONF, RESTCONF
- **Data Formats**: JSON, XML, YAML

### 6.2 APIs and Data Formats

#### REST API Principles
- **Client-Server**: Separation of concerns
- **Stateless**: No client context stored
- **Cacheable**: Responses can be cached
- **Uniform Interface**: Standard methods (GET, POST, PUT, DELETE)

#### HTTP Status Codes
```
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

### 6.3 JSON Format

```json
{
  "device": {
    "hostname": "Router1",
    "ip_address": "192.168.1.1",
    "interfaces": [
      {
        "name": "GigabitEthernet0/0",
        "ip": "10.1.1.1",
        "mask": "255.255.255.252"
      }
    ]
  }
}
```

### 6.4 YANG Models

```yang
container interface {
  leaf name {
    type string;
  }
  leaf ip-address {
    type inet:ipv4-address;
  }
  leaf subnet-mask {
    type inet:ipv4-address;
  }
}
```

### 6.5 Configuration Management

#### Traditional vs. SDN
- **Traditional**: Distributed control plane
- **SDN**: Centralized control plane
  - Controller-based
  - OpenFlow protocol
  - Programmable

#### Infrastructure as Code (IaC)
- Version control for configurations
- Automated testing
- Consistent deployments
- Rollback capabilities

### 6.6 Python for Networking

```python
# Basic Device Connection
import netmiko

device = {
    'device_type': 'cisco_ios',
    'ip': '192.168.1.1',
    'username': 'admin',
    'password': 'password'
}

connection = netmiko.ConnectHandler(**device)
output = connection.send_command('show ip interface brief')
print(output)
connection.disconnect()
```

---

## Exam Preparation Tips

### Study Strategy
1. **Foundation First**: Master subnetting and OSI model
2. **Hands-On Practice**: Use simulators (Packet Tracer, GNS3)
3. **Configuration Practice**: Know CLI commands
4. **Time Management**: 120 minutes for 100-120 questions
5. **Review Weak Areas**: Focus on challenging topics

### Key Areas to Focus
- Subnetting (quick calculations)
- VLAN and trunking configuration
- OSPF single area
- ACL configuration
- Basic security concepts
- IPv6 addressing
- Troubleshooting methodology

### Common Pitfalls
- Not reading questions carefully
- Overthinking simple questions
- Poor time management
- Ignoring IPv6 topics
- Neglecting wireless concepts

### Lab Exercises
1. Configure VLANs and inter-VLAN routing
2. Set up OSPF in single area
3. Implement NAT/PAT
4. Configure port security and ACLs
5. Set up DHCP server and relay
6. Configure EtherChannel
7. Implement HSRP/VRRP
8. Practice subnetting scenarios

### Troubleshooting Methodology
1. **Define Problem**: Gather symptoms
2. **Gather Information**: show commands
3. **Analyze Information**: Compare to baseline
4. **Eliminate Causes**: Test theories
5. **Propose Hypothesis**: Most likely cause
6. **Test Hypothesis**: Implement solution
7. **Solve Problem**: Verify resolution

### Important show Commands
```cisco
show ip interface brief
show ip route
show vlan brief
show interfaces trunk
show spanning-tree
show etherchannel summary
show ip ospf neighbor
show ip ospf database
show access-lists
show ip nat translations
show mac address-table
show cdp neighbors
show lldp neighbors
show version
show running-config
```

## Quick Reference Formulas

### Subnetting
- **Hosts per subnet**: 2^n - 2 (n = host bits)
- **Subnets**: 2^n (n = subnet bits)
- **Block size**: 256 - subnet mask value

### Binary Conversion
```
128  64  32  16  8  4  2  1
2^7  2^6 2^5 2^4 2^3 2^2 2^1 2^0
```

### Wildcard Mask
Wildcard = 255.255.255.255 - Subnet Mask

## Conclusion

Success in the CCNA exam requires understanding of fundamental concepts, hands-on configuration experience, and problem-solving skills. Focus on practical application of knowledge and consistent practice with lab scenarios.