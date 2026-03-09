const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

/**
 * GET /api/data-sensor
 */
router.get('/', sensorController.getSensorData);

module.exports = router;
