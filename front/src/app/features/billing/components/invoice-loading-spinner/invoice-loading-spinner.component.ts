import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente spinner para indicar que se están generando facturas
 * Muestra un overlay con un mensaje de carga
 */
@Component({
  selector: 'app-invoice-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-loading-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceLoadingSpinnerComponent {
  @Input({ required: true }) isLoading!: boolean;
  @Input() title: string = 'Generando Facturas';
  @Input() message: string = 'Por favor espera mientras se generan las facturas...';
  @Input() submessage: string = 'Este proceso puede tardar unos momentos';
}
