import { api, Gateway } from "encore.dev/api";
import { APIError, ErrCode } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { Header } from "encore.dev/api";
import { db } from "../db";
import bcrypt from "bcrypt";

// Types
interface SignupParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData {
  userID: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: {
    id: string; // UUID
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Auth handler for Encore.dev
export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const token = params.authorization;
  if (!token) {
    throw new APIError(ErrCode.Unauthenticated, "Token d'authentification manquant");
  }

  // Extract credentials from Basic auth
  const credentials = Buffer.from(token.replace("Basic ", ""), "base64").toString("utf-8");
  const [email, password] = credentials.split(":");

  if (!email || !password) {
    throw new APIError(ErrCode.Unauthenticated, "Identifiants invalides");
  }

  // Find user
  const user = await db.queryRow`
    SELECT id, email, password_hash, role
    FROM users
    WHERE email = ${email}
  `;

  if (!user) {
    throw new APIError(ErrCode.Unauthenticated, "Email ou mot de passe incorrect");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new APIError(ErrCode.Unauthenticated, "Email ou mot de passe incorrect");
  }

  return {
    userID: user.id,
    email: user.email,
    role: user.role,
  };
});

// Configure gateway with auth handler
export const gateway = new Gateway({
  authHandler: auth,
});

// Signup endpoint
export const signup = api<SignupParams, AuthResponse>(
  {
    method: "POST",
    path: "/auth/signup",
    expose: true,
  },
  async ({ email, password, firstName, lastName }) => {
    // Check if user already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      throw new APIError(ErrCode.AlreadyExists, "Un utilisateur avec cet email existe déjà");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.queryRow`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName})
      RETURNING id, email, first_name, last_name, role
    `;

    if (!user) {
      throw new APIError(ErrCode.Internal, "Erreur lors de la création de l'utilisateur");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  }
);

// Login endpoint
export const login = api<LoginParams, AuthResponse>(
  {
    method: "POST",
    path: "/auth/login",
    expose: true,
  },
  async ({ email, password }) => {
    // Find user
    const user = await db.queryRow`
      SELECT id, email, first_name, last_name, role
      FROM users
      WHERE email = ${email}
    `;

    if (!user) {
      throw new APIError(ErrCode.NotFound, "Email ou mot de passe incorrect");
    }

    // Verify password and get auth data using auth handler
    await auth({
      authorization: `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  }
);
