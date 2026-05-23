"use client";

import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones, CreditCard, Award } from "lucide-react";
import { useInView } from "@/hooks/use-animations";

const features = [
  {
    icon: Truck,
    title: "Livraison Express",
    description: "Livraison gratuite à partir de 50 000 FCFA. Expédition sous 24h.",
  },
  {
    icon: Shield,
    title: "Paiement Sécurisé",
    description: "Transactions 100% sécurisées avec cryptage SSL.",
  },
  {
    icon: RotateCcw,
    title: "Retour Gratuit",
    description: "30 jours pour changer d&apos;avis. Remboursement garanti.",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Une équipe dédiée pour répondre à vos questions.",
  },
  {
    icon: CreditCard,
    title: "Paiement Flexible",
    description: "Payez en plusieurs fois sans frais.",
  },
  {
    icon: Award,
    title: "Qualité Certifiée",
    description: "Produits authentiques et garantis.",
  },
];

export function FeaturesSection() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section ref={ref} className="py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
          {features.map((feature, index) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-2">
              <div className="w-10 h-10 mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xs font-medium">{feature.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
