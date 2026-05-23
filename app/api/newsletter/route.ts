import { NextResponse } from 'next/server'

// In-memory storage for newsletter subscriptions (in production, use a database)
const subscribers: Array<{
  id: string
  email: string
  subscribedAt: string
  active: boolean
}> = []

export async function GET() {
  return NextResponse.json({ 
    subscribers: subscribers.filter(s => s.active),
    total: subscribers.filter(s => s.active).length 
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscriber = subscribers.find(s => s.email === email)
    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        existingSubscriber.active = true
        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
        })
      }
    }

    const subscriber = {
      id: `SUB${Date.now()}`,
      email,
      subscribedAt: new Date().toISOString(),
      active: true,
    }

    subscribers.push(subscriber)

    // In a real app, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Add to email marketing service

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    })
  } catch (error) {
    console.error('Newsletter subscription failed:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    const subscriber = subscribers.find(s => s.email === email)
    if (subscriber) {
      subscriber.active = false
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    })
  } catch (error) {
    console.error('Unsubscribe failed:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
