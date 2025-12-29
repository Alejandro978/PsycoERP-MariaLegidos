import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class PaginationComponent {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) totalPages!: number;
  @Input({ required: true }) totalRecords!: number;
  @Input({ required: true }) recordsPerPage!: number;
  @Input({ required: true }) hasNextPage!: boolean;
  @Input({ required: true }) hasPrevPage!: boolean;
  @Input() showInfo: boolean = true;
  @Input() showPageSize: boolean = true;
  @Input() maxVisiblePages: number = 5;

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();

  /**
   * Calcula las páginas visibles en la navegación
   */
  getVisiblePages(): number[] {
    const maxVisible = this.maxVisiblePages;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
   * Obtiene el número del primer registro mostrado
   */
  getStartRecord(): number {
    return (this.currentPage - 1) * this.recordsPerPage + 1;
  }

  /**
   * Obtiene el número del último registro mostrado
   */
  getEndRecord(): number {
    return Math.min(this.currentPage * this.recordsPerPage, this.totalRecords);
  }

  /**
   * Maneja el cambio de tamaño de página
   */
  onPageSizeChanged(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onPageSizeChange.emit(+target.value);
  }
}