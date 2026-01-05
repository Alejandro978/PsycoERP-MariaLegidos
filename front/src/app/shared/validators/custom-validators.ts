import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para DNI español
 * Verifica formato (8 dígitos + letra) y letra de control válida
 */
export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // No validar si está vacío (usar Validators.required por separado)
    }

    // Limpiar espacios y convertir a mayúsculas
    const dni = value.toString().trim().toUpperCase();

    // Verificar formato: 8 dígitos + 1 letra
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    if (!dniRegex.test(dni)) {
      return { invalidDniFormat: true };
    }

    // Verificar letra de control
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
 * Validador para teléfono español
 * Verifica que sean exactamente 9 dígitos sin espacios
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const phoneStr = value.toString().trim();

    // Verificar que no contenga espacios
    if (/\s/.test(phoneStr)) {
      return { phoneContainsSpaces: true };
    }

    // Eliminar guiones y el prefijo +34 si existe para validación
    const cleanPhone = phoneStr
      .replace(/-/g, '')
      .replace(/^\+34/, '');

    // Verificar que sean exactamente 9 dígitos
    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return { invalidPhone: true };
    }

    // Verificar que comience con 6, 7, 8 o 9 (prefijos válidos en España)
    const firstDigit = cleanPhone.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { invalidPhonePrefix: true };
    }

    return null;
  };
}

/**
 * Validador para fecha de nacimiento
 * Verifica que la persona no tenga más de 100 años
 */
export function birthDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const birthDate = new Date(value);
    const today = new Date();

    // Verificar que la fecha no sea en el futuro
    if (birthDate > today) {
      return { futureBirthDate: true };
    }

    // Calcular edad
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

    // Verificar que no tenga más de 100 años
    if (actualAge > 100) {
      return { tooOld: { age: actualAge } };
    }

    return null;
  };
}

/**
 * Validador para fecha de inicio de tratamiento
 * Verifica que la fecha no supere los 100 años hacia adelante o atrás
 */
export function treatmentDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const treatmentDate = new Date(value);
    const today = new Date();

    // Calcular diferencia en años
    const yearDiff = treatmentDate.getFullYear() - today.getFullYear();

    // Verificar que no supere los 100 años hacia adelante
    if (yearDiff > 100) {
      return { treatmentDateTooFarFuture: { years: yearDiff } };
    }

    // Verificar que no supere los 100 años hacia atrás
    if (yearDiff < -100) {
      return { treatmentDateTooFarPast: { years: Math.abs(yearDiff) } };
    }

    return null;
  };
}
