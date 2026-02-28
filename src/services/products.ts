import { api } from "./api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const getProducts = async (): Promise<Product[]> =>
  (await api.get("/products")).data;

export const getAllProducts = async (): Promise<Product[]> =>
  (await api.get("/products/all")).data;

export const createProduct = async (data: {
  name: string; description?: string; price: number;
  stock_quantity?: number; low_stock_threshold?: number;
}): Promise<Product> => (await api.post("/products", data)).data;

export const updateProduct = async (
  id: string,
  data: Partial<{ name: string; description: string; price: number; stock_quantity: number; low_stock_threshold: number; is_active: boolean }>
): Promise<Product> => (await api.put(`/products/${id}`, data)).data;

export const uploadProductPhoto = async (
  id: string, imageData: string, filename: string
): Promise<Product> => (await api.post(`/products/${id}/photos`, { imageData, filename })).data;

export const deleteProductPhoto = async (
  id: string, index: number
): Promise<Product> => (await api.delete(`/products/${id}/photos/${index}`)).data;

export const deleteProduct = async (id: string): Promise<void> =>
  api.delete(`/products/${id}`);
