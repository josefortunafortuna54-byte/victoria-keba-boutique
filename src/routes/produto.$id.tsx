import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/integrations/firebase/auth";
import { userApi, productsApi, reviewsApi } from "@/integrations/firebase/firestore";
import { products as localProducts, fromFirestore, formatPrice, type Product } from "@/lib/products";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import { toast } from "sonner";
import type { Review } from "@/integrations/firebase/types";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CartDrawer } from "@/components/site/CartDrawer";
import { CartProvider } from "@/lib/cart";

export const Route = createFileRoute("/produto/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { firebaseUser, profile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const isFav = !!profile?.favorites?.includes(id);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isFirebaseConfigured) {
        try {
          const doc = await productsApi.get(id);
          if (doc) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setProduct(fromFirestore(doc as any));
          } else {
            const local = localProducts.find((p) => p.id === id);
            setProduct(local ?? null);
          }
        } catch {
          const local = localProducts.find((p) => p.id === id);
          setProduct(local ?? null);
        }
      } else {
        const local = localProducts.find((p) => p.id === id);
        setProduct(local ?? null);
      }
      setLoading(false);
    }

    async function loadReviews() {
      if (!isFirebaseConfigured) return;
      try {
        const r = await reviewsApi.listByProduct(id);
        setReviews(r);
      } catch { /* ignore */ }
    }

    load();
    loadReviews();
  }, [id]);

  const toggleFav = async () => {
    if (!firebaseUser) { toast("Entre para guardar favoritos"); navigate({ to: "/login" }); return; }
    if (isFav) await userApi.removeFavorite(firebaseUser.uid, id);
    else await userApi.addFavorite(firebaseUser.uid, id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    add({ ...product, sizes: selectedSize ? [selectedSize] : product.sizes, colors: selectedColor ? [selectedColor] : product.colors });
    toast("Adicionado à sacola!");
  };

  const submitReview = async () => {
    if (!firebaseUser || !profile || !reviewText.trim()) return;
    setSubmitting(true);
    try {
      await reviewsApi.create({
        userId: firebaseUser.uid,
        productId: id,
        username: profile.name || profile.email,
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      setReviewText("");
      setReviewRating(5);
      const updated = await reviewsApi.listByProduct(id);
      setReviews(updated);
      toast("Avaliação publicada!");
    } catch { toast.error("Erro ao publicar avaliação."); }
    setSubmitting(false);
  };

  const images = product?.images?.filter(Boolean).length
    ? product.images!.filter(Boolean)
    : product?.image
    ? [product.image]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-primary">Produto não encontrado</p>
        <Button onClick={() => navigate({ to: "/" })} variant="outline" className="rounded-none uppercase tracking-widest text-xs">
          Voltar à loja
        </Button>
      </div>
    );
  }

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <CartDrawer />

      <main className="container-luxe py-10 lg:py-16">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] bg-muted overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  Sem imagem
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 h-20 w-14 bg-muted overflow-hidden border-2 transition-colors ${
                      activeImg === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow mb-2">{product.category}</p>
              <h1 className="font-display text-4xl md:text-5xl text-primary leading-tight">{product.name}</h1>

              {avgRating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({reviews.length} avaliações)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl text-primary">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                      className={`h-10 min-w-10 px-3 border text-sm font-medium transition-colors ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                      className={`h-9 px-4 border text-xs uppercase tracking-wide transition-colors ${
                        selectedColor === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-13 rounded-none uppercase tracking-[0.18em] text-xs"
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Adicionar à sacola
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-13 w-13 rounded-none border-border"
                onClick={toggleFav}
                aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : ""}`} />
              </Button>
            </div>

            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-destructive uppercase tracking-widest">
                Últimas {product.stock} unidades!
              </p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-3xl text-primary mb-8">Avaliações</h2>

          {/* Write review */}
          {firebaseUser && (
            <div className="bg-secondary/40 p-6 mb-10 space-y-4">
              <p className="text-sm font-medium uppercase tracking-widest">Deixa a tua avaliação</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`h-6 w-6 transition-colors ${s <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Partilha a tua opinião sobre esta peça…"
                rows={3}
                className="w-full bg-background border border-border p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
              <Button
                onClick={submitReview}
                disabled={submitting || !reviewText.trim()}
                className="rounded-none uppercase tracking-[0.18em] text-xs h-10"
              >
                {submitting ? "A publicar…" : "Publicar avaliação"}
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">Ainda não há avaliações. Sê o primeiro!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{r.username}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
