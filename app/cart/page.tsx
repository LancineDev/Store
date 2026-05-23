"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag, Truck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getCartItemKey, useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/products'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart, isLoaded } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const shippingCost = totalPrice > 50000 ? 0 : 3500
  const finalTotal = totalPrice - discount + shippingCost

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SPORT20') {
      setDiscount(totalPrice * 0.2)
    } else if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount(totalPrice * 0.1)
    } else {
      setDiscount(0)
    }
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
                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                Découvrez notre collection d&apos;équipements sportifs premium et ajoutez vos articles préférés au panier.
              </p>
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Continuer mes achats
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
            className="mb-8"
          >
            <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Link>
            <h1 className="text-4xl font-bold">Votre Panier</h1>
            <p className="text-muted-foreground mt-2">{items.length} article(s) dans votre panier</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={getCartItemKey(item)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-4 md:p-6"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Link 
                              href={`/product/${item.product.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{item.product.supplier.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(getCartItemKey(item))}
                            className="text-muted-foreground hover:text-destructive -mt-1 -mr-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Variants */}
                        <div className="flex gap-4 mt-2 text-sm">
                          {item.size && (
                            <span className="text-muted-foreground">
                              Taille: <span className="text-foreground">{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span className="text-muted-foreground">
                              Couleur: <span className="text-foreground">{item.color}</span>
                            </span>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(getCartItemKey(item), item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(getCartItemKey(item), item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.product.price)} / unite
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le panier
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 sticky top-32"
              >
                <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Code promo</label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Entrez votre code"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={applyPromoCode}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-500 mt-2">
                      Code applique ! -{formatPrice(discount)}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Reduction</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
                  </div>
                  {totalPrice < 50000 && (
                    <p className="text-xs text-muted-foreground">
                      Livraison gratuite à partir de 50 000 FCFA
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout">
                  <Button size="lg" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                    Passer la commande
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Livraison rapide</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
