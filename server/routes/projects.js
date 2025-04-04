const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { checkProjectAccess, checkEditAccess } = require('../middleware/projectAccess');

// Get all projects (public and user's own)
router.get('/', protect, async (req, res) => {
  try {
    // Find public projects and user's own projects
    const projects = await Project.find({
      $or: [
        { isPublic: true },
        { owner: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    }).populate('owner', 'name email');
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single project
router.get('/:id', protect, checkProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new project
router.post('/', protect, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', protect, checkProjectAccess, async (req, res) => {
  try {
    // Only owner can delete the project
    if (req.projectAccess !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a collaborator to a project
router.post('/:id/collaborators', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    // Check if user is already a collaborator
    const isCollaborator = req.project.collaborators.some(
      collab => collab.user.toString() === userId
    );
    
    if (isCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }
    
    // Add collaborator
    req.project.collaborators.push({ user: userId, role });
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove a collaborator from a project
router.delete('/:id/collaborators/:userId', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    // Remove collaborator
    req.project.collaborators = req.project.collaborators.filter(
      collab => collab.user.toString() !== req.params.userId
    );
    
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

module.exports = router; 