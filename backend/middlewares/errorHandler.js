/**
 * ===========================================
 * Centralized Error Handler Middleware
 * ===========================================
 * Xử lý tất cả các lỗi xảy ra trong ứng dụng.
 */

const errorHandler = (err, req, res, next) => {
    // Log lỗi thực tế ra console backend để debug
    console.error(`❌ [Error Middleware] ${req.method} ${req.url}`);
    if (err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }

    // Xác định mã lỗi HTTP (mặc định 500)
    const statusCode = err.status || err.statusCode || 500;
    
    // Câu message trả về API
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        // (Optional) Chỉ trả về stack trace khi không phải chuẩn bị ở môi trường production
        // error: process.env.NODE_ENV === 'production' ? {} : err
    });
};

module.exports = errorHandler;
