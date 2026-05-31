import { useState } from "react";
import { ShoppingBag, Search, Heart, Menu, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/integrations/firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-victoria-keba.png";
import { MobileMenu } from "./MobileMenu";
import { SearchDrawer } from "./SearchDrawer";
import { FavoritesDrawer } from "./FavoritesDrawer";

export function SiteHeader() {
  const { count, setOpen: setCartOpen } = useCart();
  const { firebaseUser, profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  const favCount = profile?.favorites?.length ?? 0;

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="container-luxe flex items-center justify-center gap-6 py-2.5 overflow-hidden">
          <p className="tracking-[0.25em] uppercase">
            Frete grátis acima de 50.000 Kz · Parcele em até 6x sem juros
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container-luxe flex h-20 sm:h-24 md:h-32 items-center justify-between">

          {/* Mobile: hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#novidades" className="hover:text-accent transition-colors">Novidades</a>
            <a href="#catalogo" className="hover:text-accent transition-colors">Catálogo</a>
            <a href="#mais-vendidos" className="hover:text-accent transition-colors">Best Sellers</a>
            <a href="#promocoes" className="hover:text-accent transition-colors">Promoções</a>
          </nav>

          {/* Logo */}
          <a href="#" className="group flex items-center" aria-label="Victoria Keba">
            <img
              src={logo}
              alt="Victoria Keba — Moda Seleta & Estilo"
              className="h-16 sm:h-20 md:h-28 lg:h-32 w-auto max-w-[60vw] object-contain animate-fade-in transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </a>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Pesquisar"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Favorites — desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex relative"
              onClick={() => setFavOpen(true)}
              aria-label="Favoritos"
            >
              <Heart className="h-5 w-5" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Button>

            {/* User menu */}
            {firebaseUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                    {profile?.name || profile?.email}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/pedidos"><Package className="h-4 w-4 mr-2" /> Os meus pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFavOpen(true)}>
                    <Heart className="h-4 w-4 mr-2" /> Favoritos
                    {favCount > 0 && (
                      <span className="ml-auto text-xs text-accent font-semibold">{favCount}</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> Terminar sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/login" aria-label="Entrar"><User className="h-5 w-5" /></Link>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label="Carrinho"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Overlays */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onFavoritesOpen={() => setFavOpen(true)}
      />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FavoritesDrawer open={favOpen} onClose={() => setFavOpen(false)} />
    </>
  );
}
