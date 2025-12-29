const getUserById = async (db, userId) => {
  const query = `
    SELECT 
      id,
      license_number,
      irpf,
      name,
      dni,
      street,
      street_number,
      door,
      city,
      province,
      postal_code,
      iban
    FROM users
    WHERE id = ? AND is_active = true
  `;
  
  const [rows] = await db.execute(query, [userId]);
  
  if (rows.length === 0) {
    return null;
  }
  
  return rows[0];
};

const updateUser = async (db, userId, userData) => {
  const fields = [];
  const values = [];

  if (userData.name !== undefined) {
    fields.push("name = ?");
    values.push(userData.name);
  }
  if (userData.license_number !== undefined) {
    fields.push("license_number = ?");
    values.push(userData.license_number);
  }
  if (userData.irpf !== undefined) {
    fields.push("irpf = ?");
    values.push(userData.irpf);
  }
  if (userData.dni !== undefined) {
    fields.push("dni = ?");
    values.push(userData.dni);
  }
  if (userData.street !== undefined) {
    fields.push("street = ?");
    values.push(userData.street);
  }
  if (userData.street_number !== undefined) {
    fields.push("street_number = ?");
    values.push(userData.street_number);
  }
  if (userData.door !== undefined) {
    fields.push("door = ?");
    values.push(userData.door);
  }
  if (userData.city !== undefined) {
    fields.push("city = ?");
    values.push(userData.city);
  }
  if (userData.province !== undefined) {
    fields.push("province = ?");
    values.push(userData.province);
  }
  if (userData.postal_code !== undefined) {
    fields.push("postal_code = ?");
    values.push(userData.postal_code);
  }
  if (userData.iban !== undefined) {
    fields.push("iban = ?");
    values.push(userData.iban);
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  fields.push("updated_at = NOW()");
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${fields.join(", ")} 
    WHERE id = ? AND is_active = true
  `;

  const [result] = await db.execute(query, values);

  if (result.affectedRows === 0) {
    return null;
  }

  return await getUserById(db, userId);
};

module.exports = {
  getUserById,
  updateUser,
};