import { useCart } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/integrations/firebase/auth";
import { userApi } from "@/integrations/firebase/firestore";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const tagStyles: Record<string, string> = {
  "Mais vendido": "bg-primary text-primary-foreground",
  "Novidade": "bg-accent text-accent-foreground",
  "Últimas unidades": "bg-destructive text-destructive-foreground",
  "Promoção": "bg-foreground text-background",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { firebaseUser, profile } = useAuth();
  const navigate = useNavigate();
  const isFav = !!profile?.favorites?.includes(product.id);

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firebaseUser) {
      toast("Entre para guardar favoritos");
      navigate({ to: "/login" });
      return;
    }
    if (isFav) await userApi.removeFavorite(firebaseUser.uid, product.id);
    else await userApi.addFavorite(firebaseUser.uid, product.id);
  };

  const goToProduct = () => {
    navigate({ to: "/produto/$id", params: { id: product.id } });
  };

  return (
    <article className="group relative">
      <div
        className="relative overflow-hidden bg-muted aspect-[4/5] cursor-pointer"
        onClick={goToProduct}
      >
        {product.tag && (
          <span className={`absolute top-3 left-3 z-10 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 ${tagStyles[product.tag]}`}>
            {product.tag}
          </span>
        )}
        <button
          onClick={toggleFav}
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background hover:text-accent transition-colors"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-accent text-accent" : ""}`} />
        </button>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 p-3">
          <Button
            onClick={(e) => { e.stopPropagation(); add(product); toast("Adicionado à sacola!"); }}
            className="w-full rounded-none h-11 tracking-[0.18em] uppercase text-[11px]"
          >
            <ShoppingBag className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>
      </div>
      <div
        className="pt-4 flex items-start justify-between gap-4 cursor-pointer"
        onClick={goToProduct}
      >
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.category}</p>
          <h3 className="font-display text-lg text-foreground leading-tight mt-1 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </div>
        <div className="text-right whitespace-nowrap">
          {product.oldPrice && (
            <div className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</div>
          )}
          <div className="font-display text-lg text-primary">{formatPrice(product.price)}</div>
        </div>
      </div>
    </article>
  );
}
