import { vi } from "vitest";

// In-memory Firestore mock
type DocData = Record<string, unknown>;

export class MockFirestore {
  private collections: Map<string, Map<string, DocData>> = new Map();
  private idCounter = 0;

  private getOrCreateCollection(name: string): Map<string, DocData> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  // Seed data for tests
  seed(collectionName: string, id: string, data: DocData) {
    this.getOrCreateCollection(collectionName).set(id, data);
  }

  clear() {
    this.collections.clear();
    this.idCounter = 0;
  }

  collection(name: string) {
    const col = this.getOrCreateCollection(name);
    return new MockCollectionRef(col, name, this);
  }

  _generateId(): string {
    return `mock-id-${++this.idCounter}`;
  }
}

class MockCollectionRef {
  constructor(
    private data: Map<string, DocData>,
    private name: string,
    private db: MockFirestore
  ) {}

  doc(id?: string): MockDocRef {
    const docId = id || this.db._generateId();
    return new MockDocRef(this.data, docId, this.name);
  }

  where(field: string, op: string, value: unknown): MockQuery {
    return new MockQuery(this.data, this.name).where(field, op, value);
  }

  orderBy(field: string, direction: string = "asc"): MockQuery {
    return new MockQuery(this.data, this.name).orderBy(field, direction);
  }

  async get(): Promise<MockQuerySnapshot> {
    return new MockQuery(this.data, this.name).get();
  }
}

class MockDocRef {
  id: string;

  constructor(
    private collection: Map<string, DocData>,
    id: string,
    private collectionName: string
  ) {
    this.id = id;
  }

  async get(): Promise<MockDocSnapshot> {
    const data = this.collection.get(this.id);
    return new MockDocSnapshot(this.id, data || null);
  }

  async set(data: DocData): Promise<void> {
    this.collection.set(this.id, { ...data });
  }

  async update(data: DocData): Promise<void> {
    const existing = this.collection.get(this.id);
    if (!existing) throw new Error(`Document ${this.id} not found`);
    this.collection.set(this.id, { ...existing, ...data });
  }

  async delete(): Promise<void> {
    this.collection.delete(this.id);
  }
}

class MockDocSnapshot {
  id: string;
  private _data: DocData | null;

  constructor(id: string, data: DocData | null) {
    this.id = id;
    this._data = data;
  }

  get exists(): boolean {
    return this._data !== null;
  }

  data(): DocData | undefined {
    return this._data || undefined;
  }
}

class MockQuery {
  private filters: Array<{ field: string; op: string; value: unknown }> = [];
  private orderBys: Array<{ field: string; direction: string }> = [];
  private _limit: number | null = null;

  constructor(
    private data: Map<string, DocData>,
    private collectionName: string
  ) {}

  where(field: string, op: string, value: unknown): MockQuery {
    this.filters.push({ field, op, value });
    return this;
  }

  orderBy(field: string, direction: string = "asc"): MockQuery {
    this.orderBys.push({ field, direction });
    return this;
  }

  limit(n: number): MockQuery {
    this._limit = n;
    return this;
  }

  count() {
    return {
      get: async () => {
        const snap = await this.get();
        return { data: () => ({ count: snap.docs.length }) };
      },
    };
  }

  async get(): Promise<MockQuerySnapshot> {
    let results: Array<{ id: string; data: DocData }> = [];

    for (const [id, data] of this.data.entries()) {
      let match = true;
      for (const filter of this.filters) {
        const fieldValue = data[filter.field];
        switch (filter.op) {
          case "==":
            if (fieldValue !== filter.value) match = false;
            break;
          case "!=":
            if (fieldValue === filter.value) match = false;
            break;
          case ">":
            if ((fieldValue as number) <= (filter.value as number)) match = false;
            break;
          case "<":
            if ((fieldValue as number) >= (filter.value as number)) match = false;
            break;
          case "in":
            if (!(filter.value as unknown[]).includes(fieldValue)) match = false;
            break;
        }
      }
      if (match) results.push({ id, data });
    }

    // Sort
    for (const ob of this.orderBys) {
      results.sort((a, b) => {
        const aVal = a.data[ob.field];
        const bVal = b.data[ob.field];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return ob.direction === "desc" ? -cmp : cmp;
      });
    }

    // Limit
    if (this._limit !== null) {
      results = results.slice(0, this._limit);
    }

    return new MockQuerySnapshot(results);
  }
}

class MockQuerySnapshot {
  docs: MockDocSnapshot[];

  constructor(results: Array<{ id: string; data: DocData }>) {
    this.docs = results.map((r) => new MockDocSnapshot(r.id, r.data));
  }

  get empty(): boolean {
    return this.docs.length === 0;
  }
}

// Create and export a shared mock instance
export const mockDb = new MockFirestore();

// Mock the firebase server module
export function setupFirebaseMock() {
  vi.mock("@/lib/firebase/server", () => ({
    adminDb: mockDb,
    adminStorage: {
      bucket: () => ({
        file: () => ({
          save: vi.fn(),
          delete: vi.fn(),
          getSignedUrl: vi.fn().mockResolvedValue(["https://mock-url.com"]),
        }),
        name: "mock-bucket",
      }),
    },
  }));
}
