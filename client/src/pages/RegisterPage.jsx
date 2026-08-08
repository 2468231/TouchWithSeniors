import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail, User, CheckCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

/* ── helpers ─────────────────────────────────────────── */
function getPassoutYears() {
  const now = new Date();
  const base = now.getFullYear();
  return [base, base + 1, base + 2, base + 3, base + 4];
}

const STEP_LABELS = ['College', 'Year', 'Email', 'Name'];

/* ── step indicator ──────────────────────────────────── */
function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <motion.div
              animate={{
                background: i < step ? 'linear-gradient(135deg,#7c3aed,#ec4899)' :
                  i === step ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.07)',
                borderColor: i <= step ? '#7c3aed' : 'rgba(255,255,255,0.12)',
                scale: i === step ? 1.12 : 1
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: i <= step ? 'white' : '#5a6478'
              }}
            >
              {i < step ? <CheckCircle size={15} /> : i + 1}
            </motion.div>
            <span style={{ fontSize: '0.6rem', color: i === step ? '#a78bfa' : '#5a6478', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div style={{
              width: 40, height: 2, margin: '0 4px',
              background: i < step ? 'linear-gradient(90deg,#7c3aed,#ec4899)' : 'rgba(255,255,255,0.07)',
              marginBottom: '1.4rem', transition: 'background 0.4s'
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── college card ────────────────────────────────────── */
function CollegeCard({ college, selected, onClick, delay }) {
  const initials = college.shortName || college.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const colors = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#9333ea', '#0284c7', '#16a34a', '#ca8a04', '#e11d48'];
  const color = colors[(college.name.length) % colors.length];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: '100%', padding: '1.1rem 0.9rem', borderRadius: 14, cursor: 'pointer',
        background: selected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)',
        border: selected ? '2px solid #7c3aed' : '1.5px solid rgba(255,255,255,0.08)',
        textAlign: 'left', transition: 'border 0.2s, background 0.2s',
        position: 'relative', overflow: 'hidden', fontFamily: 'inherit'
      }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ position: 'absolute', top: 8, right: 8, color: '#a78bfa' }}
        >
          <CheckCircle size={16} />
        </motion.div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: `${color}20`, border: `1.5px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 800, color, letterSpacing: '0.02em'
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: selected ? '#e8e8f0' : '#c8c8e0', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {college.name}
          </div>
          <div style={{ fontSize: '0.67rem', color: '#5a6478', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={9} /> {college.location || 'Bengaluru'}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── year card ───────────────────────────────────────── */
function YearCard({ year, selected, onClick, delay }) {
  const now = new Date().getFullYear();
  const diff = year - now;
  const label = diff === 0 ? 'This Year' : diff === 1 ? 'Next Year' : `${diff} yrs ahead`;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '1.2rem 1rem', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
        background: selected ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.12))' : 'rgba(255,255,255,0.03)',
        border: selected ? '2px solid #7c3aed' : '1.5px solid rgba(255,255,255,0.08)',
        transition: 'all 0.2s', fontFamily: 'inherit', width: '100%'
      }}
    >
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: selected ? '#a78bfa' : '#e8e8f0', lineHeight: 1 }}>
        {year}
      </div>
      <div style={{ fontSize: '0.65rem', color: selected ? '#c4b5fd' : '#5a6478', marginTop: '0.4rem', fontWeight: 600 }}>
        {label}
      </div>
      {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginTop: '0.5rem' }}><CheckCircle size={14} color="#a78bfa" style={{ margin: '0 auto' }} /></motion.div>}
    </motion.button>
  );
}

/* ── main register page ──────────────────────────────── */
export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);           // 0=college 1=year 2=email 3=name
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getColleges().then(r => setColleges(r.data.colleges || [])).catch(() => {});
  }, []);

  const years = getPassoutYears();

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.shortName?.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const validateEmail = (val) => {
    if (!selectedCollege || !val) { setEmailError(''); return true; }
    if (!val.toLowerCase().trim().endsWith('@' + selectedCollege.emailDomain)) {
      setEmailError('Please enter a valid college email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Enter your name'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: name.trim(),
        email: email.trim(),
        college: selectedCollege.name,
        passoutYear: selectedYear,
      });
      login(res.data.token, res.data.user);
      toast.success(`🎉 Welcome, ${res.data.user.name}!`);
      navigate('/dashboard/queries');
    } catch (err) {
      if (err.response?.status === 200) {
        login(err.response.data.token, err.response.data.user);
        navigate('/dashboard/queries');
      } else {
        toast.error(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step === 0 && !selectedCollege) { toast.error('Select your college'); return; }
    if (step === 1 && !selectedYear) { toast.error('Select your passing year'); return; }
    if (step === 2) {
      if (!email) { toast.error('Enter your college email'); return; }
      if (!validateEmail(email)) return;
      setStep(3); return;
    }
    if (step === 3) { handleSubmit(); return; }
    setStep(s => s + 1);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };
  const [dir, setDir] = useState(1);
  const next = () => { setDir(1); goNext(); };
  const back = () => { setDir(-1); setStep(s => s - 1); };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.22), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(236,72,153,0.08), transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 0.75rem',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', boxShadow: '0 8px 32px rgba(124,58,237,0.4)'
          }}>🎓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: 'white' }}>
            Touch<span style={{ color: '#a78bfa' }}>WithSeniors</span>
          </div>
          <p style={{ color: '#5a6478', fontSize: '0.82rem', marginTop: '0.3rem' }}>Join Bangalore's #1 placement community</p>
        </div>

        {/* Step bar */}
        <StepBar step={step} />

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22, padding: '2rem', backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 72px rgba(0,0,0,0.55)'
        }}>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >

              {/* ── STEP 0: College ── */}
              {step === 0 && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: '0.35rem' }}>
                      Select your college
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5a6478' }}>We support {colleges.length}+ colleges across Karnataka</div>
                  </div>

                  {/* Search */}
                  <input
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '0.65rem 1rem', color: 'white', fontSize: '0.85rem',
                      outline: 'none', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box',
                      transition: 'border 0.2s'
                    }}
                    placeholder="🔍  Search college..."
                    value={collegeSearch}
                    onChange={e => setCollegeSearch(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.6rem',
                    maxHeight: '340px', overflowY: 'auto', paddingRight: '2px'
                  }}>
                    {filteredColleges.map((c, i) => (
                      <CollegeCard
                        key={c.name} college={c}
                        selected={selectedCollege?.name === c.name}
                        onClick={() => { setSelectedCollege(c); setEmail(''); setEmailError(''); }}
                        delay={Math.min(i * 0.04, 0.3)}
                      />
                    ))}
                    {filteredColleges.length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#5a6478', fontSize: '0.85rem' }}>
                        No colleges found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 1: Passing Year ── */}
              {step === 1 && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: '0.35rem' }}>
                      When do you graduate?
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5a6478' }}>Select your expected passing year</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {years.map((yr, i) => (
                      <YearCard
                        key={yr} year={yr}
                        selected={selectedYear === yr}
                        onClick={() => setSelectedYear(yr)}
                        delay={i * 0.06}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Email ── */}
              {step === 2 && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: '0.35rem' }}>
                      Enter your college email
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5a6478' }}>
                      Must be an official {selectedCollege?.shortName} email address
                    </div>
                  </div>

                  {/* Selected college pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: 100, padding: '0.35rem 0.9rem', marginBottom: '1.25rem'
                  }}>
                    <CheckCircle size={13} color="#a78bfa" />
                    <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>{selectedCollege?.name}</span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a6478', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      autoFocus
                      style={{
                        width: '100%', background: emailError ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
                        border: emailError ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '0.8rem 1rem 0.8rem 2.8rem', color: 'white',
                        fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
                        boxSizing: 'border-box', transition: 'border 0.2s',
                      }}
                      placeholder="Enter your college email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                      onBlur={() => validateEmail(email)}
                      onFocus={e => { if (!emailError) e.target.style.borderColor = '#7c3aed'; }}
                    />
                  </div>
                  {emailError && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      ⚠ {emailError}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Name ── */}
              {step === 3 && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: '0.35rem' }}>
                      What's your name?
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5a6478' }}>Almost there! Tell us your full name</div>
                  </div>

                  {/* Summary pill row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
                    {[selectedCollege?.shortName, selectedYear, email].filter(Boolean).map((val, i) => (
                      <span key={i} style={{
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                        borderRadius: 100, padding: '0.25rem 0.75rem',
                        fontSize: '0.72rem', color: '#a78bfa', fontWeight: 600
                      }}>{val}</span>
                    ))}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a6478', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      autoFocus
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '0.8rem 1rem 0.8rem 2.8rem', color: 'white',
                        fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        transition: 'border 0.2s'
                      }}
                      placeholder="Your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      onKeyDown={e => e.key === 'Enter' && goNext()}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            {step > 0 && (
              <button
                type="button" onClick={back}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.2rem', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#8892a4', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8892a4'; }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <button
              type="button" onClick={next} disabled={loading}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.85rem 1.5rem', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none', color: 'white', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
                transition: 'all 0.25s', opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.6)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.45)'; }}
            >
              {loading ? 'Creating account...' : step === 3 ? <><CheckCircle size={17} /> Create Account — It's Free</> : <>Continue <ArrowRight size={17} /></>}
            </button>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#5a6478' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700 }}>Sign In →</Link>
        </div>
      </div>
    </div>
  );
}
