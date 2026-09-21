import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Capability } from './sections/Capability'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { SelectedWork } from './sections/SelectedWork'
import { Services } from './sections/Services'
import { StartProject } from './sections/StartProject'
import { WhyLumen } from './sections/WhyLumen'

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <main id="main-content">
        <Hero />
        <Marquee />
        <SelectedWork />
        <Services />
        <Capability />
        <WhyLumen />
        <StartProject />
      </main>
      <Footer />
    </div>
  )
}
