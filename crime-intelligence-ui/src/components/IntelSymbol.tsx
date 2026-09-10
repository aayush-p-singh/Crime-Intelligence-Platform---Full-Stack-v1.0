import * as React from "react";

interface IntelSymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number | string;
}

/**
 * Geometric symbol inspired by intelligence, mapping, and precision.
 * Features a minimalist coordinate reticle with a central precision core.
 * Free of badges, shields, and cliches.
 */
export function IntelSymbol({
  size = 20,
  strokeWidth = 1.5,
  className = "",
  ...props
}: IntelSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer precision coordinate ring */}
      <circle cx="12" cy="12" r="9" />

      {/* Precision reticle axes with cardinal offsets */}
      <line x1="12" y1="1.5" x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="5.5" y2="12" />
      <line x1="18.5" y1="12" x2="22.5" y2="12" />

      {/* Inner mapping vertex ring */}
      <circle cx="12" cy="12" r="4.5" strokeDasharray="1 2.5" />

      {/* Central precision focal point */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
