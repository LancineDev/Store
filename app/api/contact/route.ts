import { NextResponse } from 'next/server'

// In-memory storage for contact messages (in production, use a database)
const messages: Array<{
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}> = []

export async function GET() {
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    const contactMessage = {
      id: `MSG${Date.now()}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    }

    messages.push(contactMessage)

    // In a real app, you would:
    // 1. Save to database
    // 2. Send notification email to admin
    // 3. Send confirmation email to user

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Contact form submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
