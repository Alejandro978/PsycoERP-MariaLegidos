import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ClinicFormComponent } from './clinic-form.component';
import { Clinic } from '../../models/clinic.model';

describe('ClinicFormComponent', () => {
  let component: ClinicFormComponent;
  let fixture: ComponentFixture<ClinicFormComponent>;

  const mockClinic: Clinic = {
    id: '1',
    name: 'Test Clinic',
    address: 'Test Address 123',
    clinic_color: '#ff0000',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();

    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeFalsy();
  });

  it('should render modal when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeTruthy();
  });

  it('should show "Crear Nueva Clínica" title when creating new clinic', () => {
    component.isOpen = true;
    component.clinica = null;
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Crear nueva Clínica');
  });

  it('should show "Editar Clínica" title when editing clinic', () => {
    component.isOpen = true;
    component.clinica = mockClinic;
    component.ngOnChanges({
      clinica: {
        currentValue: mockClinic,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Editar Clínica');
  });

  it('should populate form when editing clinic', () => {
    component.clinica = mockClinic;
    component.ngOnChanges({
      clinica: {
        currentValue: mockClinic,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.clinicaForm.value.name).toBe(mockClinic.name);
    expect(component.clinicaForm.value.address).toBe(mockClinic.address);
    expect(component.clinicaForm.value.clinic_color).toBe(
      mockClinic.clinic_color
    );
  });

  it('should reset form when creating new clinic', () => {
    component.clinica = null;
    component.ngOnChanges({
      clinica: {
        currentValue: null,
        previousValue: mockClinic,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.clinicaForm.value.name).toBe('');
    expect(component.clinicaForm.value.address).toBe('');
    expect(component.clinicaForm.value.clinic_color).toBe('#3b82f6');
  });

  it('should emit onCancel when cancel button is clicked', () => {
    spyOn(component.onCancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelector(
      'button[type="button"]:not(.absolute)'
    );
    cancelButton.click();

    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should emit onCancel when close button is clicked', () => {
    spyOn(component.onCancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.absolute button');
    closeButton.click();

    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should emit onSave when form is valid and submitted', () => {
    spyOn(component.onSave, 'emit');
    component.isOpen = true;
    component.clinicaForm.patchValue({
      name: 'New Clinic',
      address: 'New Address 123',
      clinic_color: '#00ff00',
    });
    fixture.detectChanges();

    component.handleSubmit();

    expect(component.onSave.emit).toHaveBeenCalledWith({
      name: 'New Clinic',
      address: 'New Address 123',
      clinic_color: '#00ff00',
    });
  });

  it('should validate required fields', () => {
    component.clinicaForm.patchValue({
      name: '',
      address: '',
      clinic_color: '#3b82f6',
    });

    expect(component.getFieldError('name')).toBeTruthy();
    expect(component.getFieldError('address')).toBeTruthy();
    expect(component.isFormValid).toBeFalsy();
  });

  it('should validate minimum length', () => {
    component.clinicaForm.patchValue({
      name: 'A',
      address: 'B',
    });
    component.clinicaForm.get('name')?.markAsTouched();
    component.clinicaForm.get('address')?.markAsTouched();

    expect(component.getFieldError('name')).toContain('al menos 2 caracteres');
    expect(component.getFieldError('address')).toContain(
      'al menos 5 caracteres'
    );
  });

  it('should return correct button text for create mode', () => {
    component.clinica = null;
    expect(component.submitButtonText).toBe('Crear Clínica');
  });

  it('should return correct button text for edit mode', () => {
    component.clinica = mockClinic;
    expect(component.submitButtonText).toBe('Actualizar Clínica');
  });

  it('should return isEditing correctly', () => {
    component.clinica = null;
    expect(component.isEditing).toBeFalsy();

    component.clinica = mockClinic;
    expect(component.isEditing).toBeTruthy();
  });
});
