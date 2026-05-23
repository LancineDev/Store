import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CinetPayWebhookPayload {
  cpm_trans_id: string
  cpm_result: string
  [key: string]: any
}

interface CinetPayCheckResponse {
  code: string
  message: string
  data: {
    status: string
    [key: string]: any
  }
}

async function verifyCinetPayPayment(transactionId: string): Promise<string> {
  const apiKey = process.env.CINETPAY_API_KEY
  const siteId = process.env.CINETPAY_SITE_ID

  if (!apiKey || !siteId) {
    throw new Error('Missing CinetPay configuration')
  }

  const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
    }),
  })

  if (!response.ok) {
    throw new Error(`CinetPay API error: ${response.status}`)
  }

  const result: CinetPayCheckResponse = await response.json()

  if (result.code !== '00') {
    throw new Error(`CinetPay verification failed: ${result.message}`)
  }

  return result.data.status
}

export async function POST(request: NextRequest) {
  try {
    const body: CinetPayWebhookPayload = await request.json()
    const { cpm_trans_id: transactionId, cpm_result: result } = body

    if (!transactionId) {
      console.error('Missing transaction ID in webhook')
      return NextResponse.json({ status: 'error', message: 'Missing transaction ID' }, { status: 200 })
    }

    console.log(`Received CinetPay webhook for transaction: ${transactionId}, result: ${result}`)

    // Re-verify payment server-side
    let verifiedStatus: string
    try {
      verifiedStatus = await verifyCinetPayPayment(transactionId)
    } catch (error) {
      console.error('Payment verification failed:', error)
      // If verification fails, mark as failed
      verifiedStatus = 'FAILED'
    }

    // Update order status based on verification
    const newStatus = verifiedStatus === 'ACCEPTED' ? 'COMPLETED' : 'FAILED'

    try {
      await prisma.order.update({
        where: { id: transactionId },
        data: { status: newStatus },
      })
      console.log(`Order ${transactionId} updated to ${newStatus}`)
    } catch (error) {
      console.error(`Failed to update order ${transactionId}:`, error)
      // Continue processing even if DB update fails
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Always return 200 to prevent retries
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 200 })
  }
}