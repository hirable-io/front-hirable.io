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
  status: 'NEW' | 'REVIEWED' | 'ANALISYS';
  applicationDate: string;
  vacancy?: VacancyResponse;
}

/**
 * Resposta da API ao listar aplicações do candidato
 */
export interface ListApplicationsResponse {
  jobApplications: JobApplicationResponse[];
  total: number;
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
}

export const jobApplicationService = new JobApplicationService();
export type { ApiError };

