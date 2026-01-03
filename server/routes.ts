import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // middleware to simulate auth for now
  const MOCK_USER_ID = "1";

  // Health check endpoint for Docker and monitoring
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getTransactionsByUserId(MOCK_USER_ID);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(MOCK_USER_ID, data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/goals", async (req, res) => {
    const goals = await storage.getGoalsByUserId(MOCK_USER_ID);
    res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(MOCK_USER_ID, data);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const data = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(id, data);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
        return;
      } 
      // Handle "Goal not found" or other errors
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
