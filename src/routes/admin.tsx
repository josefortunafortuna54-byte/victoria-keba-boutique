import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/integrations/firebase/auth";
import { productsApi, ordersApi, couponsApi } from "@/integrations/firebase/firestore";
import { seedCatalog } from "@/integrations/firebase/seed";
import { uploadImages } from "@/integrations/firebase/storage";
import type { Product, Order, Coupon } from "@/integrations/firebase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, ShoppingBag, Users, TrendingUp, Loader2, Pencil, Trash2, Eye } from "lucide-react";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Dashboard Admin — Victoria Keba" }] }),
  component: AdminPage,
});

const fmt = (n: number) => formatPrice(n);

function AdminPage() {
  const { firebaseUser, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !firebaseUser) navigate({ to: "/login" });
  }, [loading, firebaseUser, navigate]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (firebaseUser && !isAdmin)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="font-display text-3xl text-foreground">Acesso restrito</h1>
        <p className="text-muted-foreground max-w-sm">Esta área é exclusiva para administradores.</p>
        <Link to="/"><Button variant="outline" className="rounded-none">Voltar à loja</Button></Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="container-luxe flex items-center justify-between h-16">
          <h1 className="font-display text-2xl text-primary">Victoria Keba · Admin</h1>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ver loja →</Link>
        </div>
      </header>
      <main className="container-luxe py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="coupons">Cupões</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="coupons"><CouponsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------ Overview --
function Overview() {
  const [stats, setStats] = useState({ sales: 0, orders: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const [orders, products] = await Promise.all([ordersApi.listAll(), productsApi.list()]);
        const sales = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const customers = new Set(orders.map((o) => o.userId)).size;
        setStats({ sales, orders: orders.length, customers, products: products.length });
        setRecentOrders(orders.slice(0, 5));
      } catch { /* empty */ }
    })();
  }, []);

  const cards = [
    { label: "Vendas totais", value: fmt(stats.sales), icon: TrendingUp },
    { label: "Pedidos", value: String(stats.orders), icon: ShoppingBag },
    { label: "Clientes", value: String(stats.customers), icon: Users },
    { label: "Produtos", value: String(stats.products), icon: Package },
  ];

  const [seeding, setSeeding] = useState(false);
  const seed = async () => {
    setSeeding(true);
    try { const n = await seedCatalog(); toast.success(`Catálogo importado (${n} produtos).`); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro ao importar."); }
    finally { setSeeding(false); }
  };

  const statusColor: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800", confirmado: "bg-blue-100 text-blue-800",
    em_preparacao: "bg-purple-100 text-purple-800", enviado: "bg-indigo-100 text-indigo-800",
    entregue: "bg-green-100 text-green-800", cancelado: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-background p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="font-display text-3xl text-foreground mt-3">{c.value}</p>
          </div>
        ))}
      </div>

      {stats.products === 0 && (
        <div className="rounded-lg border bg-background p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium">Loja vazia</p>
            <p className="text-sm text-muted-foreground">Importe o catálogo de demonstração para começar.</p>
          </div>
          <Button onClick={seed} disabled={seeding} className="rounded-none uppercase tracking-widest text-xs">
            {seeding ? "A importar…" : "Importar catálogo demo"}
          </Button>
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="rounded-lg border bg-background p-6">
          <h3 className="font-display text-xl mb-4">Pedidos recentes</h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.products?.length ?? 0} itens · {o.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-primary">{fmt(o.totalPrice)}</p>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${statusColor[o.orderStatus] ?? statusColor.pendente}`}>
                    {o.orderStatus?.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Products --
const EMPTY_FORM = {
  title: "", description: "", category: "", price: "", oldPrice: "", stock: "",
  sizes: "", colors: "", featured: false, bestSeller: false, newArrival: true, promotion: false,
};

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => { try { setProducts(await productsApi.list()); } catch { /* none */ } };
  useEffect(() => { load(); }, []);

  const f = (key: string, val: string | boolean) => setForm((prev) => ({ ...prev, [key]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const images = files && files.length ? await uploadImages("products", Array.from(files)) : editing?.images ?? [];
      const data = {
        title: form.title, description: form.description, category: form.category,
        price: Number(form.price) || 0,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        stock: Number(form.stock) || 0,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        images, featured: form.featured, bestSeller: form.bestSeller,
        newArrival: form.newArrival, promotion: form.promotion,
        rating: editing?.rating ?? 0, totalReviews: editing?.totalReviews ?? 0,
      };
      if (editing) {
        await productsApi.update(editing.id, data);
        toast.success("Produto actualizado!");
        setEditing(null);
      } else {
        await productsApi.create(data);
        toast.success("Produto adicionado!");
      }
      setForm(EMPTY_FORM); setFiles(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro.");
    } finally { setBusy(false); }
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? "", category: p.category,
      price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      stock: String(p.stock ?? 0),
      sizes: p.sizes?.join(", ") ?? "", colors: p.colors?.join(", ") ?? "",
      featured: p.featured ?? false, bestSeller: p.bestSeller ?? false,
      newArrival: p.newArrival ?? false, promotion: p.promotion ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id: string) => {
    if (!confirm("Remover produto?")) return;
    await productsApi.remove(id); toast.success("Produto removido."); load();
  };

  const filtered = search
    ? products.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      {/* Form */}
      <form onSubmit={submit} className="rounded-lg border bg-background p-6 space-y-4 h-fit sticky top-20">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">{editing ? "Editar produto" : "Novo produto"}</h3>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }}
              className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest">
              Cancelar
            </button>
          )}
        </div>
        <Field label="Título"><Input value={form.title} onChange={(e) => f("title", e.target.value)} required maxLength={120} /></Field>
        <Field label="Descrição"><Textarea value={form.description} onChange={(e) => f("description", e.target.value)} maxLength={800} rows={3} /></Field>
        <Field label="Categoria"><Input value={form.category} onChange={(e) => f("category", e.target.value)} maxLength={60} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (Kz)"><Input type="number" value={form.price} onChange={(e) => f("price", e.target.value)} required /></Field>
          <Field label="Preço antigo"><Input type="number" value={form.oldPrice} onChange={(e) => f("oldPrice", e.target.value)} /></Field>
        </div>
        <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => f("stock", e.target.value)} /></Field>
        <Field label="Tamanhos (vírgula)"><Input value={form.sizes} onChange={(e) => f("sizes", e.target.value)} placeholder="S, M, L, XL" /></Field>
        <Field label="Cores (vírgula)"><Input value={form.colors} onChange={(e) => f("colors", e.target.value)} placeholder="Creme, Verde, Preto" /></Field>
        <Field label="Imagens"><Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} /></Field>
        {editing && editing.images?.[0] && (
          <img src={editing.images[0]} alt="" className="h-16 w-12 object-cover bg-muted" />
        )}
        <div className="space-y-2 pt-2">
          {(["featured", "bestSeller", "newArrival", "promotion"] as const).map((key) => (
            <Toggle key={key}
              label={{ featured: "Destaque", bestSeller: "Mais vendido", newArrival: "Novidade", promotion: "Promoção" }[key]}
              checked={form[key] as boolean}
              onChange={(v) => f(key, v)}
            />
          ))}
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-none uppercase tracking-widest text-xs">
          {busy ? "A guardar…" : editing ? "Guardar alterações" : "Adicionar produto"}
        </Button>
      </form>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-display text-xl">Catálogo ({filtered.length})</h3>
          <Input placeholder="Pesquisar produtos…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>}
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg border bg-background p-3">
            <img src={p.images?.[0] ?? ""} alt={p.title} className="h-16 w-14 object-cover bg-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.category} · {fmt(p.price)} · stock {p.stock ?? 0}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.bestSeller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">Best seller</span>}
                {p.newArrival && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5">Novidade</span>}
                {p.promotion && <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5">Promoção</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/produto/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => startEdit(p)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => del(p.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------- Orders --
const ORDER_STATUSES = ["pendente", "confirmado", "em_preparacao", "enviado", "entregue", "cancelado"];
const statusColor: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800", confirmado: "bg-blue-100 text-blue-800",
  em_preparacao: "bg-purple-100 text-purple-800", enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-green-100 text-green-800", cancelado: "bg-red-100 text-red-800",
};

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("todos");

  const load = async () => { try { setOrders(await ordersApi.listAll()); } catch { /* none */ } };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, orderStatus: string) => {
    await ordersApi.updateStatus(id, { orderStatus: orderStatus as Order["orderStatus"] });
    toast.success("Estado actualizado."); load();
  };

  const filtered = filter === "todos" ? orders : orders.filter((o) => o.orderStatus === filter);

  if (orders.length === 0)
    return <p className="text-sm text-muted-foreground py-8">Ainda não há pedidos.</p>;

  return (
    <>
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["todos", ...ORDER_STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"
              }`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido com este estado.</p>}

        {filtered.map((o) => (
          <div key={o.id} className="rounded-lg border bg-background p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px]">
              <p className="font-medium">{o.customerName}</p>
              <p className="text-xs text-muted-foreground">{o.customerPhone} · {o.products?.length ?? 0} itens · {fmt(o.totalPrice)}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">#{o.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(o)} className="text-xs text-muted-foreground hover:text-foreground underline">
                Ver detalhes
              </button>
              <Select value={o.orderStatus} onValueChange={(v) => setStatus(o.id, v)}>
                <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className={`text-xs px-1.5 py-0.5 ${statusColor[s]}`}>{s.replace("_", " ")}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Order detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Pedido #{selected?.id.slice(0, 8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Cliente</p><p>{selected.customerName}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Telefone</p><p>{selected.customerPhone}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Morada</p><p>{selected.customerAddress}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pagamento</p><p className="capitalize">{selected.paymentMethod?.replace("_", " ")}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Estado pgto</p>
                  <span className={`text-xs px-2 py-0.5 ${selected.paymentStatus === "pago" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {selected.paymentStatus}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                {selected.products?.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{p.qty}× {p.title}</span>
                    <span>{fmt(p.price * p.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-display text-base text-primary pt-2 border-t">
                  <span>Total</span><span>{fmt(selected.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ------------------------------------------------------------------- Coupons --
function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState(""); const [discount, setDiscount] = useState(""); const [minTotal, setMinTotal] = useState("");

  const load = async () => { try { setCoupons(await couponsApi.list()); } catch { /* none */ } };
  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await couponsApi.create({ code, discount: Number(discount) || 0, minTotal: minTotal ? Number(minTotal) : undefined, active: true });
      toast.success("Cupão criado!"); setCode(""); setDiscount(""); setMinTotal(""); load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erro."); }
  };

  const toggle = async (c: Coupon) => {
    await couponsApi.update(c.id, { active: !c.active });
    toast.success(c.active ? "Cupão desactivado." : "Cupão activado."); load();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[340px_1fr]">
      <form onSubmit={submit} className="rounded-lg border bg-background p-6 space-y-4 h-fit">
        <h3 className="font-display text-xl">Novo cupão</h3>
        <Field label="Código"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VICTORIA10" required maxLength={20} /></Field>
        <Field label="Desconto (%)"><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} required min={1} max={90} /></Field>
        <Field label="Total mínimo (Kz, opcional)"><Input type="number" value={minTotal} onChange={(e) => setMinTotal(e.target.value)} /></Field>
        <Button type="submit" className="rounded-none uppercase tracking-widest text-xs w-full">Criar cupão</Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-display text-xl">Cupões ({coupons.length})</h3>
        {coupons.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cupão criado ainda.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.discount}% desconto{c.minTotal ? ` · mín. ${fmt(c.minTotal)}` : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs uppercase tracking-wider px-2 py-0.5 ${c.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                {c.active ? "Activo" : "Inactivo"}
              </span>
              <Switch checked={c.active} onCheckedChange={() => toggle(c)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------- Atoms --
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
