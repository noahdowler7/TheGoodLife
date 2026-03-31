function StreakIndicator({ count, label }) {
  if (count <= 0) return null

  return (
    <div className="streak-badge">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 23a7.5 7.5 0 01-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.68.5 1.47.5 2.47 0 4.142-3.358 7.5-7.5 7.5z" />
      </svg>
      <span>{count} day{count !== 1 ? 's' : ''}</span>
      {label && (
        <span className="text-[11px] opacity-70">{label}</span>
      )}
    </div>
  )
}

export default StreakIndicator
