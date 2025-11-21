import { apiClient, ApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';

/**
 * Resposta ao buscar perfil do candidato
 */
export interface CandidateProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  linkedInUrl?: string;
  resumeUrl?: string;
  imageUrl?: string; // Foto de perfil do candidato
  user: {
    id: string;
    email: string;
    imageUrl?: string; // Mantido para compatibilidade
  };
  tags?: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Requisição para atualizar perfil do candidato
 */
export interface UpdateCandidateRequest {
  fullName?: string;
  phone?: string;
  linkedInUrl?: string;
}

/**
 * Resposta de upload de imagem de perfil
 */
export interface UploadImageResponse {
  url: string;
}

/**
 * Resposta de upload de currículo
 */
export interface UploadResumeResponse {
  resumeUrl: string;
}

class CandidateService {
  /**
   * Busca dados completos do candidato autenticado.
   * Inclui dados do candidato e do usuário (email, imageUrl).
   * 
   * @returns Promise com dados do perfil do candidato
   */
  async getProfile(): Promise<CandidateProfileResponse> {
    return apiClient.get<CandidateProfileResponse>(
      API_ENDPOINTS.CANDIDATE.GET
    );
  }

  /**
   * Atualiza dados cadastrais do candidato.
   * Campos opcionais: fullName, phone, linkedInUrl
   * 
   * @param data - Dados para atualização (parciais)
   * @returns Promise com perfil atualizado
   */
  async updateProfile(data: UpdateCandidateRequest): Promise<CandidateProfileResponse> {
    return apiClient.put<CandidateProfileResponse>(
      API_ENDPOINTS.CANDIDATE.UPDATE,
      data
    );
  }

  /**
   * Faz upload de foto de perfil.
   * Arquivo deve ser imagem (JPG, PNG, WebP) até 2MB.
   * 
   * @param file - Arquivo de imagem a ser enviado
   * @returns Promise com URL da imagem enviada
   */
  async uploadProfileImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.postFormData<UploadImageResponse>(
      API_ENDPOINTS.USER.UPLOAD_PROFILE_IMAGE,
      formData
    );
  }

  /**
   * Faz upload de currículo em PDF.
   * Arquivo deve ser PDF até 5MB.
   * 
   * @param file - Arquivo PDF a ser enviado
   * @returns Promise com URL do currículo enviado
   */
  async uploadResume(file: File): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.postFormData<UploadResumeResponse>(
      API_ENDPOINTS.CANDIDATE.UPLOAD_RESUME,
      formData
    );
  }
}

export const candidateService = new CandidateService();
export type { ApiError };

