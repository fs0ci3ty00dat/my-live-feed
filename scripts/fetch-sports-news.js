const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function main() {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/news?limit=12';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN news error ${res.status}`);
  const data = await res.json();
  const articles = data.articles || [];

  const timestamp = new Date().toUTCString();
  let html = `<!DOCTYPE html>
<html>
<head><title>Sports Headlines</title></head>
<body>
<h1>Sports Headlines</h1>
<p>Last updated: ${timestamp}</p>
`;

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const sport = a.categories?.find(c => c.type === 'league')?.description
               || a.categories?.[0]?.description
               || '';
    const tag = sport ? ` [${sport}]` : '';
    html += `<p>${i + 1}. ${a.headline}${tag}</p>\n`;
    if (a.description) {
      html += `<p>${a.description}</p>\n`;
    }
  }

  html += `</body>\n</html>`;

  const outPath = path.join(__dirname, '..', 'docs', 'sports-headlines.html');
  fs.writeFileSync(outPath, html);
  console.log('Written:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
