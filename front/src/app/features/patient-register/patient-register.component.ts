import {
  Component,
  OnInit,
  inject,
  signal,
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

  // State
  token = '';
  isValidToken = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  expiresAt = signal('');

  // Form
  registerForm!: FormGroup;

  // Gender options
  genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage.set('Token de invitacion no valido');
      this.isLoading.set(false);
      return;
    }

    this.validateToken();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
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
    };
    return labels[fieldName] || fieldName;
  }
}
