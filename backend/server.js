require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const mqttService = require('./services/mqttService');
const Device = require('./models/DeviceModel');

// Lấy port từ environment hoặc mặc định 3000
const PORT = process.env.PORT || 3000;

/**
 * Hàm khởi động server
 */
const startServer = async () => {
    console.log('🚀 IoT Smart Home Server starting...');

    try {
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Database connection failed. Please check .env config.');
            process.exit(1);
        }

        await Device.initializeDefaultDevices();
        mqttService.initialize();

        app.listen(PORT, () => {
            console.log(`✅ Server is running at http://localhost:${PORT}`);
            console.log('--------------------------------------------------');
        });

    } catch (error) {
        console.error('❌ Server startup error:', error.message);
        process.exit(1);
    }
};

// ===== XỬ LÝ SHUTDOWN =====

/**
 * Graceful shutdown - Đóng các kết nối sạch sẽ
 */
const gracefulShutdown = () => {
    console.log('\n🔴 Stopping server...');
    mqttService.disconnect();
    console.log('👋 Server stopped.');
    process.exit(0);
};

// Lắng nghe các tín hiệu tắt
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Kill command

// Xử lý uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ===== KHỞI ĐỘNG =====
startServer();
