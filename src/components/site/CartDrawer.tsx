import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { CheckoutModal } from "./CheckoutModal";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, total, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle className="font-display text-2xl tracking-wide">Sua sacola</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
              <p className="font-display text-xl text-primary">Sua sacola está vazia</p>
              <p className="text-sm text-muted-foreground">Descubra peças que combinam com você.</p>
              <Button
                onClick={() => setOpen(false)}
                className="rounded-none mt-2 uppercase tracking-[0.18em] text-xs"
              >
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {items.map((i) => (
                  <div key={i.product.id} className="flex gap-4">
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      className="h-28 w-20 object-cover bg-muted shrink-0"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="font-display text-base text-foreground leading-tight">
                            {i.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{i.product.category}</p>
                        </div>
                        <button
                          onClick={() => remove(i.product.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => setQty(i.product.id, i.qty - 1)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{i.qty}</span>
                          <button
                            onClick={() => setQty(i.product.id, i.qty + 1)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-display text-base text-primary">
                          {formatPrice(i.product.price * i.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t px-6 py-5 space-y-4 bg-secondary/50">
                <div className="flex justify-between items-baseline">
                  <span className="eyebrow">Total</span>
                  <span className="font-display text-2xl text-primary">{formatPrice(total)}</span>
                </div>
                <Button
                  onClick={() => { setOpen(false); setCheckoutOpen(true); }}
                  className="w-full h-12 rounded-none uppercase tracking-[0.18em] text-xs"
                >
                  Finalizar pedido
                </Button>
                <button
                  onClick={clear}
                  className="w-full text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                >
                  Esvaziar sacola
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
