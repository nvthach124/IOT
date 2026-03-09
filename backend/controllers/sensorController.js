const Sensor = require('../models/Sensor');

/**
 * GET /api/data-sensors
 */
const getSensorData = async (req, res) => {
    try {
        const { type } = req.query;

        if (type === 'dashboard') {
            return getDashBoardData(req, res);
        }

        return getSensorTable(req, res);
    } catch (error) {
        console.error('❌ getSensorData error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

/**
 * Lấy dữ liệu table với search/pagination
 */
const getSensorTable = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = 'id',
            sortOrder = 'desc',
            keyword,
            tempMin, tempMax,
            humMin, humMax,
            lightMin, lightMax,
            dateFrom, dateTo
        } = req.query;

        // Build filters object
        const hasFilters = keyword || tempMin || tempMax || humMin || humMax || lightMin || lightMax || dateFrom || dateTo;

        if (hasFilters) {
            const filters = {};
            if (keyword) filters.keyword = keyword;
            if (tempMin) filters.tempMin = parseFloat(tempMin);
            if (tempMax) filters.tempMax = parseFloat(tempMax);
            if (humMin) filters.humMin = parseFloat(humMin);
            if (humMax) filters.humMax = parseFloat(humMax);
            if (lightMin) filters.lightMin = parseFloat(lightMin);
            if (lightMax) filters.lightMax = parseFloat(lightMax);
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await Sensor.search(
                filters,
                parseInt(page),
                parseInt(limit),
                sortBy,
                sortOrder
            );

            return res.json({
                success: true,
                message: 'Tìm kiếm thành công',
                data: result.data,
                pagination: result.pagination
            });
        }

        // Default: lấy danh sách
        const result = await Sensor.getAllData(
            parseInt(page),
            parseInt(limit),
            sortBy,
            sortOrder
        );

        res.json({
            success: true,
            message: 'Lấy dữ liệu sensor thành công',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('❌ getSensorTable error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};


const getDashBoardData = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const data = await Sensor.getData(parseInt(limit));

        res.json({
            success: true,
            message: 'Lấy dữ liệu thành công',
            data: data
        });
    } catch (error) {
        console.error('❌ getDashBoardData error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getSensorData
};
