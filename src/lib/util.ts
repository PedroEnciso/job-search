import { Job } from "../types";

export function getErrorMessage(error: any, name: string): string {
  if (error instanceof Error) {
    return `Error in ${name}: ${error.message}`;
  } else {
    return `Unknown error in ${name}`;
  }
}

// checks if the given date is from today in Pacific Time (Los Angeles)
export function dateIsToday(date: Date): boolean {
  const utc_date = date.getUTCDate();
  const now = new Date();

  if (utc_date === now.getUTCDate()) {
    // date is today
    return true;
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

export function getUniqueCompanies(
  jobs: {
    title: string;
    company: string;
    job_url: string;
    found_at: string;
  }[]
): { name: string; url: string }[] {
  const unique_companies: { name: string; url: string }[] = [];

  jobs.map((job) => {
    const found_company_array = unique_companies.filter(
      (uc_job) => uc_job.name === job.company
    );
    if (found_company_array.length === 0) {
      unique_companies.push({
        name: job.company,
        url: `/?company=${job.company}`,
      });
    }
  });
  return unique_companies;
}
