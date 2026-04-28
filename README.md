# my-live-feed

A self-updating data feed served as clean, scrapable HTML via GitHub Pages. Pulls from public APIs on a schedule and publishes the results at stable, predictable URLs.

## Live Pages

| Page | URL | Updates |
| ---- | --- | ------- |
| Global News | `/docs/news-global.html` | every 15 min |
| Sports Scores | `/docs/sports-scores.html` | every 5 min |
| Sports Headlines | `/docs/sports-headlines.html` | every 5 min |

## What It Covers

**News** — powered by The Guardian API

- World, Politics, Economics & Business, Technology, Environment
- Top 4 headlines per category

**Sports Scores** — powered by ESPN

- Premier League, Champions League, NBA, NFL, NHL, MLB, ATP & WTA Tennis
- Live scores, final results, and upcoming kickoff times

**Sports Headlines** — powered by ESPN

- Top 12 sports news stories across all leagues

## How It Works

```text
Public API (Guardian, ESPN)
    ↓
GitHub Actions cron job
    ↓
Node.js script fetches + formats data
    ↓
Writes clean HTML to /docs
    ↓
GitHub Pages serves at stable URL
```

The HTML output is intentionally minimal — no CSS, no JavaScript, plain semantic tags. Easy to read, easy to parse.

## Setup

1. Fork or clone this repo
2. Get a free Guardian API key at [open-platform.theguardian.com](https://open-platform.theguardian.com/access/)
3. Add it as a repository secret named `GUARDIAN_API_KEY` (Settings → Secrets → Actions)
4. Enable GitHub Pages from the `/docs` folder on `main` (Settings → Pages)
5. Push to `main` — the workflows start automatically
6. Trigger the first run manually from the Actions tab to populate the pages right away

## Stack

- Node.js scripts (no frameworks)
- GitHub Actions for scheduling
- GitHub Pages for hosting
- The Guardian API + ESPN public API
