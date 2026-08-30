import Image from "next/image";
import type { Player } from "@/lib/vote/players";

interface Props {
  player: Player;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default function PlayerAvatar({ player, size = 96 }: Props) {
  if (player.photoUrl) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 border-4 border-[#db7738]"
        style={{ width: size, height: size }}
      >
        <Image
          src={player.photoUrl}
          alt={player.name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center border-4 border-[#db7738] bg-[#db7738]/20 select-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="font-bold text-[#db7738] leading-none"
        style={{ fontSize: size * 0.33 }}
      >
        {getInitials(player.name)}
      </span>
    </div>
  );
}
