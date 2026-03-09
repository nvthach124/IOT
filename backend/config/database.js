const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Tạo connection pool để quản lý nhiều connections
 * Pool giúp tái sử dụng connections 
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST ,                      // Host MySQL server
    port: process.env.DB_PORT ,                      // Port MySQL (mặc định 3306)
    user: process.env.DB_USER ,                      // Username MySQL
    password: process.env.DB_PASSWORD ,              // Password MySQL
    database: process.env.DB_NAME ,                  // Tên database
    waitForConnections: true,                        // Chờ nếu hết connections
    connectionLimit: 10,                             // Số connections tối đa trong pool
    queueLimit: 0,                                   // Không giới hạn queue
    enableKeepAlive: true,                           // Giữ connection sống
    keepAliveInitialDelay: 0                         // Delay trước khi keep-alive
});

/**
 * Hàm test kết nối database
 * @returns {Promise<boolean>} - true nếu kết nối thành công
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công!');
        console.log(`   📦 Database: ${process.env.DB_NAME}`);
        console.log(`   🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        connection.release(); // Trả connection về pool
        return true;
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
        return false;
    }
};

// Export pool và hàm test
module.exports = {
    pool,
    testConnection
};
