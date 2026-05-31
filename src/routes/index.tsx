import { createFileRoute } from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { ValueBar } from "@/components/site/ValueBar";
import { NewArrivals, BestSellers } from "@/components/site/Collections";
import { Catalog } from "@/components/site/Catalog";
import { Promotions } from "@/components/site/Promotions";
import { Reviews } from "@/components/site/Reviews";
import { Lookbook, Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Victoria Keba — Moda Elegante, Preços Inteligentes" },
      { name: "description", content: "Boutique premium de moda feminina. Luxo acessível em peças atemporais — vestidos, blusas, casacos e acessórios." },
      { property: "og:title", content: "Victoria Keba — Luxo acessível" },
      { property: "og:description", content: "Moda elegante, preços inteligentes. Seu estilo começa aqui." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Hero />
        <ValueBar />
        <NewArrivals />
        <Catalog />
        <BestSellers />
        <Lookbook />
        <Promotions />
        <Reviews />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </CartProvider>
  );
}
