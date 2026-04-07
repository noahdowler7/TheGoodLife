import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getGamePairs, XP_REWARDS } from '../utils/gamification'

function ScriptureMatchGame({ gamification, setGamification, onClose }) {
  const [pairs, setPairs] = useState([])
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState(new Set())
  const [wrong, setWrong] = useState(null)
  const [timer, setTimer] = useState(0)
  const [gameState, setGameState] = useState('ready') // ready | playing | won
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const timerRef = useRef(null)

  const startGame = useCallback(() => {
    const gamePairs = getGamePairs(6)
    setPairs(gamePairs)

    // Create cards: each pair becomes 2 cards (verse + reference)
    const allCards = gamePairs.flatMap((pair, i) => [
      { id: `v-${i}`, pairIndex: i, type: 'verse', text: pair.verse, matched: false },
      { id: `r-${i}`, pairIndex: i, type: 'ref', text: pair.ref, matched: false },
    ])

    // Shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]]
    }

    setCards(allCards)
    setSelected(null)
    setMatched(new Set())
    setWrong(null)
    setTimer(0)
    setScore(0)
    setMistakes(0)
    setGameState('playing')

    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleCardTap = useCallback((card) => {
    if (gameState !== 'playing' || matched.has(card.pairIndex) || wrong) return
    if (selected?.id === card.id) return

    if (!selected) {
      setSelected(card)
      return
    }

    // Check match
    if (selected.pairIndex === card.pairIndex) {
      // Match!
      const newMatched = new Set(matched)
      newMatched.add(card.pairIndex)
      setMatched(newMatched)
      setSelected(null)
      setScore(s => s + 10)

      // Check win
      if (newMatched.size === pairs.length) {
        clearInterval(timerRef.current)
        setGameState('won')

        // Award XP
        const xpEarned = XP_REWARDS.gameComplete + Math.max(0, 30 - mistakes * 5)
        const today = new Date().toISOString().slice(0, 10)
        setGamification(prev => ({
          ...prev,
          xp: (prev.xp || 0) + xpEarned,
          todayXP: (prev.todayXPDate === today ? (prev.todayXP || 0) : 0) + xpEarned,
          todayXPDate: today,
          gamesPlayed: (prev.gamesPlayed || 0) + 1,
        }))
      }
    } else {
      // Wrong
      setWrong({ first: selected, second: card })
      setMistakes(m => m + 1)
      setTimeout(() => {
        setWrong(null)
        setSelected(null)
      }, 800)
    }
  }, [selected, matched, wrong, gameState, pairs, mistakes, setGamification])

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
          Scripture Match
        </h2>
        <div className="w-10" />
      </div>

      {gameState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 mt-12 text-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
            <svg className="w-10 h-10" style={{ color: '#D4A843' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <h3 className="text-[22px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Match the Scripture
          </h3>
          <p className="text-[14px] mb-8" style={{ color: 'var(--text-secondary)' }}>
            Match each Bible verse with its reference. Tap two cards to find a pair!
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-3 rounded-2xl text-[16px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #D4A843, #E8C76A)' }}
          >
            Start Game
          </motion.button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="px-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {formatTime(timer)}
            </span>
            <span className="text-[13px] font-semibold" style={{ color: '#D4A843' }}>
              {matched.size}/{pairs.length} matched
            </span>
            <span className="text-[13px] font-medium" style={{ color: mistakes > 0 ? '#E07B6A' : 'var(--text-muted)' }}>
              {mistakes} miss{mistakes !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-3 gap-2">
            {cards.map((card) => {
              const isMatched = matched.has(card.pairIndex)
              const isSelected = selected?.id === card.id
              const isWrongFirst = wrong?.first?.id === card.id
              const isWrongSecond = wrong?.second?.id === card.id
              const isWrong = isWrongFirst || isWrongSecond

              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardTap(card)}
                  className="rounded-xl p-2.5 text-center min-h-[80px] flex items-center justify-center"
                  style={{
                    background: isMatched ? 'rgba(91, 185, 139, 0.15)' :
                      isWrong ? 'rgba(224, 123, 106, 0.15)' :
                        isSelected ? 'rgba(212, 168, 67, 0.2)' :
                          'var(--bg-card)',
                    border: `2px solid ${isMatched ? 'rgba(91, 185, 139, 0.5)' :
                      isWrong ? 'rgba(224, 123, 106, 0.5)' :
                        isSelected ? '#D4A843' :
                          'var(--border)'}`,
                    opacity: isMatched ? 0.5 : 1,
                  }}
                  whileTap={{ scale: isMatched ? 1 : 0.95 }}
                  animate={isWrong ? { x: [0, -4, 4, -4, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  disabled={isMatched}
                >
                  <span
                    className={`text-[${card.type === 'verse' ? '11' : '12'}px] leading-tight font-medium`}
                    style={{
                      color: isMatched ? '#5BB98B' :
                        isSelected ? '#D4A843' :
                          card.type === 'verse' ? 'var(--text-secondary)' : 'var(--text-primary)',
                      fontStyle: card.type === 'verse' ? 'italic' : 'normal',
                    }}
                  >
                    {card.text}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-5 mt-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(91, 185, 139, 0.15)' }}
          >
            <svg className="w-10 h-10" style={{ color: '#5BB98B' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
            </svg>
          </motion.div>
          <h3 className="text-[24px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Well Done!
          </h3>
          <p className="text-[14px] mb-1" style={{ color: 'var(--text-secondary)' }}>
            Completed in {formatTime(timer)} with {mistakes} mistake{mistakes !== 1 ? 's' : ''}
          </p>
          <p className="text-[16px] font-semibold mb-8" style={{ color: '#D4A843' }}>
            +{XP_REWARDS.gameComplete + Math.max(0, 30 - mistakes * 5)} XP earned
          </p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-6 py-3 rounded-2xl text-[15px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #D4A843, #E8C76A)' }}
            >
              Play Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-[15px] font-semibold"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ScriptureMatchGame
