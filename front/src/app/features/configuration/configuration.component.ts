import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { UpdateUserProfileRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  // Signals para estados de loading
  private saveInProgress = signal(false);

  // Computed signals para el template
  protected isLoading = computed(() => this.userService.isLoading());
  protected isUpdating = computed(
    () => this.userService.isUpdating() || this.saveInProgress()
  );
  protected userProfile = computed(() => this.userService.profile());

  public configurationForm = this.fb.group({
    name: ['', Validators.required],
    license_number: [''],
    irpf: [''],
    iban: [''],
    dni: ['', Validators.required],
    street: ['', Validators.required],
    street_number: ['', Validators.required],
    door: [''],
    city: ['', Validators.required],
    province: ['', Validators.required],
    postal_code: ['', Validators.required],
  });

  async ngOnInit() {
    await this.loadUserData();
  }

  public isFieldInvalid(field: string): boolean {
    const control = this.configurationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public getFieldError(field: string): string {
    const control = this.configurationForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  /**
   * Carga los datos del usuario actual desde la API
   */
  private async loadUserData(): Promise<void> {
    try {
      const userId = this.userService.getUserIdFromStorage();

      if (userId) {
        const user = await this.userService.getUserProfileAsync(userId);

        if (user) {
          // Llenar el formulario con los datos del usuario
          this.configurationForm.patchValue({
            name: user.name || '',
            license_number: user.license_number || '',
            irpf: user.irpf || '',
            iban: user.iban || '',
            dni: user.dni || '',
            street: user.street || '',
            street_number: user.street_number || '',
            door: user.door || '',
            city: user.city || '',
            province: user.province || '',
            postal_code: user.postal_code || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * Guarda los cambios del perfil del usuario
   */
  public async handleSave(): Promise<void> {
    if (this.configurationForm.valid) {
      this.saveInProgress.set(true);

      try {
        const userId = this.userService.getUserIdFromStorage();

        if (userId) {
          const formData = this.configurationForm
            .value as UpdateUserProfileRequest;

          const updatedUser = await this.userService.updateUserProfileAsync(
            userId,
            formData
          );
        }
      } catch (error) {
        console.error('Error saving user profile:', error);
      } finally {
        this.saveInProgress.set(false);
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.configurationForm.markAllAsTouched();
    }
  }
}
