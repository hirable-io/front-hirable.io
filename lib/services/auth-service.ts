import { apiClient, ApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';

export interface CandidateSignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface EmployerSignupData {
  companyName: string;
  contactName: string;
  cnpj: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  candidate?: {
    id: string;
    fullName: string;
    phone: string;
    bio: string;
    tags: Array<{ id: number; name: string }>;
  };
  company?: {
    id: string;
    name: string;
    document: string;
    contactName: string;
    phone: string;
  };
}

export interface LoginResponse {
  accessToken: string;
}

interface BackendRegisterRequest {
  user: {
    email: string;
    password: string;
    role: 'CANDIDATE' | 'EMPLOYER';
    phone: string;
  };
  candidate?: {
    fullName: string;
    bio: string;
    phone: string;
  };
  company?: {
    name: string;
    document: string;
    contactName: string;
    phone: string;
  };
}

class AuthService {
  async registerCandidate(data: CandidateSignupData): Promise<RegisterResponse> {
    const backendData = this.transformCandidateData(data);
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, backendData);
  }

  async registerEmployer(data: EmployerSignupData): Promise<RegisterResponse> {
    const backendData = this.transformEmployerData(data);
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, backendData);
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });
  }

  private transformCandidateData(data: CandidateSignupData): BackendRegisterRequest {
    return {
      user: {
        email: data.email,
        password: data.password,
        role: 'CANDIDATE',
        phone: data.phone,
      },
      candidate: {
        fullName: data.fullName,
        bio: '',
        phone: data.phone,
      },
    };
  }

  private transformEmployerData(data: EmployerSignupData): BackendRegisterRequest {
    return {
      user: {
        email: data.email,
        password: data.password,
        role: 'EMPLOYER',
        phone: data.phone,
      },
      company: {
        name: data.companyName,
        document: this.normalizeCnpj(data.cnpj),
        contactName: data.contactName,
        phone: data.phone,
      },
    };
  }

  private normalizeCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }
}

export const authService = new AuthService();
export type { ApiError };

