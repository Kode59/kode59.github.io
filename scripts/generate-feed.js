/**
 * Genererer RSS 2.0-feed fra data/arrangementer.json.
 * Kjør: node scripts/generate-feed.js
 * Output: feed.xml
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kode59.no';
const DATA_PATH = path.join(__dirname, '..', 'data', 'arrangementer.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'feed.xml');

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822Date(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toUTCString().replace('GMT', '+0000');
}

const raw = fs.readFileSync(DATA_PATH, 'utf8');
const arrangementer = JSON.parse(raw);

const items = arrangementer.filter(x => !!x.link1).slice(0, 10).map((a) => {
  const title = escapeXml(a.tittel || 'Arrangement');
  const link = a.link1 || BASE_URL;
  const desc = escapeXml(a.description || a.tittel || '');
  const location = a.location ? escapeXml(`Sted: ${a.location}. `) : '';
  const guid = `${BASE_URL}#${a.date}-${(a.tittel || '').replace(/\s+/g, '-')}`;

  return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <description>${location}${desc}</description>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
    </item>`;
}).join('\n');

const buildDate = toRfc822Date(new Date().toISOString());

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kode59 – Arrangementer</title>
    <link>${BASE_URL}</link>
    <description>RSS-feed for arrangementer hos Kode59, Haugesund.</description>
    <language>nb</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(OUTPUT_PATH, rss, 'utf8');
console.log('RSS-feed skrevet til feed.xml');
