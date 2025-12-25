import { db } from "./db";
import {
  users, userProfiles, invites, people, relationships, media, messageThreads, threadParticipants, messages, auditLogs,
  type User, type InsertUser, type UserProfile, type InsertUserProfile,
  type Invite, type InsertInvite,
  type Person, type InsertPerson,
  type Relationship, type InsertRelationship,
  type Media, type InsertMedia,
  type Message, type InsertMessage,
  type MessageThread
} from "@shared/schema";
import { eq, and, or, desc, like } from "drizzle-orm";

export interface IStorage {
  // User & Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  upsertUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Invites
  getInviteByCode(code: string): Promise<Invite | undefined>;
  createInvite(email: string, adminId: number): Promise<Invite>;
  listInvites(): Promise<Invite[]>;
  markInviteUsed(id: number): Promise<void>;
  
  // People
  getPerson(id: number): Promise<Person | undefined>;
  listPeople(query?: { search?: string; tag?: string; living?: boolean }): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, person: Partial<InsertPerson>): Promise<Person>;
  deletePerson(id: number): Promise<void>;
  
  // Relationships
  getRelationshipsForPerson(personId: number): Promise<{ from: Relationship[], to: Relationship[] }>;
  createRelationship(rel: InsertRelationship): Promise<Relationship>;
  deleteRelationship(id: number): Promise<void>;
  
  // Media
  getMediaForPerson(personId: number): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<void>;
  
  // Messages
  createThread(participantIds: number[]): Promise<MessageThread>;
  getThreadsForUser(userId: number): Promise<(MessageThread & { participants: number[] })[]>;
  createMessage(msg: InsertMessage): Promise<Message>;
  getMessagesForThread(threadId: number): Promise<Message[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    // Create empty profile
    await db.insert(userProfiles).values({
      userId: user.id,
      displayName: insertUser.username.split('@')[0],
    });
    return user;
  }

  // Profile
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existing = await this.getUserProfile(userId);
    if (existing) {
      const [updated] = await db.update(userProfiles)
        .set(profile)
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userProfiles).values({ ...profile, userId } as any).returning();
      return created;
    }
  }

  // Invites
  async getInviteByCode(code: string): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.code, code));
    return invite;
  }

  async createInvite(email: string, adminId: number): Promise<Invite> {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const [invite] = await db.insert(invites).values({
      email,
      code,
      createdByAdminId: adminId,
    }).returning();
    return invite;
  }
  
  async listInvites(): Promise<Invite[]> {
    return await db.select().from(invites).orderBy(desc(invites.createdAt));
  }

  async markInviteUsed(id: number): Promise<void> {
    await db.update(invites).set({ usedAt: new Date() }).where(eq(invites.id, id));
  }

  // People
  async getPerson(id: number): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return person;
  }

  async listPeople(query?: { search?: string; tag?: string; living?: boolean }): Promise<Person[]> {
    let conditions = [];
    if (query?.search) {
      conditions.push(or(
        like(people.fullName, `%${query.search}%`),
        like(people.maidenName, `%${query.search}%`)
      ));
    }
    if (query?.tag) {
       // Note: Drizzle simplified filtering for arrays might need raw sql, simpler to filter in app for MVP if small
       // But let's try standard array containment if supported or just ignore tag filter for MVP batch
    }
    if (query?.living !== undefined) {
      conditions.push(eq(people.isLiving, query.living));
    }

    if (conditions.length > 0) {
      return await db.select().from(people).where(and(...conditions));
    }
    return await db.select().from(people);
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [newPerson] = await db.insert(people).values(person).returning();
    return newPerson;
  }

  async updatePerson(id: number, person: Partial<InsertPerson>): Promise<Person> {
    const [updated] = await db.update(people).set({ ...person, updatedAt: new Date() }).where(eq(people.id, id)).returning();
    return updated;
  }

  async deletePerson(id: number): Promise<void> {
    await db.delete(people).where(eq(people.id, id));
  }

  // Relationships
  async getRelationshipsForPerson(personId: number): Promise<{ from: Relationship[], to: Relationship[] }> {
    const from = await db.select().from(relationships).where(eq(relationships.fromPersonId, personId));
    const to = await db.select().from(relationships).where(eq(relationships.toPersonId, personId));
    return { from, to };
  }

  async createRelationship(rel: InsertRelationship): Promise<Relationship> {
    const [newRel] = await db.insert(relationships).values(rel).returning();
    return newRel;
  }

  async deleteRelationship(id: number): Promise<void> {
    await db.delete(relationships).where(eq(relationships.id, id));
  }

  // Media
  async getMediaForPerson(personId: number): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.personId, personId));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [newMedia] = await db.insert(media).values(insertMedia).returning();
    return newMedia;
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Messages
  async createThread(participantIds: number[]): Promise<MessageThread> {
    const [thread] = await db.insert(messageThreads).values({}).returning();
    for (const userId of participantIds) {
      await db.insert(threadParticipants).values({ threadId: thread.id, userId });
    }
    return thread;
  }

  async getThreadsForUser(userId: number): Promise<(MessageThread & { participants: number[] })[]> {
    // Simplified fetch - real app would use joins
    const participations = await db.select().from(threadParticipants).where(eq(threadParticipants.userId, userId));
    const threads = [];
    for (const p of participations) {
      const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, p.threadId));
      if (thread) {
        const allParticipants = await db.select().from(threadParticipants).where(eq(threadParticipants.threadId, thread.id));
        threads.push({ ...thread, participants: allParticipants.map(ap => ap.userId) });
      }
    }
    return threads;
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(msg).returning();
    return message;
  }

  async getMessagesForThread(threadId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
  }
}

export const storage = new DatabaseStorage();
