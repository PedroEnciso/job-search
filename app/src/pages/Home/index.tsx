import { useEffect, useState } from "react";
import type { CompanyWithIsActive } from "../../../../server/types";

function Home() {
  const [companies, setCompanies] = useState<CompanyState>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getCompanies() {
      setIsLoading(true);
      const response = await fetch("http://localhost:4321/api/v1/companies");
      if (!response.ok) {
        console.log(response);
        const error = (await response.json()) as Error;
        setIsLoading(false);
        setError(error.message);
        return;
      }
      const data = await response.json();
      console.log(data);
      setIsLoading(false);
      setCompanies(data);
    }
    getCompanies();
  }, []);
  return (
    <div>
      <h1>JobScout</h1>
      {isLoading ? <p>Loading companies...</p> : null}
      {error ? <p>{error}</p> : null}
      {companies ? (
        <ul>
          {companies.map((company) => (
            <li key={company.id}>{company.name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Home;

type CompanyState = CompanyWithIsActive[] | null;
