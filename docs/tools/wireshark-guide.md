# Wireshark Commands and Packet Analysis Guide

## Overview

Wireshark is the world's most popular network protocol analyzer. This guide covers essential commands, filters, and techniques for effective packet capture and analysis.

## Installation and Setup

### Command Line Tools

```bash
# Debian/Ubuntu
sudo apt-get install wireshark tshark

# macOS
brew install wireshark

# CentOS/RHEL
sudo yum install wireshark wireshark-cli

# Windows (PowerShell as Admin)
choco install wireshark
```

### Initial Configuration

```bash
# Add user to wireshark group (Linux)
sudo usermod -a -G wireshark $USER

# Set capture permissions
sudo setcap cap_net_raw,cap_net_admin+eip /usr/bin/dumpcap

# Verify installation
wireshark --version
tshark --version
```

## Capture Filters (BPF Syntax)

Capture filters are applied during packet capture to reduce the amount of data collected.

### Basic Capture Filters

```
# Capture by Protocol
tcp
udp
icmp
arp

# Capture by Port
port 80
port 443
port 22
portrange 1-1024

# Capture by Host
host 192.168.1.1
src host 10.0.0.1
dst host 8.8.8.8

# Capture by Network
net 192.168.1.0/24
src net 10.0.0.0/8
dst net 172.16.0.0/12

# Combination Filters
tcp port 80 and host 192.168.1.100
udp portrange 5060-5070 or port 16384-32768
not arp and not icmp
tcp port 443 or tcp port 8443
```

### Advanced Capture Filters

```
# TCP Flags
tcp[tcpflags] & (tcp-syn) != 0
tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn
tcp[tcpflags] & (tcp-fin) != 0

# Packet Size
greater 1500
less 64
len <= 64

# MAC Address
ether host aa:bb:cc:dd:ee:ff
ether src 00:11:22:33:44:55
ether dst ff:ff:ff:ff:ff:ff

# VLAN
vlan 10
vlan 10 and tcp port 80

# IPv6
ip6
ip6 host 2001:db8::1
ip6 net 2001:db8::/32
```

## Display Filters

Display filters are applied after capture to analyze specific packets.

### Protocol Filters

```
# Application Layer
http
https
dns
dhcp
ftp
ssh
telnet
smtp
pop
imap
snmp
ntp
sip
rtp

# Transport Layer
tcp
udp
tcp.port == 80
udp.port == 53

# Network Layer
ip
ipv6
icmp
arp
ip.addr == 192.168.1.1
ip.src == 10.0.0.1
ip.dst == 8.8.8.8

# Data Link Layer
eth
eth.addr == aa:bb:cc:dd:ee:ff
eth.src == 00:11:22:33:44:55
```

### HTTP/HTTPS Analysis

```
# HTTP Methods
http.request.method == "GET"
http.request.method == "POST"
http.request.method == "PUT"
http.request.method == "DELETE"

# HTTP Response Codes
http.response.code == 200
http.response.code == 404
http.response.code == 500
http.response.code >= 400

# HTTP Headers
http.host == "example.com"
http.user_agent contains "Mozilla"
http.cookie contains "session"
http.referer contains "google"

# HTTP Content
http contains "password"
http.request.uri contains "/admin"
http.content_type contains "json"
http.content_length > 1000

# HTTPS/TLS
tls.handshake.type == 1  # Client Hello
tls.handshake.type == 2  # Server Hello
tls.handshake.extensions_server_name == "example.com"
ssl.record.version == 0x0303  # TLS 1.2
```

### DNS Analysis

```
# DNS Queries
dns.qry.name == "example.com"
dns.qry.type == 1   # A record
dns.qry.type == 28  # AAAA record
dns.qry.type == 15  # MX record
dns.qry.type == 16  # TXT record

# DNS Responses
dns.resp.type == 1
dns.flags.response == 1
dns.flags.rcode == 0  # No error
dns.flags.rcode == 3  # NXDOMAIN

# DNS Analysis
dns.time > 1  # Slow DNS responses
dns.count.answers > 0
dns contains "malware"
```

### TCP Analysis

```
# TCP Flags
tcp.flags.syn == 1
tcp.flags.ack == 1
tcp.flags.fin == 1
tcp.flags.reset == 1
tcp.flags.push == 1

# TCP Connections
tcp.flags.syn == 1 and tcp.flags.ack == 0  # SYN packets
tcp.flags.syn == 1 and tcp.flags.ack == 1  # SYN-ACK packets
tcp.stream eq 0  # First TCP stream

# TCP Problems
tcp.analysis.retransmission
tcp.analysis.duplicate_ack
tcp.analysis.lost_segment
tcp.analysis.out_of_order
tcp.analysis.zero_window
tcp.analysis.window_full

# TCP Metrics
tcp.window_size < 1000
tcp.time_delta > 1
tcp.len > 0  # TCP segments with data
```

### Security Analysis

```
# Suspicious Patterns
http.request.uri contains "../../"  # Path traversal
http contains "SELECT" and http contains "FROM"  # SQL injection
http contains "<script"  # XSS attempts
tcp.port == 4444 or tcp.port == 31337  # Common backdoor ports

# Port Scans
tcp.flags.syn == 1 and tcp.flags.ack == 0 and tcp.window_size <= 1024
tcp.dstport >= 1 and tcp.dstport <= 1024 and tcp.flags.syn == 1

# ARP Spoofing
arp.duplicate-address-detected
arp.opcode == 2  # ARP replies

# ICMP Analysis
icmp.type == 8  # Echo request
icmp.type == 0  # Echo reply
icmp.type == 3  # Destination unreachable
icmp.type == 11 # Time exceeded
```

### Performance Analysis

```
# Response Time
http.time > 1
dns.time > 0.5
tcp.time_delta > 0.2

# Packet Loss Indicators
tcp.analysis.retransmission
frame.time_delta > 1

# Bandwidth Usage
frame.len > 1400
ip.len > 1400

# Window Size Issues
tcp.window_size == 0
tcp.window_size < 100
```

## TShark Command Line

TShark is Wireshark's command-line network protocol analyzer.

### Basic Capture

```bash
# Capture on interface
tshark -i eth0

# Capture with count limit
tshark -i eth0 -c 100

# Capture with time limit
tshark -i eth0 -a duration:60

# Capture with file size limit
tshark -i eth0 -a filesize:100

# Capture to file
tshark -i eth0 -w capture.pcap

# Capture with filter
tshark -i eth0 -f "tcp port 80"
```

### Reading Capture Files

```bash
# Read pcap file
tshark -r capture.pcap

# Apply display filter
tshark -r capture.pcap -Y "http"

# Show specific fields
tshark -r capture.pcap -T fields -e ip.src -e ip.dst -e tcp.port

# Export as JSON
tshark -r capture.pcap -T json > output.json

# Export as CSV
tshark -r capture.pcap -T fields -e frame.time -e ip.src -e ip.dst -E header=y -E separator=, > output.csv
```

### Statistics and Analysis

```bash
# Protocol hierarchy
tshark -r capture.pcap -z io,phs

# Conversation statistics
tshark -r capture.pcap -z conv,tcp
tshark -r capture.pcap -z conv,ip

# Protocol statistics
tshark -r capture.pcap -z http,tree
tshark -r capture.pcap -z dns,tree

# IO statistics
tshark -r capture.pcap -z io,stat,1

# Expert info
tshark -r capture.pcap -z expert

# Follow TCP stream
tshark -r capture.pcap -z follow,tcp,ascii,0
```

### Advanced TShark Usage

```bash
# Decrypt HTTPS traffic (with key)
tshark -r capture.pcap -o tls.keylog_file:keys.log

# Extract files from HTTP
tshark -r capture.pcap --export-objects http,exported_files

# Ring buffer capture
tshark -i eth0 -b filesize:100 -b files:10 -w capture.pcap

# Remote capture
ssh user@remote "tcpdump -i eth0 -w -" | wireshark -k -i -

# Live filtering and analysis
tshark -i eth0 -Y "http.request" -T fields -e http.host -e http.request.uri

# Custom output format
tshark -r capture.pcap -T fields \
  -e frame.number \
  -e frame.time \
  -e ip.src \
  -e ip.dst \
  -e _ws.col.Protocol \
  -e _ws.col.Info
```

## Dumpcap Command Line

Dumpcap is a network traffic dump tool that captures packet data.

```bash
# List interfaces
dumpcap -D

# Basic capture
dumpcap -i eth0 -w capture.pcap

# Capture with multiple files
dumpcap -i eth0 -b filesize:100000 -b files:10 -w capture.pcap

# Capture statistics
dumpcap -i eth0 -S

# Capture with snaplen
dumpcap -i eth0 -s 96 -w capture.pcap
```

## Editcap Command Line

Editcap edits and converts capture files.

```bash
# Convert file format
editcap input.pcap output.pcapng

# Extract time range
editcap -A "2024-01-01 00:00:00" -B "2024-01-01 01:00:00" input.pcap output.pcap

# Remove duplicates
editcap -d input.pcap output.pcap

# Split by packet count
editcap -c 1000 input.pcap split.pcap

# Split by time interval
editcap -i 60 input.pcap split.pcap

# Apply time adjustment
editcap -t 3600 input.pcap output.pcap  # Add 1 hour

# Remove specific packets
editcap input.pcap output.pcap 1-100 200-300  # Keep only packets 1-100 and 200-300
```

## Mergecap Command Line

Mergecap merges multiple capture files.

```bash
# Basic merge
mergecap -w output.pcap input1.pcap input2.pcap input3.pcap

# Merge with specific encapsulation
mergecap -T ether -w output.pcap input*.pcap

# Merge in chronological order
mergecap -a -w output.pcap input*.pcap

# Set snapshot length
mergecap -s 96 -w output.pcap input*.pcap
```

## Common Analysis Workflows

### 1. Network Troubleshooting

```bash
# Capture specific conversation
tshark -i eth0 -f "host 192.168.1.100 and host 192.168.1.1"

# Check for packet loss
tshark -r capture.pcap -Y "tcp.analysis.retransmission" | wc -l

# Find slow responses
tshark -r capture.pcap -Y "http.time > 1" -T fields -e http.host -e http.time

# Analyze TCP issues
tshark -r capture.pcap -Y "tcp.analysis.flags" -T fields -e frame.number -e ip.src -e ip.dst -e tcp.analysis.flags
```

### 2. Security Analysis

```bash
# Find suspicious DNS queries
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name | sort | uniq -c | sort -rn | head -20

# Detect port scans
tshark -r capture.pcap -Y "tcp.flags.syn==1 and tcp.flags.ack==0" -T fields -e ip.src | sort | uniq -c | sort -rn

# Find HTTP passwords
tshark -r capture.pcap -Y 'http.request.method == "POST" and http contains "password"'

# Extract URLs
tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri | sed -e 's/\t/:\/\//'

# Find large data transfers
tshark -r capture.pcap -T fields -e ip.src -e ip.dst -e frame.len | awk '{sum[$1" -> "$2] += $3} END {for (i in sum) print i, sum[i]}' | sort -k3 -rn | head
```

### 3. Performance Analysis

```bash
# Calculate throughput
tshark -r capture.pcap -z io,stat,1

# Top talkers
tshark -r capture.pcap -z conv,ip -q

# Protocol distribution
tshark -r capture.pcap -z io,phs -q

# Response time analysis
tshark -r capture.pcap -Y "http" -T fields -e frame.time_relative -e http.time -e http.request.uri

# Find TCP window problems
tshark -r capture.pcap -Y "tcp.window_size == 0" -T fields -e frame.time -e ip.src -e ip.dst
```

### 4. VoIP Analysis

```bash
# SIP analysis
tshark -r capture.pcap -Y "sip" -T fields -e frame.time -e sip.Method -e sip.Status-Code

# RTP streams
tshark -r capture.pcap -z rtp,streams

# Extract SIP calls
tshark -r capture.pcap -Y "sip.Method == INVITE"

# Find call quality issues
tshark -r capture.pcap -Y "rtcp" -T fields -e rtcp.ssrc.fraction -e rtcp.ssrc.jitter
```

## Useful Wireshark Features

### Follow Streams
- TCP Stream: Right-click packet → Follow → TCP Stream
- UDP Stream: Right-click packet → Follow → UDP Stream
- HTTP Stream: Right-click packet → Follow → HTTP Stream
- TLS Stream: Right-click packet → Follow → TLS Stream

### Export Objects
- File → Export Objects → HTTP
- File → Export Objects → SMB
- File → Export Objects → TFTP
- File → Export Objects → DICOM

### Statistics Menus
- Statistics → Protocol Hierarchy
- Statistics → Conversations
- Statistics → Endpoints
- Statistics → IO Graphs
- Statistics → Flow Graph
- Statistics → HTTP → Requests
- Statistics → DNS

### Expert Information
- Analyze → Expert Information
- Shows errors, warnings, notes
- Grouped by severity and protocol

## Decryption

### TLS/SSL Decryption

```bash
# Using pre-master secret
tshark -r capture.pcap -o tls.keylog_file:sslkeys.log

# Using RSA private key
tshark -r capture.pcap -o tls.keys_list:"192.168.1.1,443,http,server.key"

# Environment variable for browsers
export SSLKEYLOGFILE=/path/to/sslkeys.log
```

### WPA/WPA2 Decryption

```bash
# Add WPA passphrase
tshark -r capture.pcap -o wlan.enable_decryption:TRUE -o "wlan.wep_key1:wpa-pwd:MyPassword:MySSID"
```

## Capture File Formats

### Supported Formats
- **pcap**: Traditional format, widely supported
- **pcapng**: Enhanced format with metadata
- **cap**: Microsoft Network Monitor
- **snoop**: Solaris snoop
- **txt**: Text export

### Format Conversion

```bash
# Convert between formats
editcap -F pcap input.pcapng output.pcap
editcap -F pcapng input.pcap output.pcapng

# Text export
tshark -r capture.pcap -V > output.txt
```

## Performance Tips

### Optimization Techniques
1. **Use capture filters**: Reduce data at capture time
2. **Limit snaplen**: Capture only needed bytes
3. **Disable name resolution**: Faster processing
4. **Use ring buffers**: Manage large captures
5. **Filter before analysis**: Reduce dataset size

### Large Capture Handling

```bash
# Split large files
editcap -c 100000 large.pcap split.pcap

# Process in chunks
for file in split*.pcap; do
    tshark -r "$file" -Y "http" >> http_traffic.txt
done

# Use capinfos for file info
capinfos capture.pcap
```

## Scripting and Automation

### Python with pyshark

```python
import pyshark

# Live capture
capture = pyshark.LiveCapture(interface='eth0')
capture.sniff(timeout=10)

for packet in capture:
    if 'IP' in packet:
        print(f"{packet.ip.src} -> {packet.ip.dst}")

# File analysis
cap = pyshark.FileCapture('capture.pcap')
for packet in cap:
    if hasattr(packet, 'http'):
        print(packet.http.host)
```

### Bash Scripting

```bash
#!/bin/bash
# Monitor for specific traffic

while true; do
    tshark -i eth0 -a duration:60 -Y "tcp.port == 4444" > alert.txt
    if [ -s alert.txt ]; then
        echo "Suspicious traffic detected!"
        mail -s "Security Alert" admin@example.com < alert.txt
    fi
    sleep 60
done
```

## Troubleshooting Common Issues

### Permission Issues
```bash
# Linux
sudo chmod +x /usr/bin/dumpcap
sudo setcap cap_net_raw,cap_net_admin+eip /usr/bin/dumpcap

# Check permissions
getcap /usr/bin/dumpcap
```

### Performance Issues
- Reduce color output: `-O`
- Disable DNS resolution: `-n`
- Use read filters: `-R` or `-Y`
- Increase buffer size: `-B 10`

### Memory Issues
- Use ring buffer captures
- Process files in chunks
- Use tshark instead of Wireshark GUI
- Apply capture filters early

## Quick Reference Card

### Most Used Display Filters
```
ip.addr == 192.168.1.1
tcp.port == 80
udp.port == 53
http
dns
tcp.flags.syn == 1
tcp.analysis.retransmission
http.response.code >= 400
frame contains "error"
not arp
```

### Most Used TShark Commands
```bash
tshark -i eth0                           # Capture on interface
tshark -r file.pcap                      # Read file
tshark -r file.pcap -Y "http"           # Apply filter
tshark -r file.pcap -T fields -e ip.src # Extract fields
tshark -r file.pcap -z io,stat,1        # Statistics
tshark -r file.pcap -q -z conv,tcp      # Conversations
```

### Useful Capture Filters
```
host 192.168.1.1
port 80
tcp
udp
not broadcast and not multicast
net 192.168.0.0/16
src port 443
dst host google.com
```

## Conclusion

Wireshark and its command-line tools provide powerful capabilities for network analysis, troubleshooting, and security investigations. Mastering display filters, capture techniques, and command-line tools enables efficient packet analysis and network diagnostics.