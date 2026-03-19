import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '../api';
import { debounce } from '../utils';

/**
 * Hook tái sử dụng cho Data Sensor và Active History
 * Logic giữ nguyên từ datasensor.js / activeHistory.js
 */
export function useTableData(endpoint, defaultSortColumn = 'id') {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [sortColumn, setSortColumn] = useState(defaultSortColumn);
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${endpoint}?page=${currentPage}&limit=${pageSize}&sortBy=${sortColumn}&sortOrder=${sortOrder}`;

            if (searchQuery) {
                url += `&keyword=${encodeURIComponent(searchQuery)}`;
            }

            // Append filters
            Object.entries(activeFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    url += `&${key}=${encodeURIComponent(value)}`;
                }
            });

            const response = await apiGet(url);

            if (response.success) {
                setData(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [endpoint, currentPage, pageSize, sortColumn, sortOrder, searchQuery, activeFilters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSort = useCallback((column) => {
        if (sortColumn === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortOrder('desc');
        }
    }, [sortColumn]);

    const handleSearch = useCallback(
        debounce((query) => {
            setSearchQuery(query);
            setCurrentPage(1);
        }, 300),
        []
    );

    const handleApplyFilters = useCallback((filters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setActiveFilters({});
        setCurrentPage(1);
    }, []);

    const goToPage = useCallback((page) => {
        if (page < 1) return;
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((newSize) => {
        setPageSize(Number(newSize));
        setCurrentPage(1); // Reset vế trang 1 khi đổi số dòng
    }, []);

    return {
        data,
        pagination,
        currentPage,
        pageSize,
        sortColumn,
        sortOrder,
        loading,
        handleSort,
        handleSearch,
        handleApplyFilters,
        handleResetFilters,
        goToPage,
        handlePageSizeChange,
    };
}
