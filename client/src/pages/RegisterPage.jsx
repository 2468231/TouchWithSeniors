import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Building2, ArrowRight, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [search, setSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getColleges().then(r => setColleges(r.data.colleges || [])).catch(() => {});
  }, []);

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const validateEmail = (val, college) => {
    if (!college || !val) { setEmailError(''); return; }
    if (!val.toLowerCase().trim().endsWith('@' + college.emailDomain)) {
      setEmailError(`Must end with @${college.emailDomain}`);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollege) { toast.error('Select your college'); return; }
    if (!name.trim()) { toast.error('Enter your name'); return; }
    if (!email || emailError) { toast.error('Enter a valid college email'); return; }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: name.trim(),
        email: email.trim(),
        college: selectedCollege.name
      });
      login(res.data.token, res.data.user);
      toast.success(`🎉 Welcome, ${res.data.user.name}!`);
      navigate('/dashboard/queries');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      // If already registered, redirect to login
      if (err.response?.status === 200) {
        login(err.response.data.token, err.response.data.user);
        navigate('/dashboard/queries');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.2), transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: 'white' }}>
            Touch<span style={{ color: '#a78bfa' }}>WithSeniors</span>
          </div>
          <p style={{ color: '#8892a4', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Create your student account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '2rem', backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}>
          <form onSubmit={handleSubmit}>

            {/* College picker */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">College *</label>
              <div style={{ position: 'relative' }}>
                <button type="button"
                  onClick={() => setShowDrop(v => !v)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 1rem', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: selectedCollege ? '#e8e8f0' : '#5a6478', fontFamily: 'inherit', fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{selectedCollege ? selectedCollege.name : 'Select your college'}</span>
                  <ChevronDown size={15} style={{ color: '#5a6478', transition: '0.2s', transform: showDrop ? 'rotate(180deg)' : 'none' }} />
                </button>

                {showDrop && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'rgba(15,15,26,0.98)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, marginTop: 4, overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5a6478' }} />
                        <input
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '0.45rem 0.75rem 0.45rem 2rem', color: 'white', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          placeholder="Search college..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {filtered.map((c, i) => (
                        <button key={i} type="button"
                          onClick={() => {
                            setSelectedCollege(c);
                            setShowDrop(false);
                            setSearch('');
                            setEmail('');
                            setEmailError('');
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.65rem 1rem', background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                            borderBottom: '1px solid rgba(255,255,255,0.04)'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.12)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#e8e8f0' }}>{c.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#8892a4', marginTop: '0.1rem' }}>@{c.emailDomain}</div>
                          </div>
                          <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', padding: '0.15rem 0.5rem', borderRadius: 5, fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>{c.shortName}</span>
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#5a6478', fontSize: '0.82rem' }}>No results</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedCollege && (
                <div style={{ fontSize: '0.72rem', color: '#a78bfa', marginTop: '0.3rem' }}>
                  📧 Format: yourname.branch24@{selectedCollege.emailDomain}
                </div>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">College Email ID *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a6478' }} />
                <input className="input" style={{ paddingLeft: '2.2rem' }}
                  type="email"
                  placeholder={selectedCollege ? `e.g. name.cs24@${selectedCollege.emailDomain}` : 'Select college first'}
                  value={email}
                  disabled={!selectedCollege}
                  onChange={e => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value, selectedCollege);
                  }}
                />
              </div>
              {emailError && <div style={{ color: '#f87171', fontSize: '0.73rem', marginTop: '0.3rem' }}>⚠ {emailError}</div>}
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a6478' }} />
                <input className="input" style={{ paddingLeft: '2.2rem' }}
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.7rem' }} disabled={loading}>
              {loading ? 'Creating account...' : <><ArrowRight size={16} /> Create Account — It's Free</>}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: '#5a6478' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700 }}>Sign In →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
