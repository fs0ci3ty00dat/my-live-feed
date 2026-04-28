const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GUARDIAN_API_KEY;
const BASE_URL = 'https://content.guardianapis.com/search';

const sections = [
  { id: 'world',       label: 'World' },
  { id: 'politics',    label: 'Politics' },
  { id: 'business',    label: 'Economics & Business' },
  { id: 'technology',  label: 'Technology' },
  { id: 'environment', label: 'Environment' },
];

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

async function fetchSection(sectionId) {
  const url = `${BASE_URL}?section=${sectionId}&page-size=5&order-by=newest&show-fields=trailText,standfirst&api-key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Guardian API error ${res.status} for section ${sectionId}`);
  const data = await res.json();
  return data.response.results;
}

async function main() {
  const timestamp = new Date().toUTCString();
  let html = `<!DOCTYPE html>
<html>
<head><title>Global News</title></head>
<body>
<h1>Global News</h1>
<p>Last updated: ${timestamp}</p>
`;

  for (const section of sections) {
    try {
      const articles = await fetchSection(section.id);
      html += `<h2>${section.label}</h2>\n`;
      for (const article of articles) {
        html += `<p>${article.webTitle}</p>\n`;
        const summary = article.fields?.trailText || article.fields?.standfirst || '';
        if (summary) {
          html += `<p>${stripHtml(summary)}</p>\n`;
        }
      }
    } catch (err) {
      html += `<h2>${section.label}</h2>\n<p>Unable to fetch</p>\n`;
      console.error(err.message);
    }
  }

  html += `</body>\n</html>`;

  const outPath = path.join(__dirname, '..', 'docs', 'news-global.html');
  fs.writeFileSync(outPath, html);
  console.log('Written:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
