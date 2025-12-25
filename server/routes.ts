import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  const existingUsers = await storage.getUserByUsername("admin@falohun.com");
  if (!existingUsers) {
    const password = await hashPassword("admin123");
    const admin = await storage.createUser({ 
      username: "admin@falohun.com", 
      password, 
      role: "admin" 
    });
    console.log("Seeded admin user: admin@falohun.com");
    
    // Create initial invite
    const invite = await storage.createInvite("family@falohun.com", admin.id);
    console.log("Seeded invite code:", invite.code);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // Seed data
  seed().catch(console.error);

  // === PEOPLE ===
  app.get(api.people.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const filters = {
      search: req.query.search as string,
      tag: req.query.tag as string,
      living: req.query.living ? req.query.living === 'true' : undefined
    };
    const people = await storage.listPeople(filters);
    res.json(people);
  });

  app.post(api.people.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.people.create.input.parse(req.body);
      const person = await storage.createPerson({ ...input, createdByUserId: req.user.id });
      res.status(201).json(person);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      throw e;
    }
  });

  app.get(api.people.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    const person = await storage.getPerson(id);
    if (!person) return res.sendStatus(404);
    
    const media = await storage.getMediaForPerson(id);
    const { from, to } = await storage.getRelationshipsForPerson(id);
    
    res.json({ ...person, media, relationshipsFrom: from, relationshipsTo: to });
  });

  app.put(api.people.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    try {
      const input = api.people.update.input.parse(req.body);
      const updated = await storage.updatePerson(id, input);
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      res.sendStatus(404);
    }
  });

  app.delete(api.people.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Add admin check here ideally
    await storage.deletePerson(Number(req.params.id));
    res.sendStatus(204);
  });

  // === RELATIONSHIPS ===
  app.post(api.relationships.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.relationships.create.input.parse(req.body);
      const rel = await storage.createRelationship({ ...input, createdByUserId: req.user.id });
      res.status(201).json(rel);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      throw e;
    }
  });

  app.delete(api.relationships.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteRelationship(Number(req.params.id));
    res.sendStatus(204);
  });

  // === MEDIA ===
  app.post(api.media.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.media.create.input.parse(req.body);
      const item = await storage.createMedia({ ...input, uploaderUserId: req.user.id });
      res.status(201).json(item);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      throw e;
    }
  });

  app.delete(api.media.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteMedia(Number(req.params.id));
    res.sendStatus(204);
  });

  // === INVITES ===
  app.get(api.invites.list.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') return res.sendStatus(403);
    const list = await storage.listInvites();
    res.json(list);
  });

  app.post(api.invites.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') return res.sendStatus(403);
    const { email } = req.body;
    const invite = await storage.createInvite(email, req.user.id);
    res.status(201).json(invite);
  });

  // === MESSAGES ===
  app.get(api.messages.listThreads.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const threads = await storage.getThreadsForUser(req.user.id);
    res.json(threads);
  });

  app.post(api.messages.createThread.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { recipientUserId, body } = req.body;
    const thread = await storage.createThread([req.user.id, recipientUserId]);
    await storage.createMessage({ threadId: thread.id, senderUserId: req.user.id, body });
    res.status(201).json(thread);
  });

  app.post(api.messages.reply.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const threadId = Number(req.params.threadId);
    const { body } = req.body;
    const msg = await storage.createMessage({ threadId, senderUserId: req.user.id, body });
    res.status(201).json(msg);
  });

  app.get("/api/messages/thread/:threadId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const threadId = Number(req.params.threadId);
    const messages = await storage.getMessagesForThread(threadId);
    res.json(messages);
  });
  
  // === USER ===
  app.get(api.auth.me.path, async (req, res) => {
    if (req.isAuthenticated()) {
      const profile = await storage.getUserProfile(req.user.id);
      res.json({ ...req.user, profile });
    } else {
      res.sendStatus(401);
    }
  });

  app.put(api.auth.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.auth.updateProfile.input.parse(req.body);
      const profile = await storage.upsertUserProfile(req.user.id, input);
      res.json(profile);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      throw e;
    }
  });

  return httpServer;
}
