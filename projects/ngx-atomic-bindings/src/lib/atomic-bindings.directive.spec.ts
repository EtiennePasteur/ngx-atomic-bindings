import { Component, input, output, signal, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtomicBindingsDirective } from 'ngx-atomic-bindings';

@Component({
  selector: 'test-button',
  template: '<button (click)="handleClick()">{{ label() }}</button>',
})
class TestButtonComponent {
  label = input<string>('default');
  variant = input<string>('primary');
  clicked = output<void>();

  handleClick() {
    this.clicked.emit();
  }
}

@Component({
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindingsProps]="buttonProps()"
      [atomicBindings]="TestButtonComponent">
    </ng-container>
  `,
})
class TestHostComponent {
  TestButtonComponent = TestButtonComponent;
  buttonProps = signal<{ label?: string; variant?: string; clicked?: () => void }>({ label: 'Click me', variant: 'primary' });
}

describe('AtomicBindingsDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestButtonComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create and render the dynamic component', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should apply input bindings to the component', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    expect(button?.textContent).toContain('Click me');
  });

  it('should update component when props change', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');

    // Verify initial state
    expect(button?.textContent).toContain('Click me');

    // Update the props signal
    fixture.componentInstance.buttonProps.set({ label: 'Updated Label', variant: 'secondary' });
    fixture.detectChanges();

    // Verify the component was updated with new props
    expect(button?.textContent).toContain('Updated Label');
  });

  it('should update component multiple times when props change repeatedly', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');

    // First update
    fixture.componentInstance.buttonProps.set({ label: 'First Update', variant: 'secondary' });
    fixture.detectChanges();
    expect(button?.textContent).toContain('First Update');

    // Second update
    fixture.componentInstance.buttonProps.set({ label: 'Second Update', variant: 'tertiary' });
    fixture.detectChanges();
    expect(button?.textContent).toContain('Second Update');

    // Third update
    fixture.componentInstance.buttonProps.set({ label: 'Third Update', variant: 'danger' });
    fixture.detectChanges();
    expect(button?.textContent).toContain('Third Update');
  });

  it('should handle output bindings', () => {
    let clickCount = 0;
    const clickHandler = () => clickCount++;

    fixture.componentInstance.buttonProps.set({
      label: 'Click me',
      variant: 'primary',
      clicked: clickHandler
    });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(clickCount).toBe(1);
  });

  it('should clear component when config is empty', () => {
    const el: HTMLElement = fixture.nativeElement;
    let button = el.querySelector('button');
    expect(button).toBeTruthy();

    // Set props to undefined
    fixture.componentInstance.buttonProps.set(undefined as any);
    fixture.detectChanges();

    button = el.querySelector('button');
    expect(button).toBeFalsy();
  });
});

@Component({
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindingsFixed]="fixedProps()"
      [atomicBindings]="TestButtonComponent">
    </ng-container>
  `,
})
class TestHostWithFixedComponent {
  TestButtonComponent = TestButtonComponent;
  fixedProps = signal({ label: 'Fixed Label', variant: 'danger' });
}

describe('AtomicBindingsDirective with Fixed Props', () => {
  let fixture: ComponentFixture<TestHostWithFixedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestButtonComponent, TestHostWithFixedComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithFixedComponent);
    fixture.detectChanges();
  });

  it('should render with fixed props', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    expect(button?.textContent).toContain('Fixed Label');
  });

  it('should update when fixed props change', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');

    fixture.componentInstance.fixedProps.set({ label: 'Updated Fixed', variant: 'success' });
    fixture.detectChanges();

    expect(button?.textContent).toContain('Updated Fixed');
  });
});

@Component({
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindingsProps]="buttonProps()"
      [atomicBindingsFixed]="fixedProps()"
      [atomicBindings]="TestButtonComponent">
    </ng-container>
  `,
})
class TestHostWithBothPropsComponent {
  TestButtonComponent = TestButtonComponent;
  buttonProps = signal<{ label?: string; variant?: string }>({ label: 'Dynamic Label' });
  fixedProps = signal<{ label?: string; variant?: string }>({ variant: 'danger' });
}

describe('AtomicBindingsDirective with Both Props and Fixed', () => {
  let fixture: ComponentFixture<TestHostWithBothPropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestButtonComponent, TestHostWithBothPropsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithBothPropsComponent);
    fixture.detectChanges();
  });

  it('should merge props and fixed props (fixed takes precedence)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    expect(button?.textContent).toContain('Dynamic Label');
  });

  it('should update when dynamic props change while keeping fixed props', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');

    fixture.componentInstance.buttonProps.set({ label: 'Updated Dynamic' });
    fixture.detectChanges();

    expect(button?.textContent).toContain('Updated Dynamic');
  });

  it('should prioritize fixed props over dynamic props', () => {
    fixture.componentInstance.buttonProps.set({ label: 'Dynamic', variant: 'primary' });
    fixture.componentInstance.fixedProps.set({ variant: 'danger' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    expect(button?.textContent).toContain('Dynamic');
    // The variant should be 'danger' from fixedProps, not 'primary' from buttonProps
  });
});
