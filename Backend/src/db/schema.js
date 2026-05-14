const { pgTable, serial, varchar, text, timestamp, boolean, integer } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  otp: varchar('otp', { length: 6 }),
  otpExpiry: timestamp('otp_expiry'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  complaintText: text('complaint_text').notNull(),
  aiQuestion: text('ai_question'),
  userAnswer: text('user_answer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

module.exports = {
  users,
  complaints,
};
