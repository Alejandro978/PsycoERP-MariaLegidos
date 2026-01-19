import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PatientRegisterService } from './services/patient-register.service';
import { PatientRegistration } from './models/patient-register.model';
import {
  dniValidator,
  phoneValidator,
  birthDateValidator,
} from '../../shared/validators/custom-validators';

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRegisterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private registerService = inject(PatientRegisterService);
  private fb = inject(FormBuilder);

  // State signals
  token = '';
  isValidToken = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  expiresAt = signal('');

  // Form
  registerForm = this.createForm();

  // Signal derivado del valor de birth_date del formulario
  private birthDateValue = toSignal(
    this.registerForm.get('birth_date')!.valueChanges,
    { initialValue: '' }
  );

  // Signal derivado de los valores de progenitor 2
  private progenitor2Values = toSignal(
    this.registerForm.valueChanges,
    { initialValue: this.registerForm.value }
  );

  /**
   * Computed: calcula la edad basándose en la fecha de nacimiento
   */
  calculatedAge = computed(() => {
    const birthDate = this.birthDateValue();
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
  });

  /**
   * Computed: determina si el paciente es menor de edad
   */
  isMinor = computed(() => {
    const age = this.calculatedAge();
    return age > 0 && age < 18;
  });

  /**
   * Computed: verifica si algún campo de progenitor 2 tiene valor
   */
  private hasProgenitor2Data = computed(() => {
    const values = this.progenitor2Values();
    const fullName = values?.progenitor2_full_name?.trim() || '';
    const dni = values?.progenitor2_dni?.trim() || '';
    const phone = values?.progenitor2_phone?.trim() || '';
    return !!(fullName || dni || phone);
  });

  // Gender options
  genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  constructor() {
    // Effect: actualiza validadores cuando cambia isMinor
    effect(() => {
      const isMinorValue = this.isMinor();
      this.updateProgenitorValidators(isMinorValue);
    });

    // Effect: actualiza validadores de progenitor 2 cuando cambian sus valores
    effect(() => {
      const hasData = this.hasProgenitor2Data();
      const isMinorValue = this.isMinor();
      if (isMinorValue) {
        this.updateProgenitor2Validators(hasData);
      }
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage.set('Token de invitacion no valido');
      this.isLoading.set(false);
      return;
    }

    this.validateToken();
  }

  /**
   * Crea el formulario reactivo con todos los campos
   */
  private createForm(): FormGroup {
    return this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator()]],
      dni: ['', [Validators.required, dniValidator()]],
      birth_date: ['', [Validators.required, birthDateValidator()]],
      gender: ['', [Validators.required]],
      occupation: [''],
      street: ['', [Validators.required]],
      street_number: ['', [Validators.required]],
      door: [''],
      postal_code: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{5}$/)],
      ],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],
      // Campos de progenitores (validación condicional si es menor)
      progenitor1_full_name: [''],
      progenitor1_dni: [''],
      progenitor1_phone: [''],
      progenitor2_full_name: [''],
      progenitor2_dni: [''],
      progenitor2_phone: [''],
    });
  }

  private validateToken(): void {
    this.registerService.validateToken(this.token).subscribe({
      next: (response) => {
        if (response.valid) {
          this.isValidToken.set(true);
          this.expiresAt.set(response.expires_at);
        } else {
          this.errorMessage.set(
            'El enlace de invitacion ha expirado o no es valido'
          );
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error validating token:', error);
        this.errorMessage.set('Error al validar el enlace de invitacion');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Actualiza validadores de progenitor 1 según si es menor de edad
   */
  private updateProgenitorValidators(isMinorValue: boolean): void {
    const progenitor1FullName = this.registerForm.get('progenitor1_full_name');
    const progenitor1Dni = this.registerForm.get('progenitor1_dni');
    const progenitor1Phone = this.registerForm.get('progenitor1_phone');

    if (isMinorValue) {
      // Progenitor 1 es obligatorio para menores
      progenitor1FullName?.setValidators([Validators.required, Validators.minLength(2)]);
      progenitor1Dni?.setValidators([Validators.required, dniValidator()]);
      progenitor1Phone?.setValidators([Validators.required, phoneValidator()]);
    } else {
      // Limpiar validadores y valores si no es menor
      progenitor1FullName?.clearValidators();
      progenitor1Dni?.clearValidators();
      progenitor1Phone?.clearValidators();

      progenitor1FullName?.setValue('', { emitEvent: false });
      progenitor1Dni?.setValue('', { emitEvent: false });
      progenitor1Phone?.setValue('', { emitEvent: false });

      // Limpiar también progenitor 2
      this.clearProgenitor2Fields();
    }

    progenitor1FullName?.updateValueAndValidity({ emitEvent: false });
    progenitor1Dni?.updateValueAndValidity({ emitEvent: false });
    progenitor1Phone?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Actualiza validadores de progenitor 2 condicionalmente
   * Si algún campo tiene valor, todos se vuelven obligatorios
   */
  private updateProgenitor2Validators(hasAnyValue: boolean): void {
    const progenitor2FullName = this.registerForm.get('progenitor2_full_name');
    const progenitor2Dni = this.registerForm.get('progenitor2_dni');
    const progenitor2Phone = this.registerForm.get('progenitor2_phone');

    if (hasAnyValue) {
      // Si algún campo tiene valor, todos son obligatorios
      progenitor2FullName?.setValidators([Validators.required, Validators.minLength(2)]);
      progenitor2Dni?.setValidators([Validators.required, dniValidator()]);
      progenitor2Phone?.setValidators([Validators.required, phoneValidator()]);
    } else {
      // Si todos están vacíos, quitar validadores
      progenitor2FullName?.clearValidators();
      progenitor2Dni?.clearValidators();
      progenitor2Phone?.clearValidators();
    }

    progenitor2FullName?.updateValueAndValidity({ emitEvent: false });
    progenitor2Dni?.updateValueAndValidity({ emitEvent: false });
    progenitor2Phone?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Limpia los campos de progenitor 2
   */
  private clearProgenitor2Fields(): void {
    const progenitor2FullName = this.registerForm.get('progenitor2_full_name');
    const progenitor2Dni = this.registerForm.get('progenitor2_dni');
    const progenitor2Phone = this.registerForm.get('progenitor2_phone');

    progenitor2FullName?.clearValidators();
    progenitor2Dni?.clearValidators();
    progenitor2Phone?.clearValidators();

    progenitor2FullName?.setValue('', { emitEvent: false });
    progenitor2Dni?.setValue('', { emitEvent: false });
    progenitor2Phone?.setValue('', { emitEvent: false });

    progenitor2FullName?.updateValueAndValidity({ emitEvent: false });
    progenitor2Dni?.updateValueAndValidity({ emitEvent: false });
    progenitor2Phone?.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formData: PatientRegistration = {
      ...this.registerForm.value,
      // Clean phone and DNI
      phone: this.registerForm.value.phone
        .toString()
        .replace(/\s+/g, '')
        .trim(),
      dni: this.registerForm.value.dni
        .toString()
        .replace(/\s+/g, '')
        .trim()
        .toUpperCase(),
    };

    // Clean progenitor data if minor
    if (this.isMinor()) {
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
    } else {
      // Remove progenitor fields if not minor
      delete formData.progenitor1_full_name;
      delete formData.progenitor1_dni;
      delete formData.progenitor1_phone;
      delete formData.progenitor2_full_name;
      delete formData.progenitor2_dni;
      delete formData.progenitor2_phone;
    }

    this.registerService.registerPatient(this.token, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set(
            'Registro completado exitosamente. La psicologa se pondra en contacto contigo pronto.'
          );
          this.isValidToken.set(false);
        }
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error registering patient:', error);
        this.errorMessage.set(
          'Error al completar el registro. Por favor, intenta nuevamente.'
        );
        this.isSubmitting.set(false);
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors?.['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${minLength} caracteres`;
      }
      if (field.errors?.['email']) {
        return 'Ingrese un email valido';
      }
      if (field.errors?.['invalidDniFormat']) {
        return 'El DNI debe tener 8 digitos seguidos de una letra (ej: 12345678A)';
      }
      if (field.errors?.['invalidDniLetter']) {
        const error = field.errors['invalidDniLetter'];
        return `La letra del DNI no es valida. Deberia ser ${error.expected} en lugar de ${error.actual}`;
      }
      if (field.errors?.['invalidPhone']) {
        return 'El telefono debe tener exactamente 9 digitos sin espacios (ej: 666123456)';
      }
      if (field.errors?.['invalidPhonePrefix']) {
        return 'El telefono debe comenzar con 6, 7, 8 o 9';
      }
      if (field.errors?.['futureBirthDate']) {
        return 'La fecha de nacimiento no puede ser futura';
      }
      if (field.errors?.['tooOld']) {
        return 'La edad no puede superar los 100 anos';
      }
      if (field.errors?.['pattern']) {
        if (fieldName === 'postal_code') {
          return 'El codigo postal debe tener 5 digitos';
        }
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      first_name: 'Nombre',
      last_name: 'Apellidos',
      email: 'Email',
      phone: 'Telefono',
      dni: 'DNI',
      birth_date: 'Fecha de nacimiento',
      gender: 'Genero',
      occupation: 'Ocupacion',
      street: 'Calle',
      street_number: 'Numero',
      door: 'Puerta',
      postal_code: 'Codigo postal',
      city: 'Ciudad',
      province: 'Provincia',
      progenitor1_full_name: 'Nombre completo (Progenitor 1)',
      progenitor1_dni: 'DNI (Progenitor 1)',
      progenitor1_phone: 'Telefono (Progenitor 1)',
      progenitor2_full_name: 'Nombre completo (Progenitor 2)',
      progenitor2_dni: 'DNI (Progenitor 2)',
      progenitor2_phone: 'Telefono (Progenitor 2)',
    };
    return labels[fieldName] || fieldName;
  }
}
