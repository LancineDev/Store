import { NextResponse } from 'next/server'
import { getOrders, addOrder, type Order } from '@/lib/order-store'

export async function GET() {
  return NextResponse.json({ orders: getOrders() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { items, total, shipping, customer } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order: no items provided' },
        { status: 400 }
      )
    }

    if (!customer || !customer.email) {
      return NextResponse.json(
        { error: 'Invalid order: customer information required' },
        { status: 400 }
      )
    }

    const order: Order = {
      id: `SPZ${Date.now().toString().slice(-8)}`,
      items,
      total,
      shipping,
      customer,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    addOrder(order)

    // In a real app, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Process payment
    // 4. Update inventory

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
      },
    })
  } catch (error) {
    console.error('Order creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
