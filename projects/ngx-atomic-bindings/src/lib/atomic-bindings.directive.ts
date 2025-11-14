/* eslint-disable @typescript-eslint/no-explicit-any */
import {ComponentRef, Directive, effect, inject, input, InputSignal, InputSignalWithTransform, OutputEmitterRef, ViewContainerRef,} from '@angular/core';

type UnwrapSignal<T> = T extends InputSignalWithTransform<infer _ReadT, infer WriteT> ? WriteT : T extends InputSignal<infer U> ? U : T;
type UnwrapOutput<T> = T extends OutputEmitterRef<infer U> ? U : never;
type ComponentInputs<T> = { [K in keyof T as T[K] extends InputSignal<any> ? K : never]: UnwrapSignal<T[K]> };
type ComponentOutputs<T> = {
  [K in keyof T as T[K] extends OutputEmitterRef<any> ? K : never]: (event: UnwrapOutput<T[K]>) => void;
};

/**
 * Extracts all valid properties (inputs and outputs) from a component class.
 * Use this when you want to expose ALL properties of a child component.
 *
 * @example
 * ```typescript
 * // In your wrapper component
 * public buttonProps = input<ComponentProps<ButtonComponent>>();
 * ```
 */
export type ComponentProps<T> = Partial<ComponentInputs<T>> & Partial<ComponentOutputs<T>>;

/**
 * Extracts component properties while excluding specific ones.
 * Use this when fixing certain properties and exposing the rest.
 *
 * @example
 * ```typescript
 * // Exclude 'variant' (fixed via atomicBindingsFixed)
 * public buttonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant'>>();
 *
 * // Exclude multiple properties
 * public buttonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant' | 'size'>>();
 * ```
 */
export type ComponentPropsExcluding<T, K extends keyof ComponentProps<T>> = Omit<ComponentProps<T>, K>;

/**
 * Dynamically renders a component and binds its inputs/outputs with full type safety.
 * Eliminates boilerplate property forwarding when wrapping components.
 *
 * @example
 * ```typescript
 * <ng-container
 *   [atomicBindings]="ButtonComponent"
 *   [atomicBindingsProps]="buttonProps()"
 *   [atomicBindingsFixed]="{ variant: 'primary' }">
 *   Submit
 * </ng-container>
 * ```
 *
 * @param atomicBindings - The component class to render (required)
 * @param atomicBindingsProps - Dynamic properties that update reactively (optional)
 * @param atomicBindingsFixed - Static properties that never change (optional)
 */
@Directive({
  selector: '[atomicBindings]',
})
export class AtomicBindingsDirective<T extends object> {
  private readonly viewContainerRef = inject(ViewContainerRef);

  public atomicBindings = input.required<new (...args: any[]) => T>();
  public atomicBindingsProps = input<Partial<ComponentProps<T>>>();
  public atomicBindingsFixed = input<Partial<ComponentProps<T>>>();

  constructor() {
    effect(() => {
      const userConfig = this.atomicBindingsProps();
      const componentType = this.atomicBindings();
      const fixedProps = this.atomicBindingsFixed();
      const container = this.viewContainerRef;

      const config = userConfig || fixedProps ? { ...(userConfig || {}), ...(fixedProps || {}) } : undefined;
      if (!config || !container) {
        if (container?.length > 0) container.clear();
        return;
      }

      const componentRef =
        container.length > 0 ? (container.get(0) as unknown as ComponentRef<T>) : container.createComponent(componentType);

      if (!componentRef || !componentRef.instance) {
        return;
      }

      Object.entries(config).forEach(([key, value]) => {
        if (key in componentRef.instance) {
          const property = (componentRef.instance as any)[key];
          if (property !== null && typeof property === 'object' && 'subscribe' in property && typeof value === 'function') {
            property.subscribe(value);
          } else {
            componentRef.setInput(key, value);
          }
        }
      });
    });
  }
}
