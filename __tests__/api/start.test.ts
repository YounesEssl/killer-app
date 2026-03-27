import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

import { POST } from "@/app/api/games/[id]/start/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/games/game-1/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/games/[id]/start", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("games", "game-1", {
      name: "Test Game",
      join_code: "ABC123",
      admin_password: "secret",
      status: "lobby",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: null,
      finished_at: null,
    });

    // Add 5 players
    for (let i = 0; i < 5; i++) {
      mockDb.seed("players", `player-${i}`, {
        game_id: "game-1",
        account_id: `acc-${i}`,
        name: `Player ${i}`,
        kill_code: `${1000 + i}`,
        target_id: null,
        mission_id: null,
        is_alive: true,
        kill_count: 0,
        joined_at: new Date().toISOString(),
        died_at: null,
      });
    }
  });

  it("starts a game with correct password and enough players", async () => {
    const res = await POST(
      makeRequest({ adminPassword: "secret" }),
      makeParams("game-1")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("updates game status to active after start", async () => {
    await POST(makeRequest({ adminPassword: "secret" }), makeParams("game-1"));

    // Verify game status was updated
    const gameDoc = await mockDb.collection("games").doc("game-1").get();
    const game = gameDoc.data()!;
    expect(game.status).toBe("active");
    expect(game.started_at).toBeTruthy();
  });

  it("assigns targets and missions to all players", async () => {
    await POST(makeRequest({ adminPassword: "secret" }), makeParams("game-1"));

    // Verify each player has a target and mission
    for (let i = 0; i < 5; i++) {
      const doc = await mockDb.collection("players").doc(`player-${i}`).get();
      const player = doc.data()!;
      expect(player.target_id).toBeTruthy();
      expect(player.mission_id).toBeTruthy();
      // No self-targeting
      expect(player.target_id).not.toBe(`player-${i}`);
    }
  });

  it("creates a valid circular kill chain", async () => {
    await POST(makeRequest({ adminPassword: "secret" }), makeParams("game-1"));

    // Build the chain and verify it's circular
    const targetMap = new Map<string, string>();
    for (let i = 0; i < 5; i++) {
      const doc = await mockDb.collection("players").doc(`player-${i}`).get();
      targetMap.set(`player-${i}`, doc.data()!.target_id as string);
    }

    // Walk the chain
    let current = "player-0";
    const visited = new Set<string>();
    do {
      visited.add(current);
      current = targetMap.get(current)!;
    } while (current !== "player-0" && !visited.has(current));

    expect(current).toBe("player-0"); // Should loop back
    expect(visited.size).toBe(5); // All players visited
  });

  it("returns 404 for nonexistent game", async () => {
    const res = await POST(
      makeRequest({ adminPassword: "secret" }),
      makeParams("nonexistent")
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 for wrong admin password", async () => {
    const res = await POST(
      makeRequest({ adminPassword: "wrong" }),
      makeParams("game-1")
    );
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error).toContain("Mot de passe admin incorrect");
  });

  it("returns 400 if game is not in lobby", async () => {
    mockDb.seed("games", "game-active", {
      name: "Active Game",
      join_code: "XYZ",
      admin_password: "secret",
      status: "active",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
    });

    const res = await POST(
      makeRequest({ adminPassword: "secret" }),
      makeParams("game-active")
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 if fewer than 4 players", async () => {
    mockDb.clear();
    mockDb.seed("games", "game-small", {
      name: "Small Game",
      join_code: "SMC",
      admin_password: "secret",
      status: "lobby",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: null,
      finished_at: null,
    });
    for (let i = 0; i < 3; i++) {
      mockDb.seed("players", `p-${i}`, {
        game_id: "game-small",
        name: `P${i}`,
        kill_code: `${1000 + i}`,
        target_id: null,
        mission_id: null,
        is_alive: true,
        kill_count: 0,
        joined_at: new Date().toISOString(),
        died_at: null,
      });
    }

    const res = await POST(
      makeRequest({ adminPassword: "secret" }),
      makeParams("game-small")
    );
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("4 joueurs");
  });
});
