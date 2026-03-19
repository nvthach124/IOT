import { useState, useRef } from 'react';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { formatDateTime } from '../utils';
import { SENSORS } from '../config';

/**
 * Data Sensor Page - Dành cho cấu trúc Data-Driven
 */
export default function DataSensorPage() {
    const { showToast, ToastContainer } = useToast();
    const [filterOpen, setFilterOpen] = useState(false);

    const {
        data, pagination, currentPage, pageSize,
        sortColumn, sortOrder, loading,
        handleSort, handleSearch, handleApplyFilters, handleResetFilters, goToPage, handlePageSizeChange
    } = useTableData('/data-sensor');

    // Lưu các hàm tham chiếu Ref linh hoạt dựa trên mảng SENSORS
    const filterRefs = useRef({});
    // Khởi tạo ref cho từng loại sensor (Mỗi sensor có min/max ref)
    if (Object.keys(filterRefs.current).length === 0) {
        SENSORS.forEach(sensor => {
            filterRefs.current[`${sensor.id}Min`] = { current: null };
            filterRefs.current[`${sensor.id}Max`] = { current: null };
        });
        filterRefs.current.dateFrom = { current: null };
        filterRefs.current.dateTo = { current: null };
    }

    // Các cột cố định: id, time. Các cột động: từ SENSORS
    const columns = ['id', ...SENSORS.map(s => s.id), 'time'];

    const applyFilters = () => {
        const filters = {};
        
        // Trích xuất giá trị nhập từ Refs
        SENSORS.forEach(sensor => {
            const minKey = `${sensor.id}Min`;
            const maxKey = `${sensor.id}Max`;
            // Cú pháp rút gọn từ database backend: tempMin, humMin, lightMin
            // Ta mapping tên ID của sensor (temperature) thành tiền tố API (temp)
            const apiPrefix = sensor.id === 'temperature' ? 'temp' : sensor.id === 'humidity' ? 'hum' : sensor.id;
            
            filters[`${apiPrefix}Min`] = filterRefs.current[minKey]?.current?.value || '';
            filters[`${apiPrefix}Max`] = filterRefs.current[maxKey]?.current?.value || '';
        });

        filters.dateFrom = filterRefs.current.dateFrom?.current?.value || '';
        filters.dateTo = filterRefs.current.dateTo?.current?.value || '';

        // Validate cơ bản
        for (const sensor of SENSORS) {
            const apiPrefix =
                sensor.id === 'temperature'
                    ? 'temp'
                    : sensor.id === 'humidity'
                    ? 'hum'
                    : sensor.id;

            const minV = filters[`${apiPrefix}Min`];
            const maxV = filters[`${apiPrefix}Max`];

            const isTemp = sensor.id === 'temperature';

            if (minV !== '' && maxV !== '' && parseFloat(minV) > parseFloat(maxV)) {
                showToast(`${sensor.name}: Min phải nhỏ hơn hoặc bằng Max`, 'error');
                return;
            }

            // Sensor KHÔNG phải nhiệt độ
            if (!isTemp) {
                if (
                    (minV !== '' && parseInt(minV) < 0) ||
                    (maxV !== '' && parseInt(maxV) < 0)
                ) {
                    showToast(`${sensor.name} không được âm`, 'error');
                    return;
                }

                if (
                    (minV !== '' && !Number.isInteger(Number(minV))) ||
                    (maxV !== '' && !Number.isInteger(Number(maxV)))
                ) {
                    showToast(`${sensor.name} phải là số nguyên`, 'error');
                    return;
                }
            }
        }

        if (filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo)) {
            showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
            return;
        }

        handleApplyFilters(filters);
    };

    const resetFilters = () => {
        Object.values(filterRefs.current).forEach(refObj => {
            if (refObj.current) refObj.current.value = '';
        });
        handleResetFilters();
    };

    return (
        <>
            {ToastContainer}
            <main className="main-content">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Data Sensor</h1>
                    <div className="page-header-actions">
                        <div className="search-wrapper">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search data..."
                                onChange={(e) => handleSearch(e.target.value.trim())}
                            />
                        </div>
                        <button
                            className={`filter-toggle-btn ${filterOpen ? 'active' : ''}`}
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                {/* Filter Panel (Sinh Động) */}
                <div className={`filter-panel ${filterOpen ? 'open' : ''}`}>
                    <div className="filter-panel-inner">
                        {SENSORS.map(sensor => {
                            const isTemp = sensor.id === 'temperature';
                            const isIntNonNegative = !isTemp; // 2 sensor còn lại

                            return (
                                <div className="filter-group" key={`filter-${sensor.id}`}>
                                    <label>{sensor.name} ({sensor.unit})</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        
                                        <input
                                            type="number"
                                            step={isTemp ? "0.1" : "1"}
                                            min={isIntNonNegative ? "0" : undefined}
                                            onKeyDown={(e) => {
                                                if (!isTemp && (e.key === '-' || e.key === 'e' || e.key === '.')) {
                                                    e.preventDefault(); // chặn âm + float cho sensor khác
                                                }
                                                if (isTemp && e.key === 'e') {
                                                    e.preventDefault(); // chặn dạng 1e-5
                                                }
                                            }}
                                            ref={(el) => filterRefs.current[`${sensor.id}Min`].current = el}
                                            placeholder="Min"
                                            style={{ width: '80px' }}
                                        />

                                        <span style={{ color: 'var(--color-text-secondary)' }}>–</span>

                                        <input
                                            type="number"
                                            step={isTemp ? "0.1" : "1"}
                                            min={isIntNonNegative ? "0" : undefined}
                                            onKeyDown={(e) => {
                                                if (!isTemp && (e.key === '-' || e.key === 'e' || e.key === '.')) {
                                                    e.preventDefault();
                                                }
                                                if (isTemp && e.key === 'e') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            ref={(el) => filterRefs.current[`${sensor.id}Max`].current = el}
                                            placeholder="Max"
                                            style={{ width: '80px' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="filter-group">
                            <label>From</label>
                            <input type="datetime-local" ref={(el) => filterRefs.current.dateFrom.current = el} />
                        </div>
                        <div className="filter-group">
                            <label>To</label>
                            <input type="datetime-local" ref={(el) => filterRefs.current.dateTo.current = el} />
                        </div>
                        <div className="filter-actions">
                            <button className="filter-btn reset" onClick={resetFilters}>Reset</button>
                            <button className="filter-btn apply" onClick={applyFilters}>Apply</button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="table-container">
                    <div className="table-header">
                        <div className="table-title">
                            <span className="material-symbols-outlined">sensors</span>
                            Sensor Data Records
                        </div>
                        <div className="table-count">
                            Total: <span>{pagination.total || 0}</span> records
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                {/* Header render tự động: ID, Các Cột Sensor, Time */}
                                <th onClick={() => handleSort('id')}>
                                    <div className="th-content">ID<span className="material-symbols-outlined">unfold_more</span></div>
                                </th>
                                
                                {SENSORS.map(sensor => (
                                     <th key={`th-${sensor.id}`} onClick={() => handleSort(sensor.id)}>
                                         <div className="th-content">{sensor.name} ({sensor.unit})<span className="material-symbols-outlined">unfold_more</span></div>
                                     </th>
                                ))}

                                <th onClick={() => handleSort('time')}>
                                    <div className="th-content">Time<span className="material-symbols-outlined">unfold_more</span></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!data || data.length === 0) ? (
                                <tr>
                                    <td colSpan={SENSORS.length + 2} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                data.map(row => (
                                    <tr key={row.id}>
                                        <td className="id-col">#{row.id}</td>
                                        
                                        {/* Render giá trị của từng sensor cột tự động */}
                                        {SENSORS.map(sensor => (
                                            <td key={`td-${sensor.id}-${row.id}`} style={{ color: sensor.color, fontWeight: '500' }}>
                                                {row[sensor.id] ?? '--'} {sensor.unit}
                                            </td>
                                        ))}

                                        <td className="time-col">{formatDateTime(row.time)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination 
                        pagination={pagination} 
                        pageSize={pageSize} 
                        goToPage={goToPage} 
                        onPageSizeChange={handlePageSizeChange} 
                    />
                </div>
            </main>
        </>
    );
}
