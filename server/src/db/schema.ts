import { pgTable, uuid, text, varchar, timestamp, boolean, integer, jsonb, index, unique, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// USERS
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  secondName: varchar('second_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url').default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'),
  interests: jsonb('interests').$type<string[]>().default([]),
  region: varchar('region', { length: 100 }).default('Africa'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_google_id_idx').on(table.googleId),
]);

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(chatMessages),
  communityMembers: many(communityMembers),
  threadParticipants: many(threadParticipants),
  feedPosts: many(feedPosts),
  collabOffers: many(collabOffers),
  skillRequests: many(skillRequests),
  tasks: many(tasks),
}));

// ============================================================
// COMMUNITIES
// ============================================================
export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  avatar: text('avatar').notNull(),
  memberCount: integer('member_count').default(0),
  tags: jsonb('tags').$type<string[]>().default([]),
  // NaiLAND region this community belongs to (one of the seven regions)
  region: varchar('region', { length: 100 }).default(''),
  // Lifecycle: proposed → under_review → approved → active → inactive → archived
  status: varchar('status', { length: 30 }).default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('communities_name_idx').on(table.name),
  index('communities_region_idx').on(table.region),
]);

export const communitiesRelations = relations(communities, ({ many }) => ({
  members: many(communityMembers),
  feedPosts: many(feedPosts),
  chatThreads: many(chatThreads),
}));

// ============================================================
// COMMUNITY MEMBERS
// ============================================================
export const communityMembers = pgTable('community_members', {
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member'),
  rating: integer('rating').default(0),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.communityId, table.userId] }),
]);

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
}));

// ============================================================
// CHAT THREADS
// ============================================================
export const chatThreads = pgTable('chat_threads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  avatar: text('avatar').notNull(),
  category: varchar('category', { length: 20 }).default('chat'),
  isCommunity: boolean('is_community').default(false),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'set null' }),
  lastMessage: text('last_message').default(''),
  timeString: varchar('time_string', { length: 50 }).default('Just now'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('threads_community_idx').on(table.communityId),
]);

export const chatThreadsRelations = relations(chatThreads, ({ many, one }) => ({
  messages: many(chatMessages),
  participants: many(threadParticipants),
  tasks: many(tasks),
  community: one(communities, {
    fields: [chatThreads.communityId],
    references: [communities.id],
  }),
}));

// ============================================================
// THREAD PARTICIPANTS
// ============================================================
export const threadParticipants = pgTable('thread_participants', {
  threadId: uuid('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.threadId, table.userId] }),
]);

export const threadParticipantsRelations = relations(threadParticipants, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [threadParticipants.threadId],
    references: [chatThreads.id],
  }),
  user: one(users, {
    fields: [threadParticipants.userId],
    references: [users.id],
  }),
}));

// ============================================================
// CHAT MESSAGES
// ============================================================
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  threadId: uuid('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('messages_thread_idx').on(table.threadId),
  index('messages_sender_idx').on(table.senderId),
  index('messages_created_idx').on(table.createdAt),
]);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// ============================================================
// FEED POSTS
// ============================================================
export const feedPosts = pgTable('feed_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  images: jsonb('images').$type<string[]>().default([]),
  videoUrl: text('video_url'),
  attachmentTypes: jsonb('attachment_types').$type<string[]>().default([]),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('posts_community_idx').on(table.communityId),
  index('posts_author_idx').on(table.authorId),
  index('posts_created_idx').on(table.createdAt),
]);

export const feedPostsRelations = relations(feedPosts, ({ one, many }) => ({
  community: one(communities, {
    fields: [feedPosts.communityId],
    references: [communities.id],
  }),
  author: one(users, {
    fields: [feedPosts.authorId],
    references: [users.id],
  }),
  comments: many(feedComments),
  reposts: many(feedReposts),
  likes: many(feedLikes),
}));

// ============================================================
// FEED COMMENTS (real comments on feed posts)
// ============================================================
export const feedComments = pgTable('feed_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('feed_comments_post_idx').on(table.postId),
  index('feed_comments_author_idx').on(table.authorId),
]);

export const feedCommentsRelations = relations(feedComments, ({ one }) => ({
  post: one(feedPosts, {
    fields: [feedComments.postId],
    references: [feedPosts.id],
  }),
  author: one(users, {
    fields: [feedComments.authorId],
    references: [users.id],
  }),
}));

// ============================================================
// FEED REPOSTS (per-user repost tracking)
// ============================================================
export const feedReposts = pgTable('feed_reposts', {
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.postId, table.userId] }),
]);

export const feedRepostsRelations = relations(feedReposts, ({ one }) => ({
  post: one(feedPosts, {
    fields: [feedReposts.postId],
    references: [feedPosts.id],
  }),
  user: one(users, {
    fields: [feedReposts.userId],
    references: [users.id],
  }),
}));

// ============================================================
// FEED LIKES (per-user like tracking — prevents double-liking)
// ============================================================
export const feedLikes = pgTable('feed_likes', {
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.postId, table.userId] }),
]);

export const feedLikesRelations = relations(feedLikes, ({ one }) => ({
  post: one(feedPosts, {
    fields: [feedLikes.postId],
    references: [feedPosts.id],
  }),
  user: one(users, {
    fields: [feedLikes.userId],
    references: [users.id],
  }),
}));

// ============================================================
// COLLAB OFFERS
// ============================================================
export const collabOffers = pgTable('collab_offers', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description').notNull(),
  objectives: jsonb('objectives').$type<string[]>().default([]),
  roles: jsonb('roles').$type<string[]>().default([]),
  collaboratorsCount: integer('collaborators_count').default(1),
  projectLength: varchar('project_length', { length: 100 }).default(''),
  commitment: varchar('commitment', { length: 100 }).default(''),
  monetary: varchar('monetary', { length: 200 }).default(''),
  skillExchange: text('skill_exchange').default(''),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('offers_creator_idx').on(table.creatorId),
]);

export const collabOffersRelations = relations(collabOffers, ({ one }) => ({
  creator: one(users, {
    fields: [collabOffers.creatorId],
    references: [users.id],
  }),
}));

// ============================================================
// SKILL REQUESTS
// ============================================================
export const skillRequests = pgTable('skill_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description').notNull(),
  roles: jsonb('roles').$type<string[]>().default([]),
  projectLength: varchar('project_length', { length: 100 }).default(''),
  monetary: varchar('monetary', { length: 200 }).default(''),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const skillRequestsRelations = relations(skillRequests, ({ one }) => ({
  creator: one(users, {
    fields: [skillRequests.creatorId],
    references: [users.id],
  }),
}));

// ============================================================
// TASKS
// ============================================================
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  threadId: uuid('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  checked: boolean('checked').default(false),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('tasks_thread_idx').on(table.threadId),
]);

export const tasksRelations = relations(tasks, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [tasks.threadId],
    references: [chatThreads.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).default('info'),
  title: varchar('title', { length: 300 }).notNull(),
  body: text('body').default(''),
  link: varchar('link', { length: 500 }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('notifications_user_idx').on(table.userId),
  index('notifications_read_idx').on(table.isRead),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ============================================================
// MAP PINS
// ============================================================
export const mapPins = pgTable('map_pins', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').default(''),
  top: varchar('top', { length: 20 }).default('50%'),
  left: varchar('left', { length: 20 }).default('50%'),
  totalThreads: integer('total_threads').default(0),
  isLocked: boolean('is_locked').default(false),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('map_pins_community_idx').on(table.communityId),
]);

export const mapPinsRelations = relations(mapPins, ({ one }) => ({
  community: one(communities, {
    fields: [mapPins.communityId],
    references: [communities.id],
  }),
}));

// ============================================================
// VERIFICATION CODES (email verification + password reset)
// ============================================================
export const verificationCodes = pgTable('verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  type: varchar('type', { length: 30 }).notNull().default('verify_email'), // verify_email | reset_password
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('verification_codes_email_idx').on(table.email),
  index('verification_codes_expires_idx').on(table.expiresAt),
]);
