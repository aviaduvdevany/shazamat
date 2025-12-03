import type { Show } from "@/types";

/**
 * Shows Data
 * Update this file to add new shows or modify existing ones
 * Date format: YYYY-MM-DD (ISO format)
 */
export const upcomingShows: Show[] = [
  {
    id: 1,
    date: "2024-11-01", // Past show
    city: "תל אביב",
    venue: "קונטיינר",
    ticketLink: "#",
  },
  {
    id: 2,
    date: "2024-11-15", // Past show
    city: "חיפה",
    venue: "בית האמנים",
    ticketLink: "#",
  },
  {
    id: 3,
    date: "2024-11-22", // Past show
    city: "ירושלים",
    venue: "הזאפה",
    ticketLink: "#",
  },
  {
    id: 4,
    date: "2025-12-06", // Future show
    city: "באר שבע",
    venue: "קאנטרי",
    ticketLink: "#",
  },
  {
    id: 5,
    date: "2025-12-13", // Future show
    city: "רמת גן",
    venue: "היכל התרבות",
    ticketLink: "#",
  },
];
