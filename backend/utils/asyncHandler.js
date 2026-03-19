/**
 * ===========================================
 * Async Handler Wrapper
 * ===========================================
 * Wrapper cho các route handler dùng async/await.
 * Tự động bắt lỗi (Exception / Promise Rejection) và truyền vào next()
 * để Error Middleware của Express xử lý, giúp loại bỏ các khối try...catch lặp lại.
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
