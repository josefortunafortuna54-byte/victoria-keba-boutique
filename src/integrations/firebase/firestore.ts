// ============================================================================
// Firestore service layer — Victoria Keba
// Typed CRUD + query helpers for every collection.
// ============================================================================
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import {
  COLLECTIONS,
  type Product,
  type Order,
  type Category,
  type Review,
  type Promotion,
  type Banner,
  type Coupon,
  type CartLine,
  type AppNotification,
} from "./types";

const withId = <T,>(id: string, data: Record<string, unknown>): T =>
  ({ id, ...data } as T);

// ---------------------------------------------------------------- Products ---
export const productsApi = {
  async list(constraints: QueryConstraint[] = []): Promise<Product[]> {
    const snap = await getDocs(query(collection(db, COLLECTIONS.products), ...constraints));
    return snap.docs.map((d) => withId<Product>(d.id, d.data()));
  },
  async get(id: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.products, id));
    return snap.exists() ? withId<Product>(snap.id, snap.data()) : null;
  },
  async create(data: Omit<Product, "id" | "createdAt">): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.products), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  async update(id: string, data: Partial<Product>) {
    await updateDoc(doc(db, COLLECTIONS.products, id), data);
  },
  async remove(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.products, id));
  },
  // Convenience queries
  featured: () => productsApi.list([where("featured", "==", true)]),
  bestSellers: () => productsApi.list([where("bestSeller", "==", true)]),
  newArrivals: () => productsApi.list([where("newArrival", "==", true)]),
  promotions: () => productsApi.list([where("promotion", "==", true)]),
  byCategory: (category: string) =>
    productsApi.list([where("category", "==", category)]),
};

// ----------------------------------------------------------------- Orders ----
export const ordersApi = {
  async create(data: Omit<Order, "id" | "createdAt">): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.orders), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  async listByUser(userId: string): Promise<Order[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.orders),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => withId<Order>(d.id, d.data()));
  },
  async listAll(): Promise<Order[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.orders), orderBy("createdAt", "desc")),
    );
    return snap.docs.map((d) => withId<Order>(d.id, d.data()));
  },
  async updateStatus(id: string, data: Partial<Order>) {
    await updateDoc(doc(db, COLLECTIONS.orders, id), data);
  },
};

// ------------------------------------------------------------- Categories ----
export const categoriesApi = {
  async list(): Promise<Category[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.categories));
    return snap.docs.map((d) => withId<Category>(d.id, d.data()));
  },
  async create(data: Omit<Category, "id" | "createdAt">) {
    await addDoc(collection(db, COLLECTIONS.categories), {
      ...data,
      createdAt: serverTimestamp(),
    });
  },
  async remove(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.categories, id));
  },
};

// ---------------------------------------------------------------- Reviews ----
export const reviewsApi = {
  byProduct: (productId: string) => reviewsApi.listByProduct(productId),
  async listByProduct(productId: string): Promise<Review[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.reviews),
        where("productId", "==", productId),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => withId<Review>(d.id, d.data()));
  },
  async create(data: Omit<Review, "id" | "createdAt">) {
    await addDoc(collection(db, COLLECTIONS.reviews), {
      ...data,
      createdAt: serverTimestamp(),
    });
    // Bump aggregate review count on the product.
    await updateDoc(doc(db, COLLECTIONS.products, data.productId), {
      totalReviews: increment(1),
    });
  },
};

// ------------------------------------------------------------- Promotions ----
export const promotionsApi = {
  async listActive(): Promise<Promotion[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.promotions), where("active", "==", true)),
    );
    return snap.docs.map((d) => withId<Promotion>(d.id, d.data()));
  },
  async create(data: Omit<Promotion, "id" | "createdAt">) {
    await addDoc(collection(db, COLLECTIONS.promotions), {
      ...data,
      createdAt: serverTimestamp(),
    });
  },
  async remove(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.promotions, id));
  },
};

// ---------------------------------------------------------------- Banners ----
export const bannersApi = {
  async listActive(): Promise<Banner[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.banners), where("active", "==", true)),
    );
    return snap.docs.map((d) => withId<Banner>(d.id, d.data()));
  },
  async create(data: Omit<Banner, "id">) {
    await addDoc(collection(db, COLLECTIONS.banners), data);
  },
  async remove(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.banners, id));
  },
};

// ---------------------------------------------------------------- Coupons ----
export const couponsApi = {
  /** Validate a coupon code and return it if usable. */
  async validate(code: string, total: number): Promise<Coupon | null> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.coupons),
        where("code", "==", code.toUpperCase()),
        where("active", "==", true),
        limit(1),
      ),
    );
    if (snap.empty) return null;
    const coupon = withId<Coupon>(snap.docs[0].id, snap.docs[0].data());
    if (coupon.minTotal && total < coupon.minTotal) return null;
    if (coupon.expiresAt && coupon.expiresAt.toMillis() < Date.now()) return null;
    return coupon;
  },
  async create(data: Omit<Coupon, "id" | "createdAt">) {
    await addDoc(collection(db, COLLECTIONS.coupons), {
      ...data,
      code: data.code.toUpperCase(),
      createdAt: serverTimestamp(),
    });
  },
  async list(): Promise<Coupon[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.coupons));
    return snap.docs.map((d) => withId<Coupon>(d.id, d.data()));
  },
  async update(id: string, data: Partial<Coupon>) {
    await updateDoc(doc(db, COLLECTIONS.coupons, id), data);
  },
  async remove(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.coupons, id));
  },
};

// ----------------------------------------------------- User cart/favorites ---
export const userApi = {
  /** Realtime cart subscription for a logged-in user. */
  subscribeCart(uid: string, cb: (cart: CartLine[]) => void) {
    return onSnapshot(doc(db, COLLECTIONS.users, uid), (snap) => {
      cb((snap.data()?.cart ?? []) as CartLine[]);
    });
  },
  async setCart(uid: string, cart: CartLine[]) {
    await setDoc(doc(db, COLLECTIONS.users, uid), { cart }, { merge: true });
  },
  async addFavorite(uid: string, productId: string) {
    await updateDoc(doc(db, COLLECTIONS.users, uid), {
      favorites: arrayUnion(productId),
    });
  },
  async removeFavorite(uid: string, productId: string) {
    await updateDoc(doc(db, COLLECTIONS.users, uid), {
      favorites: arrayRemove(productId),
    });
  },
  async updateProfile(uid: string, data: Record<string, unknown>) {
    await setDoc(doc(db, COLLECTIONS.users, uid), data, { merge: true });
  },
};

// --------------------------------------------------------- Notifications -----
export const notificationsApi = {
  async listForUser(userId: string): Promise<AppNotification[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.notifications),
        where("userId", "in", [userId, null]),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => withId<AppNotification>(d.id, d.data()));
  },
  async markRead(id: string) {
    await updateDoc(doc(db, COLLECTIONS.notifications, id), { read: true });
  },
};
