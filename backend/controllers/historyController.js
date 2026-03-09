const History = require('../models/History');

/**
 * GET /api/active-history
 * Lấy lịch sử hoạt động với search/pagination
 */
const getHistory = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = 'id',
            sortOrder = 'desc',
            keyword,
            device,
            status,
            dateFrom,
            dateTo
        } = req.query;

        // Build filters object
        const hasFilters = keyword || device || status || dateFrom || dateTo;

        if (hasFilters) {
            const filters = {};
            if (keyword) filters.keyword = keyword;
            if (device) filters.deviceName = device;
            if (status) filters.status = status;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await History.search(
                filters,
                parseInt(page),
                parseInt(limit),
                sortBy,
                sortOrder
            );

            return res.json({
                success: true,
                message: 'Tìm kiếm lịch sử thành công',
                data: result.data,
                pagination: result.pagination
            });
        }

        // Default: lấy danh sách
        const result = await History.getAllData(
            parseInt(page),
            parseInt(limit),
            sortBy,
            sortOrder
        );

        res.json({
            success: true,
            message: 'Lấy lịch sử hoạt động thành công',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('❌ getHistory error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getHistory
};
