import { motion } from 'framer-motion';
import { MessageCircle, Phone, CheckCircle, Clock, Star, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WHATSAPP_NUMBER = '919380158802';
const WHATSAPP_MSG = encodeURIComponent("Hi, I would like to schedule a mock interview with a senior. Please let me know the available slots. Thank you!");

const BENEFITS = [
  { icon: '🎯', title: '1-on-1 with Placed Senior', desc: 'Interview with someone who got placed in the last 6 months' },
  { icon: '💬', title: 'Real Interview Simulation', desc: 'Face HR, DSA or core subject questions just like the real thing' },
  { icon: '📝', title: 'Personalized Feedback', desc: 'Detailed feedback on communication, confidence, and technical skills' },
  { icon: '🚀', title: 'Career Guidance', desc: 'Get insider tips on what companies actually look for' },
];

const FAQS = [
  { q: 'How long is each mock interview session?', a: '45-60 minutes including feedback discussion.' },
  { q: 'What types of interviews are available?', a: 'HR Round, DSA Coding Round, and Core Subject interviews.' },
  { q: 'How do I schedule?', a: 'Click the WhatsApp button below and our team will schedule within 24 hours.' },
  { q: 'Is ₹69 the total cost?', a: 'Yes! ₹69 per session, paid after scheduling confirmation.' },
];

export default function MockInterviewPage() {
  const { user } = useAuth();

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Mock Interview 🎤</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Practice with recently placed seniors and get real feedback</p>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: '900px' }}>
        {/* Pricing Card */}
        <motion.div
          className="pricing-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <span className="badge badge-green">Limited Time Offer</span>
          </div>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '0.25rem' }}>
            ₹69
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>Per Mock Interview Session</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {['1-on-1 Session', '45-60 Minutes', 'Personalized Feedback', 'Career Guidance'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#a78bfa' }}>
                <CheckCircle size={14} color="#22c55e" />
                {item}
              </div>
            ))}
          </div>

          <button
            className="whatsapp-btn"
            onClick={handleWhatsApp}
            style={{ margin: '0 auto', display: 'flex' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Request Interview via WhatsApp
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            📞 We'll respond within 2 hours · Payment after scheduling
          </p>
        </motion.div>

        {/* Benefits */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            What you'll get 🎁
          </h2>
          <div className="grid-2">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{b.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: '0.4rem' }}>{b.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interview Types */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            Interview Types Available
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'HR Round', desc: 'Behavioral, situational, STAR format questions', color: '#6c63ff' },
              { label: 'DSA Round', desc: 'Arrays, strings, trees, graphs, DP problems', color: '#f857a6' },
              { label: 'Core Subjects', desc: 'DBMS, OS, Networks, OOPs based on your branch', color: '#00d9ff' },
            ].map((type, i) => (
              <div key={i} style={{
                flex: '1 1 200px',
                background: `${type.color}10`,
                border: `1px solid ${type.color}30`,
                borderRadius: '14px', padding: '1.25rem'
              }}>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>{type.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{type.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Q: {faq.q}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>A: {faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(37,211,102,0.08), rgba(18,140,126,0.05))',
            border: '1px solid rgba(37,211,102,0.2)',
            borderRadius: '16px', padding: '1.5rem', textAlign: 'center'
          }}
        >
          <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Ready to ace your next interview? 🚀</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Join 100+ students who've practiced with our senior mentors
          </p>
          <button className="whatsapp-btn" onClick={handleWhatsApp} style={{ margin: '0 auto', display: 'flex' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Book Your Session - ₹69 Only
          </button>
        </motion.div>
      </div>
    </div>
  );
}
