const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const historyController = require('../controllers/historyController');
const sensorController = require('../controllers/sensorController');

router.post('/device-control', deviceController.controlDevice);
router.get('/data-sensor', sensorController.getSensorData);
router.get('/active-history', historyController.getHistory);

module.exports = router;
