import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-demo-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="'btn btn-' + variant()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)">
      {{ label() }}
    </button>
  `,
  styles: `
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #1e7e34;
    }
  `,
})
export class DemoButtonComponent {
  label = input<string>('Click me');
  variant = input<'primary' | 'secondary' | 'success'>('primary');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}
