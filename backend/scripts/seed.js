const { pool } = require('../config/database');
const { DEVICES } = require('../config/constants');

async function seed() {
    console.log('🚀 Bắt đầu tạo dữ liệu mẫu...');

    try {
        await pool.query('SELECT 1');
        console.log('✅ Đã kết nối Database');

        console.log('📊 Đang tạo 1 dữ liệu Sensor...');
        const sensorData = [
            [22.5, 64, 550, new Date()] // [temperature, humidity, light, created_at]
        ];

        const sensorQuery = 'INSERT INTO datasensor (temperature, humidity, light, created_at) VALUES ?';
        await pool.query(sensorQuery, [sensorData]);
        console.log('✅ Đã thêm 1 bản ghi Sensor');

        const activeHistoryData = [
            [1, 'ON', 'ON', '2025-01-01 00:00:00'],
            [2, 'OFF', 'OFF', '2025-03-04 00:00:00'],
            [3, 'ON', 'ON', '2025-05-06 00:00:00']
        ];

        const activeHistoryQuery = 'INSERT INTO active_history (device_id, action, status, created_at) VALUES ?';
        await pool.query(activeHistoryQuery, [activeHistoryData]);
        console.log('✅ Đã thêm 1 bản ghi Active History');

        console.log('🎉 Hoàn thành!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi seeding:', error);
        process.exit(1);
    }
}

seed();
