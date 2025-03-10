import { api } from "encore.dev/api";
import { APIError, ErrCode } from "encore.dev/api";
import { db } from "../db";

// Interface représentant un utilisateur dans la base de données
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

// Interface publique d'un utilisateur
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Paramètres de mise à jour d'un utilisateur
export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
}

// Interface pour les paramètres d'ID
interface IdParam {
  id: string;
}

// Convertit un UserRow en User
function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Liste tous les utilisateurs
export const listUsers = api<void, { users: User[] }>(
  { method: "GET", path: "/users", auth: true },
  async () => {
    const rows = await db.query<UserRow>`
            SELECT * FROM users
            ORDER BY created_at DESC
        `;

    const users: User[] = [];
    for await (const row of rows) {
      users.push(toUser(row));
    }

    return { users };
  }
);

// Récupère un utilisateur par son ID
export const getUser = api<IdParam, { user: User }>(
  { method: "GET", path: "/users/:id", auth: true },
  async ({ id }) => {
    const row = await db.queryRow<UserRow>`
            SELECT * FROM users WHERE id = ${id}
        `;

    if (!row) {
      throw new APIError(ErrCode.NotFound, "Utilisateur non trouvé");
    }

    return { user: toUser(row) };
  }
);

// Met à jour un utilisateur
export const updateUser = api<IdParam & UpdateUserParams, { user: User }>(
  { method: "PATCH", path: "/users/:id", auth: true },
  async ({ id, firstName, lastName }) => {
    const row = await db.queryRow<UserRow>`
      UPDATE users 
      SET 
        first_name = COALESCE(${firstName || null}, first_name),
        last_name = COALESCE(${lastName || null}, last_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!row) {
      throw new APIError(ErrCode.NotFound, "Utilisateur non trouvé");
    }

    return { user: toUser(row) };
  }
);

// Supprime un utilisateur
export const deleteUser = api<IdParam, void>(
  { method: "DELETE", path: "/users/:id" },
  async ({ id }) => {
    const result = await db.queryRow<{ id: string }>`
            DELETE FROM users 
            WHERE id = ${id}
            RETURNING id
        `;

    if (!result) {
      throw new APIError(ErrCode.NotFound, "Utilisateur non trouvé");
    }
  }
);
