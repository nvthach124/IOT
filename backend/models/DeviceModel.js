/**
 * ===========================================
 * Device Model - MySQL Database Operations
 * ===========================================
 * File: backend/models/Device.js
 * Mô tả: Model xử lý các thao tác với bảng devices
 *        Quản lý thông tin thiết bị (Đèn, Quạt, Bơm)
 */

const { pool } = require('../config/database');
const { DEVICES } = require('../config/constants');

const deviceStates = {};

Object.values(DEVICES).forEach((device) => {
    deviceStates[device.code] = 'OFF';
});

/**
 * Class Device - Quản lý thiết bị điều khiển
 */
class Device {
    static getDeviceStates() {
        return { ...deviceStates };
    }

    static getDeviceStateByCode(deviceCode) {
        if (!deviceCode) return 'OFF';
        return deviceStates[deviceCode.toLowerCase()] || 'OFF';
    }

    static setDeviceStateByCode(deviceCode, status) {
        if (!deviceCode) return;
        const code = deviceCode.toLowerCase();
        if (!(code in deviceStates)) return;
        deviceStates[code] = status?.toString().toUpperCase() === 'ON' ? 'ON' : 'OFF';
    }


    /**
     * Lấy thông tin thiết bị theo ID
     * @param {number} id - ID thiết bị
     * @returns {Promise<Object|null>} - Thông tin thiết bị hoặc null
     */
    static async getById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, DATE_FORMAT(created_at, '%H:%i:%s %d/%m/%Y') as created_at
                 FROM devices 
                 WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Lỗi Device.getById:', error.message);
            throw error;
        }
    }


    /**
     * Thêm mới thiết bị
     * @param {number} id - ID thiết bị (cố định)
     * @param {string} name - Tên thiết bị
     * @returns {Promise<Object>} - Thiết bị vừa thêm
     */
    static async create(id, name) {
        try {
            await pool.query(
                'INSERT INTO devices (id, name) VALUES (?, ?)',
                [id, name]
            );

            console.log(`✅ Đã thêm thiết bị: ID=${id}, Name=${name}`);

            return { id, name, created_at: new Date() };
        } catch (error) {
            console.error('❌ Lỗi Device.create:', error.message);
            throw error;
        }
    }

    /**
     * Khởi tạo các thiết bị mặc định nếu chưa có
     * @returns {Promise<void>}
     */
    static async initializeDefaultDevices() {
        try {
            // Danh sách thiết bị mặc định
            const defaultDevices = [
                { id: 1, name: 'Lamp' },      
                { id: 2, name: 'Fan' },     
                { id: 3, name: 'Pump' },
            ];

            for (const device of defaultDevices) {
                // Kiểm tra xem thiết bị đã tồn tại chưa
                const existing = await this.getById(device.id);
                if (!existing) {
                    await this.create(device.id, device.name);
                }
            }

            console.log('✅ Đã khởi tạo các thiết bị mặc định');
        } catch (error) {
            console.error('❌ Lỗi Device.initializeDefaultDevices:', error.message);
            throw error;
        }
    }
}

module.exports = Device;
