-- Volcando estructura para tabla demopsicologia.clinics
CREATE TABLE IF NOT EXISTS `clinics` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color_class` varchar(50) DEFAULT NULL,
  `text_color_class` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);

-- Volcando datos para la tabla demopsicologia.clinics: ~4 rows (aproximadamente)
INSERT INTO `clinics` (`id`, `name`, `color_class`, `text_color_class`, `created_at`) VALUES
	(1, 'Clinica A', 'bg-blue-100', 'text-blue-800', '2025-08-25 19:19:47'),
	(2, 'Clinica B', 'bg-red-100', 'text-red-800', '2025-08-25 19:19:47'),
	(3, 'Clinica C', 'bg-green-100', 'text-green-800', '2025-08-25 19:19:47'),
	(4, 'Clientes Propios', 'bg-yellow-100', 'text-yellow-800', '2025-08-25 19:19:47');

