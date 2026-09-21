import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type SectionLabelProps = {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return <p className={cn('mono section-label', className)}>{children}</p>
}
