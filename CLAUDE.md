# my-live-feed — CLAUDE.md

## What This Is

A personal GitHub Pages site that serves live data as clean, scrapable HTML pages. Built for personal use — pulling from public APIs and making the data available at stable URLs.

The site refreshes automatically via GitHub Actions on a schedule. Data is rendered as simple HTML that any tool can read and parse reliably.

---

## Architecture

```
Public API (ESPN, HackerNews, etc.)
    ↓
GitHub Actions cron job (scheduled refresh)
    ↓
Node.js script fetches + formats data
    ↓
Writes clean HTML to /docs folder
    ↓
GitHub Pages serves at stable URL
    ↓
https://tomeranderson.github.io/my-live-feed/scores.html
```

---

## Project Structure

```
my-live-feed/
├── .github/
│   └── workflows/
│       ├── update-scores.yml      ← cron every 15 min
│       ├── update-news.yml        ← cron every 30 min
│       └── update-weather.yml     ← optional
├── scripts/
│   ├── fetch-scores.js            ← ESPN API → scores.html
│   ├── fetch-news.js              ← HackerNews → news.html
│   └── fetch-weather.js           ← optional
├── docs/
│   ├── index.html                 ← overview / status page
│   ├── scores.html                ← sports scores
│   └── news.html                  ← news headlines
├── package.json
├── CLAUDE.md                      ← this file
└── README.md
```

GitHub Pages is served from the `/docs` folder on the `main` branch.

---

## HTML Output Rules

The HTML must be simple and clean — easy to read and parse:
- **No CSS, no JavaScript, no external resources**
- **Plain semantic HTML only** — h1, h2, p tags
- **Under 50 lines of visible content** per page
- **Always include a "Last updated:" timestamp** at the top
- Data as plain readable text — no tables, no complex nesting

### Good Example
```html
<!DOCTYPE html>
<html>
<head><title>Sports Scores</title></head>
<body>
<h1>Sports Scores</h1>
<p>Last updated: 2026-04-28 21:45 UTC</p>
<h2>Premier League — Today</h2>
<p>Arsenal 2-1 Chelsea (FT)</p>
<p>Liverpool 0-0 Man City (Live 67')</p>
<h2>NBA — Today</h2>
<p>Lakers 108-102 Warriors (FT)</p>
<h2>Upcoming</h2>
<p>Tottenham vs Man United — Tomorrow 20:00 UTC</p>
</body>
</html>
```

---

## APIs to Use

### Sports — ESPN (Free, No Key Required)
Base URL: `https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard`

| League | Sport | League String |
|--------|-------|---------------|
| Premier League | `soccer` | `eng.1` |
| Champions League | `soccer` | `uefa.champions` |
| NBA | `basketball` | `nba` |
| NFL | `football` | `nfl` |
| MLB | `baseball` | `mlb` |
| NHL | `hockey` | `nhl` |

Full example: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`

Key response fields per event:
- `e.competitions[0].competitors` — array of home + away teams
- `competitor.team.displayName` — team name
- `competitor.score` — score
- `competitor.homeAway` — `"home"` or `"away"`
- `e.competitions[0].status.type.shortDetail` — status string e.g. `"FT"`, `"Live 67'"`, `"7:45 PM"`

### News — HackerNews (Free, No Key)
- Top story IDs: `https://hacker-news.firebaseio.com/v0/topstories.json`
- Story detail: `https://hacker-news.firebaseio.com/v0/item/{id}.json`
- Useful fields: `title`, `score`, `by`, `url`
- Fetch top 10–15 stories, format as headlines

### News — NewsAPI (Optional, requires free key)
- Store key as GitHub Secret: `NEWS_API_KEY`
- Endpoint: `https://newsapi.org/v2/top-headlines?country=us&apiKey=${key}`
- Free tier: 100 requests/day

### TheSportsDB (Free tier, no key)
- Base: `https://www.thesportsdb.com/api/v1/json/3/`

---

## GitHub Actions Workflow Template

```yaml
name: Update Scores

on:
  schedule:
    - cron: '*/15 * * * *'   # every 15 minutes (stays within free tier on public repo)
  workflow_dispatch:           # also allows manual trigger from GitHub UI

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: node scripts/fetch-scores.js
      - name: Commit and push
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add docs/
          git commit -m "Update $(date -u)" || echo "No changes"
          git push
```

For workflows that need API keys:
```yaml
      - run: node scripts/fetch-news.js
        env:
          NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
```

---

## Setup Checklist

```
[ ] Create GitHub repo: my-live-feed (public)
[ ] Enable GitHub Pages: Settings → Pages → Source: /docs, main branch
[ ] Create folder structure: /docs, /scripts, /.github/workflows
[ ] Write package.json with node-fetch dependency
[ ] Write scripts/fetch-scores.js (ESPN → docs/scores.html)
[ ] Write scripts/fetch-news.js (HackerNews → docs/news.html)
[ ] Create .github/workflows/update-scores.yml
[ ] Create .github/workflows/update-news.yml
[ ] Add any API keys as GitHub Secrets (Settings → Secrets → Actions)
[ ] Push everything to main
[ ] Confirm GitHub Pages URL is live in browser
[ ] Manually trigger a workflow run to test
[ ] Confirm docs/scores.html and docs/news.html are accessible
[ ] Verify HTML output is clean and parseable
```

---

## Current Status

- [ ] Repo created
- [ ] GitHub Pages enabled
- [ ] fetch-scores.js written
- [ ] fetch-news.js written
- [ ] Cron workflows live
- [ ] URLs confirmed accessible

---

## Notes

- **Keep the repo public** — public repos get unlimited GitHub Actions minutes for free. No sensitive data goes into the HTML output. API keys stay in GitHub Secrets only.
- **15-minute cron** is the sweet spot — fresh enough for scores, safe within free tier even on private repos.
- The `/docs` folder is what GitHub Pages serves. All HTML output goes there.
- `git commit ... || echo "No changes"` prevents the workflow from failing when data hasn't changed since the last run.
