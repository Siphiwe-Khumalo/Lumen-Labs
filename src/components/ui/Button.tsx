import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'text'

type BaseButtonProps = {
  variant?: ButtonVariant
  showArrow?: boolean
  className?: string
  children: React.ReactNode
}

type ButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
type LinkButtonProps = BaseButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  text: 'button-text',
}

export function Button({
  children,
  className,
  showArrow = false,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button className={cn('button-base', buttonStyles[variant], className)} {...props}>
      {children}
      {showArrow && <ArrowUpRight aria-hidden="true" className="h-4 w-4" />}
    </button>
  )
}

export function LinkButton({
  children,
  className,
  showArrow = false,
  variant = 'primary',
  ...props
}: LinkButtonProps) {
  return (
    <a className={cn('button-base', buttonStyles[variant], className)} {...props}>
      {children}
      {showArrow && <ArrowUpRight aria-hidden="true" className="h-4 w-4" />}
    </a>
  )
}
