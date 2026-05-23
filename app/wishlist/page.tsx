"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useWishlist } from '@/contexts/wishlist-context'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/products'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, isLoaded } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = (product: typeof items[0]) => {
    addItem({
      product,
      quantity: 1,
      size: product.sizes?.[0],
      color: product.colors?.[0]?.name,
    })
    removeItem(product.id)
  }

  if (!isLoaded) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center mb-8">
                <Heart className="w-16 h-16 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Votre liste de souhaits est vide</h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                Parcourez notre collection et ajoutez vos articles préférés à votre liste de souhaits.
              </p>
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Découvrir les produits
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold">Ma Liste de Souhaits</h1>
              <p className="text-muted-foreground mt-2">{items.length} article(s) sauvegardé(s)</p>
            </div>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-muted-foreground hover:text-destructive self-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vider la liste
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden card-glow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-secondary overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.badge && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.badge === 'Nouveau' ? 'bg-green-500 text-white' :
                          product.badge === 'Promo' ? 'bg-red-500 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(product.id)}
                      className="absolute top-3 right-3 bg-background/80 hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-primary font-medium mb-1">{product.supplier.name}</p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <Button
                      className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
