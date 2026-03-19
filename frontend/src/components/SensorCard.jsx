/**
 * SensorCard - Hiển thị sensor card trên Dashboard
 * Props: type ('temperature'|'humidity'|'light'), value, label, unit, icon
 */
export default function SensorCard({ type, value, label, unit, icon, alertClass }) {
    const cardClassName = `sensor-card ${type} ${alertClass || ''}`.trim();

    return (
        <div className={cardClassName} id={`card-${type === 'temperature' ? 'temp' : type === 'humidity' ? 'hum' : 'light'}`}>
            <div className="sensor-card-content">
                <div className="sensor-card-label">{label}</div>
                <div className="sensor-card-value">
                    <span>{value ?? '--'}</span>
                    <span className="unit">{unit}</span>
                </div>
            </div>
            <span className="sensor-card-icon material-symbols-outlined">{icon}</span>
        </div>
    );
}
