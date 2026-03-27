import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

import { GET as getPlayer } from "@/app/api/players/[id]/route";
import { GET as getGame } from "@/app/api/games/[id]/route";
import { GET as getFeed } from "@/app/api/games/[id]/feed/route";
import { GET as getLeaderboard } from "@/app/api/games/[id]/leaderboard/route";

function makeGetRequest(url: string): Request {
  return new Request(url, { method: "GET" });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/players/[id]", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("players", "player-1", {
      game_id: "game-1",
      account_id: "acc-1",
      name: "Alice",
      kill_code: "1234",
      target_id: "player-2",
      mission_id: 1,
      is_alive: true,
      kill_count: 2,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    mockDb.seed("players", "player-2", {
      game_id: "game-1",
      account_id: "acc-2",
      name: "Bob",
      kill_code: "5678",
      target_id: "player-1",
      mission_id: 3,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    mockDb.seed("accounts", "acc-2", {
      username: "Bob",
      photo_url: "https://bob.jpg",
    });

    mockDb.seed("players", "player-no-target", {
      game_id: "game-1",
      account_id: "acc-3",
      name: "Charlie",
      kill_code: "9012",
      target_id: null,
      mission_id: null,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });
  });

  it("returns player with target and mission", async () => {
    const res = await getPlayer(
      makeGetRequest("http://localhost/api/players/player-1"),
      makeParams("player-1")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.player.id).toBe("player-1");
    expect(data.player.name).toBe("Alice");
    expect(data.target).toBeTruthy();
    expect(data.target.id).toBe("player-2");
    expect(data.target.name).toBe("Bob");
    expect(data.target.photo_url).toBe("https://bob.jpg");
    expect(data.mission).toBeTruthy();
    expect(data.mission.id).toBe(1);
  });

  it("returns player without target", async () => {
    const res = await getPlayer(
      makeGetRequest("http://localhost/api/players/player-no-target"),
      makeParams("player-no-target")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.player.name).toBe("Charlie");
    expect(data.target).toBeNull();
    expect(data.mission).toBeNull();
  });

  it("returns 404 for nonexistent player", async () => {
    const res = await getPlayer(
      makeGetRequest("http://localhost/api/players/nonexistent"),
      makeParams("nonexistent")
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/games/[id]", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("games", "game-1", {
      name: "Test Game",
      join_code: "ABC123",
      admin_password: "pw",
      status: "lobby",
      winner_id: null,
      created_at: "2024-01-01T10:00:00Z",
      started_at: null,
      finished_at: null,
    });

    mockDb.seed("players", "p1", {
      game_id: "game-1",
      name: "Alice",
      kill_code: "1234",
      is_alive: true,
      kill_count: 0,
      joined_at: "2024-01-01T10:01:00Z",
    });

    mockDb.seed("players", "p2", {
      game_id: "game-1",
      name: "Bob",
      kill_code: "5678",
      is_alive: true,
      kill_count: 0,
      joined_at: "2024-01-01T10:02:00Z",
    });
  });

  it("returns game with players", async () => {
    const res = await getGame(
      makeGetRequest("http://localhost/api/games/game-1"),
      makeParams("game-1")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.name).toBe("Test Game");
    expect(data.players).toHaveLength(2);
  });

  it("returns 404 for nonexistent game", async () => {
    const res = await getGame(
      makeGetRequest("http://localhost/api/games/nonexistent"),
      makeParams("nonexistent")
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/games/[id]/feed", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("kill_events", "event-1", {
      game_id: "game-1",
      killer_id: "p1",
      victim_id: "p2",
      mission_description: "Mission test",
      survivors_count: 3,
      killed_at: "2024-01-01T11:00:00Z",
    });

    mockDb.seed("kill_events", "event-2", {
      game_id: "game-1",
      killer_id: "p3",
      victim_id: "p4",
      mission_description: "Another mission",
      survivors_count: 2,
      killed_at: "2024-01-01T12:00:00Z",
    });

    mockDb.seed("kill_events", "event-other", {
      game_id: "game-2",
      killer_id: "px",
      victim_id: "py",
      mission_description: "Other game",
      survivors_count: 5,
      killed_at: "2024-01-01T10:00:00Z",
    });
  });

  it("returns kill events for the game only", async () => {
    const res = await getFeed(
      makeGetRequest("http://localhost/api/games/game-1/feed"),
      makeParams("game-1")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.every((e: { game_id: string }) => e.game_id === "game-1")).toBe(true);
  });

  it("returns events ordered by killed_at desc", async () => {
    const res = await getFeed(
      makeGetRequest("http://localhost/api/games/game-1/feed"),
      makeParams("game-1")
    );
    const data = await res.json();

    expect(data[0].killed_at > data[1].killed_at).toBe(true);
  });

  it("returns empty array for game with no events", async () => {
    const res = await getFeed(
      makeGetRequest("http://localhost/api/games/no-game/feed"),
      makeParams("no-game")
    );
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

describe("GET /api/games/[id]/leaderboard", () => {
  beforeEach(() => {
    mockDb.clear();

    mockDb.seed("players", "p1", {
      game_id: "game-1",
      name: "Alice",
      kill_count: 5,
      is_alive: true,
      joined_at: "2024-01-01T10:00:00Z",
    });

    mockDb.seed("players", "p2", {
      game_id: "game-1",
      name: "Bob",
      kill_count: 3,
      is_alive: false,
      joined_at: "2024-01-01T10:01:00Z",
    });

    mockDb.seed("players", "p3", {
      game_id: "game-1",
      name: "Charlie",
      kill_count: 3,
      is_alive: true,
      joined_at: "2024-01-01T10:02:00Z",
    });
  });

  it("returns players sorted by kill_count desc", async () => {
    const res = await getLeaderboard(
      makeGetRequest("http://localhost/api/games/game-1/leaderboard"),
      makeParams("game-1")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(3);
    expect(data[0].name).toBe("Alice");
    expect(data[0].kill_count).toBe(5);
  });

  it("alive players rank higher than dead ones with same kills", async () => {
    const res = await getLeaderboard(
      makeGetRequest("http://localhost/api/games/game-1/leaderboard"),
      makeParams("game-1")
    );
    const data = await res.json();

    // Charlie (alive, 3 kills) should be before Bob (dead, 3 kills)
    const charlie = data.find((p: { name: string }) => p.name === "Charlie");
    const bob = data.find((p: { name: string }) => p.name === "Bob");
    const charlieIdx = data.indexOf(charlie);
    const bobIdx = data.indexOf(bob);
    expect(charlieIdx).toBeLessThan(bobIdx);
  });
});
