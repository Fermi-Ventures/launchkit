# @fermi-ventures/launchkit-core

Core types, utilities, and patterns for LaunchKit applications.

Extracted from [endorsed](https://github.com/fermi-ventures/endorsed) and [launch-lab](https://github.com/fermi-ventures/launch-lab), generalized for all LaunchKit consumers.

## Installation

```bash
npm install @fermi-ventures/launchkit-core
```

## What's Included

- **Types** - Standard server action return types, error classes, AI usage tracking
- **Utilities** - Tailwind class merging (`cn`), HMAC signed URLs
- **RBAC** - Hierarchical role checking and fine-grained permissions
- **URL Builders** - Multi-tenant URL construction
- **Scoring** - Generic weighted scoring calculations

## Usage

### Server Action Return Types

```typescript
import { ActionResult } from '@fermi-ventures/launchkit-core';

async function createUser(data: UserData): Promise<ActionResult<User>> {
  try {
    const user = await db.user.create({ data });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Failed to create user' };
  }
}
```

### Tailwind Class Merging

```typescript
import { cn } from '@fermi-ventures/launchkit-core/utils';

function Button({ className, variant }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        className
      )}
    />
  );
}
```

### RBAC - Roles & Permissions

```typescript
import { hasRole, hasPermission } from '@fermi-ventures/launchkit-core/rbac';

// Hierarchical role check
if (hasRole(session.user.role, 'admin')) {
  // User is admin or super_admin
}

// Fine-grained permission check
if (hasPermission(userPermissions, 'edit_content')) {
  // User can edit
}
```

See full documentation in [docs](./docs) or [examples](./examples).

## Extracted From

- **endorsed** - Types, utilities, signed URLs
- **launch-lab** - RBAC, permissions, URL builders, scoring utilities

## License

MIT
