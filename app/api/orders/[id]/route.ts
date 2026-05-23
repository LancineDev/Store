import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/order-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  const orders = getOrders()
  const order = orders.find(o => o.id === orderId)

  if (!order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ order })
}