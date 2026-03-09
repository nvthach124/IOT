const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

/**
 * POST /api/device-control
 * Điều khiển thiết bị
 * Body: { device: 'lamp' | 'fan' | 'pump', status: 'on' | 'off' }
 */
router.post('/', deviceController.controlDevice);


module.exports = router;
