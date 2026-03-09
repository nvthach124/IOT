/**
 * ===========================================
 * MQTT Configuration - Broker Connection
 * ===========================================
 * File: backend/config/mqtt.js
 * Mô tả: Cấu hình kết nối MQTT broker (Mosquitto local)
 */

require('dotenv').config();

/**
 * Cấu hình MQTT broker
 * Sử dụng Mosquitto local làm broker
 */
const mqttConfig = {
    // URL broker (mqtt://localhost cho local Mosquitto)
    brokerUrl: process.env.MQTT_BROKER || 'mqtt://localhost',

    // Port MQTT 
    port: parseInt(process.env.MQTT_PORT) || 2810,

    // Client ID để định danh server
    clientId: process.env.MQTT_CLIENT_ID || 'iot_smarthome_server',

    // Options cho MQTT client
    options: {
        clean: true,                    // Clean session khi kết nối
        connectTimeout: 4000,           // Timeout kết nối (4s)
        reconnectPeriod: 1000,          // Thời gian chờ reconnect (1s)
        keepalive: 60,                  // Keepalive interval (60s)
        username: 'nguyenvanthach',
        password: 'b22dcpt254',
    }
};

const { DEVICES } = require('./constants');

/**
 * Định nghĩa các MQTT Topics
 * Lấy từ centralized constants
 */
const topics = {
    // Topic nhận dữ liệu từ sensors (subscribe)
    SENSOR_DATA: process.env.TOPIC_SENSOR_DATA,

    // Topic trạng thái thiết bị (subscribe)
    DEVICE_STATUS: process.env.TOPIC_DEVICE_STATUS,

    // Topics điều khiển thiết bị (Lấy từ constants)
    LAMP_CONTROL: DEVICES.LAMP.topicControl,
    FAN_CONTROL: DEVICES.FAN.topicControl,
    PUMP_CONTROL: DEVICES.PUMP.topicControl
};

module.exports = {
    mqttConfig,
    topics
};
