interface CreditCardIconProps {
  color?: string;
  className?: string;
}

export function CreditCardIcon({
  color = "currentColor",
  className,
}: CreditCardIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.33312 2.66675C1.98271 2.66675 0.888672 3.76078 0.888672 5.11119V10.889C0.888672 12.2394 1.98271 13.3334 3.33312 13.3334H12.6664C14.0168 13.3334 15.1109 12.2394 15.1109 10.889V5.11119C15.1109 3.76078 14.0168 2.66675 12.6664 2.66675H3.33312Z"
        fill={color}
        fillOpacity="0.4"
      />
      <path
        d="M15.1109 5.77783H0.888672V7.11117H15.1109V5.77783Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.11133 9.99992C3.11133 9.63174 3.40981 9.33325 3.77799 9.33325H6.44466C6.81285 9.33325 7.11133 9.63174 7.11133 9.99992C7.11133 10.3681 6.81285 10.6666 6.44466 10.6666H3.77799C3.40981 10.6666 3.11133 10.3681 3.11133 9.99992Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.667 9.99992C10.667 9.63174 10.9655 9.33325 11.3337 9.33325H12.2225C12.5907 9.33325 12.8892 9.63174 12.8892 9.99992C12.8892 10.3681 12.5907 10.6666 12.2225 10.6666H11.3337C10.9655 10.6666 10.667 10.3681 10.667 9.99992Z"
        fill={color}
      />
    </svg>
  );
}
