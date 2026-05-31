import { Instagram, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import lookbook from "@/assets/lookbook-1.jpg";
import logo from "@/assets/logo-victoria-keba.png";

export function Lookbook() {
  return (
    <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
      <img src={lookbook} alt="Lookbook Victoria Keba" loading="lazy" width={1600} height={1200} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-primary/40" />
      <div className="relative container-luxe h-full flex flex-col justify-center items-start text-primary-foreground max-w-2xl">
        <p className="eyebrow text-primary-foreground/70 mb-4">Lookbook 2026</p>
        <h2 className="text-4xl md:text-6xl font-display leading-tight">
          Sua história, vestida com intenção.
        </h2>
        <p className="mt-4 text-primary-foreground/80 max-w-md">
          Cada peça é pensada para mulheres que sabem o que querem — e como querem ser vistas.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-luxe py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <img src={logo} alt="Victoria Keba" className="h-28 w-auto object-contain -ml-2" />
          <p className="mt-4 text-sm text-primary-foreground/70 max-w-xs">
            Moda elegante, preços inteligentes. Luxo acessível para a mulher contemporânea.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="h-10 w-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="h-10 w-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="h-10 w-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60 mb-4">Loja</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#novidades" className="hover:text-accent">Novidades</a></li>
            <li><a href="#catalogo" className="hover:text-accent">Catálogo</a></li>
            <li><a href="#mais-vendidos" className="hover:text-accent">Best Sellers</a></li>
            <li><a href="#promocoes" className="hover:text-accent">Promoções</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60 mb-4">Atendimento</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="hover:text-accent">Trocas e devoluções</a></li>
            <li><a href="#" className="hover:text-accent">Entrega</a></li>
            <li><a href="#" className="hover:text-accent">Guia de tamanhos</a></li>
            <li><a href="#" className="hover:text-accent">Fale conosco</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60 mb-4">Newsletter</p>
          <p className="text-sm text-primary-foreground/70 mb-4">Receba novidades e ofertas exclusivas em primeira mão.</p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Seu e-mail" className="rounded-none bg-transparent border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-accent" />
            <Button type="submit" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase text-xs tracking-[0.18em]">Inscrever</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-luxe py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© 2026 Victoria Keba. Todos os direitos reservados.</p>
          <p>Seu estilo começa aqui.</p>
        </div>
      </div>
    </footer>
  );
}
