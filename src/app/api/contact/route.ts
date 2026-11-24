import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import ContactMessage from '@/models/ContactMessage';

export const dynamic = 'force-dynamic';

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  // Remove HTML tags and control characters, normalize whitespace
  return value
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const fullName = sanitizeText(body.fullName, 120);
    const email = sanitizeText(body.email, 200).toLowerCase();
    const subject = sanitizeText(body.subject, 200);
    const message = sanitizeText(body.message, 4000);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { error: 'Please enter a clear subject (at least 3 characters).' },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Please enter your message (at least 10 characters).' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Prevent rapid duplicate submission (same email + subject + message within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const duplicate = await ContactMessage.findOne({
      email,
      subject,
      message,
      createdAt: { $gte: twoMinutesAgo },
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        { error: 'You have already submitted this message. Our team will respond shortly.' },
        { status: 429 }
      );
    }

    const saved = await ContactMessage.create({
      fullName,
      email,
      subject,
      message,
      status: 'new',
    });

    return NextResponse.json(
      {
        success: true,
        id: saved._id.toString(),
        message: 'Thank you for contacting Aura Luxe Home. Your message has been received and our team will get back to you shortly.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact message submission error:', error);
    return NextResponse.json(
      {
        error: 'We could not deliver your message right now. Please try again shortly or email concierge@auraluxe.lk.',
      },
      { status: 503 }
    );
  }
}

