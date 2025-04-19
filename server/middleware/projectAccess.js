const Project = require('../models/Project');
const mongoose = require('mongoose');

// Middleware to check if user has access to a project
exports.checkProjectAccess = async (req, res, next) => {
  try {
    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Convert IDs to strings for comparison
    const userId = req.user?._id?.toString();
    const ownerId = project.owner?._id?.toString() || project.owner?.toString();
    
    // Check if user is owner
    if (userId && ownerId && userId === ownerId) {
      req.projectAccess = 'owner';
      req.project = project;
      return next();
    }
    
    // Check if user is collaborator
    if (userId) {
      const collaborator = project.collaborators.find(
        c => c.user?._id?.toString() === userId || c.user?.toString() === userId
      );
      
      if (collaborator) {
        req.projectAccess = collaborator.role;
        req.project = project;
        return next();
      }
    }
    
    // Check if project is public
    if (project.isPublic) {
      req.projectAccess = 'public';
      req.project = project;
      return next();
    }
    
    res.status(403).json({ message: 'Not authorized to access this project' });
  } catch (error) {
    console.error('Project access middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user has edit access to a project
exports.checkEditAccess = (req, res, next) => {
  if (!req.projectAccess) {
    return res.status(403).json({ message: 'Project access not determined' });
  }

  if (req.projectAccess === 'owner' || req.projectAccess === 'editor') {
    return next();
  }
  
  res.status(403).json({ message: 'Not authorized to edit this project' });
}; 