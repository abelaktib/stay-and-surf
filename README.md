# Stay & Surf — Oualidia

Site Next.js 15 · Tailwind · Framer Motion · déploiement Vercel.

Remplace le site WordPress par quelque chose de plus rapide, plus beau, et
synchronisé en temps réel avec les dispos Booking + Airbnb via iCal.

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. (optionnel) Configurer les flux iCal
cp .env.local.example .env.local
# éditer .env.local avec tes URLs Booking & Airbnb

# 3. Lancer en local
npm run dev
```

Ouvre http://localhost:3000

**Sans configuration iCal**, le calendrier utilise les vraies dispos extraites
du fichier iCal Booking fourni (fallback intégré). Tu peux déjà tester tout le
site tel quel.

---

## 📅 Brancher la synchro iCal (production)

### 1 · Récupérer ton flux iCal **Booking**

1. Connecte-toi à l'**Extranet Booking**
2. Va dans `Calendrier` → `Tarifs et disponibilité` → `Synchroniser les calendriers`
3. Clique sur `Exporter le calendrier`
4. Copie l'URL `.ics` (elle commence par `https://admin.booking.com/hotel/hoteladmin/ical.html?...`)

### 2 · Récupérer ton flux iCal **Airbnb**

1. Connecte-toi à ton **Dashboard hôte Airbnb**
2. Sélectionne l'annonce → `Calendrier`
3. Paramètres → `Synchronisation de calendrier` → `Exporter le calendrier`
4. Copie l'URL (finit par `.ics`)

### 3 · Les coller dans `.env.local`

```env
BOOKING_ICAL_URL=https://admin.booking.com/hotel/hoteladmin/ical.html?t=XXXX
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/XXXXXXXX.ics?s=XXXXX
```

Relance `npm run dev`. L'API `/api/availability` fusionnera automatiquement les
deux flux et mettra à jour le calendrier du site toutes les 30 minutes.

---

## 🔗 Deep-links Booking / Airbnb

Quand un visiteur sélectionne des dates + voyageurs puis clique sur
"Réserver sur Booking" ou "Réserver sur Airbnb", il est redirigé vers la
plateforme avec les paramètres **déjà pré-remplis** :

- **Booking** : `?checkin=2026-06-15&checkout=2026-06-22&group_adults=2`
- **Airbnb** : `?check_in=2026-06-15&check_out=2026-06-22&adults=2`

Les URLs des annonces se configurent en haut de `app/page.jsx` :

```js
const BOOKING_URL = "https://www.booking.com/hotel/ma/darnejma-oualidia.fr.html";
const AIRBNB_URL  = "https://www.airbnb.fr/rooms/XXXXXXXX"; // ← à remplacer
```

---

## ☁️ Déploiement Vercel (3 min, gratuit)

1. `git init && git add . && git commit -m "init"`
2. Crée un repo sur **github.com** et push
3. Va sur [vercel.com](https://vercel.com) → `Import Project` → sélectionne le repo
4. Dans les **Environment Variables**, ajoute :
   - `BOOKING_ICAL_URL`
   - `AIRBNB_ICAL_URL`
5. `Deploy` — c'est fini. URL type `stay-and-surf.vercel.app`

Pour brancher `stayandsurf.com` : dans Vercel → `Settings` → `Domains` →
ajouter le domaine. Il donnera les DNS à pointer.

---

## 🗂️ Structure

```
stay-and-surf/
├── app/
│   ├── layout.jsx              # Metadata SEO
│   ├── page.jsx                # Landing page complète
│   ├── globals.css             # Fonts, variables CSS, utilitaires
│   └── api/
│       └── availability/
│           └── route.js        # Parser iCal + fallback
├── public/                     # Images statiques (à ajouter)
├── .env.local.example          # Template des variables
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.mjs
└── package.json
```

---

## ✍️ Personnaliser

### Palette couleurs
Modifier les variables CSS dans `app/globals.css` :
- `--ivory` : fond principal
- `--ink` : texte principal & sections sombres
- `--terracotta` : accent chaud
- `--seafoam` : accent frais

### Photos
Les images sont définies dans l'objet `IMG` en haut de `app/page.jsx`. Pour les
remplacer par tes propres photos :
1. Les mettre dans `public/images/`
2. Remplacer les URLs par `/images/ma-photo.jpg`

**Recommandation forte** : fais faire un shoot pro de Dar Nejma. Tes photos
WhatsApp actuelles ne rendent pas justice au lieu.

### Textes
Tout est dans `app/page.jsx`, chaque section est un composant séparé
(`Hero`, `Manifesto`, `DarNejma`, etc.).

---

## 🛠️ Prochaines améliorations possibles

- [ ] Page détaillée `/dar-nejma` avec galerie complète
- [ ] Blog `/blog` (articles MDX ou CMS headless type Sanity)
- [ ] Formulaire de contact avec envoi email (Resend, 100 emails/jour gratuits)
- [ ] Multilingue FR / EN (next-intl)
- [ ] Channel manager (Smoobu ~15€/mois) pour réservations directes sans commission

---

Construit avec soin, face à l'océan. 🌊
