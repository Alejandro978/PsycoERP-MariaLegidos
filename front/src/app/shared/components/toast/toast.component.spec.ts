import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['removeToast'], {
      toasts: jasmine.createSpy().and.returnValue([])
    });

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call removeToast when removeToast is called', () => {
    component.removeToast('test-id');
    expect(toastService.removeToast).toHaveBeenCalledWith('test-id');
  });

  it('should return correct classes for success toast', () => {
    const classes = component.getToastClasses('success');
    expect(classes).toContain('bg-green-50');
    expect(classes).toContain('border-green-200');
    expect(classes).toContain('text-green-800');
  });

  it('should return correct classes for error toast', () => {
    const classes = component.getToastClasses('error');
    expect(classes).toContain('bg-red-50');
    expect(classes).toContain('border-red-200');
    expect(classes).toContain('text-red-800');
  });

  it('should return correct classes for warning toast', () => {
    const classes = component.getToastClasses('warning');
    expect(classes).toContain('bg-yellow-50');
    expect(classes).toContain('border-yellow-200');
    expect(classes).toContain('text-yellow-800');
  });

  it('should return correct classes for info toast', () => {
    const classes = component.getToastClasses('info');
    expect(classes).toContain('bg-blue-50');
    expect(classes).toContain('border-blue-200');
    expect(classes).toContain('text-blue-800');
  });

  it('should return correct icon classes for success', () => {
    const classes = component.getIconClasses('success');
    expect(classes).toContain('text-green-500');
    expect(classes).toContain('h-5 w-5');
  });

  it('should return correct close button classes', () => {
    const classes = component.getCloseButtonClasses('success');
    expect(classes).toContain('text-green-600');
    expect(classes).toContain('cursor-pointer');
  });
});