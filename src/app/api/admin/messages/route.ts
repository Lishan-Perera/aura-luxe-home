import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import ContactMessage from '@/models/ContactMessage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = messages.filter((m) => m.status === 'new').length;

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Failed to load contact messages:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to load contact messages.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid message ID is required.' }, { status: 400 });
    }

    if (!['new', 'read', 'replied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Failed to update contact message:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to update message status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid message ID is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await ContactMessage.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contact message removed.' });
  } catch (error: any) {
    console.error('Failed to delete contact message:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to delete contact message.' },
      { status: 500 }
    );
  }
}

