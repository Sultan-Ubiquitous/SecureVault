import { ApiErrorResponse, TxSummary } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown network error occurred');
    }
  }

  getHealth() {
    return this.request<{ status: string; storage: string; timestamp: string }>('/health');
  }

  encrypt(partyId: string, payload: Record<string, unknown>) {
    return this.request<any>('/tx/encrypt', {
      method: 'POST',
      body: JSON.stringify({ partyId, payload }),
    });
  }

  getTx(id: string) {
    return this.request<any>(`/tx/${id}`);
  }

  decryptTx(id: string) {
    return this.request<{ id: string; partyId: string; payload: any }>(`/tx/${id}/decrypt`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  getAllTransactions() {
    return this.request<TxSummary[]>('/tx');
  }
}

export const api = new ApiClient();