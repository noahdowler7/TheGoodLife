/**
 * refetch-bible-clean.cjs
 *
 * Re-fetches all 66 books of the Bible from bible-api.com (WEB translation)
 * to get clean verse text without inline footnotes.
 *
 * Usage: node scripts/refetch-bible-clean.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BIBLE_DIR = path.join(__dirname, '..', 'public', 'bible');
const INDEX_PATH = path.join(BIBLE_DIR, 'index.json');
const DELAY_MS = 1200; // ~0.8 requests per second (safe for bible-api.com)
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000; // base retry delay, doubles each attempt

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TheGoodLife-Bible-Fetcher/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildApiUrl(bookName, chapter) {
  // bible-api.com uses + for spaces, lowercase
  const encoded = bookName.toLowerCase().replace(/\s+/g, '+');
  return `https://bible-api.com/${encoded}+${chapter}?translation=web`;
}

function cleanText(text) {
  // Trim trailing newlines/whitespace that the API includes
  return text.replace(/\n+$/, '').trim();
}

async function fetchChapterWithRetry(bookName, chapter, retries = 0) {
  const url = buildApiUrl(bookName, chapter);
  try {
    const data = await fetch(url);
    if (!data.verses || !Array.isArray(data.verses)) {
      throw new Error(`No verses array in response for ${bookName} ${chapter}`);
    }
    return data.verses.map(v => ({
      verse: v.verse,
      text: cleanText(v.text)
    }));
  } catch (err) {
    if (retries < MAX_RETRIES) {
      const backoff = RETRY_DELAY_MS * Math.pow(2, retries);
      console.log(`  Retry ${retries + 1}/${MAX_RETRIES} for ${bookName} ${chapter}: ${err.message} (waiting ${backoff/1000}s)`);
      await sleep(backoff);
      return fetchChapterWithRetry(bookName, chapter, retries + 1);
    }
    throw err;
  }
}

async function fetchBook(book) {
  const { id, name, chapters: chapterCount } = book;
  const bookData = {
    book: name,
    abbreviation: id,
    chapters: {}
  };

  for (let ch = 1; ch <= chapterCount; ch++) {
    const verses = await fetchChapterWithRetry(name, ch);
    bookData.chapters[String(ch)] = verses;

    // Rate limit
    await sleep(DELAY_MS);

    // Progress every 10 chapters or at the end
    if (ch % 10 === 0 || ch === chapterCount) {
      process.stdout.write(`\r  ${name}: ${ch}/${chapterCount} chapters`);
    }
  }

  console.log(`\r  ${name}: ${chapterCount}/${chapterCount} chapters - DONE`);

  // Write immediately after each book
  const outPath = path.join(BIBLE_DIR, `${id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(bookData), 'utf-8');

  return bookData;
}

async function main() {
  console.log('=== Bible Data Re-fetch (Clean WEB Text) ===\n');

  // Read index
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  console.log(`Found ${index.length} books in index.json`);

  const totalChapters = index.reduce((sum, b) => sum + b.chapters, 0);
  console.log(`Total chapters to fetch: ${totalChapters}`);
  console.log(`Estimated time: ~${Math.ceil(totalChapters * DELAY_MS / 60000)} minutes\n`);

  const startTime = Date.now();
  let booksCompleted = 0;

  for (const book of index) {
    booksCompleted++;
    console.log(`[${booksCompleted}/${index.length}] Fetching ${book.name} (${book.chapters} chapters)...`);
    try {
      await fetchBook(book);
    } catch (err) {
      console.error(`\nFATAL ERROR on ${book.name}: ${err.message}`);
      console.error('Stopping. Books fetched so far have been saved.');
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== Complete! ${index.length} books fetched in ${elapsed} minutes ===`);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
