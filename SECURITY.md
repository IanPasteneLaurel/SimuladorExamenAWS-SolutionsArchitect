# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Current Security Status

### ✅ Resolved Vulnerabilities

- **react-router-dom**: Updated to 6.30.6 (fixed XSS and open redirect issues)
- **postcss**: Updated to 8.5.28 (fixed XSS and path traversal issues)

### ⚠️ Known Vulnerabilities (Low Risk)

#### 1. esbuild / vite (Development Only)
- **Severity**: Moderate
- **Impact**: Development server only
- **Status**: Monitored
- **Risk Level**: LOW (not present in production build)
- **Explanation**: The esbuild vulnerability only affects the development server. Production builds are static files that don't include the development server.

#### 2. react-router (Conditional)
- **Severity**: Moderate  
- **Impact**: Open redirect in SSR scenarios
- **Status**: Monitored
- **Risk Level**: LOW (app doesn't use SSR)
- **Explanation**: The simulator is a client-side only application without Server-Side Rendering (SSR), making these vulnerabilities non-applicable to our use case.

### 🔒 Production Security

The production build (`npm run build`) generates static files that:
- ✅ Do NOT include development dependencies
- ✅ Do NOT include the Vite dev server
- ✅ Do NOT use Server-Side Rendering
- ✅ Are served as static HTML/CSS/JS files

## Updating Dependencies

To update dependencies and check for new security patches:

```bash
cd app
npm update
npm audit
```

### Force Update (Breaking Changes)

⚠️ Only if you understand the implications:

```bash
npm audit fix --force
```

This may update to major versions and break compatibility. Test thoroughly after running.

## Security Best Practices

### For Users
1. Always use the latest version from the main branch
2. Keep your browser updated
3. Don't store sensitive AWS credentials in the app
4. Use HTTPS when deployed

### For Developers
1. Run `npm audit` before deploying
2. Review dependency updates in PRs
3. Test security patches in staging first
4. Monitor GitHub Security Advisories

## Reporting a Vulnerability

If you discover a security vulnerability, please email:

**ian@ianlaurelpastene.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Release**: Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium/Low: Next release cycle

## Security Checklist for Production

- [x] HTTPS enabled (Vercel default)
- [x] No credentials in source code
- [x] Dependencies updated to latest secure versions
- [x] Content Security Policy headers (Vercel default)
- [x] No eval() or unsafe inline scripts
- [x] LocalStorage data is non-sensitive (progress only)
- [x] No external API calls (offline-first)
- [x] XSS protection via React (automatic escaping)

## Third-Party Security

### CDN & Hosting
- **Vercel**: SOC 2 Type II certified, GDPR compliant
- **npm packages**: All from verified publishers

### Data Storage
- **LocalStorage**: Only stores exam progress (no PII)
- **No backend**: Zero server-side data exposure
- **No cookies**: Session-less architecture

## Compliance

This project follows:
- OWASP Top 10 guidelines
- React security best practices
- Vercel security recommendations
- npm security audit standards

## Updates

Last security review: January 2025
Next scheduled review: March 2025

---

For the latest security information, check:
- [GitHub Security Advisories](https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect/security/advisories)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
