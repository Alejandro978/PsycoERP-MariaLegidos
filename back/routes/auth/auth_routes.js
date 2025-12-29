const express = require("express");
const router = express.Router();

const { loginUser, refreshToken, hashPassword } = require("../../controllers/auth/auth_controller");

router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/hash-password", hashPassword);

module.exports = router;