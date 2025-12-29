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
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Clinic } from '../../models/clinic.model';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-clinica-form',
  standalone: true,
  templateUrl: './clinic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ReusableModalComponent, FormInputComponent],
})
export class ClinicFormComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() clinica: Clinic | null = null;

  @Output() onSave = new EventEmitter<Clinic>();
  @Output() onCancel = new EventEmitter<void>();

  clinicaForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clinica'] || changes['isOpen']) {
      if (this.isOpen) {
        this.populateForm();
      } else {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.clinicaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      clinic_color: ['#3b82f6', [Validators.required]],
      is_online: [false],
      address: ['', [Validators.required, Validators.minLength(5)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      is_billable: [false],
      cif: [''],
      fiscal_name: [''],
      billing_address: [''],
      status: ['active'],
    });

    // Escuchar cambios en el checkbox is_online
    this.clinicaForm.get('is_online')?.valueChanges.subscribe(isOnline => {
      this.updateAddressValidation(isOnline);
    });

    // Escuchar cambios en el checkbox is_billable
    this.clinicaForm.get('is_billable')?.valueChanges.subscribe(isBillable => {
      this.updateCifValidation(isBillable);
      this.updateFiscalNameValidation(isBillable);
      this.updateInvoiceAddressValidation(isBillable);
    });
  }

  private populateForm(): void {
    if (this.clinica) {
      // Determinar si es online basándose en si tiene dirección
      const isOnline = !this.clinica.address || this.clinica.address.trim() === '';

      this.clinicaForm.patchValue({
        name: this.clinica.name,
        clinic_color: this.clinica.clinic_color,
        is_online: isOnline,
        address: this.clinica.address || '',
        price: this.clinica.price || 0,
        percentage: this.clinica.percentage || 0,
        is_billable: this.clinica.is_billable || false,
        cif: this.clinica.cif || '',
        fiscal_name: this.clinica.fiscal_name || '',
        billing_address: this.clinica.billing_address || '',
        status: 'active',
      });

      // Aplicar la lógica de validación después de poblar el formulario
      this.updateAddressValidation(isOnline);
      this.updateCifValidation(this.clinica.is_billable || false);
      this.updateFiscalNameValidation(this.clinica.is_billable || false);
      this.updateInvoiceAddressValidation(this.clinica.is_billable || false);
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.clinicaForm.reset({
      name: '',
      clinic_color: '#3b82f6',
      is_online: false,
      address: '',
      price: 0,
      percentage: 0,
      is_billable: false,
      cif: '',
      fiscal_name: '',
      billing_address: '',
      status: 'active',
    });

    // Asegurar que las validaciones están correctas al resetear
    this.updateAddressValidation(false);
    this.updateCifValidation(false);
    this.updateFiscalNameValidation(false);
    this.updateInvoiceAddressValidation(false);
  }

  private updateAddressValidation(isOnline: boolean): void {
    const addressControl = this.clinicaForm.get('address');

    if (isOnline) {
      // Si es online, eliminar validaciones y limpiar el valor
      addressControl?.clearValidators();
      addressControl?.setValue('');
      addressControl?.disable();
    } else {
      // Si no es online, añadir validaciones requeridas
      addressControl?.setValidators([Validators.required, Validators.minLength(5)]);
      addressControl?.enable();
    }

    addressControl?.updateValueAndValidity();
  }

  private updateCifValidation(isBillable: boolean): void {
    const cifControl = this.clinicaForm.get('cif');

    if (isBillable) {
      // Si es facturable, el CIF es requerido y habilitado
      cifControl?.setValidators([Validators.required, Validators.minLength(9)]);
      cifControl?.enable();
    } else {
      // Si no es facturable, deshabilitar y quitar validaciones
      cifControl?.clearValidators();
      cifControl?.setValue('');
      cifControl?.disable();
    }

    cifControl?.updateValueAndValidity();
  }

  private updateFiscalNameValidation(isBillable: boolean): void {
    const fiscalNameControl = this.clinicaForm.get('fiscal_name');

    if (isBillable) {
      // Si es facturable, el nombre fiscal es requerido y habilitado
      fiscalNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      fiscalNameControl?.enable();
    } else {
      // Si no es facturable, deshabilitar y quitar validaciones
      fiscalNameControl?.clearValidators();
      fiscalNameControl?.setValue('');
      fiscalNameControl?.disable();
    }

    fiscalNameControl?.updateValueAndValidity();
  }

  private updateInvoiceAddressValidation(isBillable: boolean): void {
    const invoiceAddressControl = this.clinicaForm.get('billing_address');

    if (isBillable) {
      // Si es facturable, la dirección de facturación es requerida y habilitada
      invoiceAddressControl?.setValidators([Validators.required, Validators.minLength(5)]);
      invoiceAddressControl?.enable();
    } else {
      // Si no es facturable, deshabilitar y quitar validaciones
      invoiceAddressControl?.clearValidators();
      invoiceAddressControl?.setValue('');
      invoiceAddressControl?.disable();
    }

    invoiceAddressControl?.updateValueAndValidity();
  }

  get isEditing(): boolean {
    return this.clinica !== null;
  }

  get title(): string {
    return this.isEditing ? 'Editar Clínica' : 'Crear nueva Clínica';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Actualizar Clínica' : 'Crear Clínica';
  }

  get isFormValid(): boolean {
    return this.clinicaForm.valid;
  }

  handleSubmit(): void {
    if (this.clinicaForm.valid) {
      const formData = { ...this.clinicaForm.getRawValue() };

      // Excluir is_online del envío ya que no se almacena en BD
      delete formData.is_online;

      // Si es online, asegurar que address esté vacío
      if (this.clinicaForm.get('is_online')?.value) {
        formData.address = '';
      }

      // Si no es facturable, asegurar que cif, fiscal_name e billing_address estén vacíos
      if (!formData.is_billable) {
        formData.cif = '';
        formData.fiscal_name = '';
        formData.billing_address = '';
      }

      if (this.isEditing && this.clinica) {
        const updatedClinic: Clinic = {
          ...this.clinica,
          ...formData,
        };
        this.onSave.emit(updatedClinic);
      } else {
        this.onSave.emit(formData);
      }
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.clinicaForm.get(fieldName);
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
      if (field.errors?.['min']) {
        const minValue = field.errors['min'].min;
        return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${minValue}`;
      }
      if (field.errors?.['max']) {
        const maxValue = field.errors['max'].max;
        return `${this.getFieldLabel(fieldName)} debe ser menor o igual a ${maxValue}`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre de la clínica',
      clinic_color: 'Color identificativo',
      is_online: 'Clínica online',
      address: 'Dirección',
      price: 'Precio por sesión',
      percentage: 'Porcentaje de comisión',
      is_billable: 'Es facturable',
      cif: 'CIF',
      fiscal_name: 'Nombre fiscal',
      billing_address: 'Dirección de facturación',
    };
    return labels[fieldName] || fieldName;
  }
}
