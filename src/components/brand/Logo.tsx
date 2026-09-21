import { cn } from '../../lib/cn'

type LogoVariant = 'wordmark' | 'mark' | 'combined'
type LogoTheme = 'light' | 'dark'

type BrandMarkProps = {
  className?: string
  theme?: LogoTheme
}

type LogoProps = BrandMarkProps & {
  variant?: LogoVariant
}

/**
 * Temporary mark: an "L" aperture with a light bar leaving it. Kept isolated so
 * the final Lumen Labs logo can replace this file without touching any layout.
 */
export function BrandMark({ className, theme = 'light' }: BrandMarkProps) {
  const base = theme === 'light' ? 'var(--text)' : 'var(--ink)'

  return (
    <svg
      aria-hidden="true"
      className={cn('brand-mark', className)}
      viewBox="0 0 28 28"
      fill="none"
    >
      <rect
        x="0.5"
        y="0.5"
        width="27"
        height="27"
        rx="6"
        stroke={base}
        strokeOpacity="0.2"
      />
      <path d="M8 7h3.1v10.9H20V21H8V7Z" fill={base} />
      <path d="M14.4 7H20v3.1h-5.6V7Z" fill="var(--accent)" />
    </svg>
  )
}

export function Logo({ className, theme = 'light', variant = 'combined' }: LogoProps) {
  if (variant === 'mark') {
    return <BrandMark className={cn('h-7 w-7', className)} theme={theme} />
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {variant === 'combined' && <BrandMark className="h-7 w-7" theme={theme} />}
      <span
        className="font-display text-[1.02rem] leading-none font-semibold tracking-[-0.03em]"
        style={{ color: theme === 'light' ? 'var(--text)' : 'var(--ink)' }}
      >
        Lumen&nbsp;Labs
      </span>
    </span>
  )
}
