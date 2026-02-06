interface ChevronDownIconProps {
  color?: string;
  className?: string;
}

export function ChevronDownIcon({
  color = "#5B5C5E",
  className,
}: ChevronDownIconProps) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.7315 2.19329L4.16752 4.75726L1.60356 2.19329C1.34584 1.93557 0.929522 1.93557 0.671804 2.19329C0.414086 2.45101 0.414086 2.86732 0.671804 3.12504L3.70495 6.15819C3.96267 6.4159 4.37898 6.4159 4.6367 6.15819L7.66984 3.12504C7.92756 2.86732 7.92756 2.45101 7.66984 2.19329C7.41212 1.94218 6.98922 1.93557 6.7315 2.19329Z"
        fill={color}
      />
    </svg>
  );
}
