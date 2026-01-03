const session = require('express-session');
const MongoStore = require('connect-mongo');

function buildStore() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('[session] MONGO_URI missing; using MemoryStore (dev only)');
    return undefined;
  }

  return MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 14, // 14 days
  });
}

module.exports = session({
  name: process.env.SESSION_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: buildStore(),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 24 * 14),
  },
});
