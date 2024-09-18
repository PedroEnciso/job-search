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

export const match_records = pgTable("match_records", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
