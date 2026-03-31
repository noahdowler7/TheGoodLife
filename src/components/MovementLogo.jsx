function MovementLogo({ width = 200, className = '', light = false }) {
  // The source PNG has dark text + gold stripe on transparent background.
  // For dark backgrounds: invert the dark text to white, rotate hue to preserve gold.
  // For light backgrounds (or when light prop is true): use as-is.
  const filterStyle = light
    ? {}
    : { filter: 'invert(1) hue-rotate(180deg) brightness(1.1)' }

  return (
    <img
      src="/images/movement-logo.png"
      alt="Movement Church"
      width={width}
      className={className}
      style={{
        height: 'auto',
        ...filterStyle,
      }}
    />
  )
}

export default MovementLogo
