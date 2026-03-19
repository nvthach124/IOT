const { pool } = require('../config/database');

class History {
    //  Lấy tất cả lịch sử hoạt động với pagination
    static async getAllData(page = 1, limit = 20, sortBy = 'id', sortOrder = 'desc') {
        try {
            // Mapping sort columns
            const sortMap = {
                'id': 'h.id',
                'device': 'd.name',
                'action': 'h.action',
                'status': 'h.status',
                'time': 'h.created_at'
            };
            const sortCol = sortMap[sortBy] || 'h.id';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const offset = (page - 1) * limit;

            // Query với JOIN để lấy tên thiết bị
            const [rows] = await pool.query(
                `SELECT h.id, h.device_id, d.name as device, 
                        h.action, h.status, h.created_at as time
                 FROM active_history h
                 LEFT JOIN devices d ON h.device_id = d.id
                 ORDER BY ${sortCol} ${order}
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            // Đếm tổng số bản ghi
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as total FROM active_history'
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
            console.error('❌ Lỗi History.getAllData:', error.message);
            throw error;
        }
    }

    //  * Tạo bản ghi lịch sử mới
    static async createAction(deviceId, action, status) {
        try {

            const [result] = await pool.query(
                'INSERT INTO active_history (device_id, action, status) VALUES (?, ?, ?)',
                [deviceId, action.toUpperCase(), status]
            );

            console.log(`✅ Đã lưu history: DeviceID=${deviceId}, Action=${action}, Status=${status}, ID=${result.insertId}`);

            return {
                id: result.insertId,
                device_id: deviceId,
                action: action.toUpperCase(),
                status: status,
                created_at: new Date()
            };
        } catch (error) {
            console.error('❌ Lỗi History.create:', error.message);
            throw error;
        }
    }

    //  Cập nhật trạng thái của bản ghi lịch sử
    static async updateStatus(historyId, status) {
        try {
            await pool.query(
                'UPDATE active_history SET status = ? WHERE id = ?',
                [status, historyId]
            );
            console.log(`✅ Đã cập nhật history [${historyId}] -> Status: ${status}`);
        } catch (error) {
            console.error('❌ Lỗi History.updateStatus:', error.message);
            throw error;
        }
    }

    // Tìm kiếm lịch sử theo điều kiện

    static async search(filters = {}, page = 1, limit = 20, sortBy = 'id', sortOrder = 'desc') {
        try {
            // Mapping sort columns
            const sortMap = {
                'id': 'h.id',
                'device': 'd.name',
                'action': 'h.action',
                'status': 'h.status',
                'time': 'h.created_at'
            };
            const sortCol = sortMap[sortBy] || 'h.id';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            let whereClause = '1=1';
            const params = [];

            // Xử lý từ khóa tìm kiếm chung
            if (filters.keyword) {
                const key = `%${filters.keyword}%`;
                whereClause += ` AND (
                    d.name LIKE ? OR
                    DATE_FORMAT(h.created_at, '%H:%i:%s %d/%m/%Y') LIKE ? OR
                    CAST(h.created_at AS CHAR) LIKE ?
                )`;
                params.push(key, key, key);
            }

            // Lọc theo thiết bị
            if (filters.deviceId) {
                whereClause += ' AND h.device_id = ?';
                params.push(filters.deviceId);
            }

            // Lọc theo tên thiết bị
            if (filters.deviceName) {
                whereClause += ' AND d.name LIKE ?';
                params.push(`%${filters.deviceName}%`);
            }

            // Lọc theo hành động
            if (filters.action) {
                whereClause += ' AND h.action = ?';
                params.push(filters.action);
            }

            // Lọc theo trạng thái
            if (filters.status) {
                whereClause += ' AND h.status = ?';
                params.push(filters.status);
            }

            // Lọc theo thời gian
            if (filters.dateFrom) {
                whereClause += ' AND h.created_at >= ?';
                params.push(filters.dateFrom);
            }
            if (filters.dateTo) {
                whereClause += ' AND h.created_at <= ?';
                params.push(filters.dateTo);
            }

            // Thêm pagination params
            const offset = (page - 1) * limit;
            params.push(limit, offset);

            // Query với filters
            const [rows] = await pool.query(
                `SELECT h.id, h.device_id, d.name as device, 
                        h.action, h.status, h.created_at as time
                 FROM active_history h
                 LEFT JOIN devices d ON h.device_id = d.id
                 WHERE ${whereClause}
                 ORDER BY ${sortCol} ${order}
                 LIMIT ? OFFSET ?`,
                params
            );

            // Đếm tổng với filters
            const countParams = params.slice(0, -2);
            const [countResult] = await pool.query(
                `SELECT COUNT(*) as total 
                 FROM active_history h
                 LEFT JOIN devices d ON h.device_id = d.id
                 WHERE ${whereClause}`,
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
            console.error('❌ Lỗi History.search:', error.message);
            throw error;
        }
    }

}

module.exports = History;
