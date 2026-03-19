import { useState, useRef, useCallback } from 'react';
import { apiPost } from '../api';
import { DEVICES } from '../config';

/**
 * Hook quản lý thiết bị - Logic giữ nguyên từ dashboard.js
 * Bao gồm: localStorage persistence, timeout, loading/revert states
 */
export function useDeviceControl(showToast) {
    // Khởi tạo states từ localStorage
    const getInitialStates = () => {
        const saved = localStorage.getItem('deviceStates');
        const defaults = {};
        DEVICES.forEach(d => defaults[d.id] = false);

        if (saved) {
            try {
                return { ...defaults, ...JSON.parse(saved) };
            } catch {
                localStorage.setItem('deviceStates', JSON.stringify(defaults));
                return defaults;
            }
        }
        localStorage.setItem('deviceStates', JSON.stringify(defaults));
        return defaults;
    };

    const [deviceStates, setDeviceStates] = useState(getInitialStates);
    const [processingDevices, setProcessingDevices] = useState({});

    // Ref to track if any device is processing (for sensor polling skip)
    const isAnyProcessing = Object.values(processingDevices).some(Boolean);

    const saveDeviceState = useCallback((deviceName, isOn) => {
        const saved = localStorage.getItem('deviceStates');
        let states = {};
        DEVICES.forEach(d => states[d.id] = false);
        if (saved) {
            try { states = JSON.parse(saved); } catch { }
        }
        states[deviceName] = isOn;
        localStorage.setItem('deviceStates', JSON.stringify(states));
    }, []);

    const toggleDevice = useCallback(async (deviceName, isOn) => {
        // Ngăn duplicate requests
        if (processingDevices[deviceName]) {
            console.log(`${deviceName} đang được xử lý, bỏ qua`);
            return;
        }

        const previousState = !isOn;

        // Đánh dấu WAITING
        setProcessingDevices(prev => ({ ...prev, [deviceName]: 'waiting' }));
        setDeviceStates(prev => ({ ...prev, [deviceName]: isOn }));

        const timeoutId = setTimeout(() => {
            console.warn(`⚠️ Timeout frontend: ${deviceName} không phản hồi`);
            setDeviceStates(prev => ({ ...prev, [deviceName]: previousState }));
            saveDeviceState(deviceName, previousState);
            setProcessingDevices(prev => ({ ...prev, [deviceName]: false }));
            showToast(`Không nhận được phản hồi từ ${deviceName}. Vui lòng thử lại!`, 'error');
            console.log("oke");
            // return;
        }, 5000);

        try {
            const response = await apiPost('/device-control', {
                device: deviceName,
                status: isOn ? 'on' : 'off'
            });
console.log(deviceName);
            
            clearTimeout(timeoutId);

            if (response.success) {
                saveDeviceState(deviceName, isOn);
                setDeviceStates(prev => ({ ...prev, [deviceName]: isOn }));
            } else {
                setDeviceStates(prev => ({ ...prev, [deviceName]: previousState }));
                saveDeviceState(deviceName, previousState);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            setDeviceStates(prev => ({ ...prev, [deviceName]: previousState }));
            saveDeviceState(deviceName, previousState);
            showToast('Không thể kết nối server', 'error');
        }

        // Clear processing flag sau khi UI ổn định
        setTimeout(() => {
            setProcessingDevices(prev => ({ ...prev, [deviceName]: false }));
        }, 200);
    }, [processingDevices, saveDeviceState, showToast   ]);

    return { deviceStates, processingDevices, toggleDevice, isAnyProcessing };
}
