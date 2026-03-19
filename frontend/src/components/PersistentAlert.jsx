import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Persistent Alert system - giữ nguyên logic từ common.js checkSensorThresholds
 */
export function usePersistentAlerts() {
    const [alerts, setAlerts] = useState([]);
    const alertStatesRef = useRef({
        temperature: { active: false, alertId: null, type: null },
        humidity: { active: false, alertId: null, type: null },
        light: { active: false, alertId: null, type: null },
    });

    const showAlert = useCallback((id, title, message, type = 'warning', icon = 'warning') => {
        setAlerts(prev => {
            if (prev.find(a => a.id === id)) return prev;
            return [...prev, { id, title, message, type, icon }];
        });
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, removing: true } : a));
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }, 300);
    }, []);

    const checkSensorThresholds = useCallback((sensorData, showToast) => {
        if (!sensorData) return;

        const { temperature, humidity, light } = sensorData;
        const states = alertStatesRef.current;

        // ===== NHIỆT ĐỘ =====
        if (temperature !== undefined && temperature !== null) {
            const tempNum = parseFloat(temperature);
            const isTooHot = tempNum > 40;
            const isTooCold = tempNum < 10;
            const isAbnormal = isTooHot || isTooCold;

            if (isAbnormal && !states.temperature.active) {
                const alertId = 'alert-temperature';
                const type = isTooHot ? 'danger' : 'warning';
                const title = isTooHot ? '🌡️ Nhiệt độ quá cao!' : '❄️ Nhiệt độ quá thấp!';
                const message = isTooHot
                    ? `Nhiệt độ hiện tại: ${tempNum}°C (> 40°C). Cần làm mát ngay!`
                    : `Nhiệt độ hiện tại: ${tempNum}°C (< 10°C). Cần sưởi ấm!`;

                showAlert(alertId, title, message, type, 'thermostat');
                states.temperature = { active: true, alertId, type: isTooHot ? 'hot' : 'cold' };
            } else if (!isAbnormal && states.temperature.active) {
                showToast?.(`✅ Nhiệt độ đã về mức an toàn: ${tempNum}°C`, 'success');
                removeAlert(states.temperature.alertId);
                states.temperature = { active: false, alertId: null, type: null };
            }
        }

        // ===== ĐỘ ẨM =====
        if (humidity !== undefined && humidity !== null) {
            const humNum = parseFloat(humidity);
            const isTooHigh = humNum > 90;
            const isTooLow = humNum < 20;
            const isAbnormal = isTooHigh || isTooLow;

            if (isAbnormal && !states.humidity.active) {
                const alertId = 'alert-humidity';
                const type = isTooHigh ? 'danger' : 'warning';
                const title = isTooHigh ? '💧 Độ ẩm quá cao!' : '🏜️ Độ ẩm quá thấp!';
                const message = isTooHigh
                    ? `Độ ẩm hiện tại: ${humNum}% (> 90%). Nguy cơ nấm mốc!`
                    : `Độ ẩm hiện tại: ${humNum}% (< 20%). Không khí quá khô!`;

                showAlert(alertId, title, message, type, 'water_drop');
                states.humidity = { active: true, alertId, type: isTooHigh ? 'high' : 'low' };
            } else if (!isAbnormal && states.humidity.active) {
                showToast?.(`✅ Độ ẩm đã về mức an toàn: ${humNum}%`, 'success');
                removeAlert(states.humidity.alertId);
                states.humidity = { active: false, alertId: null, type: null };
            }
        }

        // ===== ÁNH SÁNG =====
        if (light !== undefined && light !== null) {
            const lightNum = parseFloat(light);
            const isTooLow = lightNum < 200;

            if (isTooLow && !states.light.active) {
                const alertId = 'alert-light';
                showAlert(alertId, '💡 Ánh sáng quá yếu!',
                    `Cường độ ánh sáng: ${lightNum} lux (< 200). Cần bật đèn!`, 'warning', 'light_mode');
                states.light = { active: true, alertId };
            } else if (!isTooLow && states.light.active) {
                showToast?.(`✅ Ánh sáng đã đủ: ${lightNum} lux`, 'success');
                removeAlert(states.light.alertId);
                states.light = { active: false, alertId: null };
            }
        }
    }, [showAlert, removeAlert]);

    const AlertContainer = createPortal(
        <div id="alert-container">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`persistent-alert alert-${alert.type} ${alert.removing ? 'removing' : ''}`}
                >
                    <span className="material-symbols-outlined alert-icon">{alert.icon}</span>
                    <div className="alert-content">
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-message">{alert.message}</div>
                    </div>
                    <button className="alert-close" onClick={() => removeAlert(alert.id)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            ))}
        </div>,
        document.body
    );

    return { checkSensorThresholds, AlertContainer };
}
