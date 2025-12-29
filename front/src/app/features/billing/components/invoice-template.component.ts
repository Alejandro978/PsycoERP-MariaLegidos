import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';
import { InvoicePreviewData } from './invoice-preview.component';

/**
 * Componente de plantilla de factura reutilizable
 * Se usa tanto en el preview modal como en la generación de PDFs
 */
@Component({
  selector: 'app-invoice-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (invoiceData) {
      <div class="max-w-4xl mx-auto bg-white p-8">
        <!-- Invoice Header -->
        <div class="mb-8">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-4xl font-black text-primary">FACTURA</h1>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-800">{{ invoiceData.invoice_number }}</div>
              <div class="text-gray-600">Fecha: {{ invoiceData.invoice_date }}</div>
            </div>
          </div>
        </div>

        <!-- Emisor y Receptor -->
        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">DATOS DEL EMISOR</h3>
            @if (userData) {
              <div class="space-y-1 text-gray-700">
                <div class="font-semibold">{{ userData.name }}</div>
                <div>DNI: {{ userData.dni }}</div>
                <div>{{ userData.street }} {{ userData.street_number }}@if (userData.door) {, {{ userData.door }}}</div>
                <div>{{ userData.postal_code }} {{ userData.city }}, {{ userData.province }}</div>
              </div>
            } @else {
              <div class="space-y-1 text-gray-700">
                <div class="font-semibold">Cargando...</div>
              </div>
            }
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">DATOS DEL RECEPTOR</h3>
            <div class="space-y-1 text-gray-700">
              <div class="font-semibold">{{ invoiceData.patient_full_name }}</div>
              <div>DNI: {{ invoiceData.dni }}</div>
              <div>Email: {{ invoiceData.email }}</div>
            </div>
          </div>
        </div>

        <!-- Tabla de conceptos -->
        <div class="mb-8">
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Concepto</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Precio</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">IVA</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (session of invoiceData.sessions || []; track session.session_id; let isOdd = $odd) {
                  <tr [class.bg-gray-50]="isOdd" [class.bg-white]="!isOdd">
                    <td class="px-4 py-3 font-medium text-gray-900">Sesión @if (userData) {{{ userData.name }}}</td>
                    <td class="px-4 py-3 text-gray-700">{{ session.session_date }}</td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ formatCurrency(session.price) }}</td>
                    <td class="px-4 py-3 text-center text-gray-700">1</td>
                    <td class="px-4 py-3 text-right text-gray-700">0%</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">{{ formatCurrency(session.price) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totales -->
        <div class="flex justify-end mb-4">
          <div class="w-80">
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="space-y-3">
                <div class="flex justify-between text-gray-700">
                  <span>Base imponible:</span>
                  <span>{{ formatCurrency(invoiceData.total_gross) }}</span>
                </div>
                <div class="flex justify-between text-gray-700">
                  <span>IVA:</span>
                  <span>0,00€</span>
                </div>
                <div class="border-t border-gray-300 pt-3">
                  <div class="flex justify-between text-xl font-bold text-gray-900">
                    <span>TOTAL:</span>
                    <span>{{ formatCurrency(invoiceData.total_gross) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nota legal IVA -->
        <div class="text-center text-sm text-gray-500 mb-8">
          <p>Servicio exento de IVA según el artículo 20 3a de la ley 37/1992 del impuesto sobre el Valor Añadido.</p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceTemplateComponent {
  @Input() invoiceData: InvoicePreviewData | null = null;
  @Input() userData: User | null = null;

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
