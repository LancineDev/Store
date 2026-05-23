"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, formatPrice } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const favorite = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0]?.name,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative"
    >
      <div className="relative rounded-2xl overflow-hidden card-pop transition-all duration-300">
        {/* Spotlight effect on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-50"
            style={{
              background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.1), transparent 40%)`,
            }}
          />
        )}

        {/* Image container */}
        <div className="relative aspect-square overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && "scale-110"
              )}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
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
            {product.supplier.verified && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="w-3 h-3" />
                Vérifié
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleWishlist(product)}
            suppressHydrationWarning
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center z-20 transition-colors"
            aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                favorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </motion.button>

          {/* Quick actions on hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2 z-20"
          >
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? "Ajouter" : "Indisponible"}
            </Button>
            <Link href={`/product/${product.id}`}>
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Product info */}
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.floor(product.rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="product-title md:font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-muted-foreground mt-1 mb-3">
            {product.category}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="price-compact md:text-lg md:font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Supplier info */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold">{product.supplier.name[0]}</span>
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {product.supplier.name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
