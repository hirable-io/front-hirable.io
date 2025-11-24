import { apiClient, ApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';
import { VacancyResponse } from './vacancy-service';

/**
 * Dados necessários para aplicar a uma vaga
 */
export interface ApplyToVacancyRequest {
  vacancyId: string;
}

/**
 * Resposta da API ao criar uma aplicação
 */
export interface JobApplicationResponse {
  id: string;
  candidateId: string;
  vacancyId: string;
  status: 'NEW' | 'REVIEWED' | 'ANALISYS' | 'REJECTED' | 'HIRED';
  applicationDate: string;
  vacancy?: VacancyResponse;
  candidate?: {
    id: string;
    userId: string;
    fullName?: string;
    bio?: string;
    phone?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
    imageUrl?: string;
    tags?: Array<{ id: number; name: string }>;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

/**
 * Resposta da API ao listar aplicações do candidato
 */
export interface ListApplicationsResponse {
  jobApplications: JobApplicationResponse[];
  total: number;
}

/**
 * Parâmetros para buscar candidaturas de uma vaga específica
 */
export interface FetchVacancyApplicationsParams {
  vacancyId: string;
  limit?: number;
  offset?: number;
}

/**
 * Resposta da API ao buscar candidaturas de uma vaga
 */
export interface FetchVacancyApplicationsResponse {
  jobApplications: JobApplicationResponse[];
  total: number;
}

/**
 * Dados necessários para processar uma candidatura (atualizar status)
 */
export interface ProcessApplicationRequest {
  applicationId: string;
  status: 'NEW' | 'REVIEWED' | 'ANALISYS' | 'REJECTED' | 'HIRED';
  message?: string;
  sendMessage: boolean;
}

class JobApplicationService {
  /**
   * Aplica para uma vaga de emprego.
   * 
   * @param data - Dados da aplicação (vacancyId)
   * @returns Promise com a aplicação criada
   */
  async apply(data: ApplyToVacancyRequest): Promise<JobApplicationResponse> {
    return apiClient.post<JobApplicationResponse>(
      API_ENDPOINTS.JOB_APPLICATION.APPLY,
      data
    );
  }

  /**
   * Lista todas as aplicações do candidato autenticado.
   * Retorna aplicações com informações da vaga incluídas.
   * 
   * @returns Promise com lista de aplicações e total
   */
  async listApplications(): Promise<ListApplicationsResponse> {
    return apiClient.get<ListApplicationsResponse>(
      API_ENDPOINTS.JOB_APPLICATION.LIST
    );
  }

  /**
   * Busca candidaturas de uma vaga específica com paginação.
   * Retorna candidaturas com informações do candidato incluídas.
   * 
   * @param params - Parâmetros de busca (vacancyId, limit, offset)
   * @returns Promise com lista de candidaturas e total
   */
  async fetchVacancyApplications(
    params: FetchVacancyApplicationsParams
  ): Promise<FetchVacancyApplicationsResponse> {
    const { vacancyId, limit, offset } = params;
    
    const endpoint = API_ENDPOINTS.JOB_APPLICATION.FETCH_VACANCY_APPLICATIONS.replace(
      ':vacancyId',
      vacancyId
    );
    
    const queryParams = new URLSearchParams();
    if (limit !== undefined) {
      queryParams.append('limit', limit.toString());
    }
    if (offset !== undefined) {
      queryParams.append('offset', offset.toString());
    }
    
    const queryString = queryParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return apiClient.get<FetchVacancyApplicationsResponse>(fullEndpoint);
  }

  /**
   * Processa uma candidatura (atualiza status e opcionalmente envia email).
   * 
   * @param data - Dados do processamento (applicationId, status, message?, sendMessage)
   * @returns Promise vazio (void)
   * @throws Error se status for REJECTED e sendMessage for true
   */
  async processApplication(
    data: ProcessApplicationRequest
  ): Promise<void> {
    if (data.status === 'REJECTED' && data.sendMessage) {
      throw new Error('Não é possível enviar email ao rejeitar uma candidatura');
    }
    
    return apiClient.post<void>(
      API_ENDPOINTS.COMPANY.PROCESS_APPLICATION,
      data
    );
  }
}

export const jobApplicationService = new JobApplicationService();
export type { ApiError };

