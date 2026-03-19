import { useState, useRef } from 'react';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { formatDateTime } from '../utils';
import { DEVICES } from '../config';

// Hàm lấy class CSS cho badge trạng thái
function getStatusClass(status, action) {
    if (status === 'Thành công' || status === 'Thất bại - Timeout') {
        return action?.toLowerCase() || '';
    }
    if (status === 'Waiting') return 'waiting';
    return status?.toLowerCase() || '';
}

// Hàm lấy text hiển thị cho badge trạng thái
function getStatusText(status, action) {
    if (status === 'Thành công' || status === 'Thất bại - Timeout') {
        return action || '--';
    }
    if (status === 'Waiting') return 'Waiting...';
    return status || '--';
}

/**
 * Active History Page - Dùng data-driven UI
 */
export default function ActiveHistoryPage() {
    const { showToast, ToastContainer } = useToast();
    const [filterOpen, setFilterOpen] = useState(false);

    const {
        data, pagination, currentPage, pageSize,
        sortColumn, sortOrder, loading,
        handleSort, handleSearch, handleApplyFilters, handleResetFilters, goToPage, handlePageSizeChange
    } = useTableData('/active-history');

    const deviceRef = useRef();
    const statusRef = useRef();
    const dateFromRef = useRef();
    const dateToRef = useRef();

    const columns = ['id', 'device', 'action', 'status', 'time'];

    const applyFilters = () => {
        const device = deviceRef.current?.value || '';
        const status = statusRef.current?.value || '';
        const dateFrom = dateFromRef.current?.value || '';
        const dateTo = dateToRef.current?.value || '';

        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
            return;
        }

        handleApplyFilters({ device, status, dateFrom, dateTo });
    };

    const resetFilters = () => {
        [deviceRef, statusRef, dateFromRef, dateToRef]
            .forEach(ref => { if (ref.current) ref.current.value = ''; });
        handleResetFilters();
    };

    return (
        <>
            {ToastContainer}
            <main className="main-content">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Active History</h1>
                    <div className="page-header-actions">
                        <div className="search-wrapper">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by device, time"
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

                {/* Filter Panel */}
                <div className={`filter-panel ${filterOpen ? 'open' : ''}`}>
                    <div className="filter-panel-inner">
                        <div className="filter-group">
                            <label>Device</label>
                            <select ref={deviceRef}>
                                <option value="">All Devices</option>
                                {/* Render động Dropdown từ config DEVICES */}
                                {DEVICES.map(dev => (
                                    <option key={`filter-${dev.id}`} value={dev.id}>{dev.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select ref={statusRef}>
                                <option value="">All Status</option>
                                <option value="ON">ON</option>
                                <option value="OFF">OFF</option>
                                <option value="WAITING">WAITING</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>From</label>
                            <input type="datetime-local" ref={dateFromRef} />
                        </div>
                        <div className="filter-group">
                            <label>To</label>
                            <input type="datetime-local" ref={dateToRef} />
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
                            <span className="material-symbols-outlined">history</span>
                            Device Activity Log
                        </div>
                        <div className="table-count">
                            Total: <span>{pagination.total || 0}</span> records
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                {['ID', 'Device', 'Action', 'Status', 'Time'].map((header, idx) => (
                                    <th key={columns[idx]} onClick={() => handleSort(columns[idx])}>
                                        <div className="th-content">
                                            {header}
                                            <span className="material-symbols-outlined">unfold_more</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!data || data.length === 0) ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                data.map(row => {
                                    // Tìm thông tin device từ config thay vì mảng tĩnh
                                    const deviceInfo = DEVICES.find(d => d.id === row.device?.toLowerCase()) || 
                                                     { icon: 'devices', color: 'var(--color-text-secondary)', name: row.device };
                                                     
                                    return (
                                        <tr key={row.id}>
                                            <td className="id-col">#{row.id}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="material-symbols-outlined" style={{ color: deviceInfo.color, fontSize: '20px' }}>
                                                        {deviceInfo.icon}
                                                    </span>
                                                    <span>{deviceInfo.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${row.action?.toLowerCase()}`}>
                                                    {row.action || '--'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(row.status, row.action)}`}>
                                                    {getStatusText(row.status, row.action)}
                                                </span>
                                            </td>
                                            <td className="time-col">{formatDateTime(row.time)}</td>
                                        </tr>
                                    );
                                })
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
