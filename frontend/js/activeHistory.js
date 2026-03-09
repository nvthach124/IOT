/**
 * API: GET /api/active-history?page=1&limit=20&keyword=...
 * Filters: device, status, dateFrom, dateTo
 */

let currentPage = 1;
let pageSize = 20;
let sortColumn = 'id';
let sortOrder = 'desc';
let searchQuery = '';
let activeFilters = {};

document.addEventListener('DOMContentLoaded', function () {
    loadHistoryData();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function (e) {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            loadHistoryData();
        }, 300));
    }

    setupSortButtons();
});

function setupSortButtons() {
    const headers = document.querySelectorAll('.data-table th');
    const columns = ['id', 'device', 'action', 'status', 'time'];

    headers.forEach((header, index) => {
        if (columns[index]) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const column = columns[index];
                if (sortColumn === column) {
                    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = column;
                    sortOrder = 'desc';
                }
                loadHistoryData();
            });
        }
    });
}

async function loadHistoryData() {
    try {
        let url = `/active-history?page=${currentPage}&limit=${pageSize}&sortBy=${sortColumn}&sortOrder=${sortOrder}`;

        if (searchQuery) {
            url += `&keyword=${encodeURIComponent(searchQuery)}`;
        }

        // Append filter params
        if (activeFilters.device) {
            url += `&device=${encodeURIComponent(activeFilters.device)}`;
        }
        if (activeFilters.status) {
            url += `&status=${encodeURIComponent(activeFilters.status)}`;
        }
        if (activeFilters.dateFrom) {
            url += `&dateFrom=${encodeURIComponent(activeFilters.dateFrom)}`;
        }
        if (activeFilters.dateTo) {
            url += `&dateTo=${encodeURIComponent(activeFilters.dateTo)}`;
        }

        const response = await apiGet(url);

        if (response.success) {
            renderTable(response.data);
            renderPagination(response.pagination);
            updateRecordCount(response.pagination);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Không thể tải dữ liệu', 'error');
    }
}

function renderTable(data) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">Không có dữ liệu</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => `
        <tr>
            <td class="id-col">#${row.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${getDeviceIcon(row.device)}
                    <span>${formatDeviceName(row.device)}</span>
                </div>
            </td>
            <td><span class="status-badge ${row.action?.toLowerCase()}">${row.action || '--'}</span></td>
            <td>
                <span class="status-badge ${getStatusClass(row.status, row.action)}">
                    ${getStatusText(row.status, row.action)}
                </span>
            </td>
            <td class="time-col">${formatDateTime(row.time)}</td>
        </tr>
    `).join('');
}

function getDeviceIcon(device) {
    const icons = {
        'lamp': { icon: 'lightbulb', color: 'var(--accent-light)' },
        'fan': { icon: 'mode_fan', color: 'var(--primary)' },
        'pump': { icon: 'water_drop', color: 'var(--accent-hum)' }
    };
    const d = icons[device?.toLowerCase()] || { icon: 'devices', color: 'var(--text-secondary)' };
    return `<span class="material-symbols-outlined" style="color: ${d.color}; font-size: 20px;">${d.icon}</span>`;
}

function formatDeviceName(device) {
    const names = { 'lamp': 'Light', 'fan': 'Fan', 'pump': 'Pump' };
    return names[device?.toLowerCase()] || device;
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    const { currentPage: page, totalPages } = pagination;
    let html = '';

    html += `<button class="pagination-btn" onclick="goToPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}><span class="material-symbols-outlined">chevron_left</span></button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="pagination-page-info">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination-page-info">...</span>`;
        html += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="pagination-btn" onclick="goToPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}><span class="material-symbols-outlined">chevron_right</span></button>`;

    container.innerHTML = html;
}

function updateRecordCount(pagination) {
    const { currentPage: page, total } = pagination;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    document.getElementById('total-records').textContent = total;
    document.getElementById('showing-start').textContent = total > 0 ? start : 0;
    document.getElementById('showing-end').textContent = end;
    document.getElementById('showing-total').textContent = total;
}

function goToPage(page) {
    if (page < 1) return;
    currentPage = page;
    loadHistoryData();
}

function formatDateTime(dateString) {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleString('vi-VN');
}

/**
 * Lấy class cho Status badge
 */
function getStatusClass(status, action) {
    if (status === 'Thành công' || status === 'Thất bại - Timeout') {
        return action?.toLowerCase() || '';
    }
    if (status === 'Waiting') {
        return 'waiting';
    }
    return status?.toLowerCase() || '';
}

/**
 * Lấy text hiển thị cho Status
 */
function getStatusText(status, action) {
    if (status === 'Thành công' || status === 'Thất bại - Timeout') {
        return action || '--';
    }
    if (status === 'Waiting') return 'Waiting...';
    return status || '--';
}

// ===== FILTER FUNCTIONS =====

function toggleFilterPanel() {
    const panel = document.getElementById('filter-panel');
    const btn = document.getElementById('filter-toggle');
    panel.classList.toggle('open');
    btn.classList.toggle('active');
}

function applyFilters() {
    const device = document.getElementById('filter-device')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const dateFrom = document.getElementById('filter-date-from')?.value || '';
    const dateTo = document.getElementById('filter-date-to')?.value || '';

    // === Validation ===

    // Date range
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
        return;
    }

    activeFilters = { device, status, dateFrom, dateTo };
    currentPage = 1;
    loadHistoryData();
}

function resetFilters() {
    // Clear inputs
    const deviceEl = document.getElementById('filter-device');
    const statusEl = document.getElementById('filter-status');
    const dateFromEl = document.getElementById('filter-date-from');
    const dateToEl = document.getElementById('filter-date-to');

    if (deviceEl) deviceEl.value = '';
    if (statusEl) statusEl.value = '';
    if (dateFromEl) dateFromEl.value = '';
    if (dateToEl) dateToEl.value = '';

    activeFilters = {};
    currentPage = 1;
    loadHistoryData();
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

window.goToPage = goToPage;
window.toggleFilterPanel = toggleFilterPanel;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
