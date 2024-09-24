import { Job } from "../types";

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

export function containsJobWithin48Hours(user_jobs: Job[]): Boolean {
  const now = Date.now();
  for (const job of user_jobs) {
    // get the difference in time
    const job_found_at = job.found_at.getTime();
    const time_difference = job_found_at - now;
    // check if the job is within 48 hours of now
    if (time_difference < 172800) {
      return true;
    }
  }
  return false;
}
