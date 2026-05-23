import { Header } from "@/components/header";
import MinimalHero from "@/components/minimal-hero";
import { ProductsSection } from "@/components/products-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <MinimalHero />
      <ProductsSection />
      <Footer />
    </main>
  );
}
