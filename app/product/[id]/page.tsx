"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  BadgeCheck,
  Minus,
  Plus,
  ChevronLeft,
  Share2,  Copy,} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: product?.name ?? "Produit Sport Zone",
      text: `Découvrez ce produit sur Sport Zone : ${product?.name}`,
      url: pageUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallback to clipboard if native share is canceled or unavailable
      }
    }

    if (pageUrl) {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!pageUrl) return;
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts ?? []);
          setSelectedSize(data.product.sizes[0] ?? null);
          setSelectedColor(data.product.colors[0]?.name ?? null);
          setSelectedImage(0);
        } else {
          setProduct(null);
          setRelatedProducts([]);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 container mx-auto px-4 text-center text-muted-foreground">
          Chargement…
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Link href="/shop">
            <Button>Retour à la boutique</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      product,
      quantity,
      size: selectedSize ?? product.sizes[0],
      color: selectedColor ?? product.colors[0]?.name,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary transition-colors">
              Boutique
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.nav>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/shop">
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
          </motion.div>

          {/* Product section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-10 mb-20 items-start">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main image */}
              <div className="rounded-[28px] overflow-hidden bg-card shadow-2xl mb-5 relative">
                <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badge_type === "new" && (
                    <Badge className="bg-primary text-primary-foreground">
                      Nouveau
                    </Badge>
                  )}
                  {product.badge_type === "sale" && discount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Share button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={handleShare}
                  disabled={!pageUrl}
                  aria-label="Partager le produit"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Thumbnail images */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    suppressHydrationWarning
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Product info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Supplier */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {product.supplier.name[0]}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.supplier.name}
                </span>
                {product.supplier.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Vérifié
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={!pageUrl}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
                <Link
                  target="_blank"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Découvrez ce produit sur Sport Zone : ${product.name} - ${pageUrl}`
                  )}`}
                >
                  <Button variant="secondary" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleCopyLink} className="gap-2">
                  <Copy className="w-4 h-4" />
                  {copied ? "Lien copié" : "Copier le lien"}
                </Button>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} avis)
                </span>
              </div>

              {/* Price */}
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm mb-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                      Prix
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  {product.oldPrice && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      Économisez {formatPrice(product.oldPrice - product.price)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8">{product.description}</p>

              {/* Size selector */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Taille</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      suppressHydrationWarning
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">Couleur</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.name)}
                      suppressHydrationWarning
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        selectedColor === color.name
                          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">Quantité</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.inStock ? "En stock" : "Rupture de stock"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] mb-8">
                <Button
                  size="lg"
                  className={cn(
                    "w-full gap-2 transition-all",
                    addedToCart
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addedToCart ? "Ajouté au panier !" : "Ajouter au panier"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      isInWishlist(product.id) && "fill-destructive text-destructive"
                    )}
                  />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-3xl bg-secondary/50">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Livraison Express</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Paiement Sécurisé</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Retour 30 Jours</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Spécifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Avis ({product.reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground">{product.description}</p>
                  <p className="text-muted-foreground mt-4">
                    Ce produit de haute qualité est conçu pour répondre aux besoins des
                    athlètes les plus exigeants. Fabriqué avec des matériaux premium,
                    il offre un confort exceptionnel et une durabilité à toute épreuve.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Catégorie</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Fournisseur</span>
                    <p className="font-medium">{product.supplier.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Tailles disponibles</span>
                    <p className="font-medium">{product.sizes.join(", ")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Couleurs</span>
                    <p className="font-medium">
                      {product.colors.map((c) => c.name).join(", ")}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6">
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-xl bg-card">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <span className="font-bold">U{i}</span>
                        </div>
                        <div>
                          <p className="font-medium">Utilisateur {i}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className="w-3 h-3 fill-primary text-primary"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Excellent produit ! La qualité est au rendez-vous et la livraison
                        était rapide. Je recommande vivement.
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-8">Produits Similaires</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
