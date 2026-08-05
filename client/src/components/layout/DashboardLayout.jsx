import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main className="main-content">
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          alignItems: 'center', gap: '1rem',
          padding: '0.6rem 1rem',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          position: 'sticky', top: 0, zIndex: 50,
        }}
          className="mobile-topbar"
        >
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.4rem', color: 'white', borderColor: '#334155' }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>
            Touch<span style={{ color: '#93c5fd' }}>WithSeniors</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
