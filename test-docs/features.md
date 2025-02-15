# Features

## Authentication
Open-Docs provides built-in authentication to secure your documentation. You can:
- Restrict access to specific documentation sections
- Manage user permissions
- Track documentation views and engagement

## Markdown Extensions
Enhance your documentation with extended markdown features:

### Tables
| Feature | Description | Status |
|---------|-------------|--------|
| Authentication | User access control | ✅ |
| Search | Full-text search | ✅ |
| Dark Mode | Automatic theme switching | ✅ |

### Admonitions
:::tip
Use admonitions to highlight important information!
:::

:::warning
Warn users about potential pitfalls.
:::

## Search
Built-in search functionality helps users find content quickly:
- Full-text search across all documentation
- Search suggestions as you type
- Keyboard shortcuts for quick access

## Customization
Tailor the documentation to match your brand:
```javascript
// Theme configuration
theme: {
  primaryColor: '#7c3aed',
  secondaryColor: '#4f46e5',
  accentColor: '#0ea5e9'
}
```

## API Documentation
Document your APIs with dedicated code blocks:
```typescript
interface Config {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
}

class API {
  constructor(config: Config) {
    // Implementation
  }
}
```