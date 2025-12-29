import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SessionData,
  SessionUtils,
} from '../../shared/models/session.model';
import {
  CLINIC_CONFIGS,
  ClinicConfig,
} from '../../shared/models/clinic-config.model';
import { CalendarService } from './services/calendar.service';
import { NewSessionFormComponent } from './components/new-sesion-dialog/new-session-form.component';

/**
 * Representa un fragmento de sesión dentro de un slot horario específico
 */
interface SessionFragment {
  sessionData: SessionData;
  slotHour: string; // "17:00"
  topPercent: number; // Posición top en porcentaje (0-100)
  heightPercent: number; // Altura en porcentaje (0-100)
  isCancelled: boolean;
}

/**
 * Información de layout para posicionar sesiones con colisiones
 */
interface SessionLayout extends SessionFragment {
  leftPercent: number; // Posición left en porcentaje (0-100)
  widthPercent: number; // Ancho en porcentaje (0-100)
  zIndex: number; // z-index para control de apilamiento
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NewSessionFormComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit {
  private calendarService = inject(CalendarService);

  ngOnInit(): void {
    this.calendarService.reloadSessions();
  }

  @ViewChild('weekDateInput') weekDateInput?: ElementRef<HTMLInputElement>;
  @ViewChild('monthInput') monthInput?: ElementRef<HTMLInputElement>;

  readonly currentDate = this.calendarService.currentDate;
  readonly currentView = this.calendarService.currentView;
  readonly selectedSessionData = this.calendarService.selectedSessionData;
  readonly sessionData = this.calendarService.sessionData;
  readonly weekDates = this.calendarService.weekDates;
  readonly monthDates = this.calendarService.monthDates;
  readonly sessionDataForCurrentPeriod =
    this.calendarService.sessionDataForCurrentPeriod;

  readonly showSessionPopup = signal(false);
  readonly showNewSessionDialog = signal(false);
  readonly showReminderConfirmModal = signal(false);
  readonly pendingReminderSession = signal<SessionData | null>(null);
  readonly clinicConfigs = CLINIC_CONFIGS;

  // Tooltip state
  readonly hoveredSession = signal<SessionData | null>(null);
  readonly tooltipPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Data to prefill when creating new session from calendar
  prefilledSessionData: {
    date: string;
    startTime: string | null;
    sessionData?: SessionData;
  } | null = null;

  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly monthNames = [
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

  readonly hours = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  setView(view: 'week' | 'month'): void {
    this.calendarService.setCurrentView(view);
  }

  navigatePrevious(): void {
    this.calendarService.navigatePrevious();
  }

  navigateNext(): void {
    this.calendarService.navigateNext();
  }

  navigateToToday(): void {
    this.calendarService.navigateToToday();
  }

  onDateSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [year, month] = input.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, 1);
    this.calendarService.setCurrentDate(newDate);
    this.calendarService.reloadSessions();
  }

  onWeekDateSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value + 'T00:00:00');
    this.calendarService.setCurrentDate(selectedDate);
    this.calendarService.reloadSessions();
  }

  getCurrentMonthValue(): string {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  getCurrentDateValue(): string {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      input.showPicker();
    }
  }

  openWeekDatePicker(): void {
    if (this.weekDateInput?.nativeElement && typeof this.weekDateInput.nativeElement.showPicker === 'function') {
      this.weekDateInput.nativeElement.showPicker();
    }
  }

  openMonthPicker(): void {
    if (this.monthInput?.nativeElement && typeof this.monthInput.nativeElement.showPicker === 'function') {
      this.monthInput.nativeElement.showPicker();
    }
  }

  onSessionClick(sessionData: SessionData): void {
    // Open the session form in edit mode instead of showing popup
    this.prefilledSessionData = {
      date: sessionData.SessionDetailData.session_date,
      startTime: sessionData.SessionDetailData.start_time.substring(0, 5),
      sessionData: sessionData, // Add the full session data for editing
    };
    this.showNewSessionDialog.set(true);
  }

  onNewSessionClick(): void {
    this.showNewSessionDialog.set(true);
  }

  onNewSessionClickForDateTime(date: Date, hour: string): void {
    // Pre-fill the form with the selected date and hour
    this.prefilledSessionData = {
      date: this.formatDateForInput(date),
      startTime: hour,
    };
    this.showNewSessionDialog.set(true);
  }

  onNewSessionClickForDate(date: Date): void {
    // Pre-fill the form with the selected date
    this.prefilledSessionData = {
      date: this.formatDateForInput(date),
      startTime: null,
    };
    this.showNewSessionDialog.set(true);
  }

  private formatDateForInput(date: Date): string {
    // Format date in local timezone to avoid timezone offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCloseSessionPopup(): void {
    this.showSessionPopup.set(false);
    this.calendarService.setSelectedSessionData(null);
  }

  onCloseNewSessionDialog(): void {
    this.showNewSessionDialog.set(false);
    this.prefilledSessionData = null;
  }

  onSessionDataCreated(sessionData: SessionData): void {
    this.showNewSessionDialog.set(false);
    this.prefilledSessionData = null;

    // Wait a moment for the API to process, then reload sessions
    setTimeout(() => {
      this.calendarService.reloadSessions();
    }, 100);
  }

  getClinicConfig(clinicId: number): ClinicConfig {
    return (
      this.clinicConfigs.find((config) => config.id === clinicId) ||
      this.clinicConfigs[0]
    );
  }

  getSessionDataForDate(date: Date): SessionData[] {
    return this.calendarService.getSessionDataForDate(date);
  }

  getSessionDataForDateAndHour(date: Date, hour: string): SessionData[] {
    const sessions = this.getSessionDataForDate(date);
    return sessions.filter((data) => {
      const sessionHour = data.SessionDetailData.start_time.substring(0, 5);
      return sessionHour === hour;
    });
  }

  getPatientNameFromSessionData(sessionData: SessionData): string {
    return sessionData.SessionDetailData.PatientData.name;
  }

  getClinicNameFromSessionData(sessionData: SessionData): string {
    return sessionData.SessionDetailData.ClinicDetailData.clinic_name || 'Sin clínica';
  }

  formatDate(date: Date): string {
    return date.getDate().toString();
  }

  formatMonthYear(date: Date): string {
    return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  formatWeekRange(dates: Date[]): string {
    if (dates.length === 0) return '';

    const start = dates[0];
    const end = dates[6];

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${
        this.monthNames[start.getMonth()]
      } ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${
        this.monthNames[start.getMonth()]
      } - ${end.getDate()} ${
        this.monthNames[end.getMonth()]
      } ${start.getFullYear()}`;
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    const current = this.currentDate();
    return date.getMonth() === current.getMonth();
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  getSessionStatusBadgeClass(sessionData: SessionData): string {
    return SessionUtils.getStatusBadgeClass(sessionData);
  }

  getSessionStatusText(sessionData: SessionData): string {
    return SessionUtils.getStatusText(sessionData);
  }

  formatPrice(price: number): string {
    return SessionUtils.formatPrice(price);
  }

  formatPaymentMethod(method: string): string {
    return SessionUtils.formatPaymentMethod(method);
  }

  onSendReminder(sessionData: SessionData, event: Event): void {
    event.stopPropagation(); // Prevenir que se abra el popup de sesión
    this.pendingReminderSession.set(sessionData);
    this.showReminderConfirmModal.set(true);
  }

  getFormattedSessionDate(sessionData: SessionData): string {
    return new Date(
      sessionData.SessionDetailData.session_date
    ).toLocaleDateString('es-ES');
  }

  getFormattedSessionTime(sessionData: SessionData): string {
    return sessionData.SessionDetailData.start_time.substring(0, 5);
  }

  getClinicConfigFromSessionData(sessionData: SessionData): ClinicConfig & { hasCustomColor: boolean } {
    const clinicData = sessionData.SessionDetailData.ClinicDetailData;
    const clinicId = clinicData.clinic_id;
    const apiColor = clinicData.clinic_color;

    // If we have a color from the API, use it
    if (apiColor) {
      return {
        id: clinicId || 0,
        name: clinicData.clinic_name || 'Sin clínica',
        color: 'text-white',
        backgroundColor: '', // We'll use inline styles for custom colors
        borderColor: '',
        hasCustomColor: true
      };
    }

    // Fallback to hardcoded configs if no color from API
    const config = this.clinicConfigs.find((config) => config.id === clinicId) || this.clinicConfigs[0];
    return {
      ...config,
      hasCustomColor: false
    };
  }

  getClinicColorFromSessionData(sessionData: SessionData): string | null {
    return sessionData.SessionDetailData.ClinicDetailData.clinic_color;
  }

  getVisibleClinics(): Array<{ id: number | null; name: string; color: string; hasCustomColor: boolean }> {
    const sessions = this.sessionDataForCurrentPeriod();
    const clinicsMap = new Map<number | null, { id: number | null; name: string; color: string; hasCustomColor: boolean }>();

    sessions.forEach(session => {
      const clinicData = session.SessionDetailData.ClinicDetailData;
      const clinicId = clinicData.clinic_id;
      const clinicName = clinicData.clinic_name || 'Sin clínica';
      const clinicColor = clinicData.clinic_color;

      if (!clinicsMap.has(clinicId)) {
        if (clinicColor) {
          // Clinic with custom color from API
          clinicsMap.set(clinicId, {
            id: clinicId,
            name: clinicName,
            color: clinicColor,
            hasCustomColor: true
          });
        } else {
          // Fallback to hardcoded config
          const config = this.clinicConfigs.find(c => c.id === clinicId) || this.clinicConfigs[0];
          const colorMatch = config.backgroundColor.match(/bg-\[([^\]]+)\]|bg-(\w+-\d+)/);
          let hexColor = '#d29f67'; // default color

          if (colorMatch) {
            const colorValue = colorMatch[1] || colorMatch[2];
            // Simple mapping for common Tailwind colors to hex
            const colorMap: Record<string, string> = {
              'green-500': '#10b981',
              'purple-500': '#8b5cf6',
              'orange-500': '#f97316',
              'pink-500': '#ec4899',
              'yellow-500': '#eab308',
              'blue-500': '#3b82f6'
            };
            hexColor = colorMap[colorValue] || colorValue.startsWith('#') ? colorValue : hexColor;
          }

          clinicsMap.set(clinicId, {
            id: clinicId,
            name: clinicName,
            color: hexColor,
            hasCustomColor: false
          });
        }
      }
    });

    return Array.from(clinicsMap.values()).sort((a, b) => {
      if (a.id === null) return 1;
      if (b.id === null) return -1;
      return (a.id || 0) - (b.id || 0);
    });
  }

  isSessionCancelled(sessionData: SessionData): boolean {
    return (
      sessionData.SessionDetailData.status === 'cancelada' ||
      sessionData.SessionDetailData.cancelled
    );
  }

  isSessionPaid(sessionData: SessionData): boolean {
    return sessionData.SessionDetailData.payment_method !== 'pendiente';
  }

  hasActiveSessionInSlot(date: Date, hour: string): boolean {
    const sessions = this.getSessionDataForDateAndHour(date, hour);
    return sessions.some((session) => !this.isSessionCancelled(session));
  }

  hasActiveSessionInDate(date: Date): boolean {
    const sessions = this.getSessionDataForDate(date);
    return sessions.some((session) => !this.isSessionCancelled(session));
  }

  getSortedSessionDataForDateAndHour(date: Date, hour: string): SessionData[] {
    const sessions = this.getSessionDataForDateAndHour(date, hour);
    return sessions.sort((a, b) => {
      const aIsCancelled = this.isSessionCancelled(a);
      const bIsCancelled = this.isSessionCancelled(b);

      // Active sessions (not cancelled) come first
      if (!aIsCancelled && bIsCancelled) return -1;
      if (aIsCancelled && !bIsCancelled) return 1;
      return 0; // Same status, maintain original order
    });
  }

  getSortedSessionDataForDate(date: Date): SessionData[] {
    const sessions = this.getSessionDataForDate(date);
    return sessions.sort((a, b) => {
      const aIsCancelled = this.isSessionCancelled(a);
      const bIsCancelled = this.isSessionCancelled(b);

      // Active sessions (not cancelled) come first
      if (!aIsCancelled && bIsCancelled) return -1;
      if (aIsCancelled && !bIsCancelled) return 1;

      // If same status (both active or both cancelled), sort by start time
      const aStartTime = a.SessionDetailData.start_time;
      const bStartTime = b.SessionDetailData.start_time;
      return aStartTime.localeCompare(bStartTime);
    });
  }

  /**
   * Calcula los fragmentos de sesiones para un slot horario específico
   * Una sesión puede cruzar múltiples slots (ej: 17:30-18:30)
   */
  getSessionFragmentsForSlot(date: Date, hour: string): SessionFragment[] {
    const allSessionsForDate = this.getSessionDataForDate(date);
    const fragments: SessionFragment[] = [];

    // Parse slot hour (ej: "17:00" -> 17.0)
    const [slotHourNum, slotMinNum] = hour.split(':').map(Number);
    const slotStartMinutes = slotHourNum * 60 + slotMinNum;
    const slotEndMinutes = slotStartMinutes + 60; // Cada slot es de 1 hora

    allSessionsForDate.forEach(sessionData => {
      const startTime = sessionData.SessionDetailData.start_time; // "17:30:00"
      const endTime = sessionData.SessionDetailData.end_time; // "18:30:00"

      // Parse session times to minutes
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const sessionStartMinutes = startHour * 60 + startMin;
      const sessionEndMinutes = endHour * 60 + endMin;

      // Check if session overlaps with this slot
      const overlaps = sessionStartMinutes < slotEndMinutes && sessionEndMinutes > slotStartMinutes;

      if (overlaps) {
        // Calculate the portion of the session that falls within this slot
        const overlapStart = Math.max(sessionStartMinutes, slotStartMinutes);
        const overlapEnd = Math.min(sessionEndMinutes, slotEndMinutes);

        // Calculate top and height as percentages
        const topPercent = ((overlapStart - slotStartMinutes) / 60) * 100;
        const heightPercent = ((overlapEnd - overlapStart) / 60) * 100;

        fragments.push({
          sessionData,
          slotHour: hour,
          topPercent,
          heightPercent,
          isCancelled: this.isSessionCancelled(sessionData)
        });
      }
    });

    // Sort: active sessions first, then by start time
    return fragments.sort((a, b) => {
      if (!a.isCancelled && b.isCancelled) return -1;
      if (a.isCancelled && !b.isCancelled) return 1;
      return a.sessionData.SessionDetailData.start_time.localeCompare(
        b.sessionData.SessionDetailData.start_time
      );
    });
  }

  /**
   * Obtiene sesiones que COMIENZAN en este slot (para evitar duplicados)
   */
  getSessionsStartingInSlot(date: Date, hour: string): SessionData[] {
    const allSessionsForDate = this.getSessionDataForDate(date);
    const [slotHourNum] = hour.split(':').map(Number);

    return allSessionsForDate.filter(sessionData => {
      const [startHour] = sessionData.SessionDetailData.start_time.split(':').map(Number);
      return startHour === slotHourNum;
    }).sort((a, b) => {
      const aIsCancelled = this.isSessionCancelled(a);
      const bIsCancelled = this.isSessionCancelled(b);
      if (!aIsCancelled && bIsCancelled) return -1;
      if (aIsCancelled && !bIsCancelled) return 1;
      return a.SessionDetailData.start_time.localeCompare(b.SessionDetailData.start_time);
    });
  }

  /**
   * Calcula posición y altura para sesión que puede cruzar slots
   */
  calculateSessionPosition(sessionData: SessionData, slotHour: string): { topPercent: number; heightPercent: number } {
    const startTime = sessionData.SessionDetailData.start_time;
    const endTime = sessionData.SessionDetailData.end_time;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [slotHourNum] = slotHour.split(':').map(Number);

    const sessionStartMinutes = startHour * 60 + startMin;
    const sessionEndMinutes = endHour * 60 + endMin;
    const slotStartMinutes = slotHourNum * 60;

    // Top: posición dentro del slot inicial
    const topMinutes = sessionStartMinutes - slotStartMinutes;
    const topPercent = (topMinutes / 60) * 100;

    // Height: duración total (puede ser > 100% si cruza slots)
    const durationMinutes = sessionEndMinutes - sessionStartMinutes;
    const heightPercent = (durationMinutes / 60) * 100;

    return { topPercent, heightPercent };
  }

  /**
   * Calcula el layout de las sesiones detectando colisiones y distribuyendo horizontalmente
   * Solo renderiza sesiones que COMIENZAN en este slot (evita duplicados)
   */
  getSessionLayoutsForSlot(date: Date, hour: string): SessionLayout[] {
    const sessionsInSlot = this.getSessionsStartingInSlot(date, hour);

    if (sessionsInSlot.length === 0) {
      return [];
    }

    const layouts: SessionLayout[] = [];
    const activeSessions = sessionsInSlot.filter(s => !this.isSessionCancelled(s));
    const cancelledSessions = sessionsInSlot.filter(s => this.isSessionCancelled(s));

    // Una sola sesión: ocupa todo el ancho
    if (sessionsInSlot.length === 1) {
      const session = sessionsInSlot[0];
      const position = this.calculateSessionPosition(session, hour);
      return [{
        sessionData: session,
        slotHour: hour,
        topPercent: position.topPercent,
        heightPercent: position.heightPercent,
        isCancelled: this.isSessionCancelled(session),
        leftPercent: 0,
        widthPercent: 100,
        zIndex: this.isSessionCancelled(session) ? 1 : 10
      }];
    }

    // Si solo hay sesiones canceladas, distribuirlas horizontalmente
    if (activeSessions.length === 0 && cancelledSessions.length > 0) {
      const width = 100 / cancelledSessions.length;
      cancelledSessions.forEach((session, index) => {
        const position = this.calculateSessionPosition(session, hour);
        layouts.push({
          sessionData: session,
          slotHour: hour,
          topPercent: position.topPercent,
          heightPercent: position.heightPercent,
          isCancelled: true,
          leftPercent: index * width,
          widthPercent: width - 1.5,
          zIndex: 1
        });
      });
      return layouts;
    }

    // Si hay sesiones activas y canceladas
    // Distribuir todas horizontalmente (activas primero, canceladas después)
    if (activeSessions.length > 0 && cancelledSessions.length > 0) {
      const totalSessions = activeSessions.length + cancelledSessions.length;
      const sessionWidth = 100 / totalSessions;

      // Colocar sesiones activas primero (a la izquierda)
      activeSessions.forEach((session, index) => {
        const position = this.calculateSessionPosition(session, hour);
        layouts.push({
          sessionData: session,
          slotHour: hour,
          topPercent: position.topPercent,
          heightPercent: position.heightPercent,
          isCancelled: false,
          leftPercent: index * sessionWidth,
          widthPercent: sessionWidth - 1,
          zIndex: 10
        });
      });

      // Colocar sesiones canceladas después (a la derecha)
      cancelledSessions.forEach((session, index) => {
        const position = this.calculateSessionPosition(session, hour);
        const positionIndex = activeSessions.length + index;
        layouts.push({
          sessionData: session,
          slotHour: hour,
          topPercent: position.topPercent,
          heightPercent: position.heightPercent,
          isCancelled: true,
          leftPercent: positionIndex * sessionWidth,
          widthPercent: sessionWidth - 1,
          zIndex: 5
        });
      });

      return layouts;
    }

    // Solo sesiones activas: distribuir horizontalmente
    const width = 100 / activeSessions.length;
    activeSessions.forEach((session, index) => {
      const position = this.calculateSessionPosition(session, hour);
      layouts.push({
        sessionData: session,
        slotHour: hour,
        topPercent: position.topPercent,
        heightPercent: position.heightPercent,
        isCancelled: false,
        leftPercent: index * width,
        widthPercent: width - 1.5,
        zIndex: 10
      });
    });

    return layouts;
  }

  /**
   * Maneja el evento de mouse enter sobre una sesión
   */
  onSessionMouseEnter(sessionData: SessionData, event: MouseEvent): void {
    this.hoveredSession.set(sessionData);
    this.updateTooltipPosition(event);
  }

  /**
   * Maneja el evento de mouse leave sobre una sesión
   */
  onSessionMouseLeave(): void {
    this.hoveredSession.set(null);
  }

  /**
   * Actualiza la posición del tooltip
   */
  private updateTooltipPosition(event: MouseEvent): void {
    const offset = 10;
    this.tooltipPosition.set({
      x: event.clientX + offset,
      y: event.clientY + offset
    });
  }

  /**
   * Formatea la información de la sesión para el tooltip
   */
  getTooltipContent(sessionData: SessionData): {
    patientName: string;
    time: string;
    clinic: string;
    status: string;
    price: string;
    paymentMethod: string;
    notes: string;
  } {
    const session = sessionData.SessionDetailData;
    return {
      patientName: session.PatientData.name,
      time: `${this.formatTime(session.start_time)} - ${this.formatTime(session.end_time)}`,
      clinic: session.ClinicDetailData.clinic_name || 'Sin clínica',
      status: this.getSessionStatusText(sessionData),
      price: this.formatPrice(session.price),
      paymentMethod: this.formatPaymentMethod(session.payment_method),
      notes: session.notes || 'Sin notas'
    };
  }
}
