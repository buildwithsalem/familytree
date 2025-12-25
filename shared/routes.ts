import { z } from 'zod';
import { 
  insertUserSchema, 
  insertUserProfileSchema,
  insertPersonSchema,
  insertRelationshipSchema,
  insertMediaSchema,
  insertInviteSchema,
  insertMessageSchema,
  users, userProfiles, people, relationships, media, invites, messages, messageThreads
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema.extend({ inviteCode: z.string() }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect & { profile: typeof userProfiles.$inferSelect }>(),
        401: errorSchemas.unauthorized,
      },
    },
    updateProfile: {
      method: 'PUT' as const,
      path: '/api/user/profile',
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
      },
    }
  },
  people: {
    list: {
      method: 'GET' as const,
      path: '/api/people',
      input: z.object({
        search: z.string().optional(),
        tag: z.string().optional(),
        living: z.enum(['true', 'false']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof people.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/people/:id',
      responses: {
        200: z.custom<typeof people.$inferSelect & { 
          media: typeof media.$inferSelect[];
          relationshipsFrom: typeof relationships.$inferSelect[];
          relationshipsTo: typeof relationships.$inferSelect[];
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/people',
      input: insertPersonSchema,
      responses: {
        201: z.custom<typeof people.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/people/:id',
      input: insertPersonSchema.partial(),
      responses: {
        200: z.custom<typeof people.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/people/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  relationships: {
    create: {
      method: 'POST' as const,
      path: '/api/relationships',
      input: insertRelationshipSchema,
      responses: {
        201: z.custom<typeof relationships.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/relationships/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  media: {
    create: {
      method: 'POST' as const,
      path: '/api/media',
      input: insertMediaSchema,
      responses: {
        201: z.custom<typeof media.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/media/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  invites: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/invites',
      responses: {
        200: z.array(z.custom<typeof invites.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/invites',
      input: z.object({ email: z.string().email() }),
      responses: {
        201: z.custom<typeof invites.$inferSelect>(),
      },
    },
  },
  messages: {
    listThreads: {
      method: 'GET' as const,
      path: '/api/messages/inbox',
      responses: {
        200: z.array(z.custom<typeof messageThreads.$inferSelect & { participants: number[] }>()),
      },
    },
    createThread: {
      method: 'POST' as const,
      path: '/api/messages/thread',
      input: z.object({ recipientUserId: z.number(), body: z.string() }),
      responses: {
        201: z.custom<typeof messageThreads.$inferSelect>(),
      },
    },
    reply: {
      method: 'POST' as const,
      path: '/api/messages/:threadId',
      input: z.object({ body: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
