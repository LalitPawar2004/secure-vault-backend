const VaultEntry = require('../models/VaultEntry');

// @desc    Get all vault entries for a user
// @route   GET /api/vault
// @access  Private
const getVaultEntries = async (req, res) => {
  try {
    const entries = await VaultEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a vault entry
// @route   POST /api/vault
// @access  Private
const createVaultEntry = async (req, res) => {
  try {
    const { username, password, email, domain } = req.body;

    // Validation
    if (!username || !password || !email || !domain) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    // Create entry
    const entry = await VaultEntry.create({
      user: req.user.id,
      username,
      password,
      email,
      domain
    });

    res.status(201).json({
      success: true,
      entry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a vault entry
// @route   PUT /api/vault/:id
// @access  Private
const updateVaultEntry = async (req, res) => {
  try {
    let entry = await VaultEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    // Make sure user owns entry
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    entry = await VaultEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      entry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a vault entry
// @route   DELETE /api/vault/:id
// @access  Private
const deleteVaultEntry = async (req, res) => {
  try {
    const entry = await VaultEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    // Make sure user owns entry
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await entry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Entry removed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Search vault entries by domain
// @route   GET /api/vault/search
// @access  Private
const searchVaultEntries = async (req, res) => {
  try {
    const { domain } = req.query;
    
    const entries = await VaultEntry.find({
      user: req.user.id,
      domain: { $regex: domain, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getVaultEntries,
  createVaultEntry,
  updateVaultEntry,
  deleteVaultEntry,
  searchVaultEntries
};