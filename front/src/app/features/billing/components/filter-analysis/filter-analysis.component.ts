import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceKPIs } from '../../models/billing.models';

/**
 * Componente de filtros de período de análisis y visualización de KPIs
 * Muestra los filtros de mes/año y las tarjetas de KPIs de facturación
 */
@Component({
  selector: 'app-filter-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterAnalysisComponent {
  /**
   * Mes seleccionado para el análisis
   */
  @Input({ required: true }) kpiMonth!: number;

  /**
   * Año seleccionado para el análisis
   */
  @Input({ required: true }) kpiYear!: number;

  /**
   * Array con los nombres de los meses
   */
  @Input({ required: true }) monthNames!: string[];

  /**
   * Array con los años disponibles
   */
  @Input({ required: true }) years!: number[];

  /**
   * Datos de KPIs de facturación
   */
  @Input({ required: true }) kpis!: InvoiceKPIs | null;

  /**
   * Estado de carga de los KPIs
   */
  @Input({ required: true }) isLoadingKPIs!: boolean;

  /**
   * Evento emitido cuando cambia el mes seleccionado
   */
  @Output() monthChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando cambia el año seleccionado
   */
  @Output() yearChange = new EventEmitter<number>();

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
  getKpiMonthName(): string {
    return this.monthNames[this.kpiMonth - 1];
  }
}
