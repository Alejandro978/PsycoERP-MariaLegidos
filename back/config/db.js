const mysql = require("mysql2/promise");
require("dotenv").config();

const getDBConfig = (hostname) => {
  if (hostname && hostname.includes("test.")) {
    return {
      host: process.env.DB_TEST_HOST,
      user: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_NAME,
      timezone: "+00:00",
      dateStrings: true,
    };
  }

  return {
    host: process.env.DB_PROD_HOST,
    user: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    timezone: "+00:00",
    dateStrings: true,
  };
};

let prodPool = null;
let testPool = null;

const getPool = (hostname) => {
  if (hostname && hostname.includes("test.")) {
    if (!testPool) {
      testPool = mysql.createPool(getDBConfig(hostname));
    }
    return testPool;
  }

  if (!prodPool) {
    prodPool = mysql.createPool(getDBConfig());
  }
  return prodPool;
};

const dbMiddleware = (req, res, next) => {
  let hostname = req.hostname;

  // Localhost siempre usa TEST
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    hostname = "test.millopsicologia.com";
  }

  req.db = getPool(hostname);

  next();
};

const testConnection = async () => {
  try {
    const prodConfig = getDBConfig();
    const prodTestPool = mysql.createPool(prodConfig);
    const prodConnection = await prodTestPool.getConnection();
    prodConnection.release();
    await prodTestPool.end();

    const testConfig = getDBConfig("test.millopsicologia.com");
    const testTestPool = mysql.createPool(testConfig);
    const testConnection = await testTestPool.getConnection();
    testConnection.release();
    await testTestPool.end();
  } catch (error) {
    console.error("❌ Error al conectar con MariaDB:", error.message);
  }
};

module.exports = { getPool, dbMiddleware, testConnection };
