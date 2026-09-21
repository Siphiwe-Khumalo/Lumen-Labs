import { ArrowUp } from 'lucide-react'
import { navigation } from '../../data/site'
import { Logo } from '../brand/Logo'
import { Container } from './Container'

const disciplines = [
  'Software development',
  'Web applications & PWAs',
  'Networking & infrastructure',
  'Cloud & Microsoft 365',
  'Automation & control',
  'Cybersecurity',
]

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-intro">
              A focused technology studio working across software, infrastructure, and
              control systems — from a business website to the interface on a plant floor.
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
            <h4>Disciplines</h4>
            <ul>
              {disciplines.map((discipline) => (
                <li key={discipline}>
                  <span>{discipline}</span>
                </li>
              ))}
            </ul>
          </div>

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
                <a href="#contact">Discuss a problem</a>
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
