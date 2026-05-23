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

## Licence

MIT
