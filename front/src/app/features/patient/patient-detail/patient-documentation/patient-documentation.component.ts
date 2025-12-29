import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ReusableModalComponent } from '../../../../shared/components/reusable-modal/reusable-modal.component';
import { PatientDocument } from '../../../../shared/models/patient-detail.model';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientDocumentsService } from '../../services/patient-documents.service';

@Component({
  selector: 'app-patient-documentation',
  standalone: true,
  imports: [CommonModule, ReusableModalComponent, ConfirmationModalComponent],
  templateUrl: './patient-documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDocumentationComponent {
  private sanitizer = inject(DomSanitizer);
  private documentsService = inject(PatientDocumentsService);

  @Input({ required: true }) patient!: Patient;
  @Input() documents: PatientDocument[] = [];
  @Output() documentsChanged = new EventEmitter<void>();

  readonly isUploadModalOpen = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly description = signal('');
  readonly isDragging = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly documentToDelete = signal<PatientDocument | null>(null);

  getFileIcon(type: string): string {
    const normalizedType = this.normalizeFileType(type);
    switch (normalizedType) {
      case 'pdf':
        return 'text-red-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  getFileIconSvg(type: string): SafeHtml {
    const normalizedType = this.normalizeFileType(type);
    let svgContent = '';

    switch (normalizedType) {
      case 'pdf':
        svgContent = `<path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 13H8" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 17H8" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 9H8" />`;
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
        svgContent = `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21"/>`;
        break;
      default:
        svgContent = `<path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6" />`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  private normalizeFileType(type: string): string {
    // Handle MIME types (e.g., "application/pdf" -> "pdf")
    if (type.includes('/')) {
      return type.split('/').pop()?.toLowerCase() || type.toLowerCase();
    }
    return type.toLowerCase();
  }

  handleViewDocument(document: PatientDocument): void {
    if (!document.file_url) return;

    // Open document in new tab
    window.open(document.file_url, '_blank');
  }

  openUploadModal(): void {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
    this.selectedFile.set(null);
    this.description.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      this.selectedFile.set(files[0]);
      input.value = '';
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile.set(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
  }

  onDescriptionChange(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.description.set(input.value);
  }

  async handleUploadSubmit(): Promise<void> {
    const file = this.selectedFile();
    const desc = this.description();

    if (!file || !desc.trim() || !this.patient.id) {
      return;
    }

    // Close modal immediately to show loading in parent component
    this.closeUploadModal();

    const uploadedDocument = await this.documentsService.uploadDocument({
      patient_id: this.patient.id,
      description: desc.trim(),
      file: file
    });

    if (uploadedDocument) {
      // Notify parent component to reload documents
      this.documentsChanged.emit();
    }
  }

  get isUploadFormValid(): boolean {
    return !!this.selectedFile() && this.description().trim().length > 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async handleDownloadDocument(doc: PatientDocument): Promise<void> {
    if (!this.patient.id) return;

    await this.documentsService.downloadDocument(
      this.patient.id,
      doc.id,
      doc.name
    );
  }

  openDeleteModal(document: PatientDocument): void {
    this.documentToDelete.set(document);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.documentToDelete.set(null);
  }

  async confirmDeleteDocument(): Promise<void> {
    const document = this.documentToDelete();
    if (!document) return;

    // Close modal immediately to show loading in parent
    this.closeDeleteModal();

    const success = await this.documentsService.deleteDocument(document.id);

    if (success) {
      // Notify parent component to reload documents
      this.documentsChanged.emit();
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES');
  }
}