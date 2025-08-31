# Tool UI/UX Guidelines

This document defines the uniform design patterns for all tools in the Network Tools Hub application.

## Design Principles

1. **Consistency**: All tools follow the same layout and styling patterns
2. **Clarity**: Clear visual hierarchy with proper spacing and typography
3. **Efficiency**: Minimize clicks and provide keyboard shortcuts
4. **Feedback**: Immediate visual feedback for all actions
5. **Professional**: Clean, modern interface suitable for technical users

## Component Structure

### 1. Tool Container
```tsx
<div className="[tool-name]-tool">
  <!-- All tool content -->
</div>
```

**Styling:**
- Padding: 20px
- Display: flex column with 20px gap
- Scrollable with thin scrollbar

### 2. Tool Header
```tsx
<div className="tool-header">
  <h2>Tool Name</h2>
  <p>Brief description of what the tool does</p>
</div>
```

**Styling:**
- H2: 24px, font-weight 600, color #cccccc
- Description: 14px, color #8b8b8b
- Bottom margin: 10px

### 3. Control Sections
```tsx
<div className="[control-type]-controls">
  <div className="control-group">
    <label>FIELD LABEL:</label>
    <input/select/textarea />
  </div>
  <!-- More control groups -->
</div>
```

**Styling:**
- Background: #2d2d30
- Border: 1px solid #3c3c3c
- Border-radius: 6px
- Padding: 15px
- Gap between controls: 15px

### 4. Control Groups
**Label Styling:**
- Font-size: 12px
- Font-weight: 600
- Text-transform: uppercase
- Letter-spacing: 0.5px
- Color: #cccccc

**Input/Select Styling:**
- Background: #1e1e1e
- Border: 1px solid #3c3c3c
- Border-radius: 4px
- Padding: 8px 12px
- Font-size: 14px
- Hover border: #007acc
- Focus border: #007acc with shadow

### 5. Buttons

**Primary Button (Main Actions):**
- Background: #0e639c
- Hover: #1177bb
- Color: white
- Examples: Connect, Calculate, Send Command

**Secondary Button (Secondary Actions):**
- Background: #3c3c3c
- Hover: #4a4a4a
- Color: #cccccc
- Examples: Clear, Reset

**Danger Button (Destructive Actions):**
- Background: #a1260d
- Hover: #b82e11
- Color: white
- Examples: Delete, Disconnect

**Button Sizing:**
- Default: padding 8px 16px, font-size 14px
- Small: padding 4px 12px, font-size 12px

### 6. Output/Results Sections
```tsx
<div className="results-section">
  <div className="results-header">
    <h3>SECTION TITLE</h3>
    <button className="copy-btn">Copy All</button>
  </div>
  <div className="results-content">
    <!-- Results content -->
  </div>
</div>
```

**Styling:**
- Background: #1e1e1e
- Border: 1px solid #3c3c3c
- Border-radius: 6px
- Header background: #2d2d30
- Header border-bottom: 1px solid #3c3c3c

### 7. Status Messages

**Success:**
- Color: #4ec9b0
- Background (if boxed): #1e3a1e
- Border (if boxed): #3a5a3a

**Error:**
- Color: #f48771
- Background (if boxed): #5a1d1d
- Border (if boxed): #8b3a3a

**Warning:**
- Color: #dcdcaa
- Background (if boxed): #5a5a1d
- Border (if boxed): #8b8b3a

**Info:**
- Color: #9cdcfe
- Background (if boxed): #1d3a5a
- Border (if boxed): #3a5a8b

### 8. Info/Help Sections
```tsx
<div className="info-section">
  <h4>Section Title</h4>
  <ul>
    <li>Help text or information</li>
  </ul>
</div>
```

**Styling:**
- Background: #252526
- Border: 1px solid #3c3c3c
- Border-radius: 6px
- Padding: 20px
- Code elements: background #1e1e1e, color #d7ba7d

## Color Palette

### Dark Theme (Default)
- **Backgrounds:**
  - Primary: #1e1e1e (main background)
  - Secondary: #2d2d30 (elevated sections)
  - Tertiary: #3c3c3c (buttons, inputs hover)
  - Elevated: #252526 (info sections)

- **Text:**
  - Primary: #cccccc (main text)
  - Secondary: #8b8b8b (descriptions, labels)
  - Tertiary: #6b6b6b (placeholders)

- **Accents:**
  - Primary: #0e639c (primary buttons)
  - Primary Hover: #1177bb
  - Focus: #007acc (borders, highlights)
  - Code: #d7ba7d

- **Status:**
  - Success: #4ec9b0
  - Error: #f48771
  - Warning: #dcdcaa
  - Info: #9cdcfe

### Light Theme
- **Backgrounds:**
  - Primary: #ffffff
  - Secondary: #f3f3f3
  - Tertiary: #e1e1e1
  - Elevated: #f8f8f8

- **Text:**
  - Primary: #333333
  - Secondary: #666666
  - Tertiary: #999999

## Typography

**Font Stack:**
- Default: System font stack
- Monospace: 'Consolas', 'Monaco', 'Courier New', monospace

**Font Sizes:**
- H2 (Tool Title): 24px
- H3 (Section Title): 14px uppercase
- H4 (Subsection): 14px
- Body: 14px
- Small/Labels: 12px
- Code: 13px

**Font Weights:**
- Headers: 600
- Labels: 600
- Body: 400
- Buttons: 500

## Layout Patterns

### Input Layout
1. **Single Row**: For related inputs that should be on the same line
2. **Stacked**: For forms with multiple unrelated inputs
3. **Flex-grow**: For inputs that should expand to fill available space

### Button Placement
1. **Primary actions**: Right-aligned or after inputs
2. **Secondary actions**: Next to primary actions
3. **Destructive actions**: Separated from other actions

### Responsive Behavior
- **Mobile (<768px)**:
  - Stack controls vertically
  - Full-width buttons
  - Single column layouts
  - Maintain minimum touch target size (44px)

## Implementation Example

```tsx
import React from 'react'
import './MyTool.css'

export const MyTool: React.FC = () => {
  return (
    <div className="my-tool">
      <div className="tool-header">
        <h2>My Tool</h2>
        <p>Description of what this tool does</p>
      </div>

      <div className="input-controls">
        <div className="control-group">
          <label>Input Label:</label>
          <input type="text" placeholder="Enter value" />
        </div>
        
        <button className="btn btn-primary">
          Primary Action
        </button>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h3>Results</h3>
        </div>
        <div className="results-content">
          <!-- Results here -->
        </div>
      </div>

      <div className="info-section">
        <h4>Help</h4>
        <ul>
          <li>Help item 1</li>
          <li>Help item 2</li>
        </ul>
      </div>
    </div>
  )
}
```

## CSS Classes Reference

### Base Classes
- `.tool-header` - Tool title section
- `.control-group` - Input group container
- `.btn` - Base button class
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-danger` - Destructive action button
- `.results-section` - Results container
- `.info-section` - Help/info container
- `.error-message` - Error message box
- `.status-success` - Success text color
- `.status-error` - Error text color

### Utility Classes
- `.flex-grow` - Expand to fill available space
- `.full-width` - Span full width in grid
- `.text-center` - Center align text
- `.mt-20` - Margin top 20px
- `.mb-20` - Margin bottom 20px
- `.gap-15` - Gap 15px in flex container

## Best Practices

1. **Always include a tool header** with title and description
2. **Group related controls** in control sections
3. **Provide immediate feedback** for user actions
4. **Include help/info sections** for complex tools
5. **Support keyboard navigation** (Tab, Enter, Escape)
6. **Add copy buttons** for output that users might need
7. **Show loading states** during async operations
8. **Display clear error messages** with recovery actions
9. **Test responsive behavior** on different screen sizes
10. **Follow accessibility guidelines** (ARIA labels, contrast ratios)

## Migration Checklist

When updating an existing tool to match the uniform UI:

- [ ] Replace custom styling with base classes
- [ ] Update color values to use CSS variables
- [ ] Ensure proper heading hierarchy (h2 for title, h3 for sections)
- [ ] Add tool-header with description
- [ ] Group controls in control sections with proper backgrounds
- [ ] Update button styles to use btn classes
- [ ] Add copy functionality to results
- [ ] Include info/help section
- [ ] Test responsive behavior
- [ ] Verify dark/light theme compatibility