# Azure Static Web Apps Deployment Guide for Synapse

## Completed Local Configuration ✅

The following files have been configured for Azure Static Web Apps:

### 1. **Next.js Configuration** (`next.config.ts`)
- ✅ Added `output: "standalone"` for Azure Static Web Apps compatibility
- Build command: `npm run build`
- Output location: `.next/standalone`

### 2. **Configuration Files Created**
- ✅ `staticwebapp.config.json` - Routing and SWA-specific settings
- ✅ `swa-cli.config.json` - Local development with SWA CLI
- ✅ `.github/workflows/azure-static-web-apps-deploy.yml` - CI/CD automation

### 3. **TypeScript Issues Fixed**
- ✅ Resolved PositionalAudio type errors
- ✅ Next.js build verified and working

---

## Step-by-Step Deployment Guide

### Step 1: Prepare Your GitHub Repository

Push your code to GitHub (if not already pushed):

```bash
cd /Users/davidrazo/Documents/🚀\ MSS26/App/synapse
git add .
git commit -m "Add Azure Static Web Apps configuration"
git push origin main
```

### Step 2: Create Azure Static Web App (Azure Portal)

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Static Web App"** and click **Create**

**Configuration Details:**
- **Project name**: `synapse`
- **Resource group**: Create new or select existing
- **Plan type**: Free (for testing) or Standard
- **Region**: Choose closest to your users (e.g., East US, West Europe)
- **Sign in with GitHub**: Click and authorize
- **Organization**: Select `pirru1004`
- **Repository**: Select `synapse`
- **Branch**: `main`

### Step 3: Configure Build Settings

When prompted for build configuration:

- **Build presets**: `Next.js`
- **App location**: `.` (root)
- **API location**: Leave empty (no API functions)
- **Output location**: `.next/standalone`

Or manually set:

| Setting | Value |
|---------|-------|
| **App location** | `.` |
| **Build command** | `npm run build` |
| **Output location** | `.next/standalone` |

### Step 4: Complete Creation

1. Click **Review + Create**
2. Click **Create**
3. Azure will create the resource and generate a GitHub Actions workflow
4. Wait for the initial deployment to complete (~5-10 minutes)

### Step 5: Get Your Live Preview URL

Once deployment completes:

1. Go to the Azure Static Web App resource in the portal
2. Click **Overview**
3. Copy the **URL** under "Default domain" (looks like: `https://synapse-abc123.azurestaticapps.net`)

### Step 6: Verify Deployment

Visit your live URL and verify the app loads correctly:
- [ ] Homepage loads without errors
- [ ] Tailwind CSS styling is applied
- [ ] Three.js Universe component renders
- [ ] Framer Motion animations work
- [ ] No console errors

---

## Local Testing (Optional)

Before uploading to Azure, test locally with SWA CLI:

```bash
# Install SWA CLI (already done)
npm install -g @azure/static-web-apps-cli

# Build the app
npm run build

# Simulate Azure Static Web Apps locally
swa start .next/standalone
```

Visit `http://localhost:4280` to test the production build locally.

---

## GitHub Workflow Details

**File**: `.github/workflows/azure-static-web-apps-deploy.yml`

**What it does:**
- Triggers on push to `main` branch
- Builds Next.js app with `npm run build`
- Copies `staticwebapp.config.json` to `.next/` for routing configuration
- Deploys to Azure Static Web Apps
- Handles pull request previews automatically

**Deployment token**: The workflow uses `AZURE_STATIC_WEB_APPS_API_TOKEN_SYNAPSE` secret (automatically created by Azure when you connect the repo)

---

## Configuration Reference

### `staticwebapp.config.json`
Routes all requests to the Next.js app with SPA fallback:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [...]
}
```

### `swa-cli.config.json`
Local development configuration:
```json
{
  "configurations": {
    "app": {
      "outputLocation": ".next",
      "appLocation": ".",
      "appBuildCommand": "npm run build"
    }
  }
}
```

---

## Troubleshooting

### Build Fails in GitHub Actions
- Check GitHub Actions workflow logs
- Verify all dependencies are in `package.json`
- Ensure build works locally: `npm run build`

### App shows 404 errors
- Verify `staticwebapp.config.json` is in the project root
- Check routing rules for API endpoints
- Ensure SPA fallback is configured

### Static assets not loading
- Verify `public/` folder contents are deployed
- Check asset paths in components
- Verify Next.js configuration has proper output settings

### Performance issues
- Check Network tab in browser DevTools
- Verify Three.js and Framer Motion bundles are optimized
- Consider enabling SWA caching for static assets

---

## Your Live App

**Once deployed, your app will be available at:**
```
https://synapse-[random-id].azurestaticapps.net
```

You can also set up a custom domain:
1. Go to Azure Static Web App → Custom domains
2. Add your domain
3. Follow DNS configuration instructions

---

## Next Steps

1. ✅ Complete the Azure Portal setup
2. ✅ Authorize GitHub connection
3. ✅ Let the initial deployment run
4. ✅ Copy the URL and test the live app
5. (Optional) Set up custom domain
6. (Optional) Enable authentication/authorization

**Need help?** Check the [Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
