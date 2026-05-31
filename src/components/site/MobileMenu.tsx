import { X, Heart, LogOut, LayoutDashboard, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/integrations/firebase/auth";
import { useEffect } from "react";

const navLinks = [
  { label: "Novidades", href: "#novidades" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Best Sellers", href: "#mais-vendidos" },
  { label: "Promoções", href: "#promocoes" },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onFavoritesOpen: () => void;
}

export function MobileMenu({ open, onClose, onFavoritesOpen }: MobileMenuProps) {
  const { firebaseUser, profile, isAdmin, signOut } = useAuth();

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-background flex flex-col shadow-luxe transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="font-display text-xl text-primary">Menu</span>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-6 py-6 gap-1 flex-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="text-base font-medium text-foreground hover:text-accent transition-colors py-3 border-b border-border/50 tracking-wide"
            >
              {l.label}
            </a>
          ))}

          {/* Favorites */}
          <button
            onClick={() => { onFavoritesOpen(); onClose(); }}
            className="flex items-center gap-3 text-base font-medium text-foreground hover:text-accent transition-colors py-3 border-b border-border/50 tracking-wide"
          >
            <Heart className="h-4 w-4" /> Favoritos
          </button>
        </nav>

        {/* User section */}
        <div className="px-6 py-5 border-t border-border">
          {firebaseUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors py-1"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                </Link>
              )}
              <button
                onClick={() => { signOut(); onClose(); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <LogOut className="h-4 w-4" /> Terminar sessão
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              <User className="h-4 w-4" /> Entrar / Criar conta
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
