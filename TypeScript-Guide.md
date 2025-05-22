# TypeScript Guide for Toiral Project

This guide provides solutions for common TypeScript issues in the Toiral project and best practices for maintaining type safety.

## Common TypeScript Issues and Solutions

### 1. Missing Modules

If you encounter errors like `Cannot find module '../firebase/initializeNotifications'`:

- Make sure the file exists in the specified path
- Import from the centralized `firebase/index.ts` file instead of individual files:

```typescript
// Instead of this:
import { initializeNotificationsPath } from '../firebase/initializeNotifications';

// Use this:
import { initializeNotificationsPath } from '../firebase';
```

### 2. Invalid Property Access on Types

When you see errors like `Property 'toiral' does not exist on type 'ContentSettings'`:

- Check if the property is defined in the `ContentSettings` interface in `src/types.ts`
- Use optional chaining when accessing potentially undefined properties: `content?.toiral`
- Use type guards to check if properties exist before accessing them:

```typescript
if ('toiral' in content) {
  // Now TypeScript knows content.toiral exists
  console.log(content.toiral);
}
```

### 3. Implicit 'any' Type Errors

For variables flagged with implicit 'any' types:

- Always declare the type of variables:

```typescript
// Instead of this:
const phrases = [];

// Use this:
const phrases: string[] = [];
```

- For function parameters, specify the type:

```typescript
// Instead of this:
function calculateScore(score) {
  // ...
}

// Use this:
function calculateScore(score: number): number {
  // ...
}
```

### 4. Type Mismatches for Objects

For type mismatches like `status: string is not assignable to type "pending" | "approved" | "rejected"`:

- Use type assertion functions from `src/utils/typeGuards.ts`:

```typescript
import { asBookingStatus } from '../utils/typeGuards';

// Convert string to valid enum value
const validStatus = asBookingStatus(booking.status);
```

- Use type guards to validate objects:

```typescript
import { isBookingSubmission } from '../utils/typeGuards';

if (isBookingSubmission(obj)) {
  // TypeScript now knows obj is a valid BookingSubmission
  updateBooking(obj);
}
```

### 5. Unused Imports and Variables

To clean up unused imports and variables:

- Use the "Organize Imports" feature in your IDE (Alt+Shift+O in VS Code)
- Enable the TypeScript compiler option `"noUnusedLocals": true` in tsconfig.json
- Use the underscore prefix for variables you need to declare but won't use:

```typescript
// Instead of this:
const [value, setValue] = useState('');

// If setValue is unused, use this:
const [value, _setValue] = useState('');
```

### 6. Component Prop Type Errors

For prop type errors like `Property 'title' does not exist on type 'IntrinsicAttributes & Win95ButtonProps'`:

- Define proper interface for component props:

```typescript
interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

function MyComponent({ title, onSave }: MyComponentProps) {
  // ...
}
```

- Use the centralized prop types from `src/types.ts`

## Best Practices

1. **Centralize Types**: Keep shared types in `src/types.ts`
2. **Use Type Guards**: Create and use type guards for runtime type checking
3. **Avoid `any`**: Use specific types or `unknown` with type guards instead
4. **Use Utility Types**: Leverage TypeScript utility types like `Partial<T>`, `Pick<T>`, `Omit<T>`
5. **Document Complex Types**: Add JSDoc comments to explain complex types
6. **Consistent Naming**: Use consistent naming conventions for interfaces and types

## Useful TypeScript Utilities

The project includes several utility files to help with type safety:

- `src/utils/typeGuards.ts`: Type guards and type assertion functions
- `src/utils/typeUtils.ts`: Utilities for handling type conversions
- `src/firebase/index.ts`: Centralized exports for Firebase functionality
- `src/types.ts`: Centralized type definitions

## Common Type Patterns

### Optional Properties

```typescript
interface User {
  id: string;
  name: string;
  email?: string; // Optional property
}
```

### Union Types

```typescript
type Status = 'pending' | 'approved' | 'rejected';
```

### Generic Types

```typescript
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}
```

### Type Guards

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### Mapped Types

```typescript
type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};
```