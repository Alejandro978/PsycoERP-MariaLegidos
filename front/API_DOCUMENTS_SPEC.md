# API Specification - Patient Documents

Esta especificación detalla los endpoints necesarios para la gestión de documentos de pacientes.

## Base URL
```
/api/patients/{patient_id}/documents
```

---

## 1. Subir Documento (Upload Document)

### Endpoint
```
POST /api/patients/{patient_id}/documents
```

### Descripción
Sube un nuevo documento para un paciente específico.

### Request Headers
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Path Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| patient_id | number | Sí | ID del paciente |

### Request Body (FormData)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| file | File | Sí | Archivo a subir (PDF, JPG, PNG, DOC, DOCX) |
| description | string | Sí | Descripción del documento |
| patient_id | number | Sí | ID del paciente (también en FormData) |

### Ejemplo de Request (FormData)
```javascript
const formData = new FormData();
formData.append('file', selectedFile); // File object
formData.append('description', 'Informe inicial de evaluación psicológica del paciente');
formData.append('patient_id', '1');
```

### Response Success (201 Created)
```json
{
  "success": true,
  "message": "Documento subido correctamente",
  "data": {
    "id": 3,
    "name": "Informe_Psicologico.pdf",
    "type": "application/pdf",
    "size": "245.8 KB",
    "upload_date": "2025-09-30",
    "description": "Informe inicial de evaluación psicológica del paciente",
    "file_url": "/documents/patients/1/informe_psicologico_20250930.pdf"
  }
}
```

### Response Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Error al subir el documento",
  "errors": {
    "file": ["El archivo es requerido"],
    "description": ["La descripción es requerida"]
  }
}
```

### Validaciones
- El archivo debe ser de tipo: PDF, JPG, JPEG, PNG, DOC, DOCX
- Tamaño máximo del archivo: 10MB
- La descripción debe tener al menos 3 caracteres
- El patient_id debe existir en la base de datos

### Notas de Implementación
1. **Nombre del archivo**: El backend debe generar un nombre único para evitar colisiones (ej: `{original_name}_{timestamp}.{extension}`)
2. **Tamaño del archivo**: Calcular automáticamente desde el archivo subido
3. **Tipo MIME**: Detectar automáticamente el tipo MIME del archivo
4. **Fecha de subida**: Usar la fecha actual del servidor
5. **Almacenamiento**: Guardar el archivo en un directorio seguro (ej: `/storage/documents/patients/{patient_id}/`)

---

## 2. Eliminar Documento (Delete Document)

### Endpoint
```
DELETE /api/patients/{patient_id}/documents/{document_id}
```

### Descripción
Elimina un documento específico de un paciente.

### Request Headers
```
Authorization: Bearer {token}
```

### Path Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| patient_id | number | Sí | ID del paciente |
| document_id | number | Sí | ID del documento a eliminar |

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Documento eliminado correctamente"
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "message": "Documento no encontrado"
}
```

### Notas de Implementación
1. Verificar que el documento pertenece al paciente especificado
2. Eliminar el archivo físico del sistema de archivos
3. Eliminar el registro de la base de datos
4. Implementar soft delete si es necesario (guardar en tabla de documentos eliminados)

---

## 3. Descargar Documento (Download Document)

### Endpoint
```
GET /api/patients/{patient_id}/documents/{document_id}/download
```

### Descripción
Descarga un documento específico de un paciente.

### Request Headers
```
Authorization: Bearer {token}
```

### Path Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| patient_id | number | Sí | ID del paciente |
| document_id | number | Sí | ID del documento a descargar |

### Response Success (200 OK)
```
Content-Type: application/pdf (o el tipo MIME correspondiente)
Content-Disposition: attachment; filename="nombre_documento.pdf"

[Binary file data]
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "message": "Documento no encontrado"
}
```

### Notas de Implementación
1. Verificar que el documento pertenece al paciente especificado
2. Verificar que el archivo existe en el sistema de archivos
3. Establecer headers apropiados:
   - `Content-Type`: Tipo MIME del archivo
   - `Content-Disposition`: `attachment; filename="{nombre_original}"`
   - `Content-Length`: Tamaño del archivo en bytes
4. Transmitir el archivo como stream para archivos grandes

---

## 4. Listar Documentos de un Paciente (Get Patient Documents)

### Endpoint
```
GET /api/patients/{patient_id}
```

### Descripción
Este endpoint ya existe y devuelve toda la información del paciente, incluyendo sus documentos en el array `PatientDocuments`.

### Response (dentro de la respuesta de detalle del paciente)
```json
{
  "success": true,
  "data": {
    "PatientResume": { ... },
    "PatientData": { ... },
    "PatientMedicalRecord": [ ... ],
    "PatientSessions": [ ... ],
    "PatientInvoice": [ ... ],
    "PatientDocuments": [
      {
        "id": 1,
        "name": "Informe_Psicologico_Inicial.pdf",
        "type": "application/pdf",
        "size": "239.9 KB",
        "upload_date": "2025-09-30",
        "description": "Informe inicial de evaluación psicológica del paciente",
        "file_url": "/documents/patients/1/informe_inicial_20250917.pdf"
      },
      {
        "id": 2,
        "name": "Consentimiento_Informado.pdf",
        "type": "application/pdf",
        "size": "125.4 KB",
        "upload_date": "2025-09-30",
        "description": "Documento de consentimiento informado firmado por el paciente",
        "file_url": "/documents/patients/1/consentimiento_20250915.pdf"
      }
    ]
  }
}
```

---

## Modelo de Datos (Database Schema)

### Tabla: `patient_documents`

| Campo | Tipo | Null | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Primary Key, Auto-increment |
| patient_id | INTEGER | NO | Foreign Key a tabla `patients` |
| name | VARCHAR(255) | NO | Nombre del archivo |
| type | VARCHAR(100) | NO | Tipo MIME (ej: application/pdf) |
| size | VARCHAR(50) | NO | Tamaño formateado (ej: "239.9 KB") |
| upload_date | DATE | NO | Fecha de subida (YYYY-MM-DD) |
| description | TEXT | YES | Descripción del documento |
| file_url | VARCHAR(500) | NO | URL o path relativo al archivo |
| file_path | VARCHAR(500) | NO | Path absoluto en el servidor (no se envía al frontend) |
| created_at | TIMESTAMP | NO | Fecha de creación del registro |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |
| deleted_at | TIMESTAMP | YES | Para soft delete (opcional) |

### Índices
```sql
CREATE INDEX idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX idx_patient_documents_upload_date ON patient_documents(upload_date);
```

### Foreign Key
```sql
ALTER TABLE patient_documents
ADD CONSTRAINT fk_patient_documents_patient
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
```

---

## Seguridad y Validaciones

### Autenticación
- Todos los endpoints requieren autenticación mediante Bearer Token
- Verificar que el usuario tiene permisos para acceder a los documentos del paciente

### Autorización
- Verificar que el usuario tiene permiso para ver/modificar documentos del paciente
- Los psicólogos solo pueden acceder a documentos de sus propios pacientes

### Validación de Archivos
1. **Extensiones permitidas**: pdf, jpg, jpeg, png, doc, docx
2. **Tamaño máximo**: 10MB (10485760 bytes)
3. **Validación de tipo MIME**: Verificar que el MIME type coincide con la extensión
4. **Sanitización del nombre**: Remover caracteres especiales y espacios

### Almacenamiento Seguro
1. No almacenar archivos en directorios públicamente accesibles
2. Generar nombres únicos para evitar sobrescritura
3. Estructura de directorios: `/storage/documents/patients/{patient_id}/`
4. Establecer permisos apropiados en el sistema de archivos

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Documento creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - Sin permisos para acceder al recurso |
| 404 | Not Found - Documento o paciente no encontrado |
| 413 | Payload Too Large - Archivo excede el tamaño máximo |
| 415 | Unsupported Media Type - Tipo de archivo no permitido |
| 500 | Internal Server Error - Error del servidor |

---

## Ejemplo de Flujo Completo

### 1. Usuario sube un documento
```javascript
// Frontend
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('description', 'Informe inicial');
formData.append('patient_id', '1');

fetch('/api/patients/1/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token...'
  },
  body: formData
});
```

### 2. Backend procesa la subida
```php
// Pseudocódigo backend
1. Validar el archivo (tamaño, tipo)
2. Generar nombre único
3. Guardar archivo en /storage/documents/patients/{patient_id}/
4. Calcular tamaño formateado
5. Guardar registro en base de datos
6. Retornar respuesta con datos del documento
```

### 3. Frontend recarga la lista
```javascript
// Frontend
if (uploadSuccess) {
  // Recargar detalle del paciente para obtener documentos actualizados
  fetch(`/api/patients/${patientId}`)
    .then(response => response.json())
    .then(data => {
      // Actualizar la lista de documentos
      updateDocumentsList(data.data.PatientDocuments);
    });
}
```

---

## Consideraciones Adicionales

### Performance
- Implementar streaming para archivos grandes
- Considerar uso de CDN para almacenamiento de archivos
- Cachear URLs de documentos si es apropiado

### Logs y Auditoría
- Registrar todas las operaciones sobre documentos (subida, descarga, eliminación)
- Incluir: usuario, fecha/hora, acción, documento afectado

### Backups
- Incluir documentos en el sistema de backups
- Considerar versionado de documentos si es necesario

### Límites y Cuotas
- Establecer límite de documentos por paciente (ej: 50 documentos)
- Establecer límite de almacenamiento total por paciente (ej: 100MB)
