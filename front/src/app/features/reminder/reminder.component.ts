import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ReminderCardComponent } from './components/reminder-card/reminder-card.component';
import { RemindersService } from './services/reminders.service';

@Component({
  selector: 'app-reminder',
  standalone: true,
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SectionHeaderComponent,
    ReminderCardComponent
  ]
})
export class ReminderComponent implements OnInit {
  private remindersService = inject(RemindersService);

  protected reminders = this.remindersService.all;
  protected isLoading = this.remindersService.isLoading;
  protected sendingStates = this.remindersService.isSending;
  protected error = this.remindersService.error;

  ngOnInit(): void {
    this.remindersService.loadReminders();
  }

  protected async onSendReminder(id: string): Promise<void> {
    try {
      await this.remindersService.sendReminder(id);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  protected onRetry(): void {
    this.remindersService.loadReminders();
  }

  protected isReminderLoading(id: string): boolean {
    return this.remindersService.isReminderLoading(id);
  }
}
