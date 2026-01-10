const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { loginUser, refreshToken, hashPassword } = require("../../controllers/auth/auth_controller");

// Rate limiter para login: 5 intentos cada 15 minutos
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos máximo
    message: {
        success: false,
        error: "Demasiados intentos de login. Por favor, intente nuevamente en 15 minutos",
    },
    standardHeaders: true, // Retorna info del rate limit en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    skipSuccessfulRequests: false, // Cuenta tanto exitosos como fallidos
    skipFailedRequests: false,
});

router.post("/login", loginLimiter, loginUser);
router.post("/refresh", refreshToken);
router.post("/hash-password", hashPassword);

module.exports = router;