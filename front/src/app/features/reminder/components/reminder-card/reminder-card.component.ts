import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reminder } from '../../models/reminder.model';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  templateUrl: './reminder-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ReminderCardComponent {
  @Input({ required: true }) reminder!: Reminder;
  @Input() isLoading = false;
  @Output() sendReminder = new EventEmitter<string>();

  protected onSendReminder(): void {
    if (!this.reminder.sent && !this.isLoading) {
      this.sendReminder.emit(this.reminder.id);
    }
  }

  protected get cardClasses(): string {
    const baseClasses =
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-lg';
    return this.reminder.sent ? `${baseClasses} opacity-75` : baseClasses;
  }

  protected get buttonClasses(): string {
    const baseClasses =
      'w-full flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] shadow-xs h-9 px-4 py-2 transition-all duration-200';

    if (this.reminder.sent) {
      return `${baseClasses} bg-green-100 text-green-700 hover:bg-green-100 cursor-not-allowed`;
    }

    return `${baseClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`;
  }

  protected get buttonText(): string {
    if (this.isLoading) {
      return 'Sending...';
    }
    return this.reminder.sent ? 'Enviar recordatorio' : 'Enviar recordatorio';
  }

  protected get isButtonDisabled(): boolean {
    return this.reminder.sent || this.isLoading;
  }

  protected formatTimeWithoutSeconds(time: string): string {
    // Si el tiempo tiene formato HH:MM:SS, eliminar los segundos
    return time.replace(/:\d{2}$/, '');
  }
}
