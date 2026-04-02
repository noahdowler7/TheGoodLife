#!/usr/bin/env node
/**
 * fetch-murray.cjs
 *
 * Fetches Andrew Murray's "Abide in Christ" (public domain, 1895)
 * from the Open Christian Library GitHub repository and transforms it
 * into a structured JSON file for the TheGoodLife React app.
 *
 * Source: https://github.com/openchristianlibrary/Abide_In_Christ_Murray_A
 * (DjVu OCR text of the 1895 Philadelphia edition by Henry Altemus)
 *
 * Output: public/devotionals/murray-abide-in-christ.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://raw.githubusercontent.com/openchristianlibrary/Abide_In_Christ_Murray_A/master/text/abideinchrist01murr_djvu.txt';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'devotionals');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'murray-abide-in-christ.json');

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

// Day number words (OCR sometimes garbles these, so we match flexibly)
const DAY_PATTERNS = [
  { day: 1,  pattern: /^FIRST\s+DAY[.,]/m },
  { day: 2,  pattern: /^SECOND\s+DAY[.,]/m },
  { day: 3,  pattern: /^THIRD\s+DAY[.,]/m },
  { day: 4,  pattern: /^FOU[A-Z]*\s+DAY[.,]/m },    // FOURTH or FOUETH (OCR)
  { day: 5,  pattern: /^FIFTH\s+DAY[.,]/m },
  { day: 6,  pattern: /^SIXTH\s+DAY[.,]/m },
  { day: 7,  pattern: /^SEVENTH\s+DAY[.,]/m },
  { day: 8,  pattern: /^EIGHTH\s+DAY[.,]/m },
  { day: 9,  pattern: /^NINTH\s+DAY[.,]/m },
  { day: 10, pattern: /^TENTH\s+DAY[.,]/m },
  { day: 11, pattern: /^ELEVENTH\s+DAY[.,]/m },
  { day: 12, pattern: /^TWELFTH\s+DAY[.,]/m },
  { day: 13, pattern: /^THIRTEENTH\s+DAY[.,]/m },
  { day: 14, pattern: /^FOURTEENTH\s+DAY[.,]/m },
  { day: 15, pattern: /^FIFTEENTH\s+DAY[.,]/m },
  { day: 16, pattern: /^SIXTEENTH\s+DAY[.,]/m },
  { day: 17, pattern: /^SEVENTEENTH\s+DAY[.,]/m },
  { day: 18, pattern: /^EIGHTEENTH\s+DAY[.,]/m },
  { day: 19, pattern: /^NINETEENTH\s+DAY[.,]/m },
  { day: 20, pattern: /^TWENTIETH\s+DAY[.,]/m },
  { day: 21, pattern: /^TWENTY-FIRST\s+DAY[.,]/m },
  { day: 22, pattern: /^TWENTY-SECOND\s+DAY[.,]/m },
  { day: 23, pattern: /^TWENTY-THIRD\s+DAY[.,]/m },
  { day: 24, pattern: /^TWENTY-FOURTH\s+DAY[.,]/m },
  { day: 25, pattern: /^TWENTY-FIFTH\s+DAY[.,]/m },
  { day: 26, pattern: /^TWENTY-SIXTH\s+DAY[.,]/m },
  { day: 27, pattern: /^TWENTY-SEVENTH\s+DAY[.,]/m },
  { day: 28, pattern: /^TWENTY-EIGHTH\s+DAY[.,]/m },
  { day: 29, pattern: /^TWENTY-NINTH\s+DAY[.,]/m },
  { day: 30, pattern: /^THIRTIETH\s+DAY[.,]/m },
  { day: 31, pattern: /^THIRTY-FIRST\s+DAY[.,]/m },
];

// Canonical titles for each day (from the Table of Contents)
const DAY_TITLES = [
  "All You Who Have Come to Him",
  "And You Shall Find Rest to Your Souls",
  "Trusting Him to Keep You",
  "As the Branch in the Vine",
  "As You Came to Him, by Faith",
  "God Himself Has United You to Him",
  "As Your Wisdom",
  "As Your Righteousness",
  "As Your Sanctification",
  "As Your Redemption",
  "The Crucified One",
  "God Himself Will Establish You in Him",
  "Every Moment",
  "Day by Day",
  "At This Moment",
  "Forsaking All for Him",
  "Through the Holy Spirit",
  "In Stillness of Soul",
  "In Affliction and Trial",
  "That You May Bear Much Fruit",
  "So You Will Have Power in Prayer",
  "And in His Love",
  "As Christ in the Father",
  "Obeying His Commandments",
  "That Your Joy May Be Full",
  "And in Love to the Brethren",
  "That You May Not Sin",
  "As Your Strength",
  "And Not in Self",
  "As the Surety of the Covenant",
  "The Glorified One",
];

// Canonical verses for each day (from the original text)
const DAY_VERSES = [
  '"Come unto me." \u2014 Matthew 11:28\n"Abide in me." \u2014 John 15:4',
  '"Come unto me, and I will give you rest. Take my yoke upon you, and learn of me; and ye shall find rest to your souls." \u2014 Matthew 11:28-29',
  '"I follow after, if that I may apprehend that for which also I am apprehended of Christ Jesus." \u2014 Philippians 3:12',
  '"I am the Vine, ye are the branches." \u2014 John 15:5',
  '"As ye have therefore received Christ Jesus the Lord, so walk ye in Him: rooted and built up in Him, and stablished in the faith." \u2014 Colossians 2:6-7',
  '"Of God are ye in Christ Jesus." \u2014 1 Corinthians 1:30\n"He that stablisheth us in Christ is God." \u2014 2 Corinthians 1:21',
  '"Of God are ye in Christ Jesus, who of God is made unto us wisdom." \u2014 1 Corinthians 1:30',
  '"Of God are ye in Christ Jesus, who of God is made unto us righteousness." \u2014 1 Corinthians 1:30',
  '"Of God are ye in Christ Jesus, who of God is made unto us sanctification." \u2014 1 Corinthians 1:30',
  '"Of God are ye in Christ Jesus, who of God is made unto us redemption." \u2014 1 Corinthians 1:30',
  '"I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me." \u2014 Galatians 2:20',
  '"Now He which stablisheth us with you in Christ, and hath anointed us, is God." \u2014 2 Corinthians 1:21',
  '"In that day ye shall know that I am in My Father, and ye in Me, and I in you." \u2014 John 14:20',
  '"The Lord will command His lovingkindness in the daytime." \u2014 Psalm 42:8',
  '"Today, if ye will hear His voice, harden not your hearts." \u2014 Hebrews 4:7',
  '"Forsaking all that he hath." \u2014 Luke 14:33\n"Ye are not your own." \u2014 1 Corinthians 6:19',
  '"We through the Spirit." \u2014 Galatians 5:5\n"In the Spirit." \u2014 Revelation 1:10',
  '"In returning and rest shall ye be saved; in quietness and in confidence shall be your strength." \u2014 Isaiah 30:15',
  '"In the world ye shall have tribulation: but be of good cheer; I have overcome the world." \u2014 John 16:33',
  '"Herein is my Father glorified, that ye bear much fruit." \u2014 John 15:8',
  '"If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be done unto you." \u2014 John 15:7',
  '"As the Father hath loved me, so have I loved you: continue ye in my love." \u2014 John 15:9',
  '"As the Father hath loved me, so I have loved you. Abide in my love, even as I abide in my Father\u2019s love." \u2014 John 15:9-10',
  '"If ye keep my commandments, ye shall abide in my love; even as I have kept my Father\u2019s commandments, and abide in His love." \u2014 John 15:10',
  '"These things have I spoken unto you, that my joy might remain in you, and that your joy might be full." \u2014 John 15:11',
  '"This is my commandment, That ye love one another, as I have loved you." \u2014 John 15:12',
  '"He that abideth in Him sinneth not." \u2014 1 John 3:6',
  '"I can do all things through Christ which strengtheneth me." \u2014 Philippians 4:13',
  '"Not I, but Christ liveth in me." \u2014 Galatians 2:20',
  '"Now the God of peace, that brought again from the dead our Lord Jesus, that great Shepherd of the sheep, through the blood of the everlasting covenant, make you perfect in every good work to do His will." \u2014 Hebrews 13:20-21',
  '"Father, I will that they also, whom Thou hast given me, be with me where I am; that they may behold my glory." \u2014 John 17:24',
];

/**
 * Clean up OCR artifacts and normalize text
 */
function cleanText(text) {
  return text
    // Remove page numbers (standalone numbers on their own line, or "NUMBER TITLE")
    .replace(/^\d{1,3}\s*$/gm, '')
    // Remove page headers like "ABIDE IN CHRIST:" or "ALL YE WHO HAVE COME TO HIM. 13"
    .replace(/^\d{1,3}\s+ABIDE IN CHRIST.*$/gm, '')
    .replace(/^ABIDE IN CHRIST[:\s]*\d*\s*$/gm, '')
    // Remove running headers that are chapter subtitles with page numbers
    .replace(/^[A-Z][A-Z\s,.'\u2014\u2019]+\d+\s*$/gm, '')
    // Fix common OCR artifacts
    .replace(/\byon\b/g, 'you')
    .replace(/\bAvho\b/g, 'who')
    .replace(/\bOh,\s*thej\b/g, 'Oh, they')
    .replace(/\bm\s+CHKIST\b/gi, 'IN CHRIST')
    .replace(/\bm\s+CHRIST\b/gi, 'IN CHRIST')
    .replace(/\bOHEIST\b/gi, 'CHRIST')
    .replace(/\b([Ii])t\s*is\b/g, '$1t is')
    // Fix smart quotes and dashes
    .replace(/'/g, '\u2019')
    .replace(/`/g, '\u2018')
    // Normalize whitespace: collapse 3+ blank lines to 2
    .replace(/\n{4,}/g, '\n\n\n')
    // Remove leading/trailing whitespace per line but keep paragraph breaks
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Re-join lines that are part of the same paragraph (line doesn't start a new paragraph)
    // A new paragraph starts after a blank line
    .replace(/\n\n+/g, '\n\n')
    .trim();
}

/**
 * Join single-line-broken paragraphs into flowing text.
 * Paragraphs are separated by blank lines.
 */
function joinParagraphs(text) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map(p => {
      // Join lines within a paragraph, handling hyphenated line breaks
      return p
        .replace(/(\w)-\s*\n\s*/g, '$1')  // re-join hyphenated words
        .replace(/\n/g, ' ')              // join lines
        .replace(/\s+/g, ' ')             // normalize spaces
        .trim();
    })
    .filter(p => p.length > 0)
    .join('\n\n');
}

/**
 * Remove the "ABIDE IN CHRIST" header and subtitle that appears at the start of each chapter
 */
function removeChapterHeaders(text) {
  // Remove "ABIDE IN CHRIST" standalone lines
  let cleaned = text.replace(/^ABIDE\s+I[NM]\s+CHRIST\s*$/gm, '');
  // Remove the subtitle line (ALL CAPS line that is the day's theme)
  // These are lines that are entirely uppercase
  cleaned = cleaned.replace(/^[A-Z][A-Z\s,;:.'"\u2014\u2019\u201C\u201D()*!?]+$/gm, (match) => {
    // Keep it only if it's very short (might be part of text), remove if it's a header
    if (match.length > 10) return '';
    return match;
  });
  return cleaned.replace(/^\s+/, '').replace(/\n{3,}/g, '\n\n');
}

/**
 * Extract the verse/scripture reference from the beginning of a chapter's text
 */
function extractAndRemoveVerse(text) {
  // The verse typically appears in quotes near the start, before the main body
  // Try to find and remove it since we have canonical verses
  // The verse lines often contain em-dash and book references
  const lines = text.split('\n');
  let verseEnd = 0;

  // Skip past any verse/reference lines at the start
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i].trim();
    if (!line) {
      if (verseEnd > 0) break; // blank line after verse content = end
      continue;
    }
    // Check if this looks like a verse line (contains Bible references or is a quote)
    if (/^['"\u2018\u2019\u201C\u201D]/.test(line) ||
        /\u2014\s*[A-Z]/.test(line) ||
        /^\*/.test(line) ||
        /^—/.test(line) ||
        /^\d+\.\s/.test(line) && /[A-Z][a-z]+ \d/.test(line)) {
      verseEnd = i + 1;
    } else if (verseEnd === 0) {
      // Haven't found verse yet, might still be before it
      continue;
    } else {
      break;
    }
  }

  // Return text after the verse section
  if (verseEnd > 0) {
    return lines.slice(verseEnd).join('\n').replace(/^\s+/, '');
  }
  return text;
}

async function main() {
  console.log('Fetching Andrew Murray "Abide in Christ" devotional data...');
  console.log(`Source: ${SOURCE_URL}`);

  const raw = await fetch(SOURCE_URL);
  console.log(`Downloaded ${(raw.length / 1024).toFixed(1)} KB`);

  // Find positions of all 31 days
  const dayPositions = [];
  for (const { day, pattern } of DAY_PATTERNS) {
    const match = raw.match(pattern);
    if (match) {
      dayPositions.push({
        day,
        index: match.index,
      });
    } else {
      console.warn(`  WARNING: Could not find Day ${day} marker in text`);
    }
  }

  // Sort by position in text
  dayPositions.sort((a, b) => a.index - b.index);

  console.log(`Found ${dayPositions.length} day markers`);

  // Extract text for each day
  const devotionals = [];

  for (let i = 0; i < dayPositions.length; i++) {
    const { day } = dayPositions[i];
    const startPos = dayPositions[i].index;
    const endPos = i + 1 < dayPositions.length
      ? dayPositions[i + 1].index
      : raw.length;

    let rawSection = raw.substring(startPos, endPos);

    // Remove the "TWENTY-THIRD DAY." header line itself
    rawSection = rawSection.replace(/^[A-Z\-]+\s+DAY[.,]\s*\n+/, '');

    // Clean OCR artifacts
    let cleaned = cleanText(rawSection);

    // Remove chapter headers (ABIDE IN CHRIST, subtitle)
    cleaned = removeChapterHeaders(cleaned);

    // Remove the verse/scripture quote at the beginning (we use canonical ones)
    cleaned = extractAndRemoveVerse(cleaned);

    // Join paragraphs
    let text = joinParagraphs(cleaned);

    // Post-processing: remove leftover OCR decorations at the very start
    // Remove leading lines that look like verse references (contain book abbreviations + chapter:verse)
    // e.g., "who is our life...— COL. iii. 3, 4." or "of salvation.'—2 Cor. vi. 2."
    // Pattern: short text ending with a Bible reference, followed by blank line
    let lines2 = text.split('\n\n');
    while (lines2.length > 1) {
      const first = lines2[0].trim();
      // Check if first paragraph looks like a leftover verse ref (short + contains book ref pattern)
      const isVerseRef = first.length < 200 && (
        /\u2014\s*[A-Z0-9]/.test(first) ||          // em-dash + book name
        /[A-Z][a-z]+\.\s+[ivxlc]+\.\s*\d/.test(first) || // "Cor. vi. 2" style
        /[A-Z][a-z]+\s+\d+[:.]\s*\d/.test(first) || // "John 15:4" style
        /^[a-z].*['\u2019]\s*$/.test(first) ||       // starts lowercase, ends with quote
        /^\*/.test(first)                              // starts with asterisk
      );
      if (isVerseRef) {
        lines2.shift();
      } else {
        break;
      }
    }
    text = lines2.join('\n\n');

    // Fix all ^ OCR artifacts (decorative drop caps from the scan)
    // Pattern: ^X^ or ^" or 'Y^ etc - these are garbled decorative initials
    text = text.replace(/['\u2018\u2019]?\^?"?[A-Za-z]\^?\s*/g, (match, offset) => {
      // Only fix if it contains a caret
      if (!match.includes('^')) return match;
      return '';
    });
    // Fix common OCR word artifacts
    text = text.replace(/\bMOEE\b/g, 'MORE');
    text = text.replace(/\bID EST\b/g, 'REST');
    text = text.replace(/\bTHEEE\b/g, 'THERE');
    text = text.replace(/\bHEEE\b/g, 'HERE');
    text = text.replace(/\bHEKE\b/g, 'HERE');
    text = text.replace(/\bonr\b/g, 'our');
    text = text.replace(/\boi\b/g, 'of');
    text = text.replace(/\bmanJ-\s*ifested\b/g, 'manifested');
    text = text.replace(/\bJ-\s*([a-z])/g, '$1');   // OCR line-break artifact
    text = text.replace(/\bexJ-\s*/g, 'ex');
    text = text.replace(/-L\s+/g, '');                // OCR artifact "-L to them"
    text = text.replace(/-Li\s+/g, '');               // OCR artifact "-Li loved"
    text = text.replace(/\bfonnd\b/g, 'found');
    text = text.replace(/\bIke\b/g, 'Like');
    text = text.replace(/\bpAUL\b/g, 'PAUL');
    text = text.replace(/\byonr\b/g, 'your');
    text = text.replace(/\bbnfc\b/g, 'but');
    text = text.replace(/\bbnt\b/g, 'but');
    text = text.replace(/\bsymboof\b/g, 'symbol of');
    text = text.replace(/\bHE das\b/, 'THE day\u2019s');
    text = text.replace(/\bIKE AS\b/, 'LIKE AS');
    text = text.replace(/\bE know\//g, 'YE know,');
    // Remove "11. " at start of Day 25 (leftover verse number)
    text = text.replace(/^11\.\s+/, '');
    // Remove leftover verse refs at start like "Matt, xxviii. 18.* ..."
    text = text.replace(/^Matt,?\s+xxviii.*?weakness.*?\n\n/s, '');
    // Clean "' T AM" -> "'I AM"
    text = text.replace(/['\u2018]\s*T\s+AM\b/g, '\u2018I AM');
    // Clean leftover '^' chars
    text = text.replace(/\^/g, '');
    // Clean "' \"PAUL" -> "PAUL"
    text = text.replace(/^'\s*"?(?=PAUL)/gm, '');
    // Clean leftover '*' used for footnotes
    text = text.replace(/\*\s*/g, '');
    // Fix Day 6: starts with lowercase "were" - should be "YE were" (OCR lost "YE")
    if (text.startsWith('were still feeble')) {
      text = 'YE ' + text;
    }
    // Fix Day 9: starts with "' \"PAUL" pattern (U+2019 quote)
    text = text.replace(/^['\u2018\u2019]\s*"/, '');
    // Fix Day 11: "' T AM" at start (right single quote U+2019)
    text = text.replace(/^['\u2018\u2019]\s+T\s+AM\b/, '\u2018I AM');
    // Fix "TIIEEE" -> "THERE"
    text = text.replace(/\bTIIEEE\b/g, 'THERE');
    // Fix "HEKE" -> "HERE"
    text = text.replace(/\bHEKE\b/g, 'HERE');
    // Remove short leading lines that are verse references (contain book + chapter patterns)
    text = text.replace(/^(Matt|Eph|Heb|Hei|Col|Cor|Gal|Rom|Phil|John|Gen|Isa|Psa|Jer)\.\s+[ivxlc]+\.\s*\d+.*?\n\n/si, '');
    text = text.replace(/^[ivxlc]+\.\s*\d+.*?\n\n/si, '');
    // Remove "XV. 7." style verse refs at start
    text = text.replace(/^[IVXLC]+\.\s*\d+\.?\s*/m, '');
    // Clean up any remaining leading whitespace
    text = text.trim();

    const title = `Day ${day} \u2014 ${DAY_TITLES[day - 1]}`;
    const verse = DAY_VERSES[day - 1];

    devotionals.push({
      day,
      title,
      verse,
      text,
    });
  }

  // Sort by day number
  devotionals.sort((a, b) => a.day - b.day);

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
    if (!d.text || d.text.length < 500) {
      console.warn(`  Short/missing text: Day ${d.day} (${(d.text || '').length} chars)`);
      issues++;
    }
    if (!d.verse) {
      console.warn(`  Missing verse: Day ${d.day}`);
      issues++;
    }
    if (!d.title) {
      console.warn(`  Missing title: Day ${d.day}`);
      issues++;
    }
  }

  if (issues === 0) {
    console.log('Validation: All 31 entries have substantial text, verse, and title.');
  } else {
    console.log(`Validation: ${issues} issue(s) found (see warnings above).`);
  }

  // Show text length stats
  const lengths = devotionals.map(d => d.text.length);
  console.log(`\nText lengths: min=${Math.min(...lengths)}, max=${Math.max(...lengths)}, avg=${Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length)}`);

  // Show sample
  console.log('\n--- Sample Entry (Day 1) ---');
  const sample = devotionals[0];
  console.log(`Title: ${sample.title}`);
  console.log(`Verse: ${sample.verse.substring(0, 100)}...`);
  console.log(`Text (first 300 chars): ${sample.text.substring(0, 300)}...`);
  console.log(`Text length: ${sample.text.length} chars`);

  console.log('\n--- Sample Entry (Day 31) ---');
  const last = devotionals[30];
  console.log(`Title: ${last.title}`);
  console.log(`Verse: ${last.verse.substring(0, 100)}...`);
  console.log(`Text (first 300 chars): ${last.text.substring(0, 300)}...`);
  console.log(`Text length: ${last.text.length} chars`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
