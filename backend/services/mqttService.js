const mqtt = require('mqtt');
const Sensor = require('../models/SensorModel');
const Device = require('../models/DeviceModel');
const { mqttConfig, topics } = require('../config/mqtt');
const { getDeviceByCode } = require('../config/constants');

const FEEDBACK_TIMEOUT = 5000;

let client = null;
let onSensorDataCb = null;
let onDeviceStatusCb = null;
const pendingRequests = new Map();

/**
 * Khởi tạo MQTT service với tất cả components
 * @param {Function} onSensorData - Callback khi nhận sensor data
 * @param {Function} onDeviceStatus - Callback khi nhận device status
 * @returns {Object} - MQTT client instance
 */
const initialize = (onSensorData = null, onDeviceStatus = null) => {
    onSensorDataCb = onSensorData;
    onDeviceStatusCb = onDeviceStatus;

    client = mqtt.connect(`${mqttConfig.brokerUrl}:${mqttConfig.port}`, {
        ...mqttConfig.options,
        clientId: mqttConfig.clientId
    });

    client.on('connect', () => {
        client.subscribe([topics.SENSOR_DATA, topics.DEVICE_STATUS], { qos: 1 }, (error) => {
            if (error) {
                console.error('❌ Subscribe MQTT thất bại:', error.message);
                return;
            }
            console.log(`📩 Đã subscribe: ${topics.SENSOR_DATA}, ${topics.DEVICE_STATUS}`);
        });
        console.log('✅ Kết nối MQTT broker thành công!');
    });

    client.on('message', async (topic, message) => {
        try {
            const payload = message.toString();
            let data;
            try {
                data = JSON.parse(payload);
            } catch {
                data = payload;
            }

            if (topic === topics.SENSOR_DATA) {
                const temperature = data.temp !== undefined ? data.temp : data.temperature;
                const humidity = data.humi !== undefined ? data.humi : data.humidity;
                const light = data.light;
                if (temperature === undefined || humidity === undefined || light === undefined) return;

                const sensorData = {
                    temperature: parseFloat(temperature),
                    humidity: parseFloat(humidity),
                    light: parseInt(light, 10)
                };

                await Sensor.createDataSensor(sensorData.temperature, sensorData.humidity, sensorData.light);
                if (onSensorDataCb) onSensorDataCb(sensorData);
                return;
            }

            if (topic !== topics.DEVICE_STATUS || typeof data !== 'object' || !data) return;

            const entries = Object.keys(data).filter((key) => !['device', 'status'].includes(key)).length
                ? Object.entries(data).filter(([key]) => !['device', 'status'].includes(key))
                : [[data.device, data.status]];

            entries.forEach(([code, value]) => {
                const device = getDeviceByCode(code);
                if (!device) return;

                const action = value?.toString().toUpperCase() === 'ON' ? 'ON' : 'OFF';
                Device.setDeviceStateByCode(device.code, action);
                const pending = pendingRequests.get(device.code);
                if (pending) {
                    clearTimeout(pending.timeoutId);
                    if (pending.expectedAction === action) {
                        pending.resolve({ deviceCode: device.code, status: action });
                    } else {
                        pending.reject(new Error(`Trạng thái không khớp: mong đợi ${pending.expectedAction}, nhận ${action}`));
                    }
                    pendingRequests.delete(device.code);
                }

                if (onDeviceStatusCb) {
                    onDeviceStatusCb({ deviceId: device.id, deviceName: device.code, action });
                }
            });
        } catch (error) {
            console.error('❌ Lỗi xử lý MQTT message:', error.message);
        }
    });

    client.on('error', (error) => console.error('❌ Lỗi MQTT:', error.message));
    client.on('close', () => console.log('⚠️  MQTT connection closed'));
    client.on('reconnect', () => console.log('🔄 Đang kết nối lại MQTT...'));

    return client;
};

/**
 * Điều khiển thiết bị (Generic)
 * @param {string} deviceCode - Mã thiết bị (lamp/fan/pump)
 * @param {string} action - 'ON' hoặc 'OFF'
 * @returns {Promise}
 */
const controlDevice = (deviceCode, action) => {
    return new Promise((resolve, reject) => {
        const device = getDeviceByCode(deviceCode);
        const normalizedAction = (action || '').toUpperCase();

        if (!isConnected()) return reject(new Error('MQTT chưa kết nối'));

        const current = pendingRequests.get(device.code);
        if (current) {
            clearTimeout(current.timeoutId);
            current.reject(new Error('Request bị hủy do có request mới'));
        }

        const timeoutId = setTimeout(() => {
            pendingRequests.delete(device.code);
            reject(new Error(`Không nhận được phản hồi từ ${device.name}`));
        }, FEEDBACK_TIMEOUT);

        pendingRequests.set(device.code, { resolve, reject, timeoutId, expectedAction: normalizedAction });
        publish(device.topicControl, normalizedAction);
    });
};

/**
 * Publish message đến topic
 * @param {string} topic - Topic đích
 * @param {string|Object} message - Nội dung message
 * @returns {boolean}
 */
const publish = (topic, message) => {
    if (!isConnected()) return false;
    const payload = typeof message === 'object' ? JSON.stringify(message) : message;
    client.publish(topic, payload, { qos: 1 });
    console.log(`📤 Published to ${topic}:`, payload);
    return true;
};

/**
 * Đóng kết nối MQTT
 */
const disconnect = () => {
    pendingRequests.forEach((request) => {
        clearTimeout(request.timeoutId);
        request.reject(new Error('Service đang shutdown'));
    });
    pendingRequests.clear();
    if (client) client.end();
};

/**
 * Kiểm tra trạng thái kết nối
 * @returns {boolean}
 */
const isConnected = () => {
    return !!(client && client.connected);
};

module.exports = {
    initialize,
    controlDevice,
    publish,
    disconnect,
    isConnected
};
