/**
 * ===========================================
 * MQTT Device Control - Command & Feedback
 * ===========================================
 * File: backend/services/mqttDeviceControl.js
 * Mô tả: Xử lý logic điều khiển thiết bị với cơ chế feedback
 *        Single Responsibility: Gửi lệnh → Đợi phản hồi → Resolve/Reject
 */

const { getDeviceByCode } = require('../config/constants');

// Timeout cho việc đợi phản hồi (ms)
const FEEDBACK_TIMEOUT = 5000;

/**
 * Map lưu các request đang đợi phản hồi từ hardware
 * Key: device code (lamp/fan/pump)
 * Value: { resolve, reject, timeoutId, expectedAction }
 */
const pendingRequests = new Map();

// Reference đến publish function (sẽ được inject từ bên ngoài)
let publishFunction = null;

/**
 * Inject publish function từ mqttClient
 * @param {Function} publishFn - Function để publish message
 */
const setPublishFunction = (publishFn) => {
    publishFunction = publishFn;
};

/**
 * Điều khiển thiết bị với cơ chế đợi phản hồi
 * @param {string} deviceCode - Mã thiết bị (lamp/fan/pump)
 * @param {string} action - 'ON' hoặc 'OFF'
 * @returns {Promise} - Resolve khi nhận phản hồi, reject khi timeout
 */
const controlDevice = (deviceCode, action) => {
    return new Promise((resolve, reject) => {
        const deviceConfig = getDeviceByCode(deviceCode);
        if (!deviceConfig) {
            return reject(new Error(`Thiết bị không tồn tại: ${deviceCode}`));
        }

        // Hủy request cũ nếu có
        if (pendingRequests.has(deviceCode)) {
            const old = pendingRequests.get(deviceCode);
            clearTimeout(old.timeoutId);
            old.reject(new Error('Request bị hủy do có request mới'));
        }

        // Tạo timeout
        const timeoutId = setTimeout(() => {
            pendingRequests.delete(deviceCode);
            reject(new Error(`Không nhận được phản hồi từ ${deviceConfig.name}`));
        }, FEEDBACK_TIMEOUT);

        // Lưu request vào Map
        pendingRequests.set(deviceCode, {
            resolve,
            reject,
            timeoutId,
            expectedAction: action.toUpperCase()
        });

        // Gửi lệnh qua MQTT
        if (publishFunction) {
            publishFunction(deviceConfig.topicControl, action);
            console.log(`💡 Gửi lệnh ${deviceConfig.name.toUpperCase()}: ${action} (đợi phản hồi...)`);
        } else {
            clearTimeout(timeoutId);
            pendingRequests.delete(deviceCode);
            reject(new Error('MQTT publish function chưa được khởi tạo'));
        }
    });
};

/**
 * Xử lý phản hồi từ hardware (được gọi từ messageHandler)
 * @param {string} deviceCode - Mã thiết bị (lamp/fan/pump)
 * @param {string} status - Trạng thái nhận được (ON/OFF)
 */
const handleDeviceFeedback = (deviceCode, status) => {
    if (pendingRequests.has(deviceCode)) {
        const request = pendingRequests.get(deviceCode);

        // Clear timeout
        clearTimeout(request.timeoutId);

        // Kiểm tra xem status có khớp với expected không
        if (request.expectedAction === status.toUpperCase()) {
            request.resolve({ deviceCode, status });
            console.log(`✅ Nhận phản hồi ${deviceCode}: ${status}`);
        } else {
            request.reject(new Error(`Trạng thái không khớp: mong đợi ${request.expectedAction}, nhận ${status}`));
        }

        // Xóa khỏi Map
        pendingRequests.delete(deviceCode);
    }
};

/**
 * Hủy tất cả pending requests (dùng khi shutdown)
 */
const cancelAllRequests = () => {
    pendingRequests.forEach((request, deviceCode) => {
        clearTimeout(request.timeoutId);
        request.reject(new Error('Service đang shutdown'));
    });
    pendingRequests.clear();
};

/**
 * Kiểm tra số lượng pending requests
 * @returns {number}
 */
const getPendingCount = () => {
    return pendingRequests.size;
};

module.exports = {
    setPublishFunction,
    controlDevice,
    handleDeviceFeedback,
    cancelAllRequests,
    getPendingCount
};
