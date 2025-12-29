const getUserByEmail = async (db, email) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, email, password_hash, name, is_active FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error al buscar usuario por email: ${error.message}`);
  }
};

const updateLastLogin = async (db, userId) => {
  try {
    await db.execute(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );
  } catch (error) {
    throw new Error(`Error al actualizar último login: ${error.message}`);
  }
};

const getUserById = async (db, userId) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, email, name, last_login, is_active FROM users WHERE id = ?",
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error al obtener usuario por ID: ${error.message}`);
  }
};

module.exports = {
  getUserByEmail,
  updateLastLogin,
  getUserById,
};