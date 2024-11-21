import type { Job } from "./";

export interface CurrentJob extends Job {
  user_id: string;
}

export interface NewCurrentJob {
  company_id: number;
  user_id: string;
  title: string;
  found_at: Date;
}

export interface FrontendCurrentJob {
  title: string;
  company: string;
  job_url: string;
  found_at: string;
}
