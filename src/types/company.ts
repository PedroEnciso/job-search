export interface Company {
  id: number;
  name: string;
  jobs_url: string;
}

export interface CompanyWithIsActive extends Company {
  is_active: boolean;
}
