import { db } from ".";
import { eq, notInArray } from "drizzle-orm";
import { batchRequestTable } from "./schema";
import type { Company, BatchRequest, BatchRequestStatus } from "../types";

// SELECT queries
// TODO: rename function to getAllCompanys
export async function getCompanyUrls(): Promise<Array<Company>> {
  return await db.query.companyTable.findMany();
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

export async function createBatchRequest(
  request_id: string,
  file_id: string
): Promise<void> {
  await db.insert(batchRequestTable).values({
    id: request_id,
    status: "validating",
    file_id,
  });
}

export async function updateBatchRequestStatus(
  id: string,
  newStatus: BatchRequestStatus
): Promise<void> {
  await db
    .update(batchRequestTable)
    .set({ status: newStatus })
    .where(eq(batchRequestTable.id, id));
}
