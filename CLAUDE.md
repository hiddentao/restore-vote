# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Restore Vote" - a React application that displays policies from Restore Britain's PolicyVoter platform in a searchable table interface. The project was transformed from a migrant hotels mapping application to a policies browser.

## Development Commands

**Start development server:**
```bash
npm run dev
# or 
bun run dev
```

**Build for production:**
```bash
npm run build
# or
bun run build
```

**Lint code:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```

## Tech Stack & Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: PolicyVoter REST API (https://api.policyvoter.com/v1/policy/top/list)

### Key Architecture Patterns

**API Integration**: The app fetches policies at runtime via `PolicyApiService` which handles:
- Paginated API requests with parallel fetching for performance
- Response parsing from PolicyVoter's `{success, data: {policies: []}}` format
- Error handling and loading states

**Data Flow**: 
1. `App.tsx` manages global state (policies, loading, selected policy)
2. `PolicyApiService` fetches and ranks policies from external API
3. `PoliciesTable` displays searchable/filterable list
4. `PolicyDetailsModal` shows detailed policy information

**Policy Data Structure**: Policies include blockchain-related fields (`contractAddress`, `chain`), vote counts, creator information, and timestamps (Unix seconds format).

**Modal System**: Reusable `Modal` component with custom styling - close button positioned to overlap modal overlay using absolute positioning.

## Important Implementation Notes

**API Response Handling**: The PolicyVoter API returns timestamps as Unix seconds (not milliseconds) - convert using `* 1000` before passing to `Date()`.

**Search Functionality**: Filters policies by `title`, `creator.username`, and `category.name` fields.

**Styling Patterns**: Uses Tailwind with custom positioning for overlapping elements (modal close button uses `-top-3 -right-3` with wrapper div for proper overflow visibility).

**Component Organization**:
- `components/` - Reusable UI components (Modal, PoliciesTable, etc.)
- `services/` - API integration layer
- `types/` - TypeScript interfaces matching API response structure

## Deployment

The project deploys to Cloudflare Pages after building. The README mentions historical deployment to Fleek for privacy but current setup uses Cloudflare.
- use bun instead of npm as package manager