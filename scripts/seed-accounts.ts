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
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY manquant dans .env.local");
  process.exit(1);
}

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      })
    : getApps()[0];

const db = getFirestore(app);

const NAMES = [
  "Adrien M",
  "Adrien P",
  "Agathe",
  "Alex",
  "Alexia",
  "Alizée",
  "Anthime",
  "Arthur",
  "Aylan",
  "Benoit",
  "Chloé M",
  "Chloé P",
  "Constance",
  "Elena",
  "Emma",
  "Flavian",
  "Gabriel",
  "Guillaume C",
  "Guillaume H",
  "Inès",
  "Jade",
  "Jason",
  "Justine",
  "Kossai",
  "Lisa",
  "Lunna",
  "Manu",
  "Marie",
  "Marion",
  "Maxence D",
  "Maxime B",
  "Maxime E",
  "Milia",
  "Paul",
  "Raph T",
  "Raphaël (Cobra)",
  "Rémi",
  "Romain",
  "Ruben",
  "Sacha",
  "Samir",
  "Samantha",
  "Tess",
  "Thierry",
  "Thomas",
  "Yanis",
  "Zoé",
];

function normalizeUsername(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generateSecretCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function seed() {
  console.log(`Creation de ${NAMES.length} comptes...\n`);

  const results: Array<{ username: string; code: string }> = [];

  for (const name of NAMES) {
    const normalized = normalizeUsername(name);
    const code = generateSecretCode();
    const now = new Date().toISOString();

    // Check if account already exists
    const existing = await db
      .collection("accounts")
      .where("username_normalized", "==", normalized)
      .limit(1)
      .get();

    if (!existing.empty) {
      const existingData = existing.docs[0].data();
      console.log(`  ⏭  ${name} existe deja (code: ${existingData.secret_code})`);
      results.push({ username: name, code: existingData.secret_code });
      continue;
    }

    const ref = db.collection("accounts").doc();
    await ref.set({
      username: name.trim(),
      username_normalized: normalized,
      secret_code: code,
      photo_url: null,
      created_at: now,
      updated_at: now,
    });

    console.log(`  +  ${name} -> code: ${code}`);
    results.push({ username: name, code });
  }

  console.log("\n=== RECAPITULATIF ===\n");
  console.log("Nom".padEnd(22) + "Code");
  console.log("-".repeat(30));
  for (const r of results) {
    console.log(r.username.padEnd(22) + r.code);
  }
  console.log(`\nTotal: ${results.length} comptes`);
}

seed().catch(console.error);
