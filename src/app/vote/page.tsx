import type { Metadata } from "next";
import { PLAYERS } from "@/lib/vote/players";
import VoteBoard from "@/components/vote/VoteBoard";

export const metadata: Metadata = {
  title: "הנגן המצטיין",
  robots: { index: false, follow: false },
};

export default function VotePage() {
  return <VoteBoard players={PLAYERS} />;
}
