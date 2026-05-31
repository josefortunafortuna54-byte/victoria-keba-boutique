import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart, WHATSAPP_NUMBER } from "@/lib/cart";
import { useAuth } from "@/integrations/firebase/auth";
import { ordersApi } from "@/integrations/firebase/firestore";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { PaymentMethod } from "@/integrations/firebase/types";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "whatsapp", label: "Confirmar via WhatsApp" },
  { value: "transferencia", label: "Transferência bancária" },
  { value: "dinheiro", label: "Pagamento na entrega" },
];

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, total, clear } = useCart();
  const { firebaseUser, profile } = useAuth();

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const valid = name.trim() && phone.trim() && address.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);

    let orderId = "";

    // Save to Firestore if Firebase configured
    if (isFirebaseConfigured) {
      try {
        orderId = await ordersApi.create({
          userId: firebaseUser?.uid ?? "guest",
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          products: items.map((i) => ({
            productId: i.product.id,
            title: i.product.name,
            price: i.product.price,
            qty: i.qty,
            image: i.product.image,
          })),
          totalPrice: total,
          paymentMethod: payment,
          paymentStatus: "pendente",
          orderStatus: "pendente",
        });
      } catch (err) {
        console.error("Erro ao criar pedido:", err);
        toast.error("Erro ao registar pedido. Tente novamente.");
        setSubmitting(false);
        return;
      }
    }

    // Always send to WhatsApp
    const lines = items
      .map((i) => `• ${i.qty}x ${i.product.name} — ${formatPrice(i.product.price * i.qty)}`)
      .join("%0A");
    const orderRef = orderId ? `%0A%0A🔖 Ref: ${orderId.slice(0, 8).toUpperCase()}` : "";
    const msg =
      `Olá Victoria Keba! Gostaria de finalizar este pedido:%0A%0A` +
      `👤 *${name.trim()}*%0A` +
      `📞 ${phone.trim()}%0A` +
      `📍 ${address.trim()}%0A%0A` +
      `${lines}%0A%0A` +
      `💳 Pagamento: ${paymentOptions.find((p) => p.value === payment)?.label}%0A` +
      `*Total: ${formatPrice(total)}*` +
      orderRef;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

    clear();
    setDone(true);
    setSubmitting(false);
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <CheckCircle2 className="h-14 w-14 text-accent" strokeWidth={1.5} />
            <DialogTitle className="font-display text-2xl text-primary">Pedido registado!</DialogTitle>
            <p className="text-sm text-muted-foreground">
              O WhatsApp foi aberto com os detalhes. A nossa equipa irá confirmar em breve.
            </p>
            <Button onClick={handleClose} className="rounded-none uppercase tracking-[0.18em] text-xs mt-2">
              Continuar a comprar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-primary">Finalizar pedido</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Order summary */}
              <div className="bg-secondary/50 p-4 space-y-1.5 text-sm">
                {items.map((i) => (
                  <div key={i.product.id} className="flex justify-between">
                    <span className="text-muted-foreground">{i.qty}× {i.product.name}</span>
                    <span>{formatPrice(i.product.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-display text-base text-primary pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome completo *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Telefone / WhatsApp *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <textarea
                  placeholder="Morada de entrega *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Método de pagamento</p>
                {paymentOptions.map((o) => (
                  <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`h-4 w-4 border-2 rounded-full flex items-center justify-center transition-colors ${
                      payment === o.value ? "border-primary" : "border-border group-hover:border-foreground"
                    }`}>
                      {payment === o.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value={o.value}
                      checked={payment === o.value}
                      onChange={() => setPayment(o.value)}
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!valid || submitting}
                className="w-full h-12 rounded-none uppercase tracking-[0.18em] text-xs"
              >
                {submitting ? "A processar…" : "Confirmar pedido"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
