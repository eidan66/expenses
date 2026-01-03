import { type User, type InsertUser, type Transaction, type InsertTransaction, type Goal, type InsertGoal } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transactions
  createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  
  // Goals
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal>;
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, transactions, goals } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createTransaction(userId: string, insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({ ...insertTransaction, userId })
      .returning();
    return transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createGoal(userId: string, insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({ ...insertGoal, userId })
      .returning();
    return goal;
  }

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId));
  }

  async updateGoal(id: string, goalUpdate: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalUpdate)
      .where(eq(goals.id, id))
      .returning();
      
    if (!updatedGoal) {
        throw new Error("Goal not found");
    }
    return updatedGoal;
  }
}

export const storage = new DatabaseStorage();
