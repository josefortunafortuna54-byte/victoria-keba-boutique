// ============================================================================
// Firestore data model — Victoria Keba
// Mirrors the collection structure in firestore.rules.
// ============================================================================
import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "customer";

export type PaymentMethod = "whatsapp" | "transferencia" | "dinheiro" | "cartao";
export type PaymentStatus = "pendente" | "pago" | "reembolsado" | "falhou";
export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "em_preparacao"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: string;
  role: Role;
  favorites: string[]; // productIds
  cart: CartLine[];
  createdAt?: Timestamp;
}

export interface CartLine {
  productId: string;
  title: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  qty: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  promotion: boolean;
  rating: number;
  totalReviews: number;
  createdAt?: Timestamp;
}

export interface OrderProduct {
  productId: string;
  title: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: OrderProduct[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  couponCode?: string;
  createdAt?: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  createdAt?: Timestamp;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  bannerImage?: string;
  discount: number; // percentage
  active: boolean;
  createdAt?: Timestamp;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // percentage
  minTotal?: number;
  active: boolean;
  expiresAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  instagramLink?: string;
  facebookLink?: string;
  deliveryPrice: number;
  currency: string;
  supportEmail?: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // null/undefined = broadcast
  title: string;
  message: string;
  type: "info" | "order" | "promo" | "system";
  read: boolean;
  createdAt?: Timestamp;
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

// Collection name constants — single source of truth.
export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
  categories: "categories",
  reviews: "reviews",
  promotions: "promotions",
  banners: "banners",
  coupons: "coupons",
  notifications: "notifications",
  settings: "settings",
} as const;
