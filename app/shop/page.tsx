"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  LayoutList,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/lib/products";
import { categories, formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "popular", label: "Populaire" },
  { value: "newest", label: "Plus récent" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Meilleures notes" },
];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [showOnlySale, setShowOnlySale] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const filterParam = searchParams.get("filter");

    setSearchQuery(searchParam ?? "");
    setShowOnlySale(filterParam === "sale");
    setSortBy(filterParam === "new" ? "newest" : "popular");

    const hasMatchingCategory = categoryParam
      ? categories.some((category) => category.slug === categoryParam)
      : false;

    setActiveCategory(hasMatchingCategory ? categoryParam! : "all");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      const categoryName = categories.find((c) => c.slug === activeCategory)?.name;
      if (categoryName) {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === categoryName.toLowerCase()
        );
      }
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Verified filter
    if (showOnlyVerified) {
      filtered = filtered.filter((p) => p.supplier.verified);
    }

    // Sale filter
    if (showOnlySale) {
      filtered = filtered.filter((p) => p.oldPrice !== null);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered = filtered.reverse();
        break;
      case "price-asc":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [
    products,
    searchQuery,
    activeCategory,
    priceRange,
    sortBy,
    showOnlyVerified,
    showOnlySale,
  ]);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Notre <span className="gradient-text">Boutique</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explorez notre collection complète d&apos;équipements sportifs premium
            </p>
          </motion.div>

          {/* Search and filters bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border h-12 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                suppressHydrationWarning
                className="h-12 px-4 pr-10 rounded-lg bg-background border border-border text-foreground appearance-none cursor-pointer min-w-[180px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* View mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                className="h-12 w-12"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                className="h-12 w-12"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="w-5 h-5" />
              </Button>
            </div>

            {/* Filter toggle */}
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtres
            </Button>
          </motion.div>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((category) => (
              <motion.button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                suppressHydrationWarning
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>

          <div className="flex gap-8">
            {/* Filters sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 280 }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  className="hidden lg:block shrink-0"
                >
                  <div className="sticky top-32 p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold">Filtres</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Price range */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium mb-4">Prix</h4>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={50000}
                        step={1000}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>

                    {/* Quick filters */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Filtres rapides</h4>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="verified"
                          checked={showOnlyVerified}
                          onCheckedChange={(checked) =>
                            setShowOnlyVerified(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="verified"
                          className="text-sm cursor-pointer"
                        >
                          Vendeurs vérifiés
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="sale"
                          checked={showOnlySale}
                          onCheckedChange={(checked) =>
                            setShowOnlySale(checked as boolean)
                          }
                        />
                        <label htmlFor="sale" className="text-sm cursor-pointer">
                          En promotion
                        </label>
                      </div>
                    </div>

                    {/* Reset filters */}
                    <Button
                      variant="outline"
                      className="w-full mt-8"
                      onClick={() => {
                        setActiveCategory("all");
                        setPriceRange([0, 50000]);
                        setShowOnlyVerified(false);
                        setShowOnlySale(false);
                        setSearchQuery("");
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products grid */}
            <div className="flex-1">
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-6">
                {filteredProducts.length} produit
                {filteredProducts.length > 1 ? "s" : ""} trouvé
                {filteredProducts.length > 1 ? "s" : ""}
              </p>

              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos filtres ou votre recherche
                  </p>
                  <Button
                    onClick={() => {
                      setActiveCategory("all");
                      setPriceRange([0, 50000]);
                      setShowOnlyVerified(false);
                      setShowOnlySale(false);
                      setSearchQuery("");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              ) : (
                <div
                  className={cn(
                    "grid gap-6",
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <ShopPageContent />
    </Suspense>
  );
}
