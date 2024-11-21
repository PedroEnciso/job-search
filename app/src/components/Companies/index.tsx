import { CompanyWithIsActive } from "../../../../server/types";

function CompaniesSection({
  is_pending,
  error,
  companies,
}: CompaniesSectionProps) {
  return (
    <section>
      {is_pending ? <p>Loading companies...</p> : null}
      {error ? <p>{error.message}</p> : null}
      {companies ? (
        <ul>
          {companies.map((company) => (
            <li key={company.id}>{company.name}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default CompaniesSection;

interface CompaniesSectionProps {
  is_pending: boolean;
  error: Error | null;
  companies: CompanyWithIsActive[] | undefined;
}
