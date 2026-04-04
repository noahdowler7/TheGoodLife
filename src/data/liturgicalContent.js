// Liturgical Content for The Good Life
// Curated scriptures, expositions, cross-references, readings, and reflection prompts
// for special days in the Christian calendar

import { getLiturgicalDay } from '../utils/liturgicalCalendar'

export const LITURGICAL_CONTENT = {
  // === HOLY WEEK & EASTER ===

  'palm-sunday': {
    scripture: {
      verse: "The crowds that went ahead of him and those that followed shouted, 'Hosanna to the Son of David! Blessed is he who comes in the name of the Lord! Hosanna in the highest heaven!'",
      reference: 'Matthew 21:9',
      capital: 'spiritual',
    },
    exposition: "Palm Sunday opens Holy Week — the most sacred week in the Christian calendar. Jesus enters Jerusalem not on a war horse, but on a donkey. The crowds cry 'Hosanna,' which means 'Save us!' They expected a political king. He came as a suffering servant. This week, let yourself walk slowly through the story. Don't skip ahead to Easter. Stay in the tension, the heartbreak, and the silence. That's where the deepest growth happens.",
    crossRefs: [
      { ref: 'Zechariah 9:9', text: 'See, your king comes to you, righteous and victorious, lowly and riding on a donkey' },
      { ref: 'Psalm 118:26', text: 'Blessed is he who comes in the name of the Lord' },
      { ref: 'John 12:13', text: 'They took palm branches and went out to meet him' },
    ],
    reading: 'Matthew 21:1-11',
    prompt: 'What does it mean to welcome Jesus as King — not just of the world, but of your life today?',
  },

  'holy-week': {
    scripture: {
      verse: "Very truly I tell you, unless a kernel of wheat falls to the ground and dies, it remains only a single seed. But if it dies, it produces many seeds.",
      reference: 'John 12:24',
      capital: 'spiritual',
    },
    exposition: "Holy Week draws us into the final days of Jesus' earthly ministry. These are days of teaching, confrontation, intimacy, and ultimately betrayal. Jesus knew what was coming, and he walked toward it. This is the heart of the gospel: life comes through death, victory through surrender, glory through the cross. Let this week slow you down. Read the gospels. Sit with the weight of what Jesus did for you.",
    crossRefs: [
      { ref: 'Isaiah 53:3', text: 'He was despised and rejected by mankind, a man of suffering' },
      { ref: 'Mark 14:36', text: 'Abba, Father, everything is possible for you. Take this cup from me' },
    ],
    reading: 'Mark 14:1-26',
    prompt: 'What is God asking you to surrender this week? What needs to die so something new can grow?',
  },

  'maundy-thursday': {
    scripture: {
      verse: "A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another.",
      reference: 'John 13:34-35',
      capital: 'relational',
    },
    exposition: "On the night before his death, Jesus didn't give a lecture. He gave a demonstration. He wrapped a towel around his waist and washed his disciples' feet — including the feet of Judas, who would betray him hours later. Then he gave them bread and wine and said, 'Remember me.' The Last Supper is not just a ritual. It's a portrait of what love looks like: sacrificial, humble, given freely to the undeserving. That includes you.",
    crossRefs: [
      { ref: 'John 13:14-15', text: 'I have set you an example that you should do as I have done for you' },
      { ref: 'Luke 22:19', text: 'This is my body given for you; do this in remembrance of me' },
      { ref: '1 Corinthians 11:26', text: 'Whenever you eat this bread and drink this cup, you proclaim the Lord\'s death' },
    ],
    reading: 'John 13:1-17',
    prompt: 'Who in your life needs you to serve them with humility this week — not because they deserve it, but because Jesus did the same for you?',
  },

  'good-friday': {
    scripture: {
      verse: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.",
      reference: 'Isaiah 53:5',
      capital: 'spiritual',
    },
    exposition: "Good Friday is the darkest day in the Christian story — and the most beautiful. The sinless Son of God hung on a Roman cross, bearing the weight of every sin, every failure, every broken thing in human history. He didn't just die for 'the world' in the abstract. He died for you. Your shame, your secrets, your worst moments — he carried all of it. Today, don't rush to Sunday. Sit at the foot of the cross. Let the magnitude of this love break you open and put you back together.",
    crossRefs: [
      { ref: 'John 19:30', text: 'It is finished' },
      { ref: 'Romans 5:8', text: 'While we were still sinners, Christ died for us' },
      { ref: '2 Corinthians 5:21', text: 'God made him who had no sin to be sin for us' },
    ],
    reading: 'Isaiah 52:13-53:12',
    prompt: 'What does "It is finished" mean for the things you\'re still trying to earn, prove, or carry on your own?',
  },

  'holy-saturday': {
    scripture: {
      verse: "We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life.",
      reference: 'Romans 6:4',
      capital: 'spiritual',
    },
    exposition: "Holy Saturday is the day of waiting. Jesus is in the tomb. The disciples are scattered, grieving, confused. They don't know Sunday is coming. There are seasons in your own life that feel like Holy Saturday — when God seems silent, when the promise hasn't come, when all you can do is wait. This day teaches us that God works in the silence. Between the crucifixion and the resurrection, something was happening beneath the surface. Trust the in-between.",
    crossRefs: [
      { ref: '1 Peter 3:18-19', text: 'He was put to death in the body but made alive in the Spirit, in which he also went and made proclamation' },
      { ref: 'Psalm 130:5-6', text: 'I wait for the Lord, my whole being waits, and in his word I put my hope' },
    ],
    reading: '1 Peter 3:18-22',
    prompt: 'Where in your life are you in a season of waiting? How can you trust God in the silence between the promise and the fulfillment?',
  },

  'easter-sunday': {
    scripture: {
      verse: "He is not here; he has risen, just as he said. Come and see the place where he lay.",
      reference: 'Matthew 28:6',
      capital: 'spiritual',
    },
    exposition: "He is risen! This is the truth that changes everything. Death could not hold him. The grave could not contain him. Every promise God ever made is validated by the empty tomb. If Jesus rose from the dead, then forgiveness is real, hope is justified, and death is not the end. This isn't just ancient history — it's the foundation of your life today. Whatever you're facing, the resurrection says: God has the final word, and that word is life.",
    crossRefs: [
      { ref: '1 Corinthians 15:55-57', text: 'Where, O death, is your victory? Where, O death, is your sting?' },
      { ref: 'Romans 8:11', text: 'The Spirit of him who raised Jesus from the dead is living in you' },
      { ref: 'John 11:25-26', text: 'I am the resurrection and the life. The one who believes in me will live' },
    ],
    reading: 'Matthew 28:1-10',
    prompt: 'He is risen! What area of your life needs the power of resurrection today — what feels dead that God wants to bring back to life?',
  },

  // === EASTER SEASON ===

  'easter-generic': {
    scripture: {
      verse: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.",
      reference: 'Galatians 2:20',
      capital: 'spiritual',
    },
    exposition: "The Easter season stretches for fifty days — not because the resurrection needs that long to sink in, but because we do. The risen Christ appeared to his followers repeatedly, eating with them, teaching them, commissioning them. He wanted them to be absolutely certain: death is defeated, and new life is here. During this season, let the reality of the resurrection reshape how you see everything — your failures, your fears, your future.",
    crossRefs: [
      { ref: 'Colossians 3:1', text: 'Since you have been raised with Christ, set your hearts on things above' },
      { ref: '2 Corinthians 5:17', text: 'If anyone is in Christ, the new creation has come' },
    ],
    reading: 'Acts 2:22-36',
    prompt: 'How does the reality of the resurrection change how you approach today?',
  },

  // === ASCENSION & PENTECOST ===

  'ascension-day': {
    scripture: {
      verse: "After he said this, he was taken up before their very eyes, and a cloud hid him from their sight.",
      reference: 'Acts 1:9',
      capital: 'spiritual',
    },
    exposition: "The Ascension marks the moment Jesus physically left earth to reign at the right hand of the Father. But he didn't leave us alone. His parting words were a commission and a promise: 'You will receive power when the Holy Spirit comes on you, and you will be my witnesses.' The Ascension means Jesus is Lord over all things right now — not just in heaven, but over your Monday, your workplace, your struggles. And you are his ambassador.",
    crossRefs: [
      { ref: 'Acts 1:8', text: 'You will receive power when the Holy Spirit comes on you' },
      { ref: 'Ephesians 1:20-21', text: 'He seated him at his right hand in the heavenly realms, far above all rule and authority' },
    ],
    reading: 'Acts 1:1-11',
    prompt: 'If Jesus is reigning right now, what does that change about how you face today\'s challenges?',
  },

  'pentecost': {
    scripture: {
      verse: "All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.",
      reference: 'Acts 2:4',
      capital: 'spiritual',
    },
    exposition: "Pentecost is the birthday of the Church. The Holy Spirit descended on the gathered believers with wind and fire, and everything changed. Ordinary fishermen became bold preachers. Fear became courage. Confusion became clarity. The same Spirit lives in you today. Not as a theological concept — as a person. He guides, convicts, comforts, and empowers. You are not left to figure this out on your own.",
    crossRefs: [
      { ref: 'John 14:26', text: 'The Advocate, the Holy Spirit, will teach you all things' },
      { ref: 'Romans 8:26', text: 'The Spirit himself intercedes for us through wordless groans' },
      { ref: 'Ezekiel 36:27', text: 'I will put my Spirit in you and move you to follow my decrees' },
    ],
    reading: 'Acts 2:1-21',
    prompt: 'Where do you need the Holy Spirit\'s power in your life right now? Ask him.',
  },

  // === ADVENT ===

  'advent-sunday-1': {
    scripture: {
      verse: "The hour has already come for you to wake up from your slumber, because our salvation is nearer now than when we first believed.",
      reference: 'Romans 13:11',
      capital: 'spiritual',
    },
    exposition: "The first Sunday of Advent marks the beginning of the Christian year. Advent means 'coming' — we remember Christ's first coming as a baby and anticipate his second coming as King. This season isn't about holiday busyness. It's about holy waiting. It's a call to wake up, pay attention, and prepare your heart for the One who changes everything.",
    crossRefs: [
      { ref: 'Isaiah 2:5', text: 'Come, let us walk in the light of the Lord' },
      { ref: 'Matthew 24:42', text: 'Keep watch, because you do not know on what day your Lord will come' },
    ],
    reading: 'Isaiah 2:1-5',
    prompt: 'As a new church year begins, what is God inviting you to pay attention to in this season?',
  },

  'advent-sunday-2': {
    scripture: {
      verse: "A voice of one calling: 'In the wilderness prepare the way for the Lord; make straight in the desert a highway for our God.'",
      reference: 'Isaiah 40:3',
      capital: 'spiritual',
    },
    exposition: "The second week of Advent calls us to preparation. John the Baptist cried out in the wilderness, calling people to repentance — to clear the road so the King could come through. What needs to be cleared in your heart? What clutter, what distraction, what unconfessed sin is blocking the path? Advent is not passive waiting. It's active preparation.",
    crossRefs: [
      { ref: 'Malachi 3:1', text: 'I will send my messenger, who will prepare the way before me' },
      { ref: 'Luke 3:4-6', text: 'Every valley shall be filled in, every mountain and hill made low' },
    ],
    reading: 'Isaiah 40:1-11',
    prompt: 'What needs to be cleared away in your life to make room for Christ this season?',
  },

  'advent-sunday-3': {
    scripture: {
      verse: "Rejoice in the Lord always. I will say it again: Rejoice!",
      reference: 'Philippians 4:4',
      capital: 'spiritual',
    },
    exposition: "The third Sunday of Advent is traditionally called 'Gaudete Sunday' — the Sunday of Joy. Even in the midst of waiting and preparation, joy breaks through. Not the shallow happiness of circumstances, but the deep, settled joy that comes from knowing God is faithful, Christ has come, and he will come again. Today, let yourself be glad — not because everything is perfect, but because the One who is perfect is with you.",
    crossRefs: [
      { ref: 'Isaiah 61:1', text: 'The Spirit of the Sovereign Lord is on me, because the Lord has anointed me to proclaim good news' },
      { ref: 'Luke 1:47', text: 'My spirit rejoices in God my Savior' },
    ],
    reading: 'Isaiah 61:1-4',
    prompt: 'Where can you find genuine joy today — not from circumstances, but from the faithfulness of God?',
  },

  'advent-sunday-4': {
    scripture: {
      verse: "'I am the Lord\\'s servant,' Mary answered. 'May your word to me be fulfilled.'",
      reference: 'Luke 1:38',
      capital: 'spiritual',
    },
    exposition: "The fourth Sunday of Advent focuses on Mary — a young woman who said yes to God when it made no sense. She didn't understand the plan. She couldn't see the outcome. But she trusted the One who called her. 'May your word to me be fulfilled.' That's the posture of Advent: open hands, willing heart, trusting surrender. Christmas is almost here. Are you ready to receive what God is giving?",
    crossRefs: [
      { ref: 'Luke 1:45', text: 'Blessed is she who has believed that the Lord would fulfill his promises' },
      { ref: 'Isaiah 7:14', text: 'The virgin will conceive and give birth to a son, and will call him Immanuel' },
    ],
    reading: 'Luke 1:26-38',
    prompt: 'Where is God asking you to say "yes" even when you can\'t see the full picture?',
  },

  'advent-generic': {
    scripture: {
      verse: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
      reference: 'Isaiah 9:6',
      capital: 'spiritual',
    },
    exposition: "Advent is a season of holy anticipation. For centuries, God's people waited for the promised Messiah. They watched, they prayed, they hoped. And then, in the fullness of time, God broke into human history as a baby in a manger. During this season, slow down from the holiday rush. Light a candle. Read the prophets. Let your heart be filled not with busyness, but with wonder at the God who came near.",
    crossRefs: [
      { ref: 'Micah 5:2', text: 'Out of you will come for me one who will be ruler over Israel' },
      { ref: 'Isaiah 11:1', text: 'A shoot will come up from the stump of Jesse' },
    ],
    reading: 'Isaiah 11:1-10',
    prompt: 'What are you waiting for from God in this season? How can you wait with hope rather than anxiety?',
  },

  // === CHRISTMAS ===

  'christmas-eve': {
    scripture: {
      verse: "But the angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people. Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.'",
      reference: 'Luke 2:10-11',
      capital: 'spiritual',
    },
    exposition: "Christmas Eve. The night the angels sang. The night heaven touched earth. God didn't send a message — he became the message. He didn't shout from the clouds — he cried in a manger. The Creator of the universe entered his own creation as a helpless infant. This is the scandal of the gospel: God came down. Not to the powerful, but to shepherds. Not to a palace, but to a stable. Tonight, receive the gift. Let the wonder in.",
    crossRefs: [
      { ref: 'Luke 2:14', text: 'Glory to God in the highest heaven, and on earth peace to those on whom his favor rests' },
      { ref: 'Galatians 4:4-5', text: 'When the set time had fully come, God sent his Son, born of a woman' },
    ],
    reading: 'Luke 2:1-20',
    prompt: 'Tonight, set aside the busyness. What does it mean to you personally that God chose to come as a baby — vulnerable, close, and available?',
  },

  'christmas-day': {
    scripture: {
      verse: "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.",
      reference: 'John 1:14',
      capital: 'spiritual',
    },
    exposition: "Merry Christmas. The Word became flesh. God moved into the neighborhood. This is the central miracle of the Christian faith — not just that God exists, but that he came close. Emmanuel: God with us. Not God above us, watching from a distance. God with us, in the mess, in the joy, in the ordinary stuff of human life. Today, celebrate. Feast. Give thanks. And know that the same God who came as a baby 2,000 years ago is present with you right now.",
    crossRefs: [
      { ref: 'Matthew 1:23', text: 'The virgin will conceive and give birth to a son, and they will call him Immanuel — God with us' },
      { ref: 'Hebrews 1:3', text: 'The Son is the radiance of God\'s glory and the exact representation of his being' },
      { ref: 'Philippians 2:6-7', text: 'Who, being in very nature God, did not consider equality with God something to be used to his own advantage; rather, he made himself nothing' },
    ],
    reading: 'John 1:1-18',
    prompt: 'God with us. How does the incarnation — God becoming human — change how you see your own ordinary, everyday life?',
  },

  'christmas-generic': {
    scripture: {
      verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      reference: 'John 3:16',
      capital: 'spiritual',
    },
    exposition: "The Christmas season continues beyond December 25. The early church celebrated for twelve days, letting the reality of the incarnation soak in. God gave his Son. That's the heartbeat of Christmas — not what we get, but what God gave. In this season, let generosity flow from gratitude. Let worship flow from wonder. Let love flow from the One who loved you first.",
    crossRefs: [
      { ref: '1 John 4:9', text: 'God sent his one and only Son into the world that we might live through him' },
      { ref: 'Titus 3:4-5', text: 'When the kindness and love of God our Savior appeared, he saved us' },
    ],
    reading: 'Titus 2:11-14',
    prompt: 'How can you extend the spirit of Christmas — generosity, wonder, and worship — into the days ahead?',
  },

  // === EPIPHANY ===

  'epiphany': {
    scripture: {
      verse: "After Jesus was born in Bethlehem in Judea, during the time of King Herod, Magi from the east came to Jerusalem and asked, 'Where is the one who has been born king of the Jews? We saw his star when it rose and have come to worship him.'",
      reference: 'Matthew 2:1-2',
      capital: 'spiritual',
    },
    exposition: "Epiphany celebrates the revelation of Christ to the nations. The Magi — non-Jewish scholars from the East — followed a star to find a king. They brought gold, frankincense, and myrrh: gifts that acknowledged Jesus as king, God, and sacrifice. Epiphany reminds us that the gospel isn't for one people — it's for all peoples. The light of Christ shines for everyone willing to seek it.",
    crossRefs: [
      { ref: 'Isaiah 60:1', text: 'Arise, shine, for your light has come, and the glory of the Lord rises upon you' },
      { ref: 'Matthew 2:11', text: 'They bowed down and worshiped him. Then they opened their treasures' },
    ],
    reading: 'Matthew 2:1-12',
    prompt: 'The Magi traveled far to find Jesus. What is your journey toward him looking like right now?',
  },

}

/**
 * Get liturgical content for a specific date.
 * Returns the content object or null for ordinary days.
 */
export function getLiturgicalContent(date) {
  const day = getLiturgicalDay(date)
  if (!day) return null

  // Try specific day first, then fall back to season generic
  return LITURGICAL_CONTENT[day.key] || null
}
