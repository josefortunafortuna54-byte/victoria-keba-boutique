import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/integrations/firebase/auth";
import { ordersApi } from "@/integrations/firebase/firestore";
import { formatPrice } from "@/lib/products";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import type { Order } from "@/integrations/firebase/types";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Button } from "@/components/ui/button";
import { Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Meus Pedidos — Victoria Keba" }] }),
  component: PedidosPage,
});

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusColor: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  em_preparacao: "bg-purple-100 text-purple-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

function PedidosPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !firebaseUser) navigate({ to: "/login" });
  }, [authLoading, firebaseUser, navigate]);

  useEffect(() => {
    if (!firebaseUser || !isFirebaseConfigured) { setLoading(false); return; }
    ordersApi.listByUser(firebaseUser.uid)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <CartDrawer />
      <main className="container-luxe py-12 lg:py-20 max-w-3xl">
        <div className="mb-10">
          <p className="eyebrow mb-3">A minha conta</p>
          <h1 className="font-display text-4xl text-primary">Os meus pedidos</h1>
        </div>

        {loading || authLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 gap-5">
            <Package className="h-14 w-14 text-muted-foreground" strokeWidth={1} />
            <p className="font-display text-2xl text-primary">Ainda não tens pedidos</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Descobre as nossas peças e faz a tua primeira encomenda.
            </p>
            <Button asChild className="rounded-none uppercase tracking-[0.18em] text-xs mt-2">
              <Link to="/">Ver catálogo</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border border-border bg-background">
                {/* Header */}
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Ref.</p>
                      <p className="font-mono text-sm font-medium">{o.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                      <p className="font-display text-base text-primary">{formatPrice(o.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Itens</p>
                      <p className="text-sm">{o.products?.length ?? 0}</p>
                    </div>
                    <span className={`text-xs uppercase tracking-wider px-3 py-1 font-medium ${statusColor[o.orderStatus] ?? statusColor.pendente}`}>
                      {statusLabel[o.orderStatus] ?? o.orderStatus}
                    </span>
                  </div>
                  {expanded === o.id
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                </button>

                {/* Details */}
                {expanded === o.id && (
                  <div className="border-t border-border px-5 py-5 space-y-5">
                    {/* Products */}
                    <div className="space-y-3">
                      {o.products?.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {p.image && (
                            <img src={p.image} alt={p.title} className="h-16 w-12 object-cover bg-muted shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.qty}× {formatPrice(p.price)}</p>
                          </div>
                          <p className="text-sm font-display">{formatPrice(p.price * p.qty)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Entrega</p>
                        <p>{o.customerAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Pagamento</p>
                        <p className="capitalize">{o.paymentMethod?.replace("_", " ")}</p>
                        <span className={`text-xs uppercase tracking-wider px-2 py-0.5 mt-1 inline-block ${
                          o.paymentStatus === "pago" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
