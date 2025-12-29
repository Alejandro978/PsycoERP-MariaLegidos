import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExistingInvoice } from '../../models/billing.models';

/**
 * Componente de facturas existentes
 * Muestra el listado de facturas ya generadas con filtros
 */
@Component({
  selector: 'app-existing-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './existing-invoices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingInvoicesComponent {
  /**
   * Mes seleccionado para filtrar facturas existentes
   */
  private _existingMonth = signal<number>(0);
  @Input({ required: true })
  set existingMonth(value: number) {
    this._existingMonth.set(value);
  }
  get existingMonth(): number {
    return this._existingMonth();
  }

  /**
   * Año seleccionado para filtrar facturas existentes
   */
  private _existingYear = signal<number>(0);
  @Input({ required: true })
  set existingYear(value: number) {
    this._existingYear.set(value);
  }
  get existingYear(): number {
    return this._existingYear();
  }

  /**
   * Array con los nombres de los meses
   */
  @Input({ required: true }) monthNames!: string[];

  /**
   * Array con los años disponibles
   */
  @Input({ required: true }) years!: number[];

  /**
   * Facturas existentes
   */
  private _existingInvoices = signal<ExistingInvoice[]>([]);
  @Input({ required: true })
  set existingInvoices(value: ExistingInvoice[]) {
    this._existingInvoices.set(value);
  }
  get existingInvoices(): ExistingInvoice[] {
    return this._existingInvoices();
  }

  /**
   * Estado de carga de facturas existentes
   */
  private _isLoadingExisting = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingExisting(value: boolean) {
    this._isLoadingExisting.set(value);
  }
  get isLoadingExisting(): boolean {
    return this._isLoadingExisting();
  }

  /**
   * Evento emitido cuando cambia el mes seleccionado
   */
  @Output() monthChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando cambia el año seleccionado
   */
  @Output() yearChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando se solicita vista previa de una factura
   */
  @Output() previewInvoice = new EventEmitter<ExistingInvoice>();

  /**
   * Evento emitido cuando se solicita descarga masiva de facturas
   */
  @Output() downloadBulkInvoices = new EventEmitter<ExistingInvoice[]>();

  // Filtros locales
  existingInvoiceNumberFilter = signal('');
  existingDateFilter = signal('');
  existingPatientFilter = signal('');
  existingDniFilter = signal('');

  // Estado de selección múltiple
  selectedInvoices = signal<number[]>([]); // IDs de facturas seleccionadas

  /**
   * Facturas filtradas según los criterios de búsqueda
   */
  filteredExistingInvoices = computed(() => {
    const invoices = this._existingInvoices();
    const invoiceNumberFilter = this.existingInvoiceNumberFilter().toLowerCase();
    const dateFilter = this.existingDateFilter().toLowerCase();
    const patientFilter = this.existingPatientFilter().toLowerCase();
    const dniFilter = this.existingDniFilter().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesInvoiceNumber = invoice.invoice_number
        .toLowerCase()
        .includes(invoiceNumberFilter);
      const matchesDate = invoice.invoice_date
        .toLowerCase()
        .includes(dateFilter);
      const matchesPatient = invoice.patient_full_name
        .toLowerCase()
        .includes(patientFilter);
      const matchesDni = invoice.dni.toLowerCase().includes(dniFilter);

      return (
        matchesInvoiceNumber && matchesDate && matchesPatient && matchesDni
      );
    });
  });

  /**
   * Verifica si todas las facturas están seleccionadas
   */
  allSelected = computed(
    () =>
      this.filteredExistingInvoices().length > 0 &&
      this.selectedInvoices().length === this.filteredExistingInvoices().length
  );

  /**
   * Número de facturas seleccionadas
   */
  selectedCount = computed(() => this.selectedInvoices().length);

  /**
   * Maneja el cambio de mes en el filtro
   */
  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.monthChange.emit(parseInt(select.value));
  }

  /**
   * Maneja el cambio de año en el filtro
   */
  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.yearChange.emit(parseInt(select.value));
  }

  /**
   * Vista previa de una factura
   */
  onPreviewInvoice(invoice: ExistingInvoice): void {
    this.previewInvoice.emit(invoice);
  }

  /**
   * Formatea un número como moneda EUR
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  /**
   * Obtiene el nombre del mes seleccionado
   */
  getExistingMonthName(): string {
    return this.monthNames[this._existingMonth() - 1];
  }

  /**
   * Alterna la selección de una factura
   */
  toggleInvoiceSelection(invoiceId: number): void {
    const current = this.selectedInvoices();
    if (current.includes(invoiceId)) {
      this.selectedInvoices.set(current.filter((id) => id !== invoiceId));
    } else {
      this.selectedInvoices.set([...current, invoiceId]);
    }
  }

  /**
   * Selecciona o deselecciona todas las facturas
   */
  selectAllInvoices(): void {
    if (this.allSelected()) {
      this.selectedInvoices.set([]);
    } else {
      this.selectedInvoices.set(
        this.filteredExistingInvoices().map((inv) => inv.id)
      );
    }
  }

  /**
   * Solicita la descarga masiva de las facturas seleccionadas
   */
  onDownloadBulkInvoices(): void {
    const selected = this.selectedInvoices();
    if (selected.length === 0) {
      return;
    }

    const selectedInvoicesData = this._existingInvoices().filter((inv) =>
      selected.includes(inv.id)
    );

    this.downloadBulkInvoices.emit(selectedInvoicesData);
  }
}
