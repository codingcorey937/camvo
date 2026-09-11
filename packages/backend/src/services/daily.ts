const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || 'camvo.daily.co'

if (!DAILY_API_KEY) {
  console.warn('DAILY_API_KEY not set')
}

export interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: Record<string, any>
}

export async function createRoom(properties?: Record<string, any>): Promise<DailyRoom> {
  const res = await fetch(`https://api.daily.co/v1/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      privacy: 'private',
      properties: {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        enable_chat: true,
        enable_screenshare: true,
        ...properties,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Daily.co API error: ${res.status} ${body}`)
  }

  return res.json() as Promise<DailyRoom>
}

export async function deleteRoom(roomName: string): Promise<void> {
  await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
  })
}

export async function getRoom(roomName: string): Promise<DailyRoom | null> {
  const res = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Daily.co API error: ${res.status}`)
  return res.json() as Promise<DailyRoom | null>
}