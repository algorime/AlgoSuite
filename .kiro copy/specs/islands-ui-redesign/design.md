# Design Document

## Overview

This design document outlines the transformation of AlgoBrain's frontend interface to adopt the modern "Islands UI" design pattern. The redesign will create a floating panel-based layout with consistent 10% border radius, improved visual hierarchy, and enhanced user experience while maintaining all existing functionality. The design will support both light and dark themes with system default detection.

## Architecture

### Design System Foundation

The Islands UI pattern is based on the concept of floating, self-contained interface elements that appear to "float" above the background. Key principles include:

- **Floating Panels**: All major UI components are contained within rounded panels with consistent spacing
- **Visual Hierarchy**: Clear separation between different functional areas using elevation and spacing
- **Consistent Radius**: 10% border radius applied consistently across all interactive elements
- **Breathing Room**: Generous spacing between islands to reduce visual clutter
- **Contextual Grouping**: Related functionality grouped within the same island or island cluster

### Theme System Architecture

The application will implement a comprehensive theme system supporting:

- **Light Theme**: Clean, bright interface with high contrast
- **Dark Theme**: Modern dark interface optimized for low-light environments  
- **System Default**: Automatically matches the user's operating system preference
- **Dynamic Switching**: Real-time theme switching without page reload
- **Persistence**: Theme preference stored in localStorage

### Component Hierarchy

```
App
├── ThemeProvider (Context for theme management)
├── IslandContainer (Main layout wrapper)
├── NavigationIsland (Header/navigation)
├── ContentIslands (Dynamic content areas)
│   ├── ChatIsland
│   ├── EditorIsland
│   ├── DashboardIsland
│   └── StudioIsland
└── StatusIsland (Footer/status bar)
```

## Components and Interfaces

### Core Island Components

#### IslandContainer
- **Purpose**: Root container that provides the background and manages island positioning
- **Props**: `theme`, `children`, `className`
- **Styling**: Gradient background, proper spacing management
- **Responsive**: Adapts island spacing based on screen size

#### Island (Base Component)
- **Purpose**: Fundamental building block for all floating panels
- **Props**: `variant`, `size`, `elevation`, `padding`, `children`
- **Variants**: `primary`, `secondary`, `accent`, `danger`
- **Elevation Levels**: `low`, `medium`, `high` (different shadow depths)
- **Border Radius**: Consistent 10% radius (calculated as `border-radius: 10%`)

#### NavigationIsland
- **Purpose**: Main navigation and branding area
- **Features**: Logo, navigation tabs, theme switcher, user actions
- **Layout**: Horizontal layout with proper spacing between elements
- **Responsive**: Collapses to hamburger menu on mobile

#### ContentIsland
- **Purpose**: Main content areas for different application sections
- **Variants**: Chat, Editor, Dashboard, Studio
- **Features**: Smooth transitions between content types
- **Layout**: Flexible sizing based on content requirements

### Specialized Islands

#### ChatIsland
- **Message Bubbles**: Individual messages as mini-islands within the chat island
- **Input Area**: Floating input field with send button
- **Scroll Behavior**: Smooth scrolling with proper padding
- **Features**: Message grouping, timestamp islands, typing indicators

#### EditorIsland
- **Monaco Integration**: Monaco editor wrapped in island container
- **Toolbar**: Floating toolbar island above editor
- **Tabs**: Tab system using island design for multiple files
- **Features**: Syntax highlighting preservation, proper focus management

#### StudioIsland
- **Panel System**: Resizable panels as nested islands
- **HTTP Request/Response**: Separate islands for request and response
- **Payload Panels**: Suggestion and saved payload islands
- **Status Bar**: Floating status island at bottom

#### DashboardIsland
- **Chart Islands**: Individual charts as separate floating islands
- **Metric Cards**: Key metrics in small island cards
- **Filter Panel**: Floating filter controls
- **Layout**: Grid-based layout with proper spacing

### UI Component Updates

#### Button Component
```typescript
interface IslandButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  islandStyle?: boolean; // Enables island-specific styling
  elevation?: 'none' | 'low' | 'medium';
}
```

#### Input Components
- **Text Inputs**: Floating input fields with island styling
- **Dropdowns**: Floating dropdown menus with proper shadows
- **Form Groups**: Related inputs grouped in island containers

#### Card Component Enhancement
- **Island Integration**: Cards become islands with proper elevation
- **Hover Effects**: Subtle elevation changes on interaction
- **Content Spacing**: Improved internal spacing for better readability

## Data Models

### Theme Configuration
```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    background: {
      primary: string;
      secondary: string;
      gradient: string;
    };
    island: {
      background: string;
      border: string;
      shadow: string;
    };
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    interactive: {
      primary: string;
      secondary: string;
      hover: string;
      active: string;
    };
  };
  spacing: {
    island: {
      padding: string;
      margin: string;
      gap: string;
    };
  };
  borderRadius: {
    island: string; // "10%"
    button: string;
    input: string;
  };
  shadows: {
    low: string;
    medium: string;
    high: string;
  };
}
```

### Island Configuration
```typescript
interface IslandConfig {
  id: string;
  type: 'navigation' | 'content' | 'sidebar' | 'modal' | 'status';
  position: {
    x?: number;
    y?: number;
    width?: string;
    height?: string;
  };
  elevation: 'low' | 'medium' | 'high';
  variant: 'primary' | 'secondary' | 'accent';
  responsive: {
    mobile: Partial<IslandConfig>;
    tablet: Partial<IslandConfig>;
    desktop: Partial<IslandConfig>;
  };
}
```

### Animation Configuration
```typescript
interface AnimationConfig {
  duration: {
    fast: number; // 150ms
    normal: number; // 300ms
    slow: number; // 500ms
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  transitions: {
    island: string;
    theme: string;
    hover: string;
  };
}
```

## Error Handling

### Theme System Error Handling
- **System Theme Detection Failure**: Fallback to dark theme
- **LocalStorage Access Issues**: Use session storage as fallback
- **Theme Switching Errors**: Graceful degradation to default theme
- **CSS Custom Property Support**: Fallback values for older browsers

### Island Rendering Error Handling
- **Component Mount Failures**: Error boundaries around each island
- **Responsive Layout Issues**: Fallback to mobile-first layout
- **Animation Performance**: Reduced motion support for accessibility
- **Browser Compatibility**: Progressive enhancement approach

### User Experience Error Handling
- **Smooth Degradation**: Islands gracefully degrade to standard containers
- **Loading States**: Skeleton islands during content loading
- **Network Issues**: Offline-friendly island states
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Testing Strategy

### Visual Regression Testing
- **Theme Switching**: Automated screenshots of all themes
- **Responsive Design**: Testing across different viewport sizes
- **Island Layouts**: Verification of proper spacing and alignment
- **Animation Testing**: Smooth transition verification

### Component Testing
- **Island Components**: Unit tests for all island variants
- **Theme Provider**: Context switching and persistence testing
- **Responsive Behavior**: Breakpoint testing for all islands
- **Accessibility**: ARIA compliance and keyboard navigation

### Integration Testing
- **Theme Persistence**: LocalStorage integration testing
- **System Theme Detection**: OS preference detection testing
- **Cross-browser Compatibility**: Testing across major browsers
- **Performance**: Animation performance and rendering optimization

### User Experience Testing
- **Navigation Flow**: Smooth transitions between islands
- **Interactive Elements**: Hover states and click feedback
- **Mobile Experience**: Touch-friendly island interactions
- **Accessibility**: Screen reader compatibility and keyboard navigation

## Implementation Phases

### Phase 1: Foundation
- Theme system implementation
- Base Island component creation
- CSS custom properties setup
- Animation system foundation

### Phase 2: Core Islands
- NavigationIsland implementation
- Basic ContentIsland structure
- Theme switcher integration
- Responsive layout system

### Phase 3: Specialized Islands
- ChatIsland with message bubbles
- EditorIsland with Monaco integration
- Basic StudioIsland structure
- DashboardIsland layout

### Phase 4: Advanced Features
- Complex StudioIsland panels
- Advanced animations and transitions
- Performance optimizations
- Accessibility enhancements

### Phase 5: Polish and Testing
- Visual regression testing
- Cross-browser compatibility
- Performance optimization
- User experience refinements

## Technical Considerations

### CSS Architecture
- **Custom Properties**: Extensive use of CSS variables for theming
- **Container Queries**: Modern responsive design approach
- **CSS Grid/Flexbox**: Proper layout management for islands
- **Animation Performance**: GPU-accelerated animations using transform and opacity

### React Architecture
- **Context API**: Theme management and island configuration
- **Custom Hooks**: useTheme, useIsland, useAnimation
- **Component Composition**: Flexible island composition patterns
- **Performance**: Proper memoization and lazy loading

### Accessibility
- **ARIA Labels**: Proper labeling for all interactive islands
- **Keyboard Navigation**: Tab order and focus management
- **Screen Readers**: Semantic HTML and proper announcements
- **Reduced Motion**: Respect for user motion preferences

### Browser Support
- **Modern Browsers**: Full feature support for Chrome, Firefox, Safari, Edge
- **Progressive Enhancement**: Graceful degradation for older browsers
- **CSS Feature Detection**: @supports queries for advanced features
- **Polyfills**: Minimal polyfills for essential features only