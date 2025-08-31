# Claude Review Prompts Reference

This document contains the review prompts that were used in the Claude AI workflows. These can be useful for manual reviews or when configuring other AI review tools.

## Code Review Prompt

When reviewing pull requests for this Electron application, focus on:

### Security Issues
- Identify any security vulnerabilities, especially Electron-specific concerns
- Check for:
  - `nodeIntegration: true` (should be false)
  - `contextIsolation: false` (should be true)
  - `sandbox: false` (should be true)
  - `webSecurity: false` (should be true)
  - Loading remote content without validation
  - Use of `eval()` or similar dangerous functions
  - Exposed Node.js APIs in renderer process
  - Improper IPC validation

### Code Quality
- Style consistency with existing code
- Maintainability and readability
- Proper error handling
- Code duplication
- Function/variable naming conventions

### Bugs
- Potential null/undefined errors
- Logic errors
- Edge cases not handled
- Race conditions
- Memory leaks

### Performance
- Unnecessary re-renders
- Heavy computations in main thread
- Large data in IPC messages
- Inefficient algorithms
- Missing debouncing/throttling

### Electron Best Practices
- Proper IPC usage (contextBridge)
- Preload script security
- Context isolation maintained
- No direct Node.js access in renderer
- Proper window management
- Resource cleanup

## Security Analysis Focus

### Dependency Security
- Check npm audit results for high/critical vulnerabilities
- Review new dependencies for:
  - Maintenance status
  - Security history
  - License compatibility
  - Size/bloat

### Code Security Patterns
- XSS vulnerabilities (unsanitized user input)
- Remote code execution risks
- Unsafe API usage
- Sensitive data handling
- Storage security (localStorage vs secure storage)
- API key management

### Electron-Specific Security
1. **Main Process Security**
   - Validate all IPC inputs
   - Don't expose powerful APIs unnecessarily
   - Sanitize file paths

2. **Renderer Process Security**
   - No Node.js integration
   - Use contextBridge for IPC
   - Content Security Policy headers
   - Sanitize all user inputs

3. **Preload Script Security**
   - Minimal API exposure
   - Input validation
   - No secret storage

## Changelog Generation Guidelines

When generating changelogs, group changes by:

### Categories
- ✨ **Features** - New functionality
- 🐛 **Bug Fixes** - Issues resolved
- 🔒 **Security** - Security improvements
- 📈 **Performance** - Speed/efficiency improvements
- 📚 **Documentation** - Docs updates
- 🔧 **Maintenance** - Dependencies, refactoring
- 💥 **Breaking Changes** - Incompatible changes

### Format
```markdown
## [Version] - YYYY-MM-DD

### ✨ Features
- Brief description of new feature (#PR)

### 🐛 Bug Fixes
- Fixed issue with... (#PR)

### 🔒 Security
- Updated dependencies to patch vulnerabilities

### 📚 Documentation
- Updated README with...
```

## Review Response Format

### For PRs - Structured Feedback
```markdown
## 🔍 Code Review Summary
[Brief 1-2 sentence overview]

### ✅ Strengths
- [What's done well]
- [Good practices observed]

### ⚠️ Issues Found
#### 🔴 Critical (Must Fix)
- [Blocking issues]

#### 🟡 Warnings (Should Fix)
- [Important but not blocking]

#### 🔵 Suggestions (Consider)
- [Nice to have improvements]

### 💡 Recommendations
- [Specific actionable items]
```

### For Security Scans - Risk Assessment
```markdown
# 🔒 Security Analysis Report

## Risk Level: [Critical/High/Medium/Low]

## 🚨 Critical Issues
[Issues requiring immediate attention]

## ⚠️ Warnings
[Issues to address soon]

## ✅ Security Strengths
[What's properly configured]

## 📋 Recommendations
[Prioritized action items]

## 🛡️ Security Score: X/10
[Brief justification]
```

## Using These Prompts

These prompts can be used with:
- GitHub Copilot for Pull Requests
- Claude.ai API integrations
- Manual review checklists
- Team review guidelines
- Other AI code review tools

When adapting these prompts, ensure they align with your project's specific:
- Technology stack
- Security requirements
- Coding standards
- Team preferences