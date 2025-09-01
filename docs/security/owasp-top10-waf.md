# OWASP Top 10 for Web Application Firewalls (WAF)

## Overview

The OWASP Top 10 represents the most critical security risks to web applications. This guide explains how to configure and optimize WAFs to protect against these vulnerabilities.

## 1. Injection (A03:2021)

### Threat Description
SQL, NoSQL, OS, and LDAP injection attacks where untrusted data is sent to an interpreter.

### WAF Protection Strategies
- **SQL Injection Rules**: Enable pattern matching for SQL keywords and common injection patterns
- **Input Validation**: Block requests containing suspicious characters (', --, ;, xp_, sp_)
- **Parameter Tampering**: Monitor query string and form parameters
- **Encoding Detection**: Detect various encoding attempts (URL, Unicode, Hex)

### WAF Configuration
```
# Example ModSecurity Rule
SecRule ARGS "@detectSQLi" \
    "id:1001,\
    phase:2,\
    block,\
    msg:'SQL Injection Attack Detected',\
    logdata:'Matched Data: %{MATCHED_VAR} found within %{MATCHED_VAR_NAME}'"
```

## 2. Broken Authentication (A07:2021)

### Threat Description
Authentication and session management flaws allowing attackers to compromise passwords, keys, or session tokens.

### WAF Protection Strategies
- **Brute Force Protection**: Rate limiting on login endpoints
- **Session Hijacking**: Validate session tokens and detect anomalies
- **Credential Stuffing**: Block known compromised credentials
- **Geographic Restrictions**: Limit authentication from unexpected locations

### Rate Limiting Rules
```
# Limit login attempts to 5 per minute
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

## 3. Sensitive Data Exposure (A02:2021 - Cryptographic Failures)

### Threat Description
Inadequate protection of sensitive data like credit cards, tax IDs, and authentication credentials.

### WAF Protection Strategies
- **SSL/TLS Enforcement**: Force HTTPS connections
- **Data Masking**: Hide sensitive data in logs
- **Response Filtering**: Block responses containing credit card numbers, SSNs
- **Header Security**: Add security headers (HSTS, CSP, X-Frame-Options)

### Security Headers
```
# Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

## 4. XML External Entities (XXE) - Part of Injection

### Threat Description
XML processors evaluating external entity references within XML documents.

### WAF Protection Strategies
- **XML Validation**: Block requests with DTD declarations
- **Entity Detection**: Identify SYSTEM, PUBLIC entities
- **Content-Type Validation**: Strict XML content-type checking
- **Payload Size Limits**: Restrict XML document size

### Detection Patterns
```
<!ENTITY
<!DOCTYPE
SYSTEM
PUBLIC
file://
php://
expect://
```

## 5. Broken Access Control (A01:2021)

### Threat Description
Restrictions on authenticated users are not properly enforced.

### WAF Protection Strategies
- **Path Traversal Prevention**: Block ../, ..\\ patterns
- **Forced Browsing Protection**: Whitelist allowed paths
- **Method Enforcement**: Restrict HTTP methods per endpoint
- **Parameter Manipulation**: Detect unauthorized parameter changes

### Access Control Rules
```
# Block directory traversal
SecRule ARGS "@contains ../" \
    "id:1005,\
    phase:2,\
    block,\
    msg:'Path Traversal Attack Attempt'"
```

## 6. Security Misconfiguration (A05:2021)

### Threat Description
Missing appropriate security hardening across the application stack.

### WAF Protection Strategies
- **Error Message Filtering**: Hide stack traces and debug information
- **Default Page Blocking**: Block access to default installations
- **Version Disclosure**: Remove server version headers
- **Admin Interface Protection**: Restrict admin panel access

### Configuration Hardening
```
# Hide server version
server_tokens off;
# Block common admin paths
location ~ ^/(admin|phpmyadmin|wp-admin) {
    deny all;
}
```

## 7. Cross-Site Scripting (XSS) (A03:2021 - Part of Injection)

### Threat Description
Applications include untrusted data without proper validation or escaping.

### WAF Protection Strategies
- **Script Tag Detection**: Block <script>, javascript:, onerror=
- **Event Handler Filtering**: Detect onload=, onclick=, etc.
- **Encoding Bypass Detection**: Identify encoded XSS attempts
- **CSP Implementation**: Content Security Policy headers

### XSS Prevention Rules
```
SecRule ARGS "@contains <script" \
    "id:1007,\
    phase:2,\
    block,\
    msg:'XSS Attack Detected',\
    t:htmlEntityDecode,t:lowercase"
```

## 8. Insecure Deserialization (A08:2021 - Software and Data Integrity Failures)

### Threat Description
Deserialization of untrusted data leading to remote code execution.

### WAF Protection Strategies
- **Serialized Object Detection**: Identify Java, PHP, .NET serialization
- **Payload Analysis**: Block known gadget chains
- **Content-Type Validation**: Strict content-type checking
- **Size Limitations**: Restrict serialized data size

### Detection Signatures
```
# PHP serialization
O:\d+:"
a:\d+:{
# Java serialization
\xAC\xED\x00\x05
rO0ABQ==
```

## 9. Using Components with Known Vulnerabilities (A06:2021)

### Threat Description
Using libraries, frameworks with known vulnerabilities.

### WAF Protection Strategies
- **CVE Signature Matching**: Block known exploit patterns
- **Virtual Patching**: Temporary protection before patching
- **Version Detection**: Identify and block outdated components
- **Zero-Day Protection**: Anomaly detection for unknown threats

### Virtual Patching Example
```
# Block Log4j exploit attempts
SecRule REQUEST_LINE|ARGS|ARGS_NAMES|REQUEST_COOKIES|REQUEST_COOKIES_NAMES|REQUEST_HEADERS \
    "@contains ${jndi:" \
    "id:1009,\
    phase:1,\
    block,\
    msg:'Log4j Exploit Attempt'"
```

## 10. Insufficient Logging & Monitoring (A09:2021 - Security Logging and Monitoring Failures)

### Threat Description
Insufficient logging and monitoring coupled with missing incident response.

### WAF Logging Best Practices
- **Comprehensive Logging**: Log all security events
- **Log Correlation**: Integrate with SIEM systems
- **Real-time Alerting**: Immediate notification of attacks
- **Log Retention**: Maintain logs per compliance requirements

### Logging Configuration
```
# ModSecurity Audit Log
SecAuditEngine RelevantOnly
SecAuditLogRelevantStatus "^(?:5|4(?!04))"
SecAuditLogType Serial
SecAuditLog /var/log/modsec_audit.log
```

## WAF Deployment Best Practices

### 1. Mode Selection
- **Detection Mode**: Initial deployment for learning
- **Blocking Mode**: Production protection after tuning
- **Mixed Mode**: Selective blocking based on confidence

### 2. Rule Management
- **Core Rule Set (CRS)**: Use OWASP ModSecurity CRS
- **Custom Rules**: Develop application-specific rules
- **False Positive Tuning**: Regular review and adjustment
- **Rule Updates**: Keep signatures current

### 3. Performance Optimization
- **Caching**: Cache validated requests
- **Rate Limiting**: Prevent DoS attacks
- **Geographic Filtering**: Block unnecessary regions
- **CDN Integration**: Combine with CDN for better performance

### 4. Monitoring and Maintenance
- **Dashboard Setup**: Real-time visibility
- **Alert Configuration**: Critical event notifications
- **Regular Reviews**: Weekly security reports
- **Incident Response**: Defined procedures for attacks

## Testing WAF Effectiveness

### Tools for WAF Testing
- **OWASP ZAP**: Automated security testing
- **Burp Suite**: Manual penetration testing
- **SQLMap**: SQL injection testing
- **Nikto**: Web server scanner
- **ModSecurity CRS Testing**: Official test suite

### Testing Checklist
- [ ] Injection attacks (SQL, NoSQL, Command)
- [ ] XSS attempts (reflected, stored, DOM)
- [ ] Authentication bypass attempts
- [ ] Session manipulation
- [ ] File upload attacks
- [ ] XXE injection
- [ ] SSRF attempts
- [ ] Rate limiting effectiveness
- [ ] Geographic restrictions
- [ ] Custom rule validation

## Compliance Considerations

### PCI DSS Requirements
- Requirement 6.6: WAF deployment for public-facing applications
- Daily log reviews
- Annual security testing

### GDPR Considerations
- Data protection controls
- Logging of security events
- Incident reporting procedures

## Conclusion

A properly configured WAF provides essential protection against the OWASP Top 10, but should be part of a defense-in-depth strategy. Regular updates, tuning, and monitoring are crucial for maintaining effective protection.