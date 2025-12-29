import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientCardComponent } from './patient-card.component';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../services/patients.service';

describe('PatientCardComponent', () => {
  let component: PatientCardComponent;
  let fixture: ComponentFixture<PatientCardComponent>;
  let mockPatientsService: jasmine.SpyObj<PatientsService>;

  const mockPatient: Patient = {
    id: '1',
    name: 'Juan Pérez',
    dni: '12345678A',
    email: 'juan@example.com',
    phone: '666123456',
    status: 'active',
    session_type: 'individual',
    created_at: '2023-01-15T10:30:00Z'
  };

  beforeEach(async () => {
    const patientsServiceSpy = jasmine.createSpyObj('PatientsService', [
      'getStatusColor',
      'getStatusLabel', 
      'formatDate',
      'capitalizeSessionType'
    ]);

    await TestBed.configureTestingModule({
      imports: [PatientCardComponent],
      providers: [
        { provide: PatientsService, useValue: patientsServiceSpy }
      ]
    })
    .compileComponents();

    mockPatientsService = TestBed.inject(PatientsService) as jasmine.SpyObj<PatientsService>;
    mockPatientsService.getStatusColor.and.returnValue('bg-green-100 text-green-800');
    mockPatientsService.getStatusLabel.and.returnValue('Activo');
    mockPatientsService.formatDate.and.returnValue('15/01/2023');
    mockPatientsService.capitalizeSessionType.and.returnValue('Individual');

    fixture = TestBed.createComponent(PatientCardComponent);
    component = fixture.componentInstance;
    component.patient = mockPatient;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display patient name and DNI', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juan Pérez');
    expect(compiled.textContent).toContain('DNI: 12345678A');
  });

  it('should display patient details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('juan@example.com');
    expect(compiled.textContent).toContain('666123456');
    expect(compiled.textContent).toContain('Individual');
    expect(compiled.textContent).toContain('15/01/2023');
  });

  it('should emit onPatientClick when card is clicked', () => {
    spyOn(component.onPatientClick, 'emit');
    const cardElement = fixture.nativeElement.querySelector('div');
    cardElement?.click();
    expect(component.onPatientClick.emit).toHaveBeenCalledWith(mockPatient);
  });

  it('should call service methods for formatting', () => {
    expect(mockPatientsService.getStatusColor).toHaveBeenCalledWith('active');
    expect(mockPatientsService.getStatusLabel).toHaveBeenCalledWith('active');
    expect(mockPatientsService.formatDate).toHaveBeenCalledWith('2023-01-15T10:30:00Z');
    expect(mockPatientsService.capitalizeSessionType).toHaveBeenCalledWith('individual');
  });
});