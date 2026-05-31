import { useState } from "react";
import { where } from "firebase/firestore";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["Todos", "Vestidos", "Blusas", "Calças", "Casacos", "Camisas", "Bolsas", "Acessórios"];

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}

export function Catalog() {
  const [active, setActive] = useState("Todos");

  const constraints = active !== "Todos" ? [where("category", "==", active)] : [];
  const localFilter = active !== "Todos"
    ? (p: { category: string }) => p.category === active
    : undefined;

  const { products, loading } = useProducts({ constraints, localFilter });

  return (
    <section id="catalogo" className="py-20 lg:py-28">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-3">Catálogo</p>
            <h2 className="text-4xl md:text-5xl text-primary">A coleção completa</h2>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`text-sm tracking-wide transition-colors pb-1 border-b ${
                  active === c
                    ? "text-primary border-accent"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!loading && products.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-16">
            Nenhum produto encontrado nesta categoria.
          </p>
        )}
      </div>
    </section>
  );
}
