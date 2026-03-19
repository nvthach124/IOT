const History = require('../models/HistoryModel');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/active-history
 * Lấy lịch sử hoạt động với search/pagination
 */
const getHistory = asyncHandler(async (req, res) => {
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

    const hasFilters = keyword || device || status || dateFrom || dateTo;
    const result = hasFilters
        ? await History.search(
            {
                ...(keyword && { keyword }),
                ...(device && { deviceName: device }),
                ...(status && { status }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo })
            },
            parseInt(page, 10),
            parseInt(limit, 10),
            sortBy,
            sortOrder
        )
        : await History.getAllData(
            parseInt(page, 10),
            parseInt(limit, 10),
            sortBy,
            sortOrder
        );

    res.json({
        success: true,
        message: Object.keys(req.query).some((k) => ['keyword', 'device', 'dateFrom'].includes(k))
            ? 'Tìm kiếm lịch sử thành công'
            : 'Lấy lịch sử hoạt động thành công',
        data: result.data,
        pagination: result.pagination
    });
});

module.exports = {
    getHistory
};
