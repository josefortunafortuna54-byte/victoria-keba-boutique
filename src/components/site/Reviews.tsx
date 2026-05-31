import { Star } from "lucide-react";

const reviews = [
  {
    name: "Beatriz Almeida",
    role: "São Paulo, SP",
    text: "Acabamento impecável e atendimento de boutique. Cada peça vem como um presente. Já é minha marca favorita.",
  },
  {
    name: "Marina Costa",
    role: "Lisboa, PT",
    text: "Comprei o vestido esmeralda e recebi elogios a noite inteira. O caimento é simplesmente perfeito.",
  },
  {
    name: "Helena Vieira",
    role: "Rio de Janeiro, RJ",
    text: "Luxo de verdade por um preço justo. As fotos não fazem jus à qualidade dos tecidos. Recomendo demais.",
  },
];

export function Reviews() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container-luxe">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Avaliações</p>
          <h2 className="text-4xl md:text-5xl text-primary">Amadas por quem usa</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <figure key={r.name} className="bg-background p-8 shadow-soft">
              <div className="flex gap-0.5 text-accent mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="font-display text-xl leading-snug text-foreground">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border">
                <p className="font-medium text-foreground">{r.name}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{r.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
