import { Component, input, signal, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtomicBindingsDirective } from 'ngx-atomic-bindings';

@Component({
  selector: 'test-button',
  template: '<button>{{ label() }}</button>',
})
class TestButtonComponent {
  label = input<string>('default');
  variant = input<string>('primary');
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
  buttonProps = signal({ label: 'Click me', variant: 'primary' });
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
});
