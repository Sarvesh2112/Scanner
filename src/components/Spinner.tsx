interface Props {
  /** Extra class for sizing/color overrides. */
  className?: string
}

/** Minimal spinner that inherits currentColor, so it reads on any button. */
export default function Spinner({ className = '' }: Props) {
  return <span className={`spinner ${className}`} role="status" aria-label="Loading" />
}
