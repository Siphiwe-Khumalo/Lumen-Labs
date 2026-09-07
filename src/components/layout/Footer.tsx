import { ArrowUpRight } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <div>
            <Logo />
            <p className="footer-intro">
              Websites, applications, and interfaces for businesses that need more than a
              template.
            </p>
          </div>
          <a className="footer-email" href="#contact">
            Start a conversation
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Lumen Labs</span>
          <span>Built with intention.</span>
        </div>
      </Container>
    </footer>
  )
}
