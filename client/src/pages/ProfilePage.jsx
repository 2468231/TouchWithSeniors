import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, GraduationCap, Building2, Edit3, Check, X,
  Lock, Eye, EyeOff, MessageSquare, BookOpen, Users, Award,
  Calendar, Shield, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────
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

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function roleBadge(role) {
  const map = {
    admin: 'badge-red',
    senior: 'badge-orange',
    junior: 'badge-purple',
  };
  return map[role] || 'badge-purple';
}

// ─── Toast component ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 12, padding: '0.75rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            color: type === 'success' ? '#86efac' : '#fca5a5',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: 340,
          }}
        >
          {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span style={{ fontSize: '0.875rem', flex: 1 }}>{message}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPassForm, setShowPassForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return showToast('Name cannot be empty.', 'error');
    setSavingProfile(true);
    try {
      const res = await usersAPI.updateProfile({ name: editName.trim(), bio: editBio.trim() });
      updateUser(res.data?.user || { name: editName.trim(), bio: editBio.trim() });
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setEditBio(user?.bio || '');
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return showToast('All password fields are required.', 'error');
    if (newPw !== confirmPw) return showToast('New passwords do not match.', 'error');
    if (newPw.length < 6) return showToast('New password must be at least 6 characters.', 'error');
    setSavingPw(true);
    try {
      await usersAPI.updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPassForm(false);
      showToast('Password changed successfully!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const academicYear = getAcademicYear(user?.passoutYear);

  const stats = [
    { icon: MessageSquare, label: 'Queries Posted', value: user?.stats?.queriesPosted ?? 0, color: '#6c63ff' },
    { icon: BookOpen, label: 'Resources Shared', value: user?.stats?.resourcesShared ?? 0, color: '#f857a6' },
    { icon: Award, label: 'Interviews Shared', value: user?.stats?.interviewsCompleted ?? 0, color: '#00d9ff' },
  ];

  const fadeUp = { hidden: { opacity: 0, y: 18 }, show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }) };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>

        {/* ── Profile Header ────────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(248,87,166,0.06))',
            border: '1px solid var(--color-border)',
            borderRadius: 24, padding: '2.25rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', position: 'relative', marginBottom: '1.5rem',
            overflow: 'hidden',
          }}
        >
          {/* Background orb */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 250, height: 250,
            background: 'radial-gradient(circle, rgba(248,87,166,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -60, width: 250, height: 250,
            background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c63ff, #f857a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 0 40px rgba(108,99,255,0.45)',
            marginBottom: '1.25rem', position: 'relative',
          }}>
            {initials}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 18, height: 18, borderRadius: '50%',
              background: '#22c55e', border: '2px solid var(--color-bg)',
            }} />
          </div>

          {/* Name */}
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user?.name || 'Your Name'}</h1>

          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {academicYear && (
              <span className="badge badge-purple"><GraduationCap size={11} /> {academicYear}</span>
            )}
            {user?.role && (
              <span className={`badge ${roleBadge(user.role)}`}>
                <Shield size={11} /> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </div>

          {/* College + Department */}
          <div style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
            {user?.college && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={13} /> {user.college}
              </div>
            )}
            {user?.department && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.department}</div>
            )}
          </div>

          {/* Bio */}
          {user?.bio && !editing && (
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 500, lineHeight: 1.65, fontStyle: 'italic' }}>
              "{user.bio}"
            </p>
          )}

          {/* Edit Button */}
          {!editing && (
            <button
              className="btn-secondary"
              style={{ marginTop: '1.25rem' }}
              onClick={() => setEditing(true)}
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          )}

          {/* Inline Edit Form */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ width: '100%', maxWidth: 480, marginTop: '1.25rem', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="label" style={{ textAlign: 'left' }}>Full Name</label>
                    <input
                      className="input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="label" style={{ textAlign: 'left' }}>Bio</label>
                    <textarea
                      className="input"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      placeholder="A short bio about yourself..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" onClick={handleCancelEdit} disabled={savingProfile}>
                      <X size={15} /> Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={15} />}
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        >
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div className="stat-icon" style={{ background: `${color}18` }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Account Info ──────────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="card" style={{ marginBottom: '1.5rem' }}
        >
          <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
            <User size={17} color="#6c63ff" /> Account Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <InfoRow icon={<Mail size={15} />} label="Email" value={user?.email} />
            <InfoRow icon={<Shield size={15} />} label="Role" value={
              <span className={`badge ${roleBadge(user?.role)}`}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
              </span>
            } />
            <InfoRow icon={<Calendar size={15} />} label="Member Since" value={formatDate(user?.createdAt)} />
            <InfoRow icon={<GraduationCap size={15} />} label="Passout Year" value={user?.passoutYear || '—'} />
          </div>
        </motion.div>

        {/* ── Password Change ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPassForm ? '1.25rem' : 0 }}>
            <h2 className="section-title">
              <Lock size={17} color="#f857a6" /> Change Password
            </h2>
            <button
              className={showPassForm ? 'btn-ghost' : 'btn-secondary'}
              onClick={() => setShowPassForm(v => !v)}
              style={{ fontSize: '0.8rem' }}
            >
              {showPassForm ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Change</>}
            </button>
          </div>

          <AnimatePresence>
            {showPassForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <PasswordField
                    label="Current Password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    show={showCurrentPw}
                    onToggle={() => setShowCurrentPw(v => !v)}
                    placeholder="Enter current password"
                  />
                  <PasswordField
                    label="New Password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    show={showNewPw}
                    onToggle={() => setShowNewPw(v => !v)}
                    placeholder="Enter new password (min 6 chars)"
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    show={showConfirmPw}
                    onToggle={() => setShowConfirmPw(v => !v)}
                    placeholder="Confirm new password"
                  />
                  <button
                    className="btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                    onClick={handleChangePassword}
                    disabled={savingPw}
                  >
                    {savingPw ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Lock size={15} />}
                    Update Password
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ color: 'var(--color-text-muted)', width: 20, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', width: 120, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          className="input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: '2.75rem' }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
