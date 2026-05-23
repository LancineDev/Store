import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Product } from "@/lib/products";
import {
  getProducts,
  saveProducts,
  nextProductId,
} from "@/lib/product-store";

function requireAdmin() {
  return auth().then((s) => s?.user?.role === "admin");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  return NextResponse.json({ products: getProducts() });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<Product>;
    const list = getProducts();
    const id = nextProductId(list);

    const product: Product = {
      id,
      name: String(body.name ?? "Produit"),
      category: String(body.category ?? "Accessoires"),
      price: Number(body.price) || 0,
      oldPrice:
        body.oldPrice === null || body.oldPrice === undefined
          ? null
          : Number(body.oldPrice),
      image: String(body.image ?? "/placeholder.jpg"),
      images: Array.isArray(body.images) ? body.images : [String(body.image ?? "/placeholder.jpg")],
      badge: body.badge ?? null,
      badge_type: body.badge_type === "sale" || body.badge_type === "new" ? body.badge_type : null,
      rating: Number(body.rating) || 0,
      reviews: Number(body.reviews) || 0,
      description: String(body.description ?? ""),
      sizes: Array.isArray(body.sizes) ? body.sizes : ["Unique"],
      colors: Array.isArray(body.colors) ? body.colors : [{ name: "Standard", hex: "#888888" }],
      supplier: body.supplier ?? {
        name: "SportZone",
        verified: true,
        rating: 4.5,
      },
      inStock: body.inStock !== false,
    };

    list.push(product);
    saveProducts(list);
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}
