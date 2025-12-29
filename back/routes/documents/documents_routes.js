const express = require("express");
const router = express.Router();

const {
  obtenerDocumentosPorPaciente,
  subirDocumento,
  upload,
  descargarDocumento,
  eliminarDocumento,
} = require("../../controllers/documents/documents_controller");

router.get("/patient/:patient_id", obtenerDocumentosPorPaciente);
router.post("/", upload.single("file"), subirDocumento);
router.get("/:id/download", descargarDocumento);
router.delete("/:id", eliminarDocumento);

module.exports = router;
