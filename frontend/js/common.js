// ===== CẤU HÌNH API =====

/**
 * Base URL của API backend
 * Thay đổi khi deploy lên production
 */
const API_BASE_URL = window.location.origin + '/api';

// ===== HÀM FETCH DATA =====

/**
 * Wrapper function cho fetch API với error handling
 * @param {string} endpoint - API endpoint (không bao gồm base URL)
 * @param {Object} options - Fetch options (method, body, headers...)
 * @returns {Promise<Object>} - Response data
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;

        // Default headers
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`❌ API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Response data
 */
async function apiGet(endpoint, params = {}) {
    // Build query string từ params
    const queryString = Object.keys(params).length > 0
        ? '?' + new URLSearchParams(params).toString()
        : '';

    return fetchAPI(endpoint + queryString, { method: 'GET' });
}

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - Response data
 */
async function apiPost(endpoint, body = {}) {
    return fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format số với đơn vị
 * @param {number} value - Giá trị số
 * @param {string} unit - Đơn vị
 * @param {number} decimals - Số chữ số thập phân
 * @returns {string} - Chuỗi đã format
 */
function formatValue(value, unit = '', decimals = 1) {
    if (value === undefined || value === null) return '--';
    const num = parseFloat(value).toFixed(decimals);
    return `${num}${unit}`;
}

/**
 * Format ngày giờ theo định dạng Việt Nam
 * @param {string|Date} dateString - Chuỗi ngày hoặc Date object
 * @returns {string} - Ngày giờ đã format
 */
function formatDateTime(dateString) {
    if (!dateString) return '--';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Nếu đã được format từ server
        return dateString;
    }

    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Debounce function - Trì hoãn thực thi
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Hàm đã debounce
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Tạo HTML cho pagination
 * @param {Object} pagination - Object chứa page, totalPages
 * @param {Function} onPageChange - Callback khi đổi trang
 * @returns {string} - HTML string
 */
function createPaginationHTML(pagination, containerId) {
    const { page, totalPages, total } = pagination;

    if (totalPages <= 1) return '';

    let html = `
        <div class="flex items-center justify-between mt-4 text-sm">
            <div class="text-slate-400">
                Trang ${page}/${totalPages} (${total} bản ghi)
            </div>
            <div class="flex gap-2">
    `;

    // Nút Previous
    html += `
        <button onclick="changePage(${page - 1})" 
                class="px-3 py-1 rounded ${page <= 1 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary/80 text-white'}"
                ${page <= 1 ? 'disabled' : ''}>
            ‹ Trước
        </button>
    `;

    // Các số trang
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button onclick="changePage(1)" class="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">1</button>`;
        if (startPage > 2) html += `<span class="px-2 text-slate-500">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === page;
        html += `
            <button onclick="changePage(${i})" 
                    class="px-3 py-1 rounded ${isActive ? 'bg-primary text-white' : 'bg-slate-700 hover:bg-slate-600'}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="px-2 text-slate-500">...</span>`;
        html += `<button onclick="changePage(${totalPages})" class="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">${totalPages}</button>`;
    }

    // Nút Next
    html += `
        <button onclick="changePage(${page + 1})" 
                class="px-3 py-1 rounded ${page >= totalPages ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary/80 text-white'}"
                ${page >= totalPages ? 'disabled' : ''}>
            Sau ›
        </button>
    `;

    html += `</div></div>`;

    return html;
}

/**
 * Hiển thị thông báo toast (góc phải trên)
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'info') {
    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    // Style và icon theo type
    const config = {
        success: {
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            icon: 'check_circle',
            iconColor: '#d1fae5'
        },
        error: {
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            icon: 'error',
            iconColor: '#fee2e2'
        },
        warning: {
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: 'warning',
            iconColor: '#fef3c7'
        },
        info: {
            gradient: 'linear-gradient(135deg, #34a7ad 0%, #2d8f94 100%)',
            icon: 'info',
            iconColor: '#ccf5f7'
        }
    };

    const { gradient, icon, iconColor } = config[type] || config.info;

    toast.style.background = gradient;
    toast.innerHTML = `
        <span class="material-symbols-outlined" style="color: ${iconColor}; font-size: 20px;">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Animation show (slide from right)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto hide sau 5 giây
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/**
 * State tracking cho sensor alerts
 */
const alertStates = {
    temperature: { active: false, alertId: null, type: null },
    humidity: { active: false, alertId: null, type: null },
    light: { active: false, alertId: null, type: null }
};

/**
 * Hiển thị persistent alert (không tự ẩn)
 * @param {string} id - Unique ID cho alert
 * @param {string} title - Tiêu đề
 * @param {string} message - Nội dung
 * @param {string} type - Loại: 'danger', 'warning', 'info'
 * @param {string} icon - Material icon name
 */
function showPersistentAlert(id, title, message, type = 'warning', icon = 'warning') {
    // Kiểm tra xem alert đã tồn tại chưa
    if (document.getElementById(id)) {
        return; // Đã có alert này rồi
    }

    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.id = id;
    alert.className = `persistent-alert alert-${type}`;
    alert.innerHTML = `
        <span class="material-symbols-outlined alert-icon">${icon}</span>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close" onclick="removePersistentAlert('${id}')">
            <span class="material-symbols-outlined">close</span>
        </button>
    `;

    container.appendChild(alert);
}

/**
 * Xóa persistent alert
 * @param {string} id - ID của alert cần xóa
 */
function removePersistentAlert(id) {
    const alert = document.getElementById(id);
    if (alert) {
        alert.classList.add('removing');
        setTimeout(() => alert.remove(), 300);
    }
}

/**
 * Kiểm tra ngưỡng sensor và hiển thị cảnh báo
 * @param {Object} sensorData - Dữ liệu sensor {temperature, humidity, light}
 */
function checkSensorThresholds(sensorData) {
    if (!sensorData) return;

    const { temperature, humidity, light } = sensorData;

    // ===== NHIỆT ĐỘ =====
    if (temperature !== undefined && temperature !== null) {
        const tempNum = parseFloat(temperature);
        const isTooHot = tempNum > 40;
        const isTooCold = tempNum < 10;
        const isAbnormal = isTooHot || isTooCold;

        if (isAbnormal && !alertStates.temperature.active) {
            // Vượt ngưỡng lần đầu → Hiển thị alert
            const alertId = 'alert-temperature';
            const type = isTooHot ? 'danger' : 'warning';
            const title = isTooHot ? '🌡️ Nhiệt độ quá cao!' : '❄️ Nhiệt độ quá thấp!';
            const message = isTooHot
                ? `Nhiệt độ hiện tại: ${tempNum}°C (> 40°C). Cần làm mát ngay!`
                : `Nhiệt độ hiện tại: ${tempNum}°C (< 10°C). Cần sưởi ấm!`;

            showPersistentAlert(alertId, title, message, type, 'thermostat');
            alertStates.temperature.active = true;
            alertStates.temperature.alertId = alertId;
            alertStates.temperature.type = isTooHot ? 'hot' : 'cold';
        } else if (!isAbnormal && alertStates.temperature.active) {
            // Về bình thường → Thông báo an toàn và xóa alert
            showToast(`✅ Nhiệt độ đã về mức an toàn: ${tempNum}°C`, 'success');
            removePersistentAlert(alertStates.temperature.alertId);
            alertStates.temperature.active = false;
            alertStates.temperature.alertId = null;
            alertStates.temperature.type = null;
        }
    }

    // ===== ĐỘ ẨM =====
    if (humidity !== undefined && humidity !== null) {
        const humNum = parseFloat(humidity);
        const isTooHigh = humNum > 90;
        const isTooLow = humNum < 20;
        const isAbnormal = isTooHigh || isTooLow;

        if (isAbnormal && !alertStates.humidity.active) {
            // Vượt ngưỡng lần đầu → Hiển thị alert
            const alertId = 'alert-humidity';
            const type = isTooHigh ? 'danger' : 'warning';
            const title = isTooHigh ? '💧 Độ ẩm quá cao!' : '🏜️ Độ ẩm quá thấp!';
            const message = isTooHigh
                ? `Độ ẩm hiện tại: ${humNum}% (> 90%). Nguy cơ nấm mốc!`
                : `Độ ẩm hiện tại: ${humNum}% (< 20%). Không khí quá khô!`;

            showPersistentAlert(alertId, title, message, type, 'water_drop');
            alertStates.humidity.active = true;
            alertStates.humidity.alertId = alertId;
            alertStates.humidity.type = isTooHigh ? 'high' : 'low';
        } else if (!isAbnormal && alertStates.humidity.active) {
            // Về bình thường → Thông báo an toàn và xóa alert
            showToast(`✅ Độ ẩm đã về mức an toàn: ${humNum}%`, 'success');
            removePersistentAlert(alertStates.humidity.alertId);
            alertStates.humidity.active = false;
            alertStates.humidity.alertId = null;
            alertStates.humidity.type = null;
        }
    }

    // ===== ÁNH SÁNG =====
    if (light !== undefined && light !== null) {
        const lightNum = parseFloat(light);
        const isTooLow = lightNum < 200;

        if (isTooLow && !alertStates.light.active) {
            // Vượt ngưỡng lần đầu → Hiển thị alert
            const alertId = 'alert-light';
            showPersistentAlert(
                alertId,
                '💡 Ánh sáng quá yếu!',
                `Cường độ ánh sáng: ${lightNum} lux (< 200). Cần bật đèn!`,
                'warning',
                'light_mode'
            );
            alertStates.light.active = true;
            alertStates.light.alertId = alertId;
        } else if (!isTooLow && alertStates.light.active) {
            // Về bình thường → Thông báo an toàn và xóa alert
            showToast(`✅ Ánh sáng đã đủ: ${lightNum} lux`, 'success');
            removePersistentAlert(alertStates.light.alertId);
            alertStates.light.active = false;
            alertStates.light.alertId = null;
        }
    }
}

/**
 * Hiển thị loading overlay
 * @param {boolean} show - Hiển thị hay ẩn
 */
function showLoading(show = true) {
    let loader = document.getElementById('global-loader');

    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'fixed inset-0 bg-background-dark/50 flex items-center justify-center z-50';
            loader.innerHTML = `
                <div class="bg-surface p-6 rounded-xl flex flex-col items-center gap-3">
                    <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm text-slate-400">Đang tải...</span>
                </div>
            `;
            document.body.appendChild(loader);
        }
    } else {
        if (loader) {
            loader.remove();
        }
    }
}

// ===== EXPORT CHO GLOBAL ACCESS =====
// Đặt các function vào window object để có thể gọi từ HTML
window.API_BASE_URL = API_BASE_URL;
window.fetchAPI = fetchAPI;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.formatValue = formatValue;
window.formatDateTime = formatDateTime;
window.debounce = debounce;
window.createPaginationHTML = createPaginationHTML;
window.showToast = showToast;
window.showLoading = showLoading;
