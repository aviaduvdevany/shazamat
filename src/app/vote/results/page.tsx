import type { Metadata } from "next";
import { getResults } from "@/lib/vote/queries";
import LiveResultsBoard from "@/components/vote/LiveResultsBoard";
import SimulateButton from "@/components/vote/SimulateButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "הנגן המצטיין — תוצאות",
  robots: { index: false, follow: false },
};

export default async function ResultsPage() {
  const initialResults = await getResults();
  return (
    <>
      <LiveResultsBoard initialResults={initialResults} />
      <SimulateButton />
    </>
  );
}
