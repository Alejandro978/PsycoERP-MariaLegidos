import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text?: string;
  @Input() overlay: boolean = false;
  @Input() showCancelButton: boolean = false;

  @Output() onCancel = new EventEmitter<void>();

  private startTime = Date.now();
  private timeoutId?: number;
  private intervalId?: number;
  showWarning = signal(false);
  private elapsedTime = signal(0);

  // Computed para el texto dinámico
  displayText = computed(() => {
    const baseText = this.text || 'Cargando...';
    const elapsed = this.elapsedTime();

    if (this.showWarning()) {
      return 'La operación está tardando más de lo esperado...';
    }

    if (elapsed > 2000) {
      return `${baseText} (${Math.round(elapsed / 1000)}s)`;
    }

    return baseText;
  });

  // Clases CSS dinámicas
  spinnerSizeClass = computed(() => {
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };
    return sizeMap[this.size];
  });

  ngOnInit(): void {
    // Mostrar warning después de 5 segundos
    this.timeoutId = window.setTimeout(() => {
      this.showWarning.set(true);
    }, 10000);

    // Actualizar tiempo transcurrido cada segundo
    this.intervalId = window.setInterval(() => {
      this.elapsedTime.set(Date.now() - this.startTime);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
