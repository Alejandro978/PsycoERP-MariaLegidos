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
  @Input() control!: FormControl<string | number | null>;
  @Input() clinics: Clinic[] = [];
  @Input() placeholder: string = 'Seleccionar clínica...';
  @Input() label: string = 'Clínica';
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'md' = 'md'; // 'sm' for smaller inputs (text-xs), 'md' for standard (text-sm)
  @Input() disabled: boolean = false;

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

  // Use a getter instead of computed for better control value tracking
  get selectedClinic(): Clinic | null {
    const selectedId = this.control?.value;

    // Handle empty string, null, undefined
    if (!selectedId || selectedId === '') {
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

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.focusedIndex.set(-1);
  }

  selectClinic(clinic: Clinic): void {
    // Convert to number if the clinic ID is a string that represents a number
    let clinicId: string | number | null = clinic.id || null;

    if (clinicId !== null && typeof clinicId === 'string') {
      // Try to convert to number if it's a numeric string
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

  clearSelection(): void {
    if (this.disabled) return; // Don't clear if disabled

    this.control.setValue(null);
    this.control.markAsTouched();
    this.searchTerm.set('');
    this.focusedIndex.set(-1);
  }

  handleClearClick(event: Event): void {
    event.stopPropagation();
    this.clearSelection();
  }

  isClinicSelected(clinic: Clinic): boolean {
    const selectedId = this.control?.value;
    if (!selectedId || selectedId === '' || !clinic.id) return false;

    // Convert both to strings for comparison
    const clinicIdStr = clinic.id.toString();
    const selectedIdStr = selectedId.toString();

    return clinicIdStr === selectedIdStr;
  }

  openModal(): void {
    if (this.disabled) return; // Don't open if disabled

    this.isModalOpen.set(true);
    this.searchTerm.set('');

    // Focus search input when modal opens
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
    // Handle opening modal with keyboard
    if (!this.isModalOpen() && event.key === 'Enter') {
      event.preventDefault();
      this.openModal();
      return;
    }

    // Handle modal keyboard navigation
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
        // Allow normal tab behavior within modal
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
}
