# IMPLEMENTACIÓN VERIFACTU - ERP PSICOLOGÍA

## 📋 CONTEXTO DEL PROYECTO

### Sistema Actual
- **Cliente**: Psicóloga autónoma con CIF
- **Tipos de facturación**:
  - **B2C (Pacientes)**: ~50-60 facturas/mes, identificados por DNI/NIE
  - **B2B (Clínicas)**: ~2 facturas/mes, empresas con CIF y datos fiscales
- **Servicios**: Psicología sanitaria (exento de IVA)
- **IRPF**: 7% retención en facturas B2B (clínicas)
- **Numeración**: Correlativa compartida FAC-2025-XXXX (última: FAC-2025-0390)

### Arquitectura Técnica Actual
```
Node.js + MariaDB
├── Tabla: invoices (facturas principales)
├── Tabla: invoice_sessions (relación facturas-sesiones)
├── Tabla: patients (DNI/NIE)
├── Tabla: clinics (CIF, datos fiscales)
└── Numeración automática por año
```

---

## ✅ ANÁLISIS DE FACTIBILIDAD

### COMPATIBILIDAD ACTUAL (EXCELENTE)
- ✅ **CIF emisor** (psicóloga autónoma)
- ✅ **Identificación receptores** (CIF clínicas, DNI/NIE pacientes)
- ✅ **Numeración correlativa** compartida
- ✅ **Exención IVA** (servicios sanitarios)
- ✅ **Retención IRPF 7%** (facturas B2B)
- ✅ **Volumen bajo** (~60 facturas/mes) - Ideal para automatización
- ✅ **Estructura fiscal completa** implementada

### REQUISITOS LEGALES CUMPLIDOS
1. **Identificación fiscal completa**: ✅
2. **Numeración correlativa**: ✅
3. **Servicios sanitarios exentos IVA**: ✅
4. **Retenciones IRPF**: ✅
5. **B2B vs B2C correctamente diferenciados**: ✅

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### FASE 1: PREPARACIÓN (1-2 semanas)
#### **Administrativo**
- [ ] **Certificado digital** de la psicóloga (imprescindible)
- [ ] **Registro** en plataforma AEAT Verifactu
- [ ] **Configuración** entorno de pruebas AEAT

#### **Base de Datos**
```sql
-- Añadir campos Verifactu a tabla invoices
ALTER TABLE invoices ADD COLUMN verifactu_csv VARCHAR(100) NULL COMMENT 'Código Seguro de Verificación';
ALTER TABLE invoices ADD COLUMN verifactu_status ENUM('pending','sent','accepted','rejected','error') DEFAULT 'pending';
ALTER TABLE invoices ADD COLUMN verifactu_sent_at TIMESTAMP NULL;
ALTER TABLE invoices ADD COLUMN verifactu_xml LONGTEXT NULL COMMENT 'XML enviado a AEAT (opcional)';
ALTER TABLE invoices ADD COLUMN verifactu_response LONGTEXT NULL COMMENT 'Respuesta AEAT (debugging)';

-- Índices para consultas Verifactu
ALTER TABLE invoices ADD INDEX idx_verifactu_status (verifactu_status);
ALTER TABLE invoices ADD INDEX idx_verifactu_csv (verifactu_csv);
```

### FASE 2: DESARROLLO (2-3 semanas)
#### **Estructura del Servicio**
```javascript
// utils/verifactuService.js
const verifactuService = {
    // Generar XML según especificaciones AEAT
    generateXML: async (invoiceData) => {},
    
    // Firmar digitalmente con certificado
    signXML: async (xmlContent) => {},
    
    // Enviar a AEAT Verifactu
    sendToAEAT: async (signedXML) => {},
    
    // Procesar respuesta y extraer CSV
    processResponse: async (aeatResponse) => {},
    
    // Flujo completo
    processInvoice: async (invoiceId) => {}
};
```

#### **Integración en Facturación**
```javascript
// Modificar createInvoice y createInvoiceOfClinics
const result = await createInvoice(req.db, invoiceData);

// NUEVO: Envío automático a Verifactu
try {
    const verifactuResult = await verifactuService.processInvoice(result.invoice.id);
    result.verifactu = verifactuResult;
} catch (error) {
    // Log error pero no fallar la facturación
    logger.error('Error Verifactu:', error.message);
}
```

#### **Nuevos Endpoints**
```javascript
// GET /api/invoices/:id/verifactu-status
// POST /api/invoices/:id/resend-verifactu
// GET /api/invoices/verifactu-stats
```

### FASE 3: TESTING (1 semana)
- [ ] **Entorno pruebas AEAT** configurado
- [ ] **Validación** con facturas reales
- [ ] **Manejo de errores** y reconexiones
- [ ] **Testing** facturas B2B vs B2C

---

## 📊 MODALIDADES VERIFACTU

### SuministroLR (RECOMENDADO)
- **Descripción**: Envío de todas las facturas al Libro Registro
- **Ventajas**: Cumplimiento legal completo, automático
- **Ideal para**: Vuestro volumen (~60 facturas/mes)

### VerificaFactu (Solo verificación)
- **Descripción**: Solo verificación de facturas específicas
- **Menos completo**: No recomendado para cumplimiento integral

---

## 🔧 ESPECIFICACIONES TÉCNICAS

### Estructura XML Base
```xml
<SuministroLR>
  <Cabecera>
    <TipoOperacion>A0</TipoOperacion> <!-- Alta -->
    <TipoComunicacion>A0</TipoComunicacion>
    <CifDeclarante>[CIF_PSICOLOGA]</CifDeclarante>
  </Cabecera>
  <RegistroLRFacturasEmitidas>
    <PeriodoLiquidacion>[AAAAMM]</PeriodoLiquidacion>
    <IDFactura>
      <EmisorFactura>[CIF_PSICOLOGA]</EmisorFactura>
      <NumSerieFactura>[FAC-2025-XXXX]</NumSerieFactura>
      <FechaExpedicionFactura>[AAAA-MM-DD]</FechaExpedicionFactura>
    </IDFactura>
    <!-- Datos específicos B2B vs B2C -->
  </RegistroLRFacturasEmitidas>
</SuministroLR>
```

### Diferencias B2B vs B2C
```javascript
// B2B (Clínicas)
const b2bData = {
    tipoFactura: 'F1', // Factura
    contraparte: {
        nif: clinic.cif,
        nombreRazon: clinic.fiscal_name
    },
    importeTotal: total,
    baseImponible: total, // Sin IVA
    tipoImpositivo: 'E', // Exento
    retencion: total * 0.07 // IRPF 7%
};

// B2C (Pacientes)  
const b2cData = {
    tipoFactura: 'F1',
    contraparte: {
        nif: patient.dni,
        nombreRazon: `${patient.first_name} ${patient.last_name}`
    },
    importeTotal: total,
    baseImponible: total,
    tipoImpositivo: 'E' // Sin retención
};
```

---

## 💾 RECOMENDACIONES DE ALMACENAMIENTO

### Estructura de Archivos
```
/storage/
├── invoices/
│   ├── pdfs/
│   │   ├── 2025/
│   │   │   ├── FAC-2025-0391.pdf
│   │   │   └── FAC-2025-0392.pdf
│   └── verifactu/
│       ├── xml/
│       │   ├── FAC-2025-0391.xml
│       │   └── FAC-2025-0392.xml
│       └── responses/
│           ├── FAC-2025-0391-response.xml
│           └── FAC-2025-0392-response.xml
```

### Backup Strategy
- **Daily**: Backup automático de PDFs y XMLs
- **Weekly**: Backup completo de Base de Datos
- **Monthly**: Verificación integridad archivos

---

## ⚠️ CONSIDERACIONES CRÍTICAS

### Requisitos Previos
1. **Certificado Digital**: La psicóloga DEBE tener certificado digital válido
2. **Conectividad**: Dependencia de servicios AEAT (contemplar fallos)
3. **Retroactividad**: Verifactu NO es retroactivo, solo facturas nuevas desde implementación

### Manejo de Errores
```javascript
const errorHandling = {
    // AEAT no disponible
    aeatDown: 'Queue para reenvío automático',
    
    // Certificado expirado
    certExpired: 'Notificación urgente + facturación sin Verifactu',
    
    // Datos incorrectos
    invalidData: 'Validación previa + log detallado',
    
    // Respuesta inesperada
    unexpectedResponse: 'Retry automático + escalado manual'
};
```

### Monitorización
- **Dashboard**: Estado Verifactu en tiempo real
- **Alertas**: Fallos de envío, certificados próximos a expirar
- **Reportes**: Estadísticas mensuales de envíos

---

## 🚀 CRONOGRAMA ESTIMADO

| Semana | Actividad | Responsable |
|--------|-----------|-------------|
| 1-2 | Certificado digital + Registro AEAT | Cliente |
| 2-3 | Modificaciones BD + Servicio base | Desarrollo |
| 4-5 | Integración API + Endpoints | Desarrollo |
| 6 | Testing + Validación | Conjunto |
| 7 | Deploy + Monitoring | Desarrollo |

---

## 💰 COSTOS ESTIMADOS

### Desarrollo
- **Implementación base**: 3-4 semanas desarrollo
- **Testing y validación**: 1 semana
- **Documentación y formación**: 2-3 días

### Operacional
- **Certificado digital**: ~30€/año (cliente)
- **Storage adicional**: ~5€/mes (XMLs y PDFs)
- **Monitorización**: Incluido en sistema actual

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### AEAT Oficial
- [Especificaciones técnicas Verifactu](https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Verifactu/Verifactu.shtml)
- [Esquemas XSD oficiales](https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/)
- [Entorno de pruebas](https://www7.aeat.es/wlpl/TIKE-CONT/AutenticarUsu)

### Herramientas
- **Certificados**: FNMT, AC Camerfirma
- **Testing XML**: Validadores AEAT
- **Monitorización**: Dashboard personalizado

---

## ✅ VEREDICTO FINAL

**TOTALMENTE FACTIBLE** - Sistema actual muy compatible
- ✅ Volumen manejable (60 facturas/mes)
- ✅ Estructura fiscal completa implementada
- ✅ Diferenciación B2B/B2C clara
- ✅ Numeración correlativa correcta
- ✅ Exención IVA + IRPF bien definidos

**Implementación recomendada**: SuministroLR con envío automático post-facturación

---

*Documento creado: Noviembre 2025*  
*Estado: Análisis completo - Listo para implementación*