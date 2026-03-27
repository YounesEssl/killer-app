import {
  collection,
  query,
  where,
  getDocs,
  documentId,
  type Firestore,
} from "firebase/firestore";

/**
 * Batch fetch documents by IDs, working around Firestore's 30-element `in()` limit.
 * Returns a Map of id → document data.
 */
export async function batchGetByIds<T>(
  db: Firestore,
  collectionName: string,
  ids: string[]
): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  if (ids.length === 0) return results;

  const uniqueIds = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += 30) {
    chunks.push(uniqueIds.slice(i, i + 30));
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(
        query(collection(db, collectionName), where(documentId(), "in", chunk))
      )
    )
  );

  for (const snapshot of snapshots) {
    snapshot.forEach((doc) => {
      results.set(doc.id, { id: doc.id, ...doc.data() } as T);
    });
  }

  return results;
}
