# 🏠 IoT Smart Home Dashboard

Hệ thống giám sát và điều khiển thiết bị thông minh qua nền tảng Web, sử dụng giao thức MQTT để giao tiếp với phần cứng.

## 🚀 Tính năng chính

- **Dashboard** — Hiển thị biểu đồ nhiệt độ, độ ẩm, ánh sáng thời gian thực (2s/lần). Cảnh báo tự động khi vượt ngưỡng an toàn.
- **Điều khiển thiết bị** — Bật/tắt Đèn, Quạt, Máy bơm với phản hồi từ phần cứng. Trạng thái lưu trên `localStorage`.
- **Data Sensor** — Bảng dữ liệu cảm biến với bộ lọc nâng cao, tìm kiếm, sắp xếp và phân trang.
- **Active History** — Lịch sử hoạt động thiết bị với bộ lọc theo thiết bị, trạng thái, thời gian.
- **Profile** — Thông tin cá nhân và liên kết tài liệu dự án.

## 🛠 Công nghệ

| Layer | Stack |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Chart.js, React Router |
| **Backend** | Node.js, Express, MySQL2 |
| **Giao tiếp** | MQTT (Mosquitto Broker) |

## 📁 Cấu trúc dự án

```
IOT/
├── backend/                 # Backend (Node.js + Express)
│   ├── config/              # Cấu hình DB, MQTT, constants
│   ├── controllers/         # Xử lý request
│   ├── models/              # Tương tác database
│   ├── routes/              # Định nghĩa API routes
│   ├── services/            # Business logic, MQTT service
│   ├── scripts/             # Database seed script
│   ├── server.js            # Entry point
│   ├── app.js               # Express setup + middleware
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
│
├── frontend/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/             # API helpers (fetchAPI, apiGet, apiPost)
│   │   ├── components/      # UI components (Layout, SensorCard, DeviceCard, ...)
│   │   ├── hooks/           # Custom hooks (useSensorData, useDeviceControl, useTableData)
│   │   ├── pages/           # Page components (Dashboard, DataSensor, ActiveHistory, Profile)
│   │   ├── utils/           # Utility functions
│   │   ├── config.js        # Device & sensor config
│   │   ├── App.jsx          # Routes
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Styles
│   ├── assets/images/       # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite config
│
├── database/                # SQL schema
├── docs/                    # Tài liệu PDF
└── README.md
```

## ⚙️ Cài đặt & Chạy

### Yêu cầu
- Node.js ≥ 18
- MySQL 8.x
- Mosquitto MQTT Broker

### 1. Clone & cài đặt

```bash
git clone https://github.com/nvthach124/IOT.git
cd IOT

# Cài backend dependencies
cd backend
npm install

# Cài frontend dependencies
cd ../frontend
npm install
```

### 2. Cấu hình environment

Tạo file `backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=IOT

MQTT_BROKER=mqtt://localhost
MQTT_PORT=2810
MQTT_CLIENT_ID=iot_smarthome_server

TOPIC_SENSOR_DATA=sensor/data
TOPIC_DEVICE_STATUS=device/status
TOPIC_LAMP_CONTROL=device/control/lamp
TOPIC_FAN_CONTROL=device/control/fan
TOPIC_PUMP_CONTROL=device/control/pump
```

### 3. Khởi tạo database

```bash
cd backend
npm run seed
```

### 4. Build frontend

```bash
cd frontend
npm run build
```

### 5. Chạy server

```bash
cd backend
npm run dev
```

Mở http://localhost:3000 trên trình duyệt.

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/data-sensor` | Lấy dữ liệu cảm biến (hỗ trợ search, filter, sort, pagination) |
| `POST` | `/api/device-control` | Gửi lệnh bật/tắt thiết bị |
| `GET` | `/api/active-history` | Lấy lịch sử hoạt động thiết bị |

## ➕ Thêm thiết bị mới

Chỉ cần sửa **2 file frontend**:

**1. `frontend/src/config.js`** — Thêm entry vào mảng `DEVICES`:
```js
{
  id: 'ac',
  name: 'Air Conditioner',
  icon: 'ac_unit',       // Google Material Symbol
  cardClass: 'ac',
  color: '#60a5fa',
}
```

**2. `frontend/src/index.css`** — Thêm CSS cho device card:
```css
.device-card.ac:not(.off) {
  background: rgba(96, 165, 250, 0.1);
  border: 2px solid #60a5fa;
}
.device-card.ac:not(.off) .device-icon {
  background: #60a5fa;
  color: white;
}
.device-card.ac input:checked + .toggle-slider {
  background-color: #60a5fa;
}
```

Dashboard sẽ **tự động render** device card mới.

## 👤 Tác giả

**Nguyễn Văn Thạch** — B22DCPT254  
📧 thachnv.b22dcpt254@stu.ptit.edu.vn  
🔗 [GitHub](https://github.com/nvthach124/IOT)
