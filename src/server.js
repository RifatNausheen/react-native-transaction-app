import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionRoute from "./routes/transactionRoute.js";
import cors from "cors";
import job from "./config/cron.js";
const app = express();

app.use(cors());
app.use(ratelimiter);
app.use(express.json());
app.use("/api/transactions", transactionRoute);

dotenv.config();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === "production") job.start();

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transaction(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )`;
    //for decimal(10,2) it stores 8digits number before decimal and 2 after
    console.log("DataBase initialized Successfully");
  } catch (error) {
    console.log("Error in initializing database", error);
    process.exit(1);
  }
}
initDB().then(() => {
  app.listen(5001, () => {
    console.log(`Port running on PORT: ${PORT}`);
  });
});
