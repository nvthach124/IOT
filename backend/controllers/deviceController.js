const History = require('../models/HistoryModel');
const Device = require('../models/DeviceModel');
const mqttService = require('../services/mqttService');
const { getDeviceByCode } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/device-control
 * Điều khiển thiết bị
 */
const controlDevice = asyncHandler(async (req, res) => {
    const { device, status, action } = req.body;
    const deviceConfig = getDeviceByCode(device);
    const deviceAction = (status || action || '').toUpperCase();


    const history = await History.createAction(deviceConfig.id, deviceAction, 'Waiting');

    try {
        await mqttService.controlDevice(deviceConfig.code, deviceAction);
        
        await History.updateStatus(history.id, deviceAction);
        Device.setDeviceStateByCode(deviceConfig.code, deviceAction);

        return res.json({
            success: true,
            message: `${deviceConfig.name} đã ${deviceAction === 'ON' ? 'BẬT' : 'TẮT'}`,
            data: { device: deviceConfig.code, action: deviceAction, status: deviceAction }
        });
    } catch (error) {
        const actualState = Device.getDeviceStateByCode(deviceConfig.code);
        return res.json({
            success: false,
            message: error.message || 'Không nhận được phản hồi từ thiết bị',
            data: { device: deviceConfig.code, action: deviceAction, status: actualState }
        });
    }
});

module.exports = {
    controlDevice
};
