export interface AnimationDuration {
  fast: number; // 150ms
  normal: number; // 300ms
  slow: number; // 500ms
}

export interface AnimationEasing {
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
}

export interface AnimationTransitions {
  island: string;
  theme: string;
  hover: string;
  elevation: string;
}

export interface AnimationConfig {
  duration: AnimationDuration;
  easing: AnimationEasing;
  transitions: AnimationTransitions;
  reducedMotion: boolean;
}

export type ElevationLevel = 'none' | 'low' | 'medium' | 'high';

export interface IslandAnimationProps {
  appear?: boolean;
  disappear?: boolean;
  hover?: boolean;
  elevation?: ElevationLevel;
  duration?: keyof AnimationDuration;
  easing?: keyof AnimationEasing;
}