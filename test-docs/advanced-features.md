# Advanced Features

## Custom Components

### Creating Components

```jsx
// components/CustomAlert.jsx
export default function CustomAlert({ type, message }) {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
}
```

### Using Components in Documentation

```mdx
import { CustomAlert } from '@/components/CustomAlert';

<CustomAlert type="info" message="This is a custom alert component" />
```

## Internationalization

### Directory Structure

```
docs/
├── en/
│   ├── guide.md
│   └── api.md
└── es/
    ├── guide.md
    └── api.md
```

### Language Configuration

```js
export default {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  }
}
```

## Search Configuration

### Custom Search Index

```js
export default {
  search: {
    provider: 'local',
    options: {
      customIndex: './search-index.json',
      highlightResults: true
    }
  }
}
```

## Plugin System

### Creating a Plugin

```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    hooks: {
      'before:build': async () => {
        // Pre-build operations
      },
      'after:build': async () => {
        // Post-build operations
      }
    }
  }
}
```

### Using Plugins

```js
import myPlugin from './plugins/my-plugin';

export default {
  plugins: [
    myPlugin({
      // Plugin options
    })
  ]
}
```

## Performance Optimizations

### Image Optimization

```js
export default {
  image: {
    optimize: true,
    format: ['webp', 'avif'],
    quality: 80
  }
}
```

### Code Splitting

```js
export default {
  build: {
    splitting: true,
    chunks: 'async',
    minify: true
  }
}
```

## Advanced Theming

### Custom CSS Variables

```css
:root {
  --custom-font: 'Inter', sans-serif;
  --custom-spacing: 1.5rem;
  --custom-radius: 8px;
}
```

### Theme Extensions

```js
export default {
  theme: {
    extend: {
      typography: {
        'custom-heading': {
          fontFamily: 'var(--custom-font)',
          lineHeight: '1.2'
        }
      }
    }
  }
}
```