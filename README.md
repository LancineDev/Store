# SportZone Pro - E-commerce Sportif Premium

Application e-commerce moderne pour la vente d'équipements sportifs professionnels, construite avec Next.js 15, React 19, et Tailwind CSS v4.

## Fonctionnalités

### Pages

- **Accueil** (`/`) - Hero animé, produits vedettes, catégories, statistiques, avantages
- **Boutique** (`/shop`) - Catalogue complet avec filtres avancés (prix, catégorie, recherche, tri)
- **Détail produit** (`/product/[id]`) - Galerie d'images, sélecteur de taille/couleur, avis, produits similaires
- **Panier** (`/cart`) - Gestion du panier, codes promo, récapitulatif
- **Checkout** (`/checkout`) - Processus de commande en 3 étapes (infos, livraison, paiement)
- **Liste de souhaits** (`/wishlist`) - Produits favoris sauvegardés
- **Compte** (`/account`) - Profil utilisateur, historique des commandes, paramètres
- **Contact** (`/contact`) - Formulaire de contact, FAQ, informations de contact
- **À propos** (`/about`) - Histoire de l'entreprise, équipe, valeurs

### API Routes

- `GET /api/products` - Liste des produits avec filtres et pagination
- `GET /api/products/[id]` - Détails d'un produit
- `POST /api/orders` - Création de commande
- `POST /api/contact` - Envoi de message de contact
- `POST /api/newsletter` - Inscription à la newsletter

### Caractéristiques techniques

- **State Management** - Context API pour le panier et la liste de souhaits
- **Persistance locale** - localStorage pour sauvegarder panier et favoris
- **Animations** - Framer Motion pour des transitions fluides
- **Design System** - Thème sombre avec accents dorés, effets glassmorphism
- **Responsive** - Adapté mobile, tablette et desktop
- **SEO** - Métadonnées optimisées

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd sportzone-pro

# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev
```

## Structure du projet

```
├── app/
│   ├── api/              # API Routes
│   │   ├── contact/
│   │   ├── newsletter/
│   │   ├── orders/
│   │   └── products/
│   ├── about/            # Page À propos
│   ├── account/          # Page Compte utilisateur
│   ├── cart/             # Page Panier
│   ├── checkout/         # Page Checkout
│   ├── contact/          # Page Contact
│   ├── product/[id]/     # Page Détail produit
│   ├── shop/             # Page Boutique
│   ├── wishlist/         # Page Liste de souhaits
│   ├── globals.css       # Styles globaux + animations
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── categories-section.tsx
│   ├── features-section.tsx
│   ├── footer.tsx
│   ├── header.tsx
│   ├── hero.tsx
│   ├── product-card.tsx
│   ├── products-section.tsx
│   └── stats-section.tsx
├── contexts/
│   ├── cart-context.tsx     # Gestion du panier
│   └── wishlist-context.tsx # Gestion des favoris
├── hooks/
│   └── use-animations.ts    # Hooks d'animation
├── lib/
│   ├── products.ts          # Données des produits
│   └── utils.ts             # Utilitaires
└── public/                  # Assets statiques
```

## Technologies utilisées

- **Framework** - Next.js 15 (App Router)
- **UI** - React 19, Tailwind CSS v4, shadcn/ui
- **Animations** - Framer Motion
- **Icons** - Lucide React
- **Fonts** - Inter, Poppins (Google Fonts)

## Codes promo de test

- `SPORT20` - 20% de réduction
- `WELCOME10` - 10% de réduction

## Prochaines étapes (avec base de données)

Pour ajouter une base de données Supabase :

1. Créer un projet Supabase
2. Configurer les tables (users, products, orders, etc.)
3. Ajouter l'authentification Supabase Auth
4. Remplacer le stockage localStorage par Supabase
5. Implémenter les Row Level Security (RLS) policies

## Production checklist

Follow these steps before deploying to production:

- **Set environment variables**: ensure `AUTH_SECRET` or `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, and `DATABASE_URL` are set. See `.env.example`.
- **Remove dev shortcuts**: confirm no dev-only bypasses remain (admin APIs, fallback secrets).
- **Provision a production database**: create Postgres/MySQL and set `DATABASE_URL`.
- **Run Prisma migrations**: `npx prisma migrate deploy` (or `prisma migrate deploy` in CI).
- **Create a secure admin account**: locally run `node scripts/create_admin.js your-admin@example.com StrongPass123!` and keep credentials secure.
- **Audit dependencies**: run `pnpm audit` / `npm audit` and update/pin vulnerable packages.
- **Build and smoke test**:

```bash
pnpm install
pnpm build
NODE_ENV=production pnpm start
```

- **Set up CI/CD**: run builds and migrations in CI, store secrets in your provider (Vercel, Netlify, Fly.io, etc.).

## Docker deployment

1. Create `.env.local` from `.env.example` and fill in production values.
2. Start the app stack:

```bash
docker compose up -d --build
```

3. Open the site at `http://localhost:3000`.
4. Stop the stack when done:

```bash
docker compose down
```

> The compose setup includes `db` (Postgres), `redis` and `web` services. The web service reads values from `.env.local` and uses `npm start` to run the built Next.js app.
- **Enable HTTPS and HSTS** on your domain and configure CORS and CSP headers.
- **Add monitoring & error reporting** (Sentry, Datadog) and set up alerts.
- **Configure backups** for your database and uploaded assets.

If you want, I can continue and: add a `.github/workflows/ci.yml` skeleton, remove the dev fallback in `lib/auth-secret.ts` (done), and scaffold deploy instructions for Vercel or Fly.io. Tell me which provider you plan to use.
 
## Provisioning a production-like database (local)

You can provision a local Postgres instance using Docker Compose and run Prisma migrations and seed data.

1. Start Postgres with Docker Compose:

```bash
docker compose up -d
```

2. Set the `DATABASE_URL` environment variable (example):

```bash
export DATABASE_URL="postgresql://sportzone:sportzonepass@localhost:5432/sportzone"
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://sportzone:sportzonepass@localhost:5432/sportzone"
```

3. Run Prisma migrate and seed:

```bash
npx prisma migrate deploy
node prisma/seed.js # or `ts-node prisma/seed.ts` if TypeScript installed
```

The repository includes `docker-compose.yml` and a CI workflow at `.github/workflows/ci.yml` that runs migrations and builds on push.

## Licence

MIT
