import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare, BookOpen, Users, Briefcase, Star,
  User, LogOut, Shield, Code2, Video, X, ShoppingBag
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: MessageSquare, label: 'Ask Query',         to: '/dashboard/queries' },
  { icon: BookOpen,      label: 'Free Resources',    to: '/dashboard/resources' },
  { icon: Users,         label: 'Mentor Sessions',   to: '/dashboard/mentor-sessions' },
  { icon: Code2,         label: 'DSA Basics',        to: '/dashboard/dsa' },
  { icon: Video,         label: 'Mock Interview',    to: '/dashboard/mock-interview' },
  { icon: Briefcase,     label: 'Off Campus Jobs',   to: '/dashboard/opportunities' },
  { icon: Star,          label: 'Interview Exp.',    to: '/dashboard/experiences' },
  { icon: ShoppingBag,   label: 'Marketplace 🛒',    to: '/dashboard/marketplace' },
];

function getAcademicYear(passoutYear) {
  if (!passoutYear) return '';
  const now = new Date();
  const yr = now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const diff = passoutYear - yr;
  if (diff === 4) return '1st Year';
  if (diff === 3) return '2nd Year';
  if (diff === 2) return 'Pre-Final';
  if (diff === 1) return 'Final Year';
  return 'Alumni';
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const year = getAcademicYear(user?.passoutYear);

  const Content = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ fontSize: '1.1rem' }}>🎓</div>
        <div>
          <div className="sidebar-logo-text">Touch<span>WithSeniors</span></div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>Placement Platform</div>
        </div>
        {mobileOpen !== undefined && (
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* User card */}
      {user && (
        <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.82rem' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {year && `${year} · `}{user.college?.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
            {user.role === 'admin'  && <span className="badge badge-purple" style={{ fontSize: '0.58rem' }}>Admin</span>}
            {user.role === 'senior' && <span className="badge badge-green"  style={{ fontSize: '0.58rem' }}>Senior</span>}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        <div className="sidebar-section-label">Platform</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to} to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0.5rem' }} />

        {isAdmin && (
          <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Shield size={16} />
            <span style={{ flex: 1 }}>Admin Panel</span>
            <span className="badge badge-purple" style={{ fontSize: '0.58rem' }}>Admin</span>
          </NavLink>
        )}

        <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <User size={16} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* College badge at bottom */}
      {user?.college && (
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.67rem', color: 'var(--text-dim)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏫 {user.college}
          </div>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" style={{ width: '100%', color: '#f87171', border: 'none', cursor: 'pointer' }} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <Content />
      </aside>
      {mobileOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)' }} onClick={onClose} />
          <aside className="sidebar open" style={{ display: 'flex', flexDirection: 'column', zIndex: 100, transform: 'none', position: 'fixed' }}>
            <Content />
          </aside>
        </>
      )}
    </>
  );
}
