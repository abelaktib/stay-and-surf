import { SITE, STAY } from "./config";

/*
 * Informations légales, conditions de réservation et confidentialité.
 * Texte de base à faire relire par un professionnel du droit avant la mise en ligne.
 */
const missing = { fr: "à compléter", en: "to be completed" };

export function legalContent(locale) {
  const l = locale === "en" ? "en" : "fr";
  const v = (x) => x || `[${missing[l]}]`;
  const owner = v(SITE.legal.owner);
  const address = v(SITE.legal.address);
  const reg = v(SITE.legal.registration);
  const pct = Math.round(STAY.depositRate * 100);

  if (l === "en") {
    return {
      title: "Legal information",
      description: "Legal notice, booking terms and privacy policy for Stay & Surf, Dar Nejma, Oualidia.",
      updated: "Last updated: October 2026",
      sections: [
        {
          id: "editeur",
          h: "Publisher and hosting",
          p: [
            `This site is published by ${owner}, ${address}. Registration: ${reg}. Contact: ${SITE.email}.`,
            "Hosting: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States.",
            "Photos of the house: all rights reserved. Hero photo: Unsplash licence.",
          ],
        },
        {
          id: "reservation",
          h: "Booking terms",
          p: [
            `A stay lasts at least ${STAY.minNights} nights, for 1 to ${STAY.maxGuests} guests. The house is reserved for a single group for the whole stay.`,
            `The price shown in the calendar is per person and includes the items listed under “The surf stay”. ${pct === 100 ? "The full amount is paid online when booking." : `${pct}% is paid online when booking, the balance on arrival.`}`,
            "The booking is confirmed once the payment has gone through. A confirmation email is sent to the address given.",
            "Cancellation by the guest: free up to 30 days before arrival. After that, the amount paid is not refunded. To cancel, write to us by email.",
            "If we have to cancel the stay, the full amount paid is refunded.",
          ],
        },
        {
          id: "confidentialite",
          h: "Privacy",
          p: [
            "Data collected: name, email, phone number (optional), message (optional), stay dates and number of guests. It is used only to manage your booking and contact you about it.",
            "Payment is handled by Stripe (Stripe Payments Europe, Ltd., Dublin, Ireland). Your card details never pass through this site. Booking details are stored in our Stripe account.",
            "Retention: for the time needed to manage the stay, then for the period required by accounting rules.",
            `Your rights: you can ask to access, correct or delete your data by writing to ${SITE.email}. You can also lodge a complaint with your data protection authority (CNIL in France, CNDP in Morocco).`,
            "Cookies: this site sets no advertising or tracking cookies. Your browser only stores, for the session, whether you have already seen the opening animation.",
          ],
        },
      ],
    };
  }

  return {
    title: "Informations légales",
    description: "Mentions légales, conditions de réservation et politique de confidentialité de Stay & Surf, Dar Nejma, Oualidia.",
    updated: "Dernière mise à jour : octobre 2026",
    sections: [
      {
        id: "editeur",
        h: "Éditeur et hébergement",
        p: [
          `Ce site est édité par ${owner}, ${address}. Immatriculation : ${reg}. Contact : ${SITE.email}.`,
          "Hébergement : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
          "Photos de la maison : tous droits réservés. Photo d’accueil : licence Unsplash.",
        ],
      },
      {
        id: "reservation",
        h: "Conditions de réservation",
        p: [
          `Un séjour dure ${STAY.minNights} nuits minimum, pour 1 à ${STAY.maxGuests} voyageurs. La maison est réservée à un seul groupe pendant tout le séjour.`,
          `Le prix affiché par le calendrier s’entend par personne et comprend les prestations listées dans « Le séjour surf ». ${pct === 100 ? "La totalité est payée en ligne à la réservation." : `${pct} % sont payés en ligne à la réservation, le solde à l’arrivée.`}`,
          "La réservation est confirmée dès que le paiement est accepté. Un e-mail de confirmation est envoyé à l’adresse indiquée.",
          "Annulation par le voyageur : gratuite jusqu’à 30 jours avant l’arrivée. Au-delà, le montant versé n’est pas remboursé. Pour annuler, écrivez-nous par e-mail.",
          "Si nous devons annuler le séjour, la totalité du montant versé est remboursée.",
        ],
      },
      {
        id: "confidentialite",
        h: "Confidentialité",
        p: [
          "Données collectées : nom, e-mail, téléphone (facultatif), message (facultatif), dates du séjour et nombre de voyageurs. Elles servent uniquement à gérer votre réservation et à vous contacter à son sujet.",
          "Le paiement est traité par Stripe (Stripe Payments Europe, Ltd., Dublin, Irlande). Vos données bancaires ne transitent jamais par ce site. Les informations de réservation sont conservées dans notre compte Stripe.",
          "Durée de conservation : le temps nécessaire à la gestion du séjour, puis la durée imposée par les obligations comptables.",
          `Vos droits : vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à ${SITE.email}. Vous pouvez aussi saisir l’autorité de protection des données (CNIL en France, CNDP au Maroc).`,
          "Cookies : ce site ne dépose aucun cookie publicitaire ni de mesure d’audience. Votre navigateur garde seulement en mémoire, le temps de la session, le fait d’avoir déjà vu l’animation d’ouverture.",
        ],
      },
    ],
  };
}
