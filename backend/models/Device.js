/**
 * ===========================================
 * Device Model - MySQL Database Operations
 * ===========================================
 * File: backend/models/Device.js
 * Mô tả: Model xử lý các thao tác với bảng devices
 *        Quản lý thông tin thiết bị (Đèn, Quạt, Bơm)
 */

const { pool } = require('../config/database');

/**
 * Class Device - Quản lý thiết bị điều khiển
 */
class Device {
    /**
     * Lấy danh sách tất cả thiết bị
     * @returns {Promise<Array>} - Danh sách thiết bị
     */
    static async getAllData() {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, 
                        DATE_FORMAT(created_at, '%H:%i:%s %d/%m/%Y') as created_at
                 FROM devices 
                 ORDER BY id ASC`
            );
            return rows;
        } catch (error) {
            console.error('❌ Lỗi Device.getAllData:', error.message);
            throw error;
        }
    }

    /**
     * Lấy thông tin thiết bị theo ID
     * @param {number} id - ID thiết bị
     * @returns {Promise<Object|null>} - Thông tin thiết bị hoặc null
     */
    static async getById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, 
                        DATE_FORMAT(created_at, '%H:%i:%s %d/%m/%Y') as created_at
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
     * Lấy thông tin thiết bị theo tên
     * @param {string} name - Tên thiết bị
     * @returns {Promise<Object|null>} - Thông tin thiết bị hoặc null
     */
    static async getByName(name) {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, 
                        DATE_FORMAT(created_at, '%H:%i:%s %d/%m/%Y') as created_at
                 FROM devices 
                 WHERE name LIKE ?`,
                [`%${name}%`]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Lỗi Device.getByName:', error.message);
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
                { id: 1, name: 'Lamp' },      // Lamp
                { id: 2, name: 'Fan' },     // Fan
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
