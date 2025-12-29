const express = require("express");
const router = express.Router();

const {
  obtenerUsuarioPorId,
  actualizarUsuario,
} = require("../../controllers/users/users_controller");

router.get("/:id", obtenerUsuarioPorId);
router.put("/:id", actualizarUsuario);

module.exports = router;