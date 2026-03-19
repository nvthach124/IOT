// ===== API CONFIG =====
const API_BASE_URL = window.location.origin + '/api';

/**
 * Wrapper function cho fetch API với error handling
 */
export async function fetchAPI(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultHeaders = { 'Content-Type': 'application/json' };

        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
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
 */
export async function apiGet(endpoint, params = {}) {
    const queryString = Object.keys(params).length > 0
        ? '?' + new URLSearchParams(params).toString()
        : '';
    return fetchAPI(endpoint + queryString, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, body = {}) {
    return fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
