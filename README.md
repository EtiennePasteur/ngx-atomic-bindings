# ngx-atomic-bindings

<p align="center">
  <img src="./demo/public/ngx-atomic-bindings.svg" alt="ngx-atomic-bindings logo" width="200" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ngx-atomic-bindings"><img src="https://img.shields.io/npm/v/ngx-atomic-bindings" alt="NPM Version" /></a>
  <a href="https://github.com/EtiennePasteur/ngx-atomic-bindings/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/ngx-atomic-bindings" alt="License" /></a>
  <a href="https://github.com/EtiennePasteur/ngx-atomic-bindings/actions/workflows/test.yml"><img src="https://github.com/EtiennePasteur/ngx-atomic-bindings/actions/workflows/test.yml/badge.svg" alt="Build Status" /></a>
  <a href="https://www.npmjs.com/package/ngx-atomic-bindings"><img src="https://img.shields.io/npm/dm/ngx-atomic-bindings" alt="NPM Downloads" /></a>
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/ngx-atomic-bindings"><img src="https://img.shields.io/bundlephobia/minzip/ngx-atomic-bindings" alt="Bundle Size" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9+-blue" alt="TypeScript" /></a>
  <a href="https://angular.io/"><img src="https://img.shields.io/badge/Angular-18+-red" alt="Angular" /></a>
  <a href="https://github.com/EtiennePasteur/ngx-atomic-bindings/stargazers"><img src="https://img.shields.io/github/stars/EtiennePasteur/ngx-atomic-bindings" alt="GitHub Stars" /></a>
  <a href="https://etiennepasteur.github.io/ngx-atomic-bindings/"><img src="https://img.shields.io/badge/demo-live-blue" alt="Demo" /></a>
</p>

<p align="center">
  <strong>A type-safe Angular directive that dynamically renders components and binds their inputs/outputs using signals</strong>
</p>

`ngx-atomic-bindings` enables molecular components to transparently expose and forward the properties of their underlying atomic components. Instead of manually declaring and forwarding every input and output, this directive lets you dynamically bind component properties while maintaining full type safety.

Built for Angular 18+ with modern **signal-based `input()` and `output()` APIs**.

**[🚀 View Live Demo](https://etiennepasteur.github.io/ngx-atomic-bindings/)**

> **⚠️ Note:** This directive only works with components using signal-based inputs/outputs (`input()`, `output()`). It does not support decorator-based `@Input`/`@Output`.

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Common Use Cases](#common-use-cases)
- [Development](#development)
- [Requirements](#requirements)
- [License](#license)

## The Problem

When building composite components in Angular, you often need to wrap reusable components and expose their properties to parent components. The traditional approach requires manually declaring and forwarding each property:

**The traditional approach:**
- Manually declare each input you want to expose
- Manually declare each output you want to expose
- Forward every property through template bindings
- Repeat this boilerplate for every wrapped component
- Update all forwarding code whenever the underlying component changes

**This becomes a maintenance nightmare** when:
- Your reusable components have many properties
- You're building component libraries with multiple composition layers
- You follow Atomic Design patterns (atoms → molecules → organisms)
- You want to expose most/all properties of a child component without repetitive code

## The Solution

`ngx-atomic-bindings` eliminates this boilerplate by dynamically rendering components and binding their properties. You define what properties to expose once using TypeScript types, and the directive handles all the binding logic.

### Before and After Example

**Traditional approach** - Verbose and maintenance-heavy:
```typescript
// ❌ Manual property forwarding for every input/output
@Component({
  selector: 'app-submit-button',
  imports: [ButtonComponent],
  template: `
    <app-button
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [icon]="icon()"
      (clicked)="clicked.emit($event)">
      Submit Form
    </app-button>
  `
})
export class SubmitButtonComponent {
  // Must manually declare each property...
  public variant = input<'primary' | 'secondary'>('primary');
  public size = input<'small' | 'medium' | 'large'>('medium');
  public disabled = input<boolean>(false);
  public loading = input<boolean>(false);
  public icon = input<string>();
  public clicked = output<MouseEvent>();

  // ...and forward each one in the template!
}
```

**With ngx-atomic-bindings** - Clean and maintainable:
```typescript
// ✅ One input declaration, automatic property forwarding
@Component({
  selector: 'app-submit-button',
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="buttonProps()">
      Submit Form
    </ng-container>
  `
})
export class SubmitButtonComponent {
  protected ButtonComponent = ButtonComponent;

  // Single input that exposes ALL button properties with type safety!
  public buttonProps = input<ComponentProps<ButtonComponent>>();
}
```

**What you get:**
- ✨ **One line of code** instead of dozens
- ✨ **Full type safety** - TypeScript knows all valid properties
- ✨ **Automatic updates** - No code changes needed when ButtonComponent evolves
- ✨ **Zero maintenance** - No manual property forwarding

## Features

- ✅ **Type-safe bindings** - Full TypeScript support ensures you can only pass valid properties
- ✅ **Signal-based reactivity** - Built with Angular signals (`input()` and `output()`) for automatic updates
- ✅ **Dynamic props** - Properties update reactively when parent signals change
- ✅ **Fixed props** - Lock certain properties while exposing others
- ✅ **Output handling** - Subscribe to component events with type-safe callbacks
- ✅ **Zero dependencies** - Only requires Angular core packages
- ✅ **Modern Angular** - Designed for Angular 18+ with signal-based APIs
- ✅ **IntelliSense support** - Get autocompletion for all valid component properties

## Installation

```bash
npm install ngx-atomic-bindings
```

## Quick Start

Here's a simple example to get started:

### 1. Create your base component with signal-based inputs/outputs

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [disabled]="disabled()"
      [class]="'btn btn-' + variant()"
      (click)="clicked.emit($event)">
      {{ label() }}
    </button>
  `
})
export class ButtonComponent {
  public label = input<string>('Click me');
  public variant = input<'primary' | 'secondary'>('primary');
  public disabled = input<boolean>(false);
  public clicked = output<MouseEvent>();
}
```

### 2. Create a wrapper component using the directive

```typescript
import { Component, input } from '@angular/core';
import { AtomicBindingsDirective, ComponentPropsExcluding } from 'ngx-atomic-bindings';

@Component({
  selector: 'app-form-actions',
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="buttonProps()"
      [atomicBindingsFixed]="{ variant: 'primary' }">
    </ng-container>
  `
})
export class FormActionsComponent {
  protected ButtonComponent = ButtonComponent;

  // Expose all properties except 'variant' (which is fixed above)
  public buttonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant'>>();
}
```

### 3. Use your wrapper component

```typescript
@Component({
  selector: 'app-form',
  imports: [FormActionsComponent],
  template: `
    <app-form-actions
      [buttonProps]="{
        label: 'Submit',
        disabled: isSubmitting(),
        clicked: handleSubmit
      }">
    </app-form-actions>
  `
})
export class FormComponent {
  protected isSubmitting = signal(false);

  protected handleSubmit = (event: MouseEvent) => {
    this.isSubmitting.set(true);
    // Submit form...
  }
}
```

That's it! The directive automatically binds all properties with full type safety.

## Usage Examples

### Example 1: Expose All Properties

Transparently forward all inputs and outputs:

```typescript
@Component({
  selector: 'app-primary-button',
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="buttonProps()">
    </ng-container>
  `
})
export class PrimaryButtonComponent {
  protected ButtonComponent = ButtonComponent;

  public buttonProps = input<ComponentProps<ButtonComponent>>();
}
```

### Example 2: Fix Some Properties, Expose Others

Lock certain properties while exposing the rest:

```typescript
@Component({
  selector: 'app-danger-button',
  imports: [AtomicBindingsDirective],
  template: `
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="buttonProps()"
      [atomicBindingsFixed]="{ variant: 'danger', icon: 'warning' }">
    </ng-container>
  `
})
export class DangerButtonComponent {
  protected ButtonComponent = ButtonComponent;

  // Expose all properties except variant and icon (fixed above)
  public buttonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant' | 'icon'>>();
}
```

### Example 3: Combine Multiple Dynamic Components

Build complex composites with multiple dynamic children:

```typescript
@Component({
  selector: 'app-dialog-footer',
  imports: [AtomicBindingsDirective],
  template: `
    <!-- Cancel button -->
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="cancelButtonProps()"
      [atomicBindingsFixed]="{ variant: 'secondary', label: 'Cancel' }">
    </ng-container>

    <!-- Confirm button -->
    <ng-container
      [atomicBindings]="ButtonComponent"
      [atomicBindingsProps]="confirmButtonProps()"
      [atomicBindingsFixed]="{ variant: 'primary', label: 'Confirm' }">
    </ng-container>
  `
})
export class DialogFooterComponent {
  protected ButtonComponent = ButtonComponent;

  public cancelButtonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant' | 'label'>>();
  public confirmButtonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant' | 'label'>>();
}
```

## API Reference

### Directive Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `atomicBindings` | `Type<T>` | ✅ Yes | The component class to render dynamically. Pass the class reference (e.g., `ButtonComponent`). |
| `atomicBindingsProps` | `ComponentProps<T>` | ❌ No | Dynamic properties to bind. Can include both inputs and outputs. These update reactively when the signal changes. |
| `atomicBindingsFixed` | `ComponentProps<T>` | ❌ No | Static properties that never change. Useful for locking certain props (like `variant: 'primary'`) while exposing others dynamically. |

**Notes:**
- At least one of `atomicBindingsProps` or `atomicBindingsFixed` should be provided (though not required)
- If the same property exists in both `atomicBindingsFixed` and `atomicBindingsProps`, the fixed value takes precedence
- Outputs in `atomicBindingsProps` should be functions that handle the emitted events

### Type Helpers

The library provides TypeScript utilities to work with component properties safely:

#### `ComponentProps<T>`

Extracts all valid properties (inputs and outputs) from a component class.

```typescript
import { ComponentProps } from 'ngx-atomic-bindings';

// Define a component
@Component({ /* ... */ })
export class ButtonComponent {
  label = input<string>('Button');
  variant = input<'primary' | 'secondary'>('primary');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}

// Extract all its properties
type ButtonProps = ComponentProps<ButtonComponent>;
// Result: {
//   label?: string;
//   variant?: 'primary' | 'secondary';
//   disabled?: boolean;
//   clicked?: (event: MouseEvent) => void;
// }

// Use in component input
public buttonProps = input<ComponentProps<ButtonComponent>>();
```

#### `ComponentPropsExcluding<T, K>`

Like `ComponentProps`, but excludes specific properties. Useful when you want to fix certain props and expose the rest.

```typescript
import { ComponentPropsExcluding } from 'ngx-atomic-bindings';

// Exclude 'variant' from ButtonComponent props
type RestrictedProps = ComponentPropsExcluding<ButtonComponent, 'variant'>;
// Result: {
//   label?: string;
//   disabled?: boolean;
//   clicked?: (event: MouseEvent) => void;
// }

// Exclude multiple properties
type MinimalProps = ComponentPropsExcluding<ButtonComponent, 'variant' | 'disabled'>;
// Result: {
//   label?: string;
//   clicked?: (event: MouseEvent) => void;
// }

// Use in component input
public buttonProps = input<ComponentPropsExcluding<ButtonComponent, 'variant'>>();
```

**When to use each:**

- **`ComponentProps<T>`**: When you want to expose ALL properties of the child component
- **`ComponentPropsExcluding<T, K>`**: When you're using `atomicBindingsFixed` to lock certain properties and only want to expose the remaining ones

## How It Works

The directive uses Angular's dynamic component rendering (`ViewContainerRef`) combined with signal-based inputs/outputs to:

1. **Dynamically instantiate** the component specified in `[atomicBindings]`
2. **Extract input/output definitions** from the component using Angular's signal APIs
3. **Bind dynamic props** from `[atomicBindingsProps]` to component inputs and subscribe to outputs
4. **Apply fixed props** from `[atomicBindingsFixed]` as static values
5. **Maintain reactivity** - when props change, the bindings update automatically

All of this happens with **full type safety** thanks to TypeScript's type inference.

## Common Use Cases

### 1. Component Libraries

Build a component library with base components (atoms) and specialized variants (molecules):

```typescript
// Base components
ButtonComponent, InputComponent, CardComponent

// Specialized variants that expose base props
PrimaryButton, DangerButton, IconButton
FormInput, SearchInput, EmailInput
InfoCard, ProductCard, UserCard
```

### 2. Atomic Design Architecture

Perfect for teams following Atomic Design methodology:
- **Atoms**: Base reusable components (Button, Input, Label)
- **Molecules**: Simple composites that wrap atoms (FormField = Label + Input + Error)
- **Organisms**: Complex composites (LoginForm, UserProfile, Checkout)

Each layer can expose properties from the layer below without boilerplate.

### 3. Design System Implementation

When implementing a design system with many component variants:
- Create base components with all possible properties
- Build semantic variants (SubmitButton, CancelButton, DeleteButton)
- Fix design tokens (colors, sizes) at the variant level
- Expose functional props (disabled, loading, onClick)

### 4. Reducing Maintenance Burden

When you need to:
- Quickly prototype composite components
- Avoid updating multiple forwarding layers when base components change
- Maintain a large codebase with many component abstractions
- Reduce the code review surface area (less boilerplate to review)

## Development

### Running the Demo

```bash
# Serve the demo application
npm run start
```

Navigate to `http://localhost:4200/` to see the demo application.

### Building the Library

```bash
# Build the library
npm run build
```

The build artifacts will be stored in the `dist/ngx-atomic-bindings` directory.

### Running Tests

```bash
# Run library tests
npm run test
```

## Requirements

- Angular 18.0.0 or higher
- TypeScript 5.9.0 or higher
- **Components must use signal-based inputs/outputs** (`input()`, `output()`) - the directive does not work with decorator-based `@Input`/`@Output`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
