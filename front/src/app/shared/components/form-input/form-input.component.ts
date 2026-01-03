import { Component, Input, Inject, Optional, Output, EventEmitter, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input.component.html',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class FormInputComponent {
  // Input properties for customization
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text'; // 'text', 'email', 'tel', 'date', 'select'
  @Input() required: boolean = false;
  @Input() errorMessage?: string;
  @Input() options: SelectOption[] = []; // For select fields
  @Input() selectPlaceholder: string = 'Seleccionar...';
  @Input() min?: string; // For min attribute (time, date, number inputs)
  @Input() max?: string; // For max attribute (time, date, number inputs)

  // Output events
  @Output() onChange = new EventEmitter<any>();

  constructor(
    @Optional() @Inject(ControlContainer) private controlContainer: ControlContainer
  ) {}

  // Get the form control from the parent form
  get formControl() {
    if (this.controlContainer && this.controlContainer.control) {
      return this.controlContainer.control.get(this.controlName);
    }
    return null;
  }

  // Check if field has errors and should display them
  get hasError(): boolean {
    const control = this.formControl;
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched);
  }

  // Get the error message to display
  get displayErrorMessage(): string {
    if (!this.hasError) return '';

    // Use custom error message if provided, otherwise use form control errors
    if (this.errorMessage) {
      return this.errorMessage;
    }

    const control = this.formControl;
    const errors = control?.errors;
    if (!errors) return '';

    // Handle common validation errors
    if (errors['required']) {
      return `${this.label} es requerido`;
    }
    if (errors['email']) {
      return 'Por favor, introduce un email válido';
    }
    if (errors['minlength']) {
      return `${this.label} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `${this.label} no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      return `${this.label} tiene un formato inválido`;
    }
    if (errors['timeRange']) {
      return 'El horario debe estar entre las 07:00 y las 22:00';
    }
    if (errors['timeOrder']) {
      return 'La hora de fin debe ser posterior a la hora de inicio';
    }
    if (errors['maxDuration']) {
      return 'La duración no puede superar los 60 minutos';
    }
    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }

    // Validaciones personalizadas de DNI
    if (errors['invalidDniFormat']) {
      return 'El DNI debe tener 8 dígitos seguidos de una letra (Ej: 12345678A)';
    }
    if (errors['invalidDniLetter']) {
      const expected = errors['invalidDniLetter'].expected;
      return `La letra del DNI es incorrecta. Debería ser: ${expected}`;
    }

    // Validaciones personalizadas de teléfono
    if (errors['invalidPhone']) {
      return 'El teléfono debe tener exactamente 9 dígitos sin espacios';
    }
    if (errors['invalidPhonePrefix']) {
      return 'El teléfono debe empezar por 6, 7, 8 o 9';
    }

    // Validaciones personalizadas de fecha de nacimiento
    if (errors['futureDate']) {
      return 'La fecha de nacimiento no puede ser futura';
    }
    if (errors['ageTooOld']) {
      const maxAge = errors['ageTooOld'].maxAge;
      return `La edad no puede superar los ${maxAge} años`;
    }
    if (errors['ageTooYoung']) {
      const minAge = errors['ageTooYoung'].minAge;
      return `La edad debe ser al menos ${minAge} años`;
    }

    // Validaciones personalizadas de fecha de tratamiento
    if (errors['dateTooOld']) {
      const maxYears = errors['dateTooOld'].maxYears;
      return `La fecha no puede ser más de ${maxYears} años en el pasado`;
    }
    if (errors['dateTooFuture']) {
      const maxYears = errors['dateTooFuture'].maxYears;
      return `La fecha no puede ser más de ${maxYears} años en el futuro`;
    }
    if (errors['invalidDate']) {
      return 'La fecha ingresada no es válida';
    }

    // Return first error key as fallback
    return Object.keys(errors)[0];
  }

  // Handle change events
  onFieldChange(event: Event): void {
    this.onChange.emit(event);
  }
}