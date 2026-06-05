/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface MemoSuiLogoProps {
  className?: string;
  size?: number;
}

export default function MemoSuiLogo({ className = "w-10 h-10", size }: MemoSuiLogoProps) {
  return (
    <img
      src="/LOGO.png"
      alt="MemoSui Logo"
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      referrerPolicy="no-referrer"
    />
  );
}
