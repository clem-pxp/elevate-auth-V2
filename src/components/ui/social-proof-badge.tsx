const avatars = [
  "/images/avatar_01.png",
  "/images/avatar_02.png",
  "/images/avatar_03.png",
  "/images/avatar_04.png",
];

interface SocialProofBadgeProps {
  text?: string;
  className?: string;
}

export function SocialProofBadge({
  text = "Rejoins +1500 utilisatrices",
  className = "",
}: SocialProofBadgeProps) {
  return (
    <div
      className={`w-fit py-1.5 pr-5 pl-1.5 rounded-full bg-strong/4 flex items-center justify-center gap-2 ${className}`}
    >
      <div className="flex items-center justify-center">
        {avatars.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`size-7 rounded-full object-cover border-2 border-[#ECECEC] ${index > 0 ? "ml-[-0.875rem]" : ""}`}
          />
        ))}
      </div>
      <span className="text-s font-medium">{text}</span>
    </div>
  );
}
