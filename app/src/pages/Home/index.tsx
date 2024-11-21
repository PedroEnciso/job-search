import { useGetCompaniesQuery, useGetCurrentJobsQuery } from "@/lib/queries";
import CompaniesSection from "@/components/Companies";
import CurrentJobsSection from "@/components/CurrentJobs";

function Home() {
  // fetch current jobs
  const {
    isPending: current_jobs_is_pending,
    error: current_jobs_error,
    data: current_jobs,
  } = useGetCurrentJobsQuery();
  // fetch companies
  const {
    isPending: company_is_pending,
    error: company_error,
    data: company_data,
  } = useGetCompaniesQuery();

  return (
    <div>
      <h1>JobScout</h1>
      <CurrentJobsSection
        is_pending={current_jobs_is_pending}
        error={current_jobs_error}
        current_jobs={current_jobs}
      />
      <CompaniesSection
        is_pending={company_is_pending}
        error={company_error}
        companies={company_data}
      />
    </div>
  );
}

export default Home;
