const express = require('express');
const {
  getVaultEntries,
  createVaultEntry,
  updateVaultEntry,
  deleteVaultEntry,
  searchVaultEntries
} = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getVaultEntries)
  .post(createVaultEntry);

router.route('/search')
  .get(searchVaultEntries);

router.route('/:id')
  .put(updateVaultEntry)
  .delete(deleteVaultEntry);

module.exports = router;