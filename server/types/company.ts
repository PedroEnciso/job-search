export interface Company {
  id: number;
  name: string;
  jobs_url: string;
  alternate_url: string | null;
}

export interface CompanyWithIsActive extends Company {
  is_active: boolean;
}
