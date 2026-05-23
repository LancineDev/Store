export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  badge: string | null;
  badge_type: "new" | "sale" | null;
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  supplier: {
    name: string;
    verified: boolean;
    rating: number;
  };
  inStock: boolean;
}

export const categories = [
  { name: "Tous", slug: "all", icon: "Grid3X3" },
  { name: "Chaussures", slug: "chaussures", icon: "Footprints" },
  { name: "Vêtements", slug: "vetements", icon: "Shirt" },
  { name: "Fitness", slug: "fitness", icon: "Dumbbell" },
  { name: "Basketball", slug: "basketball", icon: "Target" },
  { name: "Accessoires", slug: "accessoires", icon: "Watch" },
  { name: "Yoga", slug: "yoga", icon: "Heart" },
  { name: "Tennis", slug: "tennis", icon: "Circle" },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(price);
}
