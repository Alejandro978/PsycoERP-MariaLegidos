import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
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
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../shared/models/patient.model';
import { Clinic } from '../../../clinics/models/clinic.model';
import { ClinicSelectorComponent } from '../../../../shared/components/clinic-selector';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';

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
export class PatientFormComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() patient: Patient | null = null;
  @Input() clinics: Clinic[] = [];

  @Output() onSave = new EventEmitter<Patient>();
  @Output() onCancel = new EventEmitter<void>();

  patientForm!: FormGroup;

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
      phone: ['', [Validators.required, Validators.minLength(9)]],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      birth_date: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      occupation: ['', [Validators.required]],

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
      treatment_start_date: ['', [Validators.required]],
      status: ['en curso', [Validators.required]],

      // Campos automáticos
      is_minor: [false],
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
        is_minor: this.patient.is_minor || false,
      });
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
      is_minor: false,
    });
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

  handleSubmit(): void {
    if (this.patientForm.valid) {
      const formData = this.patientForm.value;

      if (this.isEditing && this.patient) {
        const updatedPatient: Patient = {
          ...this.patient,
          ...formData,
        };
        this.onSave.emit(updatedPatient);
      } else {
        // Para crear nuevo paciente, no incluir el id
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
    };
    return labels[fieldName] || fieldName;
  }

}
