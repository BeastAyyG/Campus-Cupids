import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import InstallPrompt from './components/InstallPrompt';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OpenToTalk = lazy(() => import('./pages/OpenToTalk'));
const Chat = lazy(() => import('./pages/Chat'));
const Crush = lazy(() => import('./pages/Crush'));
const Friendship = lazy(() => import('./pages/Friendship'));
const GroupChat = lazy(() => import('./pages/GroupChat'));
const Profile = lazy(() => import('./pages/Profile'));
const Buzz = lazy(() => import('./pages/Buzz'));
const Notifications = lazy(() => import('./pages/Notifications'));

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full">
      <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/open-to-talk" element={<PrivateRoute><OpenToTalk /></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/chat/:chatId" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/crush" element={<PrivateRoute><Crush /></PrivateRoute>} />
                <Route path="/friendship" element={<PrivateRoute><Friendship /></PrivateRoute>} />
                <Route path="/group/:groupId" element={<PrivateRoute><GroupChat /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/buzz" element={<PrivateRoute><Buzz /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
            <InstallPrompt />
          </Layout>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
