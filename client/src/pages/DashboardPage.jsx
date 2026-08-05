import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, BookOpen, Users, Briefcase,
  TrendingUp, ChevronRight, ThumbsUp, Clock,
  ExternalLink, Sparkles, GraduationCap, Building2,
  ArrowRight, Quote, Star, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { queriesAPI, opportunitiesAPI, resourcesAPI } from '../services/api';

// ─── Helpers ───────────────────────────────────────────────────────────────
function getAcademicYear(passoutYear) {
  if (!passoutYear) return null;
  const now = new Date();
  const month = now.getMonth() + 1;
  const currentAcademic = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const diff = passoutYear - currentAcademic;
  if (diff === 4) return 'First Year';
  if (diff === 3) return 'Second Year';
  if (diff === 2) return 'Pre-Final Year';
  if (diff === 1) return 'Final Year';
  return 'Alumni';
}

function formatDeadline(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const QUOTES = [
  { quote: 'Consistency in DSA for 3 months changed my life. Got placed at Amazon!', author: 'Rahul K., RV College 2024', company: 'Amazon' },
  { quote: "Don't wait for campus placements. Off-campus doors are always open if you prepare right.", author: 'Priya M., PES University 2024', company: 'Razorpay' },
  { quote: 'CGPA matters less than your projects and communication. Focus on both.', author: 'Arjun R., MSRIT 2023', company: 'Flipkart' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' } }),
};

// ─── Sub-components ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner" />
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      <Icon size={36} />
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      className="stat-card"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={delay}
      style={{ borderRadius: 16 }}
    >
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queries, setQueries] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [loadingO, setLoadingO] = useState(true);
  const [loadingR, setLoadingR] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quoteTimer = useRef(null);

  useEffect(() => {
    quoteTimer.current = setInterval(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(quoteTimer.current);
  }, []);

  useEffect(() => {
    queriesAPI.getAll({ sort: 'popular', limit: 5 })
      .then(r => setQueries(r.data?.queries || r.data || []))
      .catch(() => setQueries([]))
      .finally(() => setLoadingQ(false));
  }, []);

  useEffect(() => {
    opportunitiesAPI.getAll({ limit: 4 })
      .then(r => setOpportunities(r.data?.opportunities || r.data || []))
      .catch(() => setOpportunities([]))
      .finally(() => setLoadingO(false));
  }, []);

  useEffect(() => {
    resourcesAPI.getAll({ limit: 4 })
      .then(r => setResources(r.data?.resources || r.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoadingR(false));
  }, []);

  const academicYear = getAcademicYear(user?.passoutYear);
  const currentQuote = QUOTES[quoteIdx];

  const stats = [
    { icon: MessageSquare, label: 'Queries Posted', value: user?.stats?.queriesPosted ?? 0, color: '#6c63ff', delay: 0 },
    { icon: BookOpen, label: 'Resources Shared', value: user?.stats?.resourcesShared ?? 0, color: '#f857a6', delay: 1 },
    { icon: Users, label: 'Community Members', value: '500+', color: '#00d9ff', delay: 2 },
    { icon: Briefcase, label: 'Active Opportunities', value: opportunities.length || '—', color: '#22c55e', delay: 3 },
  ];

  const oppTypeBadge = (type) => {
    const map = { internship: 'badge-cyan', fulltime: 'badge-green', contract: 'badge-orange' };
    return map[type?.toLowerCase()] || 'badge-purple';
  };

  const clusterBadge = (cluster) => {
    const map = { DSA: 'badge-purple', System: 'badge-cyan', Web: 'badge-pink', ML: 'badge-orange' };
    for (const k of Object.keys(map)) {
      if (cluster?.toLowerCase().includes(k.toLowerCase())) return map[k];
    }
    return 'badge-purple';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Welcome Card ─────────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(248,87,166,0.07) 60%, var(--color-bg-card) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* glow orb */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c63ff, #f857a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 30px rgba(108,99,255,0.4)',
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}!</span>
              </h1>
              {academicYear && (
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  <GraduationCap size={11} /> {academicYear}
                </span>
              )}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={14} />
              {user?.college || 'Your College'} {user?.department ? `· ${user.department}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Class of {user?.passoutYear || '—'}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i} />
        ))}
      </div>

      {/* ── Senior Insight Quote ─────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" custom={1}
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(248,87,166,0.06))',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: 18,
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Quote size={32} color="rgba(108,99,255,0.3)" style={{ position: 'absolute', top: 16, right: 20 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Senior Insight
          </span>
        </div>
        <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text)', lineHeight: 1.7, maxWidth: 680 }}>
          "{currentQuote.quote}"
        </p>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            — <strong style={{ color: 'var(--color-text)' }}>{currentQuote.author}</strong>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{currentQuote.company}</span>
        </div>
        {/* Quote dots */}
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem' }}>
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setQuoteIdx(i)}
              style={{
                width: quoteIdx === i ? 20 : 6,
                height: 6, borderRadius: 3,
                background: quoteIdx === i ? '#6c63ff' : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>

        {/* ── Trending Queries ──────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title"><TrendingUp size={18} color="#6c63ff" /> Trending Queries</h2>
            <button onClick={() => navigate('/dashboard/queries')} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
            {loadingQ ? <Spinner /> : queries.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No trending queries yet." />
            ) : queries.map((q, i) => (
              <div
                key={q._id || i}
                onClick={() => navigate(`/dashboard/queries/${q._id}`)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: i < queries.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.4 }}>
                  {q.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(q.tags || []).slice(0, 2).map(tag => (
                    <span key={tag} className="tag-chip" style={{ fontSize: '0.68rem' }}>{tag}</span>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <ThumbsUp size={12} /> {q.upvotes?.length ?? q.upvoteCount ?? 0}
                    </span>
                    {q.author?.name && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {q.author.name}
                        {q.author.college ? ` · ${q.author.college.split(' ').slice(0, 2).join(' ')}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Latest Opportunities ──────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title"><Briefcase size={18} color="#22c55e" /> Latest Opportunities</h2>
            <button onClick={() => navigate('/dashboard/opportunities')} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loadingO ? <Spinner /> : opportunities.length === 0 ? (
              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1rem' }}>
                <EmptyState icon={Briefcase} message="No opportunities posted yet." />
              </div>
            ) : opportunities.map((opp, i) => (
              <div
                key={opp._id || i}
                className="opp-card"
                onClick={() => navigate('/dashboard/opportunities')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opp.role || opp.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{opp.company}</div>
                  </div>
                  <span className={`badge ${oppTypeBadge(opp.type)}`} style={{ whiteSpace: 'nowrap' }}>
                    {opp.type || 'Opportunity'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <Clock size={12} />
                  Deadline: {formatDeadline(opp.deadline)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Resources ──────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title"><BookOpen size={18} color="#f857a6" /> Recent Resources</h2>
            <button onClick={() => navigate('/dashboard/resources')} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {loadingR ? <Spinner /> : resources.length === 0 ? (
              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1rem' }}>
                <EmptyState icon={BookOpen} message="No resources yet." />
              </div>
            ) : resources.map((res, i) => (
              <div
                key={res._id || i}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12, padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.15s', cursor: 'pointer',
                }}
                onClick={() => res.link && window.open(res.link, '_blank')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,87,166,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.title}
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className={`badge ${clusterBadge(res.cluster)}`} style={{ fontSize: '0.68rem' }}>
                      {res.cluster || 'General'}
                    </span>
                  </div>
                </div>
                {res.link && <ExternalLink size={15} color="var(--color-text-muted)" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            <Sparkles size={18} color="#f59e0b" /> Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Ask a Query', desc: 'Post a question for seniors', path: '/dashboard/queries', color: '#6c63ff', Icon: MessageSquare },
              { label: 'Share a Resource', desc: 'Help the community learn', path: '/dashboard/resources', color: '#f857a6', Icon: BookOpen },
              { label: 'View Opportunities', desc: 'Find internships & jobs', path: '/dashboard/opportunities', color: '#22c55e', Icon: Briefcase },
              { label: 'Practice DSA', desc: 'Sharpen your coding skills', path: '/dashboard/dsa', color: '#00d9ff', Icon: TrendingUp },
            ].map(({ label, desc, path, color, Icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12, padding: '0.9rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{desc}</div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
