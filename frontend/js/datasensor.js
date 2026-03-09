/**
 * API: GET /api/data-sensor?page=1&limit=20&keyword=...
 * Filters: tempMin, tempMax, humMin, humMax, lightMin, lightMax, dateFrom, dateTo
 */

let currentPage = 1;
let pageSize = 20;
let sortColumn = 'id';
let sortOrder = 'desc';
let searchQuery = '';
let activeFilters = {};

document.addEventListener('DOMContentLoaded', function () {
    loadSensorData();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function (e) {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            loadSensorData();
        }, 300));
    }

    setupSortButtons();
});

function setupSortButtons() {
    const headers = document.querySelectorAll('.data-table th');
    const columns = ['id', 'temperature', 'humidity', 'light', 'time'];

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
                loadSensorData();
            });
        }
    });
}

async function loadSensorData() {
    try {
        let url = `/data-sensor?page=${currentPage}&limit=${pageSize}&sortBy=${sortColumn}&sortOrder=${sortOrder}`;

        if (searchQuery) {
            url += `&keyword=${encodeURIComponent(searchQuery)}`;
        }

        // Append filter params
        if (activeFilters.tempMin !== undefined && activeFilters.tempMin !== '') {
            url += `&tempMin=${activeFilters.tempMin}`;
        }
        if (activeFilters.tempMax !== undefined && activeFilters.tempMax !== '') {
            url += `&tempMax=${activeFilters.tempMax}`;
        }
        if (activeFilters.humMin !== undefined && activeFilters.humMin !== '') {
            url += `&humMin=${activeFilters.humMin}`;
        }
        if (activeFilters.humMax !== undefined && activeFilters.humMax !== '') {
            url += `&humMax=${activeFilters.humMax}`;
        }
        if (activeFilters.lightMin !== undefined && activeFilters.lightMin !== '') {
            url += `&lightMin=${activeFilters.lightMin}`;
        }
        if (activeFilters.lightMax !== undefined && activeFilters.lightMax !== '') {
            url += `&lightMax=${activeFilters.lightMax}`;
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
    const tbody = document.getElementById('sensor-table-body');
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">Không có dữ liệu</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => `
        <tr>
            <td class="id-col">#${row.id}</td>
            <td class="temp-col">${row.temperature}°C</td>
            <td class="hum-col">${row.humidity}%</td>
            <td class="light-col">${row.light} lux</td>
            <td class="time-col">${formatDateTime(row.time)}</td>
        </tr>
    `).join('');
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
    loadSensorData();
}

function formatDateTime(dateString) {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleString('vi-VN');
}

// ===== FILTER FUNCTIONS =====

function toggleFilterPanel() {
    const panel = document.getElementById('filter-panel');
    const btn = document.getElementById('filter-toggle');
    panel.classList.toggle('open');
    btn.classList.toggle('active');
}

function applyFilters() {
    const tempMin = document.getElementById('filter-temp-min')?.value || '';
    const tempMax = document.getElementById('filter-temp-max')?.value || '';
    const humMin = document.getElementById('filter-hum-min')?.value || '';
    const humMax = document.getElementById('filter-hum-max')?.value || '';
    const lightMin = document.getElementById('filter-light-min')?.value || '';
    const lightMax = document.getElementById('filter-light-max')?.value || '';
    const dateFrom = document.getElementById('filter-date-from')?.value || '';
    const dateTo = document.getElementById('filter-date-to')?.value || '';

    // === Validation ===

    // Temperature range
    if (tempMin !== '' && tempMax !== '' && parseFloat(tempMin) > parseFloat(tempMax)) {
        showToast('Temperature: Min phải nhỏ hơn hoặc bằng Max', 'error');
        return;
    }

    // Humidity range
    if (humMin !== '' && humMax !== '' && parseFloat(humMin) > parseFloat(humMax)) {
        showToast('Humidity: Min phải nhỏ hơn hoặc bằng Max', 'error');
        return;
    }
    if ((humMin !== '' && parseFloat(humMin) < 0) || (humMax !== '' && parseFloat(humMax) > 100)) {
        showToast('Humidity phải nằm trong khoảng 0 – 100%', 'error');
        return;
    }

    // Light range
    if (lightMin !== '' && parseFloat(lightMin) < 0) {
        showToast('Light không được âm', 'error');
        return;
    }
    if (lightMin !== '' && lightMax !== '' && parseFloat(lightMin) > parseFloat(lightMax)) {
        showToast('Light: Min phải nhỏ hơn hoặc bằng Max', 'error');
        return;
    }

    // Date range
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
        return;
    }

    activeFilters = { tempMin, tempMax, humMin, humMax, lightMin, lightMax, dateFrom, dateTo };
    currentPage = 1;
    loadSensorData();
}

function resetFilters() {
    // Clear inputs
    ['filter-temp-min', 'filter-temp-max', 'filter-hum-min', 'filter-hum-max',
        'filter-light-min', 'filter-light-max', 'filter-date-from', 'filter-date-to'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    activeFilters = {};
    currentPage = 1;
    loadSensorData();
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
