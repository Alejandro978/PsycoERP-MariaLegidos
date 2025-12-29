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
import { ExistingClinicInvoice } from '../../models/billing.models';

/**
 * Componente de facturas existentes de clínicas
 * Muestra el listado de facturas de clínicas ya generadas con filtros
 */
@Component({
  selector: 'app-existing-clinic-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './existing-clinic-invoices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingClinicInvoicesComponent {
  /**
   * Mes seleccionado para filtrar facturas existentes
   */
  private _existingClinicMonth = signal<number>(0);
  @Input({ required: true })
  set existingClinicMonth(value: number) {
    this._existingClinicMonth.set(value);
  }
  get existingClinicMonth(): number {
    return this._existingClinicMonth();
  }

  /**
   * Año seleccionado para filtrar facturas existentes
   */
  private _existingClinicYear = signal<number>(0);
  @Input({ required: true })
  set existingClinicYear(value: number) {
    this._existingClinicYear.set(value);
  }
  get existingClinicYear(): number {
    return this._existingClinicYear();
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
   * Facturas existentes de clínicas
   */
  private _existingClinicInvoices = signal<ExistingClinicInvoice[]>([]);
  @Input({ required: true })
  set existingClinicInvoices(value: ExistingClinicInvoice[]) {
    this._existingClinicInvoices.set(value);
  }
  get existingClinicInvoices(): ExistingClinicInvoice[] {
    return this._existingClinicInvoices();
  }

  /**
   * Estado de carga de facturas existentes
   */
  private _isLoadingExistingClinics = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingExistingClinics(value: boolean) {
    this._isLoadingExistingClinics.set(value);
  }
  get isLoadingExistingClinics(): boolean {
    return this._isLoadingExistingClinics();
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
  @Output() previewInvoice = new EventEmitter<ExistingClinicInvoice>();

  // Filtros locales
  invoiceNumberFilter = signal('');
  dateFilter = signal('');
  fiscalNameFilter = signal('');

  /**
   * Facturas filtradas según los criterios de búsqueda
   */
  filteredInvoices = computed(() => {
    const clinics = this._existingClinicInvoices();
    const invoiceNumberFilter = this.invoiceNumberFilter().toLowerCase();
    const dateFilter = this.dateFilter().toLowerCase();
    const fiscalNameFilter = this.fiscalNameFilter().toLowerCase();

    return clinics.filter((clinic) => {
      const matchesInvoiceNumber = clinic.invoice_numbers.some(num =>
        num.toLowerCase().includes(invoiceNumberFilter)
      );
      const matchesDate = clinic.last_invoice_date
        .toLowerCase()
        .includes(dateFilter);
      const matchesFiscalName = clinic.fiscal_name
        .toLowerCase()
        .includes(fiscalNameFilter);

      return matchesInvoiceNumber && matchesDate && matchesFiscalName;
    });
  });

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
  onPreviewInvoice(invoice: ExistingClinicInvoice): void {
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
  getMonthName(): string {
    return this.monthNames[this._existingClinicMonth() - 1];
  }
}
