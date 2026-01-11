const express = require("express");
const router = express.Router();

const { obtenerNotas, crearNota } = require("../../controllers/notes/notes_controller");

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Obtener notas paginadas con KPIs
 *     description: Obtiene una lista paginada de notas con filtros opcionales. Devuelve pending primero, completed después. Incluye KPIs (total, pending, completed).
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, completed]
 *         description: Estado de la nota
 *       - name: creation_date
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica de la nota (YYYY-MM-DD)
 *       - name: fecha_desde
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (YYYY-MM-DD). Solo se usa si no se especifica creation_date
 *       - name: fecha_hasta
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (YYYY-MM-DD). Solo se usa si no se especifica creation_date
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para la paginación
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10000
 *           default: 10
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Lista de notas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotesResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", obtenerNotas);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Crear una nueva nota
 *     description: Crea una nota con estado pending por defecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoteRequest'
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateNoteResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", crearNota);

module.exports = router;
