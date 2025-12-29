import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
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
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();

    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeTruthy();
  });

  it('should display title and message', () => {
    component.isOpen = true;
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    const messageElement = fixture.nativeElement.querySelector('p');
    
    expect(titleElement.textContent).toContain('Test Title');
    expect(messageElement.textContent).toContain('Test Message');
  });

  it('should display item name when provided', () => {
    component.isOpen = true;
    component.message = 'Delete item ';
    component.itemName = 'Test Item';
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Test Item');
  });

  it('should emit onConfirm when confirm button is clicked', () => {
    spyOn(component.onConfirm, 'emit');
    component.isOpen = true;
    component.confirmText = 'Confirm';
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelectorAll('button')[1];
    confirmButton.click();

    expect(component.onConfirm.emit).toHaveBeenCalled();
  });

  it('should emit onCancel when cancel button is clicked', () => {
    spyOn(component.onCancel, 'emit');
    component.isOpen = true;
    component.cancelText = 'Cancel';
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelectorAll('button')[0];
    cancelButton.click();

    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should emit onCancel when close button is clicked', () => {
    spyOn(component.onCancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelectorAll('button')[2];
    closeButton.click();

    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should apply destructive classes for destructive button type', () => {
    component.confirmButtonType = 'destructive';
    
    const classes = component.confirmButtonClasses;
    expect(classes).toContain('bg-destructive');
    expect(classes).toContain('text-destructive-foreground');
  });

  it('should apply primary classes for primary button type', () => {
    component.confirmButtonType = 'primary';
    
    const classes = component.confirmButtonClasses;
    expect(classes).toContain('bg-primary');
    expect(classes).toContain('text-primary-foreground');
  });
});