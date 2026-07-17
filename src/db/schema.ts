import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * JABATAN (posisi) — pohon hierarki organisasi (adjacency list).
 * parentId null = puncak (Direktur Utama).
 */
export const positions = pgTable("positions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  division: text("division").notNull(), // 'eksekutif' | 'operasional' | 'marketing_mutu'
  sort: integer("sort").notNull().default(0),
});

/** PENGGUNA — login pakai username + password (dibuat admin). */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  positionId: text("position_id")
    .notNull()
    .references(() => positions.id),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  isHidden: boolean("is_hidden").notNull().default(false),
  lastSeenChangelogAt: timestamp("last_seen_changelog_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Presence ? status online/idle terakhir yang dilaporkan tiap user. */
export const presence = pgTable("presence", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("online"),
});

/**
 * TUGAS.
 * status: belum | dikerjakan | menunggu_acc | selesai
 * origin: langsung | permintaan
 */
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  note: text("note"),
  giverId: text("giver_id")
    .notNull()
    .references(() => users.id),
  assigneeId: text("assignee_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("belum"),
  deadline: timestamp("deadline", { withTimezone: true }),
  origin: text("origin").notNull().default("langsung"),
  requestId: text("request_id"),
  returnNote: text("return_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/**
 * PERMINTAAN — muncul saat penugasan bukan ke bawahan (sejajar/atas/luar jalur).
 * status: menunggu | disetujui | ditolak | dibatalkan
 */
export const requests = pgTable("requests", {
  id: text("id").primaryKey(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => users.id),
  targetId: text("target_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  note: text("note"),
  deadline: timestamp("deadline", { withTimezone: true }),
  status: text("status").notNull().default("menunggu"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/**
 * Slot persetujuan untuk sebuah PERMINTAAN.
 * role 'diminta' -> userId spesifik (orang yang diminta).
 * role 'atasan'  -> positionId (siapa pun pemegang jabatan itu boleh meng-ACC).
 * decision: menunggu | setuju | tolak
 */
export const requestApprovals = pgTable("request_approvals", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .notNull()
    .references(() => requests.id),
  role: text("role").notNull(),
  positionId: text("position_id").references(() => positions.id),
  userId: text("user_id").references(() => users.id),
  decision: text("decision").notNull().default("menunggu"),
  decidedById: text("decided_by_id").references(() => users.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

/** NOTIFIKASI (lonceng dalam aplikasi). */
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** KOMENTAR — log keterangan bertumpuk pada sebuah tugas (pemberi & penerima tugas). */
export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** CHANGELOG — catatan pembaruan aplikasi, diterbitkan lewat panel developer. */
export const changelogs = pgTable("changelogs", {
  id: text("id").primaryKey(),
  version: text("version"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedById: text("published_by_id")
    .notNull()
    .references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

/** LAMPIRAN (opsional) pada tugas. */
export const attachments = pgTable("attachments", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Relations (untuk query API drizzle) ----

export const positionsRelations = relations(positions, ({ one, many }) => ({
  parent: one(positions, {
    fields: [positions.parentId],
    references: [positions.id],
    relationName: "parentChild",
  }),
  children: many(positions, { relationName: "parentChild" }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  position: one(positions, {
    fields: [users.positionId],
    references: [positions.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  giver: one(users, { fields: [tasks.giverId], references: [users.id], relationName: "giver" }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  request: one(requests, { fields: [tasks.requestId], references: [requests.id] }),
  attachments: many(attachments),
  comments: many(comments),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(users, {
    fields: [requests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  target: one(users, {
    fields: [requests.targetId],
    references: [users.id],
    relationName: "target",
  }),
  approvals: many(requestApprovals),
}));

export const requestApprovalsRelations = relations(requestApprovals, ({ one }) => ({
  request: one(requests, { fields: [requestApprovals.requestId], references: [requests.id] }),
  position: one(positions, {
    fields: [requestApprovals.positionId],
    references: [positions.id],
  }),
  user: one(users, { fields: [requestApprovals.userId], references: [users.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, { fields: [attachments.taskId], references: [tasks.id] }),
}));
export type Presence = typeof presence.$inferSelect;

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

// ---- Tipe turunan ----
export type Position = typeof positions.$inferSelect;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type RequestApproval = typeof requestApprovals.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Changelog = typeof changelogs.$inferSelect;
