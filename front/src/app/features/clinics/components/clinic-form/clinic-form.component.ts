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
      is_external: [false],
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
      this.handleOnlineChange(isOnline);
    });

    // Escuchar cambios en el checkbox is_external
    this.clinicaForm.get('is_external')?.valueChanges.subscribe(isExternal => {
      this.handleExternalChange(isExternal);
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
      // Determinar si es online basándose en si tiene dirección y no es externa
      const isExternal = this.clinica.is_external || false;
      const isOnline = !isExternal && (!this.clinica.address || this.clinica.address.trim() === '');

      this.clinicaForm.patchValue({
        name: this.clinica.name,
        clinic_color: this.clinica.clinic_color,
        is_online: isOnline,
        is_external: isExternal,
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
      this.updateAddressValidation(isOnline, isExternal);

      // Si es externa, forzar is_billable a true y deshabilitar el checkbox
      if (isExternal) {
        this.clinicaForm.get('is_billable')?.setValue(true);
        this.clinicaForm.get('is_billable')?.disable();
      }

      const isBillable = isExternal ? true : (this.clinica.is_billable || false);
      this.updateCifValidation(isBillable);
      this.updateFiscalNameValidation(isBillable);
      this.updateInvoiceAddressValidation(isBillable);
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.clinicaForm.reset({
      name: '',
      clinic_color: '#3b82f6',
      is_online: false,
      is_external: false,
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
    this.updateAddressValidation(false, false);
    this.updateCifValidation(false);
    this.updateFiscalNameValidation(false);
    this.updateInvoiceAddressValidation(false);

    // Habilitar el checkbox de facturable al resetear
    this.clinicaForm.get('is_billable')?.enable();
  }

  private handleOnlineChange(isOnline: boolean): void {
    if (isOnline) {
      // Si se marca como online, desmarcar is_external
      this.clinicaForm.get('is_external')?.setValue(false, { emitEvent: false });
      // Deshabilitar y limpiar address
      this.disableAndClearAddress();
      // Habilitar el checkbox de facturable (ya que no es externa)
      this.clinicaForm.get('is_billable')?.enable();
    } else {
      // Si se desmarca online, habilitar address solo si is_external tampoco está marcado
      const isExternal = this.clinicaForm.get('is_external')?.value;
      if (!isExternal) {
        this.enableAddress();
      }
    }
  }

  private handleExternalChange(isExternal: boolean): void {
    if (isExternal) {
      // Si se marca como externa, desmarcar is_online
      this.clinicaForm.get('is_online')?.setValue(false, { emitEvent: false });
      // Deshabilitar y limpiar address
      this.disableAndClearAddress();
      // Marcar automáticamente como facturable y deshabilitar el checkbox
      this.clinicaForm.get('is_billable')?.setValue(true);
      this.clinicaForm.get('is_billable')?.disable();
    } else {
      // Si se desmarca externa, habilitar address solo si is_online tampoco está marcado
      const isOnline = this.clinicaForm.get('is_online')?.value;
      if (!isOnline) {
        this.enableAddress();
      }
      // Habilitar el checkbox de facturable
      this.clinicaForm.get('is_billable')?.enable();
    }
  }

  private disableAndClearAddress(): void {
    const addressControl = this.clinicaForm.get('address');
    addressControl?.clearValidators();
    addressControl?.setValue('');
    addressControl?.disable();
    addressControl?.updateValueAndValidity();
  }

  private enableAddress(): void {
    const addressControl = this.clinicaForm.get('address');
    addressControl?.setValidators([Validators.required, Validators.minLength(5)]);
    addressControl?.enable();
    addressControl?.updateValueAndValidity();
  }

  private updateAddressValidation(isOnline: boolean, isExternal: boolean = false): void {
    if (isOnline || isExternal) {
      this.disableAndClearAddress();
    } else {
      this.enableAddress();
    }
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

      // Asegurar que is_external sea boolean (false si no está marcado)
      formData.is_external = formData.is_external ?? false;

      // Si es online o externa, asegurar que address esté vacío
      if (this.clinicaForm.get('is_online')?.value || formData.is_external) {
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
      is_external: 'Clínica externa',
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
