import React from "react";

export interface AccessibilityToolProFeatures {
  /** Enable dark mode inversion */
  darkMode?: boolean;
  /** Enable text-to-speech functionality */
  textToSpeech?: boolean;
}

export interface AccessibilityToolProConfig {
  /** Enable pro features */
  enabled?: boolean;
  /** Feature flags configuration */
  features?: AccessibilityToolProFeatures;
  /** Optional license key for pro features */
  licenseKey?: string;
}

export interface AccessibilityToolProps {
  /** Position from right edge */
  right?: string;
  /** Position from bottom edge */
  bottom?: string;
  /** Position from top edge */
  top?: string;
  /** Position from left edge */
  left?: string;
  /** Background color of the floating button */
  bgColor?: string;
  /** Text color of the floating button */
  textColor?: string;
  /** Pro configuration object */
  pro?: AccessibilityToolProConfig;
}

export interface AccessibilityToolProProps extends AccessibilityToolProps {
  /** Pro configuration - enables all pro features when true */
  pro: AccessibilityToolProConfig;
}

declare const AccessibilityTool: React.FC<AccessibilityToolProps>;

declare const AccessibilityToolPro: React.FC<AccessibilityToolProProps>;

// Pro configuration helper function
export function createProConfig(options?: {
  enabled?: boolean;
  features?: AccessibilityToolProFeatures;
  licenseKey?: string;
}): AccessibilityToolProConfig;

export default AccessibilityTool;
