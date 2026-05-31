# Firebase — Victoria Keba Boutique
## Configuração em 5 passos

---

### 1. Criar o projecto Firebase
1. Vai a https://console.firebase.google.com → **Adicionar projecto**
2. Nome: `victoria-keba` (ou qualquer outro)
3. Desativa o Google Analytics (opcional)

---

### 2. Activar os serviços
| Serviço | Onde activar |
|---|---|
| **Authentication** | Build → Authentication → Sign-in method → activa **Email/Password** e **Google** |
| **Firestore** | Build → Firestore Database → Criar base de dados → **Modo de produção** |
| **Storage** | Build → Storage → Começar |

---

### 3. Obter as credenciais
1. ⚙️ **Project Settings** → separador **General**
2. Em "Your apps" → clica em **`</>`** (Web app) → Regista a app
3. Copia o objecto `firebaseConfig`

---

### 4. Criar o ficheiro `.env`
Na raiz do projecto, cria um ficheiro `.env` (copia o `.env.example`):

```bash
cp .env.example .env
```

Preenche com os teus valores:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=victoria-keba.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=victoria-keba
VITE_FIREBASE_STORAGE_BUCKET=victoria-keba.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Número WhatsApp da loja (só dígitos)
# Angola: 244 + 9 dígitos. Ex: 244923456789
VITE_WHATSAPP_NUMBER=244923456789
```

> ⚠️ Nunca faças commit do `.env` — já está no `.gitignore`.

---

### 5. Publicar as regras de segurança
- **Firestore**: Console → Firestore → **Rules** → cola o conteúdo de `firestore.rules` → Publicar
- **Storage**: Console → Storage → **Rules** → cola o conteúdo de `storage.rules` → Publicar

---

### 6. Criar o primeiro ADMIN
1. Abre o site → `/login` → **Criar conta** (com o teu email)
2. Firebase Console → Firestore → colecção **`users`** → abre o teu documento
3. Edita o campo **`role`**: muda de `customer` para **`admin`**
4. Recarrega o site → acede a **`/admin`**

---

### 7. Importar o catálogo demo
No dashboard admin (`/admin`) clica em **"Importar catálogo demo"** para carregar os 8 produtos de exemplo para o Firestore.

> Depois de importados, o site passa automaticamente a mostrar os produtos do Firestore.

---

### Como o catálogo funciona

```
Firebase configurado?
  └─ Sim → carrega produtos do Firestore (tempo real)
  └─ Não → mostra catálogo local de 8 produtos (modo demo)
```

Enquanto não configurares o Firebase, o site funciona na mesma com os 8 produtos locais — perfeito para desenvolvimento.

---

### Estrutura de colecções Firestore
`users` · `products` · `orders` · `categories` · `reviews` · `promotions` · `banners` · `coupons` · `notifications` · `settings`
