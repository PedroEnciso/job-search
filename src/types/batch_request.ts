export interface BatchRequest {
  id: string;
  created_at: string;
  updated_at: string;
  status: BatchRequestStatus;
}

type BatchRequestStatus =
  | "validating"
  | "failed"
  | "in_progress"
  | "finalizing"
  | "completed"
  | "expired"
  | "cancelling"
  | "cancelled";
