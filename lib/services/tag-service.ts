import { apiClient, ApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';

export interface Tag {
  id: number;
  name: string;
}

class TagService {
  /**
   * Busca tags disponíveis da API.
   * A API retorna um array de tags no formato: [{id: number, name: string}]
   * Se a API não estiver disponível, retorna tags mockadas como fallback.
   * 
   * @returns Promise com array de tags
   */
  async getTags(): Promise<Tag[]> {
    try {
      const tags = await apiClient.get<Tag[]>(API_ENDPOINTS.TAGS);
      return tags;
    } catch (error) {
      // Se a requisição falhar (API não disponível, erro de rede, 404, etc),
      // usar tags mockadas sem exibir erro ao usuário
      if (process.env.NODE_ENV === 'development') {
        const apiError = error as ApiError;
        console.warn('[TagService] API de tags indisponível, usando tags mockadas:', {
          status: apiError.status,
          message: apiError.message,
        });
      }
      return this.getMockTags();
    }
  }

  /**
   * Retorna tags mockadas para uso quando a API não está disponível.
   * 
   * @returns Array de tags mockadas
   */
  private getMockTags(): Tag[] {
    return [
      { id: 1, name: 'React' },
      { id: 2, name: 'Node.js' },
      { id: 3, name: 'Python' },
      { id: 4, name: 'TypeScript' },
      { id: 5, name: 'JavaScript' },
      { id: 6, name: 'Design' },
      { id: 7, name: 'Marketing' },
      { id: 8, name: 'Backend' },
      { id: 9, name: 'Frontend' },
      { id: 10, name: 'DevOps' },
      { id: 11, name: 'Java' },
      { id: 12, name: 'C#' },
      { id: 13, name: 'Go' },
      { id: 14, name: 'Ruby' },
      { id: 15, name: 'PHP' },
    ];
  }
}

export const tagService = new TagService();
export type { ApiError };

