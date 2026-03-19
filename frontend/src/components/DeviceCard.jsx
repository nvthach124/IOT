/**
 * DeviceCard - Hiển thị thiết bị trên Dashboard
 * Dùng data từ config.js nên thêm thiết bị = thêm 1 entry config
 */
export default function DeviceCard({ device, isOn, isProcessing, onToggle }) {
    const statusText = isProcessing === 'waiting' ? 'Waiting...' : (isOn ? 'ON' : 'OFF');
    const statusClass = isProcessing === 'waiting' ? 'loading' : (isOn ? 'on' : '');
    const cardClass = `device-card ${device.cardClass} ${!isOn ? 'off' : ''}`.trim();

    const handleChange = (e) => {
        onToggle(device.id, e.target.checked);
    };

    return (
        <div className={cardClass} id={`${device.id}-card`} data-device-id={device.id}>
            <div className="device-info">
                <div className="device-icon">
                    <span className="material-symbols-outlined">{device.icon}</span>
                </div>
                <div>
                    <div className="device-name">{device.name}</div>
                    <div className={`device-status ${statusClass}`} id={`${device.id}-status`}>
                        {statusText}
                    </div>
                </div>
            </div>
            <label className="toggle-switch">
                <input
                    type="checkbox"
                    id={`${device.id}-toggle`}
                    checked={isOn}
                    disabled={isProcessing === 'waiting'}
                    onChange={handleChange}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );
}
