"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MinimalHero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <section className="bg-background md:hidden border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            aria-label="Rechercher des produits"
            placeholder="Rechercher des produits, ex: chaussures running"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 h-10"
          />
          <Button type="submit" className="h-10 px-4">
            Rechercher
          </Button>
        </form>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          <a href="/shop" className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            Tout voir
          </a>
          <a href="/shop?filter=new" className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            Nouveautés
          </a>
          <a href="/shop?filter=sale" className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            Promotions
          </a>
        </div>
      </div>
    </section>
  );
}
