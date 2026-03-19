/**
 * ===========================================
 * GIAO DIỆN HƯỚNG DỮ LIỆU (DATA-DRIVEN UI)
 * ===========================================
 * Định nghĩa toàn bộ cấu hình Cảm biến và Thiết bị tại đây.
 * Thêm/Sửa/Xóa phần tử trong mảng này thì giao diện tự động cập nhật.
 */

export const SENSORS = [
    { 
        id: 'temperature', 
        name: 'TEMPERATURE', 
        unit: '°C', 
        icon: 'thermostat', 
        color: '#ff4d4d', 
        chartColor: 'rgba(255, 77, 77, 0.1)',
        thresholds: { warn: 28, alert: 35, mode: 'high' } 
    },
    { 
        id: 'humidity', 
        name: 'HUMIDITY', 
        unit: '%', 
        icon: 'humidity_percentage', 
        color: '#00d2ff', 
        chartColor: 'rgba(0, 210, 255, 0.1)',
        thresholds: { warn: 70, alert: 90, mode: 'high' } 
    },
    { 
        id: 'light', 
        name: 'LIGHT INTENSITY', 
        unit: 'lux', 
        icon: 'wb_sunny', 
        color: '#ffea00', 
        chartColor: 'rgba(255, 234, 0, 0.6)',
        thresholds: { warn: 400, alert: 200, mode: 'low' } 
    }
];

export const DEVICES = [
    {
        id: 'lamp',
        name: 'Lamp',
        icon: 'lightbulb',
        cardClass: 'lamp',
        color: 'var(--color-accent-light)', // Được dùng ở History Table
    },
    {
        id: 'fan',
        name: 'Fan',
        icon: 'mode_fan',
        cardClass: 'fan',
        color: 'var(--color-primary)',
    },
    {
        id: 'pump',
        name: 'Pump',
        icon: 'water_drop',
        cardClass: 'water',
        color: 'var(--color-accent-hum)', // Đồng bộ biến CSS cho Pump
    },
];

// Thời gian gọi API (2 giây)
export const REFRESH_INTERVAL = 2000;

