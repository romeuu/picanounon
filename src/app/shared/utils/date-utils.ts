export function isToday(targetDate: Date): boolean {
  const now = new Date();

  return (
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate()
  );
}
