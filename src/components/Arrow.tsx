export function Arrow({ direction = 'right' }: { direction?: 'right' | 'left' | 'down' | 'out' }) {
  const rotate = { right: 0, down: 90, left: 180, out: -45 }[direction]
  return (
    <svg
      className="arrow"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  )
}
