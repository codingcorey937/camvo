import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24' as any,
})

export async function createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
  return stripe.paymentIntents.create({
    amount,     // cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}

export async function constructWebhookEvent(payload: Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

export async function createConnectedAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    capabilities: { transfers: { requested: true } },
  })
}

export async function transferToCreator(amount: number, destinationStripeAccountId: string) {
  return stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: destinationStripeAccountId,
  })
}

export default stripe