# Subnet Calculation Guide

## Overview
Subnetting is the practice of dividing a network into two or more smaller network segments. This guide covers the fundamentals of subnet calculation.

## Key Concepts

### IP Address Classes
- **Class A**: 1.0.0.0 to 126.255.255.255 (Default mask: 255.0.0.0 or /8)
- **Class B**: 128.0.0.0 to 191.255.255.255 (Default mask: 255.255.0.0 or /16)
- **Class C**: 192.0.0.0 to 223.255.255.255 (Default mask: 255.255.255.0 or /24)

### CIDR Notation
CIDR (Classless Inter-Domain Routing) notation represents the subnet mask as a suffix.
- Example: 192.168.1.0/24 means the first 24 bits are the network portion

## Calculation Steps

1. **Determine Network Address**
   - Perform bitwise AND between IP and subnet mask
   
2. **Calculate Broadcast Address**
   - Set all host bits to 1
   
3. **Find Usable Host Range**
   - First usable: Network address + 1
   - Last usable: Broadcast address - 1

## Common Subnet Masks

| CIDR | Subnet Mask | Hosts | Networks |
|------|------------|-------|----------|
| /24 | 255.255.255.0 | 254 | 1 |
| /25 | 255.255.255.128 | 126 | 2 |
| /26 | 255.255.255.192 | 62 | 4 |
| /27 | 255.255.255.224 | 30 | 8 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 32 |
| /30 | 255.255.255.252 | 2 | 64 |

## Example Calculation

Given: 192.168.1.130/26

1. Subnet Mask: 255.255.255.192
2. Network Address: 192.168.1.128
3. Broadcast Address: 192.168.1.191
4. Usable Range: 192.168.1.129 - 192.168.1.190
5. Total Hosts: 62