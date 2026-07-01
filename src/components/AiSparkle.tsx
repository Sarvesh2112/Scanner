interface Props {
  /** Message shown under the sparkle while the AI works. */
  label?: string
}

/**
 * Apple-Intelligence-style "analyzing" indicator: a pulsing, shimmering sparkle
 * over an animated blue→violet gradient, with a smaller companion star.
 */
export default function AiSparkle({ label = 'Reading card with AI…' }: Props) {
  return (
    <div className="ai-analyzing" role="status" aria-live="polite">
      <div className="ai-sparkle">
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
          <defs>
            <linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0A84FF" />
              <stop offset="55%" stopColor="#5E5CE6" />
              <stop offset="100%" stopColor="#BF5AF2" />
            </linearGradient>
          </defs>
          {/* Main four-point star */}
          <path
            className="ai-star-main"
            fill="url(#ai-grad)"
            d="M38 4c1.2 9.6 4.4 12.8 14 14-9.6 1.2-12.8 4.4-14 14-1.2-9.6-4.4-12.8-14-14 9.6-1.2 12.8-4.4 14-14Z"
          />
          {/* Small companion star */}
          <path
            className="ai-star-small"
            fill="url(#ai-grad)"
            d="M18 34c.7 5.6 2.6 7.5 8.2 8.2-5.6.7-7.5 2.6-8.2 8.2-.7-5.6-2.6-7.5-8.2-8.2 5.6-.7 7.5-2.6 8.2-8.2Z"
          />
        </svg>
      </div>
      <p className="ai-label">{label}</p>
    </div>
  )
}
