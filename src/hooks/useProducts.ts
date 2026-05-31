// ============================================================================
// useProducts — hook universal de catálogo
// Tenta carregar do Firestore; faz fallback para produtos locais se o Firebase
// não estiver configurado ou ocorrer erro.
// ============================================================================
import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import { productsApi } from "@/integrations/firebase/firestore";
import { products as localProducts, fromFirestore, type Product } from "@/lib/products";
import type { QueryConstraint } from "firebase/firestore";

type UseProductsOptions = {
  /** Filtros Firestore opcionais, ex: [where("newArrival","==",true)] */
  constraints?: QueryConstraint[];
  /** Filtro local aplicado nos produtos de fallback */
  localFilter?: (p: Product) => boolean;
};

type UseProductsResult = {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** true se os dados vieram do Firestore */
  fromFirebase: boolean;
};

export function useProducts(opts: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromFirebase, setFromFirebase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured) {
        // Sem Firebase → usar catálogo local
        const local = opts.localFilter
          ? localProducts.filter(opts.localFilter)
          : localProducts;
        if (!cancelled) {
          setProducts(local);
          setFromFirebase(false);
          setLoading(false);
        }
        return;
      }

      try {
        const docs = await productsApi.list(opts.constraints ?? []);
        if (!cancelled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setProducts(docs.map((d) => fromFirestore(d as any)));
          setFromFirebase(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("[useProducts] Firestore error, falling back to local:", err);
        if (!cancelled) {
          const local = opts.localFilter
            ? localProducts.filter(opts.localFilter)
            : localProducts;
          setProducts(local);
          setFromFirebase(false);
          setError("Não foi possível carregar do servidor. A mostrar catálogo local.");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, loading, error, fromFirebase };
}
