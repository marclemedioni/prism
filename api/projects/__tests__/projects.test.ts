import { describe, it, expect, beforeEach } from "vitest";
import { createProject, getProject, listProjects, updateProject, deleteProject } from "../projects";
import { signup } from "../../auth/auth";
import { db } from "../../db";
import { APIError } from "encore.dev/api";

describe("Project Service", () => {
  let testUserId: string;

  // Create a test user and clean the database before each test
  beforeEach(async () => {
    await db.exec`DELETE FROM projects`;

    // Create a test user with a timestamp to avoid conflicts
    const timestamp = new Date().getTime();
    const { user } = await signup({
      email: `test-${timestamp}@example.com`,
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    testUserId = user.id;
  });

  describe("listProjects", () => {
    it("should return an empty array when no projects exist", async () => {
      const { projects } = await listProjects();
      expect(projects).toEqual([]);
    });

    it("should return all projects ordered by creation date", async () => {
      const project1 = await createProject({ name: "Project 1", ownerId: testUserId });
      const project2 = await createProject({ name: "Project 2", ownerId: testUserId });

      const { projects } = await listProjects();
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe(project2.project.id); // Most recent first
      expect(projects[1].id).toBe(project1.project.id);
    });
  });

  describe("getProject", () => {
    it("should return a project by id", async () => {
      const { project: created } = await createProject({
        name: "Test Project",
        description: "Description",
        ownerId: testUserId,
      });

      const { project } = await getProject({ id: created.id });
      expect(project).toEqual(created);
    });

    it("should throw NotFound for non-existent project", async () => {
      await expect(getProject({ id: testUserId })).rejects.toThrow("Projet non trouvé");
    });
  });

  describe("createProject", () => {
    it("should create a project with all fields", async () => {
      const { project } = await createProject({
        name: "New Project",
        description: "Project Description",
        ownerId: testUserId,
      });

      expect(project).toMatchObject({
        name: "New Project",
        description: "Project Description",
        ownerId: testUserId,
        status: "DRAFT",
      });
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it("should create a project without description", async () => {
      const { project } = await createProject({
        name: "New Project",
        ownerId: testUserId,
      });

      expect(project.description).toBeNull();
    });

    it("should throw error for non-existent owner", async () => {
      await expect(
        createProject({
          name: "New Project",
          ownerId: "00000000-0000-0000-0000-000000000000",
        })
      ).rejects.toThrow("Utilisateur non trouvé");
    });
  });

  describe("updateProject", () => {
    it("should update all project fields", async () => {
      const { project: created } = await createProject({
        name: "Original Name",
        description: "Original Description",
        ownerId: testUserId,
      });

      const { project: updated } = await updateProject({
        id: created.id,
        name: "Updated Name",
        description: "Updated Description",
        status: "IN_PROGRESS",
      });

      expect(updated).toMatchObject({
        id: created.id,
        name: "Updated Name",
        description: "Updated Description",
        status: "IN_PROGRESS",
        ownerId: testUserId,
      });
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it("should update project with null description", async () => {
      const { project: created } = await createProject({
        name: "Original Name",
        description: "Original Description",
        ownerId: testUserId,
      });

      const { project: updated } = await updateProject({
        id: created.id,
        name: "Updated Name",
        description: null,
        status: "IN_PROGRESS",
      });

      expect(updated.description).toBeNull();
    });

    it("should throw NotFound for non-existent project", async () => {
      await expect(
        updateProject({
          id: "00000000-0000-0000-0000-000000000000",
          name: "New Name",
          description: "New Description",
          status: "IN_PROGRESS",
        })
      ).rejects.toThrow("Projet non trouvé");
    });

    it("should trim whitespace from string fields", async () => {
      const { project: created } = await createProject({
        name: "Original Name",
        ownerId: testUserId,
      });

      const { project: updated } = await updateProject({
        id: created.id,
        name: "  Updated Name  ",
        description: "  Updated Description  ",
        status: "  IN_PROGRESS  ",
      });

      expect(updated).toMatchObject({
        name: "Updated Name",
        description: "Updated Description",
        status: "IN_PROGRESS",
      });
    });
  });

  describe("deleteProject", () => {
    it("should delete an existing project", async () => {
      const { project } = await createProject({
        name: "To Delete",
        ownerId: testUserId,
      });

      await deleteProject({ id: project.id });
      await expect(getProject({ id: project.id })).rejects.toThrow("Projet non trouvé");
    });

    it("should throw NotFound for non-existent project", async () => {
      await expect(deleteProject({ id: "00000000-0000-0000-0000-000000000000" })).rejects.toThrow(
        "Projet non trouvé"
      );
    });
  });
});
