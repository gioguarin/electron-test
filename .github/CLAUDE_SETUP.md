# Claude AI GitHub Actions Setup Guide

This guide explains how to set up Claude AI integration with GitHub Actions for automated code reviews, security analysis, and changelog generation.

## Features

### 1. **Automated Code Reviews** (`claude-review.yml`)
- Reviews every pull request automatically
- Provides feedback on:
  - Security issues (Electron-specific)
  - Code quality and maintainability
  - Potential bugs and logic errors
  - Performance optimizations
  - Best practices

### 2. **Security Analysis** (`claude-security.yml`)
- Runs weekly or on-demand
- Analyzes:
  - Electron security configurations
  - Dependency vulnerabilities
  - Code security patterns
  - Creates GitHub issues for critical findings

### 3. **Changelog Generation** (`claude-changelog.yml`)
- Generates AI-powered changelogs
- Groups changes by category
- Acknowledges contributors
- Updates releases automatically

## Setup Instructions

### Step 1: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)

### Step 2: Add Secret to GitHub Repository

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secret:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key from Step 1
6. Click **Add secret**

### Step 3: Enable Workflows

The workflows are already in the `.github/workflows/` directory. They will automatically:
- **Code Review**: Trigger on every PR to main branch
- **Security Analysis**: Run weekly (Mondays at 9 AM UTC) or on-demand
- **Changelog**: Generate when creating releases

## Usage

### Manual Triggers

#### Code Review
```bash
# From GitHub Actions tab
# Select "Claude Code Review" → "Run workflow"
# Enter PR number (optional)
```

#### Security Analysis
```bash
# From GitHub Actions tab
# Select "Claude Security Analysis" → "Run workflow"
```

#### Changelog Generation
```bash
# From GitHub Actions tab
# Select "Claude Changelog Generator" → "Run workflow"
# Optionally specify a tag to generate changelog from
```

### Automatic Triggers

- **Pull Requests**: Claude reviews automatically when PR is opened or updated
- **Security Scans**: Run every Monday morning
- **Releases**: Changelog generated when release is created

## Cost Considerations

Claude API pricing (as of 2024):
- **Claude 3 Haiku** (used in workflows): ~$0.25 per million input tokens
- Estimated costs:
  - Code review: ~$0.01-0.02 per PR
  - Security analysis: ~$0.02-0.03 per run
  - Changelog: ~$0.01 per generation

## Customization

### Adjusting Review Focus

Edit `.github/workflows/claude-review.yml` to change the review prompt:
```python
prompt = f"""Your custom review instructions here..."""
```

### Changing Security Checks

Edit `.github/workflows/claude-security.yml` to add custom security patterns:
```bash
# Add your custom grep patterns
if grep -r "your-pattern" src/; then
  echo "⚠️ WARNING: Pattern found" >> security_report.txt
fi
```

### Modifying Changelog Format

Edit `.github/workflows/claude-changelog.yml` to customize changelog structure.

## Troubleshooting

### Workflow Not Running
- Check if `ANTHROPIC_API_KEY` secret is set
- Verify workflow files are in `.github/workflows/`
- Check Actions tab for error messages

### API Key Issues
- Ensure key starts with `sk-ant-api03-`
- Check key hasn't expired
- Verify billing is active on Anthropic account

### Rate Limiting
- Claude API has rate limits
- If hit, workflows will retry with backoff
- Consider using different API keys for different workflows

## Security Best Practices

1. **Never commit API keys** - Always use GitHub Secrets
2. **Limit key permissions** - Use read-only keys where possible
3. **Rotate keys regularly** - Update every 90 days
4. **Monitor usage** - Check Anthropic console for unusual activity
5. **Review permissions** - Ensure workflows have minimal required permissions

## Support

For issues with:
- **Workflows**: Create an issue in this repository
- **Claude API**: Contact support@anthropic.com
- **GitHub Actions**: See [GitHub Actions documentation](https://docs.github.com/actions)

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Claude Model Guide](https://docs.anthropic.com/claude/docs/models-overview)
- [GitHub Actions Best Practices](https://docs.github.com/actions/guides)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)