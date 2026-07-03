import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../lib/generated/prisma/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set.");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN is not set.");
}

const adapter = new PrismaLibSql({
  url,
  authToken,
});

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
      { name: "Polizist", description: "Sorgt fuer Sicherheit, nimmt Anzeigen auf und klaert Straftaten auf." },
      { name: "Pilot", description: "Steuert Flugzeuge und bringt Passagiere oder Fracht ans Ziel." },
      { name: "Baecker", description: "Backt Brot, Broetchen, Kuchen und anderes Gebaeck." },
      { name: "Architekt", description: "Plant Gebaeude und entwirft Plaene fuer deren Bau." },
      { name: "Gaertner", description: "Pflegt Pflanzen, Gaerten und Gruenanlagen." },
      { name: "Mechaniker", description: "Wartet und repariert Maschinen oder Fahrzeuge." },
      { name: "Journalist", description: "Recherchiert Themen und berichtet darueber in den Medien." },
      { name: "Fotograf", description: "Nimmt professionelle Bilder von Menschen, Orten oder Ereignissen auf." },
      { name: "Anwalt", description: "Beraet Menschen in Rechtsfragen und vertritt sie vor Gericht." },
      { name: "Friseur", description: "Schneidet, pflegt und gestaltet Haare." },
      { name: "Elektriker", description: "Installiert und repariert elektrische Leitungen und Geraete." },
      { name: "Programmierer", description: "Entwickelt Software und schreibt Quellcode fuer Computerprogramme." },
      { name: "Zahnarzt", description: "Untersucht und behandelt Zaehne und Zahnfleisch." },
      { name: "Schauspieler", description: "Spielt Rollen im Theater, in Filmen oder in Serien." },
      { name: "Musiker", description: "Spielt Instrumente, singt oder komponiert Musik." },
      { name: "Richter", description: "Leitet Gerichtsverfahren und trifft rechtliche Entscheidungen." },
      { name: "Landwirt", description: "Baut Lebensmittel an oder haelt Nutztiere auf einem Bauernhof." },
      { name: "Busfahrer", description: "Befoerdert Fahrgaeste auf festgelegten Strecken." },
      { name: "Apotheker", description: "Gibt Medikamente aus und beraet zu ihrer Anwendung." },
      { name: "Tischler", description: "Fertigt und repariert Moebel und andere Gegenstaende aus Holz." },
      { name: "Astronaut", description: "Reist fuer Forschung und Missionen ins Weltall." },
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
      { name: "Hund", description: "Treues Haustier mit einem besonders guten Geruchssinn." },
      { name: "Giraffe", description: "Sehr grosses afrikanisches Tier mit einem langen Hals." },
      { name: "Loewe", description: "Grosse Raubkatze, deren Maennchen eine auffaellige Maehne tragen." },
      { name: "Delfin", description: "Intelligentes Meeressaeugetier, das oft in Gruppen lebt." },
      { name: "Krokodil", description: "Grosses Reptil mit kraeftigem Kiefer, das an Gewaessern lebt." },
      { name: "Kanguru", description: "Australisches Beuteltier, das sich huepfend fortbewegt." },
      { name: "Eule", description: "Nachtaktiver Vogel mit grossen Augen und nahezu lautlosem Flug." },
      { name: "Hai", description: "Knorpelfisch und erfolgreicher Jager der Meere." },
      { name: "Pferd", description: "Grosses Huftier, das oft geritten oder als Nutztier gehalten wird." },
      { name: "Affe", description: "Geschicktes Saeugetier, das haeufig klettert und in Gruppen lebt." },
      { name: "Baer", description: "Grosses, kraeftiges Saeugetier mit dichtem Fell." },
      { name: "Fuchs", description: "Schlaues Raubtier mit roetlichem Fell und buschigem Schwanz." },
      { name: "Schildkroete", description: "Reptil mit einem schuetzenden Panzer und langsamer Fortbewegung." },
      { name: "Frosch", description: "Amphibie, die springen kann und meist in der Naehe von Wasser lebt." },
      { name: "Zebra", description: "Afrikanisches Huftier mit einem schwarz-weissen Streifenmuster." },
      { name: "Nashorn", description: "Massiges Saeugetier mit einem oder zwei Hoernern auf der Nase." },
      { name: "Papagei", description: "Farbenfroher Vogel, der Laute und Woerter nachahmen kann." },
      { name: "Oktopus", description: "Meeresbewohner mit acht Armen und hoher Intelligenz." },
      { name: "Biene", description: "Fliegendes Insekt, das Blueten bestaeubt und Honig produziert." },
      { name: "Wolf", description: "In Rudeln lebendes Raubtier und wilder Verwandter des Hundes." },
      { name: "Faultier", description: "Langsames Baumbewohner-Saeugetier aus Mittel- und Suedamerika." },
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
      { name: "Harry Potter", description: "Junger Zauberer mit runder Brille und blitzfoermiger Narbe." },
      { name: "Angela Merkel", description: "Deutsche Politikerin und langjaehrige Bundeskanzlerin." },
      { name: "Micky Maus", description: "Beruehmte Comic-Maus mit runden Ohren und roten Hosen." },
      { name: "Elvis Presley", description: "Amerikanischer Saenger, der als King of Rock and Roll bekannt wurde." },
      { name: "Batman", description: "Maskierter Comic-Held aus Gotham City ohne uebernatuerliche Kraefte." },
      { name: "Taylor Swift", description: "US-amerikanische Saengerin und Songwriterin mit weltweitem Erfolg." },
      { name: "Darth Vader", description: "Dunkel gekleideter Gegenspieler aus Star Wars mit markanter Atemmaske." },
      { name: "Leonardo da Vinci", description: "Italienischer Kuenstler und Erfinder, der die Mona Lisa malte." },
      { name: "Homer Simpson", description: "Gelbe Zeichentrickfigur und Familienvater aus Springfield." },
      { name: "Michael Jackson", description: "Amerikanischer Popstar, bekannt fuer den Moonwalk." },
      { name: "Asterix", description: "Kleiner gallischer Comic-Held, der mit Zaubertrank gegen Roemer kaempft." },
      { name: "Marie Curie", description: "Physikerin und Chemikerin, die zur Radioaktivitaet forschte." },
      { name: "Spider-Man", description: "Comic-Held mit Spinnenkraeften, der durch New York schwingt." },
      { name: "Mozart", description: "Oesterreichischer Komponist der Wiener Klassik und musikalisches Wunderkind." },
      { name: "Wonder Woman", description: "Amazonische Superheldin mit magischem Lasso und grosser Staerke." },
      { name: "Charlie Chaplin", description: "Stummfilmstar mit Melone, Spazierstock und kleinem Schnurrbart." },
      { name: "SpongeBob Schwammkopf", description: "Optimistischer gelber Schwamm, der in Bikini Bottom lebt." },
      { name: "Frida Kahlo", description: "Mexikanische Malerin, bekannt fuer ihre Selbstportraets." },
      { name: "James Bond", description: "Fiktiver britischer Geheimagent mit der Kennnummer 007." },
      { name: "Winnie Puuh", description: "Honigliebender Baer aus bekannten Kindergeschichten." },
      { name: "Cristiano Ronaldo", description: "Portugiesischer Fussballspieler und mehrfacher Weltfussballer." },
    ],
  },
];

async function main() {
  for (const setData of sets) {
    const existingSet = await prisma.set.findFirst({
      where: { title: setData.title },
      include: { cards: true },
    });

    if (!existingSet) {
      await prisma.set.create({
        data: {
          title: setData.title,
          description: setData.description,
          cards: { create: setData.cards },
        },
      });

      continue;
    }

    const existingNames = new Set(
      existingSet.cards.map((card) => card.name),
    );

    const missingCards = setData.cards.filter(
      (card) => !existingNames.has(card.name),
    );

    await prisma.set.update({
      where: { id: existingSet.id },
      data: {
        description: setData.description,
        cards: {
          create: missingCards,
        },
      },
    });
  }

  console.log(
    `Seeded ${sets.length} sets with ${sets.reduce(
      (sum, set) => sum + set.cards.length,
      0,
    )} cards.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
