// Daily scriptures for the devotional section
// Curated for encouragement, peace, and daily strength

const SCRIPTURES = [
  {
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    verse: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28"
  },
  {
    verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3"
  },
  {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6"
  },
  {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11"
  },
  {
    verse: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?",
    reference: "Psalm 27:1"
  },
  {
    verse: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13"
  },
  {
    verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6"
  },
  {
    verse: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    reference: "Philippians 4:7"
  },
  {
    verse: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    reference: "Psalm 34:18"
  },
  {
    verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    reference: "Isaiah 40:31"
  },
  {
    verse: "Be still, and know that I am God.",
    reference: "Psalm 46:10"
  },
  {
    verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
    reference: "Zephaniah 3:17"
  },
  {
    verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    verse: "God is our refuge and strength, an ever-present help in trouble.",
    reference: "Psalm 46:1"
  },
  {
    verse: "When I am afraid, I put my trust in you.",
    reference: "Psalm 56:3"
  },
  {
    verse: "The Lord is my strength and my shield; my heart trusts in him, and he helps me.",
    reference: "Psalm 28:7"
  },
  {
    verse: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.",
    reference: "Isaiah 41:10"
  },
  {
    verse: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29"
  },
  {
    verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    reference: "John 14:27"
  },
  {
    verse: "This is the day that the Lord has made; let us rejoice and be glad in it.",
    reference: "Psalm 118:24"
  },
  {
    verse: "Great is his faithfulness; his mercies begin afresh each morning.",
    reference: "Lamentations 3:23"
  },
  {
    verse: "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety.",
    reference: "Psalm 4:8"
  },
  {
    verse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25"
  },
  {
    verse: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
    reference: "Ephesians 4:32"
  },
  {
    verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    reference: "1 Corinthians 13:4"
  },
  {
    verse: "Above all, love each other deeply, because love covers over a multitude of sins.",
    reference: "1 Peter 4:8"
  },
  {
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25"
  },
  {
    verse: "Children are a heritage from the Lord, offspring a reward from him.",
    reference: "Psalm 127:3"
  },
  {
    verse: "Start children off on the way they should go, and even when they are old they will not turn from it.",
    reference: "Proverbs 22:6"
  },
  {
    verse: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
    reference: "Galatians 6:9"
  },
  {
    verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    reference: "Colossians 3:23"
  },
  {
    verse: "Commit to the Lord whatever you do, and he will establish your plans.",
    reference: "Proverbs 16:3"
  },
  {
    verse: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    reference: "1 Thessalonians 5:18"
  },
  {
    verse: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights.",
    reference: "James 1:17"
  },
  {
    verse: "Delight yourself in the Lord, and he will give you the desires of your heart.",
    reference: "Psalm 37:4"
  },
  {
    verse: "The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    reference: "Galatians 5:22-23"
  },
  {
    verse: "May the God of hope fill you with all joy and peace as you trust in him.",
    reference: "Romans 15:13"
  },
  {
    verse: "Rejoice always, pray continually, give thanks in all circumstances.",
    reference: "1 Thessalonians 5:16-18"
  }
]

/**
 * Get the scripture for a specific date.
 * Uses a deterministic algorithm so the same date always returns the same scripture.
 */
export function getDailyScripture(date = new Date()) {
  // Create a date-based index using year and day of year
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)

  // Use modulo to cycle through scriptures
  const index = dayOfYear % SCRIPTURES.length

  return SCRIPTURES[index]
}

export default SCRIPTURES
