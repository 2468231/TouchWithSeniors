import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your college email'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim() });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate('/dashboard/queries');
    } catch (err) {
      const data = err.response?.data;
      if (data?.notFound) {
        toast.error('No account found. Please register first.');
        navigate('/register');
      } else {
        toast.error(data?.error || 'Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick admin login
  const adminLogin = async () => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email: 'admin@touchwithseniors.com' });
      login(res.data.token, res.data.user);
      navigate('/dashboard/queries');
    } catch {
      toast.error('Admin account not found. Run seed first.');
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
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: 'white' }}>
            Touch<span style={{ color: '#a78bfa' }}>WithSeniors</span>
          </div>
          <p style={{ color: '#8892a4', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Sign in with your college email
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '2rem', backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">College Email ID</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a6478' }} />
                <input
                  className="input"
                  style={{ paddingLeft: '2.2rem' }}
                  type="email"
                  placeholder="e.g. name.cs24@rvce.edu.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#5a6478', marginTop: '0.35rem' }}>
                Enter the same college email you registered with
              </div>
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.72rem' }}
              disabled={loading}>
              {loading ? 'Signing in...' : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          {/* Admin quick login */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button onClick={adminLogin} disabled={loading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6478', fontSize: '0.75rem', fontFamily: 'inherit' }}>
              🔑 Admin Login
            </button>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: '#5a6478' }}>
            New student?{' '}
            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 700 }}>Create free account →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
