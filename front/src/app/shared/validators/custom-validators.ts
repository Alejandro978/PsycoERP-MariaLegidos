import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de DNI español
 * Valida que el DNI tenga 8 dígitos y una letra válida calculada correctamente
 */
export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, lo maneja el validador required
    }

    // Eliminar espacios y convertir a mayúsculas
    const dni = value.toString().trim().toUpperCase();

    // Patrón: 8 dígitos seguidos de una letra
    const dniPattern = /^[0-9]{8}[A-Z]$/;

    if (!dniPattern.test(dni)) {
      return { invalidDniFormat: true };
    }

    // Validar que la letra sea correcta
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(dni.substring(0, 8), 10);
    const letter = dni.charAt(8);
    const expectedLetter = letters.charAt(number % 23);

    if (letter !== expectedLetter) {
      return { invalidDniLetter: { expected: expectedLetter, actual: letter } };
    }

    return null;
  };
}

/**
 * Validador de teléfono español
 * Valida que el teléfono tenga exactamente 9 dígitos sin espacios
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, lo maneja el validador required
    }

    // Eliminar espacios, guiones y paréntesis
    const phone = value.toString().replace(/[\s\-\(\)\+]/g, '');

    // Patrón: exactamente 9 dígitos
    const phonePattern = /^[0-9]{9}$/;

    if (!phonePattern.test(phone)) {
      return { invalidPhone: true };
    }

    // Validar que empiece con 6, 7, 8 o 9 (números válidos en España)
    const firstDigit = phone.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { invalidPhonePrefix: true };
    }

    return null;
  };
}

/**
 * Validador de edad basado en fecha de nacimiento
 * Valida que la edad esté entre 0 y el máximo especificado
 */
export function ageRangeValidator(minAge: number = 0, maxAge: number = 100): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, lo maneja el validador required
    }

    const birthDate = new Date(value);
    const today = new Date();

    // Validar que la fecha sea válida
    if (isNaN(birthDate.getTime())) {
      return { invalidDate: true };
    }

    // Validar que no sea una fecha futura
    if (birthDate > today) {
      return { futureDate: true };
    }

    // Calcular edad
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    // Validar rango de edad
    if (age < minAge) {
      return { ageTooYoung: { minAge, actualAge: age } };
    }

    if (age > maxAge) {
      return { ageTooOld: { maxAge, actualAge: age } };
    }

    return null;
  };
}

/**
 * Validador de fecha de inicio de tratamiento
 * Valida que la fecha no esté más de X años en el pasado o futuro
 */
export function treatmentDateValidator(maxYearsInPast: number = 100, maxYearsInFuture: number = 100): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, lo maneja el validador required
    }

    const treatmentDate = new Date(value);
    const today = new Date();

    // Validar que la fecha sea válida
    if (isNaN(treatmentDate.getTime())) {
      return { invalidDate: true };
    }

    // Calcular límites
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - maxYearsInPast);

    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() + maxYearsInFuture);

    // Validar que no sea demasiado antigua
    if (treatmentDate < minDate) {
      return { dateTooOld: { maxYears: maxYearsInPast } };
    }

    // Validar que no sea demasiado futura
    if (treatmentDate > maxDate) {
      return { dateTooFuture: { maxYears: maxYearsInFuture } };
    }

    return null;
  };
}
