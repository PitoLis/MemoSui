/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
// @ts-ignore
import logoUrl from "@/LOGO.png";

interface MemoSuiLogoProps {
  className?: string;
  size?: number;
}

export default function MemoSuiLogo({ className = "w-10 h-10", size }: MemoSuiLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="MemoSui Logo"
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      referrerPolicy="no-referrer"
    />
  );
}
