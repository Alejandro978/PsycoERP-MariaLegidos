const express = require('express');
const router = express.Router();
const googleController = require('../../controllers/google/google_controller');
const { authenticateToken } = require('../../middlewares/auth');

// GET /api/google/auth-url - Genera URL de autorización (público)
// La usuaria visita esta URL desde su navegador
router.get('/auth-url', googleController.getAuthUrl);

// GET /api/google/oauth2callback - Callback de OAuth2 (público)
// Google redirige aquí después de que la usuaria autoriza
router.get('/oauth2callback', googleController.oauth2callback);

// GET /api/google/status - Verifica estado del token (protegido)
router.get('/status', authenticateToken, googleController.getTokenStatus);

module.exports = router;
