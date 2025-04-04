const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  tokenomics: {
    // Basic Token Information
    blockchain: {
      type: String,
      default: 'Ethereum'
    },
    tokenName: {
      type: String,
      required: true
    },
    tokenSymbol: {
      type: String,
      required: true
    },
    tokenDecimals: {
      type: Number,
      default: 18
    },
    totalSupply: {
      type: Number,
      required: true
    },
    maxSupply: {
      type: Number
    },
    
    // Allocation and Distribution
    allocation: {
      team: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      advisors: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      investors: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      community: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      treasury: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      marketing: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      },
      liquidity: {
        percentage: Number,
        vestingPeriod: Number,
        cliff: Number
      }
    },
    
    // Token Sale Information
    tokenSale: {
      fundraisingAmount: Number,
      tokenType: String,
      acceptedCurrencies: [String],
      preSeedRoundDate: Date,
      seedRoundDate: Date,
      privateRoundDate: Date,
      publicRoundDate: Date,
      initialExchangeListingDate: Date
    },
    
    // Token Features
    features: {
      transactionFee: {
        enabled: {
          type: Boolean,
          default: false
        },
        percentage: Number
      },
      mintFunction: {
        enabled: {
          type: Boolean,
          default: false
        }
      },
      burnFunction: {
        enabled: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
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
  next();
});

module.exports = mongoose.model('Project', ProjectSchema); 