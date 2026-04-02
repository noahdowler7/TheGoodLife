// Rich devotional content system for The Good Life
// Provides exposition, cross-references, application, and daily reading plans
// organized by Five Capitals

// Exposition templates per capital — rotate daily
export const EXPOSITIONS = {
  spiritual: [
    "This verse invites you into the foundational truth of the Christian life: God is with you. Not in theory — right now, in this moment, in whatever you're facing. Spiritual capital is built when you choose to believe that truth even when you can't feel it. Today, let this word sink past your head and into your heart.",
    "The spiritual life isn't about perfection — it's about proximity. How close are you to the Father today? This verse points you back to the one relationship that sustains every other. Before you do anything else, pause and acknowledge that God is already present with you.",
    "Scripture isn't just information — it's formation. When you read God's Word, you're not just learning facts about God; you're being shaped by his Spirit. Let today's verse do its slow, deep work in you. Don't rush past it. Sit with it. Let it interrogate your assumptions and comfort your fears.",
    "Prayer is the oxygen of the spiritual life. Without it, everything else suffocates. This verse is an invitation to breathe — to open your mouth and your heart to God without pretense. You don't need eloquent words. You need honest ones.",
    "Worship isn't just singing — it's surrender. It's the daily decision to say 'You are God and I am not.' This verse calls you to reorient your heart toward the One who made you, knows you, and loves you anyway. That's the foundation everything else is built on.",
    "The Holy Spirit is not a concept — he's a person, and he's with you. This verse reminds you that you're not navigating today alone. The same Spirit who raised Christ from the dead is available to guide, comfort, and empower you in the mundane and the monumental.",
    "Spiritual growth happens in the hidden places — in the quiet morning, in the prayer no one sees, in the obedience that costs you something. This verse points to the invisible economy of the Kingdom: what's done in secret has eternal weight.",
    "Rest is not the opposite of faithfulness — it's an expression of it. To rest in God is to declare that the world doesn't depend on your striving. This verse invites you to stop performing and start receiving what God freely offers.",
    "Confession isn't weakness — it's the door to freedom. When you bring your failures into the light, shame loses its power. This verse reminds you that God already knows, and his response is mercy, not rejection.",
    "Fasting creates space. It's not about earning something from God — it's about clearing the noise so you can hear him more clearly. This verse connects your physical discipline to spiritual receptivity. What might God say if you made room to listen?",
    "The Bible calls itself a lamp, not a floodlight. It gives you enough light for the next step, not the whole journey. This verse is today's light. Trust it. Walk by it. Tomorrow will have its own.",
    "Identity in Christ changes everything. You are not what you've done or what's been done to you. You are who God says you are. This verse anchors your identity in something unshakeable — not your performance, but his promise.",
    "God's faithfulness is not dependent on your consistency. His mercies are new every morning — not because you earned them yesterday, but because that's who he is. Let this truth disarm your guilt and fuel your gratitude.",
  ],
  relational: [
    "Relationships are the currency of the Kingdom. Jesus didn't build programs — he built a community of twelve. This verse calls you to invest in the people God has placed around you. Not perfectly, but intentionally. Who needs you to show up today?",
    "Forgiveness is not a feeling — it's a decision that sets you free. When you withhold forgiveness, you carry a weight God never meant for you. This verse points to the radical generosity of Christ's forgiveness, and invites you to extend the same.",
    "Encouragement is underrated. A single word of truth spoken at the right time can change someone's entire day — or life. This verse reminds you that your words carry power. Use them to build, not to tear down.",
    "Community isn't optional — it's how God designed us to grow. You can't become who God created you to be in isolation. This verse points to the beauty and necessity of walking with others, even when it's messy and uncomfortable.",
    "Conflict isn't the enemy of relationship — avoidance is. Healthy relationships require honest conversations. This verse gives you the courage to speak truth with love, knowing that wounds from a friend can be trusted.",
    "Service is the posture of the Kingdom. Jesus came not to be served, but to serve. This verse invites you to look for someone whose burden you can carry today — not out of obligation, but out of love.",
    "Family is the first community God created. Whether your family is biological, spiritual, or chosen — investing there matters more than you think. This verse calls you to prioritize the people under your own roof before you try to change the world.",
    "Listening is a spiritual discipline. Most people don't need you to fix them — they need you to hear them. This verse reminds you that being slow to speak and quick to listen is one of the most loving things you can do.",
    "Reconciliation is the heartbeat of the gospel. If God reconciled the world to himself through Christ, how can we refuse to reconcile with each other? This verse challenges you to take the first step, even when it's not your turn.",
    "Love is not a feeling you fall into — it's a commitment you walk out. This verse defines love not by emotion but by action: patience, kindness, humility, endurance. That kind of love is only possible through the Spirit.",
    "Accountability isn't control — it's care. When someone loves you enough to ask hard questions, that's a gift. This verse reminds you that sharpening happens through friction, and the result is something useful for God's purposes.",
  ],
  physical: [
    "Your body is not an inconvenience to your spiritual life — it's the vehicle for it. God chose to give you a physical form, and caring for it is an act of worship. This verse reframes health not as vanity but as stewardship of what God entrusted to you.",
    "Rest is resistance. In a culture that glorifies hustle, choosing to rest is a radical act of trust in God's provision. This verse reminds you that even God rested — not because he was tired, but because rest is good. Give yourself permission to stop.",
    "Discipline is not punishment — it's the path to freedom. When you train your body, you're building capacity for everything God has called you to. This verse connects physical discipline to spiritual fruitfulness.",
    "Food is a gift, not an idol. God created taste buds and feasts and the joy of eating together. This verse invites you to receive food with gratitude and steward it with wisdom — neither obsessing over it nor ignoring its importance.",
    "Nature reveals God. When was the last time you stopped to notice? The sky, the trees, the rhythm of the seasons — they all declare his glory. This verse invites you outside, away from screens, into the cathedral God built with his own hands.",
    "Sleep is not laziness — it's surrender. Every night, you close your eyes and trust that the world will keep turning without you. This verse connects rest to faith: the ability to let go and let God be God while you are still.",
    "Your physical health affects every other capital. When you're exhausted, your prayer life suffers. When you're not eating well, your relationships get strained. This verse reminds you that caring for your body isn't selfish — it enables everything else.",
    "Movement is medicine. A walk, a stretch, a breath of fresh air — these aren't luxuries, they're necessities. This verse points to the good design of your body and invites you to honor it with motion, not just stillness.",
  ],
  intellectual: [
    "Your mind matters to God. He created you to think, reason, create, and learn. This verse invites you to steward your intellect as an act of worship — not to accumulate knowledge for its own sake, but to grow in understanding that serves God's purposes.",
    "Wisdom is not the same as information. You can know a lot and still be foolish. This verse points to the beginning of real wisdom: reverence for God. When you start there, everything else arranges itself properly.",
    "Transformation starts in the mind. The patterns of this world press in constantly — through media, culture, and habit. This verse is a daily reminder that renewal is possible, and it begins with what you allow into your thought life.",
    "Planning is an act of stewardship, not control. When you think ahead and organize your resources, you're honoring what God has given you. But this verse adds the crucial ingredient: hold your plans loosely, because God's direction always outranks your strategy.",
    "Reading is an investment that compounds. Every book, every article, every conversation with someone wiser than you — it adds up. This verse celebrates the pursuit of knowledge as something valuable and pleasing to God.",
    "Creativity is the image of God in action. When you make something — a meal, a solution, a piece of art, a plan — you reflect the Creator. This verse affirms that your creative impulse is God-given and worth stewarding.",
    "Discernment is wisdom applied. It's the ability to see beneath the surface and make decisions aligned with truth. This verse trains you to think before you act, to weigh options carefully, and to seek God's counsel in the details.",
    "Curiosity is a spiritual virtue. God designed a universe so complex that we'll never stop discovering. This verse invites you to approach today with wonder — to ask questions, explore ideas, and grow in the understanding that leads to life.",
  ],
  financial: [
    "Generosity is not a financial strategy — it's a spiritual posture. When you give, you declare that God is your provider and money is a tool, not a treasure. This verse invites you to loosen your grip and discover the joy of open-handed living.",
    "Contentment is the antidote to the anxiety of never enough. This verse reframes your financial life around what you have, not what you lack. When gratitude replaces comparison, peace follows.",
    "Tithing isn't about a percentage — it's about priority. The firstfruits principle says: give God the first and best, not the leftovers. This verse connects your financial obedience to God's abundant provision.",
    "Debt is a form of bondage. This verse speaks honestly about the weight of financial obligation and points toward freedom. Not all debt is wrong, but living beyond your means slowly erodes your capacity to be generous and free.",
    "Stewardship means management, not ownership. Everything you have — every dollar, every asset, every opportunity — belongs to God. You're the manager. This verse calls you to manage faithfully, knowing that faithfulness in small things leads to greater trust.",
    "Money reveals your heart. Where you spend shows what you value. This verse is a mirror — not to condemn, but to align. Does your spending reflect your stated priorities? If not, today is a good day to start adjusting.",
    "Saving is an act of wisdom, not hoarding. Preparing for the future honors God and protects your family. This verse celebrates the prudent person who thinks ahead, while trusting God for what they cannot foresee.",
    "The wealth of the Kingdom is measured differently. Impact, legacy, relationships, character — these are the dividends of a life well-invested. This verse challenges the world's scorecard and offers a better one.",
  ],
}

// Cross-references organized by capital — 2-3 related verses per theme
export const CROSS_REFERENCES = {
  spiritual: [
    [{ ref: "Psalm 119:105", text: "Your word is a lamp for my feet" }, { ref: "John 1:1", text: "In the beginning was the Word" }],
    [{ ref: "Romans 8:28", text: "All things work together for good" }, { ref: "Psalm 37:5", text: "Commit your way to the Lord" }],
    [{ ref: "Hebrews 11:1", text: "Faith is the substance of things hoped for" }, { ref: "2 Corinthians 5:7", text: "We walk by faith, not by sight" }],
    [{ ref: "James 4:8", text: "Draw near to God" }, { ref: "Psalm 73:28", text: "It is good to be near God" }],
    [{ ref: "Matthew 7:7", text: "Ask and it will be given to you" }, { ref: "Jeremiah 33:3", text: "Call to me and I will answer you" }],
    [{ ref: "Psalm 63:1", text: "You, God, are my God, earnestly I seek you" }, { ref: "Isaiah 55:6", text: "Seek the Lord while he may be found" }],
    [{ ref: "Psalm 16:11", text: "In your presence there is fullness of joy" }, { ref: "Nehemiah 8:10", text: "The joy of the Lord is your strength" }],
  ],
  relational: [
    [{ ref: "John 15:12", text: "Love each other as I have loved you" }, { ref: "Romans 13:8", text: "Owe no one anything, except to love" }],
    [{ ref: "Matthew 18:21-22", text: "Forgive seventy times seven" }, { ref: "Ephesians 4:32", text: "Forgive as Christ forgave you" }],
    [{ ref: "Hebrews 10:25", text: "Do not give up meeting together" }, { ref: "Acts 2:42", text: "They devoted themselves to fellowship" }],
    [{ ref: "Galatians 6:2", text: "Carry each other's burdens" }, { ref: "Romans 15:1", text: "Bear with the failings of the weak" }],
    [{ ref: "Proverbs 27:17", text: "As iron sharpens iron" }, { ref: "Ecclesiastes 4:9", text: "Two are better than one" }],
  ],
  physical: [
    [{ ref: "Romans 12:1", text: "Offer your bodies as a living sacrifice" }, { ref: "1 Corinthians 6:20", text: "Honor God with your bodies" }],
    [{ ref: "Genesis 2:2", text: "God rested on the seventh day" }, { ref: "Mark 6:31", text: "Come and rest awhile" }],
    [{ ref: "Hebrews 12:1", text: "Run with perseverance the race" }, { ref: "1 Corinthians 9:24", text: "Run to get the prize" }],
    [{ ref: "Psalm 19:1", text: "The heavens declare the glory of God" }, { ref: "Romans 1:20", text: "God's qualities seen in what has been made" }],
  ],
  intellectual: [
    [{ ref: "Proverbs 4:7", text: "Wisdom is the principal thing" }, { ref: "Proverbs 2:6", text: "The Lord gives wisdom" }],
    [{ ref: "Colossians 3:23", text: "Work heartily, as for the Lord" }, { ref: "Ecclesiastes 9:10", text: "Whatever your hand finds to do" }],
    [{ ref: "James 1:5", text: "Ask God for wisdom" }, { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart" }],
    [{ ref: "2 Timothy 2:15", text: "Study to show yourself approved" }, { ref: "Psalm 119:130", text: "The unfolding of your words gives light" }],
  ],
  financial: [
    [{ ref: "Malachi 3:10", text: "Bring the whole tithe" }, { ref: "Proverbs 3:9", text: "Honor the Lord with your wealth" }],
    [{ ref: "Matthew 6:19-20", text: "Store up treasures in heaven" }, { ref: "Luke 12:15", text: "Life does not consist in possessions" }],
    [{ ref: "Philippians 4:19", text: "God will meet all your needs" }, { ref: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing" }],
    [{ ref: "2 Corinthians 9:7", text: "God loves a cheerful giver" }, { ref: "Acts 20:35", text: "More blessed to give than to receive" }],
  ],
}

// Daily Bible reading plan — 52 weeks of readings, one per day
// Organized to move through key books, matching capital themes
export const DAILY_READINGS = {
  spiritual: [
    "Psalm 1", "Psalm 23", "Psalm 27", "Psalm 34", "Psalm 46", "Psalm 51", "Psalm 63",
    "Psalm 91", "Psalm 103", "Psalm 119:1-32", "Psalm 119:33-64", "Psalm 119:65-96",
    "Psalm 139", "Psalm 145", "John 1", "John 3", "John 4", "John 6", "John 10",
    "John 14", "John 15", "John 17", "Romans 5", "Romans 6", "Romans 8",
    "Ephesians 1", "Ephesians 2", "Ephesians 3", "Philippians 1", "Philippians 2",
    "Philippians 3", "Philippians 4", "Colossians 1", "Colossians 3",
    "Hebrews 11", "Hebrews 12", "Revelation 21",
  ],
  relational: [
    "1 Corinthians 13", "Ruth 1", "Ruth 2", "1 Samuel 18", "1 Samuel 20",
    "John 13", "John 15:1-17", "Acts 2:42-47", "Romans 12",
    "Ephesians 4", "Ephesians 5:21-33", "Colossians 3:12-17",
    "1 Thessalonians 5:12-28", "Philemon 1", "1 John 3", "1 John 4",
  ],
  physical: [
    "Genesis 1", "Genesis 2:1-15", "Psalm 8", "Psalm 19",
    "Psalm 104", "Ecclesiastes 3:1-15", "Isaiah 40:28-31",
    "Matthew 6:25-34", "Mark 6:30-46", "1 Corinthians 6:12-20",
    "1 Corinthians 9:24-27", "1 Timothy 4:6-16",
  ],
  intellectual: [
    "Proverbs 1", "Proverbs 2", "Proverbs 3", "Proverbs 4",
    "Proverbs 8", "Proverbs 9", "Proverbs 16", "Proverbs 24",
    "Ecclesiastes 1", "Ecclesiastes 3", "Daniel 1",
    "James 1", "James 3",
  ],
  financial: [
    "Deuteronomy 8", "Proverbs 11:24-31", "Proverbs 13",
    "Proverbs 21:1-21", "Proverbs 22:1-16", "Malachi 3",
    "Matthew 6:19-34", "Matthew 25:14-30", "Luke 12:13-34",
    "Luke 16:1-15", "2 Corinthians 8", "2 Corinthians 9",
    "1 Timothy 6:6-19",
  ],
}

// Five Capitals discipleship teachings
export const DISCIPLESHIP_TEACHINGS = [
  {
    capital: "spiritual",
    title: "Spiritual Capital: The Foundation",
    teaching: "Spiritual capital is your relationship with God — the wellspring from which all other growth flows. In the Five Capitals framework, it sits at the top because everything else finds its proper place when your relationship with God is healthy. This doesn't mean spiritual perfection. It means spiritual priority: seeking God first, listening before acting, and building your life on the rock of his Word rather than the shifting sand of circumstances.",
    practice: "Start each day with 5 minutes of silence before God. No agenda, no requests — just presence. Over time, increase to 10, then 15 minutes.",
    keyVerse: "Seek first his kingdom and his righteousness, and all these things will be given to you. — Matthew 6:33",
  },
  {
    capital: "relational",
    title: "Relational Capital: The Multiplier",
    teaching: "Relational capital is the quality of your connections with others. Jesus modeled this by investing deeply in twelve disciples, even more closely in three (Peter, James, John), and most intimately in one (John, the beloved). Your relationships are not interruptions to your calling — they are your calling. The Great Commandment has two parts: love God, love people. You can't skip the second one.",
    practice: "This week, identify one relationship that needs investment. Schedule a conversation — not to fix anything, just to be present and listen.",
    keyVerse: "A new command I give you: Love one another. As I have loved you, so you must love one another. — John 13:34",
  },
  {
    capital: "physical",
    title: "Physical Capital: The Vehicle",
    teaching: "Physical capital is your body — the temple of the Holy Spirit. In our culture, we tend toward two extremes: idolizing the body (fitness culture) or ignoring it (spiritual escapism). The Five Capitals framework holds a middle way: your body is a gift to steward, not an obstacle to overcome. How you sleep, eat, move, and rest directly impacts your capacity for every other capital.",
    practice: "Choose one physical rhythm to establish this week: a daily walk, a consistent bedtime, or one meal eaten slowly and gratefully.",
    keyVerse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you? — 1 Corinthians 6:19",
  },
  {
    capital: "intellectual",
    title: "Intellectual Capital: The Catalyst",
    teaching: "Intellectual capital is your mind, creativity, and capacity for growth. God gave you a brain to steward — to think deeply, learn continuously, plan wisely, and create beauty. Romans 12:2 says transformation happens through the renewing of the mind. What you read, watch, listen to, and dwell on shapes who you become. Invest in your mind and you expand your capacity to serve God's kingdom.",
    practice: "Replace 15 minutes of scrolling with 15 minutes of reading — Scripture, a good book, or a thoughtful article. Do this every day this week.",
    keyVerse: "Be transformed by the renewing of your mind. — Romans 12:2",
  },
  {
    capital: "financial",
    title: "Financial Capital: The Tool",
    teaching: "Financial capital sits at the bottom of the Five Capitals pyramid — not because money doesn't matter, but because it's meant to serve the capitals above it. Money is a powerful tool and a terrible master. When you steward your finances with wisdom and generosity, you create margin for what matters most: spiritual depth, relational investment, physical health, and intellectual growth. The key shift: from 'How much can I keep?' to 'How much can I give?'",
    practice: "Review your spending from this past week. Does it reflect your stated priorities? Identify one adjustment that would better align your money with your values.",
    keyVerse: "For where your treasure is, there your heart will be also. — Matthew 6:21",
  },
]

/**
 * Get today's exposition based on the scripture's capital.
 */
export function getDailyExposition(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return function getForCapital(capital) {
    const pool = EXPOSITIONS[capital] || EXPOSITIONS.spiritual
    return pool[dayOfYear % pool.length]
  }
}

/**
 * Get cross-references for today based on capital.
 */
export function getDailyCrossRefs(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return function getForCapital(capital) {
    const pool = CROSS_REFERENCES[capital] || CROSS_REFERENCES.spiritual
    return pool[dayOfYear % pool.length]
  }
}

/**
 * Get today's suggested Bible reading based on capital.
 */
export function getDailyReading(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return function getForCapital(capital) {
    const pool = DAILY_READINGS[capital] || DAILY_READINGS.spiritual
    return pool[dayOfYear % pool.length]
  }
}
