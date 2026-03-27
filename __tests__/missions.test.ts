import { describe, it, expect } from "vitest";
import { MISSIONS, getMissionById } from "@/lib/missions";
import type { Mission } from "@/lib/missions";

describe("MISSIONS", () => {
  it("has at least 60 missions", () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(60);
  });

  it("all missions have unique IDs", () => {
    const ids = MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(MISSIONS.length);
  });

  it("all missions have sequential IDs starting from 1", () => {
    for (let i = 0; i < MISSIONS.length; i++) {
      expect(MISSIONS[i].id).toBe(i + 1);
    }
  });

  it("all missions have non-empty descriptions", () => {
    for (const mission of MISSIONS) {
      expect(mission.description.length).toBeGreaterThan(0);
    }
  });

  it("all missions have valid category", () => {
    const validCategories = ["conversation", "action", "social", "piège"];
    for (const mission of MISSIONS) {
      expect(validCategories).toContain(mission.category);
    }
  });

  it("all missions have valid difficulty", () => {
    const validDifficulties = ["easy", "medium", "hard"];
    for (const mission of MISSIONS) {
      expect(validDifficulties).toContain(mission.difficulty);
    }
  });

  it("has missions in all categories", () => {
    const categories = new Set(MISSIONS.map((m) => m.category));
    expect(categories).toContain("conversation");
    expect(categories).toContain("action");
    expect(categories).toContain("social");
    expect(categories).toContain("piège");
  });

  it("has missions in all difficulties", () => {
    const difficulties = new Set(MISSIONS.map((m) => m.difficulty));
    expect(difficulties).toContain("easy");
    expect(difficulties).toContain("medium");
    expect(difficulties).toContain("hard");
  });
});

describe("getMissionById", () => {
  it("returns the correct mission for a valid ID", () => {
    const mission = getMissionById(1);
    expect(mission).toBeDefined();
    expect(mission!.id).toBe(1);
    expect(mission!.description).toContain("pastèque");
  });

  it("returns undefined for an invalid ID", () => {
    expect(getMissionById(0)).toBeUndefined();
    expect(getMissionById(-1)).toBeUndefined();
    expect(getMissionById(999)).toBeUndefined();
  });

  it("returns the right mission for each valid ID", () => {
    for (const mission of MISSIONS) {
      const result = getMissionById(mission.id);
      expect(result).toBe(mission);
    }
  });
});
