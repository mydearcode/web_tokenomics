const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkProjectAccess, checkEditAccess } = require('../middleware/projectAccess');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const ownerId = typeof project.owner === 'object' && project.owner._id 
      ? project.owner._id.toString() 
      : project.owner.toString();
    
    const isOwner = ownerId === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => {
        const collabUserId = typeof c.user === 'object' && c.user._id 
          ? c.user._id.toString() 
          : c.user.toString();
        return collabUserId === req.user._id.toString();
      }
    );
    
    if (!isOwner && !isCollaborator && !project.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', protect, async (req, res) => {
  try {
    console.log('Project creation request:', {
      body: req.body,
      userId: req.user._id
    });

    // Validate required fields
    const { name, description, tokenName, tokenSymbol, tokenomics } = req.body;

    if (!name || !description || !tokenName || !tokenSymbol) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          description: !description ? 'Description is required' : null,
          tokenName: !tokenName ? 'Token name is required' : null,
          tokenSymbol: !tokenSymbol ? 'Token symbol is required' : null
        }
      });
    }

    if (!tokenomics || !tokenomics.totalSupply) {
      return res.status(400).json({
        message: 'Missing tokenomics data',
        details: {
          totalSupply: !tokenomics?.totalSupply ? 'Total supply is required' : null
        }
      });
    }

    // Create project data with owner
    const projectData = {
      ...req.body,
      owner: req.user._id
    };

    console.log('Creating project with data:', projectData);

    // Create and save the project
    const project = new Project(projectData);
    await project.save();

    // Populate owner field with user details
    await project.populate('owner', 'name email');

    console.log('Project created successfully:', project);

    res.status(201).json(project);
  } catch (error) {
    console.error('Project creation error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle other errors
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Update project
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('Project update request:', {
      id: req.params.id,
      body: req.body,
      userId: req.user._id
    });

    // Find the project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Validate required fields
    const { name, description, tokenName, tokenSymbol, tokenomics } = req.body;

    if (!name || !description || !tokenName || !tokenSymbol) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          description: !description ? 'Description is required' : null,
          tokenName: !tokenName ? 'Token name is required' : null,
          tokenSymbol: !tokenSymbol ? 'Token symbol is required' : null
        }
      });
    }

    if (!tokenomics || !tokenomics.totalSupply) {
      return res.status(400).json({
        message: 'Missing tokenomics data',
        details: {
          totalSupply: !tokenomics?.totalSupply ? 'Total supply is required' : null
        }
      });
    }

    // Update project data
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    console.log('Project updated successfully:', updatedProject);

    res.json(updatedProject);
  } catch (error) {
    console.error('Project update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle other errors
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteProject();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Add a collaborator to a project by email
router.post('/:id/collaborators', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    console.log('Starting to add collaborator...');
    
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const User = require('../models/User');
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }
    
    // Ensure project exists and has all required properties
    if (!req.project) {
      console.error('Project is undefined in the request object');
      return res.status(500).json({ message: 'Project not found in request' });
    }
    
    // Safely check if user is the owner with detailed null checks
    let ownerId = '';
    let userId = '';
    
    try {
      // Extra careful owner ID extraction with even more detailed logging
      if (!req.project.owner) {
        console.error('Project owner is undefined');
        return res.status(500).json({ message: 'Project owner information is missing' });
      }
      
      // Handle populated vs unpopulated reference
      if (typeof req.project.owner === 'object') {
        if (!req.project.owner._id) {
          console.error('Owner object does not have _id property');
          return res.status(500).json({ message: 'Invalid owner reference' });
        }
        ownerId = req.project.owner._id.toString();
      } else {
        ownerId = req.project.owner.toString();
      }

      // Extra careful user ID extraction
      if (!user._id) {
        console.error('User _id is undefined');
        return res.status(500).json({ message: 'Invalid user reference' });
      }
      
      userId = user._id.toString();
    } catch (err) {
      console.error('Error comparing IDs:', err);
      return res.status(500).json({ 
        message: 'Error comparing user IDs', 
        error: err.message 
      });
    }
    
    if (userId === ownerId) {
      return res.status(400).json({ message: 'Owner cannot be added as a collaborator' });
    }
    
    // Check if collaborators array exists
    if (!req.project.collaborators) {
      req.project.collaborators = [];
    }
    
    // Check if user is already a collaborator - using more defensive code
    let isCollaborator = false;
    
    try {
      isCollaborator = req.project.collaborators.some(collab => {
        if (!collab || !collab.user) {
          return false;
        }
        
        try {
          // In case of populated or non-populated user reference
          const collabUserId = typeof collab.user === 'object' && collab.user._id 
            ? collab.user._id.toString() 
            : collab.user.toString();
          
          return collabUserId === userId;
        } catch (err) {
          console.error('Error comparing collaborator IDs:', err);
          return false;
        }
      });
    } catch (err) {
      console.error('Error checking existing collaborators:', err);
      return res.status(500).json({ 
        message: 'Error checking existing collaborators', 
        error: err.message 
      });
    }
    
    if (isCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }
    
    // First, ensure user._id is an ObjectID
    const mongoose = require('mongoose');
    let userObjectId;
    
    try {
      userObjectId = mongoose.Types.ObjectId.isValid(user._id) 
        ? user._id 
        : new mongoose.Types.ObjectId(user._id.toString());
    } catch (error) {
      console.error('Failed to convert user ID to ObjectId:', error);
      return res.status(500).json({ 
        message: 'Invalid user ID format', 
        error: error.message 
      });
    }
    
    // Add collaborator with validated ObjectId
    req.project.collaborators.push({ 
      user: userObjectId, 
      role: role || 'viewer' 
    });
    
    try {
      await req.project.save();
    } catch (saveError) {
      console.error('Error saving project:', saveError);
      return res.status(500).json({ 
        message: 'Error saving project', 
        error: saveError.message 
      });
    }
    
    // Populate user data before returning response for better UX
    try {
      await req.project.populate('collaborators.user', 'name email');
    } catch (populateError) {
      console.error('Error populating:', populateError);
      // Continue even if populate fails
    }
    
    return res.json({
      success: true,
      data: req.project
    });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Remove a collaborator from a project
router.delete('/:id/collaborators/:userId', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    // Safety check for project and collaborators
    if (!req.project) {
      console.error('Project is undefined in the request object');
      return res.status(500).json({ message: 'Project not found in request' });
    }
    
    if (!req.project.collaborators || req.project.collaborators.length === 0) {
      return res.status(400).json({ message: 'This project has no collaborators' });
    }
    
    const userId = req.params.userId;
    
    // Validate the userId is in the proper format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Check if the user is a collaborator with super-defensive code
    let isCollaborator = false;
    let collaboratorIndex = -1;
    
    try {
      req.project.collaborators.forEach((collab, index) => {
        if (!collab || !collab.user) {
          return; // Skip this entry
        }
        
        try {
          // Handle both populated and non-populated user references
          const collabUserId = typeof collab.user === 'object' && collab.user._id 
            ? collab.user._id.toString() 
            : collab.user.toString();
          
          if (collabUserId === userId) {
            isCollaborator = true;
            collaboratorIndex = index;
          }
        } catch (err) {
          console.error('Error comparing collaborator IDs:', err);
        }
      });
    } catch (err) {
      console.error('Error checking existing collaborators:', err);
      return res.status(500).json({ 
        message: 'Error checking existing collaborators', 
        error: err.message 
      });
    }
    
    if (!isCollaborator) {
      return res.status(400).json({ message: 'User is not a collaborator of this project' });
    }
    
    try {
      if (collaboratorIndex !== -1) {
        // Use splice for direct removal by index instead of filter
        req.project.collaborators.splice(collaboratorIndex, 1);
      } else {
        // Fallback to filter method if index is not found (shouldn't happen)
        req.project.collaborators = req.project.collaborators.filter(collab => {
          if (!collab || !collab.user) return true; // Keep invalid entries
          
          try {
            // Handle both populated and non-populated user references
            const collabUserId = typeof collab.user === 'object' && collab.user._id 
              ? collab.user._id.toString() 
              : collab.user.toString();
              
            return collabUserId !== userId;
          } catch (err) {
            console.error('Error comparing IDs during filter:', err);
            return true; // Keep this entry if there was an error
          }
        });
      }
    } catch (err) {
      console.error('Error filtering/splicing collaborators:', err);
      return res.status(500).json({ 
        message: 'Error removing collaborator', 
        error: err.message 
      });
    }
    
    try {
      await req.project.save();
    } catch (saveError) {
      console.error('Error saving project:', saveError);
      return res.status(500).json({ 
        message: 'Error saving project', 
        error: saveError.message 
      });
    }
    
    // Populate user data for the response
    try {
      await req.project.populate('collaborators.user', 'name email');
    } catch (populateError) {
      console.error('Error populating:', populateError);
      // Continue even if populate fails
    }
    
    return res.json({
      success: true,
      data: req.project
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Toggle project visibility
router.patch('/:id/visibility', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    req.project.isPublic = !req.project.isPublic;
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check access to a project
router.get('/:id/check-access', protect, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    // Find project with populated collaborators
    const project = await Project.findById(projectId).populate('collaborators.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Extract owner ID
    let ownerId;
    if (typeof project.owner === 'object' && project.owner._id) {
      ownerId = String(project.owner._id);
    } else {
      ownerId = String(project.owner);
    }
    
    const isOwner = ownerId === userId;
    
    // Check for collaborator role
    let collaboratorRole = null;
    
    if (project.collaborators && project.collaborators.length > 0) {
      const collaborator = project.collaborators.find(collab => {
        if (!collab || !collab.user) return false;
        
        // Extract user ID from collaborator
        let collabUserId;
        if (typeof collab.user === 'object' && collab.user._id) {
          collabUserId = String(collab.user._id);
        } else {
          collabUserId = String(collab.user);
        }
        
        return collabUserId === userId;
      });
      
      if (collaborator) {
        collaboratorRole = collaborator.role;
      }
    }
    
    // Determine access level
    let accessLevel;
    if (isOwner) {
      accessLevel = 'owner';
    } else if (collaboratorRole) {
      accessLevel = collaboratorRole;
    } else if (project.isPublic) {
      accessLevel = 'public';
    } else {
      accessLevel = 'none';
    }
    
    // Return detailed access information
    return res.json({
      project: {
        id: project._id,
        name: project.name,
        owner: ownerId,
        isPublic: project.isPublic,
        collaboratorsCount: project.collaborators ? project.collaborators.length : 0
      },
      user: {
        id: userId,
        name: req.user.name,
        email: req.user.email
      },
      access: {
        isOwner,
        collaboratorRole,
        accessLevel,
        canEdit: accessLevel === 'owner' || accessLevel === 'editor',
        collaborators: project.collaborators ? project.collaborators.map(c => ({
          id: c.user ? (typeof c.user === 'object' && c.user._id ? String(c.user._id) : String(c.user)) : null,
          name: c.user && typeof c.user === 'object' ? c.user.name : null,
          email: c.user && typeof c.user === 'object' ? c.user.email : null,
          role: c.role
        })) : []
      }
    });
  } catch (error) {
    console.error('Error in check-access route:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get public project
router.get('/public/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.isPublic) {
      return res.status(403).json({ message: 'This project is not public' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get public project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 