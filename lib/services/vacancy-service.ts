import { apiClient, ApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';

export interface CreateVacancyRequest {
  title: string;
  description: string;
  location: string;
  minimumSalaryValue: number;
  maximumSalaryValue: number;
  modality: 'REMOTE' | 'HYBRID' | 'ONSITE';
  status: 'OPEN';
  tags?: Array<{ id: number; name: string }>;
}

export interface VacancyResponse {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  minimumSalaryValue: number;
  maximumSalaryValue: number;
  status: string;
  modality: string;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: number; name: string }>;
}

/**
 * Dados do formulário antes da transformação.
 * Não inclui status, que será adicionado automaticamente.
 */
export interface CreateVacancyFormData {
  title: string;
  description: string;
  location: string;
  minimumSalaryValue: number;
  maximumSalaryValue: number;
  modality: 'REMOTE' | 'HYBRID' | 'ONSITE';
  tags?: Array<{ id: number; name: string }>;
}

/**
 * Parâmetros para listagem de vagas
 */
export interface ListVacanciesParams {
  limit?: number;
  offset?: number;
}

/**
 * Resposta da listagem de vagas
 */
export interface ListVacanciesResponse {
  vacancies: VacancyResponse[];
  total: number;
}

/**
 * Parâmetros para listagem de vagas disponíveis para candidatos
 */
export interface ListAvailableVacanciesParams {
  limit?: number;
  offset?: number;
  modality?: 'REMOTE' | 'HYBRID' | 'ONSITE';
}

/**
 * Resposta da listagem de vagas disponíveis para candidatos
 */
export interface ListAvailableVacanciesResponse {
  vacancies: VacancyResponse[];
  total: number;
}

/**
 * Dados para atualização de vaga
 * Nota: O backend requer todos os campos, então enviamos todos os valores
 */
export interface UpdateVacancyFormData {
  title: string;
  description: string;
  location: string;
  minimumSalaryValue: number;
  maximumSalaryValue: number;
  status: 'OPEN' | 'CLOSED';
  modality: 'REMOTE' | 'HYBRID' | 'ONSITE';
  tags?: Array<{ id: number; name: string }>;
}

class VacancyService {
  /**
   * Cria uma nova vaga de emprego.
   * Adiciona automaticamente status: 'OPEN' aos dados.
   * 
   * @param data - Dados da vaga (sem status)
   * @returns Promise com a vaga criada
   */
  async createVacancy(data: CreateVacancyFormData): Promise<VacancyResponse> {
    // Transformar dados do formulário para formato do backend
    const requestData: CreateVacancyRequest = {
      ...data,
      status: 'OPEN', // Sempre adicionar status OPEN ao criar
    };

    return apiClient.post<VacancyResponse>(
      API_ENDPOINTS.COMPANY.CREATE_VACANCY,
      requestData
    );
  }

  /**
   * Lista as vagas da empresa do usuário autenticado.
   * Suporta paginação através de limit e offset.
   * 
   * @param params - Parâmetros de paginação (limit, offset)
   * @returns Promise com lista de vagas e total
   */
  async listVacancies(params?: ListVacanciesParams): Promise<ListVacanciesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.COMPANY.LIST_VACANCIES}?${queryString}`
      : API_ENDPOINTS.COMPANY.LIST_VACANCIES;

    return apiClient.get<ListVacanciesResponse>(endpoint);
  }

  /**
   * Atualiza uma vaga existente.
   * Permite atualização parcial (apenas campos fornecidos serão atualizados).
   * 
   * @param id - ID da vaga a ser atualizada
   * @param data - Dados parciais para atualização
   * @returns Promise com a vaga atualizada
   */
  async updateVacancy(id: string, data: UpdateVacancyFormData): Promise<VacancyResponse> {
    const endpoint = `${API_ENDPOINTS.COMPANY.UPDATE_VACANCY}/${id}`;
    
    return apiClient.put<VacancyResponse>(endpoint, data);
  }

  /**
   * Exclui uma vaga existente.
   * 
   * @param id - ID da vaga a ser excluída
   * @returns Promise que resolve quando a exclusão for concluída
   */
  async deleteVacancy(id: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.COMPANY.DELETE_VACANCY}/${id}`;
    
    await apiClient.delete<void>(endpoint);
  }

  /**
   * Lista vagas disponíveis para candidatos.
   * Retorna apenas vagas para as quais o candidato ainda não aplicou.
   * Suporta filtro por modalidade e paginação.
   * 
   * @param params - Parâmetros opcionais (modality, limit, offset)
   * @returns Promise com lista de vagas disponíveis e total
   */
  async listAvailableVacancies(
    params?: ListAvailableVacanciesParams
  ): Promise<ListAvailableVacanciesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.modality) {
      queryParams.append('modality', params.modality);
    }
    
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.CANDIDATE.LIST_VACANCIES}?${queryString}`
      : API_ENDPOINTS.CANDIDATE.LIST_VACANCIES;

    return apiClient.get<ListAvailableVacanciesResponse>(endpoint);
  }
}

export const vacancyService = new VacancyService();
export type { ApiError };

