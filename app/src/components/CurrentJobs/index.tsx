// import type { CurrentJob } from "../../../../server/types";

import { FrontendCurrentJob } from "../../../../server/types";

function CurrentJobsSection({
  is_pending,
  error,
  current_jobs,
}: CurrentJobsSectionProps) {
  return (
    <section>
      <h2>Jobs we've found for you</h2>
      {is_pending ? <p>Loading jobs...</p> : null}
      {error ? <p>{error.message}</p> : null}
      {current_jobs && current_jobs.length > 0 ? (
        <ul>
          {current_jobs.map((job) => (
            <li>
              <span>
                <h3>{job.title}</h3> | {job.company}
              </span>
              <a href={job.job_url} target="_blank">
                View job
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>We have not found any jobs yet!</p>
      )}
    </section>
  );
}

export default CurrentJobsSection;

interface CurrentJobsSectionProps {
  is_pending: boolean;
  error: Error | null;
  current_jobs: FrontendCurrentJob[] | undefined;
}
