import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, updateProject, toggleProjectVisibility } from '../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ProjectEditDialog from '../components/ProjectEditDialog';
import TokenAllocationChart from '../components/charts/TokenAllocationChart';
import VestingScheduleChart from '../components/VestingScheduleChart';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      console.log('Fetching project with ID:', id);
      const data = await getProject(id);
      console.log('Received project data:', data);
      setProject(data);
      setEditedProject(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching project:', err);
      if (err.message === 'Authentication required') {
        navigate('/login', { state: { from: `/projects/${id}` } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProject(id, editedProject);
      setProject(editedProject);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleToggleVisibility = async () => {
    try {
      const updatedProject = await toggleProjectVisibility(id);
      setProject(updatedProject);
      setEditedProject(updatedProject);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-details">
      <h1>{isEditing ? 'Edit Project' : project.name}</h1>
      
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedProject.name}
            onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
          />
          <textarea
            value={editedProject.description}
            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
          />
          <div className="button-group">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="project-content">
          <p className="description">{project.description}</p>
          
          <div className="token-info">
            <h2>Token Information</h2>
            <p><strong>Token Name:</strong> {project.tokenName}</p>
            <p><strong>Token Symbol:</strong> {project.tokenSymbol}</p>
            <p><strong>Total Supply:</strong> {project.tokenomics.totalSupply.toLocaleString()}</p>
            <p><strong>Initial Price:</strong> ${project.tokenomics.initialPrice}</p>
            <p><strong>Max Supply:</strong> {project.tokenomics.maxSupply.toLocaleString()}</p>
            <p><strong>Decimals:</strong> {project.tokenomics.decimals}</p>
          </div>

          <div className="allocation-info">
            <h2>Token Allocation</h2>
            <TokenAllocationChart allocation={project.tokenomics.allocation} />
            <div className="allocation-details">
              {Object.entries(project.tokenomics.allocation).map(([category, data]) => (
                <div key={category} className="allocation-item">
                  <span className="category">{category}</span>
                  <span className="percentage">{data.percentage}%</span>
                  <span className="amount">{data.amount.toLocaleString()} tokens</span>
                </div>
              ))}
            </div>
          </div>

          <div className="project-meta">
            <p><strong>Created by:</strong> {project.owner.name}</p>
            <p><strong>Visibility:</strong> {project.isPublic ? 'Public' : 'Private'}</p>
            <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>

          {user && (user._id === project.owner._id) && (
            <div className="admin-controls">
              <button onClick={handleEdit}>Edit Project</button>
              <button onClick={handleToggleVisibility}>
                Make {project.isPublic ? 'Private' : 'Public'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 