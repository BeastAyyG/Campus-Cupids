import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OpenToTalk from './pages/OpenToTalk';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? <Layout>{children}</Layout> : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/open-to-talk" element={<PrivateRoute><OpenToTalk /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
