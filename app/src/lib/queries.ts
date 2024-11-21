import { useQuery } from "@tanstack/react-query";
import type {
  CompanyWithIsActive,
  FrontendCurrentJob,
} from "../../../server/types";

export function useGetCompaniesQuery() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: (): Promise<CompanyWithIsActive[]> =>
      fetch("http://localhost:4321/api/v1/companies").then((res) => res.json()),
  });
}

export function useGetCurrentJobsQuery() {
  return useQuery({
    queryKey: ["current_jobs"],
    queryFn: (): Promise<FrontendCurrentJob[]> =>
      fetch("http://localhost:4321/api/v1/current_jobs").then((res) =>
        res.json()
      ),
  });
}
