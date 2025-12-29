/**
 * Logger centralizado con timestamps automáticos
 * Formato: DD/MM/YYYY HH:mm:ss
 */

/**
 * Genera timestamp en formato DD/MM/YYYY HH:mm:ss
 */
const getTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Log normal (info)
 */
const log = (...args) => {
  console.log(`[${getTimestamp()}]`, ...args);
};

/**
 * Log de error
 */
const error = (...args) => {
  console.error(`[${getTimestamp()}] ❌`, ...args);
};

/**
 * Log de advertencia
 */
const warn = (...args) => {
  console.warn(`[${getTimestamp()}] ⚠️ `, ...args);
};

/**
 * Log de información
 */
const info = (...args) => {
  console.info(`[${getTimestamp()}] ℹ️ `, ...args);
};

/**
 * Log de debug (solo en desarrollo)
 */
const debug = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[${getTimestamp()}] 🐛`, ...args);
  }
};

/**
 * Log de éxito
 */
const success = (...args) => {
  console.log(`[${getTimestamp()}] ✅`, ...args);
};

module.exports = {
  log,
  error,
  warn,
  info,
  debug,
  success,
  getTimestamp
};
