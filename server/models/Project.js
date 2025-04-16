const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tokenName: {
    type: String,
    required: [true, 'Token name is required'],
    trim: true
  },
  tokenSymbol: {
    type: String,
    required: [true, 'Token symbol is required'],
    trim: true,
    uppercase: true
  },
  tokenomics: {
    totalSupply: {
      type: Number,
      required: [true, 'Total supply is required'],
      min: [0, 'Total supply must be positive']
    },
    initialPrice: {
      type: Number,
      required: [true, 'Initial price is required'],
      min: [0, 'Initial price must be positive']
    },
    maxSupply: {
      type: Number,
      required: [true, 'Max supply is required'],
      min: [0, 'Max supply must be positive']
    },
    decimals: {
      type: Number,
      required: [true, 'Decimals is required'],
      min: [0, 'Decimals must be positive'],
      max: [18, 'Decimals cannot exceed 18']
    },
    allocation: {
      type: Map,
      of: {
        percentage: {
          type: Number,
          required: [true, 'Allocation percentage is required'],
          min: [0, 'Allocation percentage must be positive'],
          max: [100, 'Allocation percentage cannot exceed 100']
        },
        amount: {
          type: Number,
          required: [true, 'Allocation amount is required'],
          min: [0, 'Allocation amount must be positive']
        }
      },
      validate: {
        validator: function(allocation) {
          const total = Array.from(allocation.values())
            .reduce((sum, { percentage }) => sum + percentage, 0);
          return Math.abs(total - 100) < 0.01; // Allow for small floating point differences
        },
        message: 'Total allocation must equal 100%'
      }
    }
  },
  vesting: {
    type: Map,
    of: {
      tgePercentage: {
        type: Number,
        required: [true, 'TGE percentage is required'],
        min: [0, 'TGE percentage must be positive'],
        max: [100, 'TGE percentage cannot exceed 100']
      },
      cliffMonths: {
        type: Number,
        required: [true, 'Cliff months is required'],
        min: [0, 'Cliff months must be positive']
      },
      vestingMonths: {
        type: Number,
        required: [true, 'Vesting months is required'],
        min: [0, 'Vesting months must be positive']
      }
    }
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }]
}, {
  timestamps: true
});

// Add method to check if a user has access to the project
ProjectSchema.methods.hasAccess = function(userId) {
  if (this.isPublic) return true;
  
  const ownerId = this.owner._id ? this.owner._id.toString() : this.owner.toString();
  if (ownerId === userId) return true;
  
  return this.collaborators.some(collab => {
    const collabUserId = collab.user._id ? collab.user._id.toString() : collab.user.toString();
    return collabUserId === userId;
  });
};

// Add method to check if a user can edit the project
ProjectSchema.methods.canEdit = function(userId) {
  const ownerId = this.owner._id ? this.owner._id.toString() : this.owner.toString();
  if (ownerId === userId) return true;
  
  return this.collaborators.some(collab => {
    const collabUserId = collab.user._id ? collab.user._id.toString() : collab.user.toString();
    return collabUserId === userId && collab.role === 'editor';
  });
};

module.exports = mongoose.model('Project', ProjectSchema); 