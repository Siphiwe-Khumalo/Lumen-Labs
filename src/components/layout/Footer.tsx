import { ArrowUp } from 'lucide-react'
import { navigation } from '../../data/site'
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
              A focused digital development studio building websites, web applications,
              and the technical interfaces behind them.
            </p>
          </div>

          <nav className="footer-col" aria-label="Footer">
            <h4>Sections</h4>
            <ul>
              {navigation.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h4>Studio</h4>
            <ul>
              <li>
                <span>South Africa</span>
              </li>
              <li>
                <a href="#contact">Start a project</a>
              </li>
              <li>
                <span>Contact details to be confirmed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="mono">© {new Date().getFullYear()} Lumen Labs</span>
          <span className="mono">Built with intention</span>
          <a className="to-top mono" href="#top">
            Back to top
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </Container>
    </footer>
  )
}
