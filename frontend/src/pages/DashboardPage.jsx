import { useMemo, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Filler, Tooltip, Legend
} from 'chart.js';
import { useSensorData } from '../hooks/useSensorData';
import { useDeviceControl } from '../hooks/useDeviceControl';
import { useToast } from '../components/Toast';
import { usePersistentAlerts } from '../components/PersistentAlert';
import SensorCard from '../components/SensorCard';
import DeviceCard from '../components/DeviceCard';
import { DEVICES, SENSORS } from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const chartOptions = {
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

/**
 * Dashboard Page
 * Dùng data-driven UI rendering
 */
export default function DashboardPage() {
    const { showToast, ToastContainer } = useToast();
    const { checkSensorThresholds, AlertContainer } = usePersistentAlerts();
    const { deviceStates, processingDevices, toggleDevice, isAnyProcessing } = useDeviceControl(showToast);
    const { sensorData, latestSensor } = useSensorData(isAnyProcessing);

    // Kiểm tra ngưỡng sensor
    useEffect(() => {
        if (latestSensor) {
            checkSensorThresholds(latestSensor, showToast);
        }
    }, [latestSensor, checkSensorThresholds, showToast]);

    // Tính alert class tự động qua cấu hình SENSORS
    const getAlertClass = (sensorId, value) => {
        if (value === null || value === undefined) return '';
        const v = parseFloat(value);
        const sensorConfig = SENSORS.find(s => s.id === sensorId);
        if (!sensorConfig || !sensorConfig.thresholds) return '';

        const { alert, warn, mode } = sensorConfig.thresholds;

        if (mode === 'high') {
            if (v > alert) return 'alert';
            if (v > warn) return 'warn';
        } else if (mode === 'low') {
            if (v < alert) return 'alert';
            if (v < warn) return 'warn';
        }
        return '';
    };

    // Chart data
    const chartData = useMemo(() => {
        if (!sensorData || sensorData.length === 0) {
            return { labels: [], temp: [], hum: [], light: [] };
        }
        const reversed = [...sensorData].reverse();
        const labels = reversed.map(item => {
            const date = new Date(item.time);
            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        });
        return {
            labels,
            temp: reversed.map(item => item.temperature),
            hum: reversed.map(item => item.humidity),
            light: reversed.map(item => item.light),
        };
    }, [sensorData]);

    // Tự động sinh Line Chart dataset từ SENSORS config cho (temp, hum)
    const lineChartDatasets = SENSORS.filter(s => s.id === 'temperature' || s.id === 'humidity').map(sensor => ({
        label: sensor.name,
        data: chartData[sensor.id === 'temperature' ? 'temp' : 'hum'],
        borderColor: sensor.color,
        backgroundColor: sensor.chartColor,
        fill: true,
        tension: 0.4
    }));

    const lineChartData = {
        labels: chartData.labels,
        datasets: lineChartDatasets
    };

    // Tự động sinh Bar Chart dataset từ SENSORS config cho (light)
    const barChartDatasets = SENSORS.filter(s => s.id === 'light').map(sensor => ({
        label: sensor.name,
        data: chartData.light,
        backgroundColor: sensor.chartColor,
        borderColor: sensor.color,
        borderWidth: 1
    }));

    const barChartData = {
        labels: chartData.labels,
        datasets: barChartDatasets
    };

    return (
        <>
            {ToastContainer}
            {AlertContainer}
            <main className="main-content">
                {/* Sensor Cards (Render tự động) */}
                <div className="sensor-cards">
                    {SENSORS.map(sensor => (
                        <SensorCard
                            key={sensor.id}
                            type={sensor.id}
                            value={latestSensor?.[sensor.id]}
                            label={sensor.name}
                            unit={sensor.unit}
                            icon={sensor.icon}
                            alertClass={getAlertClass(sensor.id, latestSensor?.[sensor.id])}
                        />
                    ))}
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                    {/* Charts Section */}
                    <div className="charts-section">
                        <h2 className="section-title">Sensor Analytics</h2>
                        <div className="charts-grid">
                            {/* Line Chart */}
                            <div className="chart-container">
                                <div className="chart-legend">
                                    {SENSORS.filter(s => s.id === 'temperature' || s.id === 'humidity').map(sensor => (
                                        <div className="legend-item" key={`legend-${sensor.id}`}>
                                            <span className="legend-dot" style={{ backgroundColor: sensor.color }}></span> {sensor.name}
                                        </div>
                                    ))}
                                </div>
                                <Line data={lineChartData} options={chartOptions} />
                            </div>

                            {/* Light Chart */}
                            <div className="chart-container">
                                <div className="chart-legend">
                                    {SENSORS.filter(s => s.id === 'light').map(sensor => (
                                        <div className="legend-item" key={`legend-${sensor.id}`}>
                                            <span className="legend-dot" style={{ backgroundColor: sensor.color }}></span> {sensor.name}
                                        </div>
                                    ))}
                                </div>
                                <Bar data={barChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Device Controls */}
                    <div className="device-controls-wrapper">
                        <h2 className="section-title">Device Controls</h2>
                        <div className="device-controls">
                            {DEVICES.map(device => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    isOn={!!deviceStates[device.id]}
                                    isProcessing={processingDevices[device.id]}
                                    onToggle={toggleDevice}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
