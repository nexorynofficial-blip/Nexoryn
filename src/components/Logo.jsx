import { useId } from "react";

export default function Logo({ className = "" }) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 56 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="40"
          x2="56"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#ffb300" />
        </linearGradient>
      </defs>
      <path
        d="M2 34 L21 6 L25 24 L44 4 L40 36 L54 16"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
