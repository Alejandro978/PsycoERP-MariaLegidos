const {
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  hasActivePatients,
  hasSessions,
  clinicHasInvoices,
  getClinicBillableStatus,
} = require("../../models/clinics/clinics_model");
const logger = require("../../utils/logger");

const obtenerClinicas = async (req, res) => {
  try {
    const {
      page,
      limit,
    } = req.query;

    // Construir filtros incluyendo paginación
    const filters = {};
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    const result = await getClinics(req.db, filters);

    res.json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener clínicas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las clínicas",
    });
  }
};

const actualizarClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, clinic_color, address, price, percentage, is_billable, billing_address, cif, fiscal_name } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de clínica inválido",
      });
    }

    const data = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: "El nombre debe ser un texto válido y no puede estar vacío",
        });
      }
      data.name = name.trim();
    }

    if (clinic_color !== undefined) {
      if (typeof clinic_color !== 'string' || clinic_color.trim() === '') {
        return res.status(400).json({
          success: false,
          error: "El color debe ser un texto válido y no puede estar vacío",
        });
      }
      data.clinic_color = clinic_color.trim();
    }

    if (address !== undefined) {
      data.address = address === null ? null : (address ? address.trim() : null);
    }

    if (price !== undefined) {
      if (price === null) {
        data.price = null;
      } else {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({
            success: false,
            error: "El precio debe ser un número válido mayor o igual a 0",
          });
        }
        data.price = priceNum;
      }
    }

    if (percentage !== undefined) {
      if (percentage === null) {
        data.percentage = null;
      } else {
        const percentageNum = parseFloat(percentage);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
          return res.status(400).json({
            success: false,
            error: "El porcentaje debe ser un número válido entre 0 y 100",
          });
        }
        data.percentage = percentageNum;
      }
    }

    // Validate is_billable if provided (accepts boolean or 0/1)
    if (is_billable !== undefined) {
      if (typeof is_billable === 'boolean') {
        data.is_billable = is_billable ? 1 : 0;
      } else if (is_billable === 0 || is_billable === 1 || is_billable === '0' || is_billable === '1') {
        data.is_billable = Number(is_billable);
      } else {
        return res.status(400).json({
          success: false,
          error: "is_billable debe ser booleano o 0/1",
        });
      }
    }

    if (billing_address !== undefined) {
      data.billing_address = billing_address === null ? null : (billing_address ? billing_address.trim() : null);
    }

    if (cif !== undefined) {
      data.cif = cif === null ? null : (cif ? cif.trim() : null);
    }

    if (fiscal_name !== undefined) {
      data.fiscal_name = fiscal_name === null ? null : (fiscal_name ? fiscal_name.trim() : null);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No se proporcionaron datos para actualizar",
      });
    }

    // Verificar si se está intentando cambiar is_billable de true a false y hay facturas
    if (data.is_billable === 0) { // is_billable viene como false
      // Obtener el estado actual de is_billable
      const currentIsBillable = await getClinicBillableStatus(req.db, id);
      if (currentIsBillable === null) {
        return res.status(404).json({
          success: false,
          error: "Clínica no encontrada",
        });
      }
      if (currentIsBillable === true) {
        // Actualmente es true, se quiere cambiar a false, verificar facturas
        const tieneFacturas = await clinicHasInvoices(req.db, id);
        if (tieneFacturas) {
          return res.status(400).json({
            success: false,
            error: "No se puede cambiar el campo 'Es facturable' debido a que la clínica tiene facturas asociadas",
          });
        }
      }
    }

    await updateClinic(req.db, id, data);

    res.json({
      success: true,
      message: "Clínica actualizada exitosamente",
    });
  } catch (err) {
    logger.error("Error al actualizar clínica:", err.message);

    if (err.message === "Clinic not found") {
      return res.status(404).json({
        success: false,
        error: "Clínica no encontrada",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al actualizar la clínica",
    });
  }
};

const eliminarClinica = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de clínica inválido",
      });
    }
    // Comprobaciones antes de eliminar
    const tienePacientes = await hasActivePatients(req.db, id);
    if (tienePacientes) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar la cl\u00ednica: existen pacientes activos asociados",
      });
    }

    const tieneSesiones = await hasSessions(req.db, id);
    if (tieneSesiones) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar la clínica: existen sesiones asociadas",
      });
    }

    const tieneFacturas = await clinicHasInvoices(req.db, id);
    if (tieneFacturas) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar la clínica: existen facturas asociadas",
      });
    }

    const eliminada = await deleteClinic(req.db, id);

    if (!eliminada) {
      return res.status(404).json({
        success: false,
        error: "Clínica no encontrada o ya está eliminada",
      });
    }

    res.json({
      success: true,
      message: "Clínica eliminada correctamente",
    });
  } catch (err) {
    logger.error("Error al eliminar clínica:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al eliminar la clínica",
    });
  }
};


const crearClinica = async (req, res) => {
  try {
    const { name, clinic_color, address, price, percentage, is_billable, billing_address, cif, fiscal_name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "El nombre de la clínica es requerido",
      });
    }

    if (!clinic_color || clinic_color.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "El color de la clínica es requerido",
      });
    }

    const data = {
      name: name.trim(),
      clinic_color: clinic_color.trim()
    };

    if (address !== undefined) {
      data.address = address === null ? null : (address ? address.trim() : null);
    }

    if (price !== undefined && price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          success: false,
          error: "El precio debe ser un número válido mayor o igual a 0",
        });
      }
      data.price = priceNum;
    }

    if (percentage !== undefined && percentage !== null) {
      const percentageNum = parseFloat(percentage);
      if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
        return res.status(400).json({
          success: false,
          error: "El porcentaje debe ser un número válido entre 0 y 100",
        });
      }
      data.percentage = percentageNum;
    }

    // Validate is_billable if provided (accepts boolean or 0/1)
    if (is_billable !== undefined) {
      if (typeof is_billable === 'boolean') {
        data.is_billable = is_billable ? 1 : 0;
      } else if (is_billable === 0 || is_billable === 1 || is_billable === '0' || is_billable === '1') {
        data.is_billable = Number(is_billable);
      } else {
        return res.status(400).json({
          success: false,
          error: "is_billable debe ser booleano o 0/1",
        });
      }
    }

    if (billing_address !== undefined) {
      data.billing_address = billing_address === null ? null : (billing_address ? billing_address.trim() : null);
    }

    if (cif !== undefined) {
      data.cif = cif === null ? null : (cif ? cif.trim() : null);
    }

    if (fiscal_name !== undefined) {
      data.fiscal_name = fiscal_name === null ? null : (fiscal_name ? fiscal_name.trim() : null);
    }

    const nuevaClinica = await createClinic(req.db, data);

    res.status(201).json({
      success: true,
      message: "Clínica creada exitosamente",
      data: nuevaClinica,
    });
  } catch (err) {
    logger.error("Error al crear clínica:", err.message);

    if (err.message === "Name is required") {
      return res.status(400).json({
        success: false,
        error: "El nombre de la clínica es requerido",
      });
    }

    if (err.message === "Clinic color is required") {
      return res.status(400).json({
        success: false,
        error: "El color de la clínica es requerido",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al crear la clínica",
    });
  }
};

module.exports = {
  obtenerClinicas,
  crearClinica,
  actualizarClinica,
  eliminarClinica,
};