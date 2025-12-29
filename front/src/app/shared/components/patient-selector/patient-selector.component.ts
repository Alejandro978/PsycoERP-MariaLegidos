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
import { PatientSelector } from '../../models/patient.model';

@Component({
  selector: 'app-patient-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-selector.component.html',
  viewProviders: [],
})
export class PatientSelectorComponent {
  @ViewChild('modalSearchInput') modalSearchInput!: ElementRef<HTMLInputElement>;

  // Inputs
  @Input() control!: FormControl<string | number | null>;
  @Input() patients: PatientSelector[] = [];
  @Input() placeholder: string = 'Seleccionar paciente...';
  @Input() label: string = 'Paciente';
  @Input() required: boolean = false;

  get isDisabled(): boolean {
    return this.control?.disabled || false;
  }

  // Internal signals
  private searchTerm = signal<string>('');
  private isModalOpen = signal<boolean>(false);
  protected focusedIndex = signal<number>(-1);

  // Computed signals
  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.patients;

    // Normalize the search term (remove accents/diacritics)
    const normalizedTerm = this.normalizeString(term);

    return this.patients.filter((patient) => {
      const normalizedName = this.normalizeString(patient.nombreCompleto.toLowerCase());
      const normalizedClinic = this.normalizeString(patient.nombreClinica.toLowerCase());

      return normalizedName.includes(normalizedTerm) ||
             normalizedClinic.includes(normalizedTerm);
    });
  });

  /**
   * Normalize a string by removing accents/diacritics
   * Example: "María" -> "maria"
   */
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Use a getter instead of computed for better control value tracking
  get selectedPatient(): PatientSelector | null {
    const selectedId = this.control?.value;

    // Handle empty string, null, undefined
    if (!selectedId || selectedId === '') {
      return null;
    }

    // Handle both string and number IDs
    const foundPatient = this.patients.find((patient) => {
      if (!patient.idPaciente) return false;

      // Convert both to strings for comparison
      const patientIdStr = patient.idPaciente.toString();
      const selectedIdStr = selectedId.toString();

      return patientIdStr === selectedIdStr;
    });

    return foundPatient || null;
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.focusedIndex.set(-1);
  }

  selectPatient(patient: PatientSelector): void {
    // Convert to number if the patient ID is a string that represents a number
    let patientId: string | number | null = patient.idPaciente || null;

    if (patientId !== null && typeof patientId === 'string') {
      // Try to convert to number if it's a numeric string
      const numericId = parseInt(patientId, 10);
      if (!isNaN(numericId)) {
        patientId = numericId;
      }
    }

    this.control.setValue(patientId);
    this.control.markAsTouched();

    this.searchTerm.set('');
    this.closeModal();
    this.focusedIndex.set(-1);
  }

  clearSelection(): void {
    this.control.setValue(null);
    this.control.markAsTouched();
    this.searchTerm.set('');
    this.focusedIndex.set(-1);
  }

  isPatientSelected(patient: PatientSelector): boolean {
    const selectedId = this.control?.value;
    if (!selectedId || selectedId === '' || !patient.idPaciente) return false;

    // Convert both to strings for comparison
    const patientIdStr = patient.idPaciente.toString();
    const selectedIdStr = selectedId.toString();

    return patientIdStr === selectedIdStr;
  }

  openModal(): void {
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

    const filteredPatients = this.filteredPatients();
    const currentIndex = this.focusedIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex =
          currentIndex < filteredPatients.length - 1 ? currentIndex + 1 : 0;
        this.focusedIndex.set(nextIndex);
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredPatients.length - 1;
        this.focusedIndex.set(prevIndex);
        break;

      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < filteredPatients.length) {
          this.selectPatient(filteredPatients[currentIndex]);
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
    if (errors?.['invalidPatient'])
      return 'El paciente seleccionado no es válido';

    return 'Campo inválido';
  }
}