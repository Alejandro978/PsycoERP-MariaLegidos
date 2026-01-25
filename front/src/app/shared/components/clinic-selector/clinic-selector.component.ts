import {
  Component,
  Input,
  signal,
  computed,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Clinic } from '../../../features/clinics/models/clinic.model';

@Component({
  selector: 'app-clinic-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clinic-selector.component.html',
  viewProviders: [],
})
export class ClinicSelectorComponent {
  @ViewChild('modalSearchInput') modalSearchInput!: ElementRef<HTMLInputElement>;

  // Inputs
  @Input() control!: FormControl<string | number | number[] | null>;
  @Input() clinics: Clinic[] = [];
  @Input() placeholder: string = 'Seleccionar clínica...';
  @Input() label: string = 'Clínica';
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;

  // Internal signals
  private searchTerm = signal<string>('');
  private isModalOpen = signal<boolean>(false);
  protected focusedIndex = signal<number>(-1);

  // Computed signals
  filteredClinics = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clinics;

    return this.clinics.filter((clinic) =>
      clinic.name.toLowerCase().includes(term)
    );
  });

  // Get selected clinics for multiple mode
  get selectedClinics(): Clinic[] {
    if (!this.multiple) return [];
    const ids = this.control?.value as number[] || [];
    return this.clinics.filter(c => c.id && ids.includes(Number(c.id)));
  }

  // Check if all clinics are selected
  get allSelected(): boolean {
    if (!this.multiple) return false;
    const selectedIds = this.control?.value as number[] || [];
    return selectedIds.length === this.clinics.length && this.clinics.length > 0;
  }

  // Use a getter instead of computed for better control value tracking
  get selectedClinic(): Clinic | null {
    if (this.multiple) return null;

    const selectedId = this.control?.value;

    // Handle empty string, null, undefined, or array
    if (!selectedId || selectedId === '' || Array.isArray(selectedId)) {
      return null;
    }

    // Handle both string and number IDs
    const foundClinic = this.clinics.find((clinic) => {
      if (!clinic.id) return false;

      // Convert both to strings for comparison
      const clinicIdStr = clinic.id.toString();
      const selectedIdStr = selectedId.toString();

      return clinicIdStr === selectedIdStr;
    });

    return foundClinic || null;
  }

  // Get display text for the selector
  get displayText(): string {
    if (this.multiple) {
      const selected = this.selectedClinics;
      if (selected.length === 0) return this.placeholder;
      if (selected.length === 1) return selected[0].name;
      return `${selected.length} clínicas seleccionadas`;
    }
    return this.selectedClinic ? this.selectedClinic.name : this.placeholder;
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.focusedIndex.set(-1);
  }

  selectClinic(clinic: Clinic): void {
    if (this.multiple) {
      this.toggleClinic(Number(clinic.id));
      return;
    }

    // Single selection mode (original behavior)
    let clinicId: string | number | null = clinic.id || null;

    if (clinicId !== null && typeof clinicId === 'string') {
      const numericId = parseInt(clinicId, 10);
      if (!isNaN(numericId)) {
        clinicId = numericId;
      }
    }

    this.control.setValue(clinicId);
    this.control.markAsTouched();

    this.searchTerm.set('');
    this.closeModal();
    this.focusedIndex.set(-1);
  }

  // Toggle clinic selection in multiple mode
  toggleClinic(clinicId: number): void {
    if (!this.multiple) return;

    const currentIds = (this.control?.value as number[]) || [];
    const newIds = currentIds.includes(clinicId)
      ? currentIds.filter(id => id !== clinicId)
      : [...currentIds, clinicId];

    this.control?.setValue(newIds);
    this.control?.markAsTouched();
  }

  // Remove clinic from selection (for chips)
  removeClinic(clinicId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.multiple) return;

    const currentIds = (this.control?.value as number[]) || [];
    const newIds = currentIds.filter(id => id !== clinicId);
    this.control?.setValue(newIds);
    this.control?.markAsTouched();
  }

  // Toggle select all
  toggleSelectAll(): void {
    if (!this.multiple) return;

    if (this.allSelected) {
      this.control?.setValue([]);
    } else {
      const allIds = this.clinics.filter(c => c.id).map(c => Number(c.id));
      this.control?.setValue(allIds);
    }
    this.control?.markAsTouched();
  }

  clearSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.disabled) return;

    if (this.multiple) {
      this.control.setValue([]);
    } else {
      this.control.setValue(null);
    }
    this.control.markAsTouched();
    this.searchTerm.set('');
    this.focusedIndex.set(-1);
  }

  handleClearClick(event: Event): void {
    event.stopPropagation();
    this.clearSelection();
  }

  isClinicSelected(clinic: Clinic): boolean {
    if (this.multiple) {
      const selectedIds = (this.control?.value as number[]) || [];
      return clinic.id ? selectedIds.includes(Number(clinic.id)) : false;
    }

    const selectedId = this.control?.value;
    if (!selectedId || selectedId === '' || !clinic.id) return false;

    const clinicIdStr = clinic.id.toString();
    const selectedIdStr = selectedId.toString();

    return clinicIdStr === selectedIdStr;
  }

  openModal(): void {
    if (this.disabled) return;

    this.isModalOpen.set(true);
    this.searchTerm.set('');

    setTimeout(() => {
      if (this.modalSearchInput) {
        this.modalSearchInput.nativeElement.focus();
      }
    }, 100);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.searchTerm.set('');
    this.focusedIndex.set(-1);
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isModalOpen() && event.key === 'Enter') {
      event.preventDefault();
      this.openModal();
      return;
    }

    if (!this.isModalOpen()) return;

    const filteredClinics = this.filteredClinics();
    const currentIndex = this.focusedIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex =
          currentIndex < filteredClinics.length - 1 ? currentIndex + 1 : 0;
        this.focusedIndex.set(nextIndex);
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredClinics.length - 1;
        this.focusedIndex.set(prevIndex);
        break;

      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < filteredClinics.length) {
          this.selectClinic(filteredClinics[currentIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closeModal();
        break;

      case 'Tab':
        break;
    }
  }

  // Getters for template
  get searchTermValue(): string {
    return this.searchTerm();
  }

  get isModalOpenValue(): boolean {
    return this.isModalOpen();
  }

  get focusedIndexValue(): number {
    return this.focusedIndex();
  }

  get hasError(): boolean {
    return (
      (this.control?.invalid &&
        (this.control?.dirty || this.control?.touched)) ||
      false
    );
  }

  get errorMessage(): string | null {
    if (!this.hasError) return null;

    const errors = this.control?.errors;
    if (errors?.['required']) return 'Este campo es obligatorio';
    if (errors?.['invalidClinic'])
      return 'La clínica seleccionada no es válida';

    return 'Campo inválido';
  }

  get hasSelection(): boolean {
    if (this.multiple) {
      return this.selectedClinics.length > 0;
    }
    return this.selectedClinic !== null;
  }
}
