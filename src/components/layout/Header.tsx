import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { Container } from './Container'

const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="site-header">
      <Container className="flex h-full items-center justify-between">
        <a href="#top" aria-label="Lumen Labs home" onClick={() => setIsOpen(false)}>
          <Logo />
        </a>

        <button
          type="button"
          className="mobile-menu-button"
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={isOpen ? 'site-nav is-open' : 'site-nav'}
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="header-cta" href="#contact">
          Start a project
          <span aria-hidden="true">↗</span>
        </a>
      </Container>
    </header>
  )
}
