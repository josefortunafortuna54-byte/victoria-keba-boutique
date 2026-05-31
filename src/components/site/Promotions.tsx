import { products, formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import lookbook from "@/assets/lookbook-2.jpg";

export function Promotions() {
  const promos = products.filter((p) => p.tag === "Promoção");
  const { add } = useCart();
  return (
    <section id="promocoes" className="py-20 lg:py-28 bg-primary text-primary-foreground">
      <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative">
          <img src={lookbook} alt="Coleção em promoção" loading="lazy" width={1200} height={1500} className="w-full h-[500px] object-cover" />
          <div className="absolute -bottom-6 -right-6 hidden md:flex h-32 w-32 rounded-full bg-accent text-accent-foreground items-center justify-center text-center font-display text-xl leading-tight rotate-[-12deg] shadow-luxe">
            até<br />-30%
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3 text-primary-foreground/60">Edição limitada</p>
          <h2 className="text-4xl md:text-5xl">Promoções exclusivas</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Peças selecionadas com até 30% de desconto. Quantidades limitadas — quando acaba, acabou.
          </p>
          <div className="mt-10 space-y-5">
            {promos.map((p) => (
              <div key={p.id} className="flex items-center gap-5 border-b border-primary-foreground/10 pb-5">
                <img src={p.image} alt={p.name} loading="lazy" width={120} height={150} className="h-24 w-20 object-cover" />
                <div className="flex-1">
                  <p className="font-display text-xl">{p.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm line-through opacity-60">{formatPrice(p.oldPrice!)}</span>
                    <span className="font-display text-lg text-accent">{formatPrice(p.price)}</span>
                  </div>
                </div>
                <Button onClick={() => add(p)} variant="secondary" className="rounded-none h-10 px-5 text-xs uppercase tracking-[0.18em]">
                  Comprar <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
