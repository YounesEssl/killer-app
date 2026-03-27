import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

// Need to re-import to pick up the mock
const { POST } = await import("@/app/api/kills/route");

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/kills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/kills", () => {
  beforeEach(() => {
    mockDb.clear();

    // Setup a 4-player game:
    // A -> B -> C -> D -> A (circular chain)
    mockDb.seed("games", "game-1", {
      name: "Test Game",
      join_code: "ABC123",
      admin_password: "pw",
      status: "active",
      winner_id: null,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
    });

    mockDb.seed("players", "player-a", {
      game_id: "game-1",
      account_id: "acc-a",
      name: "Alice",
      kill_code: "1111",
      target_id: "player-b",
      mission_id: 1,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    mockDb.seed("players", "player-b", {
      game_id: "game-1",
      account_id: "acc-b",
      name: "Bob",
      kill_code: "2222",
      target_id: "player-c",
      mission_id: 2,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    mockDb.seed("players", "player-c", {
      game_id: "game-1",
      account_id: "acc-c",
      name: "Charlie",
      kill_code: "3333",
      target_id: "player-d",
      mission_id: 3,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    mockDb.seed("players", "player-d", {
      game_id: "game-1",
      account_id: "acc-d",
      name: "Diana",
      kill_code: "4444",
      target_id: "player-a",
      mission_id: 4,
      is_alive: true,
      kill_count: 0,
      joined_at: new Date().toISOString(),
      died_at: null,
    });

    // Add accounts for new target photo lookup
    mockDb.seed("accounts", "acc-a", { username: "Alice", photo_url: "https://alice.jpg" });
    mockDb.seed("accounts", "acc-b", { username: "Bob", photo_url: "https://bob.jpg" });
    mockDb.seed("accounts", "acc-c", { username: "Charlie", photo_url: "https://charlie.jpg" });
    mockDb.seed("accounts", "acc-d", { username: "Diana", photo_url: "https://diana.jpg" });
  });

  it("processes a valid kill", async () => {
    // Alice kills Bob (Bob's code is 2222)
    const res = await POST(makeRequest({ playerId: "player-a", code: "2222" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.killCount).toBe(1);
    expect(data.isGameOver).toBe(false);
    expect(data.survivorsCount).toBe(3); // A, C, D survive
  });

  it("marks victim as dead", async () => {
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));

    const victimDoc = await mockDb.collection("players").doc("player-b").get();
    expect(victimDoc.data()!.is_alive).toBe(false);
    expect(victimDoc.data()!.died_at).toBeTruthy();
  });

  it("killer inherits victim's target and mission", async () => {
    // Alice kills Bob. Alice should now target Charlie (Bob's target) with mission 2 (Bob's mission)
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));

    const killerDoc = await mockDb.collection("players").doc("player-a").get();
    expect(killerDoc.data()!.target_id).toBe("player-c"); // Bob's target
    expect(killerDoc.data()!.mission_id).toBe(2); // Bob's mission
    expect(killerDoc.data()!.kill_count).toBe(1);
  });

  it("returns new target info after kill", async () => {
    const res = await POST(makeRequest({ playerId: "player-a", code: "2222" }));
    const data = await res.json();

    expect(data.newTarget).toBeTruthy();
    expect(data.newTarget.id).toBe("player-c");
    expect(data.newTarget.name).toBe("Charlie");
    expect(data.newTarget.photo_url).toBe("https://charlie.jpg");
  });

  it("creates a kill event", async () => {
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));

    const eventsSnap = await mockDb
      .collection("kill_events")
      .where("game_id", "==", "game-1")
      .get();
    expect(eventsSnap.docs).toHaveLength(1);

    const event = eventsSnap.docs[0].data()!;
    expect(event.killer_id).toBe("player-a");
    expect(event.victim_id).toBe("player-b");
    expect(event.survivors_count).toBe(3);
  });

  it("returns 400 for wrong code", async () => {
    const res = await POST(makeRequest({ playerId: "player-a", code: "9999" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Code incorrect");
  });

  it("returns 400 if playerId is missing", async () => {
    const res = await POST(makeRequest({ code: "2222" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if code is missing", async () => {
    const res = await POST(makeRequest({ playerId: "player-a" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for nonexistent player", async () => {
    const res = await POST(makeRequest({ playerId: "nonexistent", code: "2222" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 if player is dead", async () => {
    // Kill Bob first
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));

    // Bob tries to kill (he's dead)
    const res = await POST(makeRequest({ playerId: "player-b", code: "3333" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("mort");
  });

  it("chain works correctly after a kill", async () => {
    // Chain: A->B->C->D->A
    // A kills B: chain becomes A->C->D->A
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));

    // Now A targets C. A kills C
    const res = await POST(makeRequest({ playerId: "player-a", code: "3333" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.killCount).toBe(2);
    expect(data.survivorsCount).toBe(2); // A and D

    // A should now target D
    const killerDoc = await mockDb.collection("players").doc("player-a").get();
    expect(killerDoc.data()!.target_id).toBe("player-d");
  });

  it("detects game over when 1 survivor remains", async () => {
    // Kill B, C, D in sequence
    await POST(makeRequest({ playerId: "player-a", code: "2222" })); // A kills B
    await POST(makeRequest({ playerId: "player-a", code: "3333" })); // A kills C
    const res = await POST(makeRequest({ playerId: "player-a", code: "4444" })); // A kills D
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.isGameOver).toBe(true);
    expect(data.survivorsCount).toBeLessThanOrEqual(1);
  });

  it("sets game status to finished on game over", async () => {
    await POST(makeRequest({ playerId: "player-a", code: "2222" }));
    await POST(makeRequest({ playerId: "player-a", code: "3333" }));
    await POST(makeRequest({ playerId: "player-a", code: "4444" }));

    const gameDoc = await mockDb.collection("games").doc("game-1").get();
    expect(gameDoc.data()!.status).toBe("finished");
    expect(gameDoc.data()!.winner_id).toBeTruthy();
    expect(gameDoc.data()!.finished_at).toBeTruthy();
  });

  it("picks the player with most kills as winner", async () => {
    // Let D kill A first (1 kill for D)
    await POST(makeRequest({ playerId: "player-d", code: "1111" })); // D kills A

    // D now targets B. D kills B
    await POST(makeRequest({ playerId: "player-d", code: "2222" })); // D kills B

    // D now targets C. D kills C
    await POST(makeRequest({ playerId: "player-d", code: "3333" })); // D kills C

    const gameDoc = await mockDb.collection("games").doc("game-1").get();
    expect(gameDoc.data()!.status).toBe("finished");
    expect(gameDoc.data()!.winner_id).toBe("player-d"); // D has 3 kills
  });
});
