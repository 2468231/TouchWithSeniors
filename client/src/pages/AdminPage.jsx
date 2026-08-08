import { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, BookOpen, Briefcase, Star, Trash2,
  CheckCircle, X, Shield, Video, AlertCircle, PlusCircle, Palette,
  Link as LinkIcon, Upload, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, mentorSessionsAPI, resourcesAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

// ── CSS variable names the Theme tab can control ──────────────────────────
const THEME_VARS = {
  '--primary':       'Primary Color',
  '--primary-light': 'Primary Light',
  '--accent':        'Accent Color',
  '--green':         'Success Color',
  '--orange':        'Warning Color',
  '--pink':          'Highlight Color',
};

const PRESETS = [
  { name: '🟣 Violet (Default)', primary: '#7c3aed', light: '#8b5cf6', accent: '#06b6d4' },
  { name: '🔵 Ocean Blue',       primary: '#2563eb', light: '#3b82f6', accent: '#0ea5e9' },
  { name: '🟢 Forest Green',     primary: '#059669', light: '#10b981', accent: '#0d9488' },
  { name: '🔴 Rose Red',         primary: '#e11d48', light: '#f43f5e', accent: '#f97316' },
  { name: '🟠 Sunset Orange',    primary: '#ea580c', light: '#f97316', accent: '#eab308' },
  { name: '🩷 Midnight Pink',    primary: '#9d174d', light: '#ec4899', accent: '#a855f7' },
];

const STORAGE_KEY = 'tws_theme';

function applyTheme(vars) {
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
}

function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

// ── Resource cluster/category options (mirrors ResourcesPage) ─────────────
const CLUSTERS = ['Core CS', 'AI/ML', 'Web Dev', 'App Dev', 'Data Science', 'Cybersecurity', 'Cloud', 'Career', 'Other'];
const CATEGORIES = ['Notes', 'Video', 'Course', 'Book', 'Tool', 'Article', 'Practice', 'Other'];

const TABS = ['Overview', 'Add Content', 'Users', 'Queries', 'Resources', 'Mentor Sessions', 'Theme'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [mentorSessions, setMentorSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mentor approve form
  const [approveId, setApproveId] = useState(null);
  const [meetForm, setMeetForm] = useState({ googleMeetLink: '', confirmedDate: '', confirmedTime: '', adminNote: '' });

  // Add Content form
  const [contentForm, setContentForm] = useState({
    title: '', description: '', link: '', cluster: 'Core CS', category: 'Notes', fileType: 'link',
  });
  const [contentFile, setContentFile] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Theme state
  const [themeVars, setThemeVars] = useState(() => {
    const saved = loadSavedTheme();
    return saved || {
      '--primary':       '#7c3aed',
      '--primary-light': '#8b5cf6',
      '--accent':        '#06b6d4',
      '--green':         '#10b981',
      '--orange':        '#f59e0b',
      '--pink':          '#ec4899',
    };
  });

  // Apply saved theme on mount
  useEffect(() => {
    const saved = loadSavedTheme();
    if (saved) applyTheme(saved);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [an, us, qu, pr, ms] = await Promise.all([
        adminAPI.analytics(),
        adminAPI.getUsers(),
        adminAPI.getQueries(),
        adminAPI.getPendingResources(),
        mentorSessionsAPI.getAllAdmin(),
      ]);
      setAnalytics(an.data);
      setUsers(us.data.users || []);
      setQueries(qu.data.queries || []);
      setPendingResources(pr.data.resources || []);
      setMentorSessions(ms.data.sessions || []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── User actions ─────────────────────────────────────────────────────────
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  // ── Resource actions ─────────────────────────────────────────────────────
  const handleApproveResource = async (id) => {
    try {
      await resourcesAPI.approve(id);
      setPendingResources(prev => prev.filter(r => r._id !== id));
      toast.success('Resource approved! ✅');
    } catch { toast.error('Failed'); }
  };

  // ── Query actions ────────────────────────────────────────────────────────
  const handleDeleteQuery = async (id) => {
    try {
      await adminAPI.deleteQuery(id);
      setQueries(prev => prev.filter(q => q._id !== id));
      toast.success('Query deleted');
    } catch { toast.error('Failed'); }
  };

  // ── Mentor session actions ───────────────────────────────────────────────
  const handleApproveMentor = async (e) => {
    e.preventDefault();
    if (!meetForm.googleMeetLink.trim()) { toast.error('Please enter Google Meet link'); return; }
    if (!meetForm.confirmedDate) { toast.error('Please enter confirmed date'); return; }
    try {
      const res = await mentorSessionsAPI.approve(approveId, meetForm);
      setMentorSessions(prev => prev.map(s => s._id === approveId ? res.data.session : s));
      setApproveId(null);
      setMeetForm({ googleMeetLink: '', confirmedDate: '', confirmedTime: '', adminNote: '' });
      toast.success('Session approved and Meet link set! 🎉');
    } catch { toast.error('Failed to approve'); }
  };

  const handleRejectMentor = async (id) => {
    if (!window.confirm('Reject this session request?')) return;
    try {
      await mentorSessionsAPI.reject(id, { adminNote: 'Request rejected by admin' });
      setMentorSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'rejected' } : s));
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await mentorSessionsAPI.delete(id);
      setMentorSessions(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  // ── Add Content (admin posts directly, auto-approved) ────────────────────
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!contentForm.title.trim()) { toast.error('Title is required'); return; }
    if (contentForm.fileType === 'link' && !contentForm.link.trim()) {
      toast.error('Link is required'); return;
    }
    if (contentForm.fileType === 'pdf' && !contentFile) {
      toast.error('Please select a PDF file'); return;
    }
    setContentLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       contentForm.title);
      fd.append('description', contentForm.description);
      fd.append('cluster',     contentForm.cluster);
      fd.append('category',    contentForm.category);
      if (contentForm.fileType === 'link') {
        fd.append('link', contentForm.link);
      } else {
        fd.append('pdf', contentFile);
      }
      const res = await resourcesAPI.create(fd);
      toast.success(res.data.message || 'Resource published! ✅');
      setContentForm({ title: '', description: '', link: '', cluster: 'Core CS', category: 'Notes', fileType: 'link' });
      setContentFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setContentLoading(false);
    }
  };

  // ── Theme ─────────────────────────────────────────────────────────────────
  const handleThemeVar = (varName, value) => {
    const updated = { ...themeVars, [varName]: value };
    setThemeVars(updated);
    document.documentElement.style.setProperty(varName, value);
  };

  const applyPreset = (preset) => {
    const updated = {
      ...themeVars,
      '--primary':       preset.primary,
      '--primary-light': preset.light,
      '--accent':        preset.accent,
    };
    setThemeVars(updated);
    applyTheme(updated);
  };

  const saveTheme = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeVars));
    applyTheme(themeVars);
    toast.success('Theme saved! It will apply every time the site loads 🎨');
  };

  const resetTheme = () => {
    localStorage.removeItem(STORAGE_KEY);
    const defaults = {
      '--primary':       '#7c3aed',
      '--primary-light': '#8b5cf6',
      '--accent':        '#06b6d4',
      '--green':         '#10b981',
      '--orange':        '#f59e0b',
      '--pink':          '#ec4899',
    };
    setThemeVars(defaults);
    applyTheme(defaults);
    toast.success('Theme reset to default');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  const pendingMentors = mentorSessions.filter(s => s.status === 'pending');
  const STAT_CARDS = analytics ? [
    { label: 'Total Users',       value: analytics.totalUsers,       color: '#1d4ed8' },
    { label: 'New (7 days)',       value: analytics.recentUsers,      color: '#16a34a' },
    { label: 'Total Queries',      value: analytics.totalQueries,     color: '#7c3aed' },
    { label: 'Resources',          value: analytics.totalResources,   color: '#0e7490' },
    { label: 'Pending Resources',  value: analytics.pendingResources, color: '#d97706' },
    { label: 'Opportunities',      value: analytics.totalOpportunities, color: '#db2777' },
    { label: 'Experiences',        value: analytics.totalExperiences, color: '#9333ea' },
    { label: 'Mentor Requests',    value: pendingMentors.length,      color: '#d97706' },
  ] : [];

  const STATUS_BADGE = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red' };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield size={20} color="var(--primary-light)" />
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">Manage users, content, branding, and platform data</div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab ? 'rgba(124,58,237,0.18)' : 'transparent',
              color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
            }}>
              {tab === 'Add Content' && <span style={{ marginRight: '0.3rem' }}>📝</span>}
              {tab === 'Theme'       && <span style={{ marginRight: '0.3rem' }}>🎨</span>}
              {tab}
              {tab === 'Resources' && pendingResources.length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: '#ef4444', color: 'white', borderRadius: '100px', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                  {pendingResources.length}
                </span>
              )}
              {tab === 'Mentor Sessions' && pendingMentors.length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: '#d97706', color: 'white', borderRadius: '100px', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                  {pendingMentors.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div>
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {STAT_CARDS.map((s, i) => (
                <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            {analytics?.collegeStats?.length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🏫 Top Colleges</div>
                {analytics.collegeStats.filter(c => c._id).slice(0, 8).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: '200px' }}>{c._id}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${(c.count / analytics.totalUsers) * 100}%` }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: '24px' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD CONTENT ────────────────────────────────────────────────────── */}
        {activeTab === 'Add Content' && (
          <div style={{ maxWidth: '680px' }}>
            <div className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <PlusCircle size={16} color="var(--primary-light)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Publish Resource / Study Note</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                As admin, resources you add are <strong style={{ color: 'var(--green)' }}>instantly published</strong> — no approval needed.
              </p>
            </div>

            <form onSubmit={handleAddContent}>
              <div className="form-section">
                {/* Title */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label className="label">Resource Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Complete DSA Cheat Sheet — Arrays & Strings"
                    value={contentForm.title}
                    onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="What does this resource cover? Who is it for?"
                    value={contentForm.description}
                    onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Cluster + Category */}
                <div className="grid-2" style={{ marginBottom: '0.9rem' }}>
                  <div>
                    <label className="label">Cluster</label>
                    <select className="input" value={contentForm.cluster} onChange={e => setContentForm(f => ({ ...f, cluster: e.target.value }))}>
                      {CLUSTERS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={contentForm.category} onChange={e => setContentForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* File Type toggle */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label className="label">Resource Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['link', 'pdf'].map(t => (
                      <button
                        type="button" key={t}
                        onClick={() => setContentForm(f => ({ ...f, fileType: t }))}
                        style={{
                          padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem',
                          fontWeight: 600, border: '1px solid',
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: contentForm.fileType === t ? 'rgba(124,58,237,0.2)' : 'transparent',
                          color: contentForm.fileType === t ? 'var(--primary-light)' : 'var(--text-muted)',
                          borderColor: contentForm.fileType === t ? 'rgba(124,58,237,0.5)' : 'var(--border)',
                        }}
                      >
                        {t === 'link' ? <><LinkIcon size={12} style={{ display:'inline', marginRight:'0.3rem' }} />URL Link</> : <><Upload size={12} style={{ display:'inline', marginRight:'0.3rem' }} />PDF Upload</>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL or PDF */}
                {contentForm.fileType === 'link' ? (
                  <div>
                    <label className="label">Resource URL *</label>
                    <input
                      className="input"
                      type="url"
                      placeholder="https://docs.google.com/... or https://youtube.com/..."
                      value={contentForm.link}
                      onChange={e => setContentForm(f => ({ ...f, link: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="label">Upload PDF *</label>
                    <div
                      className="upload-area"
                      onClick={() => document.getElementById('admin-pdf-input').click()}
                    >
                      <Upload size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {contentFile ? contentFile.name : 'Click to select PDF (max 10 MB)'}
                      </p>
                    </div>
                    <input
                      id="admin-pdf-input" type="file" accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={e => setContentFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={contentLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {contentLoading ? 'Publishing...' : '📤 Publish Now (Instantly Live)'}
              </button>
            </form>
          </div>
        )}

        {/* ── USERS ─────────────────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>User</th><th>College</th><th>Role</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem', flexShrink: 0 }}>
                          {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.college?.split(' ').slice(0, 3).join(' ')}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text)', padding: '0.25rem 0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        <option value="student">student</option>
                        <option value="senior">senior</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {u.createdAt && formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── QUERIES ───────────────────────────────────────────────────────── */}
        {activeTab === 'Queries' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Author</th><th>Votes</th><th>Posted</th><th>Action</th></tr>
              </thead>
              <tbody>
                {queries.map(q => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{q.author?.name}</td>
                    <td style={{ fontSize: '0.82rem' }}>{q.upvotes?.length || 0}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {q.createdAt && formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuery(q._id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── RESOURCES ─────────────────────────────────────────────────────── */}
        {activeTab === 'Resources' && (
          <div>
            {pendingResources.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={42} color="var(--green)" />
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>All clear! No pending resources.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                  Use the "Add Content" tab to post resources directly.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="alert alert-warning">{pendingResources.length} resource(s) waiting for review</div>
                {pendingResources.map(r => (
                  <div key={r._id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-blue">{r.cluster}</span>
                        <span className="badge badge-gray">{r.category}</span>
                        {r.fileType === 'pdf' && <span className="badge badge-orange">PDF</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{r.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{r.description}</div>
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.72rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={11} /> Preview
                        </a>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        By: {r.addedBy?.name} ({r.addedBy?.email})
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveResource(r._id)}>
                        <CheckCircle size={13} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MENTOR SESSIONS ───────────────────────────────────────────────── */}
        {activeTab === 'Mentor Sessions' && (
          <div>
            {approveId && (
              <div className="modal-overlay">
                <div className="modal" style={{ maxWidth: '500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Set Google Meet Details</div>
                    <button onClick={() => setApproveId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                  </div>
                  <form onSubmit={handleApproveMentor}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="label">Google Meet Link *</label>
                      <input className="input" type="url" placeholder="https://meet.google.com/xxx-xxx-xxx" value={meetForm.googleMeetLink} onChange={e => setMeetForm(f => ({ ...f, googleMeetLink: e.target.value }))} required />
                    </div>
                    <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                      <div>
                        <label className="label">Confirmed Date *</label>
                        <input className="input" type="date" value={meetForm.confirmedDate} onChange={e => setMeetForm(f => ({ ...f, confirmedDate: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">Confirmed Time *</label>
                        <input className="input" type="time" value={meetForm.confirmedTime} onChange={e => setMeetForm(f => ({ ...f, confirmedTime: e.target.value }))} required />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="label">Note for Students (optional)</label>
                      <input className="input" placeholder="e.g. Please join 5 min before..." value={meetForm.adminNote} onChange={e => setMeetForm(f => ({ ...f, adminNote: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary">Approve & Publish Session</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setApproveId(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {mentorSessions.length === 0 ? (
              <div className="empty-state"><Video size={40} /><p style={{ marginTop: '0.5rem' }}>No mentor session requests yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingMentors.length > 0 && (
                  <div className="alert alert-warning">
                    <AlertCircle size={15} /> {pendingMentors.length} pending session request(s) waiting for your review
                  </div>
                )}
                {mentorSessions.map(s => (
                  <div key={s._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.seniorName}</div>
                          <span className={`badge ${STATUS_BADGE[s.status] || 'badge-gray'}`}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600, marginBottom: '0.25rem' }}>📚 {s.expertise}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {s.preferredDate} at {s.preferredTime} · 📞 {s.contact}</div>
                        {s.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.description}</div>}
                        {s.status === 'approved' && s.googleMeetLink && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--green)', marginTop: '0.3rem' }}>
                            ✅ <a href={s.googleMeetLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>{s.googleMeetLink}</a> · {s.confirmedDate} {s.confirmedTime}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {s.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => setApproveId(s._id)}><CheckCircle size={13} /> Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectMentor(s._id)}><X size={13} /> Reject</button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMentor(s._id)} title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── THEME ──────────────────────────────────────────────────────────── */}
        {activeTab === 'Theme' && (
          <div style={{ maxWidth: '680px' }}>
            {/* Info banner */}
            <div className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Palette size={16} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Platform Theme Customizer</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Changes apply <strong style={{ color: 'var(--text)' }}>instantly</strong> as you pick colors.
                Click <strong style={{ color: 'var(--green)' }}>"Save Theme"</strong> to persist across page reloads.
                Theme is stored in your browser (localStorage).
              </p>
            </div>

            {/* Quick Presets */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>⚡ Quick Presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    style={{
                      padding: '0.45rem 0.9rem', borderRadius: '20px', fontSize: '0.78rem',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = p.primary + '33'; e.currentTarget.style.color = p.light; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual color pickers */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>🎨 Fine-Tune Colors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(THEME_VARS).map(([varName, label]) => (
                  <div key={varName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{varName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        display: 'inline-block', width: '28px', height: '28px',
                        borderRadius: '50%', background: themeVars[varName],
                        border: '2px solid rgba(255,255,255,0.15)',
                      }} />
                      <input
                        type="color"
                        value={themeVars[varName] || '#7c3aed'}
                        onChange={e => handleThemeVar(varName, e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '70px' }}>
                        {themeVars[varName]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live preview strip */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>👁️ Live Preview</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn btn-primary" style={{ pointerEvents: 'none' }}>Primary Button</button>
                <button className="btn btn-outline" style={{ pointerEvents: 'none' }}>Outline</button>
                <span className="badge badge-purple">Badge</span>
                <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)' }} title="Accent" />
                <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green)' }} title="Green" />
                <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--orange)' }} title="Orange" />
                <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--pink)' }} title="Pink" />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '65%' }} /></div>
              </div>
            </div>

            {/* Save / Reset */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={saveTheme} style={{ flex: 1, justifyContent: 'center' }}>
                💾 Save Theme
              </button>
              <button className="btn btn-ghost" onClick={resetTheme}>
                ↩ Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
