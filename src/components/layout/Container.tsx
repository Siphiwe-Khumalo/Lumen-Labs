import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type ContainerProps = PropsWithChildren<{
  className?: string
}>

export function Container({ children, className }: ContainerProps) {
  return <div className={cn('container-shell', className)}>{children}</div>
}
