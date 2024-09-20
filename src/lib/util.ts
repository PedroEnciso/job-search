export function getErrorMessage(error: any, name: string): string {
  if (error instanceof Error) {
    return `Error in ${name}: ${error.message}`;
  } else {
    console.log("error:", error);
    return `Unknown error in ${name}`;
  }
}

// checks if the given date is from today in Pacific Time (Los Angeles)
export function dateIsTodayPST(date: Date): boolean {
  const utc_date = date.getUTCDate();
  const utc_hour = date.getUTCHours();
  const now = new Date();

  if (utc_date === now.getUTCDate()) {
    if (utc_hour > 6) {
      // date is today
      return true;
    }
  } else if (utc_date === now.getUTCDate() + 1) {
    if (utc_hour < 7) {
      // date is today
      return true;
    }
  }

  return false;
}

export function getStartAndEndHours(): { start_date: Date; end_date: Date } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return {
    start_date: start,
    end_date: end,
  };
}
