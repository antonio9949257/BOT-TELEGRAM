CREATE DATABASE IF NOT EXISTS `bot-telegram`;

USE `bot-telegram`;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `precio` DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS `ventas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`),
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
);

-- Insert 10 sample clients
INSERT INTO `clientes` (`nombre`, `email`) VALUES
('Juan Perez', 'juan.perez@example.com'),
('Maria Garcia', 'maria.garcia@example.com'),
('Carlos Lopez', 'carlos.lopez@example.com'),
('Ana Martinez', 'ana.martinez@example.com'),
('Pedro Sanchez', 'pedro.sanchez@example.com'),
('Laura Rodriguez', 'laura.rodriguez@example.com'),
('Miguel Fernandez', 'miguel.fernandez@example.com'),
('Sofia Gonzalez', 'sofia.gonzalez@example.com'),
('Javier Ruiz', 'javier.ruiz@example.com'),
('Elena Diaz', 'elena.diaz@example.com');

-- Insert 10 sample products
INSERT INTO `productos` (`nombre`, `precio`) VALUES
('Laptop', 1200.00),
('Mouse', 25.50),
('Teclado', 75.00),
('Monitor', 300.00),
('Impresora', 150.00),
('Webcam', 50.00),
('Auriculares', 100.00),
('Microfono', 80.00),
('Disco Duro SSD', 180.00),
('Router Wi-Fi', 60.00);

-- Insert 10 sample sales
INSERT INTO `ventas` (`cliente_id`, `producto_id`, `cantidad`, `fecha`) VALUES
(1, 1, 1, '2023-01-10 10:00:00'),
(2, 3, 2, '2023-01-10 11:00:00'),
(3, 5, 1, '2023-01-11 12:00:00'),
(4, 2, 3, '2023-01-11 13:00:00'),
(5, 4, 1, '2023-01-12 14:00:00'),
(6, 6, 1, '2023-01-12 15:00:00'),
(7, 8, 2, '2023-01-13 16:00:00'),
(8, 7, 1, '2023-01-13 17:00:00'),
(9, 10, 1, '2023-01-14 18:00:00'),
(10, 9, 1, '2023-01-14 19:00:00');