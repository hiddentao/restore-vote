# migrant-hotels-uk

To maintain privacy we deploy on [Fleek](https://fleek.xyz) and only using their CLI so there is no 
link to Github.

Live: https://

## Development

Install dependencies:

```
bun i
```

Run:

```
bun run dev
```

## Deployment

Build:

```
bun run build
```

Then upload to Cloudflare pages.

## Scripts

### Grok4 Daily Task Runner

A script to call the Grok4 API for daily tasks and insights.

**Setup:**
1. Get your API key from [X.AI Console](https://console.x.ai/)
2. Set environment variable: `export GROK_API_KEY=your_api_key_here`

**Usage:**
```bash
# Simple task with console output
bun src/scripts/grok4-daily-task.ts "Summarize today's news about UK immigration"

# Save results to JSON file
bun src/scripts/grok4-daily-task.ts "Generate insights about migrant hotel data" results.json
```

**Environment Variables:**
- `GROK_API_KEY` or `XAI_API_KEY` - Your Grok API key (required)