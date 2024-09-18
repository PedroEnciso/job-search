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

export interface BatchResponse {
  id: string;
  custom_id: string;
  response: {
    status_code: number;
    request_id: string;
    body: {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: {
        index: number;
        message: {
          role: string;
          content: string;
        };
        logprobs: null | string;
        finish_reason: string;
      }[];
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      system_fingerprint: string;
    };
  };
  error: null | {
    error_file_id: string;
  };
}
