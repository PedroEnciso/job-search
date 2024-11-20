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
