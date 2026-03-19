import { useState, useEffect, useRef, useCallback } from 'react';
import { apiGet } from '../api';
import { REFRESH_INTERVAL } from '../config';

/**
 * Hook quản lý sensor data polling realtime
 * Logic giữ nguyên từ dashboard.js
 */
export function useSensorData(skipWhenProcessing = false) {
    const [sensorData, setSensorData] = useState([]);
    const [latestSensor, setLatestSensor] = useState(null);
    const skipRef = useRef(skipWhenProcessing);

    useEffect(() => {
        skipRef.current = skipWhenProcessing;
    }, [skipWhenProcessing]);

    const loadData = useCallback(async () => {
        if (skipRef.current) return;

        try {
            const response = await apiGet('/data-sensor?type=dashboard&limit=20');
            if (response.success && response.data && response.data.length > 0) {
                setSensorData(response.data);
                setLatestSensor(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading sensor data:', error);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [loadData]);

    return { sensorData, latestSensor };
}
