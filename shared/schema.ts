import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  amount: text("amount").notNull(), // using text to avoid precision issues for now, will parse as float in app
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  date: text("date").notNull(), // "ISO string" or simple string like "Today" (mock was "Today"). We should probably store actual Date and format it.
  month: text("month").notNull(),
  year: text("year").notNull(),
  notes: text("notes"),
});


export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: text("target_amount").notNull(),
  currentAmount: text("current_amount").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true,
  userId: true 
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
