const mongoose = require('mongoose');

const vaultEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    lowercase: true
  },
  domain: {
    type: String,
    required: [true, 'Please add a domain'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VaultEntry', vaultEntrySchema);