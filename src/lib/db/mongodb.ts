import mongoose from 'mongoose';
import dns from 'dns';

// Ensure IPv4 first and resilient DNS resolution for MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder?.('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const PRIMARY_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auraluxe';
const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/auraluxe';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isAtlas: boolean;
  activeUri: string;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isAtlas: false,
  activeUri: '',
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = (async () => {
      // 1. Try Primary URI (Atlas or configured URI)
      try {
        const m = await mongoose.connect(PRIMARY_URI, opts);
        cached.isAtlas = PRIMARY_URI.includes('mongodb+srv://') || PRIMARY_URI.includes('.mongodb.net');
        cached.activeUri = PRIMARY_URI;
        return m;
      } catch (primaryErr: any) {
        console.warn('Primary MongoDB connection attempt warning:', primaryErr.message);

        // If primary is Atlas and failed (e.g. unwhitelisted IP / SSL alert 80 / server selection timeout)
        const isAtlasUri = PRIMARY_URI.includes('mongodb+srv://') || PRIMARY_URI.includes('.mongodb.net');
        if (isAtlasUri && LOCAL_FALLBACK_URI !== PRIMARY_URI) {
          try {
            console.log('Connecting to local MongoDB fallback at:', LOCAL_FALLBACK_URI);
            const m = await mongoose.connect(LOCAL_FALLBACK_URI, {
              ...opts,
              serverSelectionTimeoutMS: 2000,
            });
            cached.isAtlas = false;
            cached.activeUri = LOCAL_FALLBACK_URI;
            console.log('Connected to local MongoDB instance.');
            return m;
          } catch (localErr: any) {
            console.warn('Local MongoDB fallback also unavailable:', localErr.message);
          }
        }

        // Re-throw the original primary error with helpful diagnosis
        throw primaryErr;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export function getDatabaseStatus() {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;
  return {
    readyState,
    isConnected,
    isAtlas: cached.isAtlas,
    host: mongoose.connection.host || '',
    name: mongoose.connection.name || '',
    activeUri: cached.activeUri ? cached.activeUri.replace(/:([^@]+)@/, ':****@') : '',
  };
}

export default connectToDatabase;
