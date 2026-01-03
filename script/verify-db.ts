import "dotenv/config";
import { storage } from "../server/storage";

async function verify() {
  console.log("Starting DB Verification...");
  try {
    const testUserId = "verify-user-" + Date.now();
    
    // Create a transaction
    console.log("Creating test transaction...");
    const newTx = await storage.createTransaction(testUserId, {
      title: "Verification Test",
      amount: "100",
      category: "Test",
      subcategory: "DB Check",
      date: "Today",
      month: "Verification",
      notes: "This is a test transaction"
    });
    console.log("Transaction created:", newTx.id);

    // Read it back
    console.log("Reading transactions for user...");
    const transactions = await storage.getTransactionsByUserId(testUserId);
    
    if (transactions.length > 0 && transactions[0].id === newTx.id) {
      console.log("SUCCESS: Transaction persisted and retrieved!");
    } else {
      console.error("FAILURE: Transaction not found.");
    }
  } catch (error) {
    console.error("Verification failed with error:", error);
  }
  process.exit(0);
}

verify();
