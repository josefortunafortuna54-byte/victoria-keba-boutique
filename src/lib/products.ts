// ============================================================================
// Produto local (fallback) — Victoria Keba
// Usado apenas quando o Firebase ainda não está configurado.
// Quando o Firestore estiver ligado, os produtos vêm de productsApi.
// ============================================================================
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import p7 from "@/assets/product-7.jpg";
import p8 from "@/assets/product-8.jpg";

// Tipo unificado — compatível com o Firestore Product e o catálogo local.
export type Product = {
  id: string;
  name: string;       // local alias → Firestore usa "title"
  title?: string;     // Firestore field (mapeado em useProducts)
  category: string;
  price: number;
  oldPrice?: number;
  image: string;      // primeira imagem (local ou URL)
  images?: string[];  // Firestore field
  tag?: "Mais vendido" | "Novidade" | "Últimas unidades" | "Promoção";
  // Flags Firestore (usadas nos filtros de colecção)
  bestSeller?: boolean;
  newArrival?: boolean;
  promotion?: boolean;
  featured?: boolean;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  totalReviews?: number;
  description?: string;
};

/** Converte um documento Firestore para o tipo unificado Product. */
export function fromFirestore(doc: Record<string, unknown>): Product {
  const d = doc as {
    id: string; title?: string; name?: string; category?: string;
    price?: number; oldPrice?: number; images?: string[]; image?: string;
    bestSeller?: boolean; newArrival?: boolean; promotion?: boolean;
    featured?: boolean; stock?: number; sizes?: string[]; colors?: string[];
    rating?: number; totalReviews?: number; description?: string;
  };
  const name = d.title ?? d.name ?? "Sem nome";
  let tag: Product["tag"] | undefined;
  if (d.bestSeller) tag = "Mais vendido";
  else if (d.newArrival) tag = "Novidade";
  else if (d.promotion) tag = "Promoção";

  return {
    id: d.id,
    name,
    title: d.title,
    category: d.category ?? "",
    price: d.price ?? 0,
    oldPrice: d.oldPrice,
    image: d.images?.[0] ?? d.image ?? "",
    images: d.images,
    tag,
    bestSeller: d.bestSeller,
    newArrival: d.newArrival,
    promotion: d.promotion,
    featured: d.featured,
    stock: d.stock,
    sizes: d.sizes,
    colors: d.colors,
    rating: d.rating,
    totalReviews: d.totalReviews,
    description: d.description,
  };
}

export const products: Product[] = [
  { id: "p1", name: "Blusa Seda Crème", category: "Blusas", price: 38000, image: p1, tag: "Mais vendido" },
  { id: "p2", name: "Vestido Esmeralda", category: "Vestidos", price: 75000, oldPrice: 95000, image: p2, tag: "Promoção" },
  { id: "p3", name: "Blazer Camel Atelier", category: "Casacos", price: 89000, image: p3, tag: "Novidade" },
  { id: "p4", name: "Colar Dourado Fino", category: "Acessórios", price: 24000, image: p4, tag: "Últimas unidades" },
  { id: "p5", name: "Calça Wide Marfim", category: "Calças", price: 49000, image: p5, tag: "Novidade" },
  { id: "p6", name: "Camisa Oversized Branca", category: "Camisas", price: 41000, image: p6, tag: "Mais vendido" },
  { id: "p7", name: "Casaco Lã Floresta", category: "Casacos", price: 120000, oldPrice: 152000, image: p7, tag: "Promoção" },
  { id: "p8", name: "Bolsa Couro Nude", category: "Bolsas", price: 70000, image: p8, tag: "Mais vendido" },
];

export const formatPrice = (n: number) =>
  `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(n)} Kz`;
