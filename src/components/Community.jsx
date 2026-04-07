import { useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from './PageWrapper'

function Community() {
  const [tab, setTab] = useState('quests')

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
          Community
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Quests, leagues, friends, games & badges
        </p>
      </header>

      <div className="px-5">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: 'var(--bg-secondary)' }}>
          {['Quests', 'League', 'Friends', 'Games', 'Badges'].map(label => (
            <button
              key={label}
              onClick={() => setTab(label.toLowerCase())}
              className="flex-1 py-2 rounded-xl text-[12px] font-semibold"
              style={{
                background: tab === label.toLowerCase() ? 'var(--bg-card)' : 'transparent',
                color: tab === label.toLowerCase() ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Placeholder content per tab */}
        <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {tab === 'quests' && 'Daily Quests'}
            {tab === 'league' && 'Weekly League'}
            {tab === 'friends' && 'Friend Streaks'}
            {tab === 'games' && 'Scripture Games'}
            {tab === 'badges' && 'Achievements'}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'quests' && 'Complete 3 daily objectives to earn bonus XP'}
            {tab === 'league' && 'Compete weekly with other believers — Bronze to Diamond'}
            {tab === 'friends' && 'Build streaks with your accountability partners'}
            {tab === 'games' && 'Match scripture verses to their references'}
            {tab === 'badges' && '23 achievements to unlock across 7 categories'}
          </p>
          <p className="text-[12px] mt-3" style={{ color: 'var(--accent)' }}>
            Loading full features...
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}

export default Community
