import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the main database
export const db = new SQLDatabase("prism", {
  migrations: "./migrations",
});
