import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { checkProjectAccess } from './services/api';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProjectCreate from './pages/ProjectCreate';
import ProjectEdit from './pages/ProjectEdit';
import ProjectDetails from './pages/ProjectDetails';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Editor Route component - only allows owner or editor roles to access
const EditorRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const projectId = location.pathname.split('/')[2]; // Extract project ID from URL
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!token || !user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        console.log('EditorRoute: Starting access check for project:', projectId);
        console.log('EditorRoute: Current user:', user);
        
        // Use the dedicated API method for access checking
        const accessData = await checkProjectAccess(projectId);
        
        console.log('EditorRoute: Access check response:', accessData);
        
        // Check if user can edit based on the API response
        const canEdit = accessData.access && accessData.access.canEdit;
        
        console.log('EditorRoute: Can user edit?', canEdit);
        
        setHasAccess(canEdit);
      } catch (error) {
        console.error('EditorRoute: Error checking project access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [projectId, token, user]);
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <CircularProgress sx={{ margin: '20% auto', display: 'block' }} />;
  }
  
  // Redirect to project details if the user doesn't have edit permission
  if (!hasAccess) {
    console.log('EditorRoute: Access denied - redirecting to project details page');
    return <Navigate to={`/projects/${projectId}`} />;
  }
  
  console.log('EditorRoute: Access granted - rendering editor page');
  return children;
};

function App() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
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
                <EditorRoute>
                  <ProjectEdit />
                </EditorRoute>
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
    </>
  );
}

export default App; 