import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() buttonText?: string;
  @Input() buttonIcon: string = 'plus';
  @Input() showButton?: boolean;
  
  // Nuevo botón de filtros
  @Input() showFiltersButton?: boolean = false;
  @Input() filtersButtonText: string = 'Filtros';

  @Output() onButtonClick = new EventEmitter<void>();
  @Output() onFiltersClick = new EventEmitter<void>();

  get shouldShowButton(): boolean {
    if (this.showButton !== undefined) {
      return this.showButton;
    }
    return !!this.buttonText;
  }

  get shouldShowFiltersButton(): boolean {
    return this.showFiltersButton === true;
  }

  get hasAnyButton(): boolean {
    return this.shouldShowButton || this.shouldShowFiltersButton;
  }

  handleButtonClick(): void {
    this.onButtonClick.emit();
  }

  handleFiltersClick(): void {
    this.onFiltersClick.emit();
  }
}