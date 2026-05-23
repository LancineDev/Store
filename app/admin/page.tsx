"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useSession } from "next-auth/react";
import {
  Trash2,
  Pencil,
  Plus,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  X,
  Eye,
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react";

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

const emptyForm = {
  name: "",
  category: "Accessoires",
  price: "",
  image: "",
  description: "",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setProducts(data.products ?? []);
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/orders", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders().finally(() => setLoading(false));
    } else {
      loadProducts().finally(() => setLoading(false));
    }
  }, [isAdmin, loadProducts, loadOrders]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      image: p.image,
      description: p.description,
    });
    setImagePreview(p.image);
    setSelectedFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setImagePreview(null);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return form.image;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Erreur lors du téléchargement de l\'image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Upload image if selected
    let imageUrl = form.image;
    if (selectedFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setSaving(false);
        return;
      }
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      image: imageUrl || "/placeholder.jpg",
      images: [imageUrl || "/placeholder.jpg"],
      description: form.description,
      oldPrice: null,
      badge: null,
      badge_type: null,
      rating: 4.5,
      reviews: 0,
      sizes: ["Unique"],
      colors: [{ name: "Standard", hex: "#888888" }],
      supplier: { name: "SportZone", verified: true, rating: 4.5 },
      inStock: true,
    };

    try {
      if (editingId !== null) {
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      }
      cancelEdit();
      await loadProducts();
    } catch {
      alert("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Erreur lors de la suppression du produit");
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await loadOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-28 pb-16 px-4 container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gérez vos commandes, produits et analysez les performances
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Voir la boutique
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Produits
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">{orders.length}</p>
                      <p className="text-sm text-muted-foreground">Total Commandes</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12%</span>
                    <span className="text-muted-foreground ml-1">ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
                      <p className="text-sm text-muted-foreground">En Attente</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">À traiter</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === 'shipped').length}</p>
                      <p className="text-sm text-muted-foreground">Expédiées</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">En livraison</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
                      <p className="text-sm text-muted-foreground">Livrées</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">Terminées</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Chargement des commandes...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune commande trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Commande #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer.firstName} {order.customer.lastName} • {order.items.length} article{order.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(order.total)}</p>
                          <Badge variant="secondary" className={`${statusConfig[order.status].color} text-white border-0 text-xs`}>
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setEditingId(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un Produit
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="#orders">
                      <Package className="w-4 h-4 mr-2" />
                      Voir Toutes les Commandes
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Résumé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produits actifs</span>
                    <span className="font-medium">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chiffre d'affaires total</span>
                    <span className="font-medium">{formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux de conversion</span>
                    <span className="font-medium">85%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gestion des Commandes
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Consultez et gérez toutes les commandes clients
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Chargement des commandes...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
                      <p>Les nouvelles commandes apparaîtront ici.</p>
                    </div>
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
                            <Select
                              value={order.status}
                              onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className={`w-32 ${statusConfig[order.status].color} text-white border-0`}>
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const StatusIcon = statusConfig[order.status].icon
                                    return <StatusIcon className="w-3 h-3" />
                                  })()}
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    En attente
                                  </div>
                                </SelectItem>
                                <SelectItem value="processing">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    En traitement
                                  </div>
                                </SelectItem>
                                <SelectItem value="shipped">
                                  <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Expédiée
                                  </div>
                                </SelectItem>
                                <SelectItem value="delivered">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Livrée
                                  </div>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Annulée
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Informations client
                              </h3>
                              <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                                <p className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{order.customer.firstName} {order.customer.lastName}</span>
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  {order.customer.email}
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  {order.customer.phone}
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  {order.customer.address}, {order.customer.city} {order.customer.postalCode}
                                </p>
                                <p className="text-sm text-muted-foreground ml-6">
                                  {order.customer.country}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Détails de la commande
                              </h3>
                              <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Articles:</span>
                                  <span className="font-medium">{order.items.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Sous-total:</span>
                                  <span className="font-medium">{formatPrice(order.total - order.shipping)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Livraison:</span>
                                  <span className="font-medium">{formatPrice(order.shipping)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                  <span className="font-semibold">Total:</span>
                                  <span className="font-bold text-lg text-primary">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Articles commandés
                            </h4>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                                        <Package className="w-5 h-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{item.product.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>Quantité: {item.quantity}</span>
                                          {item.size && (
                                            <>
                                              <span>•</span>
                                              <span>Taille: {item.size}</span>
                                            </>
                                          )}
                                          {item.color && (
                                            <>
                                              <span>•</span>
                                              <span className="flex items-center gap-1">
                                                Couleur: {item.color}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                                    <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} chacun</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingId ? (
                        <>
                          <Pencil className="w-5 h-5" /> Modifier le produit
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" /> Nouveau produit
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du produit</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          required
                          className="bg-secondary/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Catégorie</Label>
                          <Select value={form.category} onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}>
                            <SelectTrigger className="bg-secondary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vêtements">Vêtements</SelectItem>
                              <SelectItem value="Chaussures">Chaussures</SelectItem>
                              <SelectItem value="Accessoires">Accessoires</SelectItem>
                              <SelectItem value="Fitness">Fitness</SelectItem>
                              <SelectItem value="Basketball">Basketball</SelectItem>
                              <SelectItem value="Tennis">Tennis</SelectItem>
                              <SelectItem value="Yoga">Yoga</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Prix (XOF)</Label>
                          <Input
                            id="price"
                            type="number"
                            min={0}
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            required
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Image du produit</Label>
                        <div className="space-y-4">
                          {/* Image Preview */}
                          {imagePreview && (
                            <div className="relative inline-block">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="w-full h-32 object-cover rounded-lg border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-6 h-6"
                                onClick={() => {
                                  setImagePreview(null);
                                  setSelectedFile(null);
                                  setForm(f => ({ ...f, image: '' }));
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}

                          {/* File Upload */}
                          <div className="flex items-center gap-4">
                            <Input
                              id="image"
                              type="url"
                              value={form.image}
                              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                              placeholder="https://... ou /image.jpg"
                              className="bg-secondary/50 flex-1"
                            />
                            <div className="text-sm text-muted-foreground">ou</div>
                            <div className="relative">
                              <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button type="button" variant="outline" className="pointer-events-none">
                                <Upload className="w-4 h-4 mr-2" />
                                Choisir
                              </Button>
                            </div>
                          </div>

                          {selectedFile && (
                            <p className="text-sm text-muted-foreground">
                              Fichier sélectionné: {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                          }
                          rows={4}
                          className="bg-secondary/50"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={saving || uploading} className="flex-1">
                          {saving || uploading ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer le produit"}
                        </Button>
                        {editingId !== null && (
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            Annuler
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Products Table */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Catalogue des Produits
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {products.length} produit{products.length > 1 ? 's' : ''} dans le catalogue
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                              <th className="text-left p-4 font-medium">Produit</th>
                              <th className="text-left p-4 font-medium">Catégorie</th>
                              <th className="text-right p-4 font-medium">Prix</th>
                              <th className="text-right p-4 font-medium w-32">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                  Chargement…
                                </td>
                              </tr>
                            ) : products.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                  <p>Aucun produit dans le catalogue</p>
                                </td>
                              </tr>
                            ) : (
                              products.map((p) => (
                                <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-10 h-10 object-cover rounded-md border border-border"
                                      />
                                      <div>
                                        <p className="font-medium text-sm">{p.name}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <Badge variant="secondary" className="text-xs">
                                      {p.category}
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-right tabular-nums font-medium">
                                    {formatPrice(p.price)}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setViewingProduct(p)}
                                        aria-label="Voir"
                                        className="w-8 h-8"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => startEdit(p)}
                                        aria-label="Modifier"
                                        className="w-8 h-8"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive w-8 h-8"
                                        onClick={() => handleDelete(p.id)}
                                        aria-label="Supprimer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product View Modal */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du produit</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{viewingProduct.name}</h3>
                    <p className="text-muted-foreground">{viewingProduct.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(viewingProduct.price)}
                    </span>
                    {viewingProduct.oldPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(viewingProduct.oldPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⭐ {viewingProduct.rating} ({viewingProduct.reviews} avis)</span>
                    <span>•</span>
                    <span>{viewingProduct.inStock ? 'En stock' : 'Rupture de stock'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Description</h4>
                <p className="text-muted-foreground">{viewingProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Tailles disponibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.sizes.map((size) => (
                      <Badge key={size} variant="secondary">{size}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Couleurs disponibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.colors.map((color) => (
                      <div key={color.name} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-sm">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-2">Fournisseur</h4>
                <div className="flex items-center gap-2">
                  <span>{viewingProduct.supplier.name}</span>
                  {viewingProduct.supplier.verified && (
                    <Badge variant="secondary">Vérifié</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    ⭐ {viewingProduct.supplier.rating}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
