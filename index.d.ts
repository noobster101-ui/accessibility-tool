import * as React from "react";

export interface AccessibilityToolProps {
  right?: string;
  bottom?: string;
  bgColor?: string;
  textColor?: string;
}

export const AccessibilityTool: React.FC<AccessibilityToolProps>;
