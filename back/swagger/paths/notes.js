const notesPaths = {
    "/api/notes": {
        get: {
            tags: ["Notes"],
            summary: "Obtener notas paginadas con KPIs",
            description: "Obtiene una lista paginada de notas con filtros opcionales. Devuelve pending primero, completed después. Incluye KPIs (total, pending, completed). Ordenadas por fecha de creación descendente.",
            parameters: [
                {
                    name: "status",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["pending", "completed"],
                    },
                    description: "Estado de la nota",
                },
                {
                    name: "page",
                    in: "query",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1,
                    },
                    description: "Número de página para la paginación",
                },
                {
                    name: "limit",
                    in: "query",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 10000,
                        default: 10,
                    },
                    description: "Número de registros por página",
                },
            ],
            responses: {
                200: {
                    description: "Lista de notas obtenida exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/NotesResponse",
                            },
                        },
                    },
                },
                400: {
                    description: "Error de validación",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Notes"],
            summary: "Crear una nueva nota",
            description: "Crea una nota con estado pending por defecto. Solo requiere el mensaje.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/CreateNoteRequest",
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Nota creada exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateNoteResponse",
                            },
                        },
                    },
                },
                400: {
                    description: "Error de validación",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/notes/{id}/complete": {
        patch: {
            tags: ["Notes"],
            summary: "Marcar nota como completada",
            description: "Cambia el estado de una nota de pending a completed. Solo funciona si la nota existe, está activa y en estado pending.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer",
                    },
                    description: "ID de la nota a completar",
                },
            ],
            responses: {
                200: {
                    description: "Nota completada exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CompleteNoteResponse",
                            },
                        },
                    },
                },
                400: {
                    description: "Error de validación (ID inválido)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                404: {
                    description: "Nota no encontrada, no activa o ya completada",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/notes/{id}": {
        delete: {
            tags: ["Notes"],
            summary: "Eliminar una nota (soft delete)",
            description: "Marca una nota como inactiva (is_active = false). La nota no se elimina físicamente de la base de datos.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer",
                    },
                    description: "ID de la nota a eliminar",
                },
            ],
            responses: {
                200: {
                    description: "Nota eliminada exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/DeleteNoteResponse",
                            },
                        },
                    },
                },
                400: {
                    description: "Error de validación (ID inválido)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                404: {
                    description: "Nota no encontrada o ya eliminada",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
};

module.exports = notesPaths;
