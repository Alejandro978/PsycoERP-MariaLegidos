import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../shared/models/patient.model';
import { Clinic } from '../../../clinics/models/clinic.model';
import { ClinicSelectorComponent } from '../../../../shared/components/clinic-selector';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import {
  dniValidator,
  phoneValidator,
  birthDateValidator,
  treatmentDateValidator,
} from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  templateUrl: './patient-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClinicSelectorComponent,
    ReusableModalComponent,
    FormInputComponent,
  ],
})
export class PatientFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() patient: Patient | null = null;
  @Input() clinics: Clinic[] = [];

  @Output() onSave = new EventEmitter<Patient>();
  @Output() onCancel = new EventEmitter<void>();

  patientForm!: FormGroup;
  private clinicChangeSubscription?: Subscription;

  // Options for selects
  protected genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  protected statusOptions = [
    { value: 'en curso', label: 'En curso' },
    { value: 'fin del tratamiento', label: 'Fin del tratamiento' },
    { value: 'en pausa', label: 'En pausa' },
    { value: 'abandono', label: 'Abandono' },
    { value: 'derivación', label: 'Derivación' },
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
    // Clinics are now provided via @Input from parent component

    // Subscribe to clinic changes
    this.clinicChangeSubscription = this.patientForm.get('clinic_id')?.valueChanges.subscribe((clinicId) => {
      this.onClinicChange(clinicId);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.clinicChangeSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] || changes['isOpen']) {
      if (this.isOpen) {
        this.populateForm();
      } else {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.patientForm = this.fb.group({
      // Datos personales básicos
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator()]],
      dni: ['', [Validators.required, dniValidator()]],
      birth_date: ['', [Validators.required, birthDateValidator()]],
      gender: ['', [Validators.required]],
      occupation: [''],

      // Dirección completa
      street: ['', [Validators.required]],
      street_number: ['', [Validators.required]],
      door: [''],
      postal_code: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{5}$/)],
      ],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],

      // Datos del tratamiento
      clinic_id: ['', [Validators.required]],
      treatment_start_date: ['', [Validators.required, treatmentDateValidator()]],
      status: ['en curso', [Validators.required]],
      special_price: [0, [Validators.required, Validators.min(0)]],

      // Campos automáticos
      is_minor: [false],

      // Información de progenitores (solo para menores)
      progenitor1_full_name: [''],
      progenitor1_dni: [''],
      progenitor1_phone: [''],
      progenitor2_full_name: [''],
      progenitor2_dni: [''],
      progenitor2_phone: [''],
    });
  }

  private populateForm(): void {
    if (this.patient) {
      this.patientForm.patchValue({
        first_name: this.patient.first_name || '',
        last_name: this.patient.last_name || '',
        email: this.patient.email || '',
        phone: this.patient.phone || '',
        dni: this.patient.dni || '',
        birth_date: this.patient.birth_date || '',
        gender: this.patient.gender || '',
        occupation: this.patient.occupation || '',
        street: this.patient.street || '',
        street_number: this.patient.street_number || '',
        door: this.patient.door || '',
        postal_code: this.patient.postal_code || '',
        city: this.patient.city || '',
        province: this.patient.province || '',
        clinic_id: this.patient.clinic_id || '',
        treatment_start_date: this.patient.treatment_start_date || '',
        status: this.patient.status || 'en curso',
        special_price: this.patient.special_price ?? 0,
        is_minor: this.patient.is_minor || false,
        progenitor1_full_name: this.patient.progenitor1_full_name || '',
        progenitor1_dni: this.patient.progenitor1_dni || '',
        progenitor1_phone: this.patient.progenitor1_phone || '',
        progenitor2_full_name: this.patient.progenitor2_full_name || '',
        progenitor2_dni: this.patient.progenitor2_dni || '',
        progenitor2_phone: this.patient.progenitor2_phone || '',
      });
      // Update validators after populating
      this.updateProgenitorValidators();

      // Apply field restrictions for external clinics in edit mode
      this.applyFieldRestrictionsForEditMode();
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.patientForm.reset({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      dni: '',
      birth_date: '',
      gender: '',
      occupation: '',
      street: '',
      street_number: '',
      door: '',
      postal_code: '',
      city: '',
      province: '',
      clinic_id: '',
      treatment_start_date: '',
      status: 'en curso',
      special_price: 0,
      is_minor: false,
      progenitor1_full_name: '',
      progenitor1_dni: '',
      progenitor1_phone: '',
      progenitor2_full_name: '',
      progenitor2_dni: '',
      progenitor2_phone: '',
    });
    // Clear validators
    this.updateProgenitorValidators();

    // Disable all fields except clinic_id when creating a new patient
    if (!this.isEditing) {
      this.disableAllFieldsExceptClinic();
    }
  }

  /**
   * Update validators for progenitor fields based on whether patient is minor
   */
  private updateProgenitorValidators(): void {
    const isMinor = this.patientForm.get('is_minor')?.value;

    const progenitor1FullName = this.patientForm.get('progenitor1_full_name');
    const progenitor1Dni = this.patientForm.get('progenitor1_dni');
    const progenitor1Phone = this.patientForm.get('progenitor1_phone');

    if (isMinor) {
      // Progenitor 1 fields are required for minors with custom validators
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
    progenitor1FullName?.updateValueAndValidity();
    progenitor1Dni?.updateValueAndValidity();
    progenitor1Phone?.updateValueAndValidity();
  }

  /**
   * Update progenitor fields state (enabled/disabled) based on minor status
   * This should be called whenever minor status changes or clinic is selected
   */
  private updateProgenitorFieldsState(): void {
    const isMinor = this.patientForm.get('is_minor')?.value;

    const progenitorFields = [
      'progenitor1_full_name',
      'progenitor1_dni',
      'progenitor1_phone',
      'progenitor2_full_name',
      'progenitor2_dni',
      'progenitor2_phone'
    ];

    if (isMinor) {
      // Enable progenitor fields for minors
      progenitorFields.forEach(fieldName => {
        this.patientForm.get(fieldName)?.enable();
      });

      // Update validators
      this.updateProgenitorValidators();
    } else {
      // Disable progenitor fields for non-minors
      progenitorFields.forEach(fieldName => {
        this.patientForm.get(fieldName)?.disable();
      });

      // Clear validators
      this.updateProgenitorValidators();
    }
  }

  get isEditing(): boolean {
    return this.patient !== null;
  }

  get title(): string {
    return this.isEditing ? 'Editar Paciente' : 'Crear nuevo paciente';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Actualizar Paciente' : 'Crear Paciente';
  }

  get isFormValid(): boolean {
    return this.patientForm.valid;
  }

  get isMinor(): boolean {
    return this.patientForm.get('is_minor')?.value || false;
  }

  /**
   * Check if the selected clinic is external
   */
  get isExternalClinic(): boolean {
    const clinicId = this.patientForm.get('clinic_id')?.value;
    if (!clinicId) {
      return false;
    }

    const selectedClinic = this.clinics.find(clinic => clinic.id === clinicId);
    return selectedClinic?.is_external || false;
  }

  /**
   * Determine if a field should show as required based on clinic type
   */
  isFieldRequired(fieldName: string): boolean {
    // Fields that are always required
    const alwaysRequired = ['clinic_id', 'first_name', 'last_name'];
    if (alwaysRequired.includes(fieldName)) {
      return true;
    }

    // If external clinic, only the above fields are required
    if (this.isExternalClinic) {
      return false;
    }

    // For internal clinics, check the field's validators
    const field = this.patientForm.get(fieldName);
    if (!field) {
      return false;
    }

    // Check if the field has the required validator
    const validator = field.validator;
    if (validator) {
      const validationResult = validator({} as any);
      return validationResult && validationResult['required'];
    }

    return false;
  }

  handleSubmit(): void {
    if (this.patientForm.valid) {
      const formData = { ...this.patientForm.value };

      // Ensure is_minor is always a boolean
      formData.is_minor = Boolean(formData.is_minor);

      // Clean phone numbers and DNI: remove spaces, trim whitespace
      if (formData.phone) {
        formData.phone = formData.phone.toString().replace(/\s+/g, '').trim();
      }
      if (formData.dni) {
        formData.dni = formData.dni.toString().replace(/\s+/g, '').trim().toUpperCase();
      }
      if (formData.progenitor1_phone) {
        formData.progenitor1_phone = formData.progenitor1_phone.toString().replace(/\s+/g, '').trim();
      }
      if (formData.progenitor1_dni) {
        formData.progenitor1_dni = formData.progenitor1_dni.toString().replace(/\s+/g, '').trim().toUpperCase();
      }
      if (formData.progenitor2_phone) {
        formData.progenitor2_phone = formData.progenitor2_phone.toString().replace(/\s+/g, '').trim();
      }
      if (formData.progenitor2_dni) {
        formData.progenitor2_dni = formData.progenitor2_dni.toString().replace(/\s+/g, '').trim().toUpperCase();
      }

      // If not minor, remove progenitor fields from payload
      if (!formData.is_minor) {
        delete formData.progenitor1_full_name;
        delete formData.progenitor1_dni;
        delete formData.progenitor1_phone;
        delete formData.progenitor2_full_name;
        delete formData.progenitor2_dni;
        delete formData.progenitor2_phone;
      }

      if (this.isEditing && this.patient) {
        const updatedPatient: Patient = {
          ...this.patient,
          ...formData,
        };
        this.onSave.emit(updatedPatient);
      } else {
        // Para crear nuevo paciente, no incluir el id si existe
        const { id, ...createData } = formData;
        this.onSave.emit(createData);
      }
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.patientForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors?.['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} debe tener al menos ${minLength} caracteres`;
      }
      if (field.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors?.['invalidDniFormat']) {
        return 'El DNI debe tener 8 dígitos seguidos de una letra (ej: 12345678A)';
      }
      if (field.errors?.['invalidDniLetter']) {
        const error = field.errors['invalidDniLetter'];
        return `La letra del DNI no es válida. Debería ser ${error.expected} en lugar de ${error.actual}`;
      }
      if (field.errors?.['invalidPhone']) {
        return 'El teléfono debe tener exactamente 9 dígitos sin espacios (ej: 666123456)';
      }
      if (field.errors?.['invalidPhonePrefix']) {
        return 'El teléfono debe comenzar con 6, 7, 8 o 9';
      }
      if (field.errors?.['futureBirthDate']) {
        return 'La fecha de nacimiento no puede ser futura';
      }
      if (field.errors?.['tooOld']) {
        const age = field.errors['tooOld'].age;
        return `La edad no puede superar los 100 años (calculada: ${age} años)`;
      }
      if (field.errors?.['treatmentDateTooFarFuture']) {
        const years = field.errors['treatmentDateTooFarFuture'].years;
        return `La fecha de inicio de tratamiento no puede ser más de 100 años en el futuro (${years} años)`;
      }
      if (field.errors?.['treatmentDateTooFarPast']) {
        const years = field.errors['treatmentDateTooFarPast'].years;
        return `La fecha de inicio de tratamiento no puede ser más de 100 años en el pasado (${years} años)`;
      }
    }
    return null;
  }

  /**
   * Calculate if patient is minor based on birth date
   */
  calculateIsMinor(): void {
    const birthDate = this.patientForm.get('birth_date')?.value;
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();

      const actualAge =
        age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      const isMinor = actualAge < 18;

      this.patientForm.patchValue({ is_minor: isMinor });

      // Update validators when minor status changes
      this.updateProgenitorValidators();
    }
  }

  /**
   * Get calculated age based on birth date
   */
  getCalculatedAge(): number {
    const birthDate = this.patientForm.get('birth_date')?.value;
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
  }

  /**
   * Handle birth date change to calculate if minor
   */
  onBirthDateChange(): void {
    this.calculateIsMinor();
    // Update progenitor fields state based on minor status
    this.updateProgenitorFieldsState();
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      first_name: 'Nombre',
      last_name: 'Apellidos',
      email: 'Email',
      phone: 'Teléfono',
      dni: 'DNI',
      birth_date: 'Fecha de nacimiento',
      gender: 'Género',
      occupation: 'Ocupación',
      street: 'Calle',
      street_number: 'Número',
      door: 'Puerta',
      postal_code: 'Código postal',
      city: 'Ciudad',
      province: 'Provincia',
      clinic_id: 'Clínica',
      treatment_start_date: 'Fecha inicio tratamiento',
      status: 'Estado del tratamiento',
      special_price: 'Precio especial',
      progenitor1_full_name: 'Nombre completo (Progenitor 1)',
      progenitor1_dni: 'DNI (Progenitor 1)',
      progenitor1_phone: 'Teléfono (Progenitor 1)',
      progenitor2_full_name: 'Nombre completo (Progenitor 2)',
      progenitor2_dni: 'DNI (Progenitor 2)',
      progenitor2_phone: 'Teléfono (Progenitor 2)',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Disable all fields except clinic_id when creating a new patient
   */
  private disableAllFieldsExceptClinic(): void {
    const fieldNames = [
      'first_name', 'last_name', 'email', 'phone', 'dni', 'birth_date',
      'gender', 'occupation', 'street', 'street_number', 'door',
      'postal_code', 'city', 'province', 'treatment_start_date',
      'status', 'special_price', 'progenitor1_full_name',
      'progenitor1_dni', 'progenitor1_phone', 'progenitor2_full_name',
      'progenitor2_dni', 'progenitor2_phone'
    ];

    fieldNames.forEach(fieldName => {
      this.patientForm.get(fieldName)?.disable();
    });

    // Ensure clinic_id is enabled
    this.patientForm.get('clinic_id')?.enable();
  }

  /**
   * Clear fields that will be disabled for external clinics
   */
  private clearFieldsForExternalClinic(): void {
    const fieldsToClear = [
      'email', 'phone', 'dni', 'birth_date', 'gender', 'occupation',
      'street', 'street_number', 'door', 'postal_code', 'city', 'province',
      'treatment_start_date', 'status'
    ];

    fieldsToClear.forEach(fieldName => {
      this.patientForm.get(fieldName)?.setValue('');
    });

    // Reset is_minor to false when clearing fields
    this.patientForm.patchValue({ is_minor: false });

    // Clear progenitor fields as well since is_minor is now false
    const progenitorFields = [
      'progenitor1_full_name', 'progenitor1_dni', 'progenitor1_phone',
      'progenitor2_full_name', 'progenitor2_dni', 'progenitor2_phone'
    ];

    progenitorFields.forEach(fieldName => {
      this.patientForm.get(fieldName)?.setValue('');
    });
  }

  /**
   * Handle clinic selection change
   */
  onClinicChange(clinicId: string): void {
    if (!clinicId) {
      return;
    }

    // In edit mode, don't trigger field changes when clinic changes
    // (clinic field is disabled in edit mode anyway)
    if (this.isEditing) {
      return;
    }

    // Find the selected clinic
    const selectedClinic = this.clinics.find(clinic => clinic.id === clinicId);

    if (!selectedClinic) {
      return;
    }

    if (selectedClinic.is_external) {
      // Clear fields that will be disabled for external clinics
      this.clearFieldsForExternalClinic();
      // External clinic: enable only first_name, last_name, special_price
      this.enableFieldsForExternalClinic();
    } else {
      // Internal clinic: enable all fields and make them required
      this.enableAllFieldsForInternalClinic();
    }

    // Update progenitor fields state based on minor status
    this.updateProgenitorFieldsState();
  }

  /**
   * Apply field restrictions when editing a patient from an external clinic
   */
  private applyFieldRestrictionsForEditMode(): void {
    if (!this.patient || !this.patient.clinic_id) {
      return;
    }

    // Find the patient's clinic
    const patientClinic = this.clinics.find(clinic => {
      if (!clinic.id) return false;
      return clinic.id.toString() === this.patient!.clinic_id.toString();
    });

    if (!patientClinic) {
      return;
    }

    // Always disable clinic_id in edit mode
    this.patientForm.get('clinic_id')?.disable();

    if (patientClinic.is_external) {
      // External clinic in edit mode: disable all fields except first_name, last_name, special_price
      this.applyExternalClinicEditRestrictions();
      // Update progenitor fields state based on minor status
      this.updateProgenitorFieldsState();
    } else {
      // Internal clinic in edit mode: enable all fields except clinic_id
      this.enableAllFieldsForInternalClinicEditMode();
      // Update progenitor fields state based on minor status
      this.updateProgenitorFieldsState();
    }
  }

  /**
   * Apply restrictions for editing a patient from an external clinic
   */
  private applyExternalClinicEditRestrictions(): void {
    // Disable all fields except basic info, special_price, and progenitor fields (handled separately)
    const fieldsToDisable = [
      'email', 'phone', 'dni', 'birth_date', 'gender', 'occupation',
      'street', 'street_number', 'door', 'postal_code', 'city', 'province',
      'treatment_start_date', 'status', 'clinic_id'
    ];

    fieldsToDisable.forEach(fieldName => {
      this.patientForm.get(fieldName)?.disable();
    });

    // Enable only first_name, last_name, and special_price
    this.patientForm.get('first_name')?.enable();
    this.patientForm.get('last_name')?.enable();
    this.patientForm.get('special_price')?.enable();

    // Ensure these fields have proper validators
    this.patientForm.get('first_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('last_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('special_price')?.setValidators([Validators.min(0)]);

    this.patientForm.get('first_name')?.updateValueAndValidity();
    this.patientForm.get('last_name')?.updateValueAndValidity();
    this.patientForm.get('special_price')?.updateValueAndValidity();

    // Note: Progenitor fields will be handled by updateProgenitorFieldsState()
  }

  /**
   * Enable only specific fields for external clinics
   */
  private enableFieldsForExternalClinic(): void {
    // Disable all fields first
    this.disableAllFieldsExceptClinic();

    // Enable only first_name, last_name, and special_price
    const fieldsToEnable = ['first_name', 'last_name', 'special_price'];
    fieldsToEnable.forEach(fieldName => {
      const control = this.patientForm.get(fieldName);
      control?.enable();
    });

    // Update validators: only first_name, last_name are required
    this.patientForm.get('first_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('last_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('special_price')?.setValidators([Validators.min(0)]);

    // Clear validators for other fields
    const fieldsToCleanValidators = [
      'email', 'phone', 'dni', 'birth_date', 'gender', 'street',
      'street_number', 'postal_code', 'city', 'province',
      'treatment_start_date', 'status'
    ];
    fieldsToCleanValidators.forEach(fieldName => {
      this.patientForm.get(fieldName)?.clearValidators();
      this.patientForm.get(fieldName)?.updateValueAndValidity();
    });

    this.patientForm.get('first_name')?.updateValueAndValidity();
    this.patientForm.get('last_name')?.updateValueAndValidity();
    this.patientForm.get('special_price')?.updateValueAndValidity();
  }

  /**
   * Enable all fields for internal clinics and make them required
   */
  private enableAllFieldsForInternalClinic(): void {
    // Enable all main fields
    const allFields = [
      'first_name', 'last_name', 'email', 'phone', 'dni', 'birth_date',
      'gender', 'occupation', 'street', 'street_number', 'door',
      'postal_code', 'city', 'province', 'treatment_start_date',
      'status', 'special_price'
    ];

    allFields.forEach(fieldName => {
      this.patientForm.get(fieldName)?.enable();
    });

    // Re-apply original validators for required fields
    this.patientForm.get('first_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('last_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.patientForm.get('phone')?.setValidators([Validators.required, phoneValidator()]);
    this.patientForm.get('dni')?.setValidators([Validators.required, dniValidator()]);
    this.patientForm.get('birth_date')?.setValidators([Validators.required, birthDateValidator()]);
    this.patientForm.get('gender')?.setValidators([Validators.required]);
    this.patientForm.get('street')?.setValidators([Validators.required]);
    this.patientForm.get('street_number')?.setValidators([Validators.required]);
    this.patientForm.get('postal_code')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{5}$/)]);
    this.patientForm.get('city')?.setValidators([Validators.required]);
    this.patientForm.get('province')?.setValidators([Validators.required]);
    this.patientForm.get('treatment_start_date')?.setValidators([Validators.required, treatmentDateValidator()]);
    this.patientForm.get('status')?.setValidators([Validators.required]);
    this.patientForm.get('special_price')?.setValidators([Validators.required, Validators.min(0)]);

    // Update validity for all fields
    allFields.forEach(fieldName => {
      this.patientForm.get(fieldName)?.updateValueAndValidity();
    });
  }

  /**
   * Enable all fields for internal clinics in edit mode (except clinic_id)
   */
  private enableAllFieldsForInternalClinicEditMode(): void {
    // Enable all main fields (clinic_id is already disabled)
    const allFields = [
      'first_name', 'last_name', 'email', 'phone', 'dni', 'birth_date',
      'gender', 'occupation', 'street', 'street_number', 'door',
      'postal_code', 'city', 'province', 'treatment_start_date',
      'status', 'special_price'
    ];

    allFields.forEach(fieldName => {
      this.patientForm.get(fieldName)?.enable();
    });

    // Re-apply original validators for required fields
    this.patientForm.get('first_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('last_name')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.patientForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.patientForm.get('phone')?.setValidators([Validators.required, phoneValidator()]);
    this.patientForm.get('dni')?.setValidators([Validators.required, dniValidator()]);
    this.patientForm.get('birth_date')?.setValidators([Validators.required, birthDateValidator()]);
    this.patientForm.get('gender')?.setValidators([Validators.required]);
    this.patientForm.get('street')?.setValidators([Validators.required]);
    this.patientForm.get('street_number')?.setValidators([Validators.required]);
    this.patientForm.get('postal_code')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{5}$/)]);
    this.patientForm.get('city')?.setValidators([Validators.required]);
    this.patientForm.get('province')?.setValidators([Validators.required]);
    this.patientForm.get('treatment_start_date')?.setValidators([Validators.required, treatmentDateValidator()]);
    this.patientForm.get('status')?.setValidators([Validators.required]);
    this.patientForm.get('special_price')?.setValidators([Validators.required, Validators.min(0)]);

    // Update validity for all fields
    allFields.forEach(fieldName => {
      this.patientForm.get(fieldName)?.updateValueAndValidity();
    });
  }

}
