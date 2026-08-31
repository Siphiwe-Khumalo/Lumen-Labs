import { cn } from '../../lib/cn'

type SectionLabelProps = {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return <p className={cn('section-label', className)}>{children}</p>
}
