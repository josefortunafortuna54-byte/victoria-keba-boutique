import { Heart, X, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/firebase/auth";
import { userApi } from "@/integrations/firebase/firestore";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Link } from "@tanstack/react-router";

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function FavoritesDrawer({ open, onClose }: FavoritesDrawerProps) {
  const { firebaseUser, profile } = useAuth();
  const { products } = useProducts();
  const { add } = useCart();

  const favoriteIds: string[] = profile?.favorites ?? [];
  const favorites = products.filter((p) => favoriteIds.includes(p.id));

  const removeFav = async (productId: string) => {
    if (!firebaseUser) return;
    await userApi.removeFavorite(firebaseUser.uid, productId);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="font-display text-2xl tracking-wide flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" /> Favoritos
          </SheetTitle>
        </SheetHeader>

        {!firebaseUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <Heart className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="font-display text-xl text-primary">Entre para ver os favoritos</p>
            <p className="text-sm text-muted-foreground">
              Guarda as peças que mais gostas e encontra-as aqui sempre.
            </p>
            <Button asChild className="rounded-none mt-2 uppercase tracking-[0.18em] text-xs" onClick={onClose}>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <Heart className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="font-display text-xl text-primary">Ainda sem favoritos</p>
            <p className="text-sm text-muted-foreground">
              Clica no coração de qualquer peça para guardar aqui.
            </p>
            <Button variant="outline" className="rounded-none mt-2 uppercase tracking-[0.18em] text-xs" onClick={onClose}>
              Ver catálogo
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {favorites.map((p) => (
              <div key={p.id} className="flex gap-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-28 w-20 object-cover bg-muted shrink-0"
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {p.category}
                      </p>
                      <p className="font-display text-base text-foreground leading-tight">
                        {p.name}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFav(p.id)}
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Remover dos favoritos"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-display text-base text-primary">
                      {formatPrice(p.price)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none h-8 px-3 uppercase tracking-[0.15em] text-[10px]"
                      onClick={() => { add(p); onClose(); }}
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" /> Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
