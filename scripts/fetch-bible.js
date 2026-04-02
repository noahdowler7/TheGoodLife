#!/usr/bin/env node
/**
 * Fetch World English Bible (WEB) text from wldeh/bible-api GitHub repo
 * and convert to our app's JSON format.
 *
 * Output:
 *   public/bible/index.json   – metadata for all 66 books
 *   public/bible/<abbr>.json  – per-book chapter/verse data
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE =
  "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-web/books";

// ── Book definitions (canonical 66) ──────────────────────────────────
const BOOKS = [
  // OT
  { id: "gen", name: "Genesis",         testament: "OT", folder: "genesis",         chapters: 50 },
  { id: "exo", name: "Exodus",          testament: "OT", folder: "exodus",          chapters: 40 },
  { id: "lev", name: "Leviticus",       testament: "OT", folder: "leviticus",       chapters: 27 },
  { id: "num", name: "Numbers",         testament: "OT", folder: "numbers",         chapters: 36 },
  { id: "deu", name: "Deuteronomy",     testament: "OT", folder: "deuteronomy",     chapters: 34 },
  { id: "jos", name: "Joshua",          testament: "OT", folder: "joshua",          chapters: 24 },
  { id: "jdg", name: "Judges",          testament: "OT", folder: "judges",          chapters: 21 },
  { id: "rut", name: "Ruth",            testament: "OT", folder: "ruth",            chapters: 4  },
  { id: "1sa", name: "1 Samuel",        testament: "OT", folder: "1samuel",         chapters: 31 },
  { id: "2sa", name: "2 Samuel",        testament: "OT", folder: "2samuel",         chapters: 24 },
  { id: "1ki", name: "1 Kings",         testament: "OT", folder: "1kings",          chapters: 22 },
  { id: "2ki", name: "2 Kings",         testament: "OT", folder: "2kings",          chapters: 25 },
  { id: "1ch", name: "1 Chronicles",    testament: "OT", folder: "1chronicles",     chapters: 29 },
  { id: "2ch", name: "2 Chronicles",    testament: "OT", folder: "2chronicles",     chapters: 36 },
  { id: "ezr", name: "Ezra",            testament: "OT", folder: "ezra",            chapters: 10 },
  { id: "neh", name: "Nehemiah",        testament: "OT", folder: "nehemiah",        chapters: 13 },
  { id: "est", name: "Esther",          testament: "OT", folder: "esther",          chapters: 10 },
  { id: "job", name: "Job",             testament: "OT", folder: "job",             chapters: 42 },
  { id: "psa", name: "Psalms",          testament: "OT", folder: "psalms",          chapters: 150 },
  { id: "pro", name: "Proverbs",        testament: "OT", folder: "proverbs",        chapters: 31 },
  { id: "ecc", name: "Ecclesiastes",    testament: "OT", folder: "ecclesiastes",    chapters: 12 },
  { id: "sng", name: "Song of Solomon", testament: "OT", folder: "songofsolomon",   chapters: 8  },
  { id: "isa", name: "Isaiah",          testament: "OT", folder: "isaiah",          chapters: 66 },
  { id: "jer", name: "Jeremiah",        testament: "OT", folder: "jeremiah",        chapters: 52 },
  { id: "lam", name: "Lamentations",    testament: "OT", folder: "lamentations",    chapters: 5  },
  { id: "ezk", name: "Ezekiel",         testament: "OT", folder: "ezekiel",         chapters: 48 },
  { id: "dan", name: "Daniel",          testament: "OT", folder: "daniel",          chapters: 12 },
  { id: "hos", name: "Hosea",           testament: "OT", folder: "hosea",           chapters: 14 },
  { id: "jol", name: "Joel",            testament: "OT", folder: "joel",            chapters: 3  },
  { id: "amo", name: "Amos",            testament: "OT", folder: "amos",            chapters: 9  },
  { id: "oba", name: "Obadiah",         testament: "OT", folder: "obadiah",         chapters: 1  },
  { id: "jon", name: "Jonah",           testament: "OT", folder: "jonah",           chapters: 4  },
  { id: "mic", name: "Micah",           testament: "OT", folder: "micah",           chapters: 7  },
  { id: "nah", name: "Nahum",           testament: "OT", folder: "nahum",           chapters: 3  },
  { id: "hab", name: "Habakkuk",        testament: "OT", folder: "habakkuk",        chapters: 3  },
  { id: "zep", name: "Zephaniah",       testament: "OT", folder: "zephaniah",       chapters: 3  },
  { id: "hag", name: "Haggai",          testament: "OT", folder: "haggai",          chapters: 2  },
  { id: "zec", name: "Zechariah",       testament: "OT", folder: "zechariah",       chapters: 14 },
  { id: "mal", name: "Malachi",         testament: "OT", folder: "malachi",         chapters: 4  },
  // NT
  { id: "mat", name: "Matthew",         testament: "NT", folder: "matthew",         chapters: 28 },
  { id: "mrk", name: "Mark",            testament: "NT", folder: "mark",            chapters: 16 },
  { id: "luk", name: "Luke",            testament: "NT", folder: "luke",            chapters: 24 },
  { id: "jhn", name: "John",            testament: "NT", folder: "john",            chapters: 21 },
  { id: "act", name: "Acts",            testament: "NT", folder: "acts",            chapters: 28 },
  { id: "rom", name: "Romans",          testament: "NT", folder: "romans",          chapters: 16 },
  { id: "1co", name: "1 Corinthians",   testament: "NT", folder: "1corinthians",    chapters: 16 },
  { id: "2co", name: "2 Corinthians",   testament: "NT", folder: "2corinthians",    chapters: 13 },
  { id: "gal", name: "Galatians",       testament: "NT", folder: "galatians",       chapters: 6  },
  { id: "eph", name: "Ephesians",       testament: "NT", folder: "ephesians",       chapters: 6  },
  { id: "php", name: "Philippians",     testament: "NT", folder: "philippians",     chapters: 4  },
  { id: "col", name: "Colossians",      testament: "NT", folder: "colossians",      chapters: 4  },
  { id: "1th", name: "1 Thessalonians", testament: "NT", folder: "1thessalonians",  chapters: 5  },
  { id: "2th", name: "2 Thessalonians", testament: "NT", folder: "2thessalonians",  chapters: 3  },
  { id: "1ti", name: "1 Timothy",       testament: "NT", folder: "1timothy",        chapters: 6  },
  { id: "2ti", name: "2 Timothy",       testament: "NT", folder: "2timothy",        chapters: 4  },
  { id: "tit", name: "Titus",           testament: "NT", folder: "titus",           chapters: 3  },
  { id: "phm", name: "Philemon",        testament: "NT", folder: "philemon",        chapters: 1  },
  { id: "heb", name: "Hebrews",         testament: "NT", folder: "hebrews",         chapters: 13 },
  { id: "jas", name: "James",           testament: "NT", folder: "james",           chapters: 5  },
  { id: "1pe", name: "1 Peter",         testament: "NT", folder: "1peter",          chapters: 5  },
  { id: "2pe", name: "2 Peter",         testament: "NT", folder: "2peter",          chapters: 3  },
  { id: "1jn", name: "1 John",          testament: "NT", folder: "1john",           chapters: 5  },
  { id: "2jn", name: "2 John",          testament: "NT", folder: "2john",           chapters: 1  },
  { id: "3jn", name: "3 John",          testament: "NT", folder: "3john",           chapters: 1  },
  { id: "jud", name: "Jude",            testament: "NT", folder: "jude",            chapters: 1  },
  { id: "rev", name: "Revelation",      testament: "NT", folder: "revelation",      chapters: 22 },
];

// ── Helpers ───────────────────────────────────────────────────────────

const ROOT = join(import.meta.dirname, "..", "public", "bible");

/**
 * Strip inline footnote markers.
 * Footnotes appear as: word<ch>:<vs> <footnote text ending with . or )>
 * e.g. "God1:1 The Hebrew word rendered "God" is "..." (Elohim)."
 *      "angel1:1 or, messenger (here and wherever angel is mentioned)"
 */
function cleanText(raw) {
  let text = raw.replace(/\d+:\d+\s[^]*?(?:\)|\.|\.)(?=\s|$)/g, "");
  return text.replace(/\s{2,}/g, " ").trim();
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Limit concurrency to avoid hammering the server
async function pAll(fns, concurrency = 10) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < fns.length) {
      const idx = i++;
      results[idx] = await fns[idx]();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => next()));
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(ROOT)) mkdirSync(ROOT, { recursive: true });

  const total = BOOKS.reduce((s, b) => s + b.chapters, 0);
  let done = 0;
  const errors = [];

  // Build per-chapter fetch tasks
  const tasks = [];
  for (const book of BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      tasks.push({ book, ch });
    }
  }

  // Accumulate chapter data per book
  const bookData = {};
  for (const b of BOOKS) {
    bookData[b.id] = { book: b.name, abbreviation: b.id, chapters: {} };
  }

  await pAll(
    tasks.map(({ book, ch }) => async () => {
      const url = `${BASE}/${book.folder}/chapters/${ch}.json`;
      try {
        const json = await fetchJSON(url);
        const verses = json.data.map((v) => ({
          verse: parseInt(v.verse, 10),
          text: cleanText(v.text),
        }));
        bookData[book.id].chapters[String(ch)] = verses;
      } catch (err) {
        errors.push(`${book.name} ch${ch}: ${err.message}`);
      }
      done++;
      if (done % 50 === 0 || done === total)
        process.stdout.write(`\r  fetched ${done}/${total} chapters...`);
    }),
    15 // concurrency
  );
  console.log();

  // Write book files
  for (const b of BOOKS) {
    const path = join(ROOT, `${b.id}.json`);
    writeFileSync(path, JSON.stringify(bookData[b.id], null, 2));
  }
  console.log(`  wrote ${BOOKS.length} book files`);

  // Write index.json
  const index = BOOKS.map(({ id, name, testament, chapters }) => ({
    id,
    name,
    testament,
    chapters,
  }));
  writeFileSync(join(ROOT, "index.json"), JSON.stringify(index, null, 2));
  console.log("  wrote index.json");

  if (errors.length) {
    console.warn(`\n  ${errors.length} errors:`);
    errors.forEach((e) => console.warn("    -", e));
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
