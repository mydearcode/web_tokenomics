import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProjectCreate from './pages/ProjectCreate';
import ProjectEdit from './pages/ProjectEdit';
import ProjectDetails from './pages/ProjectDetails';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                py: 3,
                backgroundColor: 'background.default',
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute>
                      <ProjectCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ProjectEdit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetails />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 