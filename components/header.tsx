"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useScrollDirection } from "@/hooks/use-animations";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Boutique", href: "/shop" },
  { name: "Catégories", href: "#categories", hasDropdown: true },
  { name: "Nouveautés", href: "/shop?filter=new" },
  { name: "Promotions", href: "/shop?filter=sale" },
];

const categories = [
  { name: "Chaussures", href: "/shop?category=chaussures" },
  { name: "Vêtements", href: "/shop?category=vetements" },
  { name: "Fitness", href: "/shop?category=fitness" },
  { name: "Basketball", href: "/shop?category=basketball" },
  { name: "Accessoires", href: "/shop?category=accessoires" },
];

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();
  const { totalItems } = useCart();
  const { items } = useWishlist();
  const { data: session, status: sessionStatus } = useSession();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setSearchOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{
          y: scrollDirection === "down" && !isAtTop ? -100 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isAtTop ? "bg-transparent" : "glass"
        )}
      >
        {/* Top bar */}
        <div className="hidden md:block border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
              <p>Livraison gratuite à partir de 50 000 FCFA</p>
              <div className="flex items-center gap-4">
                <Link href="/track" className="hover:text-primary transition-colors">
                  Suivre ma commande
                </Link>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-lg font-bold text-foreground hidden sm:block">
                  Sport<span className="text-primary">Zone</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setCategoriesOpen(true)}
                  onMouseLeave={() => link.hasDropdown && setCategoriesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Link>

                  {/* Dropdown for categories */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {categoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-48 py-2 glass rounded-lg shadow-xl"
                        >
                          {categories.map((cat) => (
                            <Link
                              key={cat.name}
                              href={cat.href}
                              className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        className="h-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>

              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex relative text-muted-foreground hover:text-foreground"
                >
                  <Heart className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Button>
              </Link>

              {sessionStatus === "authenticated" && session?.user ? (
                <>
                  {session.user.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden md:inline-flex gap-1 text-primary"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/account">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex text-muted-foreground hover:text-foreground"
                      title={session.user.email ?? "Compte"}
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-muted-foreground hover:text-foreground"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Inscription</Button>
                  </Link>
                </div>
              )}

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-card z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <nav className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center gap-4">
                  <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </Link>
                  {sessionStatus === "authenticated" && session?.user ? (
                    <>
                      {session.user.role === "admin" && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Shield className="w-4 h-4" />
                            Admin
                          </Button>
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="icon">
                          <User className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Connexion
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Inscription</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
