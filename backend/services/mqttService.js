/**
 * ===========================================
 * MQTT Service - Main Entry Point (Refactored)
 * ===========================================
 * File: backend/services/mqttService.js
 * Mô tả: Entry point tổng hợp các module con
 *        - mqttClient.js: Quản lý connection
 *        - mqttMessageHandler.js: Xử lý messages
 *        - mqttDeviceControl.js: Logic điều khiển thiết bị
 */

const mqttClient = require('./mqttClient');
const mqttMessageHandler = require('./mqttMessageHandler');
const mqttDeviceControl = require('./mqttDeviceControl');

/**
 * Khởi tạo MQTT service với tất cả components
 * @param {Function} onSensorData - Callback khi nhận sensor data
 * @param {Function} onDeviceStatus - Callback khi nhận device status
 * @returns {Object} - MQTT client instance
 */
const initialize = (onSensorData = null, onDeviceStatus = null) => {
    // 1. Inject publish function vào device control
    mqttDeviceControl.setPublishFunction(mqttClient.publish);

    // 2. Đăng ký callbacks cho message handler
    mqttMessageHandler.registerCallbacks(
        onSensorData,                           // Sensor data callback
        onDeviceStatus,                         // Device status callback
        mqttDeviceControl.handleDeviceFeedback  // Feedback cho device control
    );

    // 3. Khởi tạo MQTT client với message handler
    const client = mqttClient.initialize(mqttMessageHandler.handleMessage);

    return client;
};

/**
 * Điều khiển thiết bị (Generic)
 * @param {string} deviceCode - Mã thiết bị (lamp/fan/pump)
 * @param {string} action - 'ON' hoặc 'OFF'
 * @returns {Promise}
 */
const controlDevice = (deviceCode, action) => {
    return mqttDeviceControl.controlDevice(deviceCode, action);
};

/**
 * Publish message đến topic
 * @param {string} topic - Topic đích
 * @param {string|Object} message - Nội dung message
 * @returns {boolean}
 */
const publish = (topic, message) => {
    return mqttClient.publish(topic, message);
};

/**
 * Đóng kết nối MQTT
 */
const disconnect = () => {
    mqttDeviceControl.cancelAllRequests();
    mqttClient.disconnect();
};

/**
 * Kiểm tra trạng thái kết nối
 * @returns {boolean}
 */
const isConnected = () => {
    return mqttClient.isConnected();
};

module.exports = {
    initialize,
    controlDevice,
    publish,
    disconnect,
    isConnected
};
