import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, MessageSquare, Briefcase, Star, ArrowRight,
  CheckCircle, Zap, Shield, TrendingUp, Code, Brain
} from 'lucide-react';

const features = [
  { icon: MessageSquare, title: 'Ask Query', desc: 'Post your placement doubts and get answers from seniors who\'ve been there.', color: '#6c63ff' },
  { icon: BookOpen, title: 'Free Resources', desc: 'Curated DSA, DBMS, OS, ML resources organized by your branch and interest.', color: '#f857a6' },
  { icon: Code, title: 'DSA Basics', desc: 'Start from Hello World and progress through arrays, strings to advanced topics.', color: '#00d9ff' },
  { icon: Brain, title: 'Mock Interview', desc: 'Book 1-on-1 sessions with recently placed seniors for ₹69.', color: '#22c55e' },
  { icon: Briefcase, title: 'Off-Campus Opportunities', desc: 'Discover internships and full-time roles at product companies and startups.', color: '#f59e0b' },
  { icon: Star, title: 'Interview Experiences', desc: 'Read real interview experiences from students placed at top companies.', color: '#a78bfa' },
];

const stats = [
  { number: '500+', label: 'Students Helped' },
  { number: '30+', label: 'Bangalore Colleges' },
  { number: '200+', label: 'Resources Shared' },
  { number: '50+', label: 'Interview Experiences' },
];

const testimonials = [
  { name: 'Rahul K.', college: 'RV College of Engineering', batch: '2024', text: 'TouchWithSeniors helped me prepare for Amazon in just 2 months. The senior insights were invaluable!', role: 'SDE @ Amazon' },
  { name: 'Priya M.', college: 'PES University', batch: '2025', text: 'I was clueless about off-campus placements. This platform opened so many doors for me.', role: 'Software Engineer @ Zepto' },
  { name: 'Arjun R.', college: 'MSRIT', batch: '2024', text: 'The DSA basics section is perfect for beginners. I went from zero to landing a Razorpay internship!', role: 'Intern @ Razorpay' },
];

const FLOATING_ELEMENTS = ['⚡', '🚀', '💻', '🎯', '📈', '🔥'];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c63ff, #f857a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: 'white'
          }}>T</div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>
            TouchWith<span style={{ color: '#a78bfa' }}>Seniors</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '6rem 2rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,87,166,0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '15%', width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.07) 0%, transparent 70%)',
          animation: 'float 5s ease-in-out infinite 1s', pointerEvents: 'none'
        }} />

        {/* Floating emoji decorations */}
        {FLOATING_ELEMENTS.map((el, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${15 + Math.random() * 70}%`,
            left: `${5 + (i * 15)}%`,
            fontSize: '1.5rem', opacity: 0.15,
            animation: `float ${4 + i}s ease-in-out infinite ${i * 0.5}s`,
            pointerEvents: 'none'
          }}>{el}</div>
        ))}

        <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '100px', padding: '0.35rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa'
            }}>
              <Zap size={12} fill="#a78bfa" />
              Bangalore's #1 Placement Community Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800, lineHeight: 1.15,
              marginBottom: '1.5rem', color: 'white'
            }}
          >
            Will AI replace software engineers?<br />
            <span className="gradient-text">Are freshers still getting hired?</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--color-text-muted)',
              lineHeight: 1.8, marginBottom: '0.75rem', maxWidth: '700px', margin: '0 auto 1rem'
            }}
          >
            Connect with recently placed seniors, clarify your doubts, understand what companies actually expect, and prepare for placement opportunities with confidence.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: '1rem', color: '#8b8ba7', lineHeight: 1.8,
              marginBottom: '2.5rem'
            }}
          >
            Learn from real placement experiences, access free resources, practice interviews, and grow your career.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}
          >
            <button
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
              onClick={() => navigate('/register')}
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.number}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Everything you need to <span className="gradient-text">get placed</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            A complete ecosystem designed for engineering students to navigate campus placements successfully.
          </p>
        </div>

        <div className="grid-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '12px', marginBottom: '1rem',
                background: `${f.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${f.color}30`
              }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why TouchWithSeniors */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Why Us?</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '1.5rem' }}>
                Built by students,<br /><span className="gradient-text-purple">for students</span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                We understand the anxiety of campus placements. TouchWithSeniors bridges the gap between freshers and recently placed seniors from the same colleges.
              </p>
              {[
                'Real experiences from Bangalore engineering college students',
                'Free resources verified by placed seniors',
                'Mock interviews with actual industry professionals',
                'Off-campus job alerts before they go viral'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: Shield, label: 'Verified Seniors', color: '#6c63ff' },
                { icon: TrendingUp, label: 'Career Growth', color: '#f857a6' },
                { icon: Users, label: 'Community', color: '#00d9ff' },
                { icon: Zap, label: 'Fast Learning', color: '#f59e0b' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="glass"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px', margin: '0 auto 0.75rem',
                    background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <item.icon size={22} color={item.color} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
            Success stories from <span className="gradient-text">our community</span>
          </h2>
        </div>
        <div className="grid-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={14} color="#f59e0b" fill="#f59e0b" />)}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.college} · {t.batch}</div>
                  <span className="badge badge-green" style={{ marginTop: '0.2rem', fontSize: '0.7rem' }}>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '4rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: '800px', margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(248,87,166,0.08))',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: '24px', padding: '3rem 2rem'
          }}
        >
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Ready to ace your placements? 🚀
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Join hundreds of engineering students who are already preparing smarter.
          </p>
          <button
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}
            onClick={() => navigate('/register')}
          >
            Join TouchWithSeniors — It's Free! <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>© 2025 TouchWithSeniors. Made with ❤️ for Bangalore engineering students.</p>
        <p style={{ marginTop: '0.25rem', opacity: 0.6 }}>For support: hhemantha696@gmail.com</p>
      </footer>
    </div>
  );
}
