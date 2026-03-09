/**
 * ===========================================
 * Sensor Model - MySQL Database Operations
 * ===========================================
 * File: backend/models/Sensor.js
 * Mô tả: Model xử lý các thao tác với bảng datasensor
 *        Chứa dữ liệu nhiệt độ, độ ẩm, ánh sáng
 */

const { pool } = require('../config/database');

/**
 * Class Sensor - Quản lý dữ liệu cảm biến
 */
class Sensor {
    /**
     * Lấy tất cả dữ liệu sensor với pagination
     * @param {number} page - Số trang (bắt đầu từ 1)
     * @param {number} limit - Số bản ghi mỗi trang
     * @returns {Promise<Object>} - Danh sách data và thông tin pagination
     */
    static async getAllData(page = 1, limit = 20, sortBy = 'id', sortOrder = 'desc') {
        try {
            // Mapping sort columns
            const sortMap = {
                'id': 'id',
                'temperature': 'temperature',
                'humidity': 'humidity',
                'light': 'light',
                'time': 'created_at'
            };
            const sortCol = sortMap[sortBy] || 'id';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            // Tính offset cho pagination
            const offset = (page - 1) * limit;

            // Query lấy data với pagination và sorting
            const [rows] = await pool.query(
                `SELECT id, temperature, humidity, light, created_at as time
                 FROM datasensor 
                 ORDER BY ${sortCol} ${order}
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            // Query đếm tổng số bản ghi
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as total FROM datasensor'
            );
            const total = countResult[0].total;

            return {
                data: rows,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Lỗi Sensor.getAllData:', error.message);
            throw error;
        }
    }

    /**
     * Thêm mới dữ liệu sensor
     * @param {number} temperature - Nhiệt độ (°C)
     * @param {number} humidity - Độ ẩm (%)
     * @param {number} light - Độ sáng (Lux)
     * @returns {Promise<Object>} - Bản ghi vừa thêm
     */
    static async createDataSensor(temperature, humidity, light) {
        try {
            const [result] = await pool.query(
                'INSERT INTO datasensor (temperature, humidity, light) VALUES (?, ?, ?)',
                [temperature, humidity, light]
            );

            console.log(`✅ Đã lưu sensor data: Temp=${temperature}°C, Hum=${humidity}%, Light=${light}Lux`);

            return {
                id: result.insertId,
                temperature,
                humidity,
                light,
                created_at: new Date()
            };
        } catch (error) {
            console.error('❌ Lỗi Sensor.create:', error.message);
            throw error;
        }
    }

    /**
     * Tìm kiếm dữ liệu sensor theo điều kiện
     * @param {Object} filters - Các điều kiện lọc
     * @param {number} page - Số trang
     * @param {number} limit - Số bản ghi mỗi trang
     * @returns {Promise<Object>} - Kết quả tìm kiếm
     */
    static async search(filters = {}, page = 1, limit = 20, sortBy = 'id', sortOrder = 'desc') {
        try {
            // Mapping sort columns
            const sortMap = {
                'id': 'id',
                'temperature': 'temperature',
                'humidity': 'humidity',
                'light': 'light',
                'time': 'created_at'
            };
            const sortCol = sortMap[sortBy] || 'id';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            let whereClause = '1=1'; // Điều kiện mặc định (luôn đúng)
            const params = [];

            // Xử lý từ khóa tìm kiếm chung
            if (filters.keyword) {
                const key = `%${filters.keyword}%`;
                whereClause += ` AND (
                    CAST(temperature AS CHAR) LIKE ? OR 
                    CAST(humidity AS CHAR) LIKE ? OR 
                    CAST(light AS CHAR) LIKE ? OR
                    DATE_FORMAT(created_at, '%H:%i:%s %e/%c/%Y') LIKE ? OR
                    CAST(created_at AS CHAR) LIKE ?
                )`;
                params.push(key, key, key, key, key);
            }

            // Lọc theo nhiệt độ
            if (filters.tempMin !== undefined && filters.tempMin !== null) {
                whereClause += ' AND temperature >= ?';
                params.push(filters.tempMin);
            }
            if (filters.tempMax !== undefined && filters.tempMax !== null) {
                whereClause += ' AND temperature <= ?';
                params.push(filters.tempMax);
            }

            // Lọc theo độ ẩm
            if (filters.humMin !== undefined && filters.humMin !== null) {
                whereClause += ' AND humidity >= ?';
                params.push(filters.humMin);
            }
            if (filters.humMax !== undefined && filters.humMax !== null) {
                whereClause += ' AND humidity <= ?';
                params.push(filters.humMax);
            }

            // Lọc theo độ sáng
            if (filters.lightMin !== undefined && filters.lightMin !== null) {
                whereClause += ' AND light >= ?';
                params.push(filters.lightMin);
            }
            if (filters.lightMax !== undefined && filters.lightMax !== null) {
                whereClause += ' AND light <= ?';
                params.push(filters.lightMax);
            }

            // Lọc theo thời gian
            if (filters.dateFrom) {
                whereClause += ' AND created_at >= ?';
                params.push(filters.dateFrom);
            }
            if (filters.dateTo) {
                whereClause += ' AND created_at <= ?';
                params.push(filters.dateTo);
            }

            // Thêm pagination params
            const offset = (page - 1) * limit;
            params.push(limit, offset);

            // Query với filters
            const [rows] = await pool.query(
                `SELECT id, temperature, humidity, light, created_at as time
                 FROM datasensor 
                 WHERE ${whereClause}
                 ORDER BY ${sortCol} ${order}
                 LIMIT ? OFFSET ?`,
                params
            );

            // Đếm tổng với filters
            const countParams = params.slice(0, -2); // Bỏ limit và offset
            const [countResult] = await pool.query(
                `SELECT COUNT(*) as total FROM datasensor WHERE ${whereClause}`,
                countParams
            );
            const total = countResult[0].total;

            return {
                data: rows,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Lỗi Sensor.search:', error.message);
            throw error;
        }
    }

    /**
     * Lấy dữ liệu sensor gần nhất (cho chart)
     * @param {number} limit - Số records gần nhất
     * @returns {Promise<Array>} - Danh sách data points
     */
    static async getData(limit = 20) {
        try {
            const [rows] = await pool.query(
                `SELECT temperature, humidity, light, created_at as time
                 FROM datasensor 
                 ORDER BY created_at DESC
                 LIMIT ?`,
                [limit]
            );
            return rows;
        } catch (error) {
            console.error('❌ Lỗi Sensor.getChartData:', error.message);
            throw error;
        }
    }
}

module.exports = Sensor;
