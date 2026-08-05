import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, GraduationCap, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { usersAPI, authAPI } from '../services/api';

const COLLEGES = [
  'RV College of Engineering', 'BMS College of Engineering', 'MSRIT (MS Ramaiah)',
  'PES University', 'Dayananda Sagar College of Engineering', 'NMIT',
  'BMSIT & M', 'CMRIT', 'BNMIT', 'New Horizon College', 'AIT Chikkamagaluru',
  'Don Bosco Institute of Technology', 'East Point College of Engineering',
  'Global Academy of Technology', 'Jyothy Institute of Technology',
  'KS School of Engineering', 'KSIT', 'Nagarjuna College of Engineering',
  'Oxford College of Engineering', 'Reva University', 'RNS Institute of Technology',
  'Sambhram Institute of Technology', 'Sapient College of Engineering',
  'Sir M Visvesvaraya Institute of Technology', 'SJB Institute of Technology',
  'Sri Jayachamarajendra College of Engineering', 'The Oxford College',
  'Vemana IT', 'Vidya Vikas Institute of Engineering', 'Other'
];

const DEPARTMENTS = [
  'Computer Science (CSE)', 'Information Science (ISE)', 'Electronics & Communication (ECE)',
  'Electrical Engineering (EEE)', 'Mechanical Engineering (ME)', 'Civil Engineering (CE)',
  'Artificial Intelligence & ML (AIML)', 'Computer Science & Data Science (CSD)',
  'Biomedical Engineering', 'Aerospace Engineering', 'Chemical Engineering', 'Other'
];

const BATCHES = [2026, 2027, 2028, 2029];

function getAcademicYear(passoutYear) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const currentAcademic = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const diff = passoutYear - currentAcademic;
  if (diff === 4) return 'First Year (1st Sem)';
  if (diff === 3) return 'Second Year (3rd Sem)';
  if (diff === 2) return 'Pre-Final Year (5th Sem)';
  if (diff === 1) return 'Final Year (7th Sem)';
  return 'Alumni';
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, login, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    college: '', passoutYear: null, department: '', name: user?.name || ''
  });

  const isLoggedIn = !!user;

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const res = await usersAPI.onboarding(data);
        updateUser(res.data.user);
        toast.success('Profile setup complete! 🎉');
        navigate('/dashboard');
      } else {
        navigate('/register', { state: { onboardingData: data } });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(108,99,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(248,87,166,0.07) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '14px',
            background: 'linear-gradient(135deg, #6c63ff, #f857a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: 'white',
            margin: '0 auto 0.75rem'
          }}>T</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: 'white' }}>
            Welcome to TouchWithSeniors
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Let's set up your profile in 3 quick steps
          </p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
          {[1, 2, 3].map((s) => (
            <>
              <div key={s} className={`step-dot ${s === step ? 'active' : s < step ? 'completed' : 'inactive'}`}>
                {s < step ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && <div className={`step-line ${s < step ? 'completed' : ''}`} style={{ width: 60 }} />}
            </>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <GraduationCap size={20} color="#a78bfa" />
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Select Your College</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {COLLEGES.map(c => (
                    <button
                      key={c}
                      className={`college-chip ${data.college === c ? 'selected' : ''}`}
                      onClick={() => setData(d => ({ ...d, college: c }))}
                    >{c}</button>
                  ))}
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                  disabled={!data.college}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Calendar size={20} color="#f857a6" />
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Select Passout Batch</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {BATCHES.map(y => (
                    <button
                      key={y}
                      onClick={() => setData(d => ({ ...d, passoutYear: y }))}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: `2px solid ${data.passoutYear === y ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                        background: data.passoutYear === y ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: data.passoutYear === y ? '#a78bfa' : 'var(--color-text-muted)'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{y}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{getAcademicYear(y)}</div>
                    </button>
                  ))}
                </div>
                {data.passoutYear && (
                  <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                    🎓 You are currently in <strong>{getAcademicYear(data.passoutYear)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                    disabled={!data.passoutYear}
                    onClick={() => setStep(3)}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <User size={20} color="#00d9ff" />
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Complete Your Profile</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      className="input"
                      placeholder="Your full name"
                      value={data.name}
                      onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Department / Branch</label>
                    <select
                      className="input"
                      value={data.department}
                      onChange={e => setData(d => ({ ...d, department: e.target.value }))}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  {/* Summary */}
                  <div style={{
                    background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.15)',
                    borderRadius: '12px', padding: '1rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</div>
                    <div style={{ fontSize: '0.875rem', color: 'white' }}>🏫 {data.college}</div>
                    <div style={{ fontSize: '0.875rem', color: 'white', marginTop: '0.25rem' }}>📅 Batch {data.passoutYear} · {getAcademicYear(data.passoutYear)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn-ghost" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                    disabled={!data.name || !data.department || loading}
                    onClick={handleComplete}
                  >
                    {loading ? 'Setting up...' : isLoggedIn ? 'Complete Setup 🎉' : 'Continue to Register'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
