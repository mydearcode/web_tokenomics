const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    trim: true,
    maxlength: [1000, 'Project description cannot be more than 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tokenName: {
    type: String,
    required: [true, 'Please provide a token name'],
    trim: true,
    maxlength: [50, 'Token name cannot be more than 50 characters']
  },
  tokenSymbol: {
    type: String,
    required: [true, 'Please provide a token symbol'],
    trim: true,
    maxlength: [10, 'Token symbol cannot be more than 10 characters']
  },
  tokenomics: {
    totalSupply: {
      type: Number,
      required: [true, 'Please provide a total supply'],
      min: [0, 'Total supply cannot be negative']
    },
    initialPrice: {
      type: Number,
      required: [true, 'Please provide an initial price'],
      min: [0, 'Initial price cannot be negative']
    },
    maxSupply: {
      type: Number,
      required: [true, 'Please provide a max supply'],
      min: [0, 'Max supply cannot be negative']
    },
    decimals: {
      type: Number,
      required: [true, 'Please provide decimals'],
      min: [0, 'Decimals cannot be negative'],
      max: [18, 'Decimals cannot be more than 18'],
      default: 18
    },
    allocation: {
      type: Map,
      of: {
        percentage: {
          type: Number,
          required: true,
          min: [0, 'Percentage cannot be negative'],
          max: [100, 'Percentage cannot be more than 100']
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Amount cannot be negative']
        }
      },
      required: [true, 'Please provide allocation data'],
      validate: {
        validator: function(allocation) {
          // Calculate total allocation
          const total = Array.from(allocation.values())
            .reduce((sum, value) => sum + value.percentage, 0);
          // Check if total is 100%
          return Math.abs(total - 100) < 0.01;
        },
        message: 'Total allocation must be 100%'
      }
    }
  },
  vesting: {
    type: Map,
    of: {
      tgePercentage: {
        type: Number,
        required: [true, 'Please provide TGE percentage'],
        min: [0, 'TGE percentage cannot be negative'],
        max: [100, 'TGE percentage cannot be more than 100']
      },
      cliffMonths: {
        type: Number,
        required: [true, 'Please provide cliff months'],
        min: [0, 'Cliff months cannot be negative']
      },
      vestingMonths: {
        type: Number,
        required: [true, 'Please provide vesting months'],
        min: [1, 'Vesting months must be at least 1']
      }
    }
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure owner is a valid ObjectId
  if (this.owner && typeof this.owner === 'string') {
    try {
      this.owner = new mongoose.Types.ObjectId(this.owner);
    } catch (err) {
      // Continue anyway, Mongoose will handle validation errors
    }
  }
  
  // Ensure each collaborator.user is a valid ObjectId
  if (this.collaborators && this.collaborators.length > 0) {
    this.collaborators = this.collaborators.filter(collab => {
      // Remove any collaborator entries with null/undefined user
      if (!collab || !collab.user) return false;
      
      // Try to convert string IDs to ObjectId
      if (typeof collab.user === 'string') {
        try {
          collab.user = new mongoose.Types.ObjectId(collab.user);
        } catch (err) {
          return false; // Remove this collaborator if ID is invalid
        }
      }
      
      return true;
    });
  }
  
  next();
});

// Update the updatedAt field before updating
ProjectSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Add deleteProject method
ProjectSchema.methods.deleteProject = async function() {
  return this.deleteOne();
};

module.exports = mongoose.model('Project', ProjectSchema); 