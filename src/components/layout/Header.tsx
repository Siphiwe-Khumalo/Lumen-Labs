import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navigation } from '../../data/site'
import { useScrollState } from '../../hooks/useScrollState'
import { cn } from '../../lib/cn'
import { Logo } from '../brand/Logo'
import { LinkButton } from '../ui/Button'
import { Container } from './Container'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isScrolled, progress } = useScrollState()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Hold the page still while the mobile menu covers it.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  return (
    <header className={cn('site-header', (isScrolled || isOpen) && 'is-scrolled')}>
      <button
        type="button"
        className={cn('nav-scrim', isOpen && 'is-open')}
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <Container className="header-inner">
        <a
          className="brand-link"
          href="#top"
          aria-label="Lumen Labs — back to top"
          onClick={() => setIsOpen(false)}
        >
          <Logo />
        </a>

        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={cn('header-nav', isOpen && 'is-open')}
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <LinkButton className="header-cta" href="#contact" showArrow>
            Start a project
          </LinkButton>
          <button
            type="button"
            className="menu-button"
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <div
        className="progress-line"
        aria-hidden="true"
        style={{ width: '100%', transform: `scaleX(${progress})` }}
      />
    </header>
  )
}
