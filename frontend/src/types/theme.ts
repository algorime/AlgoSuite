export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
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
}

export interface ResponsiveSpacing {
  padding: string;
  margin: string;
  gap: string;
}

export interface ThemeSpacing {
  island: {
    padding: string;
    margin: string;
    gap: string;
  };
  responsive: {
    mobile: ResponsiveSpacing;
    tablet: ResponsiveSpacing;
    desktop: ResponsiveSpacing;
  };
}

export interface ThemeBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
  containerQueries: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

export interface ThemeBorderRadius {
  island: string;
  button: string;
  input: string;
}

export interface ThemeShadows {
  low: string;
  medium: string;
  high: string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
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
    elevation: string;
  };
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  breakpoints: ThemeBreakpoints;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
}

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  config: ThemeConfig;
}