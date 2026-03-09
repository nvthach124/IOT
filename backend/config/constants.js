/**
Định nghĩa danh sách thiết bị và các hằng số hệ thống.
 */

require('dotenv').config();

const DEVICES = {
    LAMP: {
        id: 1,
        code: 'lamp',           // Key định danh (dùng trong API/MQTT)
        name: 'Lamp',   // Tên hiển thị
        topicControl: process.env.TOPIC_LAMP_CONTROL,
        topicStatus: process.env.TOPIC_DEVICE_STATUS,
        icon: 'lightbulb',      // Icon hiển thị (Material Symbols)
        color: '#ffea00'        // Màu sắc đại diện
    },
    FAN: {
        id: 2,
        code: 'fan',
        name: 'Fan',
        topicControl: process.env.TOPIC_FAN_CONTROL,
        topicStatus: process.env.TOPIC_DEVICE_STATUS,
        icon: 'mode_fan',
        color: '#34a7ad'
    },
    PUMP: {
        id: 3,
        code: 'pump',
        name: 'Pump',
        topicControl: process.env.TOPIC_PUMP_CONTROL,
        topicStatus: process.env.TOPIC_DEVICE_STATUS,
        icon: 'water_drop',
        color: '#00d2ff'
    },
   

};

/**
 * Helper để lấy device theo code (ví dụ: 'lamp' -> object LAMP)
 */
const getDeviceByCode = (code) => {
    if (!code) return null;
    const key = Object.keys(DEVICES).find(k => DEVICES[k].code === code.toLowerCase());
    return key ? DEVICES[key] : null;
};

/**
 * Helper để lấy device theo ID
 */
const getDeviceById = (id) => {
    const key = Object.keys(DEVICES).find(k => DEVICES[k].id === parseInt(id));
    return key ? DEVICES[key] : null;
};

module.exports = {
    DEVICES,
    getDeviceByCode,
    getDeviceById
};
