Create schema IOT;
use IOT;
-- 1. Bảng danh mục thiết bị 
CREATE TABLE `devices` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
) ENGINE=InnoDB;

-- 2. Bảng dữ liệu cảm biến 
CREATE TABLE `datasensor` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `temperature` FLOAT NOT NULL,      
  `humidity` FLOAT NOT NULL,         
  `light` INT NOT NULL,              
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
) ENGINE=InnoDB;

-- 3. Bảng lịch sử hoạt động
CREATE TABLE `active_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL,        
  `action` VARCHAR(20) NOT NULL,     
  `status` VARCHAR(20) NOT NULL,    
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`)
) ENGINE=InnoDB;