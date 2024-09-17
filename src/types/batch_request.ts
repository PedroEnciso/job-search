export interface BatchRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: BatchRequestStatus;
}

export type BatchRequestStatus =
  | "validating"
  | "failed"
  | "in_progress"
  | "finalizing"
  | "completed"
  | "expired"
  | "cancelling"
  | "cancelled";
