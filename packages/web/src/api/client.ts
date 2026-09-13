const API_BASE = '/api'

interface ApiOptions {
  method?: string
  body?: unknown
  token?: string | null
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || data.details?.map((d: any) => d.message).join(', ') || `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string; fullName: string; phone?: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (email: string, password: string, fullName: string, phone?: string) =>
    request<{ user: { id: string; email: string; fullName: string; phone?: string }; token: string }>('/auth/signup', {
      method: 'POST',
      body: { email, password, fullName, phone },
    }),

  // Users
  getMe: (token: string) =>
    request<{ id: string; email: string; full_name: string; phone?: string; avatar_url?: string; creatorProfile?: any }>(
      '/users/me',
      { token }
    ),

  getCreators: (search?: string, tag?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (tag) params.set('tag', tag)
    return request<{ creators: any[]; count?: number }>(`/users/creators?${params}`)
  },

  getCreator: (id: string) => request<any>(`/users/creators/${id}`),

  // Bookings
  createBooking: (
    token: string,
    data: { creatorId: string; startTime: string; durationMinutes: number; priceCents: number; viewerPhone: string }
  ) =>
    request<{
      bookingId: string
      clientSecret: string
      roomUrl: string
      priceCents: number
      platformFeeCents: number
      creatorPayoutCents: number
    }>('/bookings', {
      method: 'POST',
      body: data,
      token,
    }),

  confirmBooking: (token: string, bookingId: string, paymentIntentId: string) =>
    request<{ booking: any; message: string; platformFeeCents: number; creatorPayoutCents: number }>('/bookings/confirm', {
      method: 'POST',
      body: { bookingId, paymentIntentId },
      token,
    }),

  getMyBookings: (token: string) =>
    request<{ bookings: any[] }>('/bookings/my', { token }),

  // Config
  getConfig: () =>
    request<{ stripePublishableKey: string; supabaseUrl?: string }>('/config/public'),
}

export const getToken = (): string | null => localStorage.getItem('camvo_token')
export const setToken = (token: string) => localStorage.setItem('camvo_token', token)
export const clearToken = () => localStorage.removeItem('camvo_token')