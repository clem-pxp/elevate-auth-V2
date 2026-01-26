interface CalendarIconProps {
  color?: string;
  className?: string;
}

export function CalendarIcon({
  color = "currentColor",
  className,
}: CalendarIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g
        stroke={color}
        strokeWidth="1.41"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5.75" y1="2.75" x2="5.75" y2="0.75" />
        <line x1="12.25" y1="2.75" x2="12.25" y2="0.75" />
        <rect x="2.25" y="2.75" width="13.5" height="12.5" rx="2" ry="2" />
        <line x1="2.25" y1="6.25" x2="15.75" y2="6.25" />
      </g>
    </svg>
  );
}
