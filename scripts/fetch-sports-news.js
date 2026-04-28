const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const sources = [
  { sport: 'soccer',     league: 'eng.1', label: 'Soccer' },
  { sport: 'basketball', league: 'nba',   label: 'NBA' },
  { sport: 'football',   league: 'nfl',   label: 'NFL' },
  { sport: 'hockey',     league: 'nhl',   label: 'NHL' },
];

async function fetchNews(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?limit=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN news error ${res.status} for ${league}`);
  const data = await res.json();
  return data.articles || [];
}

async function main() {
  const timestamp = new Date().toUTCString();
  let html = `<!DOCTYPE html>
<html>
<head><title>Sports Headlines</title></head>
<body>
<h1>Sports Headlines</h1>
<p>Last updated: ${timestamp}</p>
`;

  for (const { sport, league, label } of sources) {
    try {
      const articles = await fetchNews(sport, league);
      html += `<h2>${label}</h2>\n`;
      for (const a of articles) {
        html += `<p>${a.headline}</p>\n`;
        if (a.description) html += `<p>${a.description}</p>\n`;
      }
    } catch (err) {
      html += `<h2>${label}</h2>\n<p>Unable to fetch</p>\n`;
      console.error(err.message);
    }
  }

  html += `</body>\n</html>`;

  const outPath = path.join(__dirname, '..', 'docs', 'sports-headlines.html');
  fs.writeFileSync(outPath, html);
  console.log('Written:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
