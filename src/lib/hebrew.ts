export const HEBREW_MONTHS: Readonly<Record<number, string>> = {
  0: "ינו", // January
  1: "פבר", // February
  2: "מרץ", // March
  3: "אפר", // April
  4: "מאי", // May
  5: "יונ", // June
  6: "יולי", // July
  7: "אוג", // August
  8: "ספט", // September
  9: "אוק", // October
  10: "נוב", // November
  11: "דצמ", // December
} as const;

export function formatDateToHebrew(dateString: string): {
  day: string;
  month: string;
} {
  const [year, monthNum, dayNum] = dateString.split("-").map(Number);
  const day = dayNum.toString().padStart(2, "0");
  const month = HEBREW_MONTHS[monthNum - 1] || "";
  return { day, month };
}
