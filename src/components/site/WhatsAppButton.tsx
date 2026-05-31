import { WHATSAPP_NUMBER } from "@/lib/cart";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá%20Victoria%20Luxe!%20Gostaria%20de%20um%20atendimento%20personalizado.`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-luxe hover:scale-110 transition-transform"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.8} />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </a>
  );
}
