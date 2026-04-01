function MovementLogo({ width = 200, className = '', light = false }) {
  // No filters - logo should display naturally on dark background
  return (
    <img
      src="/images/movement-logo.png"
      alt="Movement Church"
      width={width}
      className={className}
      style={{
        height: 'auto',
      }}
    />
  )
}

export default MovementLogo
