import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicCardComponent } from './clinic-card.component';
import { Clinic } from '../../models/clinic.model';

describe('ClinicCardComponent', () => {
  let component: ClinicCardComponent;
  let fixture: ComponentFixture<ClinicCardComponent>;

  const mockClinic: Clinic = {
    id: '1',
    name: 'Test Clinic',
    address: '123 Test Street',
    clinic_color: '#FF5733'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicCardComponent);
    component = fixture.componentInstance;
    component.clinic = mockClinic;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display clinic name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Clinic');
  });

  it('should display clinic address', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('123 Test Street');
  });

  it('should emit onEdit when edit button is clicked', () => {
    spyOn(component.onEdit, 'emit');
    const editButton = fixture.nativeElement.querySelector('button:first-of-type');
    editButton?.click();
    expect(component.onEdit.emit).toHaveBeenCalledWith(mockClinic);
  });

  it('should emit onDelete when delete button is clicked', () => {
    spyOn(component.onDelete, 'emit');
    const deleteButton = fixture.nativeElement.querySelector('button:last-of-type');
    deleteButton?.click();
    expect(component.onDelete.emit).toHaveBeenCalledWith(mockClinic);
  });
});