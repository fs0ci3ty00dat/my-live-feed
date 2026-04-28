const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const leagues = [
  { sport: 'soccer',     league: 'eng.1',         label: 'Premier League' },
  { sport: 'soccer',     league: 'uefa.champions', label: 'Champions League' },
  { sport: 'basketball', league: 'nba',            label: 'NBA' },
  { sport: 'football',   league: 'nfl',            label: 'NFL' },
  { sport: 'hockey',     league: 'nhl',            label: 'NHL' },
  { sport: 'baseball',   league: 'mlb',            label: 'MLB' },
  { sport: 'tennis',     league: 'atp',            label: 'Tennis — ATP' },
  { sport: 'tennis',     league: 'wta',            label: 'Tennis — WTA' },
];

async function fetchEvents(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN error ${res.status} for ${league}`);
  const data = await res.json();
  return data.events || [];
}

function formatEvent(event) {
  const comp = event.competitions[0];
  const status = comp.status.type.shortDetail;
  const competitors = comp.competitors;

  const home = competitors.find(c => c.homeAway === 'home');
  const away = competitors.find(c => c.homeAway === 'away');
  if (!home || !away) return null;

  const homeName = home.team.shortDisplayName || home.team.displayName;
  const awayName = away.team.shortDisplayName || away.team.displayName;

  const hasScore = home.score !== undefined && home.score !== '' && away.score !== '';
  if (hasScore) {
    return `${awayName} ${away.score} - ${home.score} ${homeName} (${status})`;
  }
  return `${awayName} vs ${homeName} — ${status}`;
}

async function main() {
  const timestamp = new Date().toUTCString();
  let html = `<!DOCTYPE html>
<html>
<head><title>Sports Scores</title></head>
<body>
<h1>Sports Scores</h1>
<p>Last updated: ${timestamp}</p>
`;

  for (const { sport, league, label } of leagues) {
    html += `<h2>${label}</h2>\n`;
    try {
      const events = await fetchEvents(sport, league);
      if (events.length === 0) {
        html += `<p>No games scheduled today</p>\n`;
      } else {
        for (const event of events) {
          const line = formatEvent(event);
          if (line) html += `<p>${line}</p>\n`;
        }
      }
    } catch (err) {
      html += `<p>Unable to fetch</p>\n`;
      console.error(err.message);
    }
  }

  html += `</body>\n</html>`;

  const outPath = path.join(__dirname, '..', 'docs', 'sports-scores.html');
  fs.writeFileSync(outPath, html);
  console.log('Written:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
