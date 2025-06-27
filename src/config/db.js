import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

//creates SQL connection using DB URL
export const sql = neon(process.env.DATABASE_URL);
