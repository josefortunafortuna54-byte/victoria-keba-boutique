import heroImg from "@/assets/hero-model.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-20">
        <div className="order-2 lg:order-1 animate-[fade-up_0.9s_ease-out_both]">
          <p className="eyebrow mb-6">Coleção Atelier · Outono 2026</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-primary">
            Moda Elegante,<br />
            <em className="text-accent not-italic font-display">Preços</em> Inteligentes.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
            Luxo acessível para a mulher que escreve a própria história.
            Peças atemporais, tecidos nobres e silhuetas que pertencem a você.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-none h-12 px-8 tracking-[0.18em] uppercase text-xs">
              <a href="#catalogo">Comprar agora <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-none h-12 px-4 tracking-[0.18em] uppercase text-xs border-b border-foreground/30 hover:border-accent hover:text-accent">
              <a href="#novidades">Ver lookbook</a>
            </Button>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {[
              ["+20k", "clientes felizes"],
              ["4.9★", "avaliação média"],
              ["48h", "entrega expressa"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-display text-2xl text-primary">{k}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2 relative animate-[fade-in_1s_ease-out_both]">
          <div className="absolute -inset-4 bg-primary/5 -z-10" />
          <div className="absolute top-6 -left-2 lg:-left-6 z-10 bg-background px-4 py-3 shadow-soft">
            <p className="eyebrow">Seu estilo</p>
            <p className="font-display text-xl text-primary">começa aqui.</p>
          </div>
          <img
            src={heroImg}
            alt="Modelo Victoria Keba vestindo coleção exclusiva"
            width={1080}
            height={1920}
            className="w-full h-[520px] md:h-[640px] lg:h-[720px] object-cover shadow-luxe"
          />
          <div className="absolute bottom-6 -right-2 lg:-right-6 bg-accent text-accent-foreground px-5 py-3 shadow-soft">
            <p className="font-display text-lg leading-none">Luxo acessível.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
