# Customizing Themes

This guide will walk you through the process of customizing your documentation site's appearance using Open-Docs' theming system.

## Theme Configuration

Open-Docs provides a powerful theming system that allows you to customize various aspects of your documentation site's appearance.

### Basic Color Customization

1. Navigate to your site's dashboard
2. Click on "Theme Settings"
3. Modify the following colors:
   - Primary Color: Used for navigation and links
   - Secondary Color: Used for accents and highlights
   - Background Color: Main background color

```json
{
  "theme": {
    "colors": {
      "primary": "#0066cc",
      "secondary": "#4CAF50",
      "background": "#ffffff"
    }
  }
}
```

## Custom CSS

You can add custom CSS to further customize your site's appearance:

```css
/* Custom styles for documentation */
.doc-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.sidebar {
  background-color: #f5f5f5;
  border-right: 1px solid #eee;
}
```

## Branding Elements

### Logo Customization

1. Prepare your logo image (recommended size: 200x50px)
2. Upload through the dashboard
3. Position your logo using these settings:

```json
{
  "branding": {
    "logo": {
      "height": "50px",
      "position": "left",
      "margin": "1rem"
    }
  }
}
```

## Responsive Design

All theme customizations are automatically responsive, but you can add specific styles for different screen sizes:

```css
/* Mobile-specific styles */
@media (max-width: 768px) {
  .doc-content {
    padding: 1rem;
  }
}
```

## Best Practices

1. Maintain good contrast ratios for accessibility
2. Test your theme on multiple devices and screen sizes
3. Use consistent colors throughout your documentation
4. Consider dark mode support for better user experience