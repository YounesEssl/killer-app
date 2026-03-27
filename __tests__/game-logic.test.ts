import { describe, it, expect } from "vitest";
import { createKillChain, validateKillCode } from "@/lib/game-logic";
import type { Player } from "@/lib/firebase/types";

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    game_id: "game-1",
    account_id: `account-${i}`,
    name: `Player ${i}`,
    kill_code: `${1000 + i}`,
    target_id: null,
    mission_id: null,
    is_alive: true,
    kill_count: 0,
    joined_at: new Date().toISOString(),
    died_at: null,
  }));
}

describe("createKillChain", () => {
  it("returns one assignment per player", () => {
    const players = makePlayers(6);
    const chain = createKillChain(players);
    expect(chain).toHaveLength(6);
  });

  it("every player has a target", () => {
    const players = makePlayers(8);
    const chain = createKillChain(players);
    for (const assignment of chain) {
      expect(assignment.target_id).toBeTruthy();
    }
  });

  it("every player has a mission", () => {
    const players = makePlayers(8);
    const chain = createKillChain(players);
    for (const assignment of chain) {
      expect(typeof assignment.mission_id).toBe("number");
      expect(assignment.mission_id).toBeGreaterThan(0);
    }
  });

  it("no player targets themselves", () => {
    const players = makePlayers(10);
    for (let i = 0; i < 20; i++) {
      const chain = createKillChain(players);
      for (const assignment of chain) {
        expect(assignment.target_id).not.toBe(assignment.id);
      }
    }
  });

  it("forms a valid circular chain (each player is targeted exactly once)", () => {
    const players = makePlayers(10);
    const chain = createKillChain(players);

    const targetIds = chain.map((a) => a.target_id);
    const playerIds = chain.map((a) => a.id);

    // Each target_id should appear exactly once
    const targetSet = new Set(targetIds);
    expect(targetSet.size).toBe(players.length);

    // Each target should be a valid player
    for (const targetId of targetIds) {
      expect(playerIds).toContain(targetId);
    }
  });

  it("chain is fully connected (single cycle, not multiple loops)", () => {
    const players = makePlayers(8);
    const chain = createKillChain(players);

    // Build a map of id -> target_id
    const targetMap = new Map<string, string>();
    for (const assignment of chain) {
      targetMap.set(assignment.id, assignment.target_id);
    }

    // Walk the chain starting from the first player
    const startId = chain[0].id;
    let current = startId;
    const visited = new Set<string>();

    do {
      visited.add(current);
      current = targetMap.get(current)!;
    } while (current !== startId);

    // Should have visited all players in a single cycle
    expect(visited.size).toBe(players.length);
  });

  it("works with minimum players (4)", () => {
    const players = makePlayers(4);
    const chain = createKillChain(players);
    expect(chain).toHaveLength(4);

    // Verify circular chain
    const targetMap = new Map(chain.map((a) => [a.id, a.target_id]));
    let current = chain[0].id;
    const visited = new Set<string>();
    do {
      visited.add(current);
      current = targetMap.get(current)!;
    } while (current !== chain[0].id);
    expect(visited.size).toBe(4);
  });

  it("works with large number of players (60)", () => {
    const players = makePlayers(60);
    const chain = createKillChain(players);
    expect(chain).toHaveLength(60);

    // Verify no self-targeting
    for (const assignment of chain) {
      expect(assignment.target_id).not.toBe(assignment.id);
    }

    // Verify circular chain
    const targetMap = new Map(chain.map((a) => [a.id, a.target_id]));
    let current = chain[0].id;
    const visited = new Set<string>();
    do {
      visited.add(current);
      current = targetMap.get(current)!;
    } while (current !== chain[0].id);
    expect(visited.size).toBe(60);
  });

  it("shuffles order (chain is not in input order)", () => {
    const players = makePlayers(10);
    const results = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const chain = createKillChain(players);
      results.add(chain.map((a) => a.id).join(","));
    }

    // Should produce different orderings
    expect(results.size).toBeGreaterThan(1);
  });

  it("assigns different missions to different players (when possible)", () => {
    const players = makePlayers(10);
    const chain = createKillChain(players);
    const missions = chain.map((a) => a.mission_id);
    const uniqueMissions = new Set(missions);
    // With 65 available missions and 10 players, all should be unique
    expect(uniqueMissions.size).toBe(10);
  });
});

describe("validateKillCode", () => {
  it("returns true for matching codes", () => {
    expect(validateKillCode("1234", "1234")).toBe(true);
  });

  it("returns false for non-matching codes", () => {
    expect(validateKillCode("1234", "5678")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(validateKillCode("abcd", "ABCD")).toBe(false);
  });

  it("does not do loose comparison", () => {
    expect(validateKillCode("01234", "1234")).toBe(false);
  });
});
