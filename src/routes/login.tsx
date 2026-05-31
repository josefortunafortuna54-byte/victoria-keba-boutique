import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/integrations/firebase/auth";
import { isFirebaseConfigured } from "@/integrations/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo-victoria-keba.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Victoria Keba" },
      { name: "description", content: "Aceda à sua conta Victoria Keba: pedidos, favoritos e checkout rápido." },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "register" | "reset";

function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signInEmail(email, password);
        toast.success("Bem-vinda de volta!");
        navigate({ to: "/" });
      } else if (mode === "register") {
        await signUpEmail(name, email, password);
        toast.success("Conta criada com sucesso!");
        navigate({ to: "/" });
      } else {
        await resetPassword(email);
        toast.success("Enviámos um link de recuperação para o seu email.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? translateError(err.message) : "Algo correu mal.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await signInGoogle();
      toast.success("Sessão iniciada com Google.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? translateError(err.message) : "Não foi possível entrar com Google.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Victoria Keba" className="h-16 w-auto object-contain" />
        </Link>
        <div className="space-y-4">
          <h2 className="font-display text-4xl leading-tight">Moda elegante,<br />preços inteligentes.</h2>
          <p className="text-primary-foreground/70 max-w-sm">
            Crie a sua conta para guardar favoritos, acompanhar pedidos e finalizar a compra em segundos.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/50">Luxo acessível</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <img src={logo} alt="Victoria Keba" className="h-14 w-auto object-contain" />
          </div>

          <h1 className="font-display text-3xl text-foreground">
            {mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : "Recuperar senha"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Aceda à sua conta Victoria Keba."
              : mode === "register"
                ? "Junte-se à boutique."
                : "Enviaremos um link para o seu email."}
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Firebase ainda não está configurado. Cole as credenciais do seu projeto em
              <code className="mx-1">src/integrations/firebase/config.ts</code>.
            </div>
          )}

          <form onSubmit={handle} className="mt-8 space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={120} />
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={120} />
              </div>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("reset")} className="text-xs text-muted-foreground hover:text-foreground">
                Esqueceu a senha?
              </button>
            )}

            <Button type="submit" disabled={busy} className="w-full h-11 rounded-none uppercase tracking-[0.18em] text-xs">
              {busy ? "Aguarde…" : mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" onClick={google} disabled={busy} className="w-full h-11 rounded-none">
                <GoogleIcon /> <span className="ml-2">Continuar com Google</span>
              </Button>
            </>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Não tem conta?{" "}
                <button onClick={() => setMode("register")} className="text-foreground underline underline-offset-4">Criar conta</button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-foreground underline underline-offset-4">Entrar</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string) {
  if (msg.includes("auth/invalid-credential") || msg.includes("wrong-password")) return "Email ou senha incorretos.";
  if (msg.includes("auth/email-already-in-use")) return "Este email já está registado.";
  if (msg.includes("auth/weak-password")) return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("auth/invalid-email")) return "Email inválido.";
  if (msg.includes("auth/popup-closed-by-user")) return "Janela do Google fechada.";
  if (msg.includes("api-key") || msg.includes("configuration")) return "Firebase não configurado corretamente.";
  return "Algo correu mal. Tente novamente.";
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
