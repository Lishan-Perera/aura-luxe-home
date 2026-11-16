import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;
  let dbError = null;

  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      const conn = await connectToDatabase();
      const state = conn.connection.readyState;
      // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
      dbStatus = state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnected';
      dbLatencyMs = Date.now() - startTime;
    } else {
      dbStatus = 'demo_fallback_active';
    }
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err.message;
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    application: 'Aura Luxe Home Sri Lanka',
    database: {
      type: 'MongoDB Atlas',
      odm: 'Mongoose 8',
      status: dbStatus,
      latencyMs: dbLatencyMs,
      error: dbError,
    },
    mediaStorage: {
      provider: 'Cloudinary',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not_configured',
      configured: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        !process.env.CLOUDINARY_CLOUD_NAME.includes('demo')
      ),
    },
    uptimeSeconds: process.uptime(),
  });
}

