import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {AtomicBindingsDirective, ComponentProps} from 'ngx-atomic-bindings';
import {DemoButtonComponent} from './demo-button.component';

@Component({
  selector: 'app-demo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtomicBindingsDirective],
  template: `
    <div class="card">
      <div class="card-header">
        <h3>{{ title() }}</h3>
      </div>
      <div class="card-body">
        <p>{{ content() }}</p>
      </div>
      @if (actionButtonProps()) {
        <div class="card-footer">
          <ng-container
            [atomicBindings]="DemoButtonComponent"
            [atomicBindingsProps]="actionButtonProps()">
          </ng-container>
        </div>
      }
    </div>
  `,
  styles: `
    .card {
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    .card-header {
      background-color: #f8f9fa;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    .card-body {
      padding: 1rem;
    }

    .card-body p {
      margin: 0;
      color: #666;
    }

    .card-footer {
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      background-color: #f8f9fa;
      display: flex;
      justify-content: flex-start;
    }
  `,
})
export class DemoCardComponent {
  // Molecular component using atomic button component through directive
  DemoButtonComponent = DemoButtonComponent;

  title = input<string>('Card Title');
  content = input<string>('Card content goes here.');

  // Accept atomic button props dynamically - showcasing Atomic Design!
  actionButtonProps = input<ComponentProps<DemoButtonComponent>>();
}
