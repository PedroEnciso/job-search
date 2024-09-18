import { db } from ".";
import { desc, eq, notInArray } from "drizzle-orm";
import { batchRequestTable, jobTable, match_records } from "./schema";
import type { Company, BatchRequest, BatchRequestStatus } from "../types";
import { getErrorMessage } from "../lib/util";

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
