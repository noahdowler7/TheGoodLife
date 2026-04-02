#!/usr/bin/env node
/**
 * fetch-spurgeon.js
 *
 * Fetches Charles Spurgeon's "Morning and Evening" devotional (public domain, 1866)
 * from a freely available GitHub source and transforms it into a structured JSON file
 * for the TheGoodLife React app.
 *
 * Source: https://github.com/russianryebread/morning-and-evening
 * (HTML originally from spurgeon.org, converted to JSON)
 *
 * Output: public/devotionals/spurgeon-morning-evening.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://raw.githubusercontent.com/russianryebread/morning-and-evening/master/m_e.json';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'devotionals');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'spurgeon-morning-evening.json');

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Days per month (non-leap year; Feb 29 handled if present)
const DAYS_PER_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Clean up HTML entities and tags from text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    // Common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&nbsp;/g, ' ')
    // Strip remaining HTML tags
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract verse reference from keyverse field.
 * The keyverse typically contains the verse text followed by a reference.
 * e.g., '"They did eat of the fruit of the land of Canaan that year." — Joshua 5:12'
 */
function parseKeyverse(keyverse) {
  if (!keyverse) return { verse: '', reference: '' };
  const cleaned = cleanText(keyverse);
  return cleaned;
}

async function main() {
  console.log('Fetching Spurgeon Morning and Evening devotional data...');
  console.log(`Source: ${SOURCE_URL}`);

  const raw = await fetch(SOURCE_URL);
  console.log(`Downloaded ${(raw.length / 1024).toFixed(1)} KB`);

  const rawEntries = JSON.parse(raw);
  // Filter out null entries (some exist in source data)
  const entries = rawEntries.filter(e => e != null && e.month != null);
  console.log(`Parsed ${rawEntries.length} raw entries (${entries.length} valid)`);

  // Group entries by date (month-day)
  const byDate = {};
  for (const entry of entries) {
    const key = `${entry.month}-${entry.day}`;
    if (!byDate[key]) {
      byDate[key] = { month: entry.month, day: entry.day };
    }
    const period = entry.time === 'am' ? 'morning' : 'evening';
    const rawBody = cleanText(entry.body || '');
    // Strip the repeated header lines like "January 1st — Morning Reading\n  verse\n"
    // The body starts with "Month Dayth — Morning/Evening Reading\n  keyverse\n\n  actual text"
    const bodyText = rawBody
      .replace(/^.*(?:Morning|Evening)\s+Reading\s*\n/i, '')  // Remove "Month Nth — M/E Reading"
      .replace(/^[\s]*"[^"]*"[^"\n]*\n*/m, '')                // Remove quoted verse line
      .replace(/^[\s]*\u201C[^\u201D]*\u201D[^\n]*\n*/m, '')  // Remove smart-quoted verse line
      .replace(/^\s*\u2014\s*[A-Z][^\n]*\n*/m, '')            // Remove "— Book Ch:V" line
      .trim();

    byDate[key][period] = {
      verse: cleanText(entry.keyverse || ''),
      text: bodyText || cleanText(entry.body || '').trim()
    };
  }

  // Build ordered array for all 365 days
  const devotionals = [];
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = DAYS_PER_MONTH[month];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${month}-${day}`;
      const data = byDate[key];
      const monthName = MONTH_NAMES[month];
      const dateStr = `${monthName} ${day}`;

      if (!data) {
        console.warn(`  WARNING: Missing data for ${dateStr}`);
        continue;
      }

      const morning = data.morning || { verse: '', text: '' };
      const evening = data.evening || { verse: '', text: '' };

      devotionals.push({
        date: dateStr,
        month: month,
        day: day,
        morning: {
          title: `Morning, ${dateStr}`,
          verse: morning.verse,
          text: morning.text
        },
        evening: {
          title: `Evening, ${dateStr}`,
          verse: evening.verse,
          text: evening.text
        }
      });
    }
  }

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(devotionals, null, 2), 'utf-8');

  const fileSizeMB = (fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(`\nOutput: ${OUTPUT_FILE}`);
  console.log(`Entries: ${devotionals.length} days`);
  console.log(`File size: ${fileSizeMB} MB`);

  // Validation
  let issues = 0;
  for (const d of devotionals) {
    if (!d.morning.text || d.morning.text.length < 50) {
      console.warn(`  Short/missing morning text: ${d.date} (${(d.morning.text || '').length} chars)`);
      issues++;
    }
    if (!d.evening.text || d.evening.text.length < 50) {
      console.warn(`  Short/missing evening text: ${d.date} (${(d.evening.text || '').length} chars)`);
      issues++;
    }
    if (!d.morning.verse) {
      console.warn(`  Missing morning verse: ${d.date}`);
      issues++;
    }
    if (!d.evening.verse) {
      console.warn(`  Missing evening verse: ${d.date}`);
      issues++;
    }
  }

  if (issues === 0) {
    console.log('Validation: All entries have substantial text and verse references.');
  } else {
    console.log(`Validation: ${issues} issue(s) found (see warnings above).`);
  }

  // Show sample
  console.log('\n--- Sample Entry (January 1) ---');
  const sample = devotionals[0];
  console.log(`Date: ${sample.date}`);
  console.log(`Morning title: ${sample.morning.title}`);
  console.log(`Morning verse: ${sample.morning.verse.substring(0, 80)}...`);
  console.log(`Morning text: ${sample.morning.text.substring(0, 150)}...`);
  console.log(`Evening title: ${sample.evening.title}`);
  console.log(`Evening verse: ${sample.evening.verse.substring(0, 80)}...`);
  console.log(`Evening text: ${sample.evening.text.substring(0, 150)}...`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
