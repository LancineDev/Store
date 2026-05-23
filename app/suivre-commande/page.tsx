"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatPrice } from '@/lib/products'

interface Order {
  id: string
  items: Array<{
    product: { id: string; name: string; price: number }
    quantity: number
    size?: string
    color?: string
  }>
  total: number
  shipping: number
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
    paymentMethod: string
    deliveryOption: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-500',
    description: 'Votre commande est en cours de traitement.'
  },
  processing: {
    label: 'En traitement',
    icon: Package,
    color: 'bg-blue-500',
    description: 'Votre commande est en cours de préparation.'
  },
  shipped: {
    label: 'Expédiée',
    icon: Truck,
    color: 'bg-orange-500',
    description: 'Votre commande a été expédiée et est en route.'
  },
  delivered: {
    label: 'Livrée',
    icon: CheckCircle,
    color: 'bg-green-500',
    description: 'Votre commande a été livrée avec succès.'
  },
  cancelled: {
    label: 'Annulée',
    icon: XCircle,
    color: 'bg-red-500',
    description: 'Votre commande a été annulée.'
  }
}

function TrackOrderPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const orderParam = searchParams.get('order')
    if (orderParam) {
      setOrderId(orderParam)
      // Auto-track if order parameter is provided
      trackOrder(orderParam)
    }
  }, [searchParams])

  const trackOrder = async (id?: string) => {
    const orderToTrack = id || orderId
    if (!orderToTrack.trim()) {
      setError('Veuillez entrer un numéro de commande.')
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await fetch(`/api/orders/${orderToTrack}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        setError('Commande non trouvée. Vérifiez le numéro de commande.')
      }
    } catch (err) {
      setError('Erreur lors de la recherche de la commande.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trackOrder()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Suivre ma commande</h1>
              <p className="text-lg text-muted-foreground">
                Entrez votre numéro de commande pour suivre l'état de votre livraison
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recherche de commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderId">Numéro de commande</Label>
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Ex: SPZ12345678"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Recherche...' : 'Suivre'}
                    </Button>
                  </div>
                </form>
                {error && (
                  <p className="text-red-500 mt-4">{error}</p>
                )}
              </CardContent>
            </Card>

            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Commande #{order.id}</span>
                      <Badge variant="secondary" className={`${statusConfig[order.status].color} text-white`}>
                        {statusConfig[order.status].label}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Statut de la commande</h3>
                        <div className="flex items-center gap-3 mb-2">
                          {(() => {
                            const StatusIcon = statusConfig[order.status].icon
                            return <StatusIcon className="w-5 h-5" />
                          })()}
                          <span>{statusConfig[order.status].description}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Commande passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Informations de livraison</h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>Client:</strong> {order.customer.firstName} {order.customer.lastName}</p>
                          <p><strong>Email:</strong> {order.customer.email}</p>
                          <p><strong>Téléphone:</strong> {order.customer.phone}</p>
                          <p><strong>Adresse:</strong> {order.customer.address}, {order.customer.city} {order.customer.postalCode}</p>
                          <p><strong>Pays:</strong> {order.customer.country}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Articles commandés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity}
                              {item.size && ` | Taille: ${item.size}`}
                              {item.color && ` | Couleur: ${item.color}`}
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span>Sous-total:</span>
                        <span>{formatPrice(order.total - order.shipping)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Livraison:</span>
                        <span>{formatPrice(order.shipping)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">+221 33 123 45 67</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">support@sportzonepro.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">123 Avenue de la République, Dakar</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderPage />
    </Suspense>
  )
}