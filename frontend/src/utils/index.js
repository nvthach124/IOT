/**
 * Format số với đơn vị
 */
export function formatValue(value, unit = '', decimals = 1) {
    if (value === undefined || value === null) return '--';
    const num = parseFloat(value).toFixed(decimals);
    return `${num}${unit}`;
}

/**
 * Format ngày giờ theo định dạng Việt Nam
 */
export function formatDateTime(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
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
 * Debounce function
 */
export function debounce(func, wait = 300) {
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
