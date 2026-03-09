/**
 * ===========================================
 * Device Controller - Restructured
 * ===========================================
 */

const History = require('../models/History');
const mqttService = require('../services/mqttService');
const { DEVICES, getDeviceByCode, getDeviceById } = require('../config/constants');

// In-memory cache for device states (User requested "localrage")
const lastKnownStates = {};

/**
 * Sync initial states from database (User requested "localrage")
 */
const syncInitialStates = async () => {
    try {
        console.log('🔄 Đang đồng bộ trạng thái thiết bị từ DB...');
        const states = await History.getDeviceStates();

        // Map from DB status to memory cache dynamically
        Object.values(DEVICES).forEach(device => {
            const deviceState = states[device.id];
            if (deviceState) {
                lastKnownStates[device.code] = deviceState.status.toUpperCase() === 'ON' ? 'ON' : 'OFF';
            } else {
                lastKnownStates[device.code] = 'OFF';
            }
        });

        console.log('✅ Đã đồng bộ trạng thái thiết bị:', lastKnownStates);
    } catch (err) {
        console.error('❌ Lỗi đồng bộ trạng thái thiết bị:', err.message);
    }
};
syncInitialStates();

/**
 * POST /api/device-control
 * Điều khiển thiết bị
 */
const controlDevice = async (req, res) => {
    try {
        const { device, status, action } = req.body;

        // Hỗ trợ cả status và action (từ dashboard/history button)
        const deviceAction = (status || action || '').toUpperCase();

        // Validate input
        if (!device) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: device là bắt buộc'
            });
        }

        if (!['ON', 'OFF'].includes(deviceAction)) {
            return res.status(400).json({
                success: false,
                message: 'status/action phải là ON hoặc OFF'
            });
        }

        const deviceConfig = getDeviceByCode(device);
        if (!deviceConfig) {
            return res.status(400).json({
                success: false,
                message: `Thiết bị không hợp lệ: ${device}`
            });
        }

        const deviceCode = deviceConfig.code;

        // Gửi lệnh qua MQTT và đợi phản hồi từ phần cứng
        try {
            // 1. Lưu ngay vào lịch sử với trạng thái "Waiting"
            const historyRecord = await History.createAction(deviceConfig.id, deviceAction, 'Waiting');
            const historyId = historyRecord.id;

            // 2. Gửi lệnh điều khiển (sẽ đợi feedback)
            // Sử dụng hàm controlDevice generic
            await mqttService.controlDevice(deviceCode, deviceAction);

            // 3. Nếu thành công (không throw error), update trạng thái thành ON/OFF
            await History.updateStatus(historyId, deviceAction);

            // Cập nhật bộ nhớ đệm (lấy dữ liệu thực tế từ feedback nếu có)
            lastKnownStates[deviceCode] = deviceAction;

            res.json({
                success: true,
                message: `${deviceConfig.name} đã ${deviceAction === 'ON' ? 'BẬT' : 'TẮT'}`,
                data: {
                    device: deviceCode,
                    action: deviceAction,
                    status: deviceAction
                }
            });
        } catch (mqttError) {
            // Timeout hoặc lỗi từ MQTT
            console.error('❌ MQTT feedback error:', mqttError.message);

            // Theo yêu cầu: Không updateStatus nếu timeout, chỉ showToast ở frontend
            // Record trong DB sẽ giữ nguyên là "Waiting"

            // Lấy trạng thái thực tế từ cache để hiển thị đúng
            const statusToSave = lastKnownStates[deviceCode] || 'OFF';

            return res.status(200).json({
                success: false,
                message: mqttError.message || 'Không nhận được phản hồi từ thiết bị',
                data: {
                    device: deviceCode,
                    action: deviceAction,
                    status: 'Waiting'
                }
            });
        }
    } catch (error) {
        console.error('❌ controlDevice error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    controlDevice
};
