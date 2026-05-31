import { where } from "firebase/firestore";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}

export function NewArrivals() {
  const { products, loading } = useProducts({
    constraints: [where("newArrival", "==", true)],
    localFilter: (p) => p.tag === "Novidade",
  });

  const items = products.slice(0, 4);

  return (
    <section id="novidades" className="py-20 lg:py-28 bg-secondary">
      <div className="container-luxe">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Novidades</p>
          <h2 className="text-4xl md:text-5xl text-primary">Acabou de chegar</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Peças recém-desembarcadas no atelier. Edições limitadas, atenção ao detalhe.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

export function BestSellers() {
  const { products, loading } = useProducts({
    constraints: [where("bestSeller", "==", true)],
    localFilter: (p) => p.tag === "Mais vendido",
  });

  return (
    <section id="mais-vendidos" className="py-20 lg:py-28">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3">Best Sellers</p>
            <h2 className="text-4xl md:text-5xl text-primary">Mais desejados</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            As favoritas das nossas clientes, mês após mês.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
