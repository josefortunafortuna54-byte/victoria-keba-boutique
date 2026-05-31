import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();
  const { add } = useCart();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results: Product[] =
    query.trim().length < 2
      ? []
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()),
        );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-luxe animate-[fade-up_0.2s_ease-out_both]">
        <div className="container-luxe py-5">
          {/* Input */}
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar produtos, categorias…"
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          {query.trim().length >= 2 && (
            <div className="mt-4 pb-2">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum produto encontrado para "{query}"
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
                  {results.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 p-2 rounded hover:bg-secondary transition-colors group"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-16 w-12 object-cover bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.category}
                        </p>
                        <p className="font-display text-sm text-foreground leading-tight truncate">
                          {p.name}
                        </p>
                        <p className="font-display text-sm text-primary mt-1">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => { add(p); onClose(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center"
                        aria-label="Adicionar ao carrinho"
                      >
                        <ShoppingBag className="h-4 w-4 text-accent" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint when empty */}
          {query.trim().length < 2 && (
            <p className="text-xs text-muted-foreground mt-3 pb-1">
              Escreve pelo menos 2 caracteres para pesquisar
            </p>
          )}
        </div>
      </div>
    </>
  );
}
