import { useRef, type MouseEvent, type ReactNode } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const div = divRef.current
    if (!div) return
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    div.style.setProperty('--mouse-x', `${x}px`)
    div.style.setProperty('--mouse-y', `${y}px`)
    div.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900/35 backdrop-blur-md p-8 overflow-hidden before:content-[''] before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),var(--spotlight-color),transparent_80%)] before:pointer-events-none hover:before:opacity-60 ${className}`.trim()}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-color': spotlightColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

export default SpotlightCard
