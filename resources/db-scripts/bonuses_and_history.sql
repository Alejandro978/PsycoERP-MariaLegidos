-- Tabla principal de bonos
CREATE TABLE IF NOT EXISTS `bonuses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) NOT NULL,
  `total_sessions` int(11) NOT NULL,
  `price_per_session` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `used_sessions` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','consumed','expired') DEFAULT 'active',
  `purchase_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bonus_patient` (`patient_id`),
  KEY `idx_bonus_status` (`status`),
  KEY `idx_bonus_expiry` (`expiry_date`),
  KEY `idx_bonus_purchase` (`purchase_date`),
  CONSTRAINT `bonuses_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
);

-- Tabla de historial de uso de bonos
CREATE TABLE IF NOT EXISTS `bonus_usage_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bonus_id` bigint(20) NOT NULL,
  `session_id` bigint(20) DEFAULT NULL,
  `used_date` date NOT NULL,
  `sessions_consumed` int(11) NOT NULL DEFAULT 1,
  `notes` varchar(500) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL COMMENT 'Usuario que registró el uso',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bonus_usage_bonus` (`bonus_id`),
  KEY `idx_bonus_usage_session` (`session_id`),
  KEY `idx_bonus_usage_date` (`used_date`),
  CONSTRAINT `bonus_usage_history_ibfk_1` FOREIGN KEY (`bonus_id`) REFERENCES `bonuses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bonus_usage_history_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL
);

-- Índices adicionales para optimizar consultas
CREATE INDEX `idx_bonuses_patient_status` ON `bonuses` (`patient_id`, `status`);
CREATE INDEX `idx_bonus_usage_bonus_date` ON `bonus_usage_history` (`bonus_id`, `used_date`);

-- INSERTS PARA TABLA BONUSES (5 bonos de muestra)
INSERT INTO `bonuses` (`patient_id`, `total_sessions`, `price_per_session`, `total_price`, `used_sessions`, `status`, `purchase_date`, `expiry_date`, `notes`) VALUES
(1, 10, 50.00, 500.00, 6, 'active', '2024-01-15', '2025-01-15', 'Bono individual - descuento del 10%'),
(1, 8, 45.00, 360.00, 8, 'consumed', '2023-06-10', '2024-06-10', 'Bono familiar completamente usado'),
(2, 12, 55.00, 660.00, 3, 'active', '2024-08-01', '2025-08-01', 'Bono premium con sesiones extendidas'),
(2, 6, 40.00, 240.00, 2, 'expired', '2023-12-01', '2024-12-01', 'Bono básico expirado'),
(3, 15, 48.00, 720.00, 10, 'active', '2024-03-20', '2025-03-20', 'Bono anual con máximo descuento');

-- INSERTS PARA TABLA BONUS_USAGE_HISTORY (5 usos por cada bono)
-- Historial del Bono 1 (6 usos de 10)
INSERT INTO `bonus_usage_history` (`bonus_id`, `session_id`, `used_date`, `sessions_consumed`, `notes`, `created_by`) VALUES
(1, 1, '2024-02-01', 1, 'Primera sesión del bono', 'Dr. Martinez'),
(1, 2, '2024-02-15', 1, 'Sesión de seguimiento', 'Dr. Martinez'),
(1, 3, '2024-03-01', 1, 'Sesión regular', 'Dr. Martinez'),
(1, 4, '2024-03-15', 1, 'Sesión de evaluación', 'Dr. Martinez'),
(1, 5, '2024-04-01', 2, 'Doble sesión intensiva', 'Dr. Martinez');

-- Historial del Bono 2 (8 usos de 8 - completamente usado)
INSERT INTO `bonus_usage_history` (`bonus_id`, `session_id`, `used_date`, `sessions_consumed`, `notes`, `created_by`) VALUES
(2, 6, '2023-07-01', 1, 'Inicio del tratamiento familiar', 'Dr. Lopez'),
(2, 7, '2023-07-15', 2, 'Sesión doble familiar', 'Dr. Lopez'),
(2, 8, '2023-08-01', 1, 'Sesión individual del menor', 'Dr. Lopez'),
(2, 9, '2023-08-15', 2, 'Sesión familiar completa', 'Dr. Lopez'),
(2, 10, '2023-09-01', 2, 'Últimas sesiones del bono', 'Dr. Lopez');

-- Historial del Bono 3 (3 usos de 12)
INSERT INTO `bonus_usage_history` (`bonus_id`, `session_id`, `used_date`, `sessions_consumed`, `notes`, `created_by`) VALUES
(3, 11, '2024-08-15', 1, 'Primera sesión premium', 'Dr. Garcia'),
(3, 12, '2024-09-01', 1, 'Sesión de evaluación inicial', 'Dr. Garcia'),
(3, 13, '2024-09-15', 1, 'Sesión de terapia cognitiva', 'Dr. Garcia'),
(3, NULL, '2024-10-01', 0, 'Sesión cancelada por paciente', 'Sistema'),
(3, NULL, '2024-10-15', 0, 'Reprogramada para siguiente mes', 'Dr. Garcia');

-- Historial del Bono 4 (2 usos de 6 - expirado)
INSERT INTO `bonus_usage_history` (`bonus_id`, `session_id`, `used_date`, `sessions_consumed`, `notes`, `created_by`) VALUES
(4, 14, '2023-12-15', 1, 'Única sesión antes de expiración', 'Dr. Rodriguez'),
(4, 15, '2024-01-05', 1, 'Sesión de cierre antes de expirar', 'Dr. Rodriguez'),
(4, NULL, '2024-02-01', 0, 'Intento de uso post-expiración', 'Sistema'),
(4, NULL, '2024-03-01', 0, 'Consulta sobre bono expirado', 'Recepción'),
(4, NULL, '2024-04-01', 0, 'Renovación de bono solicitada', 'Dr. Rodriguez');

-- Historial del Bono 5 (10 usos de 15)
INSERT INTO `bonus_usage_history` (`bonus_id`, `session_id`, `used_date`, `sessions_consumed`, `notes`, `created_by`) VALUES
(5, 16, '2024-04-01', 2, 'Sesiones iniciales intensivas', 'Dr. Sanchez'),
(5, 17, '2024-04-15', 2, 'Continuación tratamiento intensivo', 'Dr. Sanchez'),
(5, 18, '2024-05-01', 2, 'Sesiones grupales', 'Dr. Sanchez'),
(5, 19, '2024-05-15', 2, 'Terapia de pareja', 'Dr. Sanchez'),
(5, 20, '2024-06-01', 2, 'Sesiones de consolidación', 'Dr. Sanchez');
