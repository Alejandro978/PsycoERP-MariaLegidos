const {
  getUserById,
  updateUser,
} = require("../../models/users/users_model");

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que se proporcione el ID y sea un número válido
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID es requerido y debe ser un número válido",
        message: "Debe proporcionar un ID de usuario válido"
      });
    }

    const user = await getUserById(req.db, parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe o no está activo"
      });
    }

    res.json({
      success: true,
      data: user,
      message: "Usuario obtenido exitosamente"
    });
  } catch (err) {
    console.error("Error al obtener usuario:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener el usuario",
      message: "Ha ocurrido un error interno del servidor"
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, license_number, irpf, dni, street, street_number, door, city, province, postal_code, iban } = req.body;

    // Validar que se proporcione el ID y sea un número válido
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID es requerido y debe ser un número válido",
        message: "Debe proporcionar un ID de usuario válido"
      });
    }

    // Crear objeto con los datos a actualizar (solo campos no undefined)
    const userData = {};
    if (name !== undefined) userData.name = name;
    if (license_number !== undefined) userData.license_number = license_number;
    if (irpf !== undefined) userData.irpf = irpf;
    if (dni !== undefined) userData.dni = dni;
    if (street !== undefined) userData.street = street;
    if (street_number !== undefined) userData.street_number = street_number;
    if (door !== undefined) userData.door = door;
    if (city !== undefined) userData.city = city;
    if (province !== undefined) userData.province = province;
    if (postal_code !== undefined) userData.postal_code = postal_code;
    if (iban !== undefined) userData.iban = iban;

    // Validar que se envíe al menos un campo
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar al menos un campo para actualizar",
        message: "El cuerpo de la petición no puede estar vacío"
      });
    }

    const updatedUser = await updateUser(req.db, parseInt(id), userData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe o no está activo"
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente"
    });
  } catch (err) {
    console.error("Error al actualizar usuario:", err.message);

    if (err.message === "No hay campos para actualizar") {
      return res.status(400).json({
        success: false,
        error: "No hay campos para actualizar",
        message: "Debe proporcionar al menos un campo válido para actualizar"
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al actualizar el usuario",
      message: "Ha ocurrido un error interno del servidor"
    });
  }
};

module.exports = {
  obtenerUsuarioPorId,
  actualizarUsuario,
};