import type { Show } from "@/types";
import { isPastShow } from "./dates";

export function enrichShowsWithStatus(
  shows: Show[]
): (Show & { isPast: boolean })[] {
  return shows.map((show) => ({
    ...show,
    isPast: isPastShow(show.date),
  }));
}
