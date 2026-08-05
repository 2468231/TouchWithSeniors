import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ThumbsUp, Star, X, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { experiencesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const DIFFICULTY_COLORS = { easy: 'badge-green', medium: 'badge-orange', hard: 'badge-red' };
const RESULT_COLORS = { selected: 'badge-green', rejected: 'badge-red', pending: 'badge-orange' };

function ExpCard({ exp, onUpvote }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const isUpvoted = user && exp.upvotes?.some(u => u === user.id || u?._id === user.id);
  const initials = exp.author?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{exp.company}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{exp.role} · {exp.year}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${DIFFICULTY_COLORS[exp.difficulty]}`}>{exp.difficulty}</span>
          <span className={`badge ${RESULT_COLORS[exp.result]}`}>{exp.result}</span>
          {exp.interviewType && <span className="badge badge-purple">{exp.interviewType}</span>}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Process</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.7, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}>
          {exp.process}
        </p>
      </div>

      {expanded && (
        <>
          {exp.questions?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions Asked</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {exp.questions.map((q, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', paddingLeft: '1rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#a78bfa' }}>•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exp.tips && (
            <div style={{ marginBottom: '0.75rem', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', marginBottom: '0.35rem' }}>💡 Tips from the author</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{exp.tips}</p>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>{initials}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {exp.author?.name} · {exp.author?.college?.split(' ')[0]}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#4a4a5a' }}>
            {exp.createdAt && formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`upvote-btn ${isUpvoted ? 'active' : ''}`}
            onClick={() => onUpvote(exp._id)}
          >
            <ThumbsUp size={13} /> {exp.upvotes?.length || 0}
          </button>
          <button className="upvote-btn" onClick={() => setExpanded(v => !v)}>
            <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperiencesPage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', interviewType: 'fulltime', process: '',
    questions: '', tips: '', difficulty: 'medium', result: 'selected'
  });

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await experiencesAPI.getAll({ search: search || undefined });
      setExperiences(res.data.experiences || []);
      setTopCompanies(res.data.topCompanies || []);
    } catch {
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const handleUpvote = async (id) => {
    if (!user) { toast.error('Please login to upvote'); return; }
    try {
      await experiencesAPI.upvote(id);
      setExperiences(prev => prev.map(e => {
        if (e._id !== id) return e;
        const isUpvoted = e.upvotes?.some(u => u === user.id || u?._id === user.id);
        return { ...e, upvotes: isUpvoted ? e.upvotes.filter(u => (u?._id || u) !== user.id) : [...(e.upvotes || []), user.id] };
      }));
    } catch { toast.error('Failed to upvote'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to share'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        questions: form.questions.split('\n').map(q => q.trim()).filter(Boolean)
      };
      const res = await experiencesAPI.create(payload);
      setExperiences(prev => [res.data.experience, ...prev]);
      setForm({ company: '', role: '', interviewType: 'fulltime', process: '', questions: '', tips: '', difficulty: 'medium', result: 'selected' });
      setShowForm(false);
      toast.success('Experience shared! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to share');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Interview Experiences ⭐</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Real experiences from placed students</p>
          </div>
          {user && (
            <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Share Experience</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Top Companies */}
        {topCompanies.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-title" style={{ marginBottom: '0.75rem' }}>🏆 Top Companies</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {topCompanies.map(c => (
                <button key={c._id} className="tag-chip" onClick={() => setSearch(c._id)} style={{ gap: '0.5rem' }}>
                  {c._id} <span style={{ color: '#6c63ff' }}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Share form */}
        {showForm && (
          <motion.div className="card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Share Your Interview Experience</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" placeholder="e.g. Google, Infosys" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Role Applied For</label>
                  <input className="input" placeholder="e.g. SDE-1, Intern" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Interview Type</label>
                  <select className="input" value={form.interviewType} onChange={e => setForm(f => ({ ...f, interviewType: e.target.value }))}>
                    <option value="fulltime">Full Time</option>
                    <option value="internship">Internship</option>
                    <option value="ppo">PPO</option>
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="label">Result</label>
                  <select className="input" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                    <option value="selected">Selected ✅</option>
                    <option value="rejected">Rejected ❌</option>
                    <option value="pending">Pending ⏳</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Interview Process (describe each round)</label>
                <textarea className="input" style={{ minHeight: '120px' }} placeholder="Round 1: Online Assessment - 2 coding questions (Easy, Medium)&#10;Round 2: Technical - Linked list, Trees, OOPs&#10;Round 3: HR - Why this company?" value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Questions Asked (one per line)</label>
                <textarea className="input" style={{ minHeight: '80px' }} placeholder="Two Sum&#10;LRU Cache&#10;Design a parking lot" value={form.questions} onChange={e => setForm(f => ({ ...f, questions: e.target.value }))} />
              </div>
              <div>
                <label className="label">Tips for Future Candidates</label>
                <textarea className="input" placeholder="Focus on STAR format, practice communication..." value={form.tips} onChange={e => setForm(f => ({ ...f, tips: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
                {submitting ? 'Sharing...' : 'Share Experience 🚀'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" style={{ paddingLeft: '2.5rem' }} placeholder="Search by company..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Experiences list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : experiences.length === 0 ? (
          <div className="empty-state">
            <Star size={48} />
            <h3 style={{ marginTop: '1rem', color: 'white' }}>No experiences yet</h3>
            <p>Share yours and help the community!</p>
          </div>
        ) : (
          experiences.map(exp => <ExpCard key={exp._id} exp={exp} onUpvote={handleUpvote} />)
        )}
      </div>
    </div>
  );
}
