// ============================================================================
// One-time catalog seeder — Victoria Keba
// Pushes the local demo products into Firestore so the store has data to show.
// Triggered from the admin dashboard. Admin-only via Firestore rules.
// ============================================================================
import { products as demoProducts } from "@/lib/products";
import { productsApi } from "./firestore";

export async function seedCatalog(): Promise<number> {
  const existing = await productsApi.list();
  if (existing.length > 0) return existing.length; // already populated

  await Promise.all(
    demoProducts.map((p) =>
      productsApi.create({
        title: p.name,
        description: `${p.name} — peça da coleção Victoria Keba.`,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        sizes: ["S", "M", "L"],
        colors: [],
        stock: 12,
        images: [p.image],
        featured: p.tag === "Mais vendido",
        bestSeller: p.tag === "Mais vendido",
        newArrival: p.tag === "Novidade",
        promotion: p.tag === "Promoção" || !!p.oldPrice,
        rating: 5,
        totalReviews: 0,
      }),
    ),
  );
  return demoProducts.length;
}
