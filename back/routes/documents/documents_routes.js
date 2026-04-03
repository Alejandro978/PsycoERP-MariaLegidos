const express = require("express");
const router = express.Router();

const {
  obtenerDocumentosPorPaciente,
  subirDocumento,
  upload,
  descargarDocumento,
  eliminarDocumento,
} = require("../../controllers/documents/documents_controller");
const { authenticateTokenOrInvitation } = require("../../middlewares/auth");

router.get("/patient/:patient_id", obtenerDocumentosPorPaciente);
router.post("/", upload.single("file"), authenticateTokenOrInvitation, subirDocumento);
router.get("/:id/download", descargarDocumento);
router.delete("/:id", eliminarDocumento);

module.exports = router;
