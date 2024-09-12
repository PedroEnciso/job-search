import { db } from ".";
import { batchRequestTable } from "./schema";
import type { Company } from "../types";

export async function getCompanyUrls(): Promise<Array<Company>> {
  return await db.query.companyTable.findMany();
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
