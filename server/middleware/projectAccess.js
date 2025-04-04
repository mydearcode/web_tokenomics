const Project = require('../models/Project');

// Middleware to check if user has access to a project
exports.checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the owner
    if (project.owner.toString() === req.user.id) {
      req.project = project;
      req.projectAccess = 'owner';
      return next();
    }
    
    // Check if project is public
    if (project.isPublic) {
      req.project = project;
      req.projectAccess = 'public';
      return next();
    }
    
    // Check if user is a collaborator
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user.id
    );
    
    if (collaborator) {
      req.project = project;
      req.projectAccess = collaborator.role;
      return next();
    }
    
    // User has no access
    return res.status(403).json({ message: 'You do not have access to this project' });
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has edit access to a project
exports.checkEditAccess = async (req, res, next) => {
  try {
    // If user is owner or has editor access, allow
    if (req.projectAccess === 'owner' || req.projectAccess === 'editor') {
      return next();
    }
    
    // User does not have edit access
    return res.status(403).json({ message: 'You do not have permission to edit this project' });
  } catch (error) {
    next(error);
  }
}; 