import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Events from './pages/Events';
import News from './pages/News';
import LiveSessions from './pages/LiveSessions';
import Team from './pages/Team';

import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import GuestDashboard from './pages/GuestDashboard';

import CertificatesPage from './pages/CertificatesPage';
import StudentHomework from './pages/StudentHomework';
import SpecialRequestForm from './pages/SpecialRequestForm';
import FeedbackPage from './pages/FeedbackPage';

import StudentSignUp from './pages/StudentSignUp';
import MentorSignUp from './pages/MentorSignUp';
import VolunteerSignUp from './pages/VolunteerSignUp';
import Login from './pages/Login';
import Contact from './pages/Contact';

// Helper component: Page change hone par automatically scroll to top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Guard for authenticated access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>लोड हो रहा है...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.trim().toLowerCase() || '';
  const normalizedAllowed = allowedRoles.map((r) => r.trim().toLowerCase());

  if (allowedRoles && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Guard for Login Route (Logged-in users won't see Login Page again)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

// Auto-redirect router for base '/dashboard'
const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>लोड हो रहा है...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.trim().toLowerCase() || '';

  if (role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
  if (role === 'mentor') return <Navigate to="/dashboard/mentor" replace />;
  if (role === 'guest') return <Navigate to="/dashboard/guest" replace />;
  return <Navigate to="/dashboard/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<Events />} />
            <Route path="/programs" element={<Navigate to="/live-sessions" replace />} />
            <Route path="/classes" element={<Navigate to="/live-sessions" replace />} />
            <Route path="/live-sessions" element={<LiveSessions />} />
            <Route path="/team" element={<Team />} />

            {/* Authentication & Registration */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route path="/student-signup" element={<StudentSignUp />} />
            <Route path="/mentor-signup" element={<MentorSignUp />} />
            <Route path="/volunteer-signup" element={<VolunteerSignUp />} />

            {/* Base /dashboard URL hit hone par Auto-redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Role-Specific Dashboards */}
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor-dashboard"
              element={<Navigate to="/dashboard/mentor" replace />}
            />

            <Route
              path="/dashboard/volunteer"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guest"
              element={<ProtectedRoute allowedRoles={['guest']}><GuestDashboard /></ProtectedRoute>}
            />
            <Route
              path="/volunteer-dashboard"
              element={<Navigate to="/dashboard/volunteer" replace />}
            />

            {/* Additional Features & Pages */}
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/homework" element={<StudentHomework />} />
            <Route path="/help-request" element={<SpecialRequestForm />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/contact" element={<Contact />} />

            {/* Wildcard 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;