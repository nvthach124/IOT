# 🏠 IoT Smart Home

`IoT Smart Home` là hệ thống giám sát và điều khiển thiết bị thông minh thông qua Web Dashboard.
Hệ thống thu thập dữ liệu cảm biến (nhiệt độ, độ ẩm, ánh sáng), hiển thị theo thời gian thực và điều khiển thiết bị bằng giao thức MQTT.

## 🚀 Tính năng chính

- **Dashboard thời gian thực**: Hiển thị dữ liệu cảm biến, biểu đồ trực quan và cảnh báo khi vượt ngưỡng.
- **Điều khiển thiết bị**: Bật/tắt `Lamp`, `Fan`, `Pump` với cơ chế phản hồi trạng thái từ thiết bị qua MQTT.
- **Quản lý dữ liệu cảm biến**: Tìm kiếm, lọc, sắp xếp và phân trang dữ liệu tại trang `Data Sensor`.
- **Lịch sử hoạt động**: Theo dõi toàn bộ thao tác điều khiển thiết bị tại trang `Active History`.

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Chart.js, React Router |
| **Backend** | Node.js, Express, MySQL2 |
| **Hardware** | ESP32, DHT11, Cám biến ánh sáng 4 chân, Quang trở, giao thức MQTT (Mosquitto Broker) |

## 📁 Mô tả cấu trúc dự án

```text
IOT/
├── backend/                    # API server + MQTT integration
│   ├── app.js                  # Cấu hình Express, middleware, route mount
│   ├── server.js               # Entry point backend
│   ├── config/                 # Cấu hình database, mqtt, constants
│   ├── controllers/            # Nhận request và trả response
│   ├── models/                 # Truy vấn database + quản lý trạng thái thiết bị
│   ├── routes/                 # Định nghĩa endpoint API
│   ├── services/               # Dịch vụ MQTT (`mqttService.js`)
│   ├── middlewares/            # Xử lý lỗi, middleware dùng chung
│   ├── utils/                  # Hàm tiện ích
│   └── scripts/                # Script seed dữ liệu mẫu
│
├── frontend/                   # Giao diện người dùng
│   ├── src/
│   │   ├── api/                # Hàm gọi API
│   │   ├── components/         # Component giao diện tái sử dụng
│   │   ├── hooks/              # Custom hooks xử lý logic UI
│   │   ├── pages/              # Các trang Dashboard, Data Sensor, Active History, Profile
│   │   ├── utils/              # Hàm tiện ích phía frontend
│   │   ├── config.js           # Cấu hình cảm biến/thiết bị
│   │   ├── App.jsx             # Router chính
│   │   └── main.jsx            # Điểm khởi chạy React
│   └── vite.config.js          # Cấu hình Vite
│
├── database/                   # File SQL khởi tạo dữ liệu
├── docs/                       # Tài liệu dự án
└── README.md                   # Tài liệu mô tả tổng quan
```
