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
    // Add owner to the project
    req.body.owner = req.user.id;
    
    // Log the incoming request body
    console.log('Creating project with data:', JSON.stringify(req.body, null, 2));
    
    // Ensure allocation and vesting data are properly formatted
    if (req.body.tokenomics && req.body.tokenomics.allocation) {
      // Convert allocation data to the correct format if needed
      const allocationData = {};
      Object.entries(req.body.tokenomics.allocation).forEach(([key, value]) => {
        allocationData[key] = {
          percentage: Number(value),
          amount: (Number(req.body.tokenomics.totalSupply) * Number(value)) / 100
        };
      });
      req.body.tokenomics.allocation = allocationData;
    }
    
    if (req.body.vesting) {
      // Ensure vesting data is properly formatted
      const vestingData = {};
      Object.entries(req.body.vesting).forEach(([key, value]) => {
        vestingData[key] = {
          tgePercentage: Number(value.tgePercentage),
          cliffMonths: Number(value.cliffMonths),
          vestingMonths: Number(value.vestingMonths)
        };
      });
      req.body.vesting = vestingData;
    }
    
    // Log the processed data
    console.log('Processed project data:', JSON.stringify(req.body, null, 2));
    
    const project = await Project.create(req.body);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a project
router.put('/:id', protect, checkProjectAccess, checkEditAccess, async (req, res) => {
  try {
    // Log the incoming request body
    console.log('Updating project with data:', JSON.stringify(req.body, null, 2));
    
    // Ensure allocation and vesting data are properly formatted
    if (req.body.tokenomics && req.body.tokenomics.allocation) {
      // Convert allocation data to the correct format if needed
      const allocationData = {};
      Object.entries(req.body.tokenomics.allocation).forEach(([key, value]) => {
        allocationData[key] = {
          percentage: Number(value),
          amount: (Number(req.body.tokenomics.totalSupply) * Number(value)) / 100
        };
      });
      req.body.tokenomics.allocation = allocationData;
    }
    
    if (req.body.vesting) {
      // Ensure vesting data is properly formatted
      const vestingData = {};
      Object.entries(req.body.vesting).forEach(([key, value]) => {
        vestingData[key] = {
          tgePercentage: Number(value.tgePercentage),
          cliffMonths: Number(value.cliffMonths),
          vestingMonths: Number(value.vestingMonths)
        };
      });
      req.body.vesting = vestingData;
    }
    
    // Log the processed data
    console.log('Processed update data:', JSON.stringify(req.body, null, 2));
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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