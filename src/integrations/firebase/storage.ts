// ============================================================================
// Firebase Storage helpers — Victoria Keba
// Buckets: products/  banners/  users/  categories/
// ============================================================================
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

export type StorageFolder = "products" | "banners" | "users" | "categories";

/** Upload a file to a folder and return its public download URL. */
export async function uploadImage(
  folder: StorageFolder,
  file: File,
  id?: string,
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${id ?? crypto.randomUUID()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** Upload several files in parallel, preserving order. */
export async function uploadImages(
  folder: StorageFolder,
  files: File[],
): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImage(folder, f)));
}

/** Delete an image by its full storage path (e.g. "products/abc.jpg"). */
export async function deleteImage(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}
