/** The heartbeat from the club stamp, stretched to a horizontal rule. */
export default function Pulse({ className = 'club-pulse' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d="M0 20 H420 L440 20 L452 6 L466 34 L480 2 L496 38 L510 12 L522 26 L532 20 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
