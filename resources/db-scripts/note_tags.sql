-- Volcando estructura para tabla demopsicologia.note_tags
CREATE TABLE IF NOT EXISTS `note_tags` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `clinical_note_id` bigint(20) NOT NULL,
  `tag_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_note_tag` (`clinical_note_id`,`tag_name`),
  KEY `idx_tag_name` (`tag_name`),
  CONSTRAINT `note_tags_ibfk_1` FOREIGN KEY (`clinical_note_id`) REFERENCES `clinical_notes` (`id`) ON DELETE CASCADE
);

-- Volcando datos para la tabla demopsicologia.note_tags: ~0 rows (aproximadamente)
INSERT INTO `note_tags` (`id`, `clinical_note_id`, `tag_name`, `created_at`) VALUES
	(1, 1, 'ansiedad', '2025-08-26 05:48:17'),
	(2, 1, 'evaluación', '2025-08-26 05:48:17'),
	(3, 1, 'primera-consulta', '2025-08-26 05:48:17'),
	(4, 1, 'estrés-laboral', '2025-08-26 05:48:17'),
	(5, 2, 'progreso', '2025-08-26 05:48:17'),
	(6, 2, 'técnicas-relajación', '2025-08-26 05:48:17'),
	(7, 2, 'respiración', '2025-08-26 05:48:17'),
	(8, 2, 'mejoría', '2025-08-26 05:48:17'),
	(9, 3, 'familia', '2025-08-26 05:48:17'),
	(10, 3, 'comunicación', '2025-08-26 05:48:17'),
	(11, 3, 'sobreprotección', '2025-08-26 05:48:17'),
	(12, 3, 'terapia-familiar', '2025-08-26 05:48:17'),
	(13, 4, 'objetivos', '2025-08-26 05:48:17'),
	(14, 4, 'plan-tratamiento', '2025-08-26 05:48:17'),
	(15, 4, 'pánico', '2025-08-26 05:48:17'),
	(16, 4, 'autoestima', '2025-08-26 05:48:17'),
	(17, 4, 'motivación', '2025-08-26 05:48:17'),
	(18, 5, 'medicación', '2025-08-26 05:48:17'),
	(19, 5, 'efectos-secundarios', '2025-08-26 05:48:17'),
	(20, 5, 'depresión', '2025-08-26 05:48:17'),
	(21, 5, 'escala-beck', '2025-08-26 05:48:17'),
	(22, 5, 'coordinación-médica', '2025-08-26 05:48:17');