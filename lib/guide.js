/*
 * Guide « Surfer à Oualidia » : contenu factuel et sourcé, mis à jour à la date indiquée.
 * Chaque section répond à une question en tête de paragraphe, pour Google et les moteurs IA.
 */
export const GUIDE_UPDATED = "2026-10-27";

export const GUIDE_SOURCES = [
  { name: "The Surf Atlas, Oualidia surf guide", url: "https://thesurfatlas.com/surfing-morocco/oualidia-surf/" },
  { name: "Surf-Forecast, Oualidia surf break", url: "https://www.surf-forecast.com/breaks/Oualidia" },
  { name: "Surf-Forecast, Oualidia water temperature", url: "https://www.surf-forecast.com/breaks/Oualidia/seatemp" },
];

const fr = {
  title: "Surfer à Oualidia : spots, saison et conseils",
  metaTitle: "Surf à Oualidia : spots, saison, combinaison | Stay & Surf",
  description:
    "Où et quand surfer à Oualidia, au Maroc : la lagune pour débuter, les beach breaks pour progresser, la meilleure saison et la combinaison à prévoir.",
  crumb: "Surfer à Oualidia",
  home: "Accueil",
  updated: "Mis à jour le",
  lead: "Oualidia est un village de pêcheurs de la côte atlantique marocaine, entre El Jadida et Safi. Sa lagune protégée offre des vagues douces, parmi les meilleures du pays pour débuter, et les plages autour permettent de progresser. La houle la plus régulière arrive de novembre à mars.",
  sections: [
    {
      id: "spots",
      h: "Où surfer à Oualidia ?",
      p: ["Quatre spots se partagent les sessions, du plus doux au plus engagé. Le choix se fait chaque matin selon la houle et le vent."],
      table: {
        head: ["Spot", "Type", "Niveau"],
        rows: [
          ["La lagune", "Vagues douces sur bancs de sable, presque sans courant", "Premières vagues"],
          ["La Passe", "Beach break à l'entrée de la lagune, plus puissant", "Débutant à intermédiaire"],
          ["La Grande", "Pics de beach break, quelques vagues sur rochers", "Intermédiaire"],
          ["Plage d'Ayiir", "Beach break régulier et peu fréquenté, à 20 min", "Débutant à confirmé selon la taille"],
        ],
      },
    },
    {
      id: "saison",
      h: "Quelle est la meilleure saison pour surfer à Oualidia ?",
      p: [
        "L'hiver, de novembre à mars : les houles de nord-ouest sont régulières et le vent souvent favorable. Le vent idéal souffle de sud-est (offshore), et la marée change peu la qualité des vagues.",
        "L'été convient aux grands débutants dans la lagune, mais le vent rend la mer plus agitée l'après-midi. Les sessions se calent alors tôt le matin.",
      ],
    },
    {
      id: "debutant",
      h: "Oualidia convient-il aux débutants ?",
      p: [
        "Oui. La houle de l'océan entre dans la lagune et s'y reforme en petites vagues sur des bancs de sable, avec très peu de courant. C'est un endroit sûr pour apprendre à se lever, même quand la houle est grosse dehors.",
      ],
    },
    {
      id: "combinaison",
      h: "Quelle combinaison prévoir à Oualidia ?",
      p: [
        "L'eau descend à 16-17 °C vers mars et monte à 21-23 °C début septembre. Comptez une 4/3 mm en hiver et au printemps, une 3/2 mm à l'automne, un shorty en fin d'été.",
        "Pendant le séjour surf à Dar Nejma, la planche et la combinaison sont fournies.",
      ],
    },
    {
      id: "acces",
      h: "Comment venir à Oualidia ?",
      p: [
        "Par l'aéroport de Casablanca, à environ 2 h à 2 h 30 de route, ou par celui de Marrakech, à environ 3 h. El Jadida, desservie par le train depuis Casablanca, est à 1 h. Nous pouvons vous aider à organiser le transfert.",
      ],
    },
  ],
  cta: {
    h: "Le séjour surf à Dar Nejma",
    p: "Une maison entière pour 6 personnes, à quelques minutes de la lagune, avec cours, planche et combinaison. Dès 350 € par personne pour 7 nuits.",
    book: "Voir les dates",
    house: "Découvrir la maison",
  },
  sourcesTitle: "Sources",
};

const en = {
  title: "Surfing in Oualidia: spots, season and tips",
  metaTitle: "Surfing in Oualidia: spots, season, wetsuit | Stay & Surf",
  description:
    "Where and when to surf in Oualidia, Morocco: the lagoon for beginners, beach breaks to progress, the best season and which wetsuit to bring.",
  crumb: "Surfing in Oualidia",
  home: "Home",
  updated: "Updated",
  lead: "Oualidia is a fishing village on Morocco's Atlantic coast, between El Jadida and Safi. Its sheltered lagoon has soft waves, among the best in the country for beginners, and the beaches around it let you progress. The most consistent swell arrives from November to March.",
  sections: [
    {
      id: "spots",
      h: "Where to surf in Oualidia?",
      p: ["Four spots share the sessions, from gentlest to most committing. The choice is made each morning based on swell and wind."],
      table: {
        head: ["Spot", "Type", "Level"],
        rows: [
          ["The lagoon", "Soft waves over sandbanks, almost no current", "First waves"],
          ["La Passe", "Beach break at the lagoon mouth, more powerful", "Beginner to intermediate"],
          ["La Grande", "Beach break peaks, some waves over rocks", "Intermediate"],
          ["Ayiir beach", "Consistent, uncrowded beach break, 20 min away", "Beginner to advanced depending on size"],
        ],
      },
    },
    {
      id: "saison",
      h: "When is the best season to surf in Oualidia?",
      p: [
        "Winter, from November to March: northwest swells are consistent and the wind is often favourable. The ideal wind blows from the southeast (offshore), and the tide makes little difference to wave quality.",
        "Summer suits complete beginners in the lagoon, but the wind makes the sea choppier in the afternoon, so sessions move to early morning.",
      ],
    },
    {
      id: "debutant",
      h: "Is Oualidia good for beginners?",
      p: [
        "Yes. Ocean swell enters the lagoon and reforms into small waves over sandbanks, with very little current. It is a safe place to learn to stand up, even when the swell is big outside.",
      ],
    },
    {
      id: "combinaison",
      h: "Which wetsuit do you need in Oualidia?",
      p: [
        "The water drops to 16-17 °C around March and rises to 21-23 °C in early September. Bring a 4/3 mm in winter and spring, a 3/2 mm in autumn and a shorty in late summer.",
        "During the surf stay at Dar Nejma, the board and wetsuit are provided.",
      ],
    },
    {
      id: "acces",
      h: "How do you get to Oualidia?",
      p: [
        "Through Casablanca airport, about 2 to 2.5 hours by road, or Marrakech airport, about 3 hours. El Jadida, served by train from Casablanca, is 1 hour away. We can help you arrange the transfer.",
      ],
    },
  ],
  cta: {
    h: "The surf stay at Dar Nejma",
    p: "A whole house for 6, minutes from the lagoon, with lessons, board and wetsuit. From €350 per person for 7 nights.",
    book: "See dates",
    house: "See the house",
  },
  sourcesTitle: "Sources",
};

export const guideContent = (locale) => (locale === "en" ? en : fr);
