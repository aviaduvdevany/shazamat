import { useMemo } from "react";
import { upcomingShows } from "@/data";
import { enrichShowsWithStatus } from "@/lib/shows";

export function useShows() {
  return useMemo(() => enrichShowsWithStatus(upcomingShows), []);
}
