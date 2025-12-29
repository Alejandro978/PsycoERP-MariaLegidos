import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicsListComponent } from './clinics-list.component';
import { Clinic } from '../../models/clinic.model';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';

describe('ClinicsListComponent', () => {
  let component: ClinicsListComponent;
  let fixture: ComponentFixture<ClinicsListComponent>;

  const mockClinics: Clinic[] = [
    {
      id: '1',
      name: 'Test Clinic 1',
      address: '123 Test Street',
      clinic_color: '#FF5733'
    },
    {
      id: '2',
      name: 'Test Clinic 2',
      address: '456 Test Avenue',
      clinic_color: '#33FF57'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicsListComponent, ClinicCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicsListComponent);
    component = fixture.componentInstance;
    component.clinics = mockClinics;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all clinic cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const clinicCards = compiled.querySelectorAll('app-clinic-card');
    expect(clinicCards.length).toBe(2);
  });

  it('should emit onEdit when clinic card emits edit event', () => {
    spyOn(component.onEdit, 'emit');
    const clinicCardComponent = fixture.debugElement.children[0].children[0].componentInstance;
    clinicCardComponent.onEdit.emit(mockClinics[0]);
    expect(component.onEdit.emit).toHaveBeenCalledWith(mockClinics[0]);
  });

  it('should emit onDelete when clinic card emits delete event', () => {
    spyOn(component.onDelete, 'emit');
    const clinicCardComponent = fixture.debugElement.children[0].children[0].componentInstance;
    clinicCardComponent.onDelete.emit(mockClinics[0]);
    expect(component.onDelete.emit).toHaveBeenCalledWith(mockClinics[0]);
  });

  it('should use trackByFn when provided', () => {
    const trackByFn = (index: number, clinic: Clinic) => clinic.id;
    component.trackByFn = trackByFn;
    fixture.detectChanges();
    expect(component.trackByFn).toBe(trackByFn);
  });
});