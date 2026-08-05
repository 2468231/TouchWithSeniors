import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import AskQueryPage from './pages/AskQueryPage';
import ResourcesPage from './pages/ResourcesPage';
import MentorSessionsPage from './pages/MentorSessionsPage';
import DSABasicsPage from './pages/DSABasicsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ExperiencesPage from './pages/ExperiencesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import MarketplacePage from './pages/MarketplacePage';
import DashboardLayout from './components/layout/DashboardLayout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard/queries" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard/queries" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected - Dashboard Layout (no home page - go directly to queries) */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard/queries" replace />} />
        <Route path="queries" element={<AskQueryPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="mentor-sessions" element={<MentorSessionsPage />} />
        <Route path="dsa" element={<DSABasicsPage />} />
        <Route path="mock-interview" element={<MockInterviewPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="experiences" element={<ExperiencesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,26,0.97)',
              color: '#e8e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0f0f1a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0f0f1a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
