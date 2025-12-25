import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "member"] }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  // Social Links
  linkedinUrl: text("linkedin_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  xUrl: text("x_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  websiteUrl: text("website_url"),
  // Privacy
  privacyShowSocial: boolean("privacy_show_social").default(true).notNull(),
  privacyAllowContact: boolean("privacy_allow_contact").default(true).notNull(),
});

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull().unique(),
  createdByAdminId: integer("created_by_admin_id").references(() => users.id),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  fullName: text("full_name").notNull(),
  nickname: text("nickname"),
  maidenName: text("maiden_name"),
  gender: text("gender"),
  isLiving: boolean("is_living").default(true).notNull(),
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  birthPlace: text("birth_place"),
  currentCity: text("current_city"),
  biography: text("biography"),
  culturalNotes: text("cultural_notes"),
  tags: text("tags").array(), // e.g. ["Ijebu", "Lagos"]
  linkedUserId: integer("linked_user_id").references(() => users.id), // If this person is a registered user
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  fromPersonId: integer("from_person_id").notNull().references(() => people.id),
  toPersonId: integer("to_person_id").notNull().references(() => people.id),
  type: text("type", { enum: ["PARENT", "CHILD", "SPOUSE", "PARTNER", "SIBLING"] }).notNull(),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull().references(() => people.id),
  uploaderUserId: integer("uploader_user_id").references(() => users.id),
  type: text("type", { enum: ["PHOTO", "VIDEO"] }).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threadParticipants = pgTable("thread_participants", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => messageThreads.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => messageThreads.id),
  senderUserId: integer("sender_user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'person', 'relationship', etc.
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE'
  actorUserId: integer("actor_user_id").references(() => users.id),
  details: jsonb("details"), // Store changes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  invitesCreated: many(invites),
  peopleCreated: many(people),
  messagesSent: many(messages),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  media: many(media),
  relationshipsFrom: many(relationships, { relationName: "from" }),
  relationshipsTo: many(relationships, { relationName: "to" }),
  linkedUser: one(users, {
    fields: [people.linkedUserId],
    references: [users.id],
  }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  fromPerson: one(people, {
    fields: [relationships.fromPersonId],
    references: [people.id],
    relationName: "from",
  }),
  toPerson: one(people, {
    fields: [relationships.toPersonId],
    references: [people.id],
    relationName: "to",
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  person: one(people, {
    fields: [media.personId],
    references: [people.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [messages.threadId],
    references: [messageThreads.id],
  }),
  sender: one(users, {
    fields: [messages.senderUserId],
    references: [users.id],
  }),
}));

export const threadParticipantsRelations = relations(threadParticipants, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [threadParticipants.threadId],
    references: [messageThreads.id],
  }),
  user: one(users, {
    fields: [threadParticipants.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, userId: true });
export const insertInviteSchema = createInsertSchema(invites).omit({ id: true, usedAt: true, createdAt: true, createdByAdminId: true });
export const insertPersonSchema = createInsertSchema(people).omit({ id: true, createdByUserId: true, createdAt: true, updatedAt: true });
export const insertRelationshipSchema = createInsertSchema(relationships).omit({ id: true, createdByUserId: true, createdAt: true });
export const insertMediaSchema = createInsertSchema(media).omit({ id: true, uploaderUserId: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;

export type Person = typeof people.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
