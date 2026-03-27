import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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
    ? initializeApp({ credential: cert(JSON.parse(serviceAccount)) })
    : getApps()[0];

const db = getFirestore(app);

// Assignments: [mission, executant, cible]
const ASSIGNMENTS: [string, string, string][] = [
  ["Fait imiter Mister V à cette personne", "Marion", "Benoit"],
  ["Fait dire son poids à cette personne", "Justine", "Thomas"],
  ["Trouve où travaille / étudie cette personne", "Gabriel", "Kossai"],
  ["Fait un check à cette personne", "Maxime E", "Alexia"],
  ['Fait dire "For sure" à cette personne', "Zoé", "Constance"],
  ["Bois un shot de vodka avec cette personne, mais sers-toi de l'eau", "Flavian", "Tess"],
  ["Bois un shot de Captain avec cette personne, mais sers-toi de l'eau", "Samantha", "Adrien P"],
  ["Fait danser Gangnam style cette personne", "Raph T", "Thierry"],
  ["Danse avec cette personne", "Maxime B", "Marion"],
  ["Trinque avec cette personne", "Chloé M", "Agathe"],
  ["Lance un chant du PSG et fais-toi suivre par cette personne", "Maxence D", "Romain"],
  ["Propose à cette personne d'aller se servir un verre et buvez ensemble", "Guillaume H", "Elena"],
  ["Fait raper cette personne (même pour rire)", "Sacha", "Anthime"],
  ["Trouve ce que fait cette personne dans la vie (études + job)", "Alex", "Marie"],
  ["Fait donner à cette personne le nom de sa mère", "Romain", "Lisa"],
  ["Fait dire à cette personne le nom de son/sa meilleure amie", "Benoit", "Guillaume C"],
  ["Fais cul-sec cette personne", "Guillaume C", "Jason"],
  ["Fais un câlin à cette personne", "Raphaël (Cobra)", "Zoé"],
  ["Fais-toi prendre en photo avec cette personne", "Adrien P", "Sacha"],
  ["Fais imiter quelqu'un de célèbre à cette personne", "Yanis", "Flavian"],
  ["Fais faire une pompe à cette personne", "Lisa", "Rémi"],
  ["Fais imiter un animal à cette personne", "Ruben", "Paul"],
  ["Fait la course avec cette personne", "Rémi", "Raphaël (Cobra)"],
  ["Fait un chifoumi en 3 points avec cette personne", "Thierry", "Maxence D"],
  ["Trinque avec cette personne", "Anthime", "Milia"],
  ["Trinque avec cette personne", "Agathe", "Guillaume H"],
  ["Fais cul-sec cette personne", "Tess", "Justine"],
  ["Fais imiter un personnage de film à cette personne", "Manu", "Raph T"],
  ["Trouve où travaille / étudie cette personne", "Samir", "Maxime E"],
  ["Fait donner à cette personne le nom de son père", "Kossai", "Chloé P"],
  ["Bois un shot avec cette personne", "Paul", "Manu"],
  ["Bois un shot avec cette personne", "Inès", "Chloé M"],
  ["Fais crier le prénom de quelqu'un de la soirée à cette personne", "Constance", "Emma"],
  ["Fais dire à cette personne sa musique préférée", "Marie", "Maxime B"],
  ["Fais boire un shot dégeux à cette personne en lui disant que c'est super bon", "Arthur", "Ruben"],
  ["Fais dire à cette personne son film préféré et pourquoi", "Alexia", "Adrien M"],
  ["Fais deviner une chanson en la sifflant à cette personne", "Alizée", "Samir"],
  ["Fais en sorte que cette personne te fasse un compliment", "Elena", "Jade"],
  ['Fais faire le "SIUUU" de Cristiano Ronaldo à cette personne', "Jason", "Yanis"],
  ["Fais en sorte que cette personne te dise la dernière fois qu'elle a chié", "Milia", "Gabriel"],
  ["Fais parler en x0.5 cette personne", "Lunna", "Arthur"],
  ["Sers un verre à cette personne et trinque avec elle juste après", "Adrien M", "Alex"],
  ["Fais imiter Homer Simpson à cette personne", "Thomas", "Samantha"],
  ["Fais faire/Participe à un jeu d'alcool avec cette personne", "Emma", "Alizée"],
  ["Fais réciter un max de prénoms des gens présents ce soir à cette personne", "Chloé P", "Aylan"],
  ["Echange ton insta avec cette personne", "Jade", "Lunna"],
  ["Fais faire un selfie avec toi à cette personne", "Aylan", "Inès"],
];

function normalizeUsername(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generateKillCode(existing: string[]): string {
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (existing.includes(code));
  return code;
}

async function deleteOldGame() {
  // Delete old game and its players
  const oldGamesSnap = await db
    .collection("games")
    .where("join_code", "==", "KILLER")
    .get();

  for (const gameDoc of oldGamesSnap.docs) {
    const gameId = gameDoc.id;
    console.log(`Suppression ancienne partie ${gameId}...`);

    // Delete players
    const playersSnap = await db
      .collection("players")
      .where("game_id", "==", gameId)
      .get();
    for (const p of playersSnap.docs) {
      await p.ref.delete();
    }

    // Delete kill events
    const eventsSnap = await db
      .collection("kill_events")
      .where("game_id", "==", gameId)
      .get();
    for (const e of eventsSnap.docs) {
      await e.ref.delete();
    }

    await gameDoc.ref.delete();
  }
}

async function seed() {
  await deleteOldGame();

  console.log("\n=== Création de la partie ===\n");

  // 1. Fetch all accounts and build a name->id map
  const accountsSnap = await db.collection("accounts").get();
  const accountMap = new Map<string, { id: string; username: string }>();
  for (const doc of accountsSnap.docs) {
    const data = doc.data();
    accountMap.set(normalizeUsername(data.username), {
      id: doc.id,
      username: data.username,
    });
  }

  // Verify all players exist
  const allNames = new Set<string>();
  for (const [, executant, cible] of ASSIGNMENTS) {
    allNames.add(executant);
    allNames.add(cible);
  }

  const missing: string[] = [];
  for (const name of allNames) {
    if (!accountMap.has(normalizeUsername(name))) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error("Comptes manquants:", missing);
    process.exit(1);
  }

  console.log(`${allNames.size} joueurs trouvés dans les comptes.\n`);

  // 2. Create the game
  const gameRef = db.collection("games").doc();
  const now = new Date().toISOString();
  await gameRef.set({
    name: "KILLER Party",
    join_code: "KILLER",
    admin_password: "admin",
    status: "active",
    winner_id: null,
    created_at: now,
    started_at: now,
    finished_at: null,
  });
  console.log(`Partie créée: ${gameRef.id} (code: KILLER, mdp admin: admin)\n`);

  // 3. Create player documents (without targets yet, we need all IDs first)
  const usedCodes: string[] = [];
  const playerRefs = new Map<string, string>(); // normalized name -> player doc ID
  const playerData = new Map<
    string,
    { ref: FirebaseFirestore.DocumentReference; name: string }
  >();

  for (const name of allNames) {
    const normalized = normalizeUsername(name);
    const account = accountMap.get(normalized)!;
    const killCode = generateKillCode(usedCodes);
    usedCodes.push(killCode);

    const ref = db.collection("players").doc();
    playerRefs.set(normalized, ref.id);
    playerData.set(normalized, { ref, name: account.username });

    await ref.set({
      game_id: gameRef.id,
      account_id: account.id,
      name: account.username,
      kill_code: killCode,
      target_id: null,
      mission_id: null,
      mission_description: null,
      is_alive: true,
      kill_count: 0,
      joined_at: now,
      died_at: null,
    });
  }

  console.log(`${allNames.size} joueurs créés.\n`);

  // 4. Set targets and missions
  console.log("Attribution des cibles et missions:\n");

  for (const [mission, executant, cible] of ASSIGNMENTS) {
    const execNorm = normalizeUsername(executant);
    const cibleNorm = normalizeUsername(cible);
    const execPlayerId = playerRefs.get(execNorm);
    const ciblePlayerId = playerRefs.get(cibleNorm);

    if (!execPlayerId || !ciblePlayerId) {
      console.error(`  ERREUR: ${executant} -> ${cible} (joueur introuvable)`);
      continue;
    }

    await db.collection("players").doc(execPlayerId).update({
      target_id: ciblePlayerId,
      mission_description: mission,
    });

    console.log(`  ${executant.padEnd(20)} -> ${cible.padEnd(20)} | ${mission}`);
  }

  console.log(`\n=== Partie prête ! ===`);
  console.log(`Game ID: ${gameRef.id}`);
  console.log(`URL: /game/${gameRef.id}`);
  console.log(`Admin: /admin/${gameRef.id} (mdp: admin)`);
}

seed().catch(console.error);
