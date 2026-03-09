/**
 * ===========================================
 * MQTT Client - Connection Management
 * ===========================================
 * File: backend/services/mqttClient.js
 * Mô tả: Quản lý kết nối MQTT broker, subscribe/publish cơ bản
 *        Single Responsibility: Chỉ xử lý connection & pub/sub
 */

const mqtt = require('mqtt');
const { mqttConfig, topics } = require('../config/mqtt');

// MQTT client instance (singleton)
let client = null;

// Callback khi nhận message
let messageCallback = null;

/**
 * Khởi tạo kết nối MQTT broker
 * @param {Function} onMessage - Callback khi nhận message (topic, payload)
 * @returns {Object} - MQTT client instance
 */
const initialize = (onMessage = null) => {
    messageCallback = onMessage;

    const brokerUrl = `${mqttConfig.brokerUrl}:${mqttConfig.port}`;
    console.log(`🔌 Đang kết nối MQTT broker: ${brokerUrl}`);

    client = mqtt.connect(brokerUrl, {
        ...mqttConfig.options,
        clientId: mqttConfig.clientId
    });

    // Event: Kết nối thành công
    client.on('connect', () => {
        console.log('✅ Kết nối MQTT broker thành công!');
        subscribeTopics();
    });

    // Event: Nhận message
    client.on('message', (topic, message) => {
        if (messageCallback) {
            messageCallback(topic, message);
        }
    });

    // Event: Lỗi kết nối
    client.on('error', (error) => {
        console.error('❌ Lỗi MQTT:', error.message);
    });

    // Event: Đóng kết nối
    client.on('close', () => {
        console.log('⚠️  MQTT connection closed');
    });

    // Event: Đang kết nối lại
    client.on('reconnect', () => {
        console.log('🔄 Đang kết nối lại MQTT...');
    });

    return client;
};

/**
 * Subscribe các topics cần nhận dữ liệu
 */
const subscribeTopics = () => {
    const topicsToSubscribe = [
        topics.SENSOR_DATA,     // Dữ liệu từ sensors
        topics.DEVICE_STATUS    // Trạng thái thiết bị
    ];

    topicsToSubscribe.forEach(topic => {
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
                console.error(`❌ Lỗi subscribe topic ${topic}:`, err.message);
            } else {
                console.log(`📩 Đã subscribe topic: ${topic}`);
            }
        });
    });
};

/**
 * Publish message đến topic
 * @param {string} topic - Topic đích
 * @param {string|Object} message - Nội dung message
 * @returns {boolean} - True nếu publish thành công
 */
const publish = (topic, message) => {
    if (!client || !client.connected) {
        console.error('❌ MQTT chưa kết nối!');
        return false;
    }

    const payload = typeof message === 'object' ? JSON.stringify(message) : message;

    client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
            console.error(`❌ Lỗi publish to ${topic}:`, err.message);
        }
    });

    return true;
};

/**
 * Đóng kết nối MQTT
 */
const disconnect = () => {
    if (client) {
        client.end();
        console.log('🔌 Đã đóng kết nối MQTT');
    }
};

/**
 * Kiểm tra trạng thái kết nối
 * @returns {boolean}
 */
const isConnected = () => {
    return client && client.connected;
};

/**
 * Lấy client instance (để test hoặc debug)
 * @returns {Object|null}
 */
const getClient = () => {
    return client;
};

module.exports = {
    initialize,
    publish,
    disconnect,
    isConnected,
    getClient
};
