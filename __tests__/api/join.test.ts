import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

import { POST } from "@/app/api/games/join/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/games/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/games/join", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("accounts", "acc-1", {
      username: "Alice",
      username_normalized: "alice",
      secret_code: "1111",
      photo_url: "https://photo.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    mockDb.seed("accounts", "acc-no-photo", {
      username: "Bob",
      username_normalized: "bob",
      secret_code: "2222",
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    mockDb.seed("games", "game-1", {
      name: "Test Game",
      join_code: "ABC123",
      admin_password: "pw",
      status: "lobby",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: null,
      finished_at: null,
    });

    mockDb.seed("games", "game-active", {
      name: "Started Game",
      join_code: "XYZ789",
      admin_password: "pw",
      status: "active",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
    });
  });

  it("joins a game successfully", async () => {
    const res = await POST(makeRequest({ joinCode: "ABC123", accountId: "acc-1" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.player.name).toBe("Alice");
    expect(data.player.game_id).toBe("game-1");
    expect(data.player.is_alive).toBe(true);
    expect(data.player.kill_count).toBe(0);
    expect(data.player.kill_code).toMatch(/^\d{4}$/);
    expect(data.game.id).toBe("game-1");
  });

  it("join code is case-insensitive", async () => {
    const res = await POST(makeRequest({ joinCode: "abc123", accountId: "acc-1" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 if joinCode is missing", async () => {
    const res = await POST(makeRequest({ accountId: "acc-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 if accountId is missing", async () => {
    const res = await POST(makeRequest({ joinCode: "ABC123" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 if account doesn't exist", async () => {
    const res = await POST(makeRequest({ joinCode: "ABC123", accountId: "nonexistent" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if account has no photo", async () => {
    const res = await POST(makeRequest({ joinCode: "ABC123", accountId: "acc-no-photo" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("photo");
  });

  it("returns 404 for invalid join code", async () => {
    const res = await POST(makeRequest({ joinCode: "WRONG1", accountId: "acc-1" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 if game already started", async () => {
    const res = await POST(makeRequest({ joinCode: "XYZ789", accountId: "acc-1" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("deja commence");
  });

  it("returns 400 if player already in game", async () => {
    // First join
    await POST(makeRequest({ joinCode: "ABC123", accountId: "acc-1" }));
    // Second join attempt
    const res = await POST(makeRequest({ joinCode: "ABC123", accountId: "acc-1" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("deja dans cette partie");
  });

  it("generates unique kill codes per game", async () => {
    // Add multiple accounts
    for (let i = 2; i < 12; i++) {
      mockDb.seed("accounts", `acc-${i}`, {
        username: `Player${i}`,
        username_normalized: `player${i}`,
        secret_code: "0000",
        photo_url: "https://photo.jpg",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const killCodes = new Set<string>();
    // Join with acc-1 first
    const res0 = await POST(makeRequest({ joinCode: "ABC123", accountId: "acc-1" }));
    killCodes.add((await res0.json()).player.kill_code);

    for (let i = 2; i < 12; i++) {
      const res = await POST(makeRequest({ joinCode: "ABC123", accountId: `acc-${i}` }));
      const data = await res.json();
      killCodes.add(data.player.kill_code);
    }
    // All kill codes should be unique
    expect(killCodes.size).toBe(11);
  });
});
