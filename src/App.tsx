import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { CaseStudies } from './sections/CaseStudies'
import { Expertise } from './sections/Expertise'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { Mindset } from './sections/Mindset'
import { Process } from './sections/Process'
import { Solutions } from './sections/Solutions'
import { Stack } from './sections/Stack'
import { StartProject } from './sections/StartProject'
import { WhyLumen } from './sections/WhyLumen'

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <main id="main-content">
        <Hero />
        <Marquee />
        <Expertise />
        <Solutions />
        <CaseStudies />
        <Stack />
        <Process />
        <Mindset />
        <WhyLumen />
        <StartProject />
      </main>
      <Footer />
    </div>
  )
}
