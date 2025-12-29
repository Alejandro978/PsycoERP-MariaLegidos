-- Volcando estructura para tabla demopsicologia.patients
CREATE TABLE IF NOT EXISTS `patients` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `status` enum('active','inactive','discharged','on-hold') DEFAULT 'active',
  `session_type` enum('individual','group','family','couples') DEFAULT 'individual',
  `address` text DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `medical_history` text DEFAULT NULL,
  `current_medication` text DEFAULT NULL,
  `allergies` varchar(500) DEFAULT NULL,
  `referred_by` varchar(255) DEFAULT NULL,
  `insurance_provider` varchar(255) DEFAULT NULL,
  `insurance_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `dni` (`dni`),
  KEY `idx_patient_status` (`status`),
  KEY `idx_patient_email` (`email`),
  KEY `idx_patient_dni` (`dni`),
  KEY `idx_patient_created` (`created_at`),
  KEY `idx_patient_name` (`name`)
);

-- Volcando datos para la tabla demopsicologia.patients: ~5 rows (aproximadamente)
INSERT INTO `patients` (`id`, `name`, `email`, `phone`, `dni`, `status`, `session_type`, `address`, `birth_date`, `emergency_contact_name`, `emergency_contact_phone`, `medical_history`, `current_medication`, `allergies`, `referred_by`, `insurance_provider`, `insurance_number`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 'Juan Pérez García', 'juan.perez@email.com', '+34 600 123 456', '12345678A', 'active', 'individual', 'Calle Mayor 123, 28001 Madrid', '1985-03-15', 'María Pérez', '+34 600 123 457', 'Historial de ansiedad leve. Sin otras patologías relevantes.', 'Ninguna', 'Penicilina', 'Médico de cabecera - Dr. Martínez', 'Sanitas', 'SAN001234567', 'Paciente muy colaborativo, puntual en las citas. Responde bien al tratamiento.', '2025-08-25 19:17:42', '2025-08-25 19:17:42'),
	(2, 'Ana López Rodríguez', 'ana.lopez@email.com', '+34 600 234 567', '87654321B', 'active', 'family', 'Avenida de la Constitución 45, 41001 Sevilla', '1978-07-22', 'Carlos López', '+34 600 234 568', 'Depresión postparto tratada en 2019. Completamente recuperada.', 'Vitamina D3 1000ui diaria', 'Ninguna conocida', 'Ginecóloga - Dra. Fernández', 'Adeslas', 'ADE987654321', 'Terapia familiar iniciada tras problemas de comunicación en pareja.', '2025-08-25 19:17:42', '2025-08-25 19:17:42'),
	(3, 'Carlos Martín Sánchez', 'carlos.martin@email.com', '+34 600 345 678', '11223344C', 'on-hold', 'individual', 'Plaza España 12, 3º B, 08002 Barcelona', '1992-11-08', 'Laura Martín', '+34 600 345 679', 'Trastorno de pánico diagnosticado en 2022. En tratamiento.', 'Sertralina 50mg (1 comp/día)', 'Aspirina, polen', 'Psiquiatra - Dr. González', 'Mutua Madrileña', 'MM556677889', 'Paciente en pausa temporal por motivos laborales. Retoma en enero 2025.', '2025-08-25 19:17:42', '2025-08-25 19:17:42'),
	(4, 'María García Jiménez', 'maria.garcia@email.com', '+34 600 456 789', '55667788D', 'active', 'couples', 'Calle Alcalá 200, 1º A, 28028 Madrid', '1990-01-30', 'José García', '+34 600 456 790', 'Sin antecedentes médicos relevantes.', 'Anticonceptivos orales', 'Mariscos', 'Recomendación de amiga', 'DKV', 'DKV445566778', 'Terapia de pareja iniciada hace 3 meses. Buenos progresos observados.', '2025-08-25 19:17:42', '2025-08-25 19:17:42'),
	(5, 'Roberto Silva Moreno', 'roberto.silva@email.com', '+34 600 567 890', '99887766E', 'discharged', 'group', 'Carrer de Balmes 150, 08008 Barcelona', '1975-09-12', 'Carmen Silva', '+34 600 567 891', 'Adicción al alcohol. Proceso de desintoxicación completado en 2023.', 'Naltrexona 50mg según necesidad', 'Ninguna conocida', 'Centro de Salud Mental - Dr. Ruiz', 'Seguridad Social', 'SS123456789', 'Alta médica conseguida tras 18 meses de terapia grupal. Excelente evolución.', '2025-08-25 19:17:42', '2025-08-25 19:17:42');