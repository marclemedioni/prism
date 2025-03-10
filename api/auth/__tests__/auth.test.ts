import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { signup, login, auth } from "../auth";
import { db } from "../../db";

describe("Auth Service", () => {
  // Clean database before tests
  beforeAll(async () => {
    await db.exec`DELETE FROM users WHERE email = ${"test@example.com"}`;
  });

  // Clean after tests
  afterAll(async () => {
    await db.exec`DELETE FROM users WHERE email = ${"test@example.com"}`;
  });

  describe("signup", () => {
    it("should create a new user successfully", async () => {
      const response = await signup({
        email: "test@example.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe("test@example.com");
      expect(response.user.firstName).toBe("Test");
      expect(response.user.lastName).toBe("User");
      expect(response.user.role).toBe("user");
    });

    it("should not allow duplicate emails", async () => {
      await expect(
        signup({
          email: "test@example.com",
          password: "Password123!",
          firstName: "Test",
          lastName: "User",
        })
      ).rejects.toThrow("Un utilisateur avec cet email existe déjà");
    });

    // TODO: Add more validation tests (password strength, email format, etc.)
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await login({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe("test@example.com");
      expect(response.user.firstName).toBe("Test");
      expect(response.user.lastName).toBe("User");
      expect(response.user.role).toBe("user");
    });

    it("should fail with incorrect password", async () => {
      await expect(
        login({
          email: "test@example.com",
          password: "WrongPassword123!",
        })
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("should fail with non-existent email", async () => {
      await expect(
        login({
          email: "nonexistent@example.com",
          password: "Password123!",
        })
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });
  });

  describe("auth handler", () => {
    it("should authenticate with valid Basic auth header", async () => {
      const credentials = Buffer.from("test@example.com:Password123!").toString("base64");
      const authData = await auth({ authorization: `Basic ${credentials}` });

      expect(authData).toBeDefined();
      expect(authData?.userID).toBeDefined();
      expect(authData?.email).toBe("test@example.com");
      expect(authData?.role).toBe("user");
    });

    it("should fail with invalid Basic auth header", async () => {
      const credentials = Buffer.from("test@example.com:WrongPassword123!").toString("base64");
      await expect(auth({ authorization: `Basic ${credentials}` })).rejects.toThrow(
        "Email ou mot de passe incorrect"
      );
    });

    it("should fail with missing auth header", async () => {
      await expect(auth({ authorization: "" })).rejects.toThrow(
        "Token d'authentification manquant"
      );
    });

    it("should fail with invalid auth header format", async () => {
      await expect(auth({ authorization: "InvalidFormat" })).rejects.toThrow(
        "Identifiants invalides"
      );
    });
  });
});
