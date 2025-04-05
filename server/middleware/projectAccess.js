const Project = require('../models/Project');

// Middleware to check if user has access to a project
exports.checkProjectAccess = async (req, res, next) => {
  try {
    console.log('checkProjectAccess - Starting middleware...');
    const projectId = req.params.id || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Assign project to request object for future middleware/route handlers
    req.project = project;
    
    // Check if project owner is valid
    if (!project.owner) {
      console.error('checkProjectAccess - Project owner is missing');
      return res.status(500).json({ message: 'Project owner information is missing' });
    }
    
    // Check if user is the owner - using safe toString alternatives
    let ownerId = '';
    let userId = '';
    
    try {
      // Handle populated vs unpopulated reference
      if (typeof project.owner === 'object') {
        if (!project.owner._id) {
          console.error('checkProjectAccess - Owner object does not have _id property');
          return res.status(500).json({ message: 'Invalid owner reference' });
        }
        ownerId = project.owner._id.toString();
      } else {
        ownerId = project.owner.toString();
      }
      
      if (!req.user || !req.user.id) {
        console.error('checkProjectAccess - User ID is missing');
        return res.status(500).json({ message: 'User information is missing' });
      }
      
      userId = req.user.id;
    } catch (err) {
      console.error('checkProjectAccess - Error extracting owner ID:', err);
      return res.status(500).json({ message: 'Error processing project owner information' });
    }
    
    if (ownerId === userId) {
      req.projectAccess = 'owner';
      return next();
    }
    
    // Check if project is public
    if (project.isPublic) {
      req.projectAccess = 'public';
      return next();
    }
    
    // Check if user is a collaborator
    let collaborator = null;
    
    try {
      if (project.collaborators && project.collaborators.length > 0) {
        console.log('checkProjectAccess - Collaborators array:', JSON.stringify(project.collaborators));
        
        collaborator = project.collaborators.find(collab => {
          if (!collab) {
            console.log('checkProjectAccess - Null collaborator entry');
            return false;
          }
          
          if (!collab.user) {
            console.log('checkProjectAccess - Collaborator without user field:', collab);
            return false;
          }
          
          try {
            // Convert both IDs to strings for comparison
            let collabUserId;
            
            if (typeof collab.user === 'object' && collab.user._id) {
              collabUserId = String(collab.user._id);
            } else {
              collabUserId = String(collab.user);
            }
            
            const isMatch = collabUserId === userId;
            
            console.log('checkProjectAccess - Comparing collaborator:', {
              collab: JSON.stringify(collab),
              collabUserId: collabUserId,
              userId: userId,
              role: collab.role,
              isMatch: isMatch
            });
            
            return isMatch;
          } catch (err) {
            console.error('checkProjectAccess - Error comparing collaborator IDs:', err);
            return false;
          }
        });
      }
    } catch (err) {
      console.error('checkProjectAccess - Error processing collaborators:', err);
      // Continue execution, treating as if no collaborator was found
    }
    
    if (collaborator) {
      req.projectAccess = collaborator.role;
      return next();
    }
    
    // User has no access
    return res.status(403).json({ message: 'You do not have access to this project' });
  } catch (error) {
    console.error('checkProjectAccess - Error:', error);
    console.error('checkProjectAccess - Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error in project access check', 
      error: error.message 
    });
  }
};

// Middleware to check if user has edit access to a project
exports.checkEditAccess = async (req, res, next) => {
  try {
    console.log('checkEditAccess - Starting middleware...');
    console.log('checkEditAccess - User:', req.user ? req.user.id : 'undefined');
    console.log('checkEditAccess - Project access level:', req.projectAccess);
    
    // Make sure projectAccess is defined
    if (req.projectAccess === undefined) {
      console.error('checkEditAccess - projectAccess is undefined');
      return res.status(500).json({ message: 'Project access information is missing' });
    }
    
    // If user is owner or has editor access, allow
    if (req.projectAccess === 'owner' || req.projectAccess === 'editor') {
      console.log('checkEditAccess - Access granted with role:', req.projectAccess);
      return next();
    }
    
    // User does not have edit access
    console.log('checkEditAccess - Access denied with role:', req.projectAccess);
    return res.status(403).json({ message: 'You do not have permission to edit this project' });
  } catch (error) {
    console.error('checkEditAccess - Error:', error);
    console.error('checkEditAccess - Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error in edit access check', 
      error: error.message 
    });
  }
}; 