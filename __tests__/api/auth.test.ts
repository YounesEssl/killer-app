import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, setupFirebaseMock } from "../helpers/firebase-mock";

setupFirebaseMock();

import { POST } from "@/app/api/auth/login/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockDb.clear();
    mockDb.seed("accounts", "acc-1", {
      username: "Younes",
      username_normalized: "younes",
      secret_code: "1234",
      photo_url: "https://photo.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await POST(makeRequest({ username: "Younes", code: "1234" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.account.username).toBe("Younes");
    expect(data.account.id).toBe("acc-1");
  });

  it("is case-insensitive for username", async () => {
    const res = await POST(makeRequest({ username: "YOUNES", code: "1234" }));
    expect(res.status).toBe(200);
  });

  it("normalizes accented usernames", async () => {
    mockDb.seed("accounts", "acc-2", {
      username: "Éloïse",
      username_normalized: "eloise",
      secret_code: "5678",
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const res = await POST(makeRequest({ username: "Eloise", code: "5678" }));
    expect(res.status).toBe(200);
  });

  it("returns 401 for wrong code", async () => {
    const res = await POST(makeRequest({ username: "Younes", code: "9999" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Code incorrect");
  });

  it("returns 401 for unknown username", async () => {
    const res = await POST(makeRequest({ username: "Unknown", code: "1234" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Compte introuvable");
  });

  it("returns 400 if username is missing", async () => {
    const res = await POST(makeRequest({ code: "1234" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if code is missing", async () => {
    const res = await POST(makeRequest({ username: "Younes" }));
    expect(res.status).toBe(400);
  });
});
