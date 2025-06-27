import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).send({ msg: "All fields are required" });
    }
    const transaction =
      await sql`INSERT INTO transaction(user_id,title,category,amount) VALUES (${user_id},${title},${category},${amount}) RETURNING *`;
    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error in creating transaction", error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transaction =
      await sql`SELECT * FROM transaction WHERE user_id=${userId} ORDER BY created_at DESC`;
    console.log(transaction);
    res.status(200).json(transaction);
  } catch (error) {
    console.log("Error in loading the transaction", error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result =
      await sql`DELETE FROM transaction WHERE id=${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ msg: "Transaction not found" });
    }
    res.status(200).json({ msg: " Transaction deleted Successfully" });
  } catch (error) {
    console.log("Error in loading the transaction", error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult =
      await sql`SELECT COALESCE(SUM(amount),0) as balance FROM transaction WHERE user_id=${userId}`;
    const expensesResult =
      await sql`SELECT COALESCE(SUM(amount),0) as expenses FROM transaction WHERE user_id=${userId} AND amount<0`;
    const incomeResult =
      await sql`SELECT COALESCE(SUM(amount),0) as income FROM transaction WHERE user_id=${userId} AND amount>0`;
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    console.log("Error in getting the Summary", error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

export default router;
