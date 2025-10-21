export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculate time remaining until a given end time
 * @param endTime - ISO string or Date object representing the end time
 * @returns TimeLeft object with days, hours, minutes, seconds or null if time has passed
 */
export function calculateTimeLeft(endTime: string | Date): TimeLeft | null {
  const now = new Date().getTime();
  const endTimeMs =
    typeof endTime === "string"
      ? new Date(endTime).getTime()
      : endTime.getTime();
  const difference = endTimeMs - now;

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

/**
 * Format time left into a compact string representation
 * @param timeLeft - TimeLeft object
 * @returns Formatted string like "2d 3h 45m" or "45m 30s"
 */
export function formatTimeLeft(timeLeft: TimeLeft): string {
  if (timeLeft.days > 0) {
    return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
  } else if (timeLeft.hours > 0) {
    return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
  } else {
    return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  }
}

/**
 * Get singular or plural label based on value
 * @param value - The numeric value
 * @param label - The plural label (e.g., "Days", "Hours")
 * @returns Singular label if value is 1, plural otherwise
 */
export function getDynamicLabel(value: number, label: string): string {
  return value === 1 ? label.slice(0, -1) : label;
}

/**
 * Create a zero time left object
 */
export function createZeroTimeLeft(): TimeLeft {
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
}

/**
 * Check if an auction is still active based on end time
 * @param endsAt - ISO string representing the auction end time
 * @returns true if auction is still active, false if it has ended
 */
export function isAuctionActive(endsAt: string): boolean {
  return calculateTimeLeft(endsAt) !== null;
}
