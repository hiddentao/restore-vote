# Deployment Guide

## Cloudflare Pages Deployment

This project includes an automated deployment script for Cloudflare Pages located at `src/scripts/deploy-cloudflare.ts`.

### Prerequisites

1. A Cloudflare account
2. Bun installed (https://bun.sh)
3. The required environment variables set

### Required Environment Variables

Set this environment variable before running the deployment:

```bash
# Your Cloudflare API token with Pages:Edit permissions
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

### Project Configuration

The following values are hardcoded in the deployment script:

- **Account ID**: `5e544347bfd7acfe7a9ca6f578cc0abf`
- **Project Name**: `migrant-hotels-uk`

### Getting Your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Add permissions: `Account:Read`, `Zone:Read`, `Cloudflare Pages:Edit`
5. Set account resources to include the account ID: `5e544347bfd7acfe7a9ca6f578cc0abf`

### Optional Environment Variables

```bash
# Override the build command (default: bun run build)
export BUILD_COMMAND="vite build"

# Override the build output directory (default: dist)  
export DIST_DIR="dist"

# Override the branch name for deployment (default: main)
export BRANCH="production"
```

### Deployment Methods

#### Method 1: Using bun script (recommended)
```bash
bun run deploy
```

#### Method 2: Direct execution with bun
```bash
bun run src/scripts/deploy-cloudflare.ts
```

#### Method 3: With custom environment variables
```bash
BUILD_COMMAND="vite build" DIST_DIR="build" bun run deploy
```

### What the Script Does

1. **Validates environment variables** - Ensures all required variables are set
2. **Checks Wrangler installation** - Installs Cloudflare's CLI tool if needed
3. **Builds the project** - Runs the build command (default: `bun run build`)
4. **Validates build output** - Ensures the dist directory exists and has files
5. **Deploys to Cloudflare Pages** - Uploads the built files using Wrangler

### Troubleshooting

- **Build fails**: Check that all dependencies are installed (`bun install`)
- **Deployment fails**: Verify your API token has the correct permissions
- **Wrangler not found**: The script will attempt to install it automatically
- **Permission errors**: Make sure your API token includes `Cloudflare Pages:Edit` permission

### Getting Help

Run the script with the help flag for detailed information:

```bash
bun run src/scripts/deploy-cloudflare.ts --help
```

Your deployed site will be available at: `https://migrant-hotels-uk.pages.dev`