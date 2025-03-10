import { api } from "encore.dev/api";
import { APIError, ErrCode } from "encore.dev/api";
import { db } from "../db";
import { buildPartialUpdate } from "../utils/db";

// Interface représentant un projet dans la base de données
interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Interface publique d'un projet
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Paramètres de création d'un projet
export interface CreateProjectParams {
  name: string;
  description?: string;
  ownerId: string;
}

// Paramètres de mise à jour d'un projet
export interface UpdateProjectParams {
  name: string;
  description: string | null;
  status: string;
}

// Interface pour les paramètres d'ID
interface IdParam {
  id: string;
}

// Convertit un ProjectRow en Project
function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.owner_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Liste tous les projets
export const listProjects = api<void, { projects: Project[] }>(
  { method: "GET", path: "/projects", auth: true },
  async () => {
    const rows = await db.query<ProjectRow>`
      SELECT * FROM projects
      ORDER BY created_at DESC
    `;

    const projects: Project[] = [];
    for await (const row of rows) {
      projects.push(toProject(row));
    }

    return { projects };
  }
);

// Récupère un projet par son ID
export const getProject = api<IdParam, { project: Project }>(
  { method: "GET", path: "/projects/:id", auth: true },
  async ({ id }) => {
    const row = await db.queryRow<ProjectRow>`
      SELECT * FROM projects WHERE id = ${id}
    `;

    if (!row) {
      throw new APIError(ErrCode.NotFound, "Projet non trouvé");
    }

    return { project: toProject(row) };
  }
);

// Crée un nouveau projet
export const createProject = api<CreateProjectParams, { project: Project }>(
  { method: "POST", path: "/projects", auth: true },
  async ({ name, description, ownerId }) => {
    // Vérifie si l'utilisateur existe
    const userExists = await db.queryRow`
      SELECT id FROM users WHERE id = ${ownerId}
    `;

    if (!userExists) {
      throw new APIError(ErrCode.InvalidArgument, "Utilisateur non trouvé");
    }

    const row = await db.queryRow<ProjectRow>`
      INSERT INTO projects (name, description, owner_id, status)
      VALUES (${name}, ${description || null}, ${ownerId}, 'DRAFT')
      RETURNING *
    `;

    if (!row) {
      throw new APIError(ErrCode.Internal, "Erreur lors de la création du projet");
    }

    return { project: toProject(row) };
  }
);

// Met à jour un projet
export const updateProject = api<IdParam & UpdateProjectParams, { project: Project }>(
  { method: "PUT", path: "/projects/:id", auth: true },
  async ({ id, name, description, status }) => {
    const row = await db.queryRow<ProjectRow>`
      UPDATE projects 
      SET 
        name = ${name.trim()},
        description = ${description?.trim() || null},
        status = ${status.trim()},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!row) {
      throw new APIError(ErrCode.NotFound, "Projet non trouvé");
    }

    return { project: toProject(row) };
  }
);

// Supprime un projet
export const deleteProject = api<IdParam, void>(
  { method: "DELETE", path: "/projects/:id", auth: true },
  async ({ id }) => {
    const result = await db.queryRow<{ id: string }>`
      DELETE FROM projects 
      WHERE id = ${id}
      RETURNING id
    `;

    if (!result) {
      throw new APIError(ErrCode.NotFound, "Projet non trouvé");
    }
  }
);
