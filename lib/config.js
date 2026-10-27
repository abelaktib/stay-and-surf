/**
 * Réglages du séjour. C'est le seul fichier à modifier pour changer
 * les prix, la durée minimum, la capacité ou les coordonnées.
 */
export const SITE = {
  name: "Stay & Surf",
  house: "Dar Nejma",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stayandsurf.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@stayandsurf.com",
  // Format international sans espaces ni +, ex. 212600000000
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "",
  geo: { lat: 32.7333, lng: -9.0333 },
  address: { locality: "Oualidia", region: "Casablanca-Settat", country: "MA" },
  // Éditeur du site, affiché dans les informations légales (obligatoire avant la mise en ligne)
  legal: {
    owner: process.env.NEXT_PUBLIC_LEGAL_OWNER || "",
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "",
    registration: process.env.NEXT_PUBLIC_LEGAL_REGISTRATION || "",
  },
};

export const STAY = {
  maxGuests: 6, // 1 chambre double + dortoir de 4 lits
  minNights: 7, // séjour surf à la semaine
  currency: "eur",
  /**
   * Prix de base par personne pour 7 nuits.
   * Le prix par nuit = prix semaine / 7, ce qui permet des séjours de 8, 10, 14 nuits.
   */
  weeklyPricePerPerson: 350,
  /**
   * Saisons : dates au format MM-DD, bornes incluses.
   * La première saison qui correspond à une nuit s'applique.
   * Une période peut chevaucher le nouvel an (ex. de 12-20 à 01-05).
   */
  seasons: [
    { id: "fetes", from: "12-20", to: "01-05", weeklyPricePerPerson: 420 },
    { id: "ete", from: "07-01", to: "08-31", weeklyPricePerPerson: 420 },
    { id: "printemps", from: "04-01", to: "06-30", weeklyPricePerPerson: 380 },
  ],
  /**
   * Part payée en ligne à la réservation. 1 = totalité, 0.3 = acompte de 30 %.
   */
  depositRate: 1,
  // Une demande de paiement bloque les dates pendant cette durée (30 min minimum chez Stripe)
  holdMinutes: 30,
};
