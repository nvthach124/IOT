/**
 * ===========================================
 * MQTT Message Handler - Message Processing
 * ===========================================
 * File: backend/services/mqttMessageHandler.js
 * Mô tả: Xử lý và parse messages từ MQTT broker
 *        Single Responsibility: Nhận message → Parse → Gọi handler tương ứng
 */

const { topics } = require('../config/mqtt');
const { getDeviceByCode } = require('../config/constants');
const Sensor = require('../models/Sensor');

// Callbacks để notify bên ngoài (WebSocket, etc.)
let onSensorDataCallback = null;
let onDeviceStatusCallback = null;
let onDeviceFeedbackCallback = null;

/**
 * Đăng ký callbacks
 * @param {Function} onSensorData - Callback khi nhận sensor data
 * @param {Function} onDeviceStatus - Callback khi nhận device status
 * @param {Function} onDeviceFeedback - Callback để xử lý feedback (cho device control)
 */
const registerCallbacks = (onSensorData, onDeviceStatus, onDeviceFeedback) => {
    onSensorDataCallback = onSensorData;
    onDeviceStatusCallback = onDeviceStatus;
    onDeviceFeedbackCallback = onDeviceFeedback;
};

/**
 * Xử lý message nhận được từ MQTT
 * @param {string} topic - Topic nhận message
 * @param {Buffer} message - Nội dung message
 */
const handleMessage = async (topic, message) => {
    try {
        const payload = message.toString();
        console.log(`📨 Nhận từ [${topic}]: ${payload}`);

        // Parse JSON payload
        let data;
        try {
            data = JSON.parse(payload);
        } catch {
            // Nếu không phải JSON, coi như text
            data = payload;
        }

        // Route đến handler tương ứng
        switch (topic) {
            case topics.SENSOR_DATA:
                await handleSensorData(data);
                break;

            case topics.DEVICE_STATUS:
                await handleDeviceStatus(data);
                break;

            default:
                console.log(`⚠️  Topic không xử lý: ${topic}`);
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý MQTT message:', error.message);
    }
};

/**
 * Xử lý dữ liệu sensor nhận được
 * Format hỗ trợ: 
 *   - { temp: 25.5, humi: 60, light: 500 } (từ Arduino)
 *   - { temperature: 25.5, humidity: 60, light: 500 }
 * @param {Object} data - Dữ liệu sensor
 */
const handleSensorData = async (data) => {
    try {
        // Hỗ trợ cả 2 format: temp/humi hoặc temperature/humidity
        const temperature = data.temp !== undefined ? data.temp : data.temperature;
        const humidity = data.humi !== undefined ? data.humi : data.humidity;
        const light = data.light;

        if (temperature === undefined || humidity === undefined || light === undefined) {
            console.error('❌ Dữ liệu sensor không hợp lệ:', data);
            return;
        }

        // Parse dữ liệu
        const sensorData = {
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            light: parseInt(light)
        };

        console.log(`📊 Nhận sensor data: temp=${temperature}, humi=${humidity}, light=${light}`);

        // Tự động lưu vào database
        try {
            await Sensor.createDataSensor(sensorData.temperature, sensorData.humidity, sensorData.light);
            console.log('✅ Đã lưu sensor data vào database');
        } catch (dbError) {
            console.error('❌ Lỗi lưu sensor data:', dbError.message);
        }

        // Emit callback (cho WebSocket broadcast)
        if (onSensorDataCallback) {
            onSensorDataCallback(sensorData);
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý sensor data:', error.message);
    }
};

/**
 * Xử lý trạng thái thiết bị nhận được từ hardware
 * Format hỗ trợ:
 *   - Multi-device: { lamp: "ON", fan: "OFF" }
 *   - Single device: { device: "lamp", status: "ON" }
 * @param {Object} data - Trạng thái thiết bị
 */
const handleDeviceStatus = async (data) => {
    try {
        // Kiểm tra format đa thiết bị: { lamp: "ON", fan: "OFF" }
        const deviceKeys = Object.keys(data).filter(key => key !== 'device' && key !== 'status');

        if (deviceKeys.length > 0) {
            // Xử lý nhiều thiết bị
            for (const key of deviceKeys) {
                const deviceConfig = getDeviceByCode(key);
                if (deviceConfig) {
                    const status = data[key];
                    const action = status?.toString().toUpperCase() === 'ON' ? 'ON' : 'OFF';

                    processDeviceStatus(deviceConfig, action);
                }
            }
            return;
        }

        // Format đơn lẻ: { device: "lamp", status: "ON" }
        const { device, status } = data;
        const deviceConfig = getDeviceByCode(device);

        if (!deviceConfig) {
            console.error('❌ Thiết bị không xác định:', device);
            return;
        }

        const action = status?.toUpperCase() === 'ON' ? 'ON' : 'OFF';
        processDeviceStatus(deviceConfig, action);

    } catch (error) {
        console.error('❌ Lỗi xử lý device status:', error.message);
    }
};

/**
 * Xử lý trạng thái một thiết bị cụ thể
 * @param {Object} deviceConfig - Config thiết bị từ constants
 * @param {string} action - ON hoặc OFF
 */
const processDeviceStatus = (deviceConfig, action) => {
    console.log(`✅ Device ${deviceConfig.name}: ${action}`);

    // Gọi callback để device control xử lý feedback
    if (onDeviceFeedbackCallback) {
        onDeviceFeedbackCallback(deviceConfig.code, action);
    }

    // Gọi callback khác nếu cần (WebSocket, etc.)
    if (onDeviceStatusCallback) {
        onDeviceStatusCallback({
            deviceId: deviceConfig.id,
            deviceName: deviceConfig.code,
            action
        });
    }
};

module.exports = {
    registerCallbacks,
    handleMessage
};
