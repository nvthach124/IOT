const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

/**
 * GET /api/active-history
 */
router.get('/', historyController.getHistory);

module.exports = router;
