import { getApiUrl } from '@/lib/config';
import { tokenStorage } from '@/lib/storage/token-storage';

export interface ApiError {
  status: number;
  message: string;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const token = tokenStorage.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiClient] Making request:', {
          method: options.method || 'GET',
          url,
          hasToken: !!token,
        });
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        throw this.createNetworkError();
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = getApiUrl(endpoint);
    const token = tokenStorage.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // DELETE pode retornar 204 No Content sem body
      if (response.status === 204) {
        return undefined as T;
      }

      // Verificar se há conteúdo antes de fazer parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return undefined as T;
      }

      // Se houver conteúdo JSON, fazer parse
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      const data = JSON.parse(text);
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        throw this.createNetworkError();
      }
      throw error;
    }
  }

  /**
   * Faz upload de arquivo usando FormData.
   * Não define Content-Type manualmente para permitir que o browser defina o boundary correto.
   * 
   * @param endpoint - Endpoint da API
   * @param formData - FormData contendo o arquivo a ser enviado
   * @returns Promise com a resposta do servidor
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = getApiUrl(endpoint);
    const token = tokenStorage.getToken();

    const headers: HeadersInit = {};
    // Não definir Content-Type - deixa browser definir com boundary

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiClient] Uploading file:', {
          method: 'POST',
          url,
          hasToken: !!token,
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        throw this.createNetworkError();
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: { error?: string; message?: string } = {};

    try {
      errorData = await response.json();
    } catch {
      errorData = { error: 'Unknown error' };
    }

    const apiError: ApiError = {
      status: response.status,
      message: errorData.message || errorData.error || this.getDefaultErrorMessage(response.status),
      error: errorData.error,
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('[ApiClient] Request failed:', {
        status: response.status,
        endpoint: response.url,
        error: apiError,
      });
    }

    throw apiError;
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 409:
        return 'Conflict: resource already exists';
      case 422:
        return 'Unprocessable entity';
      case 500:
        return 'Internal server error';
      default:
        return 'An error occurred';
    }
  }

  private createNetworkError(): ApiError {
    return {
      status: 0,
      message: 'Erro de conexão. Tente novamente.',
      error: 'NetworkError',
    };
  }
}

export const apiClient = new ApiClient();

