import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const companyTable = pgTable("company", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  jobs_url: text("jobs_url").notNull(),
});

export const companyRelations = relations(companyTable, ({ many }) => ({
  user_companies: many(user_companies),
  users: many(users),
}));

export type InsertCompany = typeof companyTable.$inferInsert;
export type SelectCompany = typeof companyTable.$inferSelect;

// export const popularityEnum = pgEnum('popularity', ['unknown', 'known', 'popular']);
export const batch_request_status_enum = pgEnum("status", [
  "validating",
  "failed",
  "in_progress",
  "finalizing",
  "completed",
  "expired",
  "cancelling",
  "cancelled",
]);

export const batchRequestTable = pgTable("batch_request", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  status: batch_request_status_enum("status").notNull(),
  file_id: text("file_id").notNull(),
});

export const jobTable = pgTable("job", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  found_at: timestamp("found_at").notNull(),
  company_id: integer("company_id").notNull(),
});

export const jobsRelations = relations(jobTable, ({ many }) => ({
  user_jobs: many(user_jobs),
}));

export const match_records = pgTable("match_records", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  user_companies: many(user_companies),
  companies: many(companyTable),
  user_keywords: many(user_keywords),
  keywords: many(keywords),
  user_jobs: many(user_jobs),
  jobs: many(jobTable),
}));

export const user_companies = pgTable("user_companies", {
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  company_id: integer("company_id")
    .notNull()
    .references(() => companyTable.id),
});

export const user_companies_relations = relations(
  user_companies,
  ({ one }) => ({
    user: one(users, {
      fields: [user_companies.user_id],
      references: [users.id],
    }),
    company: one(companyTable, {
      fields: [user_companies.company_id],
      references: [companyTable.id],
    }),
  })
);

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  phrase: text("phrase").notNull().unique(),
});

export const keywordsRelations = relations(keywords, ({ many }) => ({
  user_keywords: many(user_keywords),
  keywords: many(keywords),
  users: many(users),
}));

export const user_keywords = pgTable("user_keywords", {
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  keyword_id: integer("keyword_id")
    .notNull()
    .references(() => keywords.id),
});

export const user_keywords_relations = relations(user_keywords, ({ one }) => ({
  user: one(users, {
    fields: [user_keywords.user_id],
    references: [users.id],
  }),
  keywords: one(keywords, {
    fields: [user_keywords.keyword_id],
    references: [keywords.id],
  }),
}));

export const user_jobs = pgTable("user_jobs", {
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  job_id: integer("job_id")
    .notNull()
    .references(() => jobTable.id),
});

export const user_jobs_relations = relations(user_jobs, ({ one }) => ({
  user: one(users, {
    fields: [user_jobs.user_id],
    references: [users.id],
  }),
  job: one(jobTable, {
    fields: [user_jobs.job_id],
    references: [jobTable.id],
  }),
}));
