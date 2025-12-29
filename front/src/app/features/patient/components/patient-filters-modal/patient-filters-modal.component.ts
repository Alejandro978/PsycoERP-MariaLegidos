import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientFilters } from '../../../../shared/models/patient.model';
import { Clinic } from '../../../clinics/models/clinic.model';
import { ClinicSelectorComponent } from '../../../../shared/components/clinic-selector';

@Component({
  selector: 'app-patient-filters-modal',
  standalone: true,
  templateUrl: './patient-filters-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ClinicSelectorComponent],
})
export class PatientFiltersModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() currentFilters: PatientFilters = {};
  @Input() showInactiveTab: boolean = false; // Indica si estamos en el tab de inactivos
  @Input() clinics: Clinic[] = [];

  @Output() onApplyFilters = new EventEmitter<PatientFilters>();
  @Output() onClearFilters = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  filtersForm!: FormGroup;

  private fb = inject(FormBuilder);

  // Options for gender select
  protected genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  // Options for status select (only for inactive tab)
  protected statusOptions = [
    { value: 'en curso', label: 'En curso' },
    { value: 'fin del tratamiento', label: 'Fin del tratamiento' },
    { value: 'en pausa', label: 'En pausa' },
    { value: 'abandono', label: 'Abandono' },
    { value: 'derivación', label: 'Derivación' }
  ];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.populateForm();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      dni: [''],
      gender: [''],
      clinic_id: [''],
      status: [''],
    });
  }

  private populateForm(): void {
    if (this.currentFilters) {
      this.filtersForm.patchValue({
        first_name: this.currentFilters.first_name || '',
        last_name: this.currentFilters.last_name || '',
        email: this.currentFilters.email || '',
        dni: this.currentFilters.dni || '',
        gender: this.currentFilters.gender || '',
        clinic_id: this.currentFilters.clinic_id || '',
        status: this.currentFilters.status || '',
      });

    }
  }



  /**
   * Apply filters and close modal
   */
  handleApplyFilters(): void {
    const formValue = this.filtersForm.value;

    // Only include non-empty values
    const filters: PatientFilters = {};

    if (formValue.first_name?.trim()) {
      filters.first_name = formValue.first_name.trim();
    }

    if (formValue.last_name?.trim()) {
      filters.last_name = formValue.last_name.trim();
    }

    if (formValue.email?.trim()) {
      filters.email = formValue.email.trim();
    }

    if (formValue.dni?.trim()) {
      filters.dni = formValue.dni.trim();
    }

    if (formValue.gender) {
      filters.gender = formValue.gender;
    }

    if (formValue.clinic_id) {
      filters.clinic_id = formValue.clinic_id;
    }

    // Only include status filter if we're on inactive tab
    if (this.showInactiveTab && formValue.status) {
      filters.status = formValue.status;
    }

    this.onApplyFilters.emit(filters);
  }

  /**
   * Clear all filters and close modal
   */
  handleClearFilters(): void {
    this.filtersForm.reset({
      first_name: '',
      last_name: '',
      email: '',
      dni: '',
      gender: '',
      clinic_id: '',
      status: '',
    });


    this.onClearFilters.emit();
  }

  /**
   * Cancel and close modal
   */
  handleCancel(): void {
    this.onCancel.emit();
  }

  /**
   * Check if any filter has a value
   */
  get hasActiveFilters(): boolean {
    const formValue = this.filtersForm.value;
    return !!(
      formValue.first_name?.trim() ||
      formValue.last_name?.trim() ||
      formValue.email?.trim() ||
      formValue.dni?.trim() ||
      formValue.gender ||
      formValue.clinic_id ||
      (this.showInactiveTab && formValue.status)
    );
  }
}
