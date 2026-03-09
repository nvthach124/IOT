/**
 * ===========================================
 * IoT Smart Home - Dashboard Page
 * ===========================================
 * 
 * API sử dụng:
 * - GET /api/data-sensor?type=dashboard&limit=20 - Lấy dữ liệu chart + latest
 * - POST /api/device-control - Điều khiển thiết bị
 */

const REFRESH_INTERVAL = 2000;
let chartLine = null;
let chartLight = null;

// Cấu hình danh sách thiết bị (cần khớp với backend)
const DEVICE_CONFIG = ['lamp', 'fan', 'pump'];

// Object theo dõi trạng thái processing động
const deviceProcessing = {};
DEVICE_CONFIG.forEach(d => deviceProcessing[d] = false);

// Flag to prevent onchange from triggering during programmatic updates
let isProgrammaticUpdate = false;

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardData();
    initCharts();
    restoreDeviceStates();
    setInterval(loadDashboardData, REFRESH_INTERVAL);
});

/**
 * Load dữ liệu dashboard - Chỉ gọi 1 API duy nhất
 */
async function loadDashboardData() {
    // Skip nếu đang điều khiển thiết bị
    const isAnyProcessing = DEVICE_CONFIG.some(d => deviceProcessing[d]);
    if (isAnyProcessing) {
        return;
    }
    
    try {
        // Gọi API chart - backend sẽ trả về cả chartData và latest
        const response = await apiGet('/data-sensor?type=dashboard&limit=20');
        
        if (response.success) {
            // Cập nhật chart với data array
            if (response.data && response.data.length > 0) {
                updateCharts(response.data);
                
                // Sensor mới nhất = phần tử đầu tiên (đã sort DESC)
                const latestSensor = response.data[0];
                updateSensorUI(latestSensor);
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}


/**
 * Restore trạng thái thiết bị từ localStorage
 */
function restoreDeviceStates() {
    const savedStates = localStorage.getItem('deviceStates');
    const defaultStates = {};
    DEVICE_CONFIG.forEach(d => defaultStates[d] = false);

    if (savedStates) {
        try {
            const states = JSON.parse(savedStates);
            // Merge với default để đảm bảo đủ keys
            const finalStates = { ...defaultStates, ...states };
            updateDeviceUI(finalStates);
        } catch (error) {
            console.error('Error parsing device states:', error);
            localStorage.setItem('deviceStates', JSON.stringify(defaultStates));
            updateDeviceUI(defaultStates);
        }
    } else {
        localStorage.setItem('deviceStates', JSON.stringify(defaultStates));
        updateDeviceUI(defaultStates);
    }
}

/**
 * Lưu trạng thái thiết bị vào localStorage
 */
function saveDeviceState(deviceName, isOn) {
    const savedStates = localStorage.getItem('deviceStates');
    let states = {};
    DEVICE_CONFIG.forEach(d => states[d] = false); // Default

    if (savedStates) {
        try {
            states = JSON.parse(savedStates);
        } catch (error) {
            console.error('Error parsing device states:', error);
        }
    }

    states[deviceName] = isOn;
    localStorage.setItem('deviceStates', JSON.stringify(states));
}


/**
 * Cập nhật UI trạng thái thiết bị (Dynamic)
 */
function updateDeviceUI(states) {
    // Đánh dấu đây là update từ code, không phải từ user click 
    isProgrammaticUpdate = true;

    try {
        DEVICE_CONFIG.forEach(device => {
            // Chỉ cập nhật nếu không WAITING
            if (!deviceProcessing[device]) {
                const toggle = document.getElementById(`${device}-toggle`);
                if (toggle) {
                    const newValue = !!states[device];
                    if (toggle.checked !== newValue) {
                        console.log(`[DEBUG] Updating ${device} toggle: ${toggle.checked} -> ${newValue}`);
                        toggle.checked = newValue;
                    }
                    const statusEl = document.getElementById(`${device}-status`);
                    const card = document.getElementById(`${device}-card`);

                    if (statusEl) {
                        statusEl.textContent = newValue ? 'ON' : 'OFF';
                        statusEl.classList.toggle('on', newValue);
                    }
                    if (card) {
                        card.classList.toggle('off', !newValue);
                    }
                }
            } else {
                console.log(`[DEBUG] Skipping ${device} UI update - processing in progress`);
            }
        });
    } finally {
        // Delay nhẹ trước khi reset flag để đảm bảo event loop đã xử lý xong các "change" event tiềm ẩn
        setTimeout(() => {
            isProgrammaticUpdate = false;
            console.log('[DEBUG] isProgrammaticUpdate reset to FALSE');
        }, 100);
    }
}

/**
 * Cập nhật UI hiển thị sensor
 */
function updateSensorUI(data) {
    const elements = {
        'temp-value': `${data.temperature}`,
        'humidity-value': `${data.humidity}`,
        'light-value': `${data.light}`
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Update active class based on thresholds
    const cardTemp = document.getElementById('card-temp');
    if (cardTemp) {
        if (data.temperature > 35) cardTemp.className = 'card temp alert';
        else if (data.temperature > 28) cardTemp.className = 'card temp warn';
        else cardTemp.className = 'card temp';
    }

    const cardHum = document.getElementById('card-hum');
    if (cardHum) {
        if (data.humidity > 90) cardHum.className = 'card humidity alert';
        else if (data.humidity > 70) cardHum.className = 'card humidity warn';
        else cardHum.className = 'card humidity';
    }
}

/**
 * Khởi tạo các biểu đồ
 */
function initCharts() {
    const lineCtx = document.getElementById('lineChart');
    const lightCtx = document.getElementById('lightChart');

    if (lineCtx) {
        chartLine = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Temperature',
                        data: [],
                        borderColor: '#ff4d4d',
                        backgroundColor: 'rgba(255, 77, 77, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Humidity',
                        data: [],
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: getChartOptions()
        });
    }

    if (lightCtx) {
        chartLight = new Chart(lightCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Light',
                    data: [],
                    backgroundColor: 'rgba(255, 234, 0, 0.6)',
                    borderColor: '#ffea00',
                    borderWidth: 1
                }]
            },
            options: getChartOptions()
        });
    }
}

function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            }
        }
    };
}

/**
 * Cập nhật dữ liệu biểu đồ
 */
function updateCharts(data) {
    if (!data || data.length === 0) return;

    const reversedData = [...data].reverse();
    const labels = reversedData.map(item => {
        const date = new Date(item.time);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    });

    if (chartLine) {
        chartLine.data.labels = labels;
        chartLine.data.datasets[0].data = reversedData.map(item => item.temperature);
        chartLine.data.datasets[1].data = reversedData.map(item => item.humidity);
        chartLine.update('none');
    }

    if (chartLight) {
        chartLight.data.labels = labels;
        chartLight.data.datasets[0].data = reversedData.map(item => item.light);
        chartLight.update('none');
    }
}

/**
 * Điều khiển thiết bị với loading state và timeout
 */
async function toggleDevice(deviceName, isOn) {
    // Nếu là update từ code (ví dụ Dash refresh), bỏ qua để tránh loop
    if (isProgrammaticUpdate) return;

    // Ngăn chặn duplicate requests - nếu WAITING thì bỏ qua
    if (deviceProcessing[deviceName]) {
        console.log(`${deviceName} đang được xử lý, bỏ qua request mới`);
        return;
    }

    console.trace(); // Giúp xem ai đã gọi hàm này

    const toggle = document.getElementById(`${deviceName}-toggle`);
    const statusEl = document.getElementById(`${deviceName}-status`);
    const card = document.getElementById(`${deviceName}-card`);

    // Lưu trạng thái ban đầu
    const previousState = !isOn;

    // Đánh dấu WAITING
    deviceProcessing[deviceName] = true;

    // Disable toggle và hiển thị loading
    toggle.disabled = true;
    if (statusEl) {
        statusEl.textContent = 'Waiting...';
        statusEl.classList.remove('on');
        statusEl.classList.add('loading');
    }

    const timeoutId = setTimeout(() => {
        console.warn(`⚠️ Timeout frontend: ${deviceName} không phản hồi`);

        isProgrammaticUpdate = true;
        toggle.checked = previousState;

        //Cập nhật lại localStorage về trạng thái cũ
        saveDeviceState(deviceName, previousState);

        // Delay reset flag để đảm bảo event "change" (nếu có) bị chặn
        setTimeout(() => {
            isProgrammaticUpdate = false;
        }, 300);

        toggle.disabled = false;

        if (statusEl) {
            statusEl.textContent = previousState ? 'ON' : 'OFF';
            statusEl.classList.remove('loading');
            if (previousState) statusEl.classList.add('on');
        }

        if (card) {
            card.classList.toggle('off', !previousState);
        }

        showToast(`Không nhận được phản hồi từ ${deviceName}. Vui lòng thử lại!`, 'error');


    }, 5000);

    try {
        const response = await apiPost('/device-control', {
            device: deviceName,
            status: isOn ? 'on' : 'off'
        });

        // Clear timeout nếu có response
        clearTimeout(timeoutId);

        if (response.success) {


            toggle.disabled = false;
            if (statusEl) {
                statusEl.textContent = isOn ? 'ON' : 'OFF';
                statusEl.classList.remove('loading');
                statusEl.classList.toggle('on', isOn);
            }
            if (card) {
                card.classList.toggle('off', !isOn);
            }
            console.log(`HELLLO11111`);
            // Lưu trạng thái vào localStorage (chỉ khi phần cứng phản hồi thành công)
            saveDeviceState(deviceName, isOn);

            // Clear processing flag sau khi UI ổn định
            setTimeout(() => {
                deviceProcessing[deviceName] = false;
            }, 200);


        } else {
            // Revert UI - đánh dấu là programmatic để tránh loop
            isProgrammaticUpdate = true;
            toggle.checked = previousState;

            // Cập nhật lại localStorage về trạng thái cũ để refresh không re-trigger
            saveDeviceState(deviceName, previousState);

            // Delay reset flag để đảm bảo event "change" (nếu có) bị chặn
            setTimeout(() => {
                isProgrammaticUpdate = false;
                console.log(`[DEBUG] isProgrammaticUpdate reset to FALSE for ${deviceName}`);
            }, 200);

            toggle.disabled = false;

            if (statusEl) {
                statusEl.textContent = previousState ? 'ON' : 'OFF';
                statusEl.classList.remove('loading');
                if (previousState) statusEl.classList.add('on');
            }
            if (card) {
                card.classList.toggle('off', !previousState);
            }

            // Clear processing flag
            setTimeout(() => {
                deviceProcessing[deviceName] = false;
            }, 200);
        }
    } catch (error) {
        clearTimeout(timeoutId);

        // Revert UI - đánh dấu là programmatic để tránh loop
        isProgrammaticUpdate = true;
        toggle.checked = previousState;

        // Cập nhật lại localStorage về trạng thái cũ
        saveDeviceState(deviceName, previousState);

        setTimeout(() => {
            isProgrammaticUpdate = false;
            console.log(`[DEBUG] isProgrammaticUpdate reset to FALSE for ${deviceName}`);
        }, 200);

        toggle.disabled = false;

        if (statusEl) {
            statusEl.textContent = previousState ? 'ON' : 'OFF';
            statusEl.classList.remove('loading');
            if (previousState) statusEl.classList.add('on');
        }
        if (card) {
            card.classList.toggle('off', !previousState);
        }

        showToast('Không thể kết nối server', 'error');

        // Clear processing flag
        setTimeout(() => {
            deviceProcessing[deviceName] = false;
        }, 300);
    }
}

// Export
window.toggleDevice = toggleDevice;
