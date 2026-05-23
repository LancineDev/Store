import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Product } from "@/lib/products";
import { getProducts, saveProducts } from "@/lib/product-store";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const pid = Number(id);
  if (Number.isNaN(pid)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Partial<Product>;
    const list = getProducts();
    const index = list.findIndex((p) => p.id === pid);
    if (index < 0) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const prev = list[index];
    const updated: Product = {
      ...prev,
      ...body,
      id: pid,
      price: body.price !== undefined ? Number(body.price) : prev.price,
      oldPrice:
        body.oldPrice === undefined
          ? prev.oldPrice
          : body.oldPrice === null
            ? null
            : Number(body.oldPrice),
      images: body.images ?? prev.images,
      sizes: body.sizes ?? prev.sizes,
      colors: body.colors ?? prev.colors,
      supplier: body.supplier ?? prev.supplier,
    };

    list[index] = updated;
    saveProducts(list);
    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const pid = Number(id);
  if (Number.isNaN(pid)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const current = getProducts();
  const list = current.filter((p) => p.id !== pid);
  if (list.length === current.length) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  saveProducts(list);
  return NextResponse.json({ ok: true });
}
