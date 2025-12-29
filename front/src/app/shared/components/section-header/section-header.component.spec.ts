import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  let component: SectionHeaderComponent;
  let fixture: ComponentFixture<SectionHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and subtitle', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h1');
    const subtitleElement = fixture.nativeElement.querySelector('p');
    
    expect(titleElement.textContent).toContain('Test Title');
    expect(subtitleElement.textContent).toContain('Test Subtitle');
  });

  it('should show button when buttonText is provided', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    component.buttonText = 'Test Button';
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement).toBeTruthy();
    expect(buttonElement.textContent.trim()).toContain('Test Button');
  });

  it('should not show button when buttonText is not provided', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement).toBeFalsy();
  });

  it('should show button when showButton is explicitly true', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    component.buttonText = 'Test Button';
    component.showButton = true;
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement).toBeTruthy();
  });

  it('should not show button when showButton is explicitly false', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    component.buttonText = 'Test Button';
    component.showButton = false;
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement).toBeFalsy();
  });

  it('should emit onButtonClick when button is clicked', () => {
    spyOn(component.onButtonClick, 'emit');
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    component.buttonText = 'Test Button';
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    buttonElement.click();

    expect(component.onButtonClick.emit).toHaveBeenCalled();
  });

  it('should return correct shouldShowButton value', () => {
    // Default behavior - no buttonText, no showButton
    component.buttonText = undefined;
    component.showButton = undefined;
    expect(component.shouldShowButton).toBeFalsy();

    // With buttonText
    component.buttonText = 'Test';
    expect(component.shouldShowButton).toBeTruthy();

    // showButton takes precedence
    component.showButton = false;
    expect(component.shouldShowButton).toBeFalsy();

    component.showButton = true;
    expect(component.shouldShowButton).toBeTruthy();
  });

  it('should return correct icon SVG for different icons', () => {
    // Test plus icon (default)
    component.buttonIcon = 'plus';
    expect(component.iconSvg).toContain('<path d="M5 12h14"></path>');

    // Test download icon
    component.buttonIcon = 'download';
    expect(component.iconSvg).toContain('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>');

    // Test unknown icon (should fallback to plus)
    component.buttonIcon = 'unknown';
    expect(component.iconSvg).toContain('<path d="M5 12h14"></path>');
  });

  it('should display correct icon in button', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    component.buttonText = 'Test Button';
    component.buttonIcon = 'download';
    fixture.detectChanges();

    const svgElement = fixture.nativeElement.querySelector('button svg');
    expect(svgElement).toBeTruthy();
    expect(svgElement.innerHTML).toContain('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
  });

  it('should have responsive classes', () => {
    fixture.detectChanges();

    const headerDiv = fixture.nativeElement.querySelector('div');
    expect(headerDiv.className).toContain('flex flex-col sm:flex-row');
    expect(headerDiv.className).toContain('justify-between');
    expect(headerDiv.className).toContain('items-start sm:items-center');
    expect(headerDiv.className).toContain('gap-4');
  });

  it('should have proper title typography classes', () => {
    component.title = 'Test Title';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.className).toContain('text-2xl md:text-3xl');
    expect(titleElement.className).toContain('font-bold');
    expect(titleElement.className).toContain('text-foreground');
  });

  it('should have proper subtitle classes', () => {
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();

    const subtitleElement = fixture.nativeElement.querySelector('p');
    expect(subtitleElement.className).toContain('text-muted-foreground');
    expect(subtitleElement.className).toContain('mt-1');
  });
});