import { SQLDatabase } from "encore.dev/storage/sqldb";

type Row = Record<string, any>;

/**
 * Convertit les champs à mettre à jour en un objet avec les noms de colonnes SQL
 * @param fields Objet contenant les champs à mettre à jour
 * @returns Objet avec les noms de colonnes SQL
 */
function convertToSQLFields(fields: Record<string, any>): Record<string, any> {
  const sqlFields: Record<string, any> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      // Convertit camelCase en snake_case pour la BD
      const sqlKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      sqlFields[sqlKey] = value;
    }
  }

  return sqlFields;
}

/**
 * Génère la partie SET d'une requête UPDATE pour une mise à jour partielle
 * @param fields Champs à mettre à jour
 * @returns Les champs à mettre à jour et leurs valeurs
 */
export function buildPartialUpdate(fields: Record<string, any>): {
  fields: Record<string, any>;
  hasUpdates: boolean;
} {
  const sqlFields = convertToSQLFields(fields);
  return {
    fields: sqlFields,
    hasUpdates: Object.keys(sqlFields).length > 0,
  };
}

/**
 * Exécute une mise à jour partielle sur une table
 * @param db Instance de la base de données
 * @param table Nom de la table
 * @param id ID de l'enregistrement à mettre à jour
 * @param fields Champs à mettre à jour
 * @returns La ligne mise à jour
 */
export async function executePartialUpdate<T extends Row>(
  db: SQLDatabase,
  table: string,
  id: string,
  fields: Record<string, any>
): Promise<T | null> {
  const sqlFields = convertToSQLFields(fields);

  if (Object.keys(sqlFields).length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  // Construit la requête de mise à jour
  const updates = Object.entries(sqlFields).map(([key, value]) => `${key} = ${value}`);

  return await db.queryRow<T>`
    UPDATE ${table}
    SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
}
