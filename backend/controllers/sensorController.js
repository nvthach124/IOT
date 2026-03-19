const Sensor = require('../models/SensorModel');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/data-sensors
 */
const getSensorData = asyncHandler(async (req, res) => {
    const { type } = req.query;

    if (type === 'dashboard') {
        return getDashBoardData(req, res);
    }

    return getSensorTable(req, res);
});

/**
 * Lấy dữ liệu table với search/pagination
 */
const getSensorTable = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        sortBy = 'id',
        sortOrder = 'desc',
        keyword,
        tempMin,
        tempMax,
        humMin,
        humMax,
        lightMin,
        lightMax,
        dateFrom,
        dateTo
    } = req.query;

    const hasFilters = keyword || tempMin || tempMax || humMin || humMax || lightMin || lightMax || dateFrom || dateTo;

    const result = hasFilters
        ? await Sensor.search(
            {
                ...(keyword && { keyword }),
                ...(tempMin && { tempMin: parseFloat(tempMin) }),
                ...(tempMax && { tempMax: parseFloat(tempMax) }),
                ...(humMin && { humMin: parseFloat(humMin) }),
                ...(humMax && { humMax: parseFloat(humMax) }),
                ...(lightMin && { lightMin: parseFloat(lightMin) }),
                ...(lightMax && { lightMax: parseFloat(lightMax) }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo })
            },
            parseInt(page, 10),
            parseInt(limit, 10),
            sortBy,
            sortOrder
        )
        : await Sensor.getAllData(
            parseInt(page, 10),
            parseInt(limit, 10),
            sortBy,
            sortOrder
        );

    res.json({
        success: true,
        message: Object.keys(req.query).some((k) => ['keyword', 'tempMin', 'dateFrom'].includes(k))
            ? 'Tìm kiếm thành công'
            : 'Lấy dữ liệu sensor thành công',
        data: result.data,
        pagination: result.pagination
    });
});

const getDashBoardData = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    const data = await Sensor.getData();

    res.json({
        success: true,
        message: 'Lấy dữ liệu thành công',
        data: data
    });
});

module.exports = {
    getSensorData
};
