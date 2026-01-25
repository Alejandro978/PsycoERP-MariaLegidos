# 📊 Ejemplos de Uso - Export de Sesiones a Excel

## 🧪 Probar con cURL

### 1. Exportar TODAS las sesiones del mes de enero 2026

```bash
curl -X POST http://localhost:3000/api/sessions/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "fecha_desde": "2026-01-01",
    "fecha_hasta": "2026-01-31"
  }' \
  --output sesiones_enero_2026.xlsx
```

### 2. Exportar sesiones de clínicas específicas

```bash
curl -X POST http://localhost:3000/api/sessions/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "clinic_id": [1, 2, 3],
    "fecha_desde": "2026-01-01",
    "fecha_hasta": "2026-01-31"
  }' \
  --output sesiones_clinicas.xlsx
```

### 3. Exportar solo sesiones completadas pagadas con Bizum

```bash
curl -X POST http://localhost:3000/api/sessions/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "status": "completada",
    "payment_method": "bizum",
    "fecha_desde": "2026-01-01",
    "fecha_hasta": "2026-01-31"
  }' \
  --output sesiones_bizum.xlsx
```

### 4. Exportar todas las sesiones (sin filtros)

```bash
curl -X POST http://localhost:3000/api/sessions/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{}' \
  --output todas_las_sesiones.xlsx
```

---

## 🎨 Probar desde Angular (Frontend)

### Service (sessions.service.ts)

```typescript
exportSessionsToExcel(filters: any): Observable<Blob> {
  return this.http.post(
    `${this.apiUrl}/sessions/export`,
    filters,
    {
      responseType: 'blob', // ¡IMPORTANTE!
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }
  );
}
```

### Component (sessions.component.ts)

```typescript
exportarSesiones() {
  // Obtener filtros actuales de la tabla
  const filters = {
    clinic_id: this.selectedClinicIds, // [1, 2, 3]
    status: this.selectedStatus,       // "completada"
    payment_method: this.selectedPaymentMethod, // "bizum"
    fecha_desde: this.fechaDesde,      // "2026-01-01"
    fecha_hasta: this.fechaHasta,      // "2026-01-31"
  };

  // Mostrar loading
  this.isExporting = true;

  this.sessionsService.exportSessionsToExcel(filters).subscribe({
    next: (blob) => {
      // Crear URL temporal del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `sesiones_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();

      // Limpiar
      window.URL.revokeObjectURL(url);

      this.isExporting = false;
      this.toastr.success('Excel descargado correctamente', 'Éxito');
    },
    error: (err) => {
      this.isExporting = false;

      if (err.status === 404) {
        this.toastr.warning('No se encontraron sesiones con los filtros especificados', 'Sin datos');
      } else {
        this.toastr.error('Error al exportar sesiones', 'Error');
      }

      console.error(err);
    }
  });
}
```

### Template (sessions.component.html)

```html
<button
  (click)="exportarSesiones()"
  [disabled]="isExporting"
  class="btn btn-success"
>
  <i class="fas fa-file-excel"></i>
  {{ isExporting ? 'Exportando...' : 'Exportar a Excel' }}
</button>
```

---

## 🔍 Respuestas del Endpoint

### ✅ Éxito (200)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sesiones_2026-01-25.xlsx"
Content-Length: 15234

[Binary Excel File]
```

### ❌ Sin datos (404)

```json
{
  "success": false,
  "error": "No se encontraron sesiones con los filtros especificados"
}
```

### ❌ Error del servidor (500)

```json
{
  "success": false,
  "error": "Error al generar el archivo Excel"
}
```

---

## 📋 Filtros Disponibles

| Parámetro        | Tipo                | Descripción            | Ejemplo                                                                |
| ---------------- | ------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `clinic_id`      | Array\<number\>     | IDs de clínicas        | `[1, 2, 3]`                                                            |
| `status`         | string              | Estado de la sesión    | `"completada"` o `"cancelada"`                                         |
| `payment_method` | string              | Método de pago         | `"bizum"`, `"efectivo"`, `"transferencia"`, `"tarjeta"`, `"pendiente"` |
| `fecha_desde`    | string (YYYY-MM-DD) | Fecha inicio del rango | `"2026-01-01"`                                                         |
| `fecha_hasta`    | string (YYYY-MM-DD) | Fecha fin del rango    | `"2026-01-31"`                                                         |

**Nota:** Todos los filtros son opcionales. Si no se envía ninguno, se exportan todas las sesiones.

---

## 📊 Columnas del Excel Generado

1. **Paciente** - Nombre completo del paciente
2. **Tipo** - Modalidad (presencial/online)
3. **Fecha** - Fecha de la sesión (YYYY-MM-DD)
4. **Clínica** - Nombre de la clínica
5. **Estado** - Estado de la sesión (completada/cancelada)
6. **Precio** - Precio bruto en euros (formato: 60.00€)
7. **Comisión** - Comisión de la clínica en euros (formato: 18.00€)
8. **Neto** - Precio neto recibido por el psicólogo (formato: 42.00€)
9. **Pago** - Método de pago utilizado

### Fila de Totales

Al final del Excel se incluye una fila con:

- **TOTAL** en la primera columna
- Suma total de **Precio**
- Suma total de **Comisión**
- Suma total de **Neto**
- Número de sesiones exportadas

---

## 🎨 Características del Excel

- ✅ Encabezado con fondo azul y texto blanco
- ✅ Primera fila congelada para scroll vertical
- ✅ Filas alternadas con fondo gris claro
- ✅ Formato de moneda con símbolo €
- ✅ Bordes en todas las celdas
- ✅ Columnas con ancho ajustado
- ✅ Fila de totales con fondo amarillo y texto en negrita
- ✅ Alineación correcta por tipo de dato

---

## 🐛 Troubleshooting

### Problema: "No se encontraron sesiones"

**Solución:** Verifica que:

- Los filtros son correctos
- Existen sesiones en ese rango de fechas
- Las clínicas especificadas tienen sesiones

### Problema: El archivo descargado está corrupto

**Solución:** Asegúrate de:

- Usar `responseType: 'blob'` en el frontend
- No manipular el buffer en el backend
- Headers correctos en la respuesta

### Problema: El navegador no descarga automáticamente

**Solución:**

- Verifica que el header `Content-Disposition` esté presente
- Usa el método `createObjectURL` + `<a>` como en el ejemplo
- Comprueba que no hay errores en la consola del navegador

---

## 📝 Logs del Backend

Cuando se ejecuta correctamente, verás estos logs:

```
🔍 Exportando sesiones con filtros: {"fecha_desde":"2026-01-01","fecha_hasta":"2026-01-31"}
✅ Se encontraron 45 sesiones para exportar
📊 Excel generado correctamente: sesiones_2026-01-25.xlsx (45 sesiones)
```
