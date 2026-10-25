import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  date,
} from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// App tables
export const weddings = pgTable('weddings', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  adminCode: text('admin_code').notNull().unique(),
  title: text('title'),
  groomName: text('groom_name'),
  brideName: text('bride_name'),
  ogImage: text('og_image'),
  videoUrl: text('video_url'),
  weddingDate: date('wedding_date'),
  isActive: integer('is_active').default(1),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  settingKey: text('setting_key').notNull(),
  settingValue: text('setting_value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const couple = pgTable('couple', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  role: text('role').notNull(),
  fullName: text('full_name').notNull(),
  nickname: text('nickname'),
  photoUrl: text('photo_url'),
  fatherName: text('father_name'),
  motherName: text('mother_name'),
  address: text('address'),
  childOrder: text('child_order'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  eventName: text('event_name').notNull(),
  eventDate: date('event_date'),
  eventTime: text('event_time'),
  venueName: text('venue_name'),
  venueAddress: text('venue_address'),
  mapsUrl: text('maps_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  photoUrl: text('photo_url').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  invitationCode: text('invitation_code'),
  totalInvitation: integer('total_invitation').default(1),
  isAttended: integer('is_attended').default(0),
  attendedTotal: integer('attended_total').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const wishes = pgTable('wishes', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  guestName: text('guest_name').notNull(),
  message: text('message').notNull(),
  attendance: text('attendance').default('hadir'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').notNull(),
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
