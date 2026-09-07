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

export function BrandMark({ className, theme = 'light' }: BrandMarkProps) {
  const fill = theme === 'light' ? 'var(--color-text)' : 'var(--color-ink)'
  const accent = 'var(--color-accent)'

  return (
    <svg
      aria-hidden="true"
      className={cn('brand-mark', className)}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path d="M5 5h22v6H11v5h12v6H11v5h16v5H5V5Z" fill={fill} />
      <path d="M23 5h4v6h-4V5Z" fill={accent} />
    </svg>
  )
}

export function Logo({ className, theme = 'light', variant = 'combined' }: LogoProps) {
  if (variant === 'mark') {
    return <BrandMark className={className} theme={theme} />
  }

  const textColor = theme === 'light' ? 'text-text' : 'text-ink'

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {variant === 'combined' && <BrandMark className="h-8 w-8" theme={theme} />}
      <span
        className={cn(
          'font-display text-[1.05rem] font-semibold tracking-[-0.03em]',
          textColor,
        )}
      >
        Lumen Labs
      </span>
    </span>
  )
}
