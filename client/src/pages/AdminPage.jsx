import { useState, useEffect } from 'react';
import { Users, FileText, BookOpen, Briefcase, Star, Trash2, CheckCircle, X, Shield, Video, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, mentorSessionsAPI, resourcesAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const TABS = ['Overview', 'Users', 'Queries', 'Resources', 'Mentor Sessions'];

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

  useEffect(() => {
    const load = async () => {
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
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  const handleApproveResource = async (id) => {
    try {
      await resourcesAPI.approve(id);
      setPendingResources(prev => prev.filter(r => r._id !== id));
      toast.success('Resource approved! ✅');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteQuery = async (id) => {
    try {
      await adminAPI.deleteQuery(id);
      setQueries(prev => prev.filter(q => q._id !== id));
      toast.success('Query deleted');
    } catch { toast.error('Failed'); }
  };

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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  const pendingMentors = mentorSessions.filter(s => s.status === 'pending');
  const STAT_CARDS = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: '#1d4ed8' },
    { label: 'New (7 days)', value: analytics.recentUsers, icon: Users, color: '#16a34a' },
    { label: 'Total Queries', value: analytics.totalQueries, icon: FileText, color: '#7c3aed' },
    { label: 'Resources', value: analytics.totalResources, icon: BookOpen, color: '#0e7490' },
    { label: 'Pending Resources', value: analytics.pendingResources, icon: BookOpen, color: '#d97706' },
    { label: 'Opportunities', value: analytics.totalOpportunities, icon: Briefcase, color: '#db2777' },
    { label: 'Experiences', value: analytics.totalExperiences, icon: Star, color: '#9333ea' },
    { label: 'Mentor Requests', value: pendingMentors.length, icon: Video, color: '#d97706' },
  ] : [];

  const STATUS_BADGE = {
    pending: 'badge-orange',
    approved: 'badge-green',
    rejected: 'badge-red',
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield size={20} color="#1d4ed8" />
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">Manage users, content, mentor sessions, and platform data</div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab ? '#eff6ff' : 'transparent',
              color: activeTab === tab ? '#1d4ed8' : '#64748b'
            }}>
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

        {/* OVERVIEW */}
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
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#1a202c' }}>🏫 Top Colleges</div>
                {analytics.collegeStats.filter(c => c._id).slice(0, 8).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#374151', minWidth: '200px' }}>{c._id}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${(c.count / analytics.totalUsers) * 100}%` }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a202c', minWidth: '24px' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'Users' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th><th>College</th><th>Role</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem', background: '#1d4ed8', flexShrink: 0 }}>
                          {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.college?.split(' ').slice(0, 3).join(' ')}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '5px', color: '#374151', padding: '0.25rem 0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        <option value="student">student</option>
                        <option value="senior">senior</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.75rem' }}>
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

        {/* QUERIES */}
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
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{q.author?.name}</td>
                    <td style={{ fontSize: '0.82rem' }}>{q.upvotes?.length || 0}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
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

        {/* RESOURCES */}
        {activeTab === 'Resources' && (
          <div>
            {pendingResources.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={42} color="#16a34a" />
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>All clear! No pending resources.</p>
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
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>{r.description}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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

        {/* MENTOR SESSIONS */}
        {activeTab === 'Mentor Sessions' && (
          <div>
            {/* Approve modal */}
            {approveId && (
              <div className="modal-overlay">
                <div className="modal" style={{ maxWidth: '500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Set Google Meet Details</div>
                    <button onClick={() => setApproveId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
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
              <div className="empty-state">
                <Video size={40} />
                <p style={{ marginTop: '0.5rem' }}>No mentor session requests yet</p>
              </div>
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
                        <div style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '0.25rem' }}>
                          📚 {s.expertise}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📅 Preferred: {s.preferredDate} at {s.preferredTime} · 📞 {s.contact}
                        </div>
                        {s.description && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{s.description}</div>}
                        {s.status === 'approved' && s.googleMeetLink && (
                          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.3rem' }}>
                            ✅ Meet: <a href={s.googleMeetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>{s.googleMeetLink}</a> · {s.confirmedDate} {s.confirmedTime}
                          </div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Submitted by: {s.submittedBy?.name} ({s.submittedBy?.email})
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {s.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => { setApproveId(s._id); }}>
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectMentor(s._id)}>
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMentor(s._id)} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
