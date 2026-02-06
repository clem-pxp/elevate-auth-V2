interface PlayStoreIconProps {
  className?: string;
}

export function PlayStoreIcon({ className }: PlayStoreIconProps) {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.546875 0.695312C0.203125 1.05469 0 1.60156 0 2.29688V19.7031C0 20.3984 0.203125 20.9453 0.546875 21.3047L0.617188 21.375L10.3984 11.5938V11.4062L0.617188 1.625L0.546875 0.695312Z"
        fill="currentColor"
      />
      <path
        d="M13.6641 14.8594L10.3984 11.5938V11.4062L13.6641 8.14062L13.7578 8.19531L17.6016 10.4062C18.6953 11.0234 18.6953 11.9766 17.6016 12.6016L13.7578 14.8047L13.6641 14.8594Z"
        fill="currentColor"
      />
      <path
        d="M13.7578 14.8047L10.3984 11.5L0.546875 21.3047C0.890625 21.6641 1.44531 21.7109 2.07031 21.3516L13.7578 14.8047Z"
        fill="currentColor"
      />
      <path
        d="M13.7578 8.19531L2.07031 1.64844C1.44531 1.28906 0.890625 1.33594 0.546875 1.69531L10.3984 11.5L13.7578 8.19531Z"
        fill="currentColor"
      />
    </svg>
  );
}
