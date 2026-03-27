import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccount) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY manquant");
  process.exit(1);
}

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    : getApps()[0];

const db = getFirestore(app);
const storage = getStorage(app);

async function reset() {
  console.log("=== Reset des comptes ===\n");

  // 1. Reset photo_url on all accounts
  const accountsSnap = await db.collection("accounts").get();
  console.log(`${accountsSnap.size} comptes trouvés.`);

  for (const doc of accountsSnap.docs) {
    await doc.ref.update({
      photo_url: null,
      updated_at: new Date().toISOString(),
    });
  }
  console.log("Photos de profil supprimées de tous les comptes.");

  // 2. Delete all avatar files from storage
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: "avatars/" });
    if (files.length > 0) {
      for (const file of files) {
        await file.delete();
      }
      console.log(`${files.length} fichiers avatars supprimés du storage.`);
    } else {
      console.log("Aucun avatar dans le storage.");
    }
  } catch (err) {
    console.log("Storage avatars: rien à supprimer ou erreur ignorée.");
  }

  // 3. Delete all old players (not in current game)
  const playersSnap = await db.collection("players").get();
  let deletedPlayers = 0;
  for (const doc of playersSnap.docs) {
    await doc.ref.delete();
    deletedPlayers++;
  }
  console.log(`${deletedPlayers} joueurs supprimés.`);

  // 4. Delete all kill events
  const eventsSnap = await db.collection("kill_events").get();
  let deletedEvents = 0;
  for (const doc of eventsSnap.docs) {
    await doc.ref.delete();
    deletedEvents++;
  }
  console.log(`${deletedEvents} kill events supprimés.`);

  // 5. Delete all games
  const gamesSnap = await db.collection("games").get();
  let deletedGames = 0;
  for (const doc of gamesSnap.docs) {
    await doc.ref.delete();
    deletedGames++;
  }
  console.log(`${deletedGames} parties supprimées.`);

  console.log("\n=== Reset terminé ! ===");
  console.log("Relance seed-game.ts pour recréer la partie.");
}

reset().catch(console.error);
