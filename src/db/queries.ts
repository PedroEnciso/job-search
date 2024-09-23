import { db } from ".";
import { desc, eq, notInArray } from "drizzle-orm";
import {
  batchRequestTable,
  companyTable,
  jobTable,
  match_records,
  user_jobs,
  users,
} from "./schema";
import type { Company, BatchRequest, BatchRequestStatus, User } from "../types";
import {
  dateIsTodayPST,
  getErrorMessage,
  getStartAndEndHours,
} from "../lib/util";

// SELECT queries
export async function getAllCompanies(): Promise<Array<Company>> {
  try {
    return await db.query.companyTable.findMany();
  } catch (error) {
    throw new Error(getErrorMessage(error, "getAllCompanies"));
  }
}

// returns the oldest pending batch request based on created_at column
export async function getOldestPendingBatchRequest(): Promise<
  Array<BatchRequest>
> {
  return await db
    .select()
    .from(batchRequestTable)
    .where(
      notInArray(batchRequestTable.status, [
        "failed",
        "cancelled",
        "expired",
        "completed",
      ])
    )
    .orderBy(batchRequestTable.created_at)
    .limit(1);
}

export async function getYoungestCompletedBatchRequest(): Promise<
  Array<BatchRequest>
> {
  try {
    return db
      .select()
      .from(batchRequestTable)
      .where(eq(batchRequestTable.status, "completed"))
      .orderBy(desc(batchRequestTable.created_at))
      .limit(1);
  } catch (error) {
    throw new Error(getErrorMessage(error, "getYoungestCompletedBatchRequest"));
  }
}

export async function createBatchRequest(
  request_id: string,
  file_id: string
): Promise<void> {
  try {
    await db.insert(batchRequestTable).values({
      id: request_id,
      status: "validating",
      file_id,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "createBatchRequest"));
  }
}

export async function updateBatchRequestStatus(
  id: string,
  newStatus: BatchRequestStatus
): Promise<void> {
  try {
    await db
      .update(batchRequestTable)
      .set({ status: newStatus })
      .where(eq(batchRequestTable.id, id));
  } catch (error) {
    throw new Error(getErrorMessage(error, "updateBatchRequestStatus"));
  }
}

export async function insertManyJobs(
  jobs: {
    title: string;
    found_at: Date;
    company_id: number;
  }[]
): Promise<void> {
  try {
    // create an array of job
    await db.insert(jobTable).values(jobs);
  } catch (error) {
    throw new Error(getErrorMessage(error, "insertManyJobs"));
  }
}

export async function getLatestMatchRecord(): Promise<
  Array<{ id: number; created_at: Date }>
> {
  try {
    // create an array of job
    return await db
      .select()
      .from(match_records)
      .orderBy(desc(match_records.created_at))
      .limit(1);
  } catch (error) {
    throw new Error(getErrorMessage(error, "getLatestMatchRecord"));
  }
}

export async function getUsers(): Promise<Array<User>> {
  try {
    return await db.select().from(users);
  } catch (error) {
    throw new Error(getErrorMessage(error, "getUsers"));
  }
}

export async function getUserCompanies(
  user_id: string
): Promise<Array<Company>> {
  try {
    const result = await db.query.user_companies.findMany({
      where: (user_companies, { eq }) => eq(user_companies.user_id, user_id),
      with: {
        company: true,
      },
    });
    return result.map((user) => user.company);
  } catch (error) {
    throw new Error(getErrorMessage(error, "getUserCompanies"));
  }
}

export async function getUserKeywords(user_id: string): Promise<Array<string>> {
  try {
    const result = await db.query.user_keywords.findMany({
      where: (user_keywords, { eq }) => eq(user_keywords.user_id, user_id),
      with: {
        keywords: true,
      },
    });
    return result.map((user) => user.keywords.phrase);
  } catch (error) {
    throw new Error(getErrorMessage(error, "getUserCompanies"));
  }
}

export async function getCompanyJobsFromToday(company_id: number): Promise<
  Array<{
    id: number;
    title: string;
    found_at: Date;
  }>
> {
  try {
    const { start_date, end_date } = getStartAndEndHours();
    return await db.query.jobTable.findMany({
      where: (jobTable, { and, eq, between }) =>
        and(
          eq(jobTable.company_id, company_id),
          between(jobTable.found_at, start_date, end_date)
        ),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "getCompanyJobs"));
  }
}

export async function createUserJob(user_id: string, job_id: number) {
  try {
    await db.insert(user_jobs).values({
      user_id,
      job_id,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "createUserJob"));
  }
}

export async function createMatchRecord() {
  try {
    await db.insert(match_records).values({});
  } catch (error) {
    throw new Error(getErrorMessage(error, "createUserJob"));
  }
}
