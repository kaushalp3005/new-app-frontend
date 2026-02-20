import { useAuthStore } from '@/lib/stores/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface UserRecord {
  id: string
  email: string
  name: string
  is_developer: boolean
  is_active: boolean
}

export interface CreateUserPayload {
  email: string
  password: string
  name: string
  is_developer: boolean
  is_active: boolean
}

export interface UpdateUserPayload {
  email?: string
  password?: string
  name?: string
  is_developer?: boolean
  is_active?: boolean
}

class UserApiService {
  private getAuthHeaders(): HeadersInit {
    const { accessToken } = useAuthStore.getState()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail)
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }
    return response.json()
  }

  async getUsers(): Promise<UserRecord[]> {
    const response = await fetch(`${API_BASE}/auth/users`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<UserRecord[]>(response)
  }

  async createUser(payload: CreateUserPayload): Promise<UserRecord> {
    const response = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    return this.handleResponse<UserRecord>(response)
  }

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserRecord> {
    const response = await fetch(`${API_BASE}/auth/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    return this.handleResponse<UserRecord>(response)
  }

  async deleteUser(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<{ message: string }>(response)
  }
}

export const userApiService = new UserApiService()
