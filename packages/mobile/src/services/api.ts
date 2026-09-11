const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

interface RequestOptions {
  body?: any
  method?: string
  token?: string
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return data
}

export const auth = {
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', { body: { email, password } }),

  signup: (email: string, password: string, fullName: string, phone?: string) =>
    apiRequest('/api/auth/signup', { body: { email, password, fullName, phone } }),
}

export const users = {
  getMe: (token: string) => apiRequest('/api/users/me', { method: 'GET', token }),
  updateMe: (token: string, data: any) => apiRequest('/api/users/me', { method: 'PUT', token, body: data }),
  saveCreatorProfile: (token: string, data: any) =>
    apiRequest('/api/users/creator-profile', { method: 'PUT', token, body: data }),
  getCreators: (token?: string, params?: { search?: string; tag?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return apiRequest(`/api/users/creators${qs}`, { method: 'GET', token })
  },
  getCreator: (id: string, token?: string) =>
    apiRequest(`/api/users/creators/${id}`, { method: 'GET', token }),
}

export const bookings = {
  create: (token: string, data: any) => apiRequest('/api/bookings', { token, body: data }),
  confirm: (token: string, bookingId: string, paymentIntentId: string) =>
    apiRequest('/api/bookings/confirm', { token, body: { bookingId, paymentIntentId } }),
  getMy: (token: string) => apiRequest('/api/bookings/my', { method: 'GET', token }),
  getHost: (token: string) => apiRequest('/api/bookings/host', { method: 'GET', token }),
}