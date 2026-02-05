import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SessionData, SessionUtils } from '../../shared/models/session.model';
import { ClinicSelectorComponent } from '../../shared/components/clinic-selector/clinic-selector.component';
import { HttpClient } from '@angular/common/http';
import { Clinic } from '../clinics/models/clinic.model';
import { environment } from '../../../environments/environment';

interface SessionFilters {
  clinicIds: number[];
  sessionType: string | null;
  status: string | null;
  paymentMethods: string[];
  dateFrom: string;
  dateTo: string;
}

interface SessionStats {
  total: number;
  completada: number;
  cancelada: number;
  totalRevenueBrute: number;
  totalRevenueNet: number;
}

interface SessionKPIs {
  sesiones_completadas: number;
  sesiones_canceladas: number;
  ingresos_brutos: number;
  ingresos_netos: number;
}

/**
 * Session management feature component
 *
 * This component provides session management functionality including:
 * - Session listing and filtering
 * - Session creation and editing
 * - Session status management
 * - Integration with calendar system
 *
 * @example
 * ```html
 * <app-session></app-session>
 * ```
 */
@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClinicSelectorComponent],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionComponent implements OnInit {
  private http = inject(HttpClient);

  // Expose Math for template
  Math = Math;

  // State signals
  allSessions = signal<SessionData[]>([]); // All sessions from API
  sessions = signal<SessionData[]>([]); // Current page sessions
  clinics = signal<Clinic[]>([]);
  isLoading = signal(false);
  isDownloading = signal(false);
  totalSessions = signal(0);
  kpis = signal<SessionKPIs>({
    sesiones_completadas: 0,
    sesiones_canceladas: 0,
    ingresos_brutos: 0,
    ingresos_netos: 0,
  });

  // Filter controls
  clinicControl = new FormControl<number[]>([]);

  // Date validation signals
  dateFromError = signal<string | null>(null);
  dateToError = signal<string | null>(null);

  // Filter signals with initial dates
  filters = signal<SessionFilters>({
    clinicIds: [],
    sessionType: null,
    status: null,
    paymentMethods: [],
    dateFrom: this.getFirstDayOfMonth(),
    dateTo: this.getLastDayOfMonth(),
  });

  // Payment method dropdown state
  paymentDropdownOpen = signal(false);
  paymentMethodOptions = [
    { value: 'bizum', label: 'Bizum' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  // Pagination signals (frontend only)
  currentPage = signal(1);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];

  // Computed values - Calculate stats from all sessions
  stats = computed(() => {
    const allSessions = this.allSessions();
    const stats: SessionStats = {
      total: this.totalSessions(),
      completada: 0,
      cancelada: 0,
      totalRevenueBrute: 0,
      totalRevenueNet: 0,
    };

    // Calculate stats from all sessions (not just current page)
    allSessions.forEach((session) => {
      const status = this.getSessionStatus(session);
      if (status === 'completada') {
        stats.completada++;
        // Sumar ingresos brutos (precio base) - convert to number
        stats.totalRevenueBrute +=
          Number(session.SessionDetailData.price_brute) || 0;
        // Sumar ingresos netos (lo que recibe la profesional desde el backend) - convert to number
        stats.totalRevenueNet += Number(session.SessionDetailData.net_price) || 0;
      }
      if (status === 'cancelada') stats.cancelada++;
    });

    return stats;
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalSessions() / this.pageSize());
  });

  ngOnInit(): void {
    this.loadClinics();
    this.loadSessions();
    this.loadKPIs();
    this.setupClinicControlSubscription();
  }

  private loadClinics(): void {
    this.http
      .get<{ data: Clinic[] }>(`${environment.api.baseUrl}/clinics`)
      .subscribe({
        next: (response) => {
          this.clinics.set(response.data);
        },
        error: (error) => {
          console.error('Error loading clinics:', error);
        },
      });
  }

  private setupClinicControlSubscription(): void {
    // Solo actualizar el estado local, NO hacer llamada al servidor
    // La llamada al servidor se hace cuando el usuario hace clic en "Aplicar" del selector
    this.clinicControl.valueChanges.subscribe((value) => {
      this.filters.update((f) => ({ ...f, clinicIds: value || [] }));
    });
  }

  /**
   * Called when user clicks "Aplicar" in the clinic selector
   */
  onClinicFilterApplied(): void {
    this.applyFilters();
  }

  private loadSessions(): void {
    const currentFilters = this.filters();

    // Build query params - always request 7000 sessions
    const queryParts: string[] = ['page=1', 'limit=7000'];

    if (currentFilters.clinicIds && currentFilters.clinicIds.length > 0) {
      currentFilters.clinicIds.forEach((id) => {
        queryParts.push(`clinic_id=${id}`);
      });
    }

    if (currentFilters.status) {
      queryParts.push(`status=${currentFilters.status}`);
    }

    if (currentFilters.paymentMethods && currentFilters.paymentMethods.length > 0) {
      currentFilters.paymentMethods.forEach((method) => {
        queryParts.push(`payment_method=${method}`);
      });
    }

    if (currentFilters.dateFrom) {
      queryParts.push(`fecha_desde=${currentFilters.dateFrom}`);
    }

    if (currentFilters.dateTo) {
      queryParts.push(`fecha_hasta=${currentFilters.dateTo}`);
    }

    // Build query string
    const queryString = queryParts.join('&');

    this.http
      .get<any>(`${environment.api.baseUrl}/sessions?${queryString}`)
      .subscribe({
        next: (response) => {
          // Store all sessions
          this.allSessions.set(response.data);
          this.totalSessions.set(response.data.length);

          // Apply frontend pagination
          this.updatePaginatedSessions();
        },
        error: (error) => {
          console.error('Error loading sessions:', error);
        },
      });
  }

  private loadKPIs(): void {
    const currentFilters = this.filters();

    // Build query params with same filters as loadSessions
    const queryParts: string[] = [];

    if (currentFilters.clinicIds && currentFilters.clinicIds.length > 0) {
      currentFilters.clinicIds.forEach((id) => {
        queryParts.push(`clinic_id=${id}`);
      });
    }

    if (currentFilters.status) {
      queryParts.push(`status=${currentFilters.status}`);
    }

    if (currentFilters.paymentMethods && currentFilters.paymentMethods.length > 0) {
      currentFilters.paymentMethods.forEach((method) => {
        queryParts.push(`payment_method=${method}`);
      });
    }

    if (currentFilters.dateFrom) {
      queryParts.push(`fecha_desde=${currentFilters.dateFrom}`);
    }

    if (currentFilters.dateTo) {
      queryParts.push(`fecha_hasta=${currentFilters.dateTo}`);
    }

    // Build query string
    const queryString = queryParts.join('&');

    this.http
      .get<{ data: SessionKPIs }>(
        `${environment.api.baseUrl}/sessions/kpis?${queryString}`
      )
      .subscribe({
        next: (response) => {
          this.kpis.set(response.data);
        },
        error: (error) => {
          console.error('Error loading KPIs:', error);
        },
      });
  }

  private updatePaginatedSessions(): void {
    const allSessions = this.allSessions();
    const page = this.currentPage();
    const size = this.pageSize();

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    this.sessions.set(allSessions.slice(startIndex, endIndex));
  }

  onFilterChange(filterName: keyof SessionFilters, value: any): void {
    // Handle empty date values - reset to defaults
    if (filterName === 'dateFrom' && (!value || value === '')) {
      this.filters.update((f) => ({
        ...f,
        dateFrom: this.getFirstDayOfMonth(),
      }));
      this.dateFromError.set(null);
      this.applyFilters();
      return;
    }

    if (filterName === 'dateTo' && (!value || value === '')) {
      this.filters.update((f) => ({ ...f, dateTo: this.getLastDayOfMonth() }));
      this.dateToError.set(null);
      this.applyFilters();
      return;
    }

    this.filters.update((f) => ({ ...f, [filterName]: value }));

    // Validate dates when they change
    if (filterName === 'dateFrom' || filterName === 'dateTo') {
      this.validateDates();
    }

    // Auto-apply filters if validations pass (excepto clinicIds que se maneja por separado)
    if (filterName !== 'clinicIds' && !this.dateFromError() && !this.dateToError()) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    // Validate dates before applying filters
    this.validateDates();

    // Only load data if dates are valid
    if (!this.dateFromError() && !this.dateToError()) {
      this.currentPage.set(1);
      this.loadSessions();
      this.loadKPIs();
    }
  }

  clearFilters(): void {
    this.filters.set({
      clinicIds: [],
      sessionType: null,
      status: null,
      paymentMethods: [],
      dateFrom: this.getCurrentMonth(),
      dateTo: this.getTodayDate(),
    });
    this.clinicControl.setValue([]);
    this.dateFromError.set(null);
    this.dateToError.set(null);
    this.paymentDropdownOpen.set(false);
    this.applyFilters();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1);
    this.updatePaginatedSessions();
  }

  // Payment method multi-select methods
  togglePaymentDropdown(): void {
    this.paymentDropdownOpen.update((v) => !v);
  }

  closePaymentDropdown(): void {
    this.paymentDropdownOpen.set(false);
  }

  togglePaymentMethod(method: string): void {
    const currentMethods = this.filters().paymentMethods;
    const index = currentMethods.indexOf(method);

    if (index === -1) {
      // Add method
      this.filters.update((f) => ({
        ...f,
        paymentMethods: [...f.paymentMethods, method],
      }));
    } else {
      // Remove method
      this.filters.update((f) => ({
        ...f,
        paymentMethods: f.paymentMethods.filter((m) => m !== method),
      }));
    }
  }

  isPaymentMethodSelected(method: string): boolean {
    return this.filters().paymentMethods.includes(method);
  }

  getSelectedPaymentMethodsLabel(): string {
    const selected = this.filters().paymentMethods;
    if (selected.length === 0) {
      return 'Todos los métodos';
    }
    if (selected.length === 1) {
      const option = this.paymentMethodOptions.find((o) => o.value === selected[0]);
      return option?.label || selected[0];
    }
    return `${selected.length} métodos seleccionados`;
  }

  getSelectedPaymentMethodsChips(): { value: string; label: string }[] {
    return this.filters().paymentMethods.map((method) => {
      const option = this.paymentMethodOptions.find((o) => o.value === method);
      return { value: method, label: option?.label || method };
    });
  }

  removePaymentMethod(method: string): void {
    this.filters.update((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.filter((m) => m !== method),
    }));
    this.applyFilters();
  }

  applyPaymentMethodsFilter(): void {
    this.paymentDropdownOpen.set(false);
    this.applyFilters();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.updatePaginatedSessions();
  }

  getSessionStatus(session: SessionData): 'completada' | 'cancelada' {
    return session.SessionDetailData.status;
  }

  getStatusClass(status: string): string {
    const classes = {
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return (
      classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
    );
  }

  getStatusText(status: string): string {
    const texts = {
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return texts[status as keyof typeof texts] || status;
  }

  getModeClass(mode: string | null): string {
    if (mode === null) {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
    const classes = {
      presencial: 'bg-blue-100 text-blue-800 border-blue-200',
      online: 'bg-purple-100 text-purple-800 border-purple-200',
      telefónica: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return (
      classes[mode as keyof typeof classes] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  }

  formatMode(mode: string | null): string {
    if (mode === null) {
      return 'No aplica';
    }
    return mode;
  }

  getPaymentMethodClass(method: string | null): string {
    if (method === null) {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
    const classes = {
      bizum: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      transferencia: 'bg-blue-100 text-blue-800 border-blue-200',
      tarjeta: 'bg-violet-100 text-violet-800 border-violet-200',
      efectivo: 'bg-amber-100 text-amber-800 border-amber-200',
      pendiente: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      classes[method as keyof typeof classes] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  }

  formatPaymentMethod(method: string | null): string {
    if (method === null) {
      return 'No aplica';
    }
    return SessionUtils.formatPaymentMethod(method);
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // If no total pages, return empty array
    if (total === 0) {
      return [];
    }

    // Show max 5 pages
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Date helper methods
  private getTodayDate(): string {
    const today = new Date();
    return this.formatDateToISO(today);
  }

  /**
   * Gets the first day of the current month
   * @returns Date string in format YYYY-MM-01
   */
  private getFirstDayOfMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  /**
   * Gets the last day of the current month (handles 28, 30, 31 days)
   * @returns Date string in format YYYY-MM-DD
   */
  private getLastDayOfMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    // Create date for the first day of next month, then subtract one day
    const lastDay = new Date(year, month + 1, 0);
    return this.formatDateToISO(lastDay);
  }

  private getCurrentMonth(): string {
    const today = new Date();
    today.setMonth(today.getMonth());
    return this.formatDateToISO(today);
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private validateDates(): void {
    const currentFilters = this.filters();
    let dateFrom = currentFilters.dateFrom;
    let dateTo = currentFilters.dateTo;

    // Reset errors
    this.dateFromError.set(null);
    this.dateToError.set(null);

    // If dates are empty, set to defaults (day 1 and last day of month)
    if (!dateFrom || dateFrom === '') {
      dateFrom = this.getFirstDayOfMonth();
      this.filters.update((f) => ({ ...f, dateFrom }));
    }

    if (!dateTo || dateTo === '') {
      dateTo = this.getLastDayOfMonth();
      this.filters.update((f) => ({ ...f, dateTo }));
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Validate: dateFrom cannot be greater than dateTo
    if (fromDate > toDate) {
      this.dateFromError.set(
        'La fecha desde no puede ser mayor a la fecha hasta'
      );
      this.dateToError.set(
        'La fecha hasta no puede ser menor a la fecha desde'
      );
      return;
    }

    // Validate: range cannot exceed 3 years (1095 days)
    const diffInMs = toDate.getTime() - fromDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const threeYearsInDays = 365 * 3;

    if (diffInDays > threeYearsInDays) {
      this.dateFromError.set('El rango no puede superar 3 años');
      this.dateToError.set('El rango no puede superar 3 años');
    }
  }

  /**
   * Calcula la comisión de la clínica.
   * @param price El precio base de la sesión.
   * @param netPrice El precio neto que recibe la profesional.
   * @returns La comisión de la clínica (price - netPrice).
   */
  calcularComision(price: number, netPrice: number): number {
    if (!price || !netPrice) {
      return 0;
    }
    return price - netPrice;
  }

  /**
   * Downloads an Excel file with the filtered sessions.
   */
  downloadExcel(): void {
    if (this.isDownloading()) return;

    this.isDownloading.set(true);
    const currentFilters = this.filters();

    // Build request body with the same filters used for loading sessions
    const body: any = {};

    if (currentFilters.clinicIds && currentFilters.clinicIds.length > 0) {
      body.clinic_id = currentFilters.clinicIds;
    }

    if (currentFilters.status) {
      body.status = currentFilters.status;
    }

    if (currentFilters.paymentMethods && currentFilters.paymentMethods.length > 0) {
      body.payment_method = currentFilters.paymentMethods;
    }

    if (currentFilters.dateFrom) {
      body.fecha_desde = currentFilters.dateFrom;
    }

    if (currentFilters.dateTo) {
      body.fecha_hasta = currentFilters.dateTo;
    }

    this.http
      .post(`${environment.api.baseUrl}/sessions/export`, body, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Generate filename with current date
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          link.download = `sesiones_${dateStr}.xlsx`;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.isDownloading.set(false);
        },
        error: (error) => {
          console.error('Error downloading Excel:', error);
          this.isDownloading.set(false);
        },
      });
  }
}
