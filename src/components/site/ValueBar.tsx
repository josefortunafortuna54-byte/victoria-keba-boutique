import { Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, title: "Entrega expressa", text: "Em até 48h nas capitais" },
  { icon: ShieldCheck, title: "Compra segura", text: "Pagamento 100% protegido" },
  { icon: RotateCcw, title: "Trocas fáceis", text: "Até 30 dias sem complicação" },
  { icon: Sparkles, title: "Qualidade boutique", text: "Tecidos selecionados" },
];

export function ValueBar() {
  return (
    <section className="border-y border-border bg-background">
      <div className="container-luxe grid grid-cols-2 md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className={`flex items-center gap-4 py-6 md:py-8 ${i < items.length - 1 ? "md:border-r border-border" : ""} ${i < 2 ? "border-b md:border-b-0 border-border" : ""} ${i === 0 || i === 2 ? "border-r" : ""}`}
          >
            <Icon className="h-7 w-7 text-accent shrink-0" strokeWidth={1.2} />
            <div>
              <p className="font-display text-base text-primary leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
