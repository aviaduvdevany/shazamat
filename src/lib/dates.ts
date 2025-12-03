export function parseShowDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isPastShow(dateString: string): boolean {
  const showDate = parseShowDate(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return showDate < now;
}

export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
