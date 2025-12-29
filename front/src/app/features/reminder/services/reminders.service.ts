import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {
  Reminder,
  PendingReminderFromAPI,
  PendingRemindersResponse,
  SendReminderResponse,
} from '../models/reminder.model';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Injectable({ providedIn: 'root' })
export class RemindersService {
  private http = inject(HttpClient);
  private whatsAppService = inject(WhatsAppService);

  private reminders = signal<Reminder[]>([]);
  private loading = signal(false);
  private sendingReminder = signal<Set<string>>(new Set());
  private errorState = signal<string | null>(null);

  get all() {
    return this.reminders.asReadonly();
  }

  get isLoading() {
    return this.loading.asReadonly();
  }

  get isSending() {
    return this.sendingReminder.asReadonly();
  }

  get error() {
    return this.errorState.asReadonly();
  }

  private mapReminderFromAPI(apiData: PendingReminderFromAPI): Reminder {
    return {
      id: apiData.session_id.toString(),
      sessionId: apiData.session_id,
      patientName: apiData.patient_name,
      startTime: apiData.start_time,
      endTime: apiData.end_time,
      sent: apiData.reminder_sent,
    };
  }

  async loadReminders(): Promise<void> {
    this.loading.set(true);
    this.errorState.set(null);

    try {
      const response = await lastValueFrom(
        this.http.get<PendingRemindersResponse>('/reminders/pending')
      );

      if (response.data) {
        const mappedReminders = response.data.map((item) =>
          this.mapReminderFromAPI(item)
        );
        this.reminders.set(mappedReminders);
      } else {
        this.errorState.set('Error loading reminders');
        this.reminders.set([]);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      const errorMessage =
        error instanceof HttpErrorResponse
          ? `Error ${error.status}: ${error.message}`
          : 'Connection error';
      this.errorState.set(errorMessage);
      this.reminders.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async sendReminder(id: string): Promise<void> {
    this.sendingReminder.update((set) => new Set([...set, id]));
    this.errorState.set(null);

    try {
      const response = await lastValueFrom(
        this.http.post<SendReminderResponse>('/reminders', {
          session_id: parseInt(id),
        })
      );

      if (response.data) {
        // Update local state
        this.reminders.update((reminders) =>
          reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, sent: true } : reminder
          )
        );

        // Try to open WhatsApp Desktop first, fallback to web if it doesn't work
        this.whatsAppService
          .openWhatsAppDesktopOnly(response.data.whatsapp_deeplink)
          .then((success) => {
            if (!success) {
              this.whatsAppService.openWhatsApp(
                response.data.whatsapp_deeplink
              );
            }
          });
      } else {
        throw new Error('Error sending reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      const errorMessage =
        error instanceof HttpErrorResponse
          ? `Error ${error.status}: ${error.message}`
          : error instanceof Error
          ? error.message
          : 'Connection error';
      this.errorState.set(errorMessage);
      throw error;
    } finally {
      this.sendingReminder.update((set) => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  isReminderLoading(id: string): boolean {
    return this.sendingReminder().has(id);
  }
}
