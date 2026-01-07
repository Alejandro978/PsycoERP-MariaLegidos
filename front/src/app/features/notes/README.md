# Módulo de Notas y Recordatorios

Módulo para gestionar notas y recordatorios dentro de la aplicación PsycoERP.

## Estructura

```
notes/
├── components/
│   ├── note-card/           # Tarjeta individual de nota
│   │   ├── note-card.component.ts
│   │   ├── note-card.component.html
│   │   └── note-card.component.spec.ts
│   └── note-dialog/         # Diálogo para crear notas
│       ├── note-dialog.component.ts
│       ├── note-dialog.component.html
│       └── note-dialog.component.spec.ts
├── models/
│   └── note.model.ts        # Interfaces TypeScript
├── services/
│   └── notes.service.ts     # Servicio de gestión de notas
├── notes.component.ts       # Componente principal
├── notes.component.html
├── notes.component.scss
└── notes.component.spec.ts
```

## Funcionalidades

### KPIs
- **Total de notas**: Contador total de todas las notas
- **Notas pendientes**: Notas activas con badge naranja
- **Notas completadas**: Notas finalizadas con check verde

### Gestión de Notas
- ✅ Crear nueva nota
- ✅ Marcar como completada/pendiente
- ✅ Eliminar nota
- ✅ Visualización de estado
- ⏳ Drag & Drop para reordenar (preparado para futuro)

**Nota:** Las notas son creadas por y para el usuario administrador (mismo usuario). No hay gestión de destinatarios.

## Modelos de Datos

### Note
```typescript
interface Note {
  id: string;
  creation_date: string;
  message: string;
  status: 'completed' | 'pending';
  created_at?: string;
  updated_at?: string;
}
```

### NotesKPIs
```typescript
interface NotesKPIs {
  total_notes: number;
  pending_notes: number;
  completed_notes: number;
}
```

## Uso

### En el Componente

```typescript
import { NotesService } from './services/notes.service';

constructor(private notesService: NotesService) {}

// Obtener KPIs
const kpis = this.notesService.kpis();

// Obtener todas las notas
const notes = this.notesService.notes();

// Crear nota
this.notesService.createNote({ message: 'Nueva nota' });

// Cambiar estado
this.notesService.toggleNoteStatus(noteId);

// Eliminar nota
this.notesService.deleteNote(noteId);
```

## Estado Actual

✅ **Implementado con datos mock**
- Servicio funcional con signals de Angular
- UI completa con KPIs y lista de notas
- CRUD básico (Crear, Leer, Actualizar estado, Eliminar)

⏳ **Pendiente**
- Integración con API backend
- Sistema de permisos por rol
- Selector de destinatario (solo admin)
- Drag & Drop para reordenamiento
- Filtros y búsqueda

## Navegación

La ruta está disponible en `/notes` y aparece en el menú lateral con el icono de nota adhesiva.

## Testing

Ejecutar tests:
```bash
ng test
```

Los archivos spec.ts están configurados para cada componente.
