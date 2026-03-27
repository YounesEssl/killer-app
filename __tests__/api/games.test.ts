import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

import { POST } from "@/app/api/games/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/games", () => {
  beforeEach(() => {
    mockDb.clear();
  });

  it("creates a game with valid input", async () => {
    const res = await POST(makeRequest({ name: "Ma partie", adminPassword: "secret123" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Ma partie");
    expect(data.admin_password).toBe("secret123");
    expect(data.status).toBe("lobby");
    expect(data.join_code).toHaveLength(6);
    expect(data.id).toBeTruthy();
    expect(data.winner_id).toBeNull();
    expect(data.started_at).toBeNull();
    expect(data.finished_at).toBeNull();
  });

  it("returns 400 if name is missing", async () => {
    const res = await POST(makeRequest({ adminPassword: "secret" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if adminPassword is missing", async () => {
    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if both are missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("generates unique join codes", async () => {
    const codes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const res = await POST(makeRequest({ name: `Game ${i}`, adminPassword: "pw" }));
      const data = await res.json();
      codes.add(data.join_code);
    }
    expect(codes.size).toBe(10);
  });
});
