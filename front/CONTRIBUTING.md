# 🚀 Guía de Desarrollo - Proyecto Angular + Tailwind + Signals

Este documento define las reglas, convenciones y buenas prácticas que **todo el código debe seguir**.  
Sirve como contexto permanente para agentes de IA y desarrolladores humanos.

---

## 📂 Estructura del proyecto

```
src/
├─ app/
│  ├─ core/                   # Servicios globales (auth, interceptores, guards)
│  ├─ shared/                 # Componentes, directivas y pipes reutilizables
│  ├─ features/               # Cada feature independiente
│  │   ├─ auth/               # Login, registro, recuperación
│  │   ├─ dashboard/
│  │   ├─ calendario/
│  │   ├─ pacientes/
│  │   ├─ sesiones/
│  │   └─ facturacion/
│  │   └─ configuration/
│  ├─ app-routing.ts
│  └─ app.component.ts
├─ assets/
└─ styles.css                 # Tailwind base
```

---

## 🎨 Estilos (TailwindCSS)

- Usar **exclusivamente clases de TailwindCSS**.
- Evitar CSS plano; si es necesario, usar `@apply`.
- Componentes comunes (botones, cards, inputs) deben ir en `shared/components`.
- Todo el diseño debe ser **responsive (mobile-first)**.

Ejemplo de botón reusable:

```ts
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  standalone: true,
  templateUrl: "./button.component.html",
})
export class ButtonComponent {
  @Input() color = "bg-blue-500 text-white";
}
```

```html
<!-- button.component.html -->
<button [ngClass]="color" class="px-4 py-2 rounded-xl font-medium shadow-sm hover:opacity-90 transition w-full sm:w-auto">
  <ng-content></ng-content>
</button>
```

---

## ⚡ Angular moderno

- **Standalone components** siempre (no usar NgModules).
- **Template HTML externo siempre** (`templateUrl: './*.component.html'`).
- **Signals API** (`signal`, `computed`, `effect`) para estado local y global.
- **inject()** en lugar de inyección por constructor cuando sea posible.
- **Functional guards y resolvers** (`CanActivateFn`).
- **Lazy loading** en todas las rutas de features.
- **ChangeDetectionStrategy.OnPush** por defecto para rendimiento.

Ejemplo de servicio con signals:

```ts
import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PacientesService {
  private pacientes = signal<any[]>([]);

  get all() {
    return this.pacientes.asReadonly();
  }

  addPaciente(p: any) {
    this.pacientes.update((list) => [...list, p]);
  }
}
```

---

## 🛡️ Routing

- Todas las rutas deben ser **standalone** y usar `loadChildren` o `loadComponent`.
- Autenticación se maneja con un `authGuard` en `core/guards`.

Ejemplo de ruta protegida:

```ts
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./features/dashboard/dashboard.component')
    .then(m => m.DashboardComponent)
}
```

---

## 📱 Reglas de Responsividad (Responsive Design)

1. **Siempre responsive**: diseño mobile-first.
2. Usar breakpoints de Tailwind (`sm`, `md`, `lg`, `xl`, `2xl`).
3. Evitar medidas fijas, preferir `w-full`, `max-w-*`.
4. Tipografía adaptable: `text-sm sm:text-base md:text-lg`.
5. Espaciado adaptable con `p-*`, `m-*`, `gap-*`.
6. Revisar en móvil, tablet y desktop antes de entregar.

Ejemplo:

```html
<div
  class="bg-white rounded-2xl shadow p-4 
            flex flex-col sm:flex-row sm:items-center 
            gap-4 w-full"
>
  <img src="..." class="w-full sm:w-32 h-32 object-cover rounded-xl" />

  <div class="flex-1">
    <h2 class="text-lg sm:text-xl font-semibold">Título</h2>
    <p class="text-sm sm:text-base text-gray-600">Descripción adaptada según ancho de pantalla.</p>
  </div>
</div>
```

---

## 🔒 Convenciones de nombres

- Componentes: `PascalCase` → `PacienteListComponent`.
- Servicios: `PascalCase` + `Service` → `PacientesService`.
- Guards: `camelCase` + sufijo → `authGuard`.
- Signals: nombres claros → `counter = signal(0)`.

---

## 🧪 Testing

- Todo componente y servicio debe tener `.spec.ts`.
- Tests deben vivir junto al archivo original.
- Usar Jasmine/Karma o Jest.

---

## 📝 Commits y ramas

- Usar [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: añadir login con signals`
  - `fix: corregir bug en sesiones`
  - `chore: actualización de dependencias`

---

## ⚙️ Performance y buenas prácticas Angular

- Usar `OnPush` por defecto.
- Usar `trackBy` en \*ngFor.
- Usar `async pipe` en lugar de `subscribe` manual.
- Lazy load en features pesadas.

---

## ♿ Accesibilidad y UX

- Usar atributos `aria-*` y roles en HTML.
- Mantener contraste mínimo AA en colores.
- Formularios → preferir `ReactiveFormsModule`.

---

## 📦 Estructura de features

Cada feature debe contener:

```
/feature-name/
 ├─ components/      # Subcomponentes internos
 ├─ services/        # Servicios específicos del feature
 ├─ models/          # Interfaces y tipos
 ├─ feature.component.ts
 ├─ feature.component.html
 └─ feature-routing.ts
```

---

## 🌍 Estado global

- Usar servicios con signals para estado compartido.
- Evitar NgRx salvo proyectos muy grandes.
- Si se necesita, definir `store/` en `core/`.

---

## 📚 Documentación

- Todo servicio debe tener un bloque JSDoc explicando su propósito.
- Funciones públicas deben estar documentadas.
- Componentes complejos → comentar cómo se usan.

---

## 🎨 Patrones de Diseño y Estilos Comunes

### **Estructura de Layout para Features**

Todo componente de feature debe seguir esta estructura base para mantener consistencia:

```html
<div class="p-4 sm:p-6 h-screen overflow-hidden">
  <div class="w-full h-full flex flex-col max-h-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-montserrat text-gray-900">Título</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Descripción de la sección</p>
      </div>

      <!-- Botones del header -->
      <div class="flex items-center gap-4">
        <!-- Botones aquí -->
      </div>
    </div>

    <!-- Controles/Filtros (opcional) -->
    <div class="flex items-center gap-4 mb-4 sm:mb-6">
      <!-- Controles aquí -->
    </div>

    <!-- Contenido principal -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <!-- Grid/Lista con scroll controlado -->
    </div>
  </div>
</div>
```

### **Botones Estándar**

#### Botón Principal (Acción primaria):

```html
<button style="background-color: #d29f67" class="hover:opacity-90 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-white rounded-md transition-opacity font-medium">
  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icono SVG -->
  </svg>
  Texto del Botón
</button>
```

#### Botón Secundario (Con hover azul):

```html
<button class="border border-gray-300 bg-white hover:text-white inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all" onmouseover="this.style.backgroundColor='#d29f67'; this.style.borderColor='#d29f67'" onmouseout="this.style.backgroundColor=''; this.style.borderColor='#d1d5db'">
  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icono SVG -->
  </svg>
  Texto
</button>
```

#### Botón de Acción con Hover (Cancelar, etc.):

```html
<button class="inline-flex items-center justify-center ... text-foreground ..." onmouseover="this.style.backgroundColor='#d29f67'; this.style.color='white'" onmouseout="this.style.backgroundColor=''; this.style.color=''">Texto</button>
```

### **Color Principal del Proyecto**

- **Color primario**: `#d29f67` (cyan-600)
- Usar consistentemente en:
  - Botones principales
  - Hovers de botones secundarios
  - Indicadores de estado activo
  - Elementos destacados

### **Alturas y Overflow**

- **Container principal**: `h-screen overflow-hidden`
- **Container interno**: `h-full flex flex-col max-h-full`
- **Áreas con scroll**: `flex-1 overflow-y-auto min-h-0`
- **Headers**: Altura fija sin scroll
- **Contenido**: Flexible con scroll controlado

### **Espaciado Responsive**

- **Padding externo**: `p-4 sm:p-6`
- **Márgenes entre secciones**: `mb-4 sm:mb-6`
- **Gap en flex**: `gap-4`
- **Tipografía**: `text-2xl sm:text-3xl` (headers), `text-sm sm:text-base` (descripciones)

### **Cards Estándar**

```html
<div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
  <!-- Header de card -->
  <div class="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-3">
    <!-- Contenido del header -->
  </div>

  <!-- Contenido de card -->
  <div class="px-6">
    <!-- Contenido -->
  </div>
</div>
```

### **Grids Responsive Estándar**

- **3 columnas**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- **2 columnas**: `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Formularios**: `grid grid-cols-1 md:grid-cols-2 gap-4`

### **Estados y Badges**

#### Badge de estado:

```html
<span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90" [class]="getStatusColor(status)"> {{ getStatusLabel(status) }} </span>
```

#### Colores de estado estándar:

```typescript
getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'discharged': return 'bg-blue-100 text-blue-800';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
```

### **Iconos SVG**

- Usar SVG inline con `class="h-4 w-4"` o `class="h-5 w-5"`
- Stroke weight: `stroke-width="2"`
- Posicionamiento: `mr-2` para iconos de botones

### **Estados de Carga y Vacío**

#### Loading:

```html
@if (isLoading()) {
<div class="flex items-center justify-center h-full">
  <div class="text-muted-foreground">Cargando...</div>
</div>
}
```

#### Empty State:

```html
@if (items().length === 0) {
<div class="text-center py-12">
  <p class="text-muted-foreground">No se encontraron elementos.</p>
</div>
}
```

---

## ✅ Resumen de reglas para IA

- Angular standalone components siempre.
- HTML externo siempre (`templateUrl`).
- TailwindCSS para todos los estilos.
- Signals para estado local y global.
- Diseño **responsive obligatorio** (mobile-first con Tailwind).
- Usar OnPush, trackBy, async pipe para performance.
- Convenciones de nombres, commits y pruebas unitarias.
- Preguntar al usuario antes de tomar decisiones dudosas.
