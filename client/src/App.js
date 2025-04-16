import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { checkProjectAccess, getProject } from './services/api';

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
        // Get project details to check access
        const response = await getProject(projectId);
        const project = response.data || response;
        
        // Check if user is owner or editor
        const isOwner = project.owner && (
          (typeof project.owner === 'string' && project.owner === user.id) ||
          (project.owner._id && project.owner._id === user.id)
        );
        
        const isEditor = project.collaborators && project.collaborators.some(c => {
          if (!c || !c.user) return false;
          
          const collabUserId = typeof c.user === 'object' && c.user._id 
            ? c.user._id 
            : c.user;
            
          return collabUserId === user.id && c.role === 'editor';
        });
        
        setHasAccess(isOwner || isEditor);
      } catch (error) {
        console.error('Error checking project access:', error);
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
    return <Navigate to={`/projects/${projectId}`} />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <CssBaseline />
      <Navbar />
      <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public project route */}
          <Route path="/project/:id" element={<ProjectDetails />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/project/create" element={
            <ProtectedRoute>
              <ProjectCreate />
            </ProtectedRoute>
          } />
          <Route path="/project/:id/edit" element={
            <EditorRoute>
              <ProjectEdit />
            </EditorRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </>
  );
}

export default App; 