import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Product } from "./products";
import { useAuth } from "@/integrations/firebase/auth";
import { userApi } from "@/integrations/firebase/firestore";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import type { CartLine } from "@/integrations/firebase/types";

type CartItem = { product: Product; qty: number };
type CartCtx = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

const toLine = (i: CartItem): CartLine => ({
  productId: i.product.id,
  title: i.product.name,
  price: i.product.price,
  image: i.product.image,
  qty: i.qty,
});
const fromLine = (l: CartLine): CartItem => ({
  product: {
    id: l.productId,
    name: l.title,
    category: "",
    price: l.price,
    image: l.image ?? "",
  },
  qty: l.qty,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);

  // Realtime sync when Firebase is configured and user is logged in.
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseUser) {
      hydrated.current = false;
      return;
    }
    hydrated.current = false;
    const unsub = userApi.subscribeCart(firebaseUser.uid, (lines) => {
      setItems(lines.map(fromLine));
      hydrated.current = true;
    });
    return unsub;
  }, [firebaseUser]);

  const persist = useCallback(
    (next: CartItem[]) => {
      if (isFirebaseConfigured && firebaseUser && hydrated.current) {
        void userApi.setCart(firebaseUser.uid, next.map(toLine));
      }
    },
    [firebaseUser],
  );

  const update = useCallback(
    (fn: (curr: CartItem[]) => CartItem[]) => {
      setItems((curr) => {
        const next = fn(curr);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const add = useCallback(
    (p: Product) => {
      update((curr) => {
        const found = curr.find((i) => i.product.id === p.id);
        if (found)
          return curr.map((i) =>
            i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
          );
        return [...curr, { product: p, qty: 1 }];
      });
      setOpen(true);
    },
    [update],
  );

  const remove = useCallback(
    (id: string) => update((curr) => curr.filter((i) => i.product.id !== id)),
    [update],
  );

  const setQty = useCallback(
    (id: string, qty: number) =>
      update((curr) =>
        curr.map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i,
        ),
      ),
    [update],
  );

  const clear = useCallback(() => update(() => []), [update]);

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider
      value={{ items, add, remove, setQty, clear, open, setOpen, total, count }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

// Número WhatsApp lido do .env — fallback para número de exemplo angolano.
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER ?? "244923456789";
