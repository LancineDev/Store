"use client";

import { motion } from "framer-motion";
import { Users, Package, Star, Award } from "lucide-react";
import { useInView, useCountUp } from "@/hooks/use-animations";

const stats = [
  {
    icon: Users,
    value: 15000,
    suffix: "+",
    label: "Clients Satisfaits",
  },
  {
    icon: Package,
    value: 500,
    suffix: "+",
    label: "Produits Premium",
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "",
    decimal: true,
    label: "Note Moyenne",
  },
  {
    icon: Award,
    value: 50,
    suffix: "+",
    label: "Marques Partenaires",
  },
];

function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
  decimal,
  isInView,
  delay,
}: {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  decimal?: boolean;
  isInView: boolean;
  delay: number;
}) {
  const count = useCountUp(decimal ? value * 10 : value, 2000, isInView);
  const displayValue = decimal ? (count / 10).toFixed(1) : count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
      >
        <Icon className="w-8 h-8 text-primary" />
      </motion.div>
      <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        {displayValue}
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function StatsSection() {
  const { ref, isInView } = useInView(0.3);

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Chiffres clés</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              {...stat}
              isInView={isInView}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
