import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { listUsers, getUser, updateUser, deleteUser } from "../users";
import { signup } from "../../auth/auth";

describe("User Service", () => {
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    // Créer un utilisateur de test
    testUserEmail = `test-${Date.now()}@example.com`;
    const response = await signup({
      email: testUserEmail,
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    testUserId = response.user.id;
  });

  afterAll(async () => {
    // Nettoyer l'utilisateur de test
    try {
      await deleteUser({ id: testUserId });
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
    }
  });

  test("listUsers should return list of users", async () => {
    const response = await listUsers();
    expect(response.users).toBeDefined();
    expect(response.users.length).toBeGreaterThan(0);

    const testUser = response.users.find((u) => u.id === testUserId);
    expect(testUser).toBeDefined();
    expect(testUser?.email).toBe(testUserEmail);
    expect(testUser?.firstName).toBe("Test");
    expect(testUser?.lastName).toBe("User");
  });

  test("getUser should return user by ID", async () => {
    const response = await getUser({ id: testUserId });
    expect(response.user).toBeDefined();
    expect(response.user.id).toBe(testUserId);
    expect(response.user.email).toBe(testUserEmail);
    expect(response.user.firstName).toBe("Test");
    expect(response.user.lastName).toBe("User");
  });

  test("getUser should throw NotFound for non-existent ID", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    await expect(getUser({ id: nonExistentId })).rejects.toThrow("Utilisateur non trouvé");
  });

  test("updateUser should update user name", async () => {
    const response = await updateUser({
      id: testUserId,
      firstName: "Updated",
      lastName: "Name",
    });

    expect(response.user).toBeDefined();
    expect(response.user.id).toBe(testUserId);
    expect(response.user.email).toBe(testUserEmail); // L'email ne doit pas changer
    expect(response.user.firstName).toBe("Updated");
    expect(response.user.lastName).toBe("Name");
  });

  test("updateUser should allow partial updates", async () => {
    // Mise à jour du prénom uniquement
    const firstNameUpdate = await updateUser({
      id: testUserId,
      firstName: "NewFirst",
    });
    expect(firstNameUpdate.user.firstName).toBe("NewFirst");
    expect(firstNameUpdate.user.lastName).toBe("Name"); // Garde l'ancienne valeur

    // Mise à jour du nom uniquement
    const lastNameUpdate = await updateUser({
      id: testUserId,
      lastName: "NewLast",
    });
    expect(lastNameUpdate.user.firstName).toBe("NewFirst"); // Garde l'ancienne valeur
    expect(lastNameUpdate.user.lastName).toBe("NewLast");
  });

  test("updateUser should throw NotFound for non-existent ID", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    await expect(
      updateUser({
        id: nonExistentId,
        firstName: "Test",
      })
    ).rejects.toThrow("Utilisateur non trouvé");
  });

  test("deleteUser should delete user", async () => {
    // Créer un nouvel utilisateur pour le test de suppression
    const newUser = await signup({
      email: `delete-test-${Date.now()}@example.com`,
      password: "password123",
      firstName: "Delete",
      lastName: "Test",
    });

    // Supprimer l'utilisateur
    await deleteUser({ id: newUser.user.id });

    // Vérifier que l'utilisateur n'existe plus
    await expect(getUser({ id: newUser.user.id })).rejects.toThrow("Utilisateur non trouvé");
  });

  test("deleteUser should throw NotFound for non-existent ID", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    await expect(deleteUser({ id: nonExistentId })).rejects.toThrow("Utilisateur non trouvé");
  });
});
