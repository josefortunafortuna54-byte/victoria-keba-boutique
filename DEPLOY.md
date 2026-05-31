# Deploy — Victoria Keba Boutique
## Publicar o site online com Vercel (gratuito, 5 minutos)

---

### 1. Criar conta no GitHub (se ainda não tens)
Vai a https://github.com → **Sign up** → cria conta gratuita.

---

### 2. Criar repositório e fazer upload do projecto
No terminal, dentro da pasta do projecto:

```bash
cd ~/Desktop/victoria-luxe-boutique-done

# Inicializar git
git init
git add .
git commit -m "Victoria Keba — primeiro commit"
```

Vai ao GitHub → **New repository** → nome `victoria-keba` → **Create repository**

Copia o comando que aparece ("push an existing repository") e corre no terminal:
```bash
git remote add origin https://github.com/SEU_USERNAME/victoria-keba.git
git branch -M main
git push -u origin main
```

---

### 3. Publicar no Vercel
1. Vai a https://vercel.com → **Sign up with GitHub**
2. Clica em **Add New Project**
3. Selecciona o repositório `victoria-keba` → **Import**
4. Framework: **Vite** (detectado automaticamente)
5. Clica em **Environment Variables** e adiciona todas as variáveis do `.env`:

| Variável | Valor |
|---|---|
| `VITE_FIREBASE_API_KEY` | o teu valor |
| `VITE_FIREBASE_AUTH_DOMAIN` | o teu valor |
| `VITE_FIREBASE_PROJECT_ID` | o teu valor |
| `VITE_FIREBASE_STORAGE_BUCKET` | o teu valor |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | o teu valor |
| `VITE_FIREBASE_APP_ID` | o teu valor |
| `VITE_WHATSAPP_NUMBER` | o teu número |

6. Clica **Deploy** → aguarda ~2 minutos
7. O site fica disponível em `victoria-keba.vercel.app` (ou URL personalizado)

---

### 4. Actualizar o site depois de fazer alterações

```bash
git add .
git commit -m "descrição da alteração"
git push
```

O Vercel detecta o push e faz deploy automático em ~1 minuto.

---

### 5. Domínio personalizado (opcional)
No Vercel → **Settings** → **Domains** → adiciona o teu domínio (ex: `victoriakeba.ao`).

---

### ⚠️ Adicionar o domínio ao Firebase Auth
Quando o site estiver online, tens de adicionar o domínio à lista de domínios autorizados no Firebase:
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Clica **Add domain** → cola o teu domínio Vercel (`victoria-keba.vercel.app`)
3. Sem este passo, o login com Google não funciona em produção.
