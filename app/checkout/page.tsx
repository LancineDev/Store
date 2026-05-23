"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getCartItemKey, useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/products'
import { useSession } from 'next-auth/react'

const paymentMethods = [
  { id: 'card', name: 'Carte bancaire', icon: CreditCard, description: 'Visa, Mastercard, etc.' },
  { id: 'mobile', name: 'Mobile Money', icon: Phone, description: 'Orange Money, MTN, Wave' },
  { id: 'cash', name: 'Paiement à la livraison', icon: Truck, description: 'Payez en espèces' },
]

const deliveryOptions = [
  { id: 'standard', name: 'Livraison standard', price: 3500, delay: '3-5 jours' },
  { id: 'express', name: 'Livraison express', price: 7000, delay: '1-2 jours' },
  { id: 'pickup', name: 'Retrait en magasin', price: 0, delay: 'Disponible sous 24h' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, isLoaded } = useCart()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sénégal',
    paymentMethod: 'card',
    deliveryOption: 'standard',
  })

  // Pre-fill form data when user is logged in
  useEffect(() => {
    if (session?.user) {
      // Try to extract name parts
      const nameParts = session.user.name?.split(' ') || []
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: session.user.email || '',
        // Keep other fields as they might be filled by user
      }))
    }
  }, [session])

  const selectedDelivery = deliveryOptions.find(d => d.id === formData.deliveryOption)
  const shippingCost = selectedDelivery?.price || 0
  const finalTotal = totalPrice + shippingCost

  useEffect(() => {
    if (isLoaded && items.length === 0 && !orderComplete) {
      router.replace('/cart')
    }
  }, [isLoaded, items.length, orderComplete, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsProcessing(true)
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create order via API
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: finalTotal,
          shipping: shippingCost,
          customer: formData,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrderNumber(data.order.id)
        setOrderComplete(true)
        clearCart()
      }
    } catch (error) {
      console.error('Order failed:', error)
    }
    
    setIsProcessing(false)
  }

  if (!isLoaded || (items.length === 0 && !orderComplete)) {
    return null
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4">Commande confirmée !</h1>
              <p className="text-muted-foreground mb-8">
                Merci pour votre commande. Vous recevrez un email de confirmation avec les détails de livraison.
              </p>
              <p className="text-lg font-semibold text-primary mb-8">
                Numero de commande: #{orderNumber}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/suivre-commande?order=${orderNumber}`}>
                  <Button size="lg" variant="outline">
                    Suivre ma commande
                  </Button>
                </Link>
                {session?.user && (
                  <Link href="/account">
                    <Button size="lg" variant="outline">
                      Voir mes commandes
                    </Button>
                  </Link>
                )}
                <Link href="/shop">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Continuer mes achats
                  </Button>
                </Link>
              </div>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/cart" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au panier
            </Link>
            <h1 className="text-4xl font-bold">Finaliser la commande</h1>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-20 md:w-32 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-secondary'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Steps */}
              <div className="lg:col-span-2">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <User className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-bold">Informations personnelles</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Delivery */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Adresse de livraison</h2>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">Adresse</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">Ville</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Code postal</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Pays</Label>
                            <Input
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Truck className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Mode de livraison</h2>
                      </div>
                      <RadioGroup
                        value={formData.deliveryOption}
                        onValueChange={(value) => setFormData({ ...formData, deliveryOption: value })}
                        className="space-y-3"
                      >
                        {deliveryOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                              formData.deliveryOption === option.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setFormData({ ...formData, deliveryOption: option.id })}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <div>
                                <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                  {option.name}
                                </Label>
                                <p className="text-sm text-muted-foreground">{option.delay}</p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
                            </span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-bold">Mode de paiement</h2>
                    </div>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                            formData.paymentMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <method.icon className="w-6 h-6 text-primary" />
                          <div>
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    {formData.paymentMethod === 'card' && (
                      <div className="mt-6 pt-6 border-t border-border space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Numéro de carte</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Date d&apos;expiration</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/AA"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-6 p-3 bg-secondary/50 rounded-lg">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Vos informations de paiement sont sécurisées et chiffrées
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Précédent
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      'Traitement...'
                    ) : step < 3 ? (
                      'Continuer'
                    ) : (
                      `Payer ${formatPrice(finalTotal)}`
                    )}
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
                  <h2 className="text-xl font-bold mb-6">Votre commande</h2>
                  
                  <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
                    {items.map((item) => (
                      <div key={getCartItemKey(item)} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Taille: ${item.size}`}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-border pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>{shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
