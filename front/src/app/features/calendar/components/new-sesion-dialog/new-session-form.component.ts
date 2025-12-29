import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  CreateSessionRequest,
  SessionData,
} from '../../../../shared/models/session.model';
import { PatientSelector } from '../../../../shared/models/patient.model';
import { SessionsService } from '../../services/sessions.service';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { PatientSelectorComponent } from '../../../../shared/components/patient-selector/patient-selector.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ClinicalNotesService } from '../../../patient/services/clinical-notes.service';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../core/services/toast.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

/**
 * Modal dialog component for creating new session appointments
 *
 * Features:
 * - Reactive forms with validation
 * - Custom dropdowns matching React UI
 * - Real-time form updates with signals
 * - Responsive design with Tailwind CSS
 *
 * @example
 * ```html
 * <app-new-session-dialog
 *   (close)="onCloseDialog()"
 *   (sessionDataCreated)="onSessionCreated($event)">
 * </app-new-session-dialog>
 * ```
 */
@Component({
  selector: 'app-new-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReusableModalComponent,
    FormInputComponent,
    PatientSelectorComponent,
    ConfirmationModalComponent,
    SpinnerComponent,
  ],
  templateUrl: './new-session-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSessionFormComponent implements OnInit {
  @Input() prefilledData: {
    date: string;
    startTime: string | null;
    sessionData?: SessionData;
  } | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() sessionDataCreated = new EventEmitter<SessionData>();

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private sessionsService = inject(SessionsService);
  private clinicalNotesService = inject(ClinicalNotesService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  /** Loading state signal */
  readonly isLoading = signal(false);

  /** Error message signal */
  readonly error = signal<string | null>(null);

  /** Confirmation modal state */
  readonly showCancelConfirmation = signal<boolean>(false);
  private pendingCancelAction: (() => void) | null = null;

  /** Delete confirmation modal state */
  readonly showDeleteConfirmation = signal<boolean>(false);

  /** Delete note confirmation modal state */
  readonly showDeleteNoteConfirmation = signal<boolean>(false);
  private pendingDeleteNote: {
    id: string;
    title: string;
    content: string;
    date: Date;
  } | null = null;

  /** Patients data from API */
  patients = signal<PatientSelector[]>([]);
  selectedPatient = signal<PatientSelector | null>(null);

  /** Base price signal for reactivity */
  basePrice = signal<number>(0);

  /** Net price signal for reactivity */
  netPrice = signal<number>(0);

  /** Tab state */
  activeTab = signal<'details' | 'clinical-notes'>('details');

  /** Clinical Notes state */
  notes = signal<
    Array<{ id: string; title: string; content: string; date: Date }>
  >([]);
  private notesLoadedWithIds = signal(false);
  searchTerm = signal('');
  isCreatingNote = signal(false);
  editingNote = signal<{
    id: string;
    title: string;
    content: string;
    date: Date;
  } | null>(null);
  deletingNoteId = signal<string | null>(null);
  isSavingNote = signal(false);
  newNote = signal<{ title: string; content: string }>({
    title: '',
    content: '',
  });

  /** Voice recording state */
  isRecording = signal(false);
  private recognition: any = null;

  /** Computed filtered notes */
  filteredNotes = computed(() => {
    const notesArray = this.notes();
    const search = this.searchTerm().toLowerCase();

    if (!search) return notesArray;

    return notesArray.filter((note) => {
      // Search in title and content
      const matchesText =
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search);

      // Search in date (format: DD/MM/YYYY)
      const formattedDate = this.formatDate(note.date).toLowerCase();
      const matchesDate = formattedDate.includes(search);

      // Also search in date parts (day, month, year)
      const dateParts = formattedDate.split('/');
      const matchesDateParts = dateParts.some((part) => part.includes(search));

      return matchesText || matchesDate || matchesDateParts;
    });
  });

  /** Computed sorted notes */
  sortedNotes = computed(() => {
    return this.filteredNotes().sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  });

  /** Computed form validation for clinical notes */
  isFormValidNote = computed(() => {
    const note = this.newNote();
    const hasTitle = (note.title?.trim().length ?? 0) > 0;
    const hasValidContent = (note.content?.trim().length ?? 0) >= 10;
    return hasTitle && hasValidContent;
  });

  constructor() {
    // Effect to load notes with IDs when switching to clinical notes tab
    effect(() => {
      const tab = this.activeTab();
      if (
        tab === 'clinical-notes' &&
        this.isEditMode &&
        !this.notesLoadedWithIds()
      ) {
        this.loadClinicalNotesWithIds();
      }
    });
  }

  readonly modeOptions = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' },
  ];

  readonly paymentMethodOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'bizum', label: 'Bizum' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'efectivo', label: 'Efectivo' },
  ];

  /** Reactive form for session data */
  sessionForm!: FormGroup;

  /** Check if we're in edit mode */
  get isEditMode(): boolean {
    return !!this.prefilledData?.sessionData;
  }

  /** Get the session ID for editing */
  get sessionId(): number | null {
    return (
      this.prefilledData?.sessionData?.SessionDetailData.session_id || null
    );
  }

  /** Check if session is cancelled */
  isCancelledSession = computed(() => {
    return (
      this.prefilledData?.sessionData?.SessionDetailData.status === 'cancelada'
    );
  });

  ngOnInit(): void {
    this.loadPatients();
    this.initializeForm();

    // Load clinical notes if in edit mode
    if (this.isEditMode) {
      this.loadClinicalNotes();
    }
  }

  private loadClinicalNotes(): void {
    const sessionData = this.prefilledData?.sessionData;
    if (!sessionData) return;

    const patientId = sessionData.SessionDetailData.PatientData.id;

    // Load clinical notes from API
    this.clinicalNotesService.getClinicalNotes(patientId).subscribe({
      next: (response: any) => {
        // Handle both array response and object with data property
        const records = Array.isArray(response)
          ? response
          : response.data || [];
        const transformed = records.map((record: any) => ({
          id: record.id ? record.id.toString() : '',
          title: record.title || record.titulo || '',
          content: record.content || record.contenido || '',
          date: this.parseDateString(
            record.created_at || record.fecha || new Date().toISOString()
          ),
        }));
        this.notes.set(transformed);
        this.notesLoadedWithIds.set(true);
      },
      error: (error) => {
        console.error('Error loading clinical notes:', error);
      },
    });
  }

  private loadClinicalNotesWithIds(): void {
    // Load clinical notes when switching to the tab
    this.loadClinicalNotes();
  }

  private parseDateString(dateStr: string): Date {
    // Parse "2024-12-15 14:30:00" or "2025-10-01 07:32:06" format
    const [datePart] = dateStr.split(' ');
    return new Date(datePart);
  }

  /**
   * Custom validator for time range (7:00 - 22:00)
   */
  private timeRangeValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const time = control.value;
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const minTime = 7 * 60; // 7:00 = 420 minutes
    const maxTime = 22 * 60; // 22:00 = 1320 minutes

    if (totalMinutes < minTime || totalMinutes > maxTime) {
      return { timeRange: true };
    }

    return null;
  }

  /**
   * Validate time order and duration, setting errors on individual fields
   */
  private validateTimeOrderAndDuration(): void {
    const startTimeControl = this.sessionForm.get('start_time');
    const endTimeControl = this.sessionForm.get('end_time');

    if (!startTimeControl || !endTimeControl) {
      return;
    }

    const startTime = startTimeControl.value;
    const endTime = endTimeControl.value;

    if (!startTime || !endTime) {
      return;
    }

    // Clear previous errors related to time order and duration
    const startErrors = startTimeControl.errors || {};
    const endErrors = endTimeControl.errors || {};
    delete startErrors['timeOrder'];
    delete endErrors['timeOrder'];
    delete endErrors['maxDuration'];

    // Check if start_time is before end_time
    if (startTime >= endTime) {
      endTimeControl.setErrors({ ...endErrors, timeOrder: true });
      return;
    }

    // Check if duration is not more than 60 minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const duration = endTotalMinutes - startTotalMinutes;

    if (duration > 60) {
      endTimeControl.setErrors({ ...endErrors, maxDuration: true });
      return;
    }

    // If no errors, clear them
    endTimeControl.setErrors(
      Object.keys(endErrors).length > 0 ? endErrors : null
    );
    startTimeControl.setErrors(
      Object.keys(startErrors).length > 0 ? startErrors : null
    );
  }

  private initializeForm(): void {
    const sessionData = this.prefilledData?.sessionData;
    const isEditMode = !!sessionData;

    const defaultDate =
      this.prefilledData?.date || new Date().toISOString().split('T')[0];
    const defaultStartTime = this.prefilledData?.startTime || '';

    const formValues = isEditMode
      ? {
          patient_id: sessionData!.SessionDetailData.PatientData.id,
          session_date: sessionData!.SessionDetailData.session_date,
          start_time: sessionData!.SessionDetailData.start_time.substring(0, 5),
          end_time: sessionData!.SessionDetailData.end_time.substring(0, 5),
          mode: sessionData!.SessionDetailData.mode.toLowerCase(),
          base_price: 0,
          payment_method:
            sessionData!.SessionDetailData.payment_method || 'pendiente',
          notes: sessionData!.SessionDetailData.notes || '',
        }
      : {
          patient_id: null,
          session_date: defaultDate,
          start_time: defaultStartTime,
          end_time: '',
          mode: 'presencial',
          base_price: 0,
          payment_method: 'pendiente',
          notes: '',
        };

    this.sessionForm = this.fb.group({
      patient_id: [
        { value: formValues.patient_id, disabled: isEditMode },
        [Validators.required],
      ],
      session_date: [formValues.session_date, [Validators.required]],
      start_time: [
        formValues.start_time,
        [Validators.required, this.timeRangeValidator],
      ],
      end_time: [
        formValues.end_time,
        [Validators.required, this.timeRangeValidator],
      ],
      mode: [
        { value: formValues.mode, disabled: false },
        [Validators.required],
      ],
      base_price: [
        formValues.base_price,
        [Validators.required, Validators.min(0.01)],
      ],
      payment_method: [
        { value: formValues.payment_method, disabled: !isEditMode },
        [Validators.required],
      ],
      notes: [formValues.notes],
    });

    // Add value changes listener to validate time order and duration
    this.sessionForm.get('start_time')?.valueChanges.subscribe(() => {
      this.validateTimeOrderAndDuration();
    });
    this.sessionForm.get('end_time')?.valueChanges.subscribe(() => {
      this.validateTimeOrderAndDuration();
    });

    // If start time is prefilled and not in edit mode, calculate end time automatically
    if (defaultStartTime && !isEditMode) {
      this.updateEndTime(defaultStartTime);
    }

    // Watch for patient selection changes
    this.sessionForm.get('patient_id')?.valueChanges.subscribe((patientId) => {
      const patient = this.patients().find((p) => p.idPaciente === patientId);
      this.selectedPatient.set(patient || null);

      // Update base_price and mode when patient changes (only in create mode)
      if (patient && !isEditMode) {
        const mode = patient.presencial ? 'presencial' : 'online';
        this.sessionForm.patchValue({
          base_price: patient.precioSesion,
          mode: mode,
        });

        // Calculate and set net price for new sessions
        const calculatedNetPrice =
          patient.precioSesion * (patient.porcentaje / 100);
        this.netPrice.set(calculatedNetPrice);
      }
    });

    // Watch for start time changes and automatically update end time
    this.sessionForm.get('start_time')?.valueChanges.subscribe((startTime) => {
      if (startTime) {
        this.updateEndTime(startTime);
      }
    });

    // Watch for base_price changes to update the signals
    this.sessionForm.get('base_price')?.valueChanges.subscribe((price) => {
      this.basePrice.set(price || 0);

      // Recalculate net price when base price changes
      const patient = this.selectedPatient();
      if (patient && price > 0) {
        const calculatedNetPrice = price * (patient.porcentaje / 100);
        this.netPrice.set(calculatedNetPrice);
      } else {
        this.netPrice.set(0);
      }
    });

    // Initialize basePrice signal with current form value
    this.basePrice.set(this.sessionForm.get('base_price')?.value || 0);
  }

  private loadPatients(): void {
    this.http
      .get<{ data: PatientSelector[] }>(
        `${environment.api.baseUrl}/patients/active-with-clinic`
      )
      .subscribe({
        next: (response) => {
          this.patients.set(response.data);

          // If in edit mode, set the selected patient after loading patients
          if (this.isEditMode && this.prefilledData?.sessionData) {
            const sessionData = this.prefilledData.sessionData;
            const patientId = sessionData.SessionDetailData.PatientData.id;
            const patient = response.data.find(
              (p) => p.idPaciente === patientId
            );
            if (patient) {
              this.selectedPatient.set(patient);

              // Set the mode based on patient's presencial setting
              const mode = patient.presencial ? 'presencial' : 'online';

              // Update form with calculated base_price
              this.sessionForm.patchValue({
                base_price: sessionData.SessionDetailData.price,
                mode: mode,
              });

              // Update basePrice and netPrice signals from backend
              this.basePrice.set(sessionData.SessionDetailData.price);
              this.netPrice.set(sessionData.SessionDetailData.net_price);
            }
          }
        },
        error: (error) => {
          console.error('Error loading patients:', error);
        },
      });
  }

  onClose(): void {
    this.sessionForm.reset({
      mode: 'presencial',
    });
    this.selectedPatient.set(null);
    this.close.emit();
  }

  onCancelConfirm(): void {
    this.showCancelConfirmation.set(false);
    // Execute the cancel session action
    if (this.pendingCancelAction) {
      this.pendingCancelAction();
      this.pendingCancelAction = null;
    }
  }

  onCancelReject(): void {
    this.showCancelConfirmation.set(false);
    this.pendingCancelAction = null;
  }

  onCancelSession(): void {
    // Show confirmation before cancelling
    this.showCancelConfirmation.set(true);
    this.pendingCancelAction = () => this.executeCancelSession();
  }

  private executeCancelSession(): void {
    if (!this.isEditMode || !this.sessionId) {
      return;
    }

    const formValue = this.sessionForm.getRawValue();
    const patient = this.selectedPatient();

    if (!patient) {
      return;
    }

    this.isLoading.set(true);

    const sessionData: CreateSessionRequest = {
      patient_id: formValue.patient_id,
      clinic_id: patient.idClinica,
      session_date: formValue.session_date,
      start_time: this.convertTimeToMySQL(formValue.start_time),
      end_time: this.convertTimeToMySQL(formValue.end_time),
      mode: formValue.mode,
      status: 'cancelada',
      price: parseFloat(formValue.base_price),
      payment_method: formValue.payment_method,
      notes: formValue.notes || null,
    };

    this.sessionsService.updateSession(this.sessionId, sessionData).subscribe({
      next: (updatedSession) => {
        this.sessionDataCreated.emit(updatedSession);
        this.isLoading.set(false);
        this.onClose();
      },
      error: (error) => {
        console.error('Error cancelling session:', error);
        this.error.set(
          'Error al cancelar la sesión. Por favor, intenta de nuevo.'
        );
        this.isLoading.set(false);
      },
    });
  }

  onDeleteSession(): void {
    // Show confirmation before deleting
    this.showDeleteConfirmation.set(true);
  }

  onConfirmDeleteSession(): void {
    if (!this.isEditMode || !this.sessionId) {
      this.showDeleteConfirmation.set(false);
      return;
    }

    this.isLoading.set(true);
    this.showDeleteConfirmation.set(false);

    this.sessionsService.deleteSession(this.sessionId).subscribe({
      next: () => {
        this.toastService.showSuccess('Sesión eliminada correctamente');
        this.sessionDataCreated.emit();
        this.isLoading.set(false);
        this.onClose();
      },
      error: (error) => {
        console.error('Error deleting session:', error);
        this.toastService.showError(
          'Error al eliminar la sesión. Por favor, intenta de nuevo.'
        );
        this.isLoading.set(false);
      },
    });
  }

  onCancelDeleteSession(): void {
    this.showDeleteConfirmation.set(false);
  }

  onStartTimeChange(): void {
    const startTime = this.sessionForm.get('start_time')?.value;
    if (startTime) {
      this.updateEndTime(startTime);
    }
  }

  private updateEndTime(startTime: string): void {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 1, minutes, 0);
    const endTime = endDate.toTimeString().slice(0, 5);

    this.sessionForm.patchValue(
      {
        end_time: endTime,
      },
      { emitEvent: false }
    ); // emitEvent: false para evitar loops infinitos
  }

  private convertTimeToMySQL(time: string): string {
    // Convert HH:mm to HH:mm:ss format for MySQL TIME column
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  }

  onSubmit(): void {
    this.error.set(null);

    // Prevent double submission
    if (this.isLoading()) {
      return;
    }

    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      this.error.set('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const formValue = this.sessionForm.getRawValue(); // Use getRawValue() to include disabled fields
    const patient = this.selectedPatient();

    if (!patient) {
      this.error.set('Debe seleccionar un paciente.');
      return;
    }

    this.executeSubmit();
  }

  private executeSubmit(): void {
    const formValue = this.sessionForm.getRawValue();
    const patient = this.selectedPatient();

    if (!patient) {
      this.error.set('Debe seleccionar un paciente.');
      return;
    }

    this.isLoading.set(true);

    // Get current status in edit mode, or default to 'completada' for new sessions
    const currentStatus = this.isEditMode
      ? this.prefilledData?.sessionData?.SessionDetailData.status ||
        'completada'
      : 'completada';

    const sessionData: CreateSessionRequest = {
      patient_id: formValue.patient_id,
      clinic_id: patient.idClinica,
      session_date: formValue.session_date,
      start_time: this.convertTimeToMySQL(formValue.start_time),
      end_time: this.convertTimeToMySQL(formValue.end_time),
      mode: formValue.mode,
      status: currentStatus,
      price: parseFloat(formValue.base_price),
      payment_method: formValue.payment_method,
      notes: formValue.notes || null,
    };

    if (this.isEditMode && this.sessionId) {
      // Update existing session
      this.sessionsService
        .updateSession(this.sessionId, sessionData)
        .subscribe({
          next: (updatedSession) => {
            this.sessionDataCreated.emit(updatedSession);
            this.isLoading.set(false);
            this.onClose();
          },
          error: (error) => {
            console.error('Error updating session:', error);
            this.error.set(
              'Error al actualizar la sesión. Por favor, intenta de nuevo.'
            );
            this.isLoading.set(false);
          },
        });
    } else {
      // Create new session
      this.sessionsService.createSession(sessionData).subscribe({
        next: (createdSession) => {
          this.sessionDataCreated.emit(createdSession);
          this.isLoading.set(false);
          this.onClose();
        },
        error: (error) => {
          console.error('Error creating session:', error);
          const backendError = error.error?.error || error.error?.message;
          this.error.set(
            backendError ||
              'Error al crear la sesión. Por favor, intenta de nuevo.'
          );
          this.isLoading.set(false);
        },
      });
    }
  }

  get isFormValid(): boolean {
    return this.sessionForm.valid;
  }

  get selectedPatientData(): PatientSelector | null {
    return this.selectedPatient();
  }

  // Clinical Notes Methods
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onCreateNote(): void {
    this.isCreatingNote.set(true);
    this.editingNote.set(null);
    this.newNote.set({ title: '', content: '' });
  }

  onEditNote(note: {
    id: string;
    title: string;
    content: string;
    date: Date;
  }): void {
    this.editingNote.set(note);
    this.isCreatingNote.set(false);
    this.newNote.set({ title: note.title, content: note.content });
  }

  onEditNoteButton(
    event: Event,
    note: { id: string; title: string; content: string; date: Date }
  ): void {
    event.stopPropagation();
    this.onEditNote(note);
  }

  onTitleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newNote.update((note) => ({ ...note, title: target.value }));
  }

  onContentChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.newNote.update((note) => ({ ...note, content: target.value }));
  }

  onSaveNote(): void {
    const note = this.newNote();
    const editingNote = this.editingNote();
    const sessionData = this.prefilledData?.sessionData;

    if (!this.isFormValidNote() || !sessionData) {
      return;
    }

    const patientId = sessionData.SessionDetailData.PatientData.id;

    this.isSavingNote.set(true);

    if (editingNote && editingNote.id) {
      // Update existing note
      const noteIdNumber = parseInt(editingNote.id);

      if (isNaN(noteIdNumber) || noteIdNumber === 0) {
        this.isSavingNote.set(false);
        return;
      }

      this.clinicalNotesService
        .updateClinicalNote({
          id: noteIdNumber,
          title: note.title,
          content: note.content,
        })
        .subscribe({
          next: () => {
            this.isSavingNote.set(false);
            this.onCancelEdit();
            this.toastService.showSuccess(
              'Nota clínica actualizada correctamente'
            );
            this.reloadSessionData();
          },
          error: (error) => {
            console.error('Error updating note:', error);
            this.toastService.showError(
              'Error al actualizar la nota. Por favor, intenta de nuevo.'
            );
            this.isSavingNote.set(false);
          },
        });
    } else {
      // Create new note
      this.clinicalNotesService
        .createClinicalNote({
          patient_id: patientId,
          title: note.title,
          content: note.content,
        })
        .subscribe({
          next: () => {
            this.isSavingNote.set(false);
            this.onCancelEdit();
            this.toastService.showSuccess('Nota clínica creada correctamente');
            this.reloadSessionData();
          },
          error: (error) => {
            console.error('Error creating note:', error);
            this.toastService.showError(
              'Error al crear la nota. Por favor, intenta de nuevo.'
            );
            this.isSavingNote.set(false);
          },
        });
    }
  }

  onCancelEdit(): void {
    this.isCreatingNote.set(false);
    this.editingNote.set(null);
    this.newNote.set({ title: '', content: '' });
  }

  onDeleteNote(
    event: Event,
    note: { id: string; title: string; content: string; date: Date }
  ): void {
    event.stopPropagation();

    const noteIdNumber = parseInt(note.id);

    if (isNaN(noteIdNumber) || noteIdNumber === 0) {
      return;
    }

    // Store the note to delete and show confirmation modal
    this.pendingDeleteNote = note;
    this.showDeleteNoteConfirmation.set(true);
  }

  onConfirmDeleteNote(): void {
    if (!this.pendingDeleteNote) return;

    const noteIdNumber = parseInt(this.pendingDeleteNote.id);

    if (isNaN(noteIdNumber) || noteIdNumber === 0) {
      this.showDeleteNoteConfirmation.set(false);
      this.pendingDeleteNote = null;
      return;
    }

    this.deletingNoteId.set(this.pendingDeleteNote.id);
    this.showDeleteNoteConfirmation.set(false);

    this.clinicalNotesService.deleteClinicalNote(noteIdNumber).subscribe({
      next: () => {
        this.deletingNoteId.set(null);
        this.pendingDeleteNote = null;
        this.toastService.showSuccess('Nota clínica eliminada correctamente');
        this.reloadSessionData();
      },
      error: (error) => {
        console.error('Error deleting note:', error);
        this.toastService.showError(
          'Error al eliminar la nota. Por favor, intenta de nuevo.'
        );
        this.deletingNoteId.set(null);
        this.pendingDeleteNote = null;
      },
    });
  }

  onCancelDeleteNote(): void {
    this.showDeleteNoteConfirmation.set(false);
    this.pendingDeleteNote = null;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  toggleRecording(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.'
        );
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      let finalTranscript = '';
      const currentContent = this.newNote().content || '';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const newContent = currentContent + finalTranscript + interimTranscript;
        this.newNote.update((note) => ({ ...note, content: newContent }));
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        this.isRecording.set(false);

        if (event.error === 'not-allowed') {
          alert(
            'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.'
          );
        }
      };

      this.recognition.onend = () => {
        this.isRecording.set(false);
      };

      this.recognition.start();
      this.isRecording.set(true);
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      alert('Error al acceder al micrófono. Verifica los permisos.');
    }
  }

  private stopRecording(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.isRecording.set(false);
  }

  private reloadSessionData(): void {
    // Reload clinical notes with IDs after create/update/delete
    this.notesLoadedWithIds.set(false);
    this.loadClinicalNotesWithIds();
  }

  /**
   * Close the modal and navigate to the selected patient's detail page
   */
  viewPatientDetail(): void {
    const patient = this.selectedPatientData;
    if (!patient) return;

    // Close the modal first so the parent can remove it
    this.close.emit();

    // Navigate to patient detail route
    // selectedPatientData uses `idPaciente` as the identifier
    const patientId = (patient as any).idPaciente ?? (patient as any).id;
    if (!patientId) return;

    this.router.navigate(['/patient', patientId]);
  }
}
