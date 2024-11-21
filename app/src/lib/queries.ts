import { useQuery } from "@tanstack/react-query";
import type { CompanyWithIsActive } from "../../../server/types";

export function useGetCompaniesQuery() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: (): Promise<CompanyWithIsActive[]> =>
      fetch("http://localhost:4321/api/v1/companies").then((res) => res.json()),
  });
}
