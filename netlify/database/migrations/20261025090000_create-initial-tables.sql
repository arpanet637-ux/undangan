-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

-- App tables
CREATE TABLE IF NOT EXISTS weddings (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  admin_code TEXT NOT NULL UNIQUE,
  title TEXT,
  groom_name TEXT,
  bride_name TEXT,
  og_image TEXT,
  video_url TEXT,
  wedding_date DATE,
  is_active INTEGER DEFAULT 1,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS couple (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  photo_url TEXT,
  father_name TEXT,
  mother_name TEXT,
  address TEXT,
  child_order TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE,
  event_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  maps_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  invitation_code TEXT,
  total_invitation INTEGER DEFAULT 1,
  is_attended INTEGER DEFAULT 0,
  attended_total INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attendance TEXT DEFAULT 'hadir',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settings_wedding_id_idx ON settings (wedding_id);
CREATE INDEX IF NOT EXISTS couple_wedding_id_idx ON couple (wedding_id);
CREATE INDEX IF NOT EXISTS events_wedding_id_idx ON events (wedding_id);
CREATE INDEX IF NOT EXISTS gallery_wedding_id_idx ON gallery (wedding_id);
CREATE INDEX IF NOT EXISTS guests_wedding_id_idx ON guests (wedding_id);
CREATE INDEX IF NOT EXISTS wishes_wedding_id_idx ON wishes (wedding_id);
CREATE INDEX IF NOT EXISTS gifts_wedding_id_idx ON gifts (wedding_id);
