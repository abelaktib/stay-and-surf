# Stay & Surf, Dar Nejma (Oualidia)

Site de réservation directe des séjours surf à Dar Nejma. Next.js 16, FR et EN, paiement Stripe, synchronisation des calendriers Airbnb et Booking. Aucune base de données : les réservations du site sont lues directement dans Stripe.

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

## Ce qu'il faut régler

| Quoi | Où |
| --- | --- |
| Prix, saisons, durée minimum, acompte | `lib/config.js` |
| Textes FR et EN (compris dans le séjour, FAQ, annulation…) | `lib/i18n.js` |
| Photos | `public/photos/` (remplacer le fichier en gardant le même nom) |
| Photo du héros (vague) | `HERO_IMG` dans `components/Hero.jsx` |

Pour convertir de nouvelles photos brutes : `npm run photos -- /chemin/vers/dossier/` (voir `scripts/photos.mjs`).

## Mise en ligne sur Vercel

Dans Vercel, Project > Settings > Environment Variables, ajouter :

- `NEXT_PUBLIC_SITE_URL` : `https://stayandsurf.com`
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_INSTAGRAM`
- `STRIPE_SECRET_KEY` : clé `sk_test_...` pour tester, puis `sk_live_...`
- `AIRBNB_ICAL_URL` et `BOOKING_ICAL_URL`

Redéployer après chaque changement de variable.

## Synchronisation des calendriers (dans les deux sens)

1. **Airbnb et Booking vers le site** : copier l'URL d'export iCal de chaque plateforme dans `AIRBNB_ICAL_URL` et `BOOKING_ICAL_URL`. Le site relit ces flux toutes les 10 minutes. Tant qu'aucune URL n'est renseignée, le calendrier affiche des dates de démonstration.
2. **Le site vers Airbnb et Booking** : importer `https://stayandsurf.com/api/calendar.ics` dans Airbnb (Calendrier > Disponibilités > Connecter un calendrier) et dans Booking (Calendrier > Synchroniser les calendriers > Importer). Chaque réservation payée sur le site y apparaît et bloque les dates.

Une demande de paiement en cours bloque les dates 31 minutes pour éviter qu'un deuxième client paie les mêmes nuits.

## Tester un paiement

Avec la clé de test Stripe, utiliser la carte `4242 4242 4242 4242`, une date future et n'importe quel code. La réservation apparaît dans Stripe (Paiements) et sur `/api/calendar.ics`.

## Pages et routes

- `/fr`, `/en` : le site
- `/fr/merci` : confirmation après paiement
- `/api/availability` : nuits indisponibles (JSON)
- `/api/checkout` : crée le paiement Stripe après revérification du prix et des dates
- `/api/calendar.ics` : export iCal des réservations du site
- `/sitemap.xml`, `/robots.txt`
