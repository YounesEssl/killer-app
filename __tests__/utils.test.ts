import { describe, it, expect } from "vitest";
import {
  generateJoinCode,
  generateKillCode,
  shuffleArray,
  formatRelativeTime,
  formatDuration,
  cn,
  normalizeUsername,
  generateSecretCode,
} from "@/lib/utils";

describe("generateJoinCode", () => {
  it("returns a 6-character string", () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(6);
  });

  it("only contains allowed characters (no ambiguous 0/O/1/I)", () => {
    const allowed = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < 100; i++) {
      const code = generateJoinCode();
      for (const char of code) {
        expect(allowed).toContain(char);
      }
    }
  });

  it("generates different codes (not deterministic)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateJoinCode());
    }
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("generateKillCode", () => {
  it("returns a 4-digit string", () => {
    const code = generateKillCode([]);
    expect(code).toMatch(/^\d{4}$/);
  });

  it("returns a number between 1000 and 9999", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateKillCode([]);
      const num = parseInt(code);
      expect(num).toBeGreaterThanOrEqual(1000);
      expect(num).toBeLessThanOrEqual(9999);
    }
  });

  it("avoids existing codes", () => {
    const existing = ["1234", "5678", "9012"];
    for (let i = 0; i < 100; i++) {
      const code = generateKillCode(existing);
      expect(existing).not.toContain(code);
    }
  });

  it("works with a large list of existing codes", () => {
    const existing = Array.from({ length: 100 }, (_, i) =>
      (1000 + i).toString()
    );
    const code = generateKillCode(existing);
    expect(code).toMatch(/^\d{4}$/);
    expect(existing).not.toContain(code);
  });
});

describe("generateSecretCode", () => {
  it("returns a 4-digit string", () => {
    const code = generateSecretCode();
    expect(code).toMatch(/^\d{4}$/);
  });

  it("returns a number between 1000 and 9999", () => {
    for (let i = 0; i < 50; i++) {
      const num = parseInt(generateSecretCode());
      expect(num).toBeGreaterThanOrEqual(1000);
      expect(num).toBeLessThanOrEqual(9999);
    }
  });
});

describe("shuffleArray", () => {
  it("returns an array of the same length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(5);
  });

  it("contains all original elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });

  it("returns empty array for empty input", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("returns single-element array unchanged", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("actually shuffles (not always the same order)", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(JSON.stringify(shuffleArray(arr)));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("formatRelativeTime", () => {
  it("returns 'à l'instant' for very recent times", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("à l'instant");
  });

  it("returns seconds for times < 60s ago", () => {
    const date = new Date(Date.now() - 30000);
    expect(formatRelativeTime(date)).toBe("il y a 30s");
  });

  it("returns minutes for times < 60min ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("il y a 5 min");
  });

  it("returns hours for times < 24h ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("il y a 3h");
  });

  it("returns days for times > 24h ago", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("il y a 2j");
  });

  it("accepts string dates", () => {
    const result = formatRelativeTime(new Date(Date.now() - 45000).toISOString());
    expect(result).toBe("il y a 45s");
  });
});

describe("formatDuration", () => {
  it("returns minutes for short durations", () => {
    const start = new Date("2024-01-01T10:00:00Z");
    const end = new Date("2024-01-01T10:30:00Z");
    expect(formatDuration(start, end)).toBe("30 min");
  });

  it("returns hours and minutes for longer durations", () => {
    const start = new Date("2024-01-01T10:00:00Z");
    const end = new Date("2024-01-01T12:15:00Z");
    expect(formatDuration(start, end)).toBe("2h15");
  });

  it("pads minutes with leading zero", () => {
    const start = new Date("2024-01-01T10:00:00Z");
    const end = new Date("2024-01-01T11:05:00Z");
    expect(formatDuration(start, end)).toBe("1h05");
  });

  it("returns 0 min for same time", () => {
    const t = new Date("2024-01-01T10:00:00Z");
    expect(formatDuration(t, t)).toBe("0 min");
  });

  it("accepts string dates", () => {
    expect(formatDuration("2024-01-01T10:00:00Z", "2024-01-01T10:45:00Z")).toBe(
      "45 min"
    );
  });
});

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });
});

describe("normalizeUsername", () => {
  it("lowercases the string", () => {
    expect(normalizeUsername("HELLO")).toBe("hello");
  });

  it("trims whitespace", () => {
    expect(normalizeUsername("  hello  ")).toBe("hello");
  });

  it("removes accents", () => {
    expect(normalizeUsername("Éloïse")).toBe("eloise");
    expect(normalizeUsername("François")).toBe("francois");
    expect(normalizeUsername("Café")).toBe("cafe");
  });

  it("handles combined transformations", () => {
    expect(normalizeUsername("  Jérémie  ")).toBe("jeremie");
  });

  it("handles already normalized strings", () => {
    expect(normalizeUsername("john")).toBe("john");
  });
});
