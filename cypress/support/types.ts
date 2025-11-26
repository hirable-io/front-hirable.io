export interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface EmployerData {
  companyName: string;
  contactName: string;
  cnpj: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface VacancyData {
  title: string;
  description: string;
  location: string;
  modality: 'REMOTE' | 'HYBRID' | 'ONSITE';
  minimumSalaryValue: number;
  maximumSalaryValue: number;
}

