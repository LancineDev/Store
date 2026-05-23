"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, ShoppingBag, MapPin, Phone, Mail } from "lucide-react";
import { formatPrice } from "@/lib/products";

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
  },
  processing: {
    label: 'En traitement',
    icon: Package,
    color: 'bg-blue-500',
  },
  shipped: {
    label: 'Expédiée',
    icon: Truck,
    color: 'bg-orange-500',
  },
  delivered: {
    label: 'Livrée',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  cancelled: {
    label: 'Annulée',
    icon: XCircle,
    color: 'bg-red-500',
  }
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        // Filter orders by user's email
        const userOrders = data.orders.filter((order: Order) => 
          order.customer.email === session.user.email
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadOrders().finally(() => setLoading(false));
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, session, loadOrders]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4 container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement…</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4 container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mon compte</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gérez vos commandes et informations personnelles
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Commandes totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Commandes livrées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Commandes en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mes commandes</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement de vos commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore passé de commande.
                  </p>
                  <Link href="/shop">
                    <Button>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Commencer mes achats
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`${statusConfig[order.status].color} text-white border-0`}>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const StatusIcon = statusConfig[order.status].icon
                              return <StatusIcon className="w-3 h-3" />
                            })()}
                            {statusConfig[order.status].label}
                          </div>
                        </Badge>
                        <Link href={`/suivre-commande?order=${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Suivre
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Adresse de livraison
                        </h4>
                        <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                          <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                          <p>{order.customer.address}</p>
                          <p>{order.customer.city}, {order.customer.postalCode}</p>
                          <p>{order.customer.country}</p>
                          <p className="flex items-center gap-1 mt-2">
                            <Phone className="w-3 h-3" />
                            {order.customer.phone}
                          </p>
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {order.customer.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Détails de la commande</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Articles ({order.items.length})</span>
                            <span>{formatPrice(order.total - order.shipping)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Livraison</span>
                            <span>{formatPrice(order.shipping)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Articles commandés</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="bg-secondary/30 rounded-lg px-3 py-2 text-sm">
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-muted-foreground ml-1">
                              (x{item.quantity})
                              {item.size && ` - ${item.size}`}
                              {item.color && ` - ${item.color}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Connecté en tant que</p>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full">
                    Administration
                  </Button>
                </Link>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20 px-4 container mx-auto max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Mon compte</h1>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-center">
          <p className="text-muted-foreground">Vous n&apos;êtes pas connecté.</p>
          <Link href="/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
