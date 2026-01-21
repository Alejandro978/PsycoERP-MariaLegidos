import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  OnInit,
  OnChanges,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../services/patients.service';
import {
  dniValidator,
  phoneValidator,
  birthDateValidator,
  treatmentDateValidator,
} from '../../../../shared/validators/custom-validators';
/**
 * Patient Data Component
 *
 * Displays and allows editing of patient personal, contact, and treatment information
 */
@Component({
  selector: 'app-patient-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDataComponent implements OnInit, OnChanges {
  @Input() patient!: Patient;
  @Output() patientUpdated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private patientsService = inject(PatientsService);

  readonly isEditing = signal(false);
  readonly patientForm: FormGroup;

  // Signal derivado del valor de birth_date del formulario
  private birthDateValue = signal<string>('');

  // Computed: determina si el paciente es menor de edad basándose en el formulario
  readonly isMinor = computed(() => {
    const birthDate = this.birthDateValue();
    if (!birthDate) return false;

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
    return actualAge < 18;
  });

  constructor() {
    this.patientForm = this.fb.group({
      // Personal Information
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, dniValidator()]],
      birth_date: ['', [Validators.required, birthDateValidator()]],
      occupation: [''],

      // Contact Information
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator()]],
      street: ['', Validators.required],
      street_number: ['', Validators.required],
      door: [''],
      postal_code: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      city: ['', Validators.required],
      province: ['', Validators.required],

      // Treatment Information (tipo_clinica and nombre_clinica are read-only, not included)
      treatment_start_date: ['', treatmentDateValidator()],
      status: [''],

      // Progenitor fields (conditional validation if minor)
      progenitor1_full_name: [''],
      progenitor1_dni: [''],
      progenitor1_phone: [''],
      progenitor2_full_name: [''],
      progenitor2_dni: [''],
      progenitor2_phone: [''],
    });

    // Effect: actualiza validadores cuando cambia isMinor
    effect(() => {
      const isMinorValue = this.isMinor();
      this.updateProgenitorValidators(isMinorValue);
    });
  }

  readonly age = computed(() => {
    if (!this.patient?.birth_date) return 0;

    const birthDate = new Date(this.patient.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  });

  ngOnInit() {
    if (this.patient) {
      this.loadPatientData();
      this.patientForm.disable(); // Disable form by default
    }
  }

  ngOnChanges() {
    if (this.patient) {
      this.loadPatientData();
      if (!this.isEditing()) {
        this.patientForm.disable(); // Keep disabled when patient changes
      }
    }
  }

  private loadPatientData() {
    this.patientForm.patchValue({
      first_name: this.patient.first_name,
      last_name: this.patient.last_name,
      dni: this.patient.dni,
      birth_date: this.patient.birth_date,
      occupation: this.patient.occupation,
      email: this.patient.email,
      phone: this.patient.phone,
      street: this.patient.street,
      street_number: this.patient.street_number,
      door: this.patient.door,
      postal_code: this.patient.postal_code,
      city: this.patient.city,
      province: this.patient.province,
      treatment_start_date: this.patient.treatment_start_date,
      status: this.patient.status,
      progenitor1_full_name: this.patient.progenitor1_full_name || '',
      progenitor1_dni: this.patient.progenitor1_dni || '',
      progenitor1_phone: this.patient.progenitor1_phone || '',
      progenitor2_full_name: this.patient.progenitor2_full_name || '',
      progenitor2_dni: this.patient.progenitor2_dni || '',
      progenitor2_phone: this.patient.progenitor2_phone || '',
    });

    // Update birthDateValue signal to trigger isMinor computation
    this.birthDateValue.set(this.patient.birth_date || '');
  }

  /**
   * Handle birth date change to recalculate isMinor
   */
  onBirthDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.birthDateValue.set(input.value);
  }

  /**
   * Update validators for progenitor fields based on whether patient is minor
   */
  private updateProgenitorValidators(isMinorValue: boolean) {
    const progenitor1FullName = this.patientForm.get('progenitor1_full_name');
    const progenitor1Dni = this.patientForm.get('progenitor1_dni');
    const progenitor1Phone = this.patientForm.get('progenitor1_phone');

    if (isMinorValue) {
      // Progenitor 1 fields are required for minors
      progenitor1FullName?.setValidators([Validators.required, Validators.minLength(2)]);
      progenitor1Dni?.setValidators([Validators.required, dniValidator()]);
      progenitor1Phone?.setValidators([Validators.required, phoneValidator()]);
    } else {
      // Clear validators if not minor
      progenitor1FullName?.clearValidators();
      progenitor1Dni?.clearValidators();
      progenitor1Phone?.clearValidators();
    }

    // Update validity
    progenitor1FullName?.updateValueAndValidity({ emitEvent: false });
    progenitor1Dni?.updateValueAndValidity({ emitEvent: false });
    progenitor1Phone?.updateValueAndValidity({ emitEvent: false });

    // Also update progenitor 2 validators
    this.updateProgenitor2Validators(isMinorValue);
  }

  /**
   * Update validators for progenitor 2 fields conditionally
   * If any field has a value, all fields become required
   */
  private updateProgenitor2Validators(isMinorValue: boolean) {
    if (!isMinorValue) {
      return;
    }

    const progenitor2FullName = this.patientForm.get('progenitor2_full_name');
    const progenitor2Dni = this.patientForm.get('progenitor2_dni');
    const progenitor2Phone = this.patientForm.get('progenitor2_phone');

    // Check if any field has a value
    const fullNameValue = progenitor2FullName?.value?.trim() || '';
    const dniValue = progenitor2Dni?.value?.trim() || '';
    const phoneValue = progenitor2Phone?.value?.trim() || '';

    const hasAnyValue = fullNameValue || dniValue || phoneValue;

    if (hasAnyValue) {
      // If any field has value, all become required
      progenitor2FullName?.setValidators([Validators.required, Validators.minLength(2)]);
      progenitor2Dni?.setValidators([Validators.required, dniValidator()]);
      progenitor2Phone?.setValidators([Validators.required, phoneValidator()]);
    } else {
      // If all are empty, remove required validators
      progenitor2FullName?.clearValidators();
      progenitor2Dni?.clearValidators();
      progenitor2Phone?.clearValidators();
    }

    // Update validity without emitting events to avoid infinite loops
    progenitor2FullName?.updateValueAndValidity({ emitEvent: false });
    progenitor2Dni?.updateValueAndValidity({ emitEvent: false });
    progenitor2Phone?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Handle progenitor 2 field changes to update validators
   */
  onProgenitor2Change() {
    this.updateProgenitor2Validators(this.isMinor());
  }

  onEdit() {
    this.isEditing.set(true);
    this.patientForm.enable();
  }

  async onSave() {
    if (this.patientForm.valid && this.patient.id) {
      const formValue = this.patientForm.value;
      const isMinorValue = this.isMinor();

      const updatedPatient: Partial<Patient> = {
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        dni: formValue.dni,
        birth_date: formValue.birth_date,
        occupation: formValue.occupation,
        email: formValue.email,
        phone: formValue.phone,
        street: formValue.street,
        street_number: formValue.street_number,
        door: formValue.door || '',
        postal_code: formValue.postal_code,
        city: formValue.city,
        province: formValue.province,
        treatment_start_date: formValue.treatment_start_date,
        status: formValue.status,
        is_minor: isMinorValue,
      };

      // Add progenitor fields only if minor
      if (isMinorValue) {
        updatedPatient.progenitor1_full_name = formValue.progenitor1_full_name?.trim() || '';
        updatedPatient.progenitor1_dni = formValue.progenitor1_dni?.trim().toUpperCase() || '';
        updatedPatient.progenitor1_phone = formValue.progenitor1_phone?.replace(/\s+/g, '').trim() || '';
        updatedPatient.progenitor2_full_name = formValue.progenitor2_full_name?.trim() || '';
        updatedPatient.progenitor2_dni = formValue.progenitor2_dni?.trim().toUpperCase() || '';
        updatedPatient.progenitor2_phone = formValue.progenitor2_phone?.replace(/\s+/g, '').trim() || '';
      } else {
        // Clear progenitor fields if not minor
        updatedPatient.progenitor1_full_name = '';
        updatedPatient.progenitor1_dni = '';
        updatedPatient.progenitor1_phone = '';
        updatedPatient.progenitor2_full_name = '';
        updatedPatient.progenitor2_dni = '';
        updatedPatient.progenitor2_phone = '';
      }

      const result = await this.patientsService.updatePatientAsync(
        this.patient.id,
        updatedPatient
      );

      if (result) {
        this.isEditing.set(false);
        this.patientForm.disable();
        this.patientUpdated.emit();
      }
    }
  }

  onCancel() {
    this.loadPatientData(); // Reset to original values
    this.isEditing.set(false);
    this.patientForm.disable();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'en curso':
        return 'bg-green-100 text-green-800';
      case 'fin del tratamiento':
        return 'bg-blue-100 text-blue-800';
      case 'en pausa':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  }

  getStatusLabel(status: string): string {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Get validation error message for a field
   */
  getFieldError(fieldName: string): string | null {
    const field = this.patientForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors?.['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${minLength} caracteres`;
      }
      if (field.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors?.['pattern']) {
        if (fieldName === 'postal_code') {
          return 'El código postal debe tener exactamente 5 dígitos';
        }
        return 'Formato inválido';
      }
      // DNI validations
      if (field.errors?.['invalidDniFormat']) {
        return 'El DNI debe tener 8 dígitos seguidos de una letra (ej: 12345678A)';
      }
      if (field.errors?.['invalidDniLetter']) {
        const error = field.errors['invalidDniLetter'];
        return `La letra del DNI no es válida. Debería ser ${error.expected} en lugar de ${error.actual}`;
      }
      // Phone validations
      if (field.errors?.['phoneContainsSpaces']) {
        return 'El teléfono no puede contener espacios';
      }
      if (field.errors?.['invalidPhone']) {
        return 'El teléfono debe tener exactamente 9 dígitos sin espacios (ej: 666123456)';
      }
      if (field.errors?.['invalidPhonePrefix']) {
        return 'El teléfono debe comenzar con 6, 7, 8 o 9';
      }
      // Birth date validations
      if (field.errors?.['futureBirthDate']) {
        return 'La fecha de nacimiento no puede ser futura';
      }
      if (field.errors?.['tooOld']) {
        const age = field.errors['tooOld'].age;
        return `La edad no puede superar los 100 años (calculada: ${age} años)`;
      }
      // Treatment date validations
      if (field.errors?.['treatmentDateTooFarFuture']) {
        const years = field.errors['treatmentDateTooFarFuture'].years;
        return `La fecha no puede ser más de 100 años en el futuro (${years} años)`;
      }
      if (field.errors?.['treatmentDateTooFarPast']) {
        const years = field.errors['treatmentDateTooFarPast'].years;
        return `La fecha no puede ser más de 100 años en el pasado (${years} años)`;
      }
    }
    return null;
  }

  /**
   * Get human-readable label for a field
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      first_name: 'Nombre',
      last_name: 'Apellidos',
      dni: 'DNI',
      birth_date: 'Fecha de nacimiento',
      occupation: 'Ocupación',
      email: 'Email',
      phone: 'Teléfono',
      street: 'Calle',
      street_number: 'Número',
      door: 'Puerta',
      postal_code: 'Código postal',
      city: 'Ciudad',
      province: 'Provincia',
      treatment_start_date: 'Fecha inicio tratamiento',
      status: 'Estado',
      progenitor1_full_name: 'Nombre del progenitor 1',
      progenitor1_dni: 'DNI del progenitor 1',
      progenitor1_phone: 'Teléfono del progenitor 1',
      progenitor2_full_name: 'Nombre del progenitor 2',
      progenitor2_dni: 'DNI del progenitor 2',
      progenitor2_phone: 'Teléfono del progenitor 2',
    };
    return labels[fieldName] || fieldName;
  }
}
