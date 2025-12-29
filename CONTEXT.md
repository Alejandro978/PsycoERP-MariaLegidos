# CONTEXTO FUNCIONAL - PSYCHOLOGY ERP

## 🎯 DESCRIPCIÓN GENERAL DEL SISTEMA

**Psychology ERP** es un sistema de gestión integral (ERP) diseñado específicamente para psicólogos/as que trabajan en múltiples clínicas y necesitan llevar un control detallado de:
- Pacientes y sus historiales clínicos
- Sesiones de terapia (presenciales y online)
- Facturación diferenciada por clínica
- Bonos promocionales
- Recordatorios automatizados vía WhatsApp
- Documentación de pacientes
- Métricas y análisis de rendimiento

El sistema está implementado como una aplicación web moderna con arquitectura cliente-servidor:
- **Frontend**: Angular 17 con componentes standalone
- **Backend**: Node.js con Express
- **Base de datos**: MariaDB/MySQL

---

## 👥 MÓDULO DE USUARIOS

### Funcionalidad Principal
El sistema soporta múltiples usuarios (psicólogos) con acceso mediante autenticación JWT.

### Flujo de Autenticación
1. **Login**: El usuario ingresa email y contraseña
2. **Validación**: El sistema verifica las credenciales contra la base de datos
3. **Token**: Se genera un token JWT con validez de 7 días
4. **Almacenamiento**: El token se guarda en localStorage/sessionStorage
5. **Renovación**: El sistema puede renovar tokens automáticamente antes de expirar
6. **Logout**: Se limpia el token y se redirige al login

### Información del Usuario
Cada usuario tiene un perfil completo con:
- **Datos personales**: Nombre completo, DNI, email
- **Datos profesionales**: Número de colegiado, porcentaje de IRPF
- **Datos fiscales**: IBAN, dirección fiscal completa (calle, número, puerta, ciudad, provincia, código postal)
- **Uso**: Estos datos se utilizan automáticamente para generar las facturas

### Gestión del Perfil
El usuario puede:
- Ver su perfil completo en la sección "Configuración"
- Actualizar cualquier dato de su perfil
- Los cambios se reflejan inmediatamente en las facturas futuras

---

## 🏥 MÓDULO DE CLÍNICAS

### Concepto de Clínica
Una "clínica" representa un lugar de trabajo del psicólogo. Puede ser:
- Una clínica física (con dirección)
- Consulta online (sin dirección)
- Consulta privada del propio psicólogo

### Información de Cada Clínica

#### Datos Básicos
- **Nombre**: Identificador de la clínica
- **Color**: Color distintivo para visualización en calendario (ej: #3B82F6 para azul)
- **Dirección**: Dirección física (puede estar vacía si es online)
- **Precio**: Precio estándar por sesión en esa clínica
- **Porcentaje**: Porcentaje que recibe el psicólogo (ej: 70% significa que de 60€ brutosi el psicólogo recibe 42€)

#### Datos de Facturación (para clínicas que emiten facturas)
- **is_billable**: Booleano que indica si la clínica emite facturas al psicólogo
- **Razón social**: Nombre fiscal de la clínica
- **CIF**: Número de identificación fiscal
- **Dirección de facturación**: Dirección fiscal completa

### Tipos de Facturación

#### Clínica NO Facturable (is_billable = false)
- El psicólogo factura directamente a los pacientes
- Ejemplo: Consulta privada, clínicas que no emiten facturas
- El módulo de facturación permite generar facturas individuales por paciente

#### Clínica Facturable (is_billable = true)
- La clínica emite una factura mensual al psicólogo
- El psicólogo NO factura a los pacientes (la clínica lo hace)
- El módulo de facturación permite generar una factura única mensual por clínica
- Se calcula sobre el monto neto (precio × porcentaje)

### Operaciones con Clínicas
- **Crear nueva clínica**: Se registra con todos sus datos
- **Editar clínica**: Actualizar cualquier dato, incluyendo cambiar de no facturable a facturable (solo si no tiene facturas emitidas)
- **Eliminar clínica**: Soft delete (solo si no tiene pacientes activos asociados)
- **Visualización**: Lista completa de clínicas activas con paginación

### Uso en el Sistema
Las clínicas se utilizan para:
1. **Asignar pacientes**: Cada paciente está asociado a una clínica principal
2. **Registrar sesiones**: Cada sesión se vincula a una clínica específica
3. **Visualizar calendario**: Las sesiones se colorean según la clínica
4. **Calcular ingresos**: Se distingue entre ingresos brutos y netos según el porcentaje
5. **Generar facturas**: Diferentes flujos según si la clínica es facturable o no

---

## 👤 MÓDULO DE PACIENTES

### Información Completa del Paciente

#### Datos Personales
- **Nombre y apellidos**
- **DNI**: Documento de identidad
- **Email y teléfono**: Para contacto y recordatorios
- **Fecha de nacimiento**: Para calcular edad y estadísticas
- **Género**: Masculino/Femenino/Otro
- **Ocupación**: Profesión del paciente

#### Datos de Dirección
- **Calle, número, puerta**
- **Código postal, ciudad, provincia**
- Estos datos se usan para las facturas

#### Datos Clínicos
- **Estado del paciente**: 
  - "en curso": Paciente activo con tratamiento actual
  - "alta": Tratamiento finalizado exitosamente
  - "baja": Paciente que abandona el tratamiento
  - "derivado": Paciente derivado a otro profesional
- **Clínica asociada**: Clínica principal donde se atiende
- **Fecha de inicio del tratamiento**
- **Es menor de edad**: Booleano para consideraciones especiales

### Modo Preferido de Sesión
El sistema determina automáticamente el modo preferido:
- Si la clínica asociada tiene dirección → "Presencial"
- Si la clínica no tiene dirección → "Online"

### Vista Detallada del Paciente
Al abrir la ficha de un paciente, se muestra una interfaz con **6 tabs principales**:

#### Tab 1: RESUMEN
Muestra métricas y datos clave:
- **Información de contacto**: Email, teléfono, modo preferido
- **Estadísticas de sesiones**:
  - Sesiones completadas
  - Sesiones canceladas
- **Últimas 10 sesiones**: Tabla con tipo, fecha, precio, método de pago
- **Información financiera del año actual**:
  - Total gastado por el paciente
  - Número de facturas emitidas

#### Tab 2: DATOS DEL PACIENTE
Formulario completo con todos los datos personales, de dirección y clínicos. Permite:
- Visualizar todos los campos
- Editar cualquier campo
- Guardar cambios
- Validación de campos obligatorios

#### Tab 3: HISTORIA CLÍNICA
Editor tipo "OneNote" para notas clínicas:
- **Crear notas**: Con título y contenido libre
- **Organizar por fecha**: Ordenadas cronológicamente
- **Editar notas**: Actualizar título y contenido
- **Eliminar notas**: Borrado permanente
- **Búsqueda**: Filtrar notas por título o contenido
- **Formato**: Soporte para texto enriquecido

Cada nota tiene:
- ID único
- Título descriptivo
- Contenido (puede ser extenso)
- Fecha de creación
- Fecha de última modificación

#### Tab 4: SESIONES
Tabla detallada de todas las sesiones del paciente:
- **Columnas**: Fecha, Clínica, Estado, Precio Bruto, Precio Neto, Método de Pago, Notas
- **Precio Neto**: Se calcula automáticamente (precio × porcentaje de la clínica)
- **Filtros**: Por fecha, estado, clínica, método de pago
- **Exportación**: Botón para descargar las sesiones a Excel
- **Acciones**: Ver detalle, editar, eliminar sesión
- **Orden**: Por defecto ordenado por fecha descendente (más recientes primero)

#### Tab 5: FACTURAS
Gestión de facturación del paciente:
- **Lista de facturas emitidas**: Con número, fecha, concepto, total
- **Generar nueva factura**: 
  - Seleccionar sesiones pendientes de facturar
  - Editar número de factura (con formato FAC-YYYY-NNNN)
  - Generar PDF descargable
  - Marcar sesiones como facturadas
- **Filtros**: Por mes y año
- **Vista previa**: Antes de generar la factura
- **Descarga**: PDF con formato profesional

#### Tab 6: BONOS
Sistema de bonos promocionales:

**KPIs de Bonos**:
- Total de bonos del paciente
- Bonos activos
- Bonos consumidos
- Bonos expirados

**Lista de Bonos**: Cada bono muestra:
- ID del bono
- Fecha de compra
- Fecha de expiración
- Precio total del bono
- Precio por sesión
- Sesiones totales
- Sesiones usadas
- Sesiones restantes
- Estado: activo/consumed/expired
- Porcentaje de progreso visual

**Crear Nuevo Bono**:
- Seleccionar número de sesiones (ej: 5, 10, 20)
- Definir precio total del bono
- Calcular precio por sesión automáticamente
- La fecha de expiración se establece automáticamente (1 año desde la compra)

**Usar Sesión del Bono**:
- Botón para registrar uso de una sesión
- Se actualiza automáticamente:
  - Incrementa sesiones usadas
  - Decrementa sesiones restantes
  - Actualiza porcentaje de progreso
  - Cambia estado a "consumed" cuando se agotan todas las sesiones

**Historial de Uso**:
- Ver todas las sesiones en las que se usó el bono
- Fecha de uso de cada sesión

### Gestión de Pacientes

#### Lista de Pacientes Activos
- Muestra todos los pacientes con estado "en curso"
- Filtros disponibles:
  - Por nombre, apellidos, DNI, email
  - Por clínica
  - Por fecha de alta (rango de fechas)
  - Por género
  - Por si es menor de edad
- Paginación de resultados
- Ordenado por fecha de creación (más recientes primero)

#### Crear Nuevo Paciente
Formulario completo con:
- Todos los campos de datos personales, dirección y clínicos
- Validación de campos obligatorios (nombre, apellidos, DNI, email, teléfono, clínica)
- Asignación automática de estado "en curso"
- Generación automática de fechas de creación/actualización

#### Editar Paciente
- Actualizar cualquier campo
- Validaciones en tiempo real
- Guardado automático de fecha de actualización

#### Dar de Baja a Paciente
El sistema permite cambiar el estado del paciente de "en curso" a otro estado:
- **Validación**: Verifica que no tenga sesiones futuras programadas
- **Estados disponibles**: alta, baja, derivado
- **Efecto**: El paciente deja de aparecer en la lista de activos

#### Pacientes Inactivos
Lista separada de pacientes con estado diferente a "en curso":
- Filtros similares a pacientes activos
- Opción de **Restaurar Paciente**: Cambiar estado nuevamente a "en curso"
- Ordenado por fecha de última actualización

#### Eliminar Paciente
- **Soft delete**: El paciente no se borra físicamente, solo se marca como inactivo
- **Restricción**: No se puede eliminar si tiene sesiones futuras programadas
- El paciente deja de aparecer en todas las listas

---

## 📅 MÓDULO DE CALENDARIO

### Vistas Disponibles

#### Vista Semanal
- **Rango**: Muestra lunes a domingo
- **Horario**: 07:00 - 21:00 (15 franjas horarias)
- **Navegación**: Botones para semana anterior/siguiente, o ir a "Hoy"
- **Selector de fecha**: Permite saltar a cualquier semana específica
- **Sesiones**: Se muestran como bloques coloreados según la clínica

#### Vista Mensual
- **Grid**: 7 columnas (días de la semana) × filas (semanas del mes)
- **Navegación**: Botones para mes anterior/siguiente, o ir a mes actual
- **Selector de mes**: Permite saltar a cualquier mes/año
- **Sesiones**: Se muestran como pastillas pequeñas con hora y nombre del paciente
- **Indicador**: Número total de sesiones por día

### Representación Visual de Sesiones

#### Colores por Clínica
Cada clínica tiene un color asignado que permite identificar visualmente:
- Azul (#3B82F6): Clínica A
- Verde (#10B981): Clínica B
- Ámbar (#F59E0B): Clínica C
- Púrpura (#8B5CF6): Consulta privada
- (Los colores son configurables por clínica)

#### Estados de Sesión
Las sesiones se visualizan diferente según su estado:
- **Scheduled (programada)**: Color normal de la clínica, borde sólido
- **Completed (completada)**: Color normal, marca de ✓
- **Cancelled (cancelada)**: Gris con tachado
- **No-show (inasistencia)**: Rojo pálido con indicador especial

#### Información en Hover
Al pasar el cursor sobre una sesión, se muestra un tooltip con:
- Nombre del paciente
- Hora de inicio - fin
- Nombre de la clínica
- Tipo (Presencial/Online)
- Estado actual

### Crear Nueva Sesión desde Calendario

#### Flujo Normal
1. Click en un espacio vacío del calendario
2. Se abre un modal con formulario precargado:
   - Fecha seleccionada
   - Hora del slot clicado (si aplica)
3. Completar campos requeridos:
   - **Paciente**: Selector con todos los pacientes activos
   - **Clínica**: Se autoselecciona la clínica del paciente (editable)
   - **Fecha**: Pre-rellenada (editable)
   - **Hora inicio**: Pre-rellenada (editable)
   - **Hora fin**: Se calcula automáticamente (sesión de 1 hora, editable)
   - **Modo**: Presencial/Online (según la clínica)
   - **Estado**: Scheduled por defecto
   - **Precio**: Se autocarga del precio de la clínica (editable)
   - **Método de pago**: Pendiente/Efectivo/Tarjeta/Transferencia/Seguro
   - **Notas**: Campo libre para observaciones
4. **Validaciones**:
   - No permitir crear sesión en horario ya ocupado
   - Si existe solapamiento, mostrar advertencia con detalles de la sesión conflictiva
5. Al guardar:
   - Se crea el registro en base de datos
   - Se actualiza automáticamente el calendario
   - Aparece la nueva sesión en el color de la clínica

#### Editar Sesión Existente
1. Click en una sesión del calendario
2. Se abre el mismo modal en "modo edición":
   - Todos los campos precargados con los datos actuales
   - Permite modificar cualquier campo
   - **Validaciones especiales**:
     - Si se cambia la fecha/hora, validar que no haya solapamiento con otras sesiones
     - Excluir la sesión actual de la validación de solapamiento
3. Al guardar:
   - Se actualizan los datos en base de datos
   - Se actualiza automáticamente la visualización en el calendario
4. Opción de **Eliminar sesión** (con confirmación)

### Detalle Emergente de Sesión

Al hacer click en una sesión, se puede abrir un popup completo con:
- **Información del paciente**: Nombre completo, teléfono, email
- **Detalles de la sesión**: Fecha, hora inicio-fin, duración
- **Clínica y ubicación**: Nombre, dirección (si aplica)
- **Aspectos financieros**: Precio bruto, precio neto, método de pago
- **Estado actual**: Con opción de cambiar estado
- **Notas clínicas**: Observaciones de la sesión
- **Acciones disponibles**:
  - Editar sesión
  - Cambiar estado (completada, cancelada, no-show)
  - Enviar recordatorio por WhatsApp
  - Eliminar sesión (con confirmación)
  - Ir a la ficha del paciente

### Gestión de Horarios

#### Detección de Solapamientos
El sistema verifica automáticamente conflictos horarios:
- Al crear una nueva sesión
- Al modificar fecha/hora de una sesión existente
- **Lógica**: Una sesión se solapa si:
  - La nueva sesión empieza antes de que termine una existente Y
  - La nueva sesión termina después de que empiece una existente

#### Mensaje de Conflicto
Si hay solapamiento, se muestra:
- Alerta visual clara
- Detalles de la sesión conflictiva (hora, paciente, clínica)
- Opción de cancelar o modificar la hora

---

## 🗓️ MÓDULO DE SESIONES

### Tabla Maestra de Sesiones
Vista completa de todas las sesiones del sistema con:

#### Columnas de Información
1. **Fecha**: Formato DD/MM/YYYY
2. **Paciente**: Nombre completo (enlace a ficha del paciente)
3. **Clínica**: Nombre con color distintivo
4. **Estado**: Completada/Programada/Cancelada/Inasistencia
5. **Precio Bruto**: Monto total de la sesión
6. **Precio Neto**: Lo que recibe el psicólogo (bruto × porcentaje)
7. **Método de Pago**: Efectivo/Tarjeta/Transferencia/Seguro/Pendiente
8. **Acciones**: Botones para ver, editar, eliminar

#### Sistema de Filtros Avanzados

**Filtro por Fechas**:
- Selector de fecha desde (fecha_desde)
- Selector de fecha hasta (fecha_hasta)
- Por defecto: Último mes

**Filtro por Clínica**:
- Selector múltiple o individual
- Opción "Todas las clínicas"
- Se actualiza dinámicamente con las clínicas disponibles

**Filtro por Estado**:
- Completada
- Programada
- Cancelada
- Inasistencia
- Todas

**Filtro por Método de Pago**:
- Efectivo
- Tarjeta
- Transferencia
- Seguro
- Pendiente
- Todos

**Aplicación de Filtros**:
- Los filtros se combinan (operación AND)
- Se mantienen al navegar entre páginas
- Botón "Limpiar filtros" para resetear
- Los KPIs se actualizan según los filtros aplicados

#### KPIs de Sesiones
En la parte superior de la tabla se muestran métricas calculadas según los filtros:

1. **Sesiones Completadas**: Total de sesiones completadas en el periodo/filtros
2. **Sesiones Canceladas**: Total de sesiones canceladas
3. **Ingresos Brutos**: Suma de precios de todas las sesiones (excepto "pendiente")
4. **Ingresos Netos**: Suma de precios netos (bruto × porcentaje de cada clínica)

Estos KPIs:
- Se calculan en tiempo real según los filtros
- Se actualizan automáticamente al cambiar filtros
- Excluyen sesiones con pago "pendiente" del cálculo de ingresos

#### Paginación
- Resultados por página: Configurable (10, 25, 50, 100)
- Navegación: Primera, Anterior, Siguiente, Última página
- Contador: "Mostrando X-Y de Z sesiones"

#### Exportación a Excel
Botón para descargar todas las sesiones filtradas a un archivo Excel:
- Incluye todas las columnas visibles
- Respeta los filtros aplicados
- Formato limpio y profesional
- Nombre del archivo: `sesiones_YYYY-MM-DD.xlsx`

### Operaciones con Sesiones

#### Crear Nueva Sesión
Formulario completo con todos los campos mencionados en el módulo de calendario.

#### Editar Sesión
- Acceso desde tabla de sesiones o calendario
- Permite modificar todos los campos
- Validación de solapamientos horarios
- Actualización automática de todos los lugares donde aparece

#### Cambiar Estado de Sesión
Transiciones permitidas:
- Scheduled → Completed
- Scheduled → Cancelled
- Scheduled → No-show
- Cualquier estado → Scheduled (reprogramar)

#### Eliminar Sesión
- Confirmación obligatoria
- Soft delete (marca is_active = false)
- No aparece más en listados
- **Restricción**: Si la sesión está facturada, puede requerir confirmación adicional

---

## 💰 MÓDULO DE FACTURACIÓN

### Dos Flujos de Facturación

El sistema maneja dos tipos diferentes de facturación:

#### FLUJO A: Facturas a Pacientes (Clínicas NO Facturables)
Para clínicas donde el psicólogo factura directamente a cada paciente.

#### FLUJO B: Facturas de Clínicas (Clínicas Facturables)
Para clínicas que emiten una factura mensual al psicólogo.

### Interfaz Principal
Dos tabs en la vista de facturación:

#### Tab 1: FACTURACIÓN A PACIENTES

**KPIs Globales** (con filtros de mes/año):
1. **Total Facturas Emitidas**: Histórico de facturas generadas
2. **Total Facturado Bruto (Histórico)**: Suma total de todas las sesiones
3. **Total Facturado Bruto (Mes Actual)**: Filtrado por mes/año
4. **Total Facturado Neto (Mes Actual)**: Calculado con porcentajes de clínicas
5. **Desglose por Clínica**: Tabla con:
   - Nombre de clínica
   - Total sesiones del mes
   - Total bruto
   - Porcentaje de la clínica
   - Total neto

**Sección: Facturas Pendientes**
- Filtro de mes y año
- Lista de pacientes con sesiones pendientes de facturar:
  - Nombre completo del paciente
  - DNI, email, dirección
  - Número de sesiones pendientes
  - Total a facturar
  - Nombre de la clínica
  - Lista detallada de sesiones (fecha, precio)
- Botón "Generar Factura" por cada paciente

**Proceso de Generar Factura a Paciente**:
1. Click en "Generar Factura"
2. Se abre modal con:
   - **Vista previa de la factura**: Con todo el formato final
   - **Datos del emisor**: Cargados automáticamente del perfil del usuario
   - **Datos del receptor**: Datos del paciente
   - **Lista de sesiones**: Con fechas y precios
   - **Cálculos**:
     - Subtotal (suma de sesiones)
     - Base imponible
     - IRPF (según porcentaje del usuario)
     - Total a pagar
   - **Número de factura**: Editable, con formato sugerido FAC-YYYY-NNNN
     - Se genera automáticamente el siguiente número disponible
     - El usuario puede modificarlo si lo desea
3. Botón "Generar PDF":
   - Crea el registro de factura en base de datos
   - Marca las sesiones como facturadas (campo `invoiced = 1`)
   - Genera PDF descargable con diseño profesional
4. Las sesiones facturadas no aparecen más en "Pendientes"

**Sección: Facturas Emitidas**
- Filtro de mes y año
- Lista de todas las facturas emitidas:
  - Número de factura
  - Fecha de emisión
  - Nombre del paciente
  - DNI
  - Número de sesiones incluidas
  - Total facturado
  - Botón "Ver PDF" para re-descargar
  - Botón "Ver Detalle" para ver sesiones incluidas

#### Tab 2: FACTURACIÓN DE CLÍNICAS

**Sección: Facturas Pendientes de Clínicas**
- Filtro de mes y año
- Lista de clínicas facturables con sesiones pendientes:
  - Nombre de la clínica
  - Número de sesiones del mes
  - Total neto a recibir (calculado con porcentajes)
  - Botón "Generar Factura de Clínica"

**Validación Importante**:
- Solo se puede generar **una factura por clínica por mes**
- Si ya existe una factura de una clínica en un mes, no se puede crear otra
- Mensaje de error claro indicando la factura existente

**Proceso de Generar Factura de Clínica**:
1. Click en "Generar Factura de Clínica"
2. Se abre modal con:
   - **Vista previa de factura de clínica**:
     - Datos del emisor (psicólogo): Del perfil del usuario
     - Datos del receptor (clínica): Razón social, CIF, dirección de facturación
     - **Concepto**: "Servicios de psicología prestados en [mes] de [año]"
     - Total de sesiones realizadas
     - Total neto (lo que recibe el psicólogo)
   - **Número de factura**: Editable, formato sugerido
3. Botón "Generar PDF":
   - Valida que no exista ya una factura de esa clínica en ese mes
   - Crea registro en base de datos con `clinic_id`
   - Marca sesiones como facturadas
   - Genera PDF con formato específico para clínicas
4. Las sesiones facturadas se excluyen de futuras facturas

**Sección: Facturas Emitidas a Clínicas**
- Filtro de mes y año
- Lista de todas las facturas de clínicas emitidas:
  - Número de factura
  - Fecha de emisión
  - Nombre de la clínica (razón social)
  - CIF
  - Número de sesiones incluidas
  - Total neto
  - Botones de acción (Ver PDF, Ver Detalle)

### Generación de Números de Factura

**Formato Sugerido**: `FAC-YYYY-NNNN`
- FAC: Prefijo fijo
- YYYY: Año de emisión
- NNNN: Número secuencial del año (0001, 0002, etc.)

**Comportamiento**:
1. Al abrir el modal de generar factura, el sistema:
   - Consulta la última factura emitida del año actual
   - Extrae el número secuencial
   - Sugiere el siguiente número disponible
2. El usuario puede:
   - Aceptar el número sugerido
   - Editar manualmente el número
   - Usar cualquier formato personalizado
3. **No hay validación de unicidad**: El usuario es responsable de evitar duplicados
4. El número se guarda exactamente como se introduce

### Formato de Facturas PDF

#### Factura a Paciente
- **Cabecera**: Logo, título "FACTURA"
- **Número de factura y fecha**
- **Emisor (Psicólogo)**: Nombre, DNI, dirección completa, número de colegiado
- **Receptor (Paciente)**: Nombre, DNI, dirección completa
- **Tabla de servicios**:
  - Concepto: "Sesión de psicología - [fecha]"
  - Precio por sesión
  - Línea por cada sesión incluida
- **Totales**:
  - Subtotal
  - Base imponible
  - Retención IRPF (%)
  - **Total a pagar** (en grande)
- **Notas al pie**: Texto legal, información de contacto
- **Diseño**: Profesional, limpio, con separadores y uso de color corporativo

#### Factura a Clínica
- Similar estructura pero:
- **Receptor**: Datos fiscales de la clínica (razón social, CIF, dirección de facturación)
- **Concepto global**: "Servicios de psicología - [mes] de [año]"
- **Detalle**: Total de sesiones prestadas, precio por sesión promedio
- **Total neto**: Monto que recibe el psicólogo (ya con el porcentaje aplicado)
- **Sin IRPF**: La retención se gestiona de otra forma en este caso

---

## 🔔 MÓDULO DE RECORDATORIOS

### Lógica de Días para Recordatorios

El sistema muestra las sesiones que requieren recordatorio según una lógica especial:

**Lunes a Jueves**:
- Mostrar sesiones del **día siguiente**
- Ejemplo: Si es martes, mostrar sesiones del miércoles

**Viernes, Sábado y Domingo**:
- Mostrar sesiones del **próximo lunes**
- Ejemplo: Si es viernes, mostrar sesiones del lunes siguiente

Esta lógica asegura que los recordatorios se envíen con tiempo suficiente pero no demasiado anticipado.

### Vista de Recordatorios Pendientes

**Información mostrada**:
- Fecha objetivo de las sesiones a recordar
- Total de sesiones pendientes
- Lista de sesiones:
  - Nombre del paciente
  - Hora de inicio
  - Hora de fin
  - Indicador: ¿Ya se envió recordatorio?
    - ✓ Verde: Recordatorio enviado
    - ⚠️ Naranja: Pendiente de enviar

**Ordenamiento**: Por hora de inicio (más temprana primero)

### Enviar Recordatorio por WhatsApp

#### Flujo Completo
1. Click en botón "Enviar Recordatorio" junto a una sesión
2. El sistema genera automáticamente:
   - **Mensaje personalizado** con plantilla aleatoria
   - **Deeplink de WhatsApp** con número del paciente y mensaje pre-escrito
3. Se abre automáticamente WhatsApp:
   - En el navegador: WhatsApp Web
   - En móvil: App de WhatsApp
   - Con el chat del paciente abierto
   - Con el mensaje completo pre-escrito
4. El psicólogo solo debe hacer click en "Enviar"
5. El sistema registra que se envió el recordatorio
6. La sesión se marca con ✓ verde en la lista

#### Contenido del Mensaje

**Para Sesiones Presenciales**:
```
*RECORDATORIO DE CITA PSICOLÓGICA*

Hola [Nombre del Paciente],

Te recuerdo que tienes una cita programada para:

*Fecha:* [día de la semana, dd de mes de año]
*Hora:* [HH:MM]
*Modalidad:* Presencial
*Clínica:* [Nombre de la clínica]
*Dirección:* [Dirección completa]

¡Confírmame asistencia cuando puedas!
```

**Para Sesiones Online**:
```
*RECORDATORIO DE CITA PSICOLÓGICA*

Hola [Nombre del Paciente],

Te recuerdo que tienes una cita programada para:

*Fecha:* [día de la semana, dd de mes de año]
*Hora:* [HH:MM]
*Modalidad:* Online
*Enlace de la sesión:* [URL de Google Meet]

¡Confírmame asistencia cuando puedas!
```

#### Integración con Google Meet

**Para sesiones online**, el sistema:
1. Crea automáticamente una reunión de Google Meet
2. Usa las credenciales de Google Calendar del psicólogo
3. **Credenciales por entorno**:
   - **Localhost/test**: Usa credenciales de desarrollo (`.secret/credentials.test.json`)
   - **Producción**: Usa credenciales de la cuenta empresarial (`.secret/credentials.production.json`)
4. Programa la reunión para la fecha/hora exacta de la sesión
5. Obtiene el enlace único de Google Meet
6. Incluye el enlace en el mensaje de WhatsApp

**Configuración del evento de Google Calendar**:
- **Título**: "Sesión Psicológica - [Nombre del Paciente]"
- **Hora inicio/fin**: Según la sesión programada
- **Zona horaria**: Europe/Madrid
- **Google Meet**: Activado automáticamente
- **Invitaciones**: Se pueden enviar al paciente si se desea (configuración del profesional en Google Calendar)

**Fallback**: Si falla la creación de Google Meet (credenciales no válidas, límites de API, etc.):
- El sistema genera un enlace placeholder con formato: `https://meet.google.com/xxx-xxxx-xxx`
- Se envía el mensaje igualmente
- Se registra el error en logs
- El psicólogo puede crear el Meet manualmente si lo desea

#### Variantes de Mensajes
El sistema tiene **5 plantillas diferentes** de mensajes:
- Se selecciona aleatoriamente una cada vez
- Todas mantienen la información esencial
- Varían en tono y formato para no ser repetitivos
- Ejemplos:
  1. Formal: "Estimado/a [Nombre]..."
  2. Amigable: "Hola [Nombre] 👋..."
  3. Conciso: "¡Hola [Nombre]! 🌟..."
  4. Profesional: "Buenos días [Nombre]..."
  5. Casual: "👋 [Nombre]..."

#### Registro de Recordatorios
Cada recordatorio enviado se guarda en la base de datos con:
- ID del recordatorio
- ID de la sesión asociada
- Fecha de creación del recordatorio
- Relación con la sesión (para evitar duplicados)

**Validaciones**:
- No se puede crear recordatorio para sesión ya cancelada
- No se puede crear recordatorio duplicado para la misma sesión
- El teléfono del paciente debe existir

### Acceso desde Otras Vistas

El botón de "Enviar Recordatorio" también está disponible en:
- Detalle de sesión (popup desde calendario)
- Tabla de sesiones
- Ficha del paciente (tab de sesiones)

---

## 📊 MÓDULO DE DASHBOARD

### Propósito
Vista general con métricas y gráficos del rendimiento del psicólogo.

### KPIs Rápidos (Rapid KPI)
En la parte superior, 4 tarjetas grandes con:

1. **Sesiones del Mes**
   - Número total de sesiones (completadas + programadas)
   - Porcentaje de variación vs mes anterior
   - Flecha ↑ si aumentó, ↓ si disminuyó

2. **Ingresos del Mes**
   - Total de ingresos del mes actual (EUR)
   - Porcentaje de variación vs mes anterior
   - Flecha indicadora de tendencia

3. **Pacientes Activos**
   - Total de pacientes con estado "en curso"
   - Número de pacientes nuevos este mes
   - Texto: "+X nuevos este mes"

4. **Próximas Citas Hoy**
   - Número de sesiones programadas para hoy
   - Hora de la siguiente cita (la más próxima)
   - Formato: "Próxima: HH:MM" o "No hay más citas hoy"

### Gráficos y Visualizaciones

#### 1. Distribución por Modalidad (Gráfico de Torta)
- **Presencial**: Número y porcentaje
- **Online**: Número y porcentaje
- Colores distintivos
- Muestra el desglose de todas las sesiones

#### 2. Métodos de Pago (Gráfico de Torta)
Distribución porcentual de:
- Efectivo
- Tarjeta
- Transferencia
- Seguro
- Solo sesiones completadas/programadas (excluye pendiente)

#### 3. Resultado de Sesiones (Gráfico de Barras)
Conteo de sesiones por estado:
- **Completadas**: Barra verde
- **Programadas**: Barra azul
- **Canceladas**: Barra roja
- **Inasistencia**: Barra naranja

#### 4. Sesiones por Semana del Mes (Gráfico de Línea)
- Eje X: Semanas del mes (Semana 1, 2, 3, 4, 5)
- Eje Y: Número de sesiones
- Línea continua mostrando tendencia
- Solo sesiones completadas y programadas

#### 5. Ingresos Mensuales (Gráfico de Línea)
- Eje X: Últimos 12 meses
- Eje Y: Ingresos en EUR
- Línea de ingresos totales por mes
- Permite ver tendencia anual

#### 6. Distribución por Edad (Gráfico de Barras Horizontal)
Rangos de edad de pacientes activos:
- 18-25 años
- 26-35 años
- 36-45 años
- >45 años
- Muestra número de pacientes en cada rango

#### 7. Rendimiento por Clínica (Tabla)
Para cada clínica activa:
- Nombre de la clínica
- Total de sesiones
- Precio promedio por sesión
- Total de ingresos generados
- Ordenado por ingresos (mayor a menor)

### Listas de Sesiones

#### Sesiones de Hoy (Pendientes)
Lista de sesiones programadas para hoy que aún no han ocurrido:
- Hora de inicio
- Nombre del paciente
- Tipo (Presencial/Online)
- Nombre de la clínica
- Ordenado por hora (próximas primero)

#### Sesiones de Mañana
Lista de todas las sesiones programadas para mañana:
- Misma estructura que sesiones de hoy
- Muestra el día completo
- Ordenado por hora de inicio

### Detalles por Clínica

#### Sesiones por Clínica (Expandible)
Para cada clínica, muestra:
- Nombre de la clínica
- Total de sesiones
- Botón para expandir/colapsar
- **Vista expandida**: Lista completa de sesiones con:
  - ID de sesión
  - Fecha de la sesión
  - Enlace para ver detalle

### Actualización de Datos
- Los KPIs se calculan en tiempo real desde la base de datos
- Los gráficos se actualizan automáticamente al cargar la página
- Optimización: Una sola carga de datos para múltiples métricas (queries optimizadas)

---

## 📄 MÓDULO DE DOCUMENTOS

### Funcionalidad Principal
Gestión de archivos asociados a pacientes (consentimientos, informes médicos, documentación legal, etc.).

### Acceso
Desde la ficha del paciente, existe un tab o sección de "Documentos".

### Información de Cada Documento
- **ID**: Identificador único
- **Nombre**: Nombre del archivo original
- **Tipo**: Tipo MIME (application/pdf, image/jpeg, etc.)
- **Tamaño**: Formateado legible (KB, MB, GB)
- **Fecha de subida**: Formato DD/MM/YYYY
- **Descripción**: Texto libre opcional
- **URL**: Ruta donde se almacena el archivo

### Operaciones

#### Listar Documentos del Paciente
- Vista de tabla o cards
- Ordenado por fecha de subida (más recientes primero)
- Muestra nombre, tipo, tamaño, fecha
- Botones de acción por documento

#### Subir Nuevo Documento
1. Botón "Subir Documento"
2. Selector de archivo (navegador local)
3. Formulario:
   - Nombre del documento (autocompletado del nombre del archivo)
   - Descripción opcional
4. **Proceso**:
   - El archivo se sube al servidor (o servicio de almacenamiento SFTP configurado)
   - Se genera una URL de acceso
   - Se crea registro en base de datos con metadata
5. El documento aparece inmediatamente en la lista

#### Ver/Descargar Documento
- Click en el documento
- Opciones:
  - **Ver en navegador**: Si el tipo lo permite (PDF, imágenes)
  - **Descargar**: Para cualquier tipo de archivo
- Se usa la URL almacenada para acceder al archivo

#### Eliminar Documento
- Botón "Eliminar" con confirmación
- Soft delete: Marca `is_active = false`
- El archivo físico puede mantenerse o borrarse según configuración
- No aparece más en la lista del paciente

### Seguridad
- Solo el usuario autenticado puede acceder a documentos de sus pacientes
- Los archivos se almacenan de forma segura
- Las URLs pueden tener tokens de acceso temporal (según implementación)

---

## ⚙️ CONFIGURACIÓN Y PERFIL

### Sección de Configuración del Usuario

Accesible desde el menú principal (icono de engranaje o "Mi Perfil").

### Información Editable

#### Datos Profesionales
- **Nombre completo**: Del psicólogo
- **Número de colegiado**: Identificación profesional
- **Porcentaje de IRPF**: Para cálculo de retenciones en facturas (ej: 15%)

#### Datos Fiscales
- **DNI/NIF**: Identificación fiscal
- **IBAN**: Cuenta bancaria para cobros

#### Datos de Dirección
- **Calle**
- **Número**
- **Puerta** (opcional)
- **Ciudad**
- **Provincia**
- **Código Postal**

### Uso de Estos Datos

Estos datos se utilizan automáticamente en:

1. **Facturas a Pacientes**: Como datos del emisor
2. **Facturas de Clínicas**: Como datos del emisor (psicólogo prestador de servicios)
3. **Cálculo de IRPF**: Para las retenciones en facturas

### Funcionalidad del Formulario
- **Vista actual**: Muestra todos los campos pre-rellenados
- **Edición**: Permite modificar cualquier campo
- **Validación**: 
  - Campos obligatorios marcados
  - Validación de formato (email, código postal, etc.)
- **Guardado**: 
  - Botón "Guardar Cambios"
  - Confirmación visual de guardado exitoso
  - Los cambios se reflejan inmediatamente en nuevas facturas

---

## 🔐 SEGURIDAD Y AUTENTICACIÓN

### Sistema de Autenticación JWT

#### Generación de Token
- Al hacer login exitoso
- Token válido por 7 días
- Contiene: userId, email, name
- Firmado con secreto del servidor (JWT_SECRET)

#### Almacenamiento
- Token guardado en localStorage (persistente)
- También en sessionStorage (opcional)
- Se incluye en cada petición HTTP

#### Uso del Token
- Cada petición al backend incluye header: `Authorization: Bearer [token]`
- El middleware `authenticateToken` valida el token
- Extrae información del usuario (req.user)

#### Renovación Automática
- El frontend monitorea la expiración del token
- 5 minutos antes de expirar, solicita renovación
- Endpoint: `POST /api/auth/refresh`
- Se genera un nuevo token sin requerir login

#### Logout
- Se elimina el token de localStorage/sessionStorage
- Se limpia el estado de autenticación
- Se redirige a la página de login

### Validaciones de Seguridad

#### A Nivel de Backend
- Todos los endpoints (excepto `/api/auth/login`) requieren token válido
- Se valida que el usuario exista y esté activo
- Cada request tiene acceso al `req.user` con información del usuario autenticado
- Logs de acceso y errores

#### A Nivel de Frontend
- Guards de navegación (AuthGuard)
- Redirección a login si no hay token
- Manejo de errores 401/403
- Limpieza de estado al detectar token expirado

---

## 🌐 INTEGRACIONES EXTERNAS

### Integración con Google Calendar / Google Meet

#### Objetivo
Crear sesiones de Google Meet automáticamente para sesiones online cuando se envía un recordatorio.

#### Configuración de Credenciales

**Múltiples Entornos**:
El sistema detecta automáticamente el entorno basándose en el hostname:

1. **Entorno de Desarrollo/Test** (`localhost` o `test.dominio.com`):
   - Usa: `.secret/credentials.test.json` y `.secret/token.test.json`
   - Conecta con cuenta personal del desarrollador
   - No afecta el calendario de producción

2. **Entorno de Producción** (cualquier otro hostname):
   - Usa: `.secret/credentials.production.json` y `.secret/token.production.json`
   - Conecta con cuenta empresarial del psicólogo
   - Sesiones reales en calendario de producción

**Generación de Credenciales**:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API
3. Crear credenciales OAuth 2.0 (tipo "Web Application")
4. Descargar JSON y renombrar a `credentials.{environment}.json`
5. Ejecutar script `get_gcal_token.js [environment]` para autorizar
6. Se genera `token.{environment}.json` automáticamente

**Scopes Requeridos**:
- `https://www.googleapis.com/auth/calendar`: Crear eventos
- `https://www.googleapis.com/auth/calendar.events`: Gestionar detalles de eventos

#### Flujo de Creación de Google Meet

1. **Trigger**: Se envía recordatorio de sesión online
2. **Autenticación**: 
   - Se lee el hostname de la request
   - Se cargan las credenciales apropiadas
   - Se obtiene el cliente OAuth2
3. **Creación del Evento**:
   - Se crea evento de calendario con:
     - Título: "Sesión Psicológica - [Nombre Paciente]"
     - Fecha/hora: Según la sesión programada
     - Duración: Calculada (end_time - start_time)
     - Zona horaria: Europe/Madrid
   - Se activa `conferenceData` con tipo "hangoutsMeet"
   - Se genera request ID único
4. **Inserción**: `calendar.events.insert()` con `conferenceDataVersion: 1`
5. **Obtención del Link**: Se extrae de `response.data.conferenceData.entryPoints[0].uri`
6. **Respuesta**: Se incluye el link en el mensaje de WhatsApp

#### Manejo de Errores
- **Credenciales inválidas**: Se usa link placeholder
- **Token expirado**: Se intenta renovar automáticamente
- **Límites de API**: Fallback a link falso
- **Errores de red**: Se registra en logs y se continúa con placeholder

### Integración con WhatsApp

#### Deeplinks de WhatsApp
El sistema genera URLs especiales que abren WhatsApp automáticamente:

**Formato**: `https://wa.me/[telefono]?text=[mensaje_codificado]`

**Procesamiento del Teléfono**:
1. Se limpia el número (solo dígitos)
2. Se añade código de país si no existe (España: +34)
3. Formato final: `34XXXXXXXXX` (sin espacios ni símbolos)

**Codificación del Mensaje**:
- Se usa `encodeURIComponent()` para codificar el mensaje completo
- Preserva emojis y caracteres especiales
- Formato de WhatsApp: Texto pre-escrito en el chat

**Comportamiento**:
- En escritorio: Abre WhatsApp Web
- En móvil: Abre app de WhatsApp nativa
- El chat se abre con el contacto correcto
- El mensaje aparece en el campo de texto
- El usuario solo tiene que darle "Enviar"

#### No hay Envío Automático
**Importante**: El sistema NO envía mensajes automáticamente. 
- Genera el deeplink
- Abre WhatsApp con el mensaje pre-escrito
- El psicólogo debe hacer click en "Enviar" manualmente
- Esto permite revisar y personalizar el mensaje antes de enviar

---

## 📊 MÉTRICAS Y REPORTES

### KPIs Calculados Dinámicamente

#### A Nivel de Sesiones
- **Total de sesiones**: Por periodo, clínica, estado
- **Sesiones completadas**: Solo estado "completed"
- **Sesiones canceladas**: Estados "cancelled" y "no-show"
- **Tasa de completitud**: (Completadas / Total) × 100
- **Ingresos brutos**: Suma de precios de sesiones (excluye pendiente)
- **Ingresos netos**: Suma de (precio × porcentaje de clínica)

#### A Nivel de Pacientes
- **Pacientes activos**: Estado "en curso"
- **Pacientes nuevos del mes**: Por fecha de creación
- **Distribución por edad**: Rangos de edad
- **Distribución por género**: Masculino/Femenino/Otro
- **Distribución por clínica**: Pacientes por cada clínica

#### A Nivel de Facturación
- **Total facturado histórico**: Suma de todas las facturas
- **Facturado del mes**: Por mes/año seleccionado
- **Pendiente de facturar**: Sesiones con `invoiced = 0`
- **Por clínica**: Desglose de ingresos por clínica

#### A Nivel de Clínicas
- **Rendimiento**: Sesiones, ingresos, precio promedio por clínica
- **Distribución de modalidades**: Presencial vs Online por clínica
- **Ocupación**: Sesiones programadas vs completadas

### Filtros Aplicables

Casi todas las vistas permiten filtrar por:
1. **Fechas**: Rango de fecha desde/hasta
2. **Mes y Año**: Selector específico de mes
3. **Clínica**: Individual o múltiples
4. **Estado**: De sesiones o pacientes
5. **Método de pago**: Para sesiones
6. **Paciente**: En vistas de sesiones

Los filtros se aplican a:
- KPIs calculados
- Gráficos
- Tablas de datos
- Exportaciones

---

## 🔄 FLUJOS DE TRABAJO TÍPICOS

### 1. Gestión Diaria

**Por la mañana**:
1. Abrir Dashboard
2. Ver "Próximas citas hoy"
3. Ir a módulo de Recordatorios
4. Revisar sesiones de mañana (o del lunes si es viernes)
5. Enviar recordatorios por WhatsApp a todos los pacientes
6. Volver al calendario para revisar el día

**Durante el día**:
1. Al completar cada sesión:
   - Ir al calendario o tabla de sesiones
   - Cambiar estado de "Programada" a "Completada"
   - Actualizar método de pago si se pagó
   - Añadir notas si es necesario
2. Registrar ausencias como "No-show" o "Cancelada"
3. Si es sesión con bono, registrar uso del bono

**Al final del día**:
1. Revisar que todas las sesiones estén con estado correcto
2. Verificar que los cobros estén registrados
3. Planificar sesiones para el resto de la semana

### 2. Gestión de Nuevo Paciente

**Proceso completo**:
1. Ir a módulo de Pacientes
2. Click en "Nuevo Paciente"
3. Completar formulario:
   - Datos personales básicos
   - Datos de contacto (email, teléfono imprescindibles)
   - Dirección completa (para futuras facturas)
   - Seleccionar clínica principal
   - Fecha de inicio del tratamiento (hoy por defecto)
4. Guardar paciente
5. Crear primera sesión desde el calendario:
   - Fecha y hora
   - Seleccionar el nuevo paciente
   - Confirmar precio y modo (según la clínica)
6. Opcional: Crear bono inicial si el paciente lo adquiere
7. En la primera sesión:
   - Completar historia clínica (tab Historia Clínica)
   - Subir documentos necesarios (consentimientos, etc.)

### 3. Cierre de Mes

**Proceso de facturación mensual**:

**Para pacientes (clínicas no facturables)**:
1. Ir a módulo de Facturación
2. Tab "Facturación a Pacientes"
3. Seleccionar mes anterior
4. Revisar lista de pacientes con sesiones pendientes
5. Para cada paciente:
   - Verificar sesiones incluidas
   - Click en "Generar Factura"
   - Revisar vista previa
   - Ajustar número de factura si es necesario
   - Generar PDF
   - Descargar y enviar al paciente
6. Las sesiones se marcan automáticamente como facturadas

**Para clínicas (clínicas facturables)**:
1. Tab "Facturación de Clínicas"
2. Seleccionar mes anterior
3. Revisar lista de clínicas con sesiones pendientes
4. Para cada clínica:
   - Verificar total de sesiones y monto neto
   - Click en "Generar Factura de Clínica"
   - Revisar datos fiscales de la clínica
   - Ajustar número de factura
   - Generar PDF
   - Guardar/enviar a la clínica
5. **Importante**: Solo una factura por clínica por mes

**Post-facturación**:
1. Descargar todas las facturas generadas
2. Archivarlas en sistema de gestión documental
3. Registrar en contabilidad personal
4. Verificar que no queden sesiones pendientes sin facturar

### 4. Gestión de Bonos

**Venta de bono**:
1. Ir a ficha del paciente
2. Tab "Bonos"
3. Click en "Crear Nuevo Bono"
4. Configurar:
   - Número de sesiones (ej: 10)
   - Precio total (ej: 500€)
   - Se calcula automáticamente precio por sesión (50€)
5. Guardar bono
6. El bono queda activo con 10 sesiones disponibles

**Uso del bono**:
1. Cuando el paciente asiste a una sesión:
   - Ir al tab "Bonos"
   - Buscar el bono activo
   - Click en "Usar Sesión"
2. Se actualiza automáticamente:
   - Sesiones usadas: +1
   - Sesiones restantes: -1
   - Progreso visual se actualiza
3. Cuando se agoten todas las sesiones:
   - Estado cambia a "consumed"
   - Se puede crear un nuevo bono

**Seguimiento**:
- Revisar KPIs de bonos: Activos, consumidos, expirados
- Alertas visuales para bonos próximos a expirar
- Historial completo de uso por bono

### 5. Gestión de Citas Online

**Programar sesión online**:
1. Crear sesión en calendario
2. Seleccionar paciente
3. Clínica asociada debe ser "online" (sin dirección)
4. El sistema determina automáticamente modo "Online"
5. Guardar sesión

**Día del recordatorio**:
1. Ir a módulo de Recordatorios
2. Localizar la sesión online
3. Click en "Enviar Recordatorio"
4. El sistema:
   - Crea automáticamente Google Meet
   - Genera mensaje con enlace de Meet
   - Abre WhatsApp con mensaje completo
5. Revisar mensaje y enviar

**Día de la sesión**:
1. Usar el mismo enlace de Google Meet
2. Al finalizar:
   - Marcar sesión como "Completada"
   - Registrar cobro
   - Añadir notas clínicas si es necesario

---

## 🔧 CONCEPTOS TÉCNICOS IMPORTANTES

### Soft Delete
El sistema usa "soft delete" en lugar de borrado físico:
- No se eliminan registros de la base de datos
- Se marca un campo `is_active = false`
- Los registros no aparecen en listados normales
- Permite recuperación de datos si es necesario
- Mantiene integridad referencial

### Paginación
Todas las listas implementan paginación:
- Evita cargar todos los registros a la vez
- Mejora rendimiento
- Parámetros: `page` (número de página) y `limit` (registros por página)
- Respuesta incluye metadatos:
  - Total de páginas
  - Total de registros
  - Página actual
  - ¿Hay página siguiente/anterior?

### Cálculo de Precios
**Precio Bruto vs Precio Neto**:
- **Bruto**: Lo que paga el paciente (campo `price` en sesiones)
- **Neto**: Lo que recibe el psicólogo
- **Fórmula**: `Neto = Bruto × (Porcentaje clínica / 100)`
- **Ejemplo**: Sesión de 60€ en clínica con 70% → Neto = 60 × 0.70 = 42€

### Estados de Sesión
- **scheduled**: Sesión programada, pendiente de realizar
- **completed**: Sesión realizada exitosamente
- **cancelled**: Sesión cancelada con aviso previo
- **no-show**: Paciente no asistió sin avisar

Transiciones normales:
- scheduled → completed (sesión realizada)
- scheduled → cancelled (cancelación)
- scheduled → no-show (inasistencia)

### Validación de Solapamientos
Algoritmo para detectar conflictos horarios:
```
Sesión A (existente): [start_A, end_A]
Sesión B (nueva): [start_B, end_B]

Hay solapamiento si:
  (start_B < end_A) AND (end_B > start_A)
```

Esto cubre todos los casos:
- B empieza durante A
- B termina durante A
- B contiene completamente a A
- A contiene completamente a B

### Sistema Multi-Base de Datos
El sistema soporta múltiples bases de datos según el hostname:
- **Localhost**: BD de desarrollo/test
- **test.dominio.com**: BD de staging
- **dominio.com**: BD de producción

Esto permite:
- Desarrollo sin afectar producción
- Testing en entorno de staging
- Mismo código para todos los entornos

---

## 📱 CARACTERÍSTICAS DE INTERFAZ

### Diseño Responsive
- Adaptado a escritorio, tablet y móvil
- Menú lateral colapsable
- Tablas con scroll horizontal en móvil
- Formularios apilados en pantallas pequeñas

### Colores y Temas
- Paleta moderna y profesional
- Colores distintivos por clínica (configurables)
- Estados visuales claros (success, warning, error, info)
- Contraste accesible

### Feedback Visual
- Toasts/notificaciones para acciones exitosas
- Mensajes de error claros y descriptivos
- Spinners de carga
- Confirmaciones antes de acciones destructivas
- Validación en tiempo real de formularios

### Navegación
- Menú lateral con iconos y texto
- Breadcrumbs (migas de pan) donde aplique
- Botones "Volver" en vistas de detalle
- Enlaces directos entre módulos relacionados

---

## 🚀 OPTIMIZACIONES Y RENDIMIENTO

### Backend
- **Consultas optimizadas**: Joins eficientes, índices en campos de búsqueda
- **Paginación**: Evita cargar todos los registros
- **Queries agregadas**: En dashboard, múltiples métricas en una sola query
- **Connection pooling**: Reutilización de conexiones a base de datos
- **Logs estructurados**: Para debugging# CONTEXTO FUNCIONAL - PSYCHOLOGY ERP

## 🎯 DESCRIPCIÓN GENERAL DEL SISTEMA

**Psychology ERP** es un sistema de gestión integral (ERP) diseñado específicamente para psicólogos/as que trabajan en múltiples clínicas y necesitan llevar un control detallado de:
- Pacientes y sus historiales clínicos
- Sesiones de terapia (presenciales y online)
- Facturación diferenciada por clínica
- Bonos promocionales
- Recordatorios automatizados vía WhatsApp
- Documentación de pacientes
- Métricas y análisis de rendimiento

El sistema está implementado como una aplicación web moderna con arquitectura cliente-servidor:
- **Frontend**: Angular 17 con componentes standalone
- **Backend**: Node.js con Express
- **Base de datos**: MariaDB/MySQL

---

## 👥 MÓDULO DE USUARIOS

### Funcionalidad Principal
El sistema soporta múltiples usuarios (psicólogos) con acceso mediante autenticación JWT.

### Flujo de Autenticación
1. **Login**: El usuario ingresa email y contraseña
2. **Validación**: El sistema verifica las credenciales contra la base de datos
3. **Token**: Se genera un token JWT con validez de 7 días
4. **Almacenamiento**: El token se guarda en localStorage/sessionStorage
5. **Renovación**: El sistema puede renovar tokens automáticamente antes de expirar
6. **Logout**: Se limpia el token y se redirige al login

### Información del Usuario
Cada usuario tiene un perfil completo con:
- **Datos personales**: Nombre completo, DNI, email
- **Datos profesionales**: Número de colegiado, porcentaje de IRPF
- **Datos fiscales**: IBAN, dirección fiscal completa (calle, número, puerta, ciudad, provincia, código postal)
- **Uso**: Estos datos se utilizan automáticamente para generar las facturas

### Gestión del Perfil
El usuario puede:
- Ver su perfil completo en la sección "Configuración"
- Actualizar cualquier dato de su perfil
- Los cambios se reflejan inmediatamente en las facturas futuras

---

## 🏥 MÓDULO DE CLÍNICAS

### Concepto de Clínica
Una "clínica" representa un lugar de trabajo del psicólogo. Puede ser:
- Una clínica física (con dirección)
- Consulta online (sin dirección)
- Consulta privada del propio psicólogo

### Información de Cada Clínica

#### Datos Básicos
- **Nombre**: Identificador de la clínica
- **Color**: Color distintivo para visualización en calendario (ej: #3B82F6 para azul)
- **Dirección**: Dirección física (puede estar vacía si es online)
- **Precio**: Precio estándar por sesión en esa clínica
- **Porcentaje**: Porcentaje que recibe el psicólogo (ej: 70% significa que de 60€ brutosi el psicólogo recibe 42€)

#### Datos de Facturación (para clínicas que emiten facturas)
- **is_billable**: Booleano que indica si la clínica emite facturas al psicólogo
- **Razón social**: Nombre fiscal de la clínica
- **CIF**: Número de identificación fiscal
- **Dirección de facturación**: Dirección fiscal completa

### Tipos de Facturación

#### Clínica NO Facturable (is_billable = false)
- El psicólogo factura directamente a los pacientes
- Ejemplo: Consulta privada, clínicas que no emiten facturas
- El módulo de facturación permite generar facturas individuales por paciente

#### Clínica Facturable (is_billable = true)
- La clínica emite una factura mensual al psicólogo
- El psicólogo NO factura a los pacientes (la clínica lo hace)
- El módulo de facturación permite generar una factura única mensual por clínica
- Se calcula sobre el monto neto (precio × porcentaje)

### Operaciones con Clínicas
- **Crear nueva clínica**: Se registra con todos sus datos
- **Editar clínica**: Actualizar cualquier dato, incluyendo cambiar de no facturable a facturable (solo si no tiene facturas emitidas)
- **Eliminar clínica**: Soft delete (solo si no tiene pacientes activos asociados)
- **Visualización**: Lista completa de clínicas activas con paginación

### Uso en el Sistema
Las clínicas se utilizan para:
1. **Asignar pacientes**: Cada paciente está asociado a una clínica principal
2. **Registrar sesiones**: Cada sesión se vincula a una clínica específica
3. **Visualizar calendario**: Las sesiones se colorean según la clínica
4. **Calcular ingresos**: Se distingue entre ingresos brutos y netos según el porcentaje
5. **Generar facturas**: Diferentes flujos según si la clínica es facturable o no

---

## 👤 MÓDULO DE PACIENTES

### Información Completa del Paciente

#### Datos Personales
- **Nombre y apellidos**
- **DNI**: Documento de identidad
- **Email y teléfono**: Para contacto y recordatorios
- **Fecha de nacimiento**: Para calcular edad y estadísticas
- **Género**: Masculino/Femenino/Otro
- **Ocupación**: Profesión del paciente

#### Datos de Dirección
- **Calle, número, puerta**
- **Código postal, ciudad, provincia**
- Estos datos se usan para las facturas

#### Datos Clínicos
- **Estado del paciente**: 
  - "en curso": Paciente activo con tratamiento actual
  - "alta": Tratamiento finalizado exitosamente
  - "baja": Paciente que abandona el tratamiento
  - "derivado": Paciente derivado a otro profesional
- **Clínica asociada**: Clínica principal donde se atiende
- **Fecha de inicio del tratamiento**
- **Es menor de edad**: Booleano para consideraciones especiales

### Modo Preferido de Sesión
El sistema determina automáticamente el modo preferido:
- Si la clínica asociada tiene dirección → "Presencial"
- Si la clínica no tiene dirección → "Online"

### Vista Detallada del Paciente
Al abrir la ficha de un paciente, se muestra una interfaz con **6 tabs principales**:

#### Tab 1: RESUMEN
Muestra métricas y datos clave:
- **Información de contacto**: Email, teléfono, modo preferido
- **Estadísticas de sesiones**:
  - Sesiones completadas
  - Sesiones canceladas
- **Últimas 10 sesiones**: Tabla con tipo, fecha, precio, método de pago
- **Información financiera del año actual**:
  - Total gastado por el paciente
  - Número de facturas emitidas

#### Tab 2: DATOS DEL PACIENTE
Formulario completo con todos los datos personales, de dirección y clínicos. Permite:
- Visualizar todos los campos
- Editar cualquier campo
- Guardar cambios
- Validación de campos obligatorios

#### Tab 3: HISTORIA CLÍNICA
Editor tipo "OneNote" para notas clínicas:
- **Crear notas**: Con título y contenido libre
- **Organizar por fecha**: Ordenadas cronológicamente
- **Editar notas**: Actualizar título y contenido
- **Eliminar notas**: Borrado permanente
- **Búsqueda**: Filtrar notas por título o contenido
- **Formato**: Soporte para texto enriquecido

Cada nota tiene:
- ID único
- Título descriptivo
- Contenido (puede ser extenso)
- Fecha de creación
- Fecha de última modificación

#### Tab 4: SESIONES
Tabla detallada de todas las sesiones del paciente:
- **Columnas**: Fecha, Clínica, Estado, Precio Bruto, Precio Neto, Método de Pago, Notas
- **Precio Neto**: Se calcula automáticamente (precio × porcentaje de la clínica)
- **Filtros**: Por fecha, estado, clínica, método de pago
- **Exportación**: Botón para descargar las sesiones a Excel
- **Acciones**: Ver detalle, editar, eliminar sesión
- **Orden**: Por defecto ordenado por fecha descendente (más recientes primero)

#### Tab 5: FACTURAS
Gestión de facturación del paciente:
- **Lista de facturas emitidas**: Con número, fecha, concepto, total
- **Generar nueva factura**: 
  - Seleccionar sesiones pendientes de facturar
  - Editar número de factura (con formato FAC-YYYY-NNNN)
  - Generar PDF descargable
  - Marcar sesiones como facturadas
- **Filtros**: Por mes y año
- **Vista previa**: Antes de generar la factura
- **Descarga**: PDF con formato profesional

#### Tab 6: BONOS
Sistema de bonos promocionales:

**KPIs de Bonos**:
- Total de bonos del paciente
- Bonos activos
- Bonos consumidos
- Bonos expirados

**Lista de Bonos**: Cada bono muestra:
- ID del bono
- Fecha de compra
- Fecha de expiración
- Precio total del bono
- Precio por sesión
- Sesiones totales
- Sesiones usadas
- Sesiones restantes
- Estado: activo/consumed/expired
- Porcentaje de progreso visual

**Crear Nuevo Bono**:
- Seleccionar número de sesiones (ej: 5, 10, 20)
- Definir precio total del bono
- Calcular precio por sesión automáticamente
- La fecha de expiración se establece automáticamente (1 año desde la compra)

**Usar Sesión del Bono**:
- Botón para registrar uso de una sesión
- Se actualiza automáticamente:
  - Incrementa sesiones usadas
  - Decrementa sesiones restantes
  - Actualiza porcentaje de progreso
  - Cambia estado a "consumed" cuando se agotan todas las sesiones

**Historial de Uso**:
- Ver todas las sesiones en las que se usó el bono
- Fecha de uso de cada sesión

### Gestión de Pacientes

#### Lista de Pacientes Activos
- Muestra todos los pacientes con estado "en curso"
- Filtros disponibles:
  - Por nombre, apellidos, DNI, email
  - Por clínica
  - Por fecha de alta (rango de fechas)
  - Por género
  - Por si es menor de edad
- Paginación de resultados
- Ordenado por fecha de creación (más recientes primero)

#### Crear Nuevo Paciente
Formulario completo con:
- Todos los campos de datos personales, dirección y clínicos
- Validación de campos obligatorios (nombre, apellidos, DNI, email, teléfono, clínica)
- Asignación automática de estado "en curso"
- Generación automática de fechas de creación/actualización

#### Editar Paciente
- Actualizar cualquier campo
- Validaciones en tiempo real
- Guardado automático de fecha de actualización

#### Dar de Baja a Paciente
El sistema permite cambiar el estado del paciente de "en curso" a otro estado:
- **Validación**: Verifica que no tenga sesiones futuras programadas
- **Estados disponibles**: alta, baja, derivado
- **Efecto**: El paciente deja de aparecer en la lista de activos

#### Pacientes Inactivos
Lista separada de pacientes con estado diferente a "en curso":
- Filtros similares a pacientes activos
- Opción de **Restaurar Paciente**: Cambiar estado nuevamente a "en curso"
- Ordenado por fecha de última actualización

#### Eliminar Paciente
- **Soft delete**: El paciente no se borra físicamente, solo se marca como inactivo
- **Restricción**: No se puede eliminar si tiene sesiones futuras programadas
- El paciente deja de aparecer en todas las listas

---

## 📅 MÓDULO DE CALENDARIO

### Vistas Disponibles

#### Vista Semanal
- **Rango**: Muestra lunes a domingo
- **Horario**: 07:00 - 21:00 (15 franjas horarias)
- **Navegación**: Botones para semana anterior/siguiente, o ir a "Hoy"
- **Selector de fecha**: Permite saltar a cualquier semana específica
- **Sesiones**: Se muestran como bloques coloreados según la clínica

#### Vista Mensual
- **Grid**: 7 columnas (días de la semana) × filas (semanas del mes)
- **Navegación**: Botones para mes anterior/siguiente, o ir a mes actual
- **Selector de mes**: Permite saltar a cualquier mes/año
- **Sesiones**: Se muestran como pastillas pequeñas con hora y nombre del paciente
- **Indicador**: Número total de sesiones por día

### Representación Visual de Sesiones

#### Colores por Clínica
Cada clínica tiene un color asignado que permite identificar visualmente:
- Azul (#3B82F6): Clínica A
- Verde (#10B981): Clínica B
- Ámbar (#F59E0B): Clínica C
- Púrpura (#8B5CF6): Consulta privada
- (Los colores son configurables por clínica)

#### Estados de Sesión
Las sesiones se visualizan diferente según su estado:
- **Scheduled (programada)**: Color normal de la clínica, borde sólido
- **Completed (completada)**: Color normal, marca de ✓
- **Cancelled (cancelada)**: Gris con tachado
- **No-show (inasistencia)**: Rojo pálido con indicador especial

#### Información en Hover
Al pasar el cursor sobre una sesión, se muestra un tooltip con:
- Nombre del paciente
- Hora de inicio - fin
- Nombre de la clínica
- Tipo (Presencial/Online)
- Estado actual

### Crear Nueva Sesión desde Calendario

#### Flujo Normal
1. Click en un espacio vacío del calendario
2. Se abre un modal con formulario precargado:
   - Fecha seleccionada
   - Hora del slot clicado (si aplica)
3. Completar campos requeridos:
   - **Paciente**: Selector con todos los pacientes activos
   - **Clínica**: Se autoselecciona la clínica del paciente (editable)
   - **Fecha**: Pre-rellenada (editable)
   - **Hora inicio**: Pre-rellenada (editable)
   - **Hora fin**: Se calcula automáticamente (sesión de 1 hora, editable)
   - **Modo**: Presencial/Online (según la clínica)
   - **Estado**: Scheduled por defecto
   - **Precio**: Se autocarga del precio de la clínica (editable)
   - **Método de pago**: Pendiente/Efectivo/Tarjeta/Transferencia/Seguro
   - **Notas**: Campo libre para observaciones
4. **Validaciones**:
   - No permitir crear sesión en horario ya ocupado
   - Si existe solapamiento, mostrar advertencia con detalles de la sesión conflictiva
5. Al guardar:
   - Se crea el registro en base de datos
   - Se actualiza automáticamente el calendario
   - Aparece la nueva sesión en el color de la clínica

#### Editar Sesión Existente
1. Click en una sesión del calendario
2. Se abre el mismo modal en "modo edición":
   - Todos los campos precargados con los datos actuales
   - Permite modificar cualquier campo
   - **Validaciones especiales**:
     - Si se cambia la fecha/hora, validar que no haya solapamiento con otras sesiones
     - Excluir la sesión actual de la validación de solapamiento
3. Al guardar:
   - Se actualizan los datos en base de datos
   - Se actualiza automáticamente la visualización en el calendario
4. Opción de **Eliminar sesión** (con confirmación)

### Detalle Emergente de Sesión

Al hacer click en una sesión, se puede abrir un popup completo con:
- **Información del paciente**: Nombre completo, teléfono, email
- **Detalles de la sesión**: Fecha, hora inicio-fin, duración
- **Clínica y ubicación**: Nombre, dirección (si aplica)
- **Aspectos financieros**: Precio bruto, precio neto, método de pago
- **Estado actual**: Con opción de cambiar estado
- **Notas clínicas**: Observaciones de la sesión
- **Acciones disponibles**:
  - Editar sesión
  - Cambiar estado (completada, cancelada, no-show)
  - Enviar recordatorio por WhatsApp
  - Eliminar sesión (con confirmación)
  - Ir a la ficha del paciente

### Gestión de Horarios

#### Detección de Solapamientos
El sistema verifica automáticamente conflictos horarios:
- Al crear una nueva sesión
- Al modificar fecha/hora de una sesión existente
- **Lógica**: Una sesión se solapa si:
  - La nueva sesión empieza antes de que termine una existente Y
  - La nueva sesión termina después de que empiece una existente

#### Mensaje de Conflicto
Si hay solapamiento, se muestra:
- Alerta visual clara
- Detalles de la sesión conflictiva (hora, paciente, clínica)
- Opción de cancelar o modificar la hora

---

## 🗓️ MÓDULO DE SESIONES

### Tabla Maestra de Sesiones
Vista completa de todas las sesiones del sistema con:

#### Columnas de Información
1. **Fecha**: Formato DD/MM/YYYY
2. **Paciente**: Nombre completo (enlace a ficha del paciente)
3. **Clínica**: Nombre con color distintivo
4. **Estado**: Completada/Programada/Cancelada/Inasistencia
5. **Precio Bruto**: Monto total de la sesión
6. **Precio Neto**: Lo que recibe el psicólogo (bruto × porcentaje)
7. **Método de Pago**: Efectivo/Tarjeta/Transferencia/Seguro/Pendiente
8. **Acciones**: Botones para ver, editar, eliminar

#### Sistema de Filtros Avanzados

**Filtro por Fechas**:
- Selector de fecha desde (fecha_desde)
- Selector de fecha hasta (fecha_hasta)
- Por defecto: Último mes

**Filtro por Clínica**:
- Selector múltiple o individual
- Opción "Todas las clínicas"
- Se actualiza dinámicamente con las clínicas disponibles

**Filtro por Estado**:
- Completada
- Programada
- Cancelada
- Inasistencia
- Todas

**Filtro por Método de Pago**:
- Efectivo
- Tarjeta
- Transferencia
- Seguro
- Pendiente
- Todos

**Aplicación de Filtros**:
- Los filtros se combinan (operación AND)
- Se mantienen al navegar entre páginas
- Botón "Limpiar filtros" para resetear
- Los KPIs se actualizan según los filtros aplicados

#### KPIs de Sesiones
En la parte superior de la tabla se muestran métricas calculadas según los filtros:

1. **Sesiones Completadas**: Total de sesiones completadas en el periodo/filtros
2. **Sesiones Canceladas**: Total de sesiones canceladas
3. **Ingresos Brutos**: Suma de precios de todas las sesiones (excepto "pendiente")
4. **Ingresos Netos**: Suma de precios netos (bruto × porcentaje de cada clínica)

Estos KPIs:
- Se calculan en tiempo real según los filtros
- Se actualizan automáticamente al cambiar filtros
- Excluyen sesiones con pago "pendiente" del cálculo de ingresos

#### Paginación
- Resultados por página: Configurable (10, 25, 50, 100)
- Navegación: Primera, Anterior, Siguiente, Última página
- Contador: "Mostrando X-Y de Z sesiones"

#### Exportación a Excel
Botón para descargar todas las sesiones filtradas a un archivo Excel:
- Incluye todas las columnas visibles
- Respeta los filtros aplicados
- Formato limpio y profesional
- Nombre del archivo: `sesiones_YYYY-MM-DD.xlsx`

### Operaciones con Sesiones

#### Crear Nueva Sesión
Formulario completo con todos los campos mencionados en el módulo de calendario.

#### Editar Sesión
- Acceso desde tabla de sesiones o calendario
- Permite modificar todos los campos
- Validación de solapamientos horarios
- Actualización automática de todos los lugares donde aparece

#### Cambiar Estado de Sesión
Transiciones permitidas:
- Scheduled → Completed
- Scheduled → Cancelled
- Scheduled → No-show
- Cualquier estado → Scheduled (reprogramar)

#### Eliminar Sesión
- Confirmación obligatoria
- Soft delete (marca is_active = false)
- No aparece más en listados
- **Restricción**: Si la sesión está facturada, puede requerir confirmación adicional

---

## 💰 MÓDULO DE FACTURACIÓN

### Dos Flujos de Facturación

El sistema maneja dos tipos diferentes de facturación:

#### FLUJO A: Facturas a Pacientes (Clínicas NO Facturables)
Para clínicas donde el psicólogo factura directamente a cada paciente.

#### FLUJO B: Facturas de Clínicas (Clínicas Facturables)
Para clínicas que emiten una factura mensual al psicólogo.

### Interfaz Principal
Dos tabs en la vista de facturación:

#### Tab 1: FACTURACIÓN A PACIENTES

**KPIs Globales** (con filtros de mes/año):
1. **Total Facturas Emitidas**: Histórico de facturas generadas
2. **Total Facturado Bruto (Histórico)**: Suma total de todas las sesiones
3. **Total Facturado Bruto (Mes Actual)**: Filtrado por mes/año
4. **Total Facturado Neto (Mes Actual)**: Calculado con porcentajes de clínicas
5. **Desglose por Clínica**: Tabla con:
   - Nombre de clínica
   - Total sesiones del mes
   - Total bruto
   - Porcentaje de la clínica
   - Total neto

**Sección: Facturas Pendientes**
- Filtro de mes y año
- Lista de pacientes con sesiones pendientes de facturar:
  - Nombre completo del paciente
  - DNI, email, dirección
  - Número de sesiones pendientes
  - Total a facturar
  - Nombre de la clínica
  - Lista detallada de sesiones (fecha, precio)
- Botón "Generar Factura" por cada paciente

**Proceso de Generar Factura a Paciente**:
1. Click en "Generar Factura"
2. Se abre modal con:
   - **Vista previa de la factura**: Con todo el formato final
   - **Datos del emisor**: Cargados automáticamente del perfil del usuario
   - **Datos del receptor**: Datos del paciente
   - **Lista de sesiones**: Con fechas y precios
   - **Cálculos**:
     - Subtotal (suma de sesiones)
     - Base imponible
     - IRPF (según porcentaje del usuario)
     - Total a pagar
   - **Número de factura**: Editable, con formato sugerido FAC-YYYY-NNNN
     - Se genera automáticamente el siguiente número disponible
     - El usuario puede modificarlo si lo desea
3. Botón "Generar PDF":
   - Crea el registro de factura en base de datos
   - Marca las sesiones como facturadas (campo `invoiced = 1`)
   - Genera PDF descargable con diseño profesional
4. Las sesiones facturadas no aparecen más en "Pendientes"

**Sección: Facturas Emitidas**
- Filtro de mes y año
- Lista de todas las facturas emitidas:
  - Número de factura
  - Fecha de emisión
  - Nombre del paciente
  - DNI
  - Número de sesiones incluidas
  - Total facturado
  - Botón "Ver PDF" para re-descargar
  - Botón "Ver Detalle" para ver sesiones incluidas

#### Tab 2: FACTURACIÓN DE CLÍNICAS

**Sección: Facturas Pendientes de Clínicas**
- Filtro de mes y año
- Lista de clínicas facturables con sesiones pendientes:
  - Nombre de la clínica
  - Número de sesiones del mes
  - Total neto a recibir (calculado con porcentajes)
  - Botón "Generar Factura de Clínica"

**Validación Importante**:
- Solo se puede generar **una factura por clínica por mes**
- Si ya existe una factura de una clínica en un mes, no se puede crear otra
- Mensaje de error claro indicando la factura existente

**Proceso de Generar Factura de Clínica**:
1. Click en "Generar Factura de Clínica"
2. Se abre modal con:
   - **Vista previa de factura de clínica**:
     - Datos del emisor (psicólogo): Del perfil del usuario
     - Datos del receptor (clínica): Razón social, CIF, dirección de facturación
     - **Concepto**: "Servicios de psicología prestados en [mes] de [año]"
     - Total de sesiones realizadas
     - Total neto (lo que recibe el psicólogo)
   - **Número de factura**: Editable, formato sugerido
3. Botón "Generar PDF":
   - Valida que no exista ya una factura de esa clínica en ese mes
   - Crea registro en base de datos con `clinic_id`
   - Marca sesiones como facturadas
   - Genera PDF con formato específico para clínicas
4. Las sesiones facturadas se excluyen de futuras facturas

**Sección: Facturas Emitidas a Clínicas**
- Filtro de mes y año
- Lista de todas las facturas de clínicas emitidas:
  - Número de factura
  - Fecha de emisión
  - Nombre de la clínica (razón social)
  - CIF
  - Número de sesiones incluidas
  - Total neto
  - Botones de acción (Ver PDF, Ver Detalle)

### Generación de Números de Factura

**Formato Sugerido**: `FAC-YYYY-NNNN`
- FAC: Prefijo fijo
- YYYY: Año de emisión
- NNNN: Número secuencial del año (0001, 0002, etc.)

**Comportamiento**:
1. Al abrir el modal de generar factura, el sistema:
   - Consulta la última factura emitida del año actual
   - Extrae el número secuencial
   - Sugiere el siguiente número disponible
2. El usuario puede:
   - Aceptar el número sugerido
   - Editar manualmente el número
   - Usar cualquier formato personalizado
3. **No hay validación de unicidad**: El usuario es responsable de evitar duplicados
4. El número se guarda exactamente como se introduce

### Formato de Facturas PDF

#### Factura a Paciente
- **Cabecera**: Logo, título "FACTURA"
- **Número de factura y fecha**
- **Emisor (Psicólogo)**: Nombre, DNI, dirección completa, número de colegiado
- **Receptor (Paciente)**: Nombre, DNI, dirección completa
- **Tabla de servicios**:
  - Concepto: "Sesión de psicología - [fecha]"
  - Precio por sesión
  - Línea por cada sesión incluida
- **Totales**:
  - Subtotal
  - Base imponible
  - Retención IRPF (%)
  - **Total a pagar** (en grande)
- **Notas al pie**: Texto legal, información de contacto
- **Diseño**: Profesional, limpio, con separadores y uso de color corporativo

#### Factura a Clínica
- Similar estructura pero:
- **Receptor**: Datos fiscales de la clínica (razón social, CIF, dirección de facturación)
- **Concepto global**: "Servicios de psicología - [mes] de [año]"
- **Detalle**: Total de sesiones prestadas, precio por sesión promedio
- **Total neto**: Monto que recibe el psicólogo (ya con el porcentaje aplicado)
- **Sin IRPF**: La retención se gestiona de otra forma en este caso

---

## 🔔 MÓDULO DE RECORDATORIOS

### Lógica de Días para Recordatorios

El sistema muestra las sesiones que requieren recordatorio según una lógica especial:

**Lunes a Jueves**:
- Mostrar sesiones del **día siguiente**
- Ejemplo: Si es martes, mostrar sesiones del miércoles

**Viernes, Sábado y Domingo**:
- Mostrar sesiones del **próximo lunes**
- Ejemplo: Si es viernes, mostrar sesiones del lunes siguiente

Esta lógica asegura que los recordatorios se envíen con tiempo suficiente pero no demasiado anticipado.

### Vista de Recordatorios Pendientes

**Información mostrada**:
- Fecha objetivo de las sesiones a recordar
- Total de sesiones pendientes
- Lista de sesiones:
  - Nombre del paciente
  - Hora de inicio
  - Hora de fin
  - Indicador: ¿Ya se envió recordatorio?
    - ✓ Verde: Recordatorio enviado
    - ⚠️ Naranja: Pendiente de enviar

**Ordenamiento**: Por hora de inicio (más temprana primero)

### Enviar Recordatorio por WhatsApp

#### Flujo Completo
1. Click en botón "Enviar Recordatorio" junto a una sesión
2. El sistema genera automáticamente:
   - **Mensaje personalizado** con plantilla aleatoria
   - **Deeplink de WhatsApp** con número del paciente y mensaje pre-escrito
3. Se abre automáticamente WhatsApp:
   - En el navegador: WhatsApp Web
   - En móvil: App de WhatsApp
   - Con el chat del paciente abierto
   - Con el mensaje completo pre-escrito
4. El psicólogo solo debe hacer click en "Enviar"
5. El sistema registra que se envió el recordatorio
6. La sesión se marca con ✓ verde en la lista

#### Contenido del Mensaje

**Para Sesiones Presenciales**:
```
*RECORDATORIO DE CITA PSICOLÓGICA*

Hola [Nombre del Paciente],

Te recuerdo que tienes una cita programada para:

*Fecha:* [día de la semana, dd de mes de año]
*Hora:* [HH:MM]
*Modalidad:* Presencial
*Clínica:* [Nombre de la clínica]
*Dirección:* [Dirección completa]

¡Confírmame asistencia cuando puedas!
```

**Para Sesiones Online**:
```
*RECORDATORIO DE CITA PSICOLÓGICA*

Hola [Nombre del Paciente],

Te recuerdo que tienes una cita programada para:

*Fecha:* [día de la semana, dd de mes de año]
*Hora:* [HH:MM]
*Modalidad:* Online
*Enlace de la sesión:* [URL de Google Meet]

¡Confírmame asistencia cuando puedas!
```

#### Integración con Google Meet

**Para sesiones online**, el sistema:
1. Crea automáticamente una reunión de Google Meet
2. Usa las credenciales de Google Calendar del psicólogo
3. **Credenciales por entorno**:
   - **Localhost/test**: Usa credenciales de desarrollo (`.secret/credentials.test.json`)
   - **Producción**: Usa credenciales de la cuenta empresarial (`.secret/credentials.production.json`)
4. Programa la reunión para la fecha/hora exacta de la sesión
5. Obtiene el enlace único de Google Meet
6. Incluye el enlace en el mensaje de WhatsApp

**Configuración del evento de Google Calendar**:
- **Título**: "Sesión Psicológica - [Nombre del Paciente]"
- **Hora inicio/fin**: Según la sesión programada
- **Zona horaria**: Europe/Madrid
- **Google Meet**: Activado automáticamente
- **Invitaciones**: Se pueden enviar al paciente si se desea (configuración del profesional en Google Calendar)

**Fallback**: Si falla la creación de Google Meet (credenciales no válidas, límites de API, etc.):
- El sistema genera un enlace placeholder con formato: `https://meet.google.com/xxx-xxxx-xxx`
- Se envía el mensaje igualmente
- Se registra el error en logs
- El psicólogo puede crear el Meet manualmente si lo desea

#### Variantes de Mensajes
El sistema tiene **5 plantillas diferentes** de mensajes:
- Se selecciona aleatoriamente una cada vez
- Todas mantienen la información esencial
- Varían en tono y formato para no ser repetitivos
- Ejemplos:
  1. Formal: "Estimado/a [Nombre]..."
  2. Amigable: "Hola [Nombre] 👋..."
  3. Conciso: "¡Hola [Nombre]! 🌟..."
  4. Profesional: "Buenos días [Nombre]..."
  5. Casual: "👋 [Nombre]..."

#### Registro de Recordatorios
Cada recordatorio enviado se guarda en la base de datos con:
- ID del recordatorio
- ID de la sesión asociada
- Fecha de creación del recordatorio
- Relación con la sesión (para evitar duplicados)

**Validaciones**:
- No se puede crear recordatorio para sesión ya cancelada
- No se puede crear recordatorio duplicado para la misma sesión
- El teléfono del paciente debe existir

### Acceso desde Otras Vistas

El botón de "Enviar Recordatorio" también está disponible en:
- Detalle de sesión (popup desde calendario)
- Tabla de sesiones
- Ficha del paciente (tab de sesiones)

---

## 📊 MÓDULO DE DASHBOARD

### Propósito
Vista general con métricas y gráficos del rendimiento del psicólogo.

### KPIs Rápidos (Rapid KPI)
En la parte superior, 4 tarjetas grandes con:

1. **Sesiones del Mes**
   - Número total de sesiones (completadas + programadas)
   - Porcentaje de variación vs mes anterior
   - Flecha ↑ si aumentó, ↓ si disminuyó

2. **Ingresos del Mes**
   - Total de ingresos del mes actual (EUR)
   - Porcentaje de variación vs mes anterior
   - Flecha indicadora de tendencia

3. **Pacientes Activos**
   - Total de pacientes con estado "en curso"
   - Número de pacientes nuevos este mes
   - Texto: "+X nuevos este mes"

4. **Próximas Citas Hoy**
   - Número de sesiones programadas para hoy
   - Hora de la siguiente cita (la más próxima)
   - Formato: "Próxima: HH:MM" o "No hay más citas hoy"

### Gráficos y Visualizaciones

#### 1. Distribución por Modalidad (Gráfico de Torta)
- **Presencial**: Número y porcentaje
- **Online**: Número y porcentaje
- Colores distintivos
- Muestra el desglose de todas las sesiones

#### 2. Métodos de Pago (Gráfico de Torta)
Distribución porcentual de:
- Efectivo
- Tarjeta
- Transferencia
- Seguro
- Solo sesiones completadas/programadas (excluye pendiente)

#### 3. Resultado de Sesiones (Gráfico de Barras)
Conteo de sesiones por estado:
- **Completadas**: Barra verde
- **Programadas**: Barra azul
- **Canceladas**: Barra roja
- **Inasistencia**: Barra naranja

#### 4. Sesiones por Semana del Mes (Gráfico de Línea)
- Eje X: Semanas del mes (Semana 1, 2, 3, 4, 5)
- Eje Y: Número de sesiones
- Línea continua mostrando tendencia
- Solo sesiones completadas y programadas

#### 5. Ingresos Mensuales (Gráfico de Línea)
- Eje X: Últimos 12 meses
- Eje Y: Ingresos en EUR
- Línea de ingresos totales por mes
- Permite ver tendencia anual

#### 6. Distribución por Edad (Gráfico de Barras Horizontal)
Rangos de edad de pacientes activos:
- 18-25 años
- 26-35 años
- 36-45 años
- >45 años
- Muestra número de pacientes en cada rango

#### 7. Rendimiento por Clínica (Tabla)
Para cada clínica activa:
- Nombre de la clínica
- Total de sesiones
- Precio promedio por sesión
- Total de ingresos generados
- Ordenado por ingresos (mayor a menor)

### Listas de Sesiones

#### Sesiones de Hoy (Pendientes)
Lista de sesiones programadas para hoy que aún no han ocurrido:
- Hora de inicio
- Nombre del paciente
- Tipo (Presencial/Online)
- Nombre de la clínica
- Ordenado por hora (próximas primero)

#### Sesiones de Mañana
Lista de todas las sesiones programadas para mañana:
- Misma estructura que sesiones de hoy
- Muestra el día completo
- Ordenado por hora de inicio

### Detalles por Clínica

#### Sesiones por Clínica (Expandible)
Para cada clínica, muestra:
- Nombre de la clínica
- Total de sesiones
- Botón para expandir/colapsar
- **Vista expandida**: Lista completa de sesiones con:
  - ID de sesión
  - Fecha de la sesión
  - Enlace para ver detalle

### Actualización de Datos
- Los KPIs se calculan en tiempo real desde la base de datos
- Los gráficos se actualizan automáticamente al cargar la página
- Optimización: Una sola carga de datos para múltiples métricas (queries optimizadas)

---

## 📄 MÓDULO DE DOCUMENTOS

### Funcionalidad Principal
Gestión de archivos asociados a pacientes (consentimientos, informes médicos, documentación legal, etc.).

### Acceso
Desde la ficha del paciente, existe un tab o sección de "Documentos".

### Información de Cada Documento
- **ID**: Identificador único
- **Nombre**: Nombre del archivo original
- **Tipo**: Tipo MIME (application/pdf, image/jpeg, etc.)
- **Tamaño**: Formateado legible (KB, MB, GB)
- **Fecha de subida**: Formato DD/MM/YYYY
- **Descripción**: Texto libre opcional
- **URL**: Ruta donde se almacena el archivo

### Operaciones

#### Listar Documentos del Paciente
- Vista de tabla o cards
- Ordenado por fecha de subida (más recientes primero)
- Muestra nombre, tipo, tamaño, fecha
- Botones de acción por documento

#### Subir Nuevo Documento
1. Botón "Subir Documento"
2. Selector de archivo (navegador local)
3. Formulario:
   - Nombre del documento (autocompletado del nombre del archivo)
   - Descripción opcional
4. **Proceso**:
   - El archivo se sube al servidor (o servicio de almacenamiento SFTP configurado)
   - Se genera una URL de acceso
   - Se crea registro en base de datos con metadata
5. El documento aparece inmediatamente en la lista

#### Ver/Descargar Documento
- Click en el documento
- Opciones:
  - **Ver en navegador**: Si el tipo lo permite (PDF, imágenes)
  - **Descargar**: Para cualquier tipo de archivo
- Se usa la URL almacenada para acceder al archivo

#### Eliminar Documento
- Botón "Eliminar" con confirmación
- Soft delete: Marca `is_active = false`
- El archivo físico puede mantenerse o borrarse según configuración
- No aparece más en la lista del paciente

### Seguridad
- Solo el usuario autenticado puede acceder a documentos de sus pacientes
- Los archivos se almacenan de forma segura
- Las URLs pueden tener tokens de acceso temporal (según implementación)

---

## ⚙️ CONFIGURACIÓN Y PERFIL

### Sección de Configuración del Usuario

Accesible desde el menú principal (icono de engranaje o "Mi Perfil").

### Información Editable

#### Datos Profesionales
- **Nombre completo**: Del psicólogo
- **Número de colegiado**: Identificación profesional
- **Porcentaje de IRPF**: Para cálculo de retenciones en facturas (ej: 15%)

#### Datos Fiscales
- **DNI/NIF**: Identificación fiscal
- **IBAN**: Cuenta bancaria para cobros

#### Datos de Dirección
- **Calle**
- **Número**
- **Puerta** (opcional)
- **Ciudad**
- **Provincia**
- **Código Postal**

### Uso de Estos Datos

Estos datos se utilizan automáticamente en:

1. **Facturas a Pacientes**: Como datos del emisor
2. **Facturas de Clínicas**: Como datos del emisor (psicólogo prestador de servicios)
3. **Cálculo de IRPF**: Para las retenciones en facturas

### Funcionalidad del Formulario
- **Vista actual**: Muestra todos los campos pre-rellenados
- **Edición**: Permite modificar cualquier campo
- **Validación**: 
  - Campos obligatorios marcados
  - Validación de formato (email, código postal, etc.)
- **Guardado**: 
  - Botón "Guardar Cambios"
  - Confirmación visual de guardado exitoso
  - Los cambios se reflejan inmediatamente en nuevas facturas

---

## 🔐 SEGURIDAD Y AUTENTICACIÓN

### Sistema de Autenticación JWT

#### Generación de Token
- Al hacer login exitoso
- Token válido por 7 días
- Contiene: userId, email, name
- Firmado con secreto del servidor (JWT_SECRET)

#### Almacenamiento
- Token guardado en localStorage (persistente)
- También en sessionStorage (opcional)
- Se incluye en cada petición HTTP

#### Uso del Token
- Cada petición al backend incluye header: `Authorization: Bearer [token]`
- El middleware `authenticateToken` valida el token
- Extrae información del usuario (req.user)

#### Renovación Automática
- El frontend monitorea la expiración del token
- 5 minutos antes de expirar, solicita renovación
- Endpoint: `POST /api/auth/refresh`
- Se genera un nuevo token sin requerir login

#### Logout
- Se elimina el token de localStorage/sessionStorage
- Se limpia el estado de autenticación
- Se redirige a la página de login

### Validaciones de Seguridad

#### A Nivel de Backend
- Todos los endpoints (excepto `/api/auth/login`) requieren token válido
- Se valida que el usuario exista y esté activo
- Cada request tiene acceso al `req.user` con información del usuario autenticado
- Logs de acceso y errores

#### A Nivel de Frontend
- Guards de navegación (AuthGuard)
- Redirección a login si no hay token
- Manejo de errores 401/403
- Limpieza de estado al detectar token expirado

---

## 🌐 INTEGRACIONES EXTERNAS

### Integración con Google Calendar / Google Meet

#### Objetivo
Crear sesiones de Google Meet automáticamente para sesiones online cuando se envía un recordatorio.

#### Configuración de Credenciales

**Múltiples Entornos**:
El sistema detecta automáticamente el entorno basándose en el hostname:

1. **Entorno de Desarrollo/Test** (`localhost` o `test.dominio.com`):
   - Usa: `.secret/credentials.test.json` y `.secret/token.test.json`
   - Conecta con cuenta personal del desarrollador
   - No afecta el calendario de producción

2. **Entorno de Producción** (cualquier otro hostname):
   - Usa: `.secret/credentials.production.json` y `.secret/token.production.json`
   - Conecta con cuenta empresarial del psicólogo
   - Sesiones reales en calendario de producción

**Generación de Credenciales**:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API
3. Crear credenciales OAuth 2.0 (tipo "Web Application")
4. Descargar JSON y renombrar a `credentials.{environment}.json`
5. Ejecutar script `get_gcal_token.js [environment]` para autorizar
6. Se genera `token.{environment}.json` automáticamente

**Scopes Requeridos**:
- `https://www.googleapis.com/auth/calendar`: Crear eventos
- `https://www.googleapis.com/auth/calendar.events`: Gestionar detalles de eventos

#### Flujo de Creación de Google Meet

1. **Trigger**: Se envía recordatorio de sesión online
2. **Autenticación**: 
   - Se lee el hostname de la request
   - Se cargan las credenciales apropiadas
   - Se obtiene el cliente OAuth2
3. **Creación del Evento**:
   - Se crea evento de calendario con:
     - Título: "Sesión Psicológica - [Nombre Paciente]"
     - Fecha/hora: Según la sesión programada
     - Duración: Calculada (end_time - start_time)
     - Zona horaria: Europe/Madrid
   - Se activa `conferenceData` con tipo "hangoutsMeet"
   - Se genera request ID único
4. **Inserción**: `calendar.events.insert()` con `conferenceDataVersion: 1`
5. **Obtención del Link**: Se extrae de `response.data.conferenceData.entryPoints[0].uri`
6. **Respuesta**: Se incluye el link en el mensaje de WhatsApp

#### Manejo de Errores
- **Credenciales inválidas**: Se usa link placeholder
- **Token expirado**: Se intenta renovar automáticamente
- **Límites de API**: Fallback a link falso
- **Errores de red**: Se registra en logs y se continúa con placeholder

### Integración con WhatsApp

#### Deeplinks de WhatsApp
El sistema genera URLs especiales que abren WhatsApp automáticamente:

**Formato**: `https://wa.me/[telefono]?text=[mensaje_codificado]`

**Procesamiento del Teléfono**:
1. Se limpia el número (solo dígitos)
2. Se añade código de país si no existe (España: +34)
3. Formato final: `34XXXXXXXXX` (sin espacios ni símbolos)

**Codificación del Mensaje**:
- Se usa `encodeURIComponent()` para codificar el mensaje completo
- Preserva emojis y caracteres especiales
- Formato de WhatsApp: Texto pre-escrito en el chat

**Comportamiento**:
- En escritorio: Abre WhatsApp Web
- En móvil: Abre app de WhatsApp nativa
- El chat se abre con el contacto correcto
- El mensaje aparece en el campo de texto
- El usuario solo tiene que darle "Enviar"

#### No hay Envío Automático
**Importante**: El sistema NO envía mensajes automáticamente. 
- Genera el deeplink
- Abre WhatsApp con el mensaje pre-escrito
- El psicólogo debe hacer click en "Enviar" manualmente
- Esto permite revisar y personalizar el mensaje antes de enviar

---

## 📊 MÉTRICAS Y REPORTES

### KPIs Calculados Dinámicamente

#### A Nivel de Sesiones
- **Total de sesiones**: Por periodo, clínica, estado
- **Sesiones completadas**: Solo estado "completed"
- **Sesiones canceladas**: Estados "cancelled" y "no-show"
- **Tasa de completitud**: (Completadas / Total) × 100
- **Ingresos brutos**: Suma de precios de sesiones (excluye pendiente)
- **Ingresos netos**: Suma de (precio × porcentaje de clínica)

#### A Nivel de Pacientes
- **Pacientes activos**: Estado "en curso"
- **Pacientes nuevos del mes**: Por fecha de creación
- **Distribución por edad**: Rangos de edad
- **Distribución por género**: Masculino/Femenino/Otro
- **Distribución por clínica**: Pacientes por cada clínica

#### A Nivel de Facturación
- **Total facturado histórico**: Suma de todas las facturas
- **Facturado del mes**: Por mes/año seleccionado
- **Pendiente de facturar**: Sesiones con `invoiced = 0`
- **Por clínica**: Desglose de ingresos por clínica

#### A Nivel de Clínicas
- **Rendimiento**: Sesiones, ingresos, precio promedio por clínica
- **Distribución de modalidades**: Presencial vs Online por clínica
- **Ocupación**: Sesiones programadas vs completadas

### Filtros Aplicables

Casi todas las vistas permiten filtrar por:
1. **Fechas**: Rango de fecha desde/hasta
2. **Mes y Año**: Selector específico de mes
3. **Clínica**: Individual o múltiples
4. **Estado**: De sesiones o pacientes
5. **Método de pago**: Para sesiones
6. **Paciente**: En vistas de sesiones

Los filtros se aplican a:
- KPIs calculados
- Gráficos
- Tablas de datos
- Exportaciones

---

## 🔄 FLUJOS DE TRABAJO TÍPICOS

### 1. Gestión Diaria

**Por la mañana**:
1. Abrir Dashboard
2. Ver "Próximas citas hoy"
3. Ir a módulo de Recordatorios
4. Revisar sesiones de mañana (o del lunes si es viernes)
5. Enviar recordatorios por WhatsApp a todos los pacientes
6. Volver al calendario para revisar el día

**Durante el día**:
1. Al completar cada sesión:
   - Ir al calendario o tabla de sesiones
   - Cambiar estado de "Programada" a "Completada"
   - Actualizar método de pago si se pagó
   - Añadir notas si es necesario
2. Registrar ausencias como "No-show" o "Cancelada"
3. Si es sesión con bono, registrar uso del bono

**Al final del día**:
1. Revisar que todas las sesiones estén con estado correcto
2. Verificar que los cobros estén registrados
3. Planificar sesiones para el resto de la semana

### 2. Gestión de Nuevo Paciente

**Proceso completo**:
1. Ir a módulo de Pacientes
2. Click en "Nuevo Paciente"
3. Completar formulario:
   - Datos personales básicos
   - Datos de contacto (email, teléfono imprescindibles)
   - Dirección completa (para futuras facturas)
   - Seleccionar clínica principal
   - Fecha de inicio del tratamiento (hoy por defecto)
4. Guardar paciente
5. Crear primera sesión desde el calendario:
   - Fecha y hora
   - Seleccionar el nuevo paciente
   - Confirmar precio y modo (según la clínica)
6. Opcional: Crear bono inicial si el paciente lo adquiere
7. En la primera sesión:
   - Completar historia clínica (tab Historia Clínica)
   - Subir documentos necesarios (consentimientos, etc.)

### 3. Cierre de Mes

**Proceso de facturación mensual**:

**Para pacientes (clínicas no facturables)**:
1. Ir a módulo de Facturación
2. Tab "Facturación a Pacientes"
3. Seleccionar mes anterior
4. Revisar lista de pacientes con sesiones pendientes
5. Para cada paciente:
   - Verificar sesiones incluidas
   - Click en "Generar Factura"
   - Revisar vista previa
   - Ajustar número de factura si es necesario
   - Generar PDF
   - Descargar y enviar al paciente
6. Las sesiones se marcan automáticamente como facturadas

**Para clínicas (clínicas facturables)**:
1. Tab "Facturación de Clínicas"
2. Seleccionar mes anterior
3. Revisar lista de clínicas con sesiones pendientes
4. Para cada clínica:
   - Verificar total de sesiones y monto neto
   - Click en "Generar Factura de Clínica"
   - Revisar datos fiscales de la clínica
   - Ajustar número de factura
   - Generar PDF
   - Guardar/enviar a la clínica
5. **Importante**: Solo una factura por clínica por mes

**Post-facturación**:
1. Descargar todas las facturas generadas
2. Archivarlas en sistema de gestión documental
3. Registrar en contabilidad personal
4. Verificar que no queden sesiones pendientes sin facturar

### 4. Gestión de Bonos

**Venta de bono**:
1. Ir a ficha del paciente
2. Tab "Bonos"
3. Click en "Crear Nuevo Bono"
4. Configurar:
   - Número de sesiones (ej: 10)
   - Precio total (ej: 500€)
   - Se calcula automáticamente precio por sesión (50€)
5. Guardar bono
6. El bono queda activo con 10 sesiones disponibles

**Uso del bono**:
1. Cuando el paciente asiste a una sesión:
   - Ir al tab "Bonos"
   - Buscar el bono activo
   - Click en "Usar Sesión"
2. Se actualiza automáticamente:
   - Sesiones usadas: +1
   - Sesiones restantes: -1
   - Progreso visual se actualiza
3. Cuando se agoten todas las sesiones:
   - Estado cambia a "consumed"
   - Se puede crear un nuevo bono

**Seguimiento**:
- Revisar KPIs de bonos: Activos, consumidos, expirados
- Alertas visuales para bonos próximos a expirar
- Historial completo de uso por bono

### 5. Gestión de Citas Online

**Programar sesión online**:
1. Crear sesión en calendario
2. Seleccionar paciente
3. Clínica asociada debe ser "online" (sin dirección)
4. El sistema determina automáticamente modo "Online"
5. Guardar sesión

**Día del recordatorio**:
1. Ir a módulo de Recordatorios
2. Localizar la sesión online
3. Click en "Enviar Recordatorio"
4. El sistema:
   - Crea automáticamente Google Meet
   - Genera mensaje con enlace de Meet
   - Abre WhatsApp con mensaje completo
5. Revisar mensaje y enviar

**Día de la sesión**:
1. Usar el mismo enlace de Google Meet
2. Al finalizar:
   - Marcar sesión como "Completada"
   - Registrar cobro
   - Añadir notas clínicas si es necesario

---

## 🔧 CONCEPTOS TÉCNICOS IMPORTANTES

### Soft Delete
El sistema usa "soft delete" en lugar de borrado físico:
- No se eliminan registros de la base de datos
- Se marca un campo `is_active = false`
- Los registros no aparecen en listados normales
- Permite recuperación de datos si es necesario
- Mantiene integridad referencial

### Paginación
Todas las listas implementan paginación:
- Evita cargar todos los registros a la vez
- Mejora rendimiento
- Parámetros: `page` (número de página) y `limit` (registros por página)
- Respuesta incluye metadatos:
  - Total de páginas
  - Total de registros
  - Página actual
  - ¿Hay página siguiente/anterior?

### Cálculo de Precios
**Precio Bruto vs Precio Neto**:
- **Bruto**: Lo que paga el paciente (campo `price` en sesiones)
- **Neto**: Lo que recibe el psicólogo
- **Fórmula**: `Neto = Bruto × (Porcentaje clínica / 100)`
- **Ejemplo**: Sesión de 60€ en clínica con 70% → Neto = 60 × 0.70 = 42€

### Estados de Sesión
- **scheduled**: Sesión programada, pendiente de realizar
- **completed**: Sesión realizada exitosamente
- **cancelled**: Sesión cancelada con aviso previo
- **no-show**: Paciente no asistió sin avisar

Transiciones normales:
- scheduled → completed (sesión realizada)
- scheduled → cancelled (cancelación)
- scheduled → no-show (inasistencia)

### Validación de Solapamientos
Algoritmo para detectar conflictos horarios:
```
Sesión A (existente): [start_A, end_A]
Sesión B (nueva): [start_B, end_B]

Hay solapamiento si:
  (start_B < end_A) AND (end_B > start_A)
```

Esto cubre todos los casos:
- B empieza durante A
- B termina durante A
- B contiene completamente a A
- A contiene completamente a B

### Sistema Multi-Base de Datos
El sistema soporta múltiples bases de datos según el hostname:
- **Localhost**: BD de desarrollo/test
- **test.dominio.com**: BD de staging
- **dominio.com**: BD de producción

Esto permite:
- Desarrollo sin afectar producción
- Testing en entorno de staging
- Mismo código para todos los entornos

---

## 📱 CARACTERÍSTICAS DE INTERFAZ

### Diseño Responsive
- Adaptado a escritorio, tablet y móvil
- Menú lateral colapsable
- Tablas con scroll horizontal en móvil
- Formularios apilados en pantallas pequeñas

### Colores y Temas
- Paleta moderna y profesional
- Colores distintivos por clínica (configurables)
- Estados visuales claros (success, warning, error, info)
- Contraste accesible

### Feedback Visual
- Toasts/notificaciones para acciones exitosas
- Mensajes de error claros y descriptivos
- Spinners de carga
- Confirmaciones antes de acciones destructivas
- Validación en tiempo real de formularios

### Navegación
- Menú lateral con iconos y texto
- Breadcrumbs (migas de pan) donde aplique
- Botones "Volver" en vistas de detalle
- Enlaces directos entre módulos relacionados

---

## 🚀 OPTIMIZACIONES Y RENDIMIENTO

### Backend
- **Consultas optimizadas**: Joins eficientes, índices en campos de búsqueda
- **Paginación**: Evita cargar todos los registros
- **Queries agregadas**: En dashboard, múltiples métricas en una sola query
- **Connection pooling**: Reutilización de conexiones a base de datos
- **Logs estructurados**: Para debugging