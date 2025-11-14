import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AtomicBindingsDirective } from 'ngx-atomic-bindings';
import { DemoButtonComponent } from './components/demo-button.component';
import { DemoCardComponent } from './components/demo-card.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtomicBindingsDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ngx-atomic-bindings Demo');
  protected readonly DemoButtonComponent = DemoButtonComponent;
  protected readonly DemoCardComponent = DemoCardComponent;

  protected readonly clickCount = signal(0);

  protected readonly dynamicButtonProps = computed(() => ({
    label: `Button`,
    clicked: () => this.clickCount.update((c) => c + 1),
  }));

  protected readonly cardProps = signal({
    title: 'Dynamic Card (Molecular)',
    content: 'This card is a molecular component that uses an atomic button component through the directive. This showcases the Atomic Design principle!',
    actionButtonProps: {
      label: 'Learn More',
      variant: 'primary' as const,
      clicked: () => {
        console.log('Card action clicked!');
        alert('Card action clicked! The button is an atomic component rendered inside this molecular card.');
      },
    },
  });
}
