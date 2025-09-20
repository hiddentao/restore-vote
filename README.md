# Restore Vote

A React application that displays policies from Restore Britain's PolicyVoter platform in a searchable table interface. Browse and explore political policies with voting data, creator information, and detailed policy descriptions.

## Development

**Install dependencies:**
```bash
bun install
```

**Start development server:**
```bash
bun run dev
```

**Lint and format code:**
```bash
bun run lint      # Check for issues
bun run lint:fix  # Fix issues automatically
bun run format    # Format code with Biome
```

**Build for production:**
```bash
bun run build
```

**Preview production build:**
```bash
bun run preview
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: PolicyVoter REST API
- **Package Manager**: Bun

## Data & Automation

The application fetches policy data from the PolicyVoter API at build time and runtime. A scheduled rebuild runs hourly (at minute 15) via GitHub Actions to keep the policy data fresh.

**Fetch policies manually:**
```bash
bun run fetch-policies
```

## Deployment

The project deploys automatically to Cloudflare Pages. The scheduled rebuild workflow triggers hourly deployments to ensure policy data stays current.