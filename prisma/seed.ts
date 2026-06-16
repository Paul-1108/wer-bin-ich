import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const sets = [
  {
    title: "Berufe",
    description: "Klassische Rollen und Jobs fuer eine schnelle Einstiegsrunde.",
    cards: [
      {
        name: "Arzt",
        description: "Behandelt Patientinnen und Patienten und arbeitet oft im Krankenhaus oder in einer Praxis.",
      },
      {
        name: "Lehrer",
        description: "Unterrichtet eine Klasse und erklaert neue Themen.",
      },
      {
        name: "Feuerwehrmann",
        description: "Loescht Braende und hilft bei Notfaellen.",
      },
      {
        name: "Koch",
        description: "Bereitet Gerichte zu und arbeitet meist in einer Kueche.",
      },
    ],
  },
  {
    title: "Tiere",
    description: "Bekannte Tiere, die sich gut durch Ja-Nein-Fragen erraten lassen.",
    cards: [
      {
        name: "Elefant",
        description: "Grosses Saeugetier mit Ruessel und Stosszahnen.",
      },
      {
        name: "Pinguin",
        description: "Flugunfaehiger Vogel, der sehr gut schwimmen kann.",
      },
      {
        name: "Katze",
        description: "Beliebtes Haustier, das schnurrt und gerne schlaeft.",
      },
      {
        name: "Adler",
        description: "Greifvogel mit scharfem Blick und grossen Fluegeln.",
      },
    ],
  },
  {
    title: "Prominente Figuren",
    description: "Fiktive und reale bekannte Personen fuer abwechslungsreiche Spielrunden.",
    cards: [
      {
        name: "Albert Einstein",
        description: "Physiker mit wildem Haar und der Relativitaetstheorie.",
      },
      {
        name: "Sherlock Holmes",
        description: "Fiktiver Detektiv aus London mit besonderer Beobachtungsgabe.",
      },
      {
        name: "Pippi Langstrumpf",
        description: "Starkes, rothaariges Maedchen aus bekannten Kindergeschichten.",
      },
      {
        name: "Super Mario",
        description: "Videospiel-Figur mit roter Muetze und Schnurrbart.",
      },
    ],
  },
];

async function main() {
  for (const set of sets) {
    await prisma.card.deleteMany({
      where: {
        set: {
          title: set.title,
        },
      },
    });

    await prisma.set.deleteMany({
      where: { title: set.title },
    });

    await prisma.set.create({
      data: {
        title: set.title,
        description: set.description,
        cards: {
          create: set.cards,
        },
      },
    });
  }

  console.log(`Seeded ${sets.length} sets with ${sets.reduce((sum, set) => sum + set.cards.length, 0)} cards.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
