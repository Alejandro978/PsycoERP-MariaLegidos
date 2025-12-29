import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from './services/billing.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import {
  InvoiceKPIs,
  PendingInvoice,
  ExistingInvoice,
  ClinicInvoiceData,
  ExistingClinicInvoice,
} from './models/billing.models';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ReusableModalComponent } from '../../shared/components/reusable-modal/reusable-modal.component';
import {
  InvoicePreviewComponent,
  InvoicePreviewData,
} from './components/invoice-preview.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../core/services/toast.service';
import { FilterAnalysisComponent } from './components/filter-analysis/filter-analysis.component';
import { BulkInvoicingComponent } from './components/bulk-invoicing/bulk-invoicing.component';
import { ClinicInvoicingComponent } from './components/clinic-invoicing/clinic-invoicing.component';
import { ExistingInvoicesComponent } from './components/existing-invoices/existing-invoices.component';
import { BulkInvoiceModalComponent } from './components/bulk-invoice-modal/bulk-invoice-modal.component';
import { ClinicInvoiceModalComponent } from './components/clinic-invoice-modal/clinic-invoice-modal.component';
import { ClinicInvoicePreviewComponent } from './components/clinic-invoice-preview/clinic-invoice-preview.component';
import { InvoiceLoadingSpinnerComponent } from './components/invoice-loading-spinner/invoice-loading-spinner.component';

interface InvoiceToGenerate extends InvoicePreviewData {}

interface SessionsByPrice {
  unit_price: number;
  sessions_count: number;
  total_net: number;
  concept: string;
}

interface ClinicInvoiceToGenerate {
  clinic_id: number;
  clinic_name: string;
  fiscal_name: string;
  cif: string;
  billing_address: string;
  total_sessions: number;
  sessions_data: SessionsByPrice[];
  total_net: number;
  total_net_with_irpf: number;
  invoice_number: string;
  invoice_date: string;
  concept: string;
  total: number;
}

/**
 * Componente de facturación
 * Gestiona generación masiva de facturas y visualización de KPIs
 */
@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SectionHeaderComponent,
    InvoicePreviewComponent,
    FilterAnalysisComponent,
    BulkInvoicingComponent,
    ClinicInvoicingComponent,
    BulkInvoiceModalComponent,
    ClinicInvoiceModalComponent,
    ClinicInvoicePreviewComponent,
    InvoiceLoadingSpinnerComponent,
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingComponent implements OnInit {
  private billingService = inject(BillingService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private pdfGeneratorService = inject(PdfGeneratorService);

  // Signals para estado del componente
  activeTab = signal<'bulk' | 'clinics'>('bulk');

  // Filtros para KPIs (Período de Análisis)
  kpiMonth = signal(new Date().getMonth() + 1);
  kpiYear = signal(new Date().getFullYear());

  // Filtros para Facturas Pendientes
  pendingMonth = signal(new Date().getMonth() + 1);
  pendingYear = signal(new Date().getFullYear());

  // Filtros para Facturas Existentes
  existingMonth = signal(new Date().getMonth() + 1);
  existingYear = signal(new Date().getFullYear());

  // Filtros para Facturas de Clínicas
  clinicsMonth = signal(new Date().getMonth() + 1);
  clinicsYear = signal(new Date().getFullYear());

  // Filtros para Facturas Existentes de Clínicas
  existingClinicMonth = signal(new Date().getMonth() + 1);
  existingClinicYear = signal(new Date().getFullYear());

  kpis = signal<InvoiceKPIs | null>(null);
  pendingInvoices = signal<PendingInvoice[]>([]);
  existingInvoices = signal<ExistingInvoice[]>([]);
  clinicInvoices = signal<ClinicInvoiceData[]>([]);
  existingClinicInvoices = signal<ExistingClinicInvoice[]>([]);
  selectedPatients = signal<string[]>([]);
  selectedClinicId = signal<number | null>(null);

  // Numeración de facturas
  invoicePrefix = signal('FAC');
  invoiceYear = signal(new Date().getFullYear());
  invoiceNextNumber = signal(1);

  // Modal state
  isModalOpen = signal(false);
  invoicesToGenerate = signal<InvoiceToGenerate[]>([]);

  // Modal state for clinic invoice
  isClinicModalOpen = signal(false);
  clinicInvoiceToGenerate = signal<ClinicInvoiceToGenerate | null>(null);

  // Preview modal state
  isPreviewModalOpen = signal(false);
  previewInvoiceData = signal<InvoiceToGenerate | null>(null);

  // Preview modal state for clinic invoices
  isClinicPreviewModalOpen = signal(false);

  // User data for invoice
  userData = signal<User | null>(null);

  isLoadingKPIs = signal(false);
  isLoadingPending = signal(false);
  isLoadingExisting = signal(false);
  isLoadingClinics = signal(false);
  isLoadingExistingClinics = signal(false);

  // Error state
  errorMessage = signal<string | null>(null);

  // Bulk invoice generation state
  isGeneratingBulkInvoices = signal(false);

  // Filter states
  pendingPatientFilter = signal('');
  pendingDniFilter = signal('');
  pendingEmailFilter = signal('');
  existingInvoiceNumberFilter = signal('');
  existingDateFilter = signal('');
  existingPatientFilter = signal('');
  existingDniFilter = signal('');

  // Computed signals
  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  years = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // 5 años hacia atrás, año actual, y 5 años hacia adelante
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  });

  allSelected = computed(
    () =>
      this.pendingInvoices().length > 0 &&
      this.selectedPatients().length === this.pendingInvoices().length
  );

  selectedCount = computed(() => this.selectedPatients().length);

  totalSelectedAmount = computed(() => {
    const selected = this.selectedPatients();
    return this.pendingInvoices()
      .filter((inv) => selected.includes(inv.dni))
      .reduce((sum, inv) => sum + inv.total_gross, 0);
  });

  // Filtered pending invoices
  filteredPendingInvoices = computed(() => {
    const invoices = this.pendingInvoices();
    const patientFilter = this.pendingPatientFilter().toLowerCase();
    const dniFilter = this.pendingDniFilter().toLowerCase();
    const emailFilter = this.pendingEmailFilter().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesPatient = invoice.patient_full_name
        .toLowerCase()
        .includes(patientFilter);
      const matchesDni = invoice.dni.toLowerCase().includes(dniFilter);
      const matchesEmail = invoice.email.toLowerCase().includes(emailFilter);

      return matchesPatient && matchesDni && matchesEmail;
    });
  });

  // Filtered existing invoices
  filteredExistingInvoices = computed(() => {
    const invoices = this.existingInvoices();
    const invoiceNumberFilter =
      this.existingInvoiceNumberFilter().toLowerCase();
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

  ngOnInit() {
    this.loadKPIs();
    this.loadPendingInvoices();
    this.loadUserData();
    this.loadLastInvoiceNumber();
  }

  /**
   * Carga los datos del usuario
   */
  loadUserData() {
    // Obtener el ID del usuario (asumiendo que es 1, o podrías obtenerlo del servicio de auth)
    this.userService.getUserProfile(1).subscribe({
      next: (user) => {
        this.userData.set(user);
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      },
    });
  }

  /**
   * Carga los KPIs de facturación
   */
  loadKPIs() {
    this.isLoadingKPIs.set(true);
    this.billingService.getKPIs(this.kpiMonth(), this.kpiYear()).subscribe({
      next: (response) => {
        this.kpis.set(response.data);
        this.isLoadingKPIs.set(false);
      },
      error: () => {
        this.isLoadingKPIs.set(false);
      },
    });
  }

  /**
   * Carga las facturas pendientes
   */
  loadPendingInvoices() {
    this.isLoadingPending.set(true);
    this.billingService
      .getPendingInvoices(this.pendingMonth(), this.pendingYear())
      .subscribe({
        next: (response) => {
          this.pendingInvoices.set(response.data.pending_invoices);
          this.isLoadingPending.set(false);
          // Limpiar selección al cambiar filtros
          this.selectedPatients.set([]);
        },
        error: () => {
          this.isLoadingPending.set(false);
        },
      });
  }

  /**
   * Carga las facturas existentes
   */
  loadExistingInvoices() {
    this.isLoadingExisting.set(true);
    this.billingService
      .getExistingInvoices(this.existingMonth(), this.existingYear())
      .subscribe({
        next: (response) => {
          this.existingInvoices.set(response.data.invoices);
          this.isLoadingExisting.set(false);
        },
        error: () => {
          this.isLoadingExisting.set(false);
        },
      });
  }

  /**
   * Carga las facturas pendientes de clínicas
   */
  loadClinicInvoices() {
    this.isLoadingClinics.set(true);
    this.billingService
      .getPendingClinicInvoices(this.clinicsMonth(), this.clinicsYear())
      .subscribe({
        next: (response) => {
          // Los datos vienen directamente en response.data como array
          this.clinicInvoices.set(response.data);
          this.isLoadingClinics.set(false);
          // Limpiar selección al cambiar filtros
          this.selectedClinicId.set(null);
        },
        error: (error) => {
          console.error('Error cargando clínicas:', error);
          this.isLoadingClinics.set(false);
        },
      });
  }

  /**
   * Maneja el cambio de mes en el filtro de KPIs
   */
  onKpiMonthChange(month: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof month === 'number'
        ? month
        : parseInt((month.target as HTMLSelectElement).value);
    this.kpiMonth.set(value);
    this.loadKPIs();
  }

  /**
   * Maneja el cambio de año en el filtro de KPIs
   */
  onKpiYearChange(year: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof year === 'number'
        ? year
        : parseInt((year.target as HTMLSelectElement).value);
    this.kpiYear.set(value);
    this.loadKPIs();
  }

  /**
   * Maneja el cambio de mes en el filtro de Facturas Pendientes
   */
  onPendingMonthChange(month: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof month === 'number'
        ? month
        : parseInt((month.target as HTMLSelectElement).value);
    this.pendingMonth.set(value);
    this.loadPendingInvoices();
  }

  /**
   * Maneja el cambio de año en el filtro de Facturas Pendientes
   */
  onPendingYearChange(year: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof year === 'number'
        ? year
        : parseInt((year.target as HTMLSelectElement).value);
    this.pendingYear.set(value);
    this.loadPendingInvoices();
  }

  /**
   * Maneja el cambio de mes en el filtro de Facturas Existentes
   */
  onExistingMonthChange(month: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof month === 'number'
        ? month
        : parseInt((month.target as HTMLSelectElement).value);
    this.existingMonth.set(value);
    this.loadExistingInvoices();
  }

  /**
   * Maneja el cambio de año en el filtro de Facturas Existentes
   */
  onExistingYearChange(year: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof year === 'number'
        ? year
        : parseInt((year.target as HTMLSelectElement).value);
    this.existingYear.set(value);
    this.loadExistingInvoices();
  }

  /**
   * Maneja el cambio de mes en el filtro de Facturas de Clínicas
   */
  onClinicsMonthChange(month: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof month === 'number'
        ? month
        : parseInt((month.target as HTMLSelectElement).value);
    this.clinicsMonth.set(value);
    this.loadClinicInvoices();
  }

  /**
   * Maneja el cambio de año en el filtro de Facturas de Clínicas
   */
  onClinicsYearChange(year: number | Event) {
    // Soportar tanto Event (desde template directo) como number (desde componente hijo)
    const value =
      typeof year === 'number'
        ? year
        : parseInt((year.target as HTMLSelectElement).value);
    this.clinicsYear.set(value);
    this.loadClinicInvoices();
  }

  /**
   * Valida el año cuando el usuario sale del campo (blur)
   */
  validateInvoiceYear() {
    const year = this.invoiceYear();
    if (year < 2000) {
      this.invoiceYear.set(new Date().getFullYear());
      this.loadLastInvoiceNumber();
    }
  }

  /**
   * Maneja el cambio de año en el campo de numeración de facturas
   */
  onInvoiceYearChange() {
    const year = this.invoiceYear();
    // Solo cargar si el año es válido
    if (year >= 2000) {
      this.loadLastInvoiceNumber();
    }
  }

  /**
   * Carga el último número de factura para el año seleccionado
   */
  loadLastInvoiceNumber() {
    this.billingService.getLastInvoiceNumber(this.invoiceYear()).subscribe({
      next: (response: any) => {
        // Manejar diferentes estructuras de respuesta
        let lastNumber = 0;

        if (response.data) {
          // Si la respuesta viene envuelta en un objeto data
          lastNumber = response.data.last_invoice_number || 0;
        } else if (response.last_invoice_number !== undefined) {
          // Si la respuesta viene directamente
          lastNumber = response.last_invoice_number;
        }

        // El próximo número es el último + 1
        const nextNumber = lastNumber + 1;
        this.invoiceNextNumber.set(nextNumber);
      },
      error: (error) => {
        console.error('Error loading last invoice number:', error);
        // En caso de error, usar 1 como valor por defecto
        this.invoiceNextNumber.set(1);
      },
    });
  }

  /**
   * Cambia entre tabs
   */
  onTabChange(tab: 'bulk' | 'clinics') {
    this.activeTab.set(tab);
    if (tab === 'clinics' && this.clinicInvoices().length === 0) {
      this.loadClinicInvoices();
    }
  }

  /**
   * Alterna la selección de un paciente
   */
  togglePatientSelection(dni: string) {
    const current = this.selectedPatients();
    if (current.includes(dni)) {
      this.selectedPatients.set(current.filter((d) => d !== dni));
    } else {
      this.selectedPatients.set([...current, dni]);
    }
  }

  /**
   * Selecciona o deselecciona todos los pacientes
   */
  selectAllPatients() {
    if (this.allSelected()) {
      this.selectedPatients.set([]);
    } else {
      this.selectedPatients.set(this.pendingInvoices().map((inv) => inv.dni));
    }
  }

  /**
   * Selecciona una clínica (solo una a la vez)
   */
  selectClinic(clinicId: number) {
    if (this.selectedClinicId() === clinicId) {
      // Si ya está seleccionada, deseleccionar
      this.selectedClinicId.set(null);
    } else {
      // Seleccionar solo esta clínica
      this.selectedClinicId.set(clinicId);
    }
  }

  /**
   * Abre el modal con las facturas a generar
   */
  generateBulkInvoices() {
    const selected = this.selectedPatients();
    if (selected.length === 0) {
      return;
    }

    // Obtener datos de las facturas seleccionadas
    const selectedInvoices = this.pendingInvoices().filter((inv) =>
      selected.includes(inv.dni)
    );

    // Preparar datos para el modal
    const invoices: InvoiceToGenerate[] = selectedInvoices.map(
      (inv, index) => ({
        patient_full_name: inv.patient_full_name,
        dni: inv.dni,
        email: inv.email,
        pending_sessions_count: inv.pending_sessions_count,
        total_gross: inv.total_gross,
        invoice_number: `${this.invoicePrefix()}-${this.invoiceYear()}-${this.padNumber(
          this.invoiceNextNumber() + index
        )}`,
        invoice_date: new Date().toISOString().split('T')[0],
        sessions: inv.sessions,
      })
    );

    this.invoicesToGenerate.set(invoices);
    this.isModalOpen.set(true);
  }

  /**
   * Cierra el modal de generación
   */
  closeModal() {
    this.isModalOpen.set(false);
    this.invoicesToGenerate.set([]);
    this.errorMessage.set(null);
  }

  /**
   * Cierra el mensaje de error
   */
  closeErrorMessage() {
    this.errorMessage.set(null);
  }

  /**
   * Confirma y genera las facturas desde el modal
   */
  confirmGenerateInvoices() {
    const invoicesToCreate = this.invoicesToGenerate();

    if (invoicesToCreate.length === 0) {
      return;
    }

    // Activar spinner
    this.isGeneratingBulkInvoices.set(true);

    // Obtener datos completos de las facturas seleccionadas
    const selected = this.selectedPatients();
    const selectedInvoicesData = this.pendingInvoices().filter((inv) =>
      selected.includes(inv.dni)
    );

    // Preparar el payload para el backend
    const invoicesPayload = invoicesToCreate.map((invoice, index) => {
      const originalData = selectedInvoicesData[index];
      const monthName = this.monthNames[this.pendingMonth() - 1];

      return {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        patient_id: originalData.patient_id,
        session_ids: originalData.sessions.map((s) => s.session_id),
        concept: `Sesiones ${
          originalData.patient_full_name
        } - ${monthName} ${this.pendingYear()}`,
      };
    });

    // Llamar al servicio para crear las facturas
    this.billingService.createBulkInvoices(invoicesPayload).subscribe({
      next: (response: any) => {
        // La respuesta puede venir en response.data o directamente en response
        const data = response?.data || response;

        // Verificar si la operación fue exitosa
        if (
          response?.success === false &&
          data?.failed &&
          data.failed.length > 0
        ) {
          // Buscar error de número de factura duplicado
          const duplicateError = data.failed.find(
            (f: any) =>
              f.error?.includes('número de factura ya existe') ||
              f.error?.includes('already exists')
          );

          if (duplicateError) {
            this.errorMessage.set(
              'No se pudieron generar las facturas. Uno o más números de factura ya existen en el sistema. Por favor, verifica la numeración e intenta nuevamente.'
            );
          } else {
            this.errorMessage.set(
              'Ocurrió un error al generar las facturas. Por favor, revisa los datos e intenta nuevamente.'
            );
          }
          this.isGeneratingBulkInvoices.set(false);
        } else {
          // Todas las facturas se crearon exitosamente
          const successCount =
            data?.successful?.length || invoicesToCreate.length;
          this.toastService.showSuccess(
            `Se ${
              successCount === 1 ? 'generó' : 'generaron'
            } ${successCount} ${
              successCount === 1 ? 'factura' : 'facturas'
            } exitosamente`
          );
          this.closeModal();
          this.errorMessage.set(null);
          this.isGeneratingBulkInvoices.set(false);
          // Recargar datos después de generar
          this.loadKPIs();
          this.loadPendingInvoices();
          this.loadExistingInvoices();
          this.loadLastInvoiceNumber();
        }
      },
      error: () => {
        this.isGeneratingBulkInvoices.set(false);
        this.errorMessage.set(
          'Ocurrió un error al generar las facturas. Por favor, intenta nuevamente.'
        );
      },
    });
  }

  /**
   * Actualiza el número de factura de un paciente
   */
  updateInvoiceNumber(dni: string, newNumber: string) {
    const invoices = this.invoicesToGenerate();
    const index = invoices.findIndex((inv) => inv.dni === dni);
    if (index !== -1) {
      const updated = [...invoices];
      updated[index] = { ...updated[index], invoice_number: newNumber };
      this.invoicesToGenerate.set(updated);
    }
  }

  /**
   * Actualiza la fecha de emisión de un paciente
   */
  updateInvoiceDate(dni: string, newDate: string) {
    const invoices = this.invoicesToGenerate();
    const index = invoices.findIndex((inv) => inv.dni === dni);
    if (index !== -1) {
      const updated = [...invoices];
      updated[index] = { ...updated[index], invoice_date: newDate };
      this.invoicesToGenerate.set(updated);
    }
  }

  /**
   * Vista previa de la factura
   */
  previewInvoice(dni: string) {
    const invoice = this.invoicesToGenerate().find((inv) => inv.dni === dni);
    if (invoice) {
      this.previewInvoiceData.set(invoice);
      this.isPreviewModalOpen.set(true);
    }
  }

  /**
   * Vista previa de una factura pendiente
   */
  previewPendingInvoice(invoice: PendingInvoice) {
    // Convertir PendingInvoice a InvoicePreviewData
    const previewData: InvoicePreviewData = {
      patient_full_name: invoice.patient_full_name,
      dni: invoice.dni,
      email: invoice.email,
      pending_sessions_count: invoice.pending_sessions_count,
      total_gross: invoice.total_gross,
      invoice_number: `${this.invoicePrefix()}-${this.invoiceYear()}-${this.padNumber(
        this.invoiceNextNumber()
      )}`,
      invoice_date: new Date().toISOString().split('T')[0],
      sessions: invoice.sessions,
    };

    this.previewInvoiceData.set(previewData);
    this.isPreviewModalOpen.set(true);
  }

  /**
   * Vista previa de una factura existente
   */
  previewExistingInvoice(invoice: ExistingInvoice) {
    // Convertir ExistingInvoice a InvoicePreviewData
    const previewData: InvoicePreviewData = {
      patient_full_name: invoice.patient_full_name,
      dni: invoice.dni,
      email: invoice.email,
      pending_sessions_count: invoice.sessions_count,
      total_gross: invoice.total,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      sessions: invoice.sessions,
    };

    this.previewInvoiceData.set(previewData);
    this.isPreviewModalOpen.set(true);
  }

  /**
   * Carga las facturas existentes de clínicas para el mes y año seleccionados
   */
  loadExistingClinicInvoices() {
    this.isLoadingExistingClinics.set(true);
    this.billingService
      .getExistingClinicInvoices(
        this.existingClinicMonth(),
        this.existingClinicYear()
      )
      .subscribe({
        next: (invoices) => {
          this.existingClinicInvoices.set(invoices);
          this.isLoadingExistingClinics.set(false);
        },
        error: (error) => {
          console.error(
            'Error al cargar facturas existentes de clínicas:',
            error
          );
          this.toastService.showError(
            'Error al cargar las facturas existentes de clínicas'
          );
          this.existingClinicInvoices.set([]);
          this.isLoadingExistingClinics.set(false);
        },
      });
  }

  /**
   * Maneja el cambio de mes para facturas existentes de clínicas
   */
  onExistingClinicMonthChange(month: number | Event) {
    const monthValue =
      typeof month === 'number'
        ? month
        : parseInt((month.target as HTMLSelectElement).value);
    this.existingClinicMonth.set(monthValue);
    this.loadExistingClinicInvoices();
  }

  /**
   * Maneja el cambio de año para facturas existentes de clínicas
   */
  onExistingClinicYearChange(year: number | Event) {
    const yearValue =
      typeof year === 'number'
        ? year
        : parseInt((year.target as HTMLSelectElement).value);
    this.existingClinicYear.set(yearValue);
    this.loadExistingClinicInvoices();
  }

  /**
   * Vista previa de una factura existente de clínica
   */
  previewExistingClinicInvoice(clinicData: ExistingClinicInvoice) {
    // Los datos ya vienen con el desglose sessions_data desde el backend
    const clinicInvoiceData: ClinicInvoiceToGenerate = {
      clinic_id: clinicData.clinic_id,
      clinic_name: clinicData.clinic_name,
      fiscal_name: clinicData.fiscal_name,
      cif: clinicData.cif,
      billing_address: clinicData.billing_address,
      total_sessions: clinicData.total_sessions,
      sessions_data: clinicData.sessions_data,
      total_net: clinicData.total_net_clinic,
      total_net_with_irpf: clinicData.total_net_clinic, // Mostrar el neto, no el total facturado
      invoice_number: clinicData.invoice_numbers[0] || '', // Usar la primera factura del array
      invoice_date: clinicData.last_invoice_date,
      concept: clinicData.concepts[0] || '', // Usar el primer concepto del array
      total: clinicData.total_net_clinic, // Mostrar el neto, no el total facturado
    };

    this.clinicInvoiceToGenerate.set(clinicInvoiceData);
    this.isClinicPreviewModalOpen.set(true);
  }

  /**
   * Vista previa de una factura pendiente de clínica
   */
  previewPendingClinicInvoice(clinicId: number) {
    const clinicInvoice = this.prepareClinicInvoiceData(clinicId);
    if (!clinicInvoice) {
      return;
    }

    this.clinicInvoiceToGenerate.set(clinicInvoice);
    this.isClinicPreviewModalOpen.set(true);
  }

  /**
   * Cierra el modal de vista previa
   */
  closePreviewModal() {
    this.isPreviewModalOpen.set(false);
    this.previewInvoiceData.set(null);
  }

  /**
   * Imprime la factura
   */
  printInvoice() {
    window.print();
  }

  /**
   * Descarga el PDF de la factura de clínica
   */
  async downloadClinicInvoicePDF() {
    const invoice = this.clinicInvoiceToGenerate();
    if (invoice) {
      try {
        // Limpiar el nombre de la clínica para usarlo en el nombre del archivo
        const clinicNameSanitized = invoice.clinic_name
          .replace(/[^a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑüÜ]/g, '') // Eliminar caracteres especiales pero mantener acentos y ñ
          .replace(/\s+/g, '-') // Reemplazar espacios por guiones
          .toLowerCase();

        const invoiceNumberSanitized = invoice.invoice_number.replace(
          /\//g,
          '-'
        );
        const fileName = `${invoiceNumberSanitized}_${clinicNameSanitized}`;

        await this.pdfGeneratorService.generatePdfById(
          'clinic-invoice-content',
          fileName
        );
        this.toastService.showSuccess('PDF descargado correctamente');
      } catch (error) {
        console.error('Error al descargar PDF de clínica:', error);
        this.toastService.showError('Error al generar el PDF');
      }
    }
  }

  /**
   * Formatea un número como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  /**
   * Obtiene el nombre del mes de KPIs
   */
  getKpiMonthName(): string {
    return this.monthNames[this.kpiMonth() - 1];
  }

  /**
   * Obtiene el nombre del mes de facturas pendientes
   */
  getPendingMonthName(): string {
    return this.monthNames[this.pendingMonth() - 1];
  }

  /**
   * Obtiene el nombre del mes de facturas existentes
   */
  getExistingMonthName(): string {
    return this.monthNames[this.existingMonth() - 1];
  }

  /**
   * Obtiene el nombre del mes de facturas de clínicas
   */
  getClinicsMonthName(): string {
    return this.monthNames[this.clinicsMonth() - 1];
  }

  /**
   * Formatea número con padding
   */
  padNumber(num: number, length: number = 4): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Prepara los datos de una factura de clínica pendiente
   * @param clinicId ID de la clínica
   * @returns Datos de la factura o null si hay error
   */
  private prepareClinicInvoiceData(
    clinicId: number
  ): ClinicInvoiceToGenerate | null {
    // Obtener los datos de la clínica seleccionada
    const selectedClinic = this.clinicInvoices().find(
      (c) => c.clinic_id === clinicId
    );
    if (!selectedClinic) {
      return null;
    }

    const user = this.userData();
    if (!user) {
      this.toastService.showError(
        'No se pudo cargar la información del usuario'
      );
      return null;
    }

    const invoiceNumber = `${this.invoicePrefix()}-${this.invoiceYear()}-${this.padNumber(
      this.invoiceNextNumber()
    )}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    // Calcular total con IRPF
    const irpfPercentage = Number(user.irpf || 0);
    const totalNetWithIrpf =
      Number(selectedClinic.total_net_clinic) * (1 - irpfPercentage / 100);

    // Preparar datos de la factura
    return {
      clinic_id: selectedClinic.clinic_id,
      clinic_name: selectedClinic.clinic_name,
      fiscal_name: selectedClinic.clinic_name, // Usar el nombre de la clínica como fiscal_name
      cif: '', // No disponible en datos pendientes
      billing_address: '', // No disponible en datos pendientes
      total_sessions: selectedClinic.total_sessions,
      sessions_data: selectedClinic.sessions_data,
      total_net: selectedClinic.total_net_clinic,
      total_net_with_irpf: totalNetWithIrpf,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      concept: `Servicios de Psicología`,
      total: selectedClinic.total_net_clinic,
    };
  }

  /**
   * Abre el modal de confirmación para generar factura de clínica
   */
  generateClinicInvoice() {
    const clinicId = this.selectedClinicId();
    if (!clinicId) {
      return;
    }

    const clinicInvoice = this.prepareClinicInvoiceData(clinicId);
    if (!clinicInvoice) {
      return;
    }

    this.clinicInvoiceToGenerate.set(clinicInvoice);
    this.isClinicModalOpen.set(true);
  }

  /**
   * Cierra el modal de generación de factura de clínica
   */
  closeClinicModal() {
    this.isClinicModalOpen.set(false);
    this.clinicInvoiceToGenerate.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Actualiza la fecha de emisión de la factura de clínica
   */
  updateClinicInvoiceDate(newDate: string) {
    const invoice = this.clinicInvoiceToGenerate();
    if (invoice) {
      this.clinicInvoiceToGenerate.set({ ...invoice, invoice_date: newDate });
    }
  }

  /**
   * Vista previa de la factura de clínica
   */
  previewClinicInvoice() {
    const invoice = this.clinicInvoiceToGenerate();
    if (invoice) {
      this.isClinicPreviewModalOpen.set(true);
    }
  }

  /**
   * Cierra el modal de vista previa de factura de clínica
   */
  closeClinicPreviewModal() {
    this.isClinicPreviewModalOpen.set(false);
  }

  /**
   * Confirma y genera la factura de clínica desde el modal
   */
  confirmGenerateClinicInvoice() {
    const invoice = this.clinicInvoiceToGenerate();
    if (!invoice) {
      return;
    }

    this.isGeneratingBulkInvoices.set(true);

    const concept = 'Servicios de Psicología';

    this.billingService
      .emitClinicInvoice(
        invoice.clinic_id,
        this.clinicsMonth(),
        this.clinicsYear(),
        invoice.invoice_number,
        invoice.invoice_date,
        concept,
        invoice.total_net
      )
      .subscribe({
        next: (response: any) => {
          if (response?.success === false) {
            this.errorMessage.set(
              response.error || 'Error al generar la factura de la clínica'
            );
          } else {
            this.toastService.showSuccess(
              'Factura de clínica generada exitosamente'
            );
            this.closeClinicModal();
            // Recargar datos
            this.loadKPIs();
            this.loadClinicInvoices();
            this.loadExistingInvoices();
            this.loadLastInvoiceNumber();
            this.selectedClinicId.set(null);
          }
          this.isGeneratingBulkInvoices.set(false);
        },
        error: () => {
          this.errorMessage.set('Error al generar la factura de la clínica');
          this.isGeneratingBulkInvoices.set(false);
        },
      });
  }

  /**
   * Descarga masiva de facturas seleccionadas como archivo ZIP
   */
  async downloadBulkInvoices(invoices: ExistingInvoice[]): Promise<void> {
    if (invoices.length === 0) {
      return;
    }

    try {
      // Mostrar estado de carga
      this.isGeneratingBulkInvoices.set(true);
      this.toastService.showInfo(
        `Generando ${invoices.length} ${
          invoices.length === 1 ? 'factura' : 'facturas'
        }...`
      );

      // Crear un contenedor temporal oculto para renderizar las facturas
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Preparar elementos para generar PDFs
      const elementsToGenerate: Array<{
        element: HTMLElement;
        fileName: string;
      }> = [];

      for (const invoice of invoices) {
        // Crear un wrapper temporal para cada factura
        const invoiceWrapper = document.createElement('div');
        invoiceWrapper.id = `temp-invoice-${invoice.id}`;
        invoiceWrapper.innerHTML = this.generateInvoiceHTML(invoice);
        tempContainer.appendChild(invoiceWrapper);

        // Sanitizar el nombre del paciente para el nombre del archivo
        const patientNameSanitized = invoice.patient_full_name
          .replace(/[^a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑüÜ]/g, '') // Eliminar caracteres especiales pero mantener acentos y ñ
          .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
          .toLowerCase();

        // Agregar a la lista de elementos con formato: numero-factura_nombre-paciente
        elementsToGenerate.push({
          element: invoiceWrapper,
          fileName: `${invoice.invoice_number.replace(
            /\//g,
            '-'
          )}_${patientNameSanitized}`,
        });
      }

      // Esperar un momento para que el DOM se renderice
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generar el ZIP con progreso
      const today = new Date().toISOString().split('T')[0];
      await this.pdfGeneratorService.generateBulkPdfsAsZip(
        elementsToGenerate,
        `facturas_${today}`,
        (current: number, total: number) => {
          console.log(`Procesando factura ${current} de ${total}`);
        }
      );

      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);

      // Mostrar éxito
      this.toastService.showSuccess(
        `${invoices.length} ${
          invoices.length === 1 ? 'factura descargada' : 'facturas descargadas'
        } exitosamente`
      );
    } catch (error) {
      console.error('Error generando descarga masiva:', error);
      this.toastService.showError('Error al generar las facturas');
    } finally {
      this.isGeneratingBulkInvoices.set(false);
    }
  }

  /**
   * Genera el HTML de una factura de paciente para renderizar temporalmente
   * Las facturas a pacientes NO llevan retención IRPF (solo las de clínicas)
   */
  private generateInvoiceHTML(invoice: ExistingInvoice): string {
    const user = this.userData();

    // Construir dirección del profesional
    const userAddress = user
      ? `${user.street || ''} ${user.street_number || ''}${user.door ? `, ${user.door}` : ''}`
      : '';
    const userLocation = user
      ? `${user.postal_code || ''} ${user.city || ''}, ${user.province || ''}`
      : '';

    return `
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 32px; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h1 style="font-size: 36px; font-weight: 900; color: #d29f67; margin: 0;">FACTURA</h1>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${
                invoice.invoice_number
              }</div>
              <div style="color: #6b7280;">Fecha: ${invoice.invoice_date}</div>
            </div>
          </div>
        </div>

        <!-- Emisor y Receptor -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
          <!-- Datos del Emisor -->
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">DATOS DEL EMISOR</h3>
            <div style="color: #374151;">
              <div style="font-weight: 600;">${user?.name || 'N/A'}</div>
              <div>DNI: ${user?.dni || 'N/A'}</div>
              <div>${userAddress}</div>
              <div>${userLocation}</div>
            </div>
          </div>
          <!-- Datos del Receptor -->
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">DATOS DEL RECEPTOR</h3>
            <div style="color: #374151;">
              <div style="font-weight: 600;">${invoice.patient_full_name}</div>
              <div>DNI: ${invoice.dni}</div>
              <div>Email: ${invoice.email}</div>
            </div>
          </div>
        </div>

        <!-- Tabla de conceptos -->
        <div style="margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px;">
            <thead style="background-color: #f9fafb;">
              <tr>
                <th style="padding: 12px 16px; text-align: center; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Cantidad</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Descripción</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Precio Unitario</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: white;">
                <td style="padding: 12px 16px; text-align: center; font-weight: 500; color: #111827;">${
                  invoice.sessions_count
                }</td>
                <td style="padding: 12px 16px; color: #374151;">${
                  invoice.concept
                }</td>
                <td style="padding: 12px 16px; text-align: right; color: #374151;">${this.formatCurrency(
                  invoice.total / invoice.sessions_count
                )}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 500; color: #111827;">${this.formatCurrency(
                  invoice.total
                )}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <div style="width: 384px;">
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px;">
              <div style="margin-bottom: 12px; display: flex; justify-content: space-between; color: #374151;">
                <span>SERV. DE ATENCIÓN PSICOLÓGICA:</span>
                <span style="font-weight: 600;">${this.formatCurrency(
                  invoice.total
                )}</span>
              </div>
              <div style="margin-bottom: 12px; display: flex; justify-content: space-between; color: #374151;">
                <span>IVA (EXENTO):</span>
                <span>0,00€</span>
              </div>
              <div style="border-top: 1px solid #d1d5db; padding-top: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #111827;">
                  <span>TOTAL:</span>
                  <span style="color: #16a34a;">${this.formatCurrency(
                    invoice.total
                  )}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nota legal -->
        <div style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 16px;">
          <p style="margin: 0;">Servicio exento de IVA según el artículo 20 3a de la ley 37/1992 del impuesto sobre el Valor Añadido.</p>
        </div>
      </div>
    `;
  }
}
