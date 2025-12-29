# PsychologyERP - Contexto Completo del Proyecto Frontend

## 📋 Resumen Ejecutivo

**Nombre:** PsychologyERP (PsicoERP)
**Tipo:** Sistema ERP para profesionales de la psicología
**Framework:** Angular 17.3 (Standalone Components)
**Lenguaje:** TypeScript 5.4.2
**Estilos:** Tailwind CSS 3.4.17 + SCSS
**Propósito:** Sistema completo de gestión de consultas psicológicas incluyendo pacientes, sesiones, facturación y administración de clínicas

---

## 🏗️ Stack Tecnológico

### Dependencias Principales
- **Angular 17.3.0** - Arquitectura moderna de componentes standalone
- **RxJS 7.8.0** - Programación reactiva
- **TypeScript 5.4.2** - Modo estricto habilitado
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **SCSS** - Estilos a nivel de componente

### Librerías Clave
- **html2canvas (1.4.1)** - Generación de capturas para PDFs
- **jsPDF (3.0.3)** - Generación de PDFs para facturas
- **Zone.js (0.14.3)** - Detección de cambios

### Herramientas de Desarrollo
- **Autoprefixer & PostCSS** - Procesamiento CSS
- **Karma & Jasmine** - Framework de testing
- **Angular CLI 17.3.17** - Herramientas de build

---

## 🎯 Arquitectura del Proyecto

### Patrón Arquitectónico
**Arquitectura Angular Moderna con Standalone Components y Signals**
- Sin NgModules - componentes completamente standalone
- Gestión de estado reactivo basada en Signals
- Interceptors y guards funcionales
- Lazy loading de módulos de características
- Patrón Smart/Container y Presentational components

### Estructura de Carpetas

```
src/app/
├── core/                          # Servicios core y utilidades singleton
│   ├── guards/                    # Guards de rutas (auth.guard.ts)
│   ├── interceptors/              # Interceptors HTTP (api, error, loading)
│   ├── models/                    # Modelos de datos core (user, login, auth)
│   └── services/                  # Servicios core (auth, base-crud, loading, toast, menu, user, whatsapp)
│
├── features/                      # Módulos de características (lazy-loaded)
│   ├── auth/                      # Autenticación
│   │   └── login/
│   ├── billing/                   # Gestión de facturación
│   │   ├── components/            # 11+ componentes especializados de billing
│   │   ├── models/                # Modelos de datos de facturación
│   │   └── services/              # Servicios de billing y PDF
│   ├── calendar/                  # Calendario de sesiones (vista semana/mes)
│   │   ├── components/
│   │   └── services/              # Servicios de calendario y sesiones
│   ├── clinics/                   # Gestión de clínicas
│   │   ├── components/
│   │   ├── models/
│   │   └── services/
│   ├── configuration/             # Configuración de perfil de usuario
│   ├── dashboard/                 # Dashboard principal (placeholder)
│   ├── patient/                   # Gestión de pacientes
│   │   ├── components/            # Formularios, listas, cards, filtros
│   │   ├── patient-detail/        # Vista detallada con tabs
│   │   ├── models/
│   │   └── services/              # Servicios de pacientes, notas clínicas, documentos
│   ├── reminder/                  # Gestión de recordatorios
│   │   ├── components/
│   │   ├── models/
│   │   └── services/
│   └── session/                   # Vista de lista de sesiones
│
├── shared/                        # Componentes compartidos y utilidades
│   ├── components/                # 14 componentes reutilizables
│   │   ├── clinic-selector/
│   │   ├── confirmation-modal/
│   │   ├── form-input/
│   │   ├── pagination/
│   │   ├── patient-selector/
│   │   ├── reusable-modal/
│   │   ├── section-header/
│   │   ├── sidebar/
│   │   ├── spinner/
│   │   └── toast/
│   ├── layouts/
│   │   └── main-layout/           # Layout principal con sidebar
│   └── models/                    # Modelos de datos compartidos
│       ├── patient.model.ts
│       ├── session.model.ts
│       ├── clinic-config.model.ts
│       ├── clinical-note.model.ts
│       ├── patient-detail.model.ts
│       └── pagination.interface.ts
│
├── app.component.ts               # Componente raíz
├── app.config.ts                  # Configuración de la aplicación
└── app.routes.ts                  # Definición de rutas
```

---

## 🔑 Patrones Arquitectónicos Clave

### 1. Gestión de Estado
**Estado Reactivo Basado en Signals**
- Angular Signals para estado local de componentes
- Computed signals para valores derivados
- Servicios basados en signals para estado compartido
- Sin librería externa de gestión de estado (NgRx, Akita)

**Patrón de Ejemplo:**
```typescript
private patients = signal<Patient[]>([]);
private isLoading = signal(false);
readonly all = this.patients.asReadonly();
readonly loading = this.isLoading.asReadonly();
```

### 2. Arquitectura de Servicios
**Patrón Base CRUD Service**
- `BaseCrudService<T>` abstracto proporciona operaciones CRUD comunes
- Servicios de features extienden el servicio base
- Manejo automático de errores vía interceptors
- Estados de carga integrados y notificaciones toast

**Servicios por Feature:**
- `PatientsService` - CRUD de pacientes con filtros y paginación
- `ClinicsService` - Gestión de clínicas
- `SessionsService` - Operaciones CRUD de sesiones
- `CalendarService` - Estado del calendario y lógica de visualización de sesiones
- `BillingService` - Generación de facturas y KPIs
- `AuthService` - Autenticación con refresh de token
- `UserService` - Gestión de perfil de usuario

### 3. Cadena de Interceptors HTTP
**Patrón de Tres Capas de Interceptors:**
1. **API Interceptor** - Añade base URL, headers de auth, maneja refresh de 401
2. **Loading Interceptor** - Gestión de estado de carga global
3. **Error Interceptor** - Manejo centralizado de errores con mensajes amigables

### 4. Patrones de Componentes

**Componentes Smart (Container):**
- Gestionan estado y lógica de negocio
- Inyectan servicios
- Manejan routing y navegación
- Ejemplos: `PatientComponent`, `CalendarComponent`, `BillingComponent`

**Componentes Presentational (Dumb):**
- Reciben datos vía @Input
- Emiten eventos vía @Output
- Sin inyección de servicios
- Solo lógica de UI pura
- Ejemplos: `PatientCardComponent`, `PaginationComponent`, `SectionHeaderComponent`

---

## 🛣️ Estructura de Rutas

### Rutas Principales:
```typescript
/ → redirect a /auth/login
/auth/login → Página de login
/patient → Lista de pacientes (protegida por auth)
/patient/:id → Detalle de paciente
/patient/nuevo → Formulario nuevo paciente
/reminder → Lista de recordatorios
/calendar → Vista de calendario (semana/mes)
/sessions → Lista de sesiones
/billing → Gestión de facturación
/clinics → Gestión de clínicas
/configuration → Configuración de usuario
** → redirect a /calendar
```

**Protección de Rutas:**
- Todas las rutas de features protegidas por `authGuard`
- Validación de token en localStorage
- Redirección automática a login al expirar

**Menú Dinámico:**
- Items de menú cargados desde configuración de rutas
- Cada ruta define metadata de menú (label, icon, order)
- `MenuService` extrae menú desde configuración de routing

---

## 📊 Modelos de Datos e Interfaces

### Entidades Core

**Modelo Patient:**
```typescript
interface Patient {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni: string;
  gender: 'M' | 'F' | 'O';
  occupation: string;
  birth_date: string;
  // Campos de dirección
  street, street_number, door, postal_code, city, province
  // Info de tratamiento
  clinic_id: number;
  treatment_start_date: string;
  status: 'en curso' | 'fin del tratamiento' | 'en pausa' | 'abandono' | 'derivación';
  is_minor: boolean;
}
```

**Modelo Session:**
```typescript
interface SessionData {
  SessionDetailData: {
    session_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    mode: 'online' | 'presencial';
    price: number;
    net_price: number;
    payment_method: 'bizum' | 'transferencia' | 'tarjeta' | 'efectivo' | 'pendiente';
    status: 'completada' | 'cancelada';
    completed, cancelled, no_show, sended: boolean;
    PatientData: { id, name };
    ClinicDetailData: { clinic_id, clinic_name, clinic_color, clinic_percentage };
    MedicalRecordData: Array<notas clínicas>;
  }
}
```

**Modelo Clinic:**
```typescript
interface Clinic {
  id?: string;
  name: string;
  clinic_color: string;
  address: string;
  price: number;
  percentage: number;
  is_billable: boolean;
  cif?: string;
  fiscal_name?: string;
  billing_address?: string;
}
```

**Modelos de Billing:**
- `InvoiceKPIs` - Métricas del dashboard
- `PendingInvoice` - Sesiones sin facturar por paciente
- `ExistingInvoice` - Facturas generadas
- `ClinicInvoiceData` - Datos de facturación de clínicas

**Modelo User:**
```typescript
interface User {
  id: number;
  email: string;
  name: string;
  license_number?: string;
  irpf?: string;
  iban?: string;
  dni?: string;
  // Campos de dirección
}
```

### Patrón de Paginación
```typescript
interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}
```

---

## 🔌 Integración con API

### Configuración del Backend
**Settings de Environment:**
```typescript
environment = {
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000,
    version: 'v1'
  }
}
```

### Formato de Respuesta de API
**Wrapper de Respuesta Estándar:**
```typescript
ApiListResponse<T> = { data: T[], total: number, page: number }
ApiItemResponse<T> = { data: T }
ApiResponse<T> = { data: T }
```

### Endpoints Clave (inferidos):
- `/auth/login` - Autenticación
- `/auth/refresh` - Refresh de token
- `/patients` - CRUD de pacientes + filtros
- `/patients/inactive` - Pacientes eliminados (soft delete)
- `/patients/:id/restore` - Restaurar paciente
- `/sessions` - CRUD de sesiones + filtros de fecha
- `/clinics` - Gestión de clínicas
- `/invoices` - Operaciones de facturas
- `/invoices/kpis` - Métricas de facturación
- `/invoices/pending` - Sesiones sin facturar
- `/invoices/of-clinics` - Facturas de clínicas
- `/user/profile` - Perfil de usuario

---

## 🎨 Sistema de Estilos

### Configuración de Tailwind
**Tema Personalizado:**
```scss
--primary: #d29f67 (Marrón dorado)
--secondary: #ec4899 (Rosa)
--destructive: #be123c (Rojo rosa)
--muted: #f9fafb (Gris claro)
--foreground: #4b5563 (Gris oscuro)
--background: #ffffff (Blanco)
```

**Colores de Clínicas:**
- Clínica A: Marrón dorado (#d29f67)
- Clínica B: Rosa (#ec4899)
- Clínica C: Índigo (#6366f1)
- Privado: Rojo rosa (#be123c)

**Utilidades Personalizadas:**
- Estilos de scrollbar (thin, muted)
- Variables de border radius personalizadas
- Utilidades de color de fondo/texto
- Clases de estado hover
- Colores específicos de sidebar

### Estructura SCSS
- Estilos globales en `styles.scss`
- Archivos SCSS con scope de componente
- Capas de Tailwind: base, components, utilities
- Google Fonts: Montserrat (pesos variables)

---

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. POST a `/auth/login`
3. Recibe respuesta `{ user, token }`
4. Almacena token en localStorage
5. Calcula tiempo de expiración desde `expires_in`
6. Auto-refresh del token antes de expiración
7. Inyecta token en todas las requests vía interceptor

### Gestión de Tokens
- JWT almacenado en localStorage (`auth_token`)
- Tiempo de expiración almacenado (`token_expiration`)
- Perfil de usuario en caché (`user`)
- Timer automático de refresh (intervalos de 5 minutos)
- Estrategia inteligente de refresh basada en tiempo de vida del token:
  - Tokens de 7+ días: refresh 24h antes de expirar
  - Tokens de 1-7 días: refresh 4h antes de expirar
  - Tokens de <1 día: refresh 30min antes de expirar

### Auth Guard
- Valida existencia y expiración del token
- Redirige a login en caso de fallo
- Verifica tanto localStorage como estado de AuthService
- Se ejecuta en todas las rutas protegidas

### Manejo de Errores
- Respuestas 401 disparan intento automático de refresh
- Refresh fallido dispara logout
- Mensajes de error amigables vía toast
- Interceptor centralizado de errores

---

## ⚡ Optimizaciones de Rendimiento

### Optimizaciones de Angular
- **OnPush Change Detection** - Todos los componentes principales usan ChangeDetectionStrategy.OnPush
- **Standalone Components** - Tamaño de bundle reducido, tree-shakable
- **Lazy Loading** - Todos los módulos de features cargados bajo demanda
- **Funciones TrackBy** - Renderizado optimizado de ngFor

### Carga de Datos
- Paginación en todas partes (pacientes, sesiones, clínicas)
- Filtrado basado en fechas para calendario (solo carga período visible)
- Caché basado en signals en servicios
- Inputs de búsqueda con debounce (asumido por patrones)

### Configuración de Build
- Budgets de producción: 500kb warning, 1mb error
- Budgets de estilos de componente: 2kb warning, 4kb error
- Output hashing para cache busting
- Source maps solo en desarrollo

---

## ✨ Características Especiales

### Generación de PDFs
- Templates personalizados de facturas
- html2canvas para capturas de DOM
- jsPDF para creación de PDF
- Formato A4 portrait
- Renderizado de alta calidad (scale: 2)

### Integración con WhatsApp
- Links directos a WhatsApp Web
- Mensajes de recordatorio pre-rellenados
- Contenido específico por paciente
- Incluye fecha/hora de sesión

### Notas Clínicas
- Contenido estilo Markdown
- Asociadas con sesiones
- Seguimiento histórico
- Entradas con marca de tiempo

### Soporte Multi-Clínica
- Sistema visual codificado por colores
- División de ingresos basada en porcentajes
- Precios específicos por clínica
- Facturación separada de clínicas

---

## 📝 Convenciones y Patrones

### Convenciones de Nomenclatura
- **Componentes:** PascalCase + sufijo Component (ej: `PatientComponent`)
- **Servicios:** PascalCase + sufijo Service (ej: `PatientsService`)
- **Interfaces:** PascalCase (ej: `Patient`, `SessionData`)
- **Archivos:** kebab-case (ej: `patient-detail.component.ts`)
- **Signals:** camelCase (ej: `isLoading`, `selectedPatient`)
- **Observables:** camelCase con sufijo $ (ej: `patients$`)

### Organización de Archivos
- Estructura folder-first por feature
- Componentes colocados con templates y estilos
- Modelos en archivos dedicados
- Servicios agrupados por feature
- Código compartido en `/shared`

### Patrones de Signals
```typescript
// Signal privado escribible
private _data = signal<T>(initialValue);

// Accessor público de solo lectura
readonly data = this._data.asReadonly();

// Valores derivados computados
readonly derivedData = computed(() => transform(this._data()));

// Patrón de actualización
this._data.set(newValue);
this._data.update(current => modify(current));
```

### Manejo de Respuestas de Servicios
```typescript
service.method().subscribe({
  next: (response) => {
    // Manejo de éxito
    this.updateState(response);
  },
  error: (error) => {
    // Error registrado por interceptor
    // Manejo opcional específico del componente
  }
});
```

---

## 🔄 Flujo de Trabajo de Desarrollo

### Desarrollo Local
```bash
npm start              # Dev server en :4200
npm run build          # Build de producción
npm run watch          # Build en modo watch
npm test               # Ejecutar tests unitarios
```

### Gestión de Environments
- `environment.ts` - Desarrollo
- `environment.staging.ts` - Staging
- `environment.prod.ts` - Producción
- Reemplazo de archivos en angular.json

### Calidad de Código
- Modo estricto de TypeScript habilitado
- Templates estrictos habilitados
- Parámetros de inyección estrictos
- Sin returns implícitos
- Sin fallthrough cases en switch

---

## 💼 Lógica de Negocio Clave

### Flujo de Estado de Pacientes
1. **En curso** - Tratamiento activo
2. **En pausa** - Tratamiento pausado
3. **Fin del tratamiento** - Tratamiento completado
4. **Abandono** - Paciente abandonó
5. **Derivación** - Referido a otro proveedor

### Ciclo de Vida de Sesiones
1. Crear sesión (programada)
2. Marcar completada/cancelada/no-show
3. Establecer método de pago
4. Asociar con factura
5. Incluir en reportes de facturación

### Generación de Facturas
1. Filtrar sesiones por mes/año
2. Agrupar sesiones pendientes por paciente/clínica
3. Generar número de factura (secuencia basada en año)
4. Crear registro de factura
5. Asociar sesiones con factura
6. Generar PDF
7. Marcar sesiones como facturadas

### Cálculo de Ingresos
- **Precio Bruto:** Precio de sesión establecido para clínica
- **Porcentaje Clínica:** Porcentaje retenido por clínica
- **Precio Neto:** Bruto - (Bruto × Porcentaje Clínica)
- Mostrados por separado en reportes de facturación

---

## 🎯 Módulos de Features - Análisis Profundo

### 1. Gestión de Pacientes
**Capacidades:**
- Operaciones CRUD con validación
- Filtrado avanzado (nombre, DNI, email, género, clínica, estado)
- Interfaz de tabs duales (pacientes activos/inactivos)
- Paginación (12 items por página por defecto)
- Vista de detalle de paciente con tabs:
  - Datos personales
  - Historia clínica
  - Sesiones
  - Documentación
  - Estadísticas resumen
- Funcionalidad de soft delete y restore
- Gestión de dirección multi-campo

**Componentes:**
- `PatientComponent` - Contenedor principal
- `PatientFormComponent` - Formulario Crear/Editar
- `PatientListComponent` - Display en grid
- `PatientCardComponent` - Card individual de paciente
- `PatientFiltersModalComponent` - Diálogo de filtros
- `PatientDetailComponent` - Vista de detalle
- Tabs de detalle de paciente (data, history, sessions, documentation, summary)

### 2. Calendario y Sesiones
**Capacidades:**
- Modos de vista semana y mes
- Display visual de sesiones en time slots (7:00 AM - 9:00 PM)
- Codificado por colores según clínica con colores personalizados de API
- Detección de colisión de sesiones y distribución horizontal
- Sesiones ocupan múltiples time slots
- Click-to-create desde time slots
- Edición de sesión vía modal
- Indicadores de estado (completada, cancelada, no-show)
- Badges de estado de pago
- Integración de recordatorios WhatsApp
- Filtrado de sesiones por rango de fechas

**Estados de Sesión:**
- Completada (verde)
- Cancelada (rojo, visualmente atenuado)
- Programada (azul)
- No-show (gris)

**Características del Calendar Service:**
- Navegación de fechas (anterior/siguiente, hoy)
- Cambio de vista (semana/mes)
- Caché de datos de sesiones por período
- Recarga automática de API al navegar
- Cálculo de layout de sesiones para overlaps

### 3. Facturación
**Capacidades:**
- Dos modos de facturación:
  1. **Facturas de Pacientes** - Facturación individual de sesiones
  2. **Facturas de Clínicas** - Facturación bulk de clínicas
- Cards de KPI Dashboard:
  - Total facturas emitidas
  - Ingresos brutos históricos
  - Bruto de período filtrado
  - Neto de período filtrado
  - Desglose neto por clínica
- Filtro por mes/año
- Lista de sesiones pendientes (agrupadas por paciente)
- Generación bulk de facturas
- Preview individual y descarga de facturas
- Generación de PDF con html2canvas + jsPDF
- Auto-incremento de número de factura por año
- Asociación de sesiones con facturas

**Componentes de Factura:**
- `BulkInvoicingComponent` - Facturación bulk de pacientes
- `ClinicInvoicingComponent` - Facturación de clínicas
- `FilterAnalysisComponent` - Display de KPIs
- `ExistingInvoicesComponent` - Lista de facturas
- `InvoicePreviewComponent` - Preview de PDF
- `InvoiceTemplateComponent` - Template de PDF
- Varios modales para creación de facturas

### 4. Gestión de Clínicas
**Capacidades:**
- Operaciones CRUD de clínicas
- Color picker para display en calendario
- Configuración de precio y porcentaje
- Flag de facturable para facturación de clínicas
- Información fiscal (CIF, nombre fiscal, dirección de facturación)
- Gestión de estado
- Paginación

**Componentes:**
- `ClinicsComponent` - Contenedor principal
- `ClinicsListComponent` - Display en grid
- `ClinicCardComponent` - Card individual de clínica
- `ClinicFormComponent` - Formulario Crear/Editar

### 5. Configuración
**Capacidades:**
- Edición de perfil de usuario
- Número de licencia profesional
- Información fiscal (porcentaje IRPF)
- Detalles bancarios (IBAN)
- Identificación personal (DNI)
- Gestión completa de dirección

---

## 📚 Librería de Componentes Compartidos

### Componentes Reutilizables
1. **ClinicSelectorComponent** - Picker dropdown de clínicas
2. **ConfirmationModalComponent** - Diálogo de confirmación genérico
3. **FormInputComponent** - Input de formulario estandarizado
4. **PaginationComponent** - Navegación de páginas con selector de tamaño
5. **PatientSelectorComponent** - Picker de paciente con búsqueda
6. **ReusableModalComponent** - Wrapper base de modal
7. **SectionHeaderComponent** - Header de página con acciones
8. **SidebarComponent** - Sidebar de navegación
9. **SpinnerComponent** - Indicador de carga
10. **ToastComponent** - Sistema de notificaciones

### Componentes de Layout
- **MainLayoutComponent** - Layout principal de app con sidebar y router outlet

---

## 🚀 Despliegue y Consideraciones

### Artefactos de Build
- Directorio de output: `dist/psichology-erp`
- Assets estáticos desde `src/assets`
- Favicon desde `src/favicon.ico`

### Variables de Entorno
- URL base de API debe configurarse por entorno
- Requiere API backend en endpoint especificado
- CORS debe configurarse en backend

### Soporte de Navegadores
- Navegadores modernos (target ES2022)
- Sin soporte para IE11
- Requiere JavaScript habilitado

---

## 🎓 Casos de Uso Principales

1. **Gestionar registros de pacientes e historia clínica**
2. **Programar y hacer seguimiento de sesiones de terapia**
3. **Generar facturas de pacientes y clínicas**
4. **Monitorear KPIs de ingresos y facturación**
5. **Gestionar múltiples ubicaciones de clínicas**
6. **Hacer seguimiento de progreso de tratamiento y resultados**

---

## 📈 Resumen

Esta es una **aplicación Angular 17 moderna y bien arquitecturada** usando patrones de vanguardia:

**Fortalezas:**
- Gestión de estado reactiva basada en Signals
- Separación clara de responsabilidades
- Set de características completo para gestión de consulta psicológica
- Excelente organización y estructura de código
- Uso apropiado del modo estricto de TypeScript
- Librería de componentes reutilizables
- UI profesional con Tailwind CSS
- Cadena inteligente de interceptors para cross-cutting concerns

**Usuarios Objetivo:** Psicólogos independientes o consultas pequeñas de psicología que gestionan múltiples clínicas y necesitan funcionalidad ERP completa.

Esta aplicación representa una solución production-ready, nivel enterprise para gestión de consultas de psicología con aproximadamente **105 archivos TypeScript** implementando un flujo de negocio completo desde ingreso de pacientes hasta facturación.

---

**Última actualización:** 2025-11-01
**Versión del Proyecto:** 0.0.0
**Angular CLI:** 17.3.17
**Node:** Compatible con versiones modernas (ES2022 target)
