import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientsListComponent } from './patients-list.component';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { PatientsService } from '../../services/patients.service';

describe('PatientsListComponent', () => {
  let component: PatientsListComponent;
  let fixture: ComponentFixture<PatientsListComponent>;
  let mockPatientsService: jasmine.SpyObj<PatientsService>;

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      dni: '12345678A',
      email: 'juan@example.com',
      phone: '666123456',
      status: 'active',
      session_type: 'individual',
      created_at: '2023-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'María García',
      dni: '87654321B',
      email: 'maria@example.com',
      phone: '666654321',
      status: 'inactive',
      session_type: 'group',
      created_at: '2023-02-20T14:15:00Z'
    }
  ];

  beforeEach(async () => {
    const patientsServiceSpy = jasmine.createSpyObj('PatientsService', [
      'getStatusColor',
      'getStatusLabel', 
      'formatDate',
      'capitalizeSessionType'
    ]);

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent, PatientCardComponent],
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

    fixture = TestBed.createComponent(PatientsListComponent);
    component = fixture.componentInstance;
    component.patients = mockPatients;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all patient cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const patientCards = compiled.querySelectorAll('app-patient-card');
    expect(patientCards.length).toBe(2);
  });

  it('should emit onPatientClick when patient card emits click event', () => {
    spyOn(component.onPatientClick, 'emit');
    const patientCardComponent = fixture.debugElement.children[0].children[0].componentInstance;
    patientCardComponent.onPatientClick.emit(mockPatients[0]);
    expect(component.onPatientClick.emit).toHaveBeenCalledWith(mockPatients[0]);
  });

  it('should show empty state when no patients', () => {
    component.patients = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se encontraron pacientes que coincidan con los criterios de búsqueda.');
  });

  it('should use trackByFn when provided', () => {
    const trackByFn = (index: number, patient: Patient) => patient.id;
    component.trackByFn = trackByFn;
    fixture.detectChanges();
    expect(component.trackByFn).toBe(trackByFn);
  });
});