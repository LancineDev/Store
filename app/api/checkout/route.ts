import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createCinetPayPayment } from '@/lib/cinetpay'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'

// Validation schema
const checkoutSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = checkoutSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { productId, quantity, customerName, customerEmail, customerPhone } = validationResult.data

    // Fetch product from DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate total
    const total = product.price * quantity

    // Generate orderId
    const orderId = randomUUID()

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: session.user.id,
        items: {
          create: {
            productId,
            quantity,
            price: product.price,
          },
        },
        total,
        status: 'PENDING',
      },
    })

    // Call CinetPay payment
    const paymentResult = await createCinetPayPayment({
      amount: total,
      orderId,
      customerName,
      customerEmail,
    })

    if (!paymentResult.payment_url) {
      // Delete the order if payment creation failed
      await prisma.order.delete({ where: { id: orderId } })
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentUrl: paymentResult.payment_url,
      orderId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}