const SftpClient = require("ssh2-sftp-client");
const crypto = require("crypto");

/**
 * Configuración SFTP desde variables de entorno
 */
const sftpConfig = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT) || 22,
  username: process.env.SFTP_USER,
  password: process.env.SFTP_PASSWORD,
};

// Rutas desde variables de entorno
const SFTP_BASE_PATH = process.env.SFTP_BASE_PATH;
const SFTP_PUBLIC_URL = process.env.SFTP_PUBLIC_URL;

// Validar que las variables de entorno estén configuradas
if (!sftpConfig.host || !sftpConfig.username || !sftpConfig.password) {
  console.warn("⚠️ ADVERTENCIA: Credenciales SFTP no configuradas en .env");
}

if (!SFTP_BASE_PATH || !SFTP_PUBLIC_URL) {
  console.warn("⚠️ ADVERTENCIA: Rutas SFTP no configuradas en .env");
}

/**
 * Normaliza el nombre del archivo para evitar problemas en rutas
 * - Reemplaza espacios por guiones bajos
 * - Elimina caracteres especiales
 * - Convierte a minúsculas
 * @param {string} filename - Nombre original del archivo
 * @returns {string} Nombre normalizado
 */
const normalizeFilename = (filename) => {
  const extension = filename.substring(filename.lastIndexOf("."));
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));

  const normalized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "_") // Espacios a guiones bajos
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9_-]/g, ""); // Solo letras, números, guiones y guiones bajos

  return `${normalized}${extension.toLowerCase()}`;
};

/**
 * Encuentra el siguiente nombre disponible agregando sufijo _2, _3, etc.
 * OPTIMIZADO: Intenta primero sin sufijo, luego agrega timestamp para unicidad
 * @param {SftpClient} sftp - Cliente SFTP conectado
 * @param {string} patientDir - Directorio del paciente
 * @param {string} baseFilename - Nombre base normalizado del archivo
 * @returns {Promise<string>} Nombre de archivo disponible
 */
const findAvailableFilename = async (sftp, patientDir, baseFilename) => {
  const extension = baseFilename.substring(baseFilename.lastIndexOf("."));
  const nameWithoutExt = baseFilename.substring(0, baseFilename.lastIndexOf("."));

  // Verificar si el archivo existe
  const fullPath = `${patientDir}/${baseFilename}`;
  const exists = await sftp.exists(fullPath);

  if (!exists) {
    return baseFilename;
  }

  // Si existe, usar timestamp para garantizar unicidad sin bucle
  const timestamp = Date.now();
  return `${nameWithoutExt}_${timestamp}${extension}`;
};

/**
 * Sube un archivo al VPS via SFTP
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} originalFilename - Nombre original del archivo
 * @param {number} patientId - ID del paciente
 * @returns {Promise<string>} URL pública del archivo subido
 */
const uploadFileToVPS = async (fileBuffer, originalFilename, patientId) => {
  const sftp = new SftpClient();

  try {
    // Conectar al servidor SFTP
    await sftp.connect(sftpConfig);

    // Normalizar nombre del archivo
    const normalizedFilename = normalizeFilename(originalFilename);

    // Ruta en el servidor VPS usando variable de entorno
    const patientDir = `${SFTP_BASE_PATH}/${patientId}`;

    // Crear directorio del paciente si no existe
    try {
      await sftp.mkdir(patientDir, false);
    } catch (mkdirError) {
      // El directorio ya existe o hay un error de permisos
      if (!mkdirError.message.includes("already exists") && !mkdirError.message.includes("File exists")) {
        throw new Error(`Error al crear directorio: ${mkdirError.message}`);
      }
    }

    // Buscar nombre disponible (agrega timestamp si ya existe)
    const filename = await findAvailableFilename(sftp, patientDir, normalizedFilename);
    const remoteFilePath = `${patientDir}/${filename}`;

    // Subir archivo
    await sftp.put(fileBuffer, remoteFilePath);

    // Cerrar conexión
    await sftp.end();

    // Retornar URL pública usando variable de entorno
    const publicUrl = `${SFTP_PUBLIC_URL}/${patientId}/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error("❌ Error en subida SFTP:", error.message);
    await sftp.end(); // Asegurar cierre de conexión
    throw new Error(`Error al subir archivo al VPS: ${error.message}`);
  }
};

/**
 * Elimina un archivo del VPS via SFTP
 * @param {string} fileUrl - URL pública del archivo (ej: https://example.com/uploads/123/file.pdf)
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
const deleteFileFromVPS = async (fileUrl) => {
  const sftp = new SftpClient();

  try {
    // Conectar al servidor SFTP
    await sftp.connect(sftpConfig);

    // Extraer la ruta relativa desde la URL pública
    // Ejemplo: https://example.com/uploads/123/file.pdf -> 123/file.pdf
    const relativePath = fileUrl.replace(SFTP_PUBLIC_URL + "/", "");
    const remoteFilePath = `${SFTP_BASE_PATH}/${relativePath}`;

    // Verificar que el archivo existe antes de intentar eliminarlo
    const exists = await sftp.exists(remoteFilePath);
    if (!exists) {
      console.warn(`⚠️ El archivo no existe en el VPS: ${remoteFilePath}`);
      await sftp.end();
      return false;
    }

    // Eliminar el archivo
    await sftp.delete(remoteFilePath);

    // Cerrar conexión
    await sftp.end();

    return true;
  } catch (error) {
    console.error("❌ Error al eliminar archivo del SFTP:", error.message);
    await sftp.end(); // Asegurar cierre de conexión
    throw new Error(`Error al eliminar archivo del VPS: ${error.message}`);
  }
};

module.exports = {
  uploadFileToVPS,
  deleteFileFromVPS,
  normalizeFilename,
  findAvailableFilename,
};
