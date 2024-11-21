import { useGetCompaniesQuery } from "@/lib/queries";
import CompaniesSection from "@/components/Companies";

function Home() {
  const {
    isPending: company_is_pending,
    error: company_error,
    data: company_data,
  } = useGetCompaniesQuery();

  return (
    <div>
      <h1>JobScout</h1>
      <CompaniesSection
        is_pending={company_is_pending}
        error={company_error}
        companies={company_data}
      />
    </div>
  );
}

export default Home;
