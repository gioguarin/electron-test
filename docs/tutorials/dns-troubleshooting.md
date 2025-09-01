# DNS Troubleshooting Guide

## DNS Basics

### DNS Record Types
- **A**: IPv4 address
- **AAAA**: IPv6 address
- **CNAME**: Canonical name (alias)
- **MX**: Mail exchange
- **TXT**: Text records (SPF, DKIM, etc.)
- **NS**: Name server
- **SOA**: Start of authority
- **PTR**: Pointer (reverse DNS)
- **SRV**: Service record

## Troubleshooting Tools

### nslookup
Basic DNS queries:
```bash
# Query A record
nslookup example.com

# Query specific record type
nslookup -type=MX example.com

# Use specific DNS server
nslookup example.com 8.8.8.8
```

### dig
Advanced DNS troubleshooting:
```bash
# Basic query
dig example.com

# Query specific record
dig example.com MX

# Trace DNS path
dig +trace example.com

# Short answer
dig +short example.com

# Reverse lookup
dig -x 192.168.1.1

# Query all records
dig example.com ANY
```

### host
Simple DNS lookups:
```bash
# Basic lookup
host example.com

# Verbose output
host -v example.com

# Use specific server
host example.com 8.8.8.8
```

## Common DNS Issues

### 1. NXDOMAIN Errors
**Symptoms**: Domain doesn't exist
**Causes**:
- Typo in domain name
- Domain not registered
- DNS propagation delay

**Resolution**:
```bash
# Check domain registration
whois example.com

# Check authoritative servers
dig +nssearch example.com
```

### 2. DNS Timeout
**Symptoms**: Queries take too long or fail
**Causes**:
- Network connectivity issues
- Firewall blocking port 53
- DNS server down

**Resolution**:
```bash
# Test connectivity
ping 8.8.8.8

# Test DNS port
nc -zv 8.8.8.8 53

# Try alternative DNS
dig @1.1.1.1 example.com
```

### 3. Wrong IP Resolution
**Symptoms**: Domain resolves to incorrect IP
**Causes**:
- DNS cache poisoning
- Incorrect DNS records
- Split-horizon DNS

**Resolution**:
```bash
# Clear DNS cache (macOS)
sudo dscacheutil -flushcache

# Clear DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Check multiple DNS servers
for dns in 8.8.8.8 1.1.1.1 9.9.9.9; do
  echo "Checking $dns:"
  dig @$dns +short example.com
done
```

## DNS Propagation

### Understanding TTL
- TTL (Time To Live) controls caching duration
- Lower TTL = faster propagation but more queries
- Typical values: 300 (5 min) to 86400 (24 hours)

### Checking Propagation
```bash
# Check from multiple locations
# Use online tools like whatsmydns.net

# Query authoritative nameserver
dig @ns1.example.com example.com

# Compare with recursive resolver
dig @8.8.8.8 example.com
```

## DNS Security

### DNSSEC Validation
```bash
# Check DNSSEC status
dig +dnssec example.com

# Verify DNSSEC chain
delv example.com
```

### DNS over HTTPS (DoH)
- Cloudflare: https://1.1.1.1/dns-query
- Google: https://dns.google/dns-query
- Quad9: https://dns.quad9.net/dns-query

### DNS over TLS (DoT)
- Port 853 instead of 53
- Encrypted DNS queries
- Supported by modern resolvers

## Performance Optimization

### Query Time Analysis
```bash
# Measure query time
dig +stats example.com

# Compare resolvers
time dig @8.8.8.8 example.com
time dig @1.1.1.1 example.com
```

### Caching Strategy
1. Use local caching resolver
2. Set appropriate TTL values
3. Implement negative caching
4. Monitor cache hit ratio

## Best Practices

1. **Use Multiple DNS Servers**
   - Primary and secondary DNS
   - Different providers for redundancy

2. **Monitor DNS Performance**
   - Response times
   - Query success rate
   - Cache effectiveness

3. **Secure Your DNS**
   - Enable DNSSEC
   - Use DNS over HTTPS/TLS
   - Implement rate limiting

4. **Document DNS Changes**
   - Keep records of all changes
   - Note TTL adjustments
   - Track propagation times