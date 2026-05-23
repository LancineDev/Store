"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "@/hooks/use-animations";

const categoryImages = [
  {
    name: "Chaussures",
    slug: "chaussures",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    count: "120+ produits",
  },
  {
    name: "Fitness",
    slug: "fitness",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
    count: "85+ produits",
  },
  {
    name: "Vêtements",
    slug: "vetements",
    image: "https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600&q=80",
    count: "200+ produits",
  },
  {
    name: "Accessoires",
    slug: "accessoires",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80",
    count: "150+ produits",
  },
  {
    name: "Basketball",
    slug: "basketball",
    image: "/category-basketball.jpg",
    count: "45+ produits",
  },
  {
    name: "Tennis",
    slug: "tennis",
    image: "https://images.unsplash.com/photo-1617883861744-13b534e3b928?w=600&q=80",
    count: "38+ produits",
  },
];

export function CategoriesSection() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section ref={ref} id="categories" className="py-14 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Catégories</h2>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {categoryImages.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/shop?category=${category.slug}`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative aspect-[5/4] sm:aspect-[4/3] rounded-xl overflow-hidden card-glow"
                >
                  {/* Background image */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />

                  {/* Content */}
                  <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-0.5 truncate">
                          {category.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          {category.count}
                        </p>
                      </div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover border effect */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-colors duration-300" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
