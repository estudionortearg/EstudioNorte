import Hero from '@/components/sections/Hero'
import StatsBar from '@/components/sections/StatsBar'
import CoursesPreview from '@/components/sections/CoursesPreview'
import Features from '@/components/sections/Features'
import AboutJuano from '@/components/sections/AboutJuano'
import InstructorCTA from '@/components/sections/InstructorCTA'
import Testimonials from '@/components/sections/Testimonials'
import Guarantee from '@/components/sections/Guarantee'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

export default function Home() {
  return (
    <div style={{ position: 'relative', isolation: 'isolate' }}>
      {/* Flowing orbs — fixed to viewport, visible through transparent section bgs */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.045) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '0%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '72%', left: '20%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <StatsBar />
        <CoursesPreview />
        <Features />
        <AboutJuano />
        <InstructorCTA />
        <Testimonials />
        <Guarantee />
        <FAQ />
        <FinalCTA />
      </div>
    </div>
  )
}
