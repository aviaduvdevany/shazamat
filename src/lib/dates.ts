export function parseShowDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns true when the show date is before today in Israel local time
 * (Asia/Jerusalem). Always computed fresh — never cached.
 *
 * Uses Israel timezone so that a show on Aug 15 is "past" for an Israeli
 * visitor on the evening of Aug 15, even when the Vercel runtime is UTC.
 */
export function isPastShow(dateString: string): boolean {
  const [year, month, day] = dateString.split("-").map(Number);

  // Today's calendar date in Israel (en-CA gives YYYY-MM-DD)
  const israelToday = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jerusalem",
  });
  const [tYear, tMonth, tDay] = israelToday.split("-").map(Number);

  if (year !== tYear) return year < tYear;
  if (month !== tMonth) return month < tMonth;
  return day < tDay;
}

export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
