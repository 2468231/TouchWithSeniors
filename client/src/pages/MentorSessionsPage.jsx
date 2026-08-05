import { useState, useEffect } from 'react';
import { Plus, X, Calendar, Clock, Phone, User, Video, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { mentorSessionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

function formatDate(d) {
  if (!d) return '';
  try { return format(new Date(d), 'dd-MMM-yyyy'); } catch { return d; }
}

function SessionCard({ session }) {
  const isApproved = session.status === 'approved';
  const isPending  = session.status === 'pending';
  const initials = session.seniorName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  return (
    <div className={`session-card ${session.status}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.82rem', background: isApproved ? '#16a34a' : '#d97706' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a202c' }}>{session.seniorName}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {session.submittedBy?.college?.split(' ').slice(0, 3).join(' ')}
            </div>
          </div>
        </div>
        <span className={`badge ${isApproved ? 'badge-green' : isPending ? 'badge-orange' : 'badge-red'}`}>
          {isApproved ? '✅ Confirmed' : isPending ? '⏳ Pending' : '❌ Rejected'}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1d4ed8', marginBottom: '0.5rem' }}>
        📚 {session.expertise}
      </div>

      {session.description && (
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          {session.description}
        </p>
      )}

      {/* Session details */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
        {isApproved && session.confirmedDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#374151' }}>
            <Calendar size={14} color="#16a34a" /> {session.confirmedDate}
          </div>
        )}
        {isApproved && session.confirmedTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#374151' }}>
            <Clock size={14} color="#16a34a" /> {session.confirmedTime}
          </div>
        )}
        {isPending && session.preferredDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
            <Calendar size={14} /> Preferred: {session.preferredDate} at {session.preferredTime}
          </div>
        )}
      </div>

      {/* Google Meet link */}
      {isApproved && session.googleMeetLink && (
        <a
          href={session.googleMeetLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '6px',
            background: '#1d4ed8', color: 'white',
            textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
            transition: 'background 0.15s'
          }}
        >
          <Video size={15} /> Join Google Meet
        </a>
      )}

      {isApproved && session.adminNote && (
        <div className="alert alert-success" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
          📌 Note from admin: {session.adminNote}
        </div>
      )}
    </div>
  );
}

export default function MentorSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    seniorName: user?.name || '',
    contact: '',
    expertise: '',
    preferredDate: '',
    preferredTime: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    mentorSessionsAPI.getAll({ status: 'approved' }).then(res => {
      setSessions(res.data.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to request a session'); return; }
    setSubmitting(true);
    try {
      const res = await mentorSessionsAPI.create(form);
      setSubmitted(true);
      setShowForm(false);
      toast.success('Session request sent! Admin will review and create the Google Meet link. 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">Mentor Sessions 🎓</div>
        <div className="page-subtitle">Learn directly from seniors who have been there</div>
      </div>

      <div className="page-content">
        {/* Quote Banner */}
        <div className="quote-banner" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Hey Senior! 👋
          </div>
          <div style={{ lineHeight: 1.7 }}>
            If you are a placed senior and want to take a Mentor Session — <strong>click the button below!</strong>
            Your one mentorship session can give tremendous confidence to many students preparing for placements.
            <strong> One session from you = hundreds of students benefited.</strong> 💪
          </div>
        </div>

        {/* Submit request button */}
        {user && !submitted && (
          <button
            className="btn btn-primary"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> I Want to Take a Mentor Session</>}
          </button>
        )}

        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle size={16} /> <strong>Request submitted!</strong> The admin will review your request and create a Google Meet link. You'll be notified soon.
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#1a202c' }}>
              Request a Mentor Session
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Fill in your details. The website owner will review and schedule a Google Meet session.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" placeholder="Full name" value={form.seniorName} onChange={e => setForm(f => ({ ...f, seniorName: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Contact Number (WhatsApp)</label>
                  <input className="input" type="tel" placeholder="10-digit number" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Topic / Expertise</label>
                  <input className="input" placeholder="e.g. DSA, HR Round, System Design, Resume" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} required />
                </div>
                <div />
                <div>
                  <label className="label">Preferred Date</label>
                  <input className="input" type="date" min={new Date().toISOString().split('T')[0]} value={form.preferredDate} onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Preferred Time</label>
                  <input className="input" type="time" value={form.preferredTime} onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))} required />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Brief Description (optional)</label>
                <textarea
                  className="input"
                  placeholder="Tell students what they'll learn from this session, your background, company you're placed in..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
                <AlertCircle size={14} /> After reviewing, the admin will create a Google Meet link and it will be displayed here for all students. Your contact number will be used only for coordination.
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending request...' : 'Send Session Request 🚀'}
              </button>
            </form>
          </div>
        )}

        {/* How it works */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c', marginBottom: '0.75rem' }}>📋 How It Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {[
              { step: '1', icon: '📝', text: 'Senior submits session request with date, time & topic' },
              { step: '2', icon: '👀', text: 'Admin reviews and creates a Google Meet link' },
              { step: '3', icon: '📢', text: 'Session is displayed here for all students to join' },
              { step: '4', icon: '🤝', text: 'Students join and learn from the senior\'s experience' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.7rem', marginBottom: '0.3rem' }}>STEP {s.step}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a202c', marginBottom: '0.75rem' }}>
          📅 Upcoming Mentor Sessions ({sessions.length})
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <Video size={40} />
            <p style={{ marginTop: '0.5rem' }}>No upcoming sessions yet.</p>
            <p style={{ fontSize: '0.82rem' }}>
              Are you a placed senior? Click the button above to schedule one! 🎓
            </p>
          </div>
        ) : (
          sessions.map(s => <SessionCard key={s._id} session={s} />)
        )}
      </div>
    </div>
  );
}
