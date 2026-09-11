import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

let client: twilio.Twilio | null = null
if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
} else {
  console.warn('Twilio not configured — SMS will be logged')
}

export async function sendJoinLink(phoneNumber: string, roomUrl: string, creatorName: string): Promise<void> {
  const message = `You're booked! Join your call with ${creatorName}: ${roomUrl}`

  if (!client) {
    console.log(`[SMS would send] To: ${phoneNumber}: ${message}`)
    return
  }

  await client.messages.create({
    body: message,
    from: fromNumber,
    to: phoneNumber,
  })
}

export async function sendBookingConfirmation(phoneNumber: string, roomUrl: string, creatorName: string, startTime: string): Promise<void> {
  const message = `Call confirmed with ${creatorName} at ${startTime}. Join here: ${roomUrl}`

  if (!client) {
    console.log(`[SMS would send] To: ${phoneNumber}: ${message}`)
    return
  }

  await client.messages.create({
    body: message,
    from: fromNumber,
    to: phoneNumber,
  })
}